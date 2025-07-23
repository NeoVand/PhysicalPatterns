import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Play, 
  Pause, 
  Settings2,
  Shuffle,
  Star,
  Square,
  Circle,
  Hexagon,
  ChevronLeft,
  Sparkles,
  Hash,
  AlertCircle
} from 'lucide-react'

// WebGPU shaders
const computeShader = `
@binding(0) @group(0) var<storage, read> size: vec2u;
@binding(1) @group(0) var<storage, read> current: array<u32>;
@binding(2) @group(0) var<storage, read_write> next: array<u32>;

override blockSize = 8;

fn getIndex(x: u32, y: u32) -> u32 {
  let h = size.y;
  let w = size.x;
  return (y % h) * w + (x % w);
}

fn getCell(x: u32, y: u32) -> u32 {
  return current[getIndex(x, y)] & 1u;
}

fn getCellWithNeighborhood(x: u32, y: u32) -> u32 {
  return current[getIndex(x, y)];
}

@compute @workgroup_size(blockSize, blockSize)
fn main(@builtin(global_invocation_id) grid: vec3u) {
  let x = grid.x;
  let y = grid.y;
  
  // Get individual neighbor states for the neighborhood pattern
  let n0 = getCell(x - 1, y - 1);
  let n1 = getCell(x, y - 1);
  let n2 = getCell(x + 1, y - 1);
  let n3 = getCell(x - 1, y);
  let n4 = getCell(x + 1, y);
  let n5 = getCell(x - 1, y + 1);
  let n6 = getCell(x, y + 1);
  let n7 = getCell(x + 1, y + 1);
  
  // Count living neighbors
  let count = n0 + n1 + n2 + n3 + n4 + n5 + n6 + n7;
  
  // Current cell state
  let currentState = getCell(x, y);
  
  // Apply Game of Life rules
  let nextState = select(u32(count == 3u), u32(count == 2u || count == 3u), currentState == 1u);
  
  // If cell is alive, encode the neighborhood pattern in the upper bits
  // Bit 0: cell state (0 or 1)
  // Bits 1-8: 8 neighbors (n0-n7)
  if (nextState == 1u) {
    let neighborhood = (n7 << 8u) | (n6 << 7u) | (n5 << 6u) | (n4 << 5u) | 
                       (n3 << 4u) | (n2 << 3u) | (n1 << 2u) | (n0 << 1u);
    next[getIndex(x, y)] = nextState | neighborhood;
  } else {
    next[getIndex(x, y)] = 0u;
  }
}
`;

const vertexShader = `
struct Out {
  @builtin(position) pos: vec4f,
  @location(0) @interpolate(flat) cellData: u32,
}

struct Uniforms {
  gridSize: vec2u,
  screenSize: vec2f,
  camera: vec4f, // x, y, zoom, cellSize
}

@binding(0) @group(0) var<uniform> uniforms: Uniforms;

@vertex
fn main(@builtin(instance_index) i: u32, @location(0) cellData: u32, @location(1) pos: vec2u) -> Out {
  // Calculate grid position from instance index
  let gridX = i % uniforms.gridSize.x;
  let gridY = i / uniforms.gridSize.x;
  
  // Add vertex position offset (0,0), (0,1), (1,0), or (1,1)
  let cellX = f32(gridX) + f32(pos.x);
  let cellY = f32(gridY) + f32(pos.y);
  
  // Apply camera transform
  let zoom = uniforms.camera.z;
  let cellSize = uniforms.camera.w;
  let camX = uniforms.camera.x;
  let camY = uniforms.camera.y;
  
  // Calculate position in pixels
  let pixelX = (cellX - camX) * cellSize * zoom;
  let pixelY = (cellY - camY) * cellSize * zoom;
  
  // Convert to normalized device coordinates
  let x = (pixelX / uniforms.screenSize.x) * 2.0;
  let y = -(pixelY / uniforms.screenSize.y) * 2.0;
  
  return Out(vec4f(x, y, 0., 1.), cellData);
}
`;

const fragmentShader = `
@fragment
fn main(@location(0) @interpolate(flat) cellData: u32) -> @location(0) vec4f {
  // Extract cell state (bit 0) and neighborhood (bits 1-8)
  let isAlive = (cellData & 1u) == 1u;
  let neighborhood = (cellData >> 1u) & 0xFFu;
  
  if (isAlive) {
    // Map the 256 possible neighborhood states to hues (0-360 degrees)
    let hue = f32(neighborhood) * 360.0 / 256.0;
    
    // Convert HSL to RGB
    let h = hue / 360.0;
    let s = 0.8; // High saturation for vibrant colors
    let l = 0.5; // Medium lightness
    
    let c = (1.0 - abs(2.0 * l - 1.0)) * s;
    let x = c * (1.0 - abs((h * 6.0) % 2.0 - 1.0));
    let m = l - c / 2.0;
    
    var r: f32;
    var g: f32;
    var b: f32;
    
    if (h < 1.0/6.0) {
      r = c; g = x; b = 0.0;
    } else if (h < 2.0/6.0) {
      r = x; g = c; b = 0.0;
    } else if (h < 3.0/6.0) {
      r = 0.0; g = c; b = x;
    } else if (h < 4.0/6.0) {
      r = 0.0; g = x; b = c;
    } else if (h < 5.0/6.0) {
      r = x; g = 0.0; b = c;
    } else {
      r = c; g = 0.0; b = x;
    }
    
    return vec4f(r + m, g + m, b + m, 1.0);
  } else {
    // Dead cells are dark blue-gray
    return vec4f(0.05, 0.05, 0.1, 1.0);
  }
}
`;

const simpleFragmentShader = `
@fragment
fn main(@location(0) @interpolate(flat) cellData: u32) -> @location(0) vec4f {
  let isAlive = (cellData & 1u) == 1u;
  
  if (isAlive) {
    return vec4f(0.2, 0.6, 1.0, 1.0); // Bright blue for alive cells
  } else {
    return vec4f(0.05, 0.05, 0.1, 1.0); // Dark blue-gray background
  }
}
`;

// Slider component
const Slider = ({ label, value, min, max, step, onChange, unit = '' }: any) => (
  <div style={{ marginBottom: '20px' }}>
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      marginBottom: '8px',
      fontSize: '13px',
      color: 'rgba(255,255,255,0.9)'
    }}>
      <span>{label}</span>
      <span style={{ 
        fontFamily: 'monospace',
        color: '#60a5fa',
        fontWeight: 600
      }}>
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{
        width: '100%',
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '2px',
        outline: 'none',
        WebkitAppearance: 'none',
        cursor: 'pointer'
      }}
    />
  </div>
)

export default function GameOfLife() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [fps, setFps] = useState(30)
  const [density, setDensity] = useState(30)
  const [isControlsCollapsed, setIsControlsCollapsed] = useState(false)
  const [webGPUSupported, setWebGPUSupported] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const [useNeighborhoodColors, setUseNeighborhoodColors] = useState(true)
  
  // Calculate grid size based on screen dimensions
  const baseCellSize = 1 // base cell size in CSS pixels - 1 pixel = much finer grid
  const devicePixelRatio = window.devicePixelRatio || 1
  const cellSize = baseCellSize * devicePixelRatio // actual cell size in device pixels
  
  const [gridSize, setGridSize] = useState(() => {
    const width = Math.floor(window.innerWidth / baseCellSize)
    const height = Math.floor(window.innerHeight / baseCellSize)
    return { width, height }
  })
  
  // Camera state - start with zoom that fits the screen
  const [camera, setCamera] = useState(() => ({
    x: gridSize.width / 2,
    y: gridSize.height / 2,
    zoom: 1 / devicePixelRatio // This makes cells appear at baseCellSize on screen
  }))
  const [isPanning, setIsPanning] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  
  // WebGPU references
  const deviceRef = useRef<GPUDevice | null>(null)
  const contextRef = useRef<GPUCanvasContext | null>(null)
  const computePipelineRef = useRef<GPUComputePipeline | null>(null)
  const renderPipelineRef = useRef<GPURenderPipeline | null>(null)
  const bindGroup0Ref = useRef<GPUBindGroup | null>(null)
  const bindGroup1Ref = useRef<GPUBindGroup | null>(null)
  const uniformBindGroupRef = useRef<GPUBindGroup | null>(null)
  const cellBuffersRef = useRef<GPUBuffer[]>([])
  const squareBufferRef = useRef<GPUBuffer | null>(null)
  const uniformsBufferRef = useRef<GPUBuffer | null>(null)
  const sizeBufferRef = useRef<GPUBuffer | null>(null)
  const currentBufferRef = useRef(0)
  const animationFrameRef = useRef<number>(0)
  const lastFrameTimeRef = useRef(0)
  const workgroupSize = 8
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const width = Math.floor(window.innerWidth / baseCellSize)
      const height = Math.floor(window.innerHeight / baseCellSize)
      setGridSize({ width, height })
      
      // Update camera to center of new grid
      setCamera({
        x: width / 2,
        y: height / 2,
        zoom: 1 / devicePixelRatio // Adjust zoom for new screen size
      })
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [baseCellSize, devicePixelRatio])
  
  // Mouse handlers for pan and zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault()
    
    // Normalize the delta value for consistent zoom speed across different devices
    // Most trackpads give values between -3 and 3, while mice give larger values
    const normalizedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 50) / 50
    
    // Much gentler zoom factor - 1.05 instead of 1.1
    const zoomFactor = 1 + normalizedDelta * 0.05
    
    setCamera(prev => ({
      ...prev,
      zoom: Math.max(0.1 / devicePixelRatio, Math.min(20 / devicePixelRatio, prev.zoom * zoomFactor))
    }))
  }, [devicePixelRatio])
  
  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true)
      setLastMouse({ x: e.clientX, y: e.clientY })
    }
  }, [])
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const dx = (e.clientX - lastMouse.x) / camera.zoom / baseCellSize
      const dy = (e.clientY - lastMouse.y) / camera.zoom / baseCellSize
      
      setCamera(prev => ({
        ...prev,
        x: prev.x - dx,
        y: prev.y - dy
      }))
      
      setLastMouse({ x: e.clientX, y: e.clientY })
    }
  }, [isPanning, lastMouse, camera.zoom, baseCellSize])
  
  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])
  
  // Set up mouse event listeners
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.addEventListener('wheel', handleWheel, { passive: false })
    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      canvas.removeEventListener('wheel', handleWheel)
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp])
  
  // Initialize WebGPU once
  useEffect(() => {
    let mounted = true
    
    async function init() {
      if (!navigator.gpu) {
        console.error('WebGPU not supported')
        setWebGPUSupported(false)
        return
      }
      
      const canvas = canvasRef.current
      if (!canvas || !mounted) return
      
      try {
        const adapter = await navigator.gpu.requestAdapter()
        if (!adapter || !mounted) {
          console.error('No WebGPU adapter found')
          setWebGPUSupported(false)
          return
        }
        
        const device = await adapter.requestDevice()
        if (!mounted) return
        
        deviceRef.current = device
        
        const context = canvas.getContext('webgpu')
        if (!context) {
          console.error('Failed to get WebGPU context')
          setWebGPUSupported(false)
          return
        }
        
        contextRef.current = context
        
        // Configure canvas
        const devicePixelRatio = window.devicePixelRatio || 1
        canvas.width = canvas.clientWidth * devicePixelRatio
        canvas.height = canvas.clientHeight * devicePixelRatio
        
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
        context.configure({
          device,
          format: presentationFormat,
        })
        
        // Create compute pipeline
        const computeModule = device.createShaderModule({ code: computeShader })
        const bindGroupLayoutCompute = device.createBindGroupLayout({
          entries: [
            {
              binding: 0,
              visibility: GPUShaderStage.COMPUTE,
              buffer: { type: 'read-only-storage' },
            },
            {
              binding: 1,
              visibility: GPUShaderStage.COMPUTE,
              buffer: { type: 'read-only-storage' },
            },
            {
              binding: 2,
              visibility: GPUShaderStage.COMPUTE,
              buffer: { type: 'storage' },
            },
          ],
        })
        
        const computePipeline = device.createComputePipeline({
          layout: device.createPipelineLayout({
            bindGroupLayouts: [bindGroupLayoutCompute],
          }),
          compute: {
            module: computeModule,
            entryPoint: 'main',
            constants: {
              blockSize: workgroupSize,
            },
          },
        })
        computePipelineRef.current = computePipeline
        
        // Create render pipeline
        const renderPipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: {
            module: device.createShaderModule({ code: vertexShader }),
            entryPoint: 'main',
            buffers: [
              // Cell buffer
              {
                arrayStride: 4,
                stepMode: 'instance',
                attributes: [{ shaderLocation: 0, offset: 0, format: 'uint32' }]
              },
              // Square vertices buffer
              {
                arrayStride: 8,
                stepMode: 'vertex',
                attributes: [{ shaderLocation: 1, offset: 0, format: 'uint32x2' }]
              }
            ]
          },
          fragment: {
            module: device.createShaderModule({ 
              code: useNeighborhoodColors ? fragmentShader : simpleFragmentShader 
            }),
            entryPoint: 'main',
            targets: [{ format: presentationFormat }]
          },
          primitive: {
            topology: 'triangle-strip'
          }
        })
        renderPipelineRef.current = renderPipeline
        
        // Create buffers
        const { width, height } = gridSize
        
        // Size buffer for compute shader
        const sizeBuffer = device.createBuffer({
          size: 2 * Uint32Array.BYTES_PER_ELEMENT,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
          mappedAtCreation: true,
        })
        new Uint32Array(sizeBuffer.getMappedRange()).set([width, height])
        sizeBuffer.unmap()
        sizeBufferRef.current = sizeBuffer
        
        // Uniforms buffer for render shader (gridSize + screenSize + camera)
        const uniformsBuffer = device.createBuffer({
          size: 32, // 2 u32 + 2 f32 + 4 f32
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        uniformsBufferRef.current = uniformsBuffer
        
        // Initialize uniforms
        const uniformData = new ArrayBuffer(32)
        const uintView = new Uint32Array(uniformData)
        const floatView = new Float32Array(uniformData)
        
        // Grid size (offset 0)
        uintView[0] = width
        uintView[1] = height
        
        // Screen size (offset 8 bytes)
        floatView[2] = canvas.width
        floatView[3] = canvas.height
        
        // Camera (offset 16 bytes)
        floatView[4] = width / 2  // x
        floatView[5] = height / 2 // y
        floatView[6] = 1.0        // zoom
        floatView[7] = cellSize   // cellSize
        
        device.queue.writeBuffer(uniformsBuffer, 0, uniformData)
        
        // Square vertices
        const squareVertices = new Uint32Array([0, 0, 0, 1, 1, 0, 1, 1])
        const squareBuffer = device.createBuffer({
          size: squareVertices.byteLength,
          usage: GPUBufferUsage.VERTEX,
          mappedAtCreation: true,
        })
        new Uint32Array(squareBuffer.getMappedRange()).set(squareVertices)
        squareBuffer.unmap()
        
        // Create initial cell state
        const cellStateArray = new Uint32Array(width * height)
        
        // First create random cells
        for (let i = 0; i < cellStateArray.length; i++) {
          cellStateArray[i] = Math.random() < (density / 100) ? 1 : 0
        }
        
        // Now compute neighborhood patterns
        const cellsWithNeighborhoods = new Uint32Array(width * height)
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const idx = y * width + x
            const cellState = cellStateArray[idx]
            
            if (cellState === 1) {
              // Get all 8 neighbors with wrapping
              const n0 = cellStateArray[((y - 1 + height) % height) * width + ((x - 1 + width) % width)]
              const n1 = cellStateArray[((y - 1 + height) % height) * width + x]
              const n2 = cellStateArray[((y - 1 + height) % height) * width + ((x + 1) % width)]
              const n3 = cellStateArray[y * width + ((x - 1 + width) % width)]
              const n4 = cellStateArray[y * width + ((x + 1) % width)]
              const n5 = cellStateArray[((y + 1) % height) * width + ((x - 1 + width) % width)]
              const n6 = cellStateArray[((y + 1) % height) * width + x]
              const n7 = cellStateArray[((y + 1) % height) * width + ((x + 1) % width)]
              
              // Encode neighborhood in upper bits
              const neighborhood = (n7 << 8) | (n6 << 7) | (n5 << 6) | (n4 << 5) | 
                                 (n3 << 4) | (n2 << 3) | (n1 << 2) | (n0 << 1)
              
              cellsWithNeighborhoods[idx] = cellState | neighborhood
            } else {
              cellsWithNeighborhoods[idx] = 0
            }
          }
        }
        
        const cellBuffer0 = device.createBuffer({
          size: cellsWithNeighborhoods.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          mappedAtCreation: true,
        })
        new Uint32Array(cellBuffer0.getMappedRange()).set(cellsWithNeighborhoods)
        cellBuffer0.unmap()
        
        const cellBuffer1 = device.createBuffer({
          size: cellsWithNeighborhoods.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
          mappedAtCreation: true,
        })
        new Uint32Array(cellBuffer1.getMappedRange()).set(cellsWithNeighborhoods)
        cellBuffer1.unmap()
        
        cellBuffersRef.current = [cellBuffer0, cellBuffer1]
        
        // Create bind groups
        const bindGroup0 = device.createBindGroup({
          layout: bindGroupLayoutCompute,
          entries: [
            { binding: 0, resource: { buffer: sizeBuffer } },
            { binding: 1, resource: { buffer: cellBuffer0 } },
            { binding: 2, resource: { buffer: cellBuffer1 } },
          ],
        })
        
        const bindGroup1 = device.createBindGroup({
          layout: bindGroupLayoutCompute,
          entries: [
            { binding: 0, resource: { buffer: sizeBuffer } },
            { binding: 1, resource: { buffer: cellBuffer1 } },
            { binding: 2, resource: { buffer: cellBuffer0 } },
          ],
        })
        
        bindGroup0Ref.current = bindGroup0
        bindGroup1Ref.current = bindGroup1
        
        const uniformBindGroup = device.createBindGroup({
          layout: renderPipeline.getBindGroupLayout(0),
          entries: [
            {
              binding: 0,
              resource: {
                buffer: uniformsBuffer,
                offset: 0,
                size: 32,
              },
            },
          ],
        })
        uniformBindGroupRef.current = uniformBindGroup
        
        // Store square buffer reference for rendering
        squareBufferRef.current = squareBuffer
        
        setIsInitialized(true)
        console.log('WebGPU initialized successfully')
      } catch (error) {
        console.error('WebGPU initialization error:', error)
        setWebGPUSupported(false)
      }
    }
    
    // Start initialization
    requestAnimationFrame(() => {
      if (mounted) {
        init()
      }
    })
    
    return () => {
      mounted = false
    }
  }, [density]) // Re-run when density changes
  
  // Recreate render pipeline when colorization mode changes
  useEffect(() => {
    if (!isInitialized || !deviceRef.current || !contextRef.current) return
    
    const device = deviceRef.current
    const presentationFormat = navigator.gpu?.getPreferredCanvasFormat() || 'bgra8unorm'
    
    // Create new render pipeline with the appropriate fragment shader
    const renderPipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({ code: vertexShader }),
        entryPoint: 'main',
        buffers: [
          // Cell buffer
          {
            arrayStride: 4,
            stepMode: 'instance',
            attributes: [{ shaderLocation: 0, offset: 0, format: 'uint32' }]
          },
          // Square vertices buffer
          {
            arrayStride: 8,
            stepMode: 'vertex',
            attributes: [{ shaderLocation: 1, offset: 0, format: 'uint32x2' }]
          }
        ]
      },
      fragment: {
        module: device.createShaderModule({ 
          code: useNeighborhoodColors ? fragmentShader : simpleFragmentShader 
        }),
        entryPoint: 'main',
        targets: [{ format: presentationFormat }]
      },
      primitive: {
        topology: 'triangle-strip'
      }
    })
    
    renderPipelineRef.current = renderPipeline
    
    // Recreate uniform bind group with new pipeline layout
    if (uniformsBufferRef.current) {
      const uniformBindGroup = device.createBindGroup({
        layout: renderPipeline.getBindGroupLayout(0),
        entries: [
          {
            binding: 0,
            resource: {
              buffer: uniformsBufferRef.current,
              offset: 0,
              size: 32,
            },
          },
        ],
      })
      uniformBindGroupRef.current = uniformBindGroup
    }
  }, [useNeighborhoodColors, isInitialized])
  
  // Render loop
  useEffect(() => {
    if (!isInitialized) return
    
    const device = deviceRef.current
    const context = contextRef.current
    const canvas = canvasRef.current
    const computePipeline = computePipelineRef.current
    const renderPipeline = renderPipelineRef.current
    const bindGroup0 = bindGroup0Ref.current
    const bindGroup1 = bindGroup1Ref.current
    const uniformBindGroup = uniformBindGroupRef.current
    const uniformsBuffer = uniformsBufferRef.current
    const squareBuffer = squareBufferRef.current
    const cellBuffers = cellBuffersRef.current
    
    if (!device || !context || !canvas || !computePipeline || !renderPipeline || 
        !bindGroup0 || !bindGroup1 || !uniformBindGroup || !uniformsBuffer || 
        !squareBuffer || cellBuffers.length === 0) {
      return
    }
    
    const frameInterval = 1000 / fps
    
    const render = () => {
      const now = performance.now()
      const delta = now - lastFrameTimeRef.current
      
      try {
        // Update uniforms with current camera state
        const uniformData = new ArrayBuffer(32)
        const uintView = new Uint32Array(uniformData)
        const floatView = new Float32Array(uniformData)
        
        // Grid size
        uintView[0] = gridSize.width
        uintView[1] = gridSize.height
        
        // Screen size
        floatView[2] = canvas.width
        floatView[3] = canvas.height
        
        // Camera
        floatView[4] = camera.x
        floatView[5] = camera.y
        floatView[6] = camera.zoom
        floatView[7] = cellSize
        
        device.queue.writeBuffer(uniformsBuffer, 0, uniformData)
        
        const commandEncoder = device.createCommandEncoder()
        
        if (isPlaying && delta >= frameInterval) {
          // Compute pass
          const computePass = commandEncoder.beginComputePass()
          computePass.setPipeline(computePipeline)
          computePass.setBindGroup(0, currentBufferRef.current === 0 ? bindGroup0 : bindGroup1)
          computePass.dispatchWorkgroups(
            Math.ceil(gridSize.width / workgroupSize),
            Math.ceil(gridSize.height / workgroupSize)
          )
          computePass.end()
          
          // Toggle buffer for next frame
          currentBufferRef.current = 1 - currentBufferRef.current
          setGeneration(prev => prev + 1)
          lastFrameTimeRef.current = now - (delta % frameInterval)
        }
        
        // Render pass (always render)
        const textureView = context.getCurrentTexture().createView()
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [
            {
              view: textureView,
              clearValue: { r: 0, g: 0, b: 0, a: 1 },
              loadOp: 'clear',
              storeOp: 'store',
            },
          ],
        }
        
        const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor)
        renderPass.setPipeline(renderPipeline)
        renderPass.setVertexBuffer(0, cellBuffers[currentBufferRef.current])
        renderPass.setVertexBuffer(1, squareBufferRef.current)
        renderPass.setBindGroup(0, uniformBindGroup)
        renderPass.draw(4, gridSize.width * gridSize.height)
        renderPass.end()
        
        device.queue.submit([commandEncoder.finish()])
      } catch (error) {
        console.error('Render error:', error)
      }
      
      animationFrameRef.current = requestAnimationFrame(render)
    }
    
    animationFrameRef.current = requestAnimationFrame(render)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isPlaying, fps, gridSize, isInitialized, camera, useNeighborhoodColors])
  
  const resetGrid = useCallback((pattern?: string) => {
    if (!deviceRef.current || !cellBuffersRef.current.length) return
    
    const device = deviceRef.current
    const buffers = cellBuffersRef.current
    const { width, height } = gridSize
    const cellCount = width * height
    
    const newGrid = new Uint32Array(cellCount)
    
    if (pattern === 'glider') {
      // Create a glider pattern in the center
      const centerX = Math.floor(width / 2)
      const centerY = Math.floor(height / 2)
      
      // Glider pattern:
      //   X
      // X X
      //  XX
      const gliderCells = [
        [centerX + 1, centerY - 1],
        [centerX - 1, centerY],
        [centerX, centerY],
        [centerX + 1, centerY],
        [centerX, centerY + 1],
        [centerX + 1, centerY + 1]
      ]
      
      gliderCells.forEach(([x, y]) => {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          newGrid[y * width + x] = 1
        }
      })
    } else if (pattern === 'pulsar') {
      // Create a pulsar pattern in the center
      const centerX = Math.floor(width / 2)
      const centerY = Math.floor(height / 2)
      
      const pulsarPattern = [
        // Top section
        [-6,-4], [-6,-3], [-6,-2], [-1,-4], [-1,-3], [-1,-2], [1,-4], [1,-3], [1,-2], [6,-4], [6,-3], [6,-2],
        // Upper middle
        [-4,-6], [-3,-6], [-2,-6], [-4,-1], [-3,-1], [-2,-1], [2,-6], [3,-6], [4,-6], [2,-1], [3,-1], [4,-1],
        // Lower middle
        [-4,1], [-3,1], [-2,1], [-4,6], [-3,6], [-2,6], [2,1], [3,1], [4,1], [2,6], [3,6], [4,6],
        // Bottom section
        [-6,2], [-6,3], [-6,4], [-1,2], [-1,3], [-1,4], [1,2], [1,3], [1,4], [6,2], [6,3], [6,4]
      ]
      
      pulsarPattern.forEach(([dx, dy]) => {
        const x = centerX + dx
        const y = centerY + dy
        if (x >= 0 && x < width && y >= 0 && y < height) {
          newGrid[y * width + x] = 1
        }
      })
    } else if (pattern === 'gosper') {
      // Gosper glider gun
      const startX = Math.floor(width / 4)
      const startY = Math.floor(height / 2) - 5
      
      const gosperPattern = [
        // Left square
        [0,4], [0,5], [1,4], [1,5],
        // Left part
        [10,4], [10,5], [10,6], [11,3], [11,7], [12,2], [12,8], [13,2], [13,8],
        [14,5], [15,3], [15,7], [16,4], [16,5], [16,6], [17,5],
        // Right part
        [20,2], [20,3], [20,4], [21,2], [21,3], [21,4], [22,1], [22,5],
        [24,0], [24,1], [24,5], [24,6],
        // Right square
        [34,2], [34,3], [35,2], [35,3]
      ]
      
      gosperPattern.forEach(([dx, dy]) => {
        const x = startX + dx
        const y = startY + dy
        if (x >= 0 && x < width && y >= 0 && y < height) {
          newGrid[y * width + x] = 1
        }
      })
    } else if (pattern === 'pentadecathlon') {
      // Pentadecathlon oscillator
      const centerX = Math.floor(width / 2)
      const centerY = Math.floor(height / 2)
      
      const pentaPattern = [
        [-1,-4], [0,-4], [1,-4],
        [-1,-3], [1,-3],
        [-1,-2], [0,-2], [1,-2],
        [-1,-1], [0,-1], [1,-1],
        [-1,0], [0,0], [1,0],
        [-1,1], [0,1], [1,1],
        [-1,2], [1,2],
        [-1,3], [0,3], [1,3]
      ]
      
      pentaPattern.forEach(([dx, dy]) => {
        const x = centerX + dx
        const y = centerY + dy
        if (x >= 0 && x < width && y >= 0 && y < height) {
          newGrid[y * width + x] = 1
        }
      })
    } else if (pattern === 'spaceship') {
      // Lightweight spaceship
      const centerX = Math.floor(width / 2)
      const centerY = Math.floor(height / 2)
      
      const spaceshipPattern = [
        [0,-1], [1,-1], [2,-1], [3,-1],
        [-1,0], [3,0],
        [3,1],
        [-1,2], [2,2]
      ]
      
      spaceshipPattern.forEach(([dx, dy]) => {
        const x = centerX + dx
        const y = centerY + dy
        if (x >= 0 && x < width && y >= 0 && y < height) {
          newGrid[y * width + x] = 1
        }
      })
    } else if (pattern === 'rpentomino') {
      // R-pentomino
      const centerX = Math.floor(width / 2)
      const centerY = Math.floor(height / 2)
      
      const rPentominoPattern = [
        [0,-1], [1,-1],
        [-1,0], [0,0],
        [0,1]
      ]
      
      rPentominoPattern.forEach(([dx, dy]) => {
        const x = centerX + dx
        const y = centerY + dy
        if (x >= 0 && x < width && y >= 0 && y < height) {
          newGrid[y * width + x] = 1
        }
      })
    } else {
      // Random pattern with density
      for (let i = 0; i < cellCount; i++) {
        newGrid[i] = Math.random() < (density / 100) ? 1 : 0
      }
    }
    
    // Now compute neighborhood patterns for all cells
    const gridWithNeighborhoods = new Uint32Array(cellCount)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x
        const cellState = newGrid[idx]
        
        if (cellState === 1) {
          // Get all 8 neighbors
          const n0 = newGrid[((y - 1 + height) % height) * width + ((x - 1 + width) % width)] // top-left
          const n1 = newGrid[((y - 1 + height) % height) * width + x] // top
          const n2 = newGrid[((y - 1 + height) % height) * width + ((x + 1) % width)] // top-right
          const n3 = newGrid[y * width + ((x - 1 + width) % width)] // left
          const n4 = newGrid[y * width + ((x + 1) % width)] // right
          const n5 = newGrid[((y + 1) % height) * width + ((x - 1 + width) % width)] // bottom-left
          const n6 = newGrid[((y + 1) % height) * width + x] // bottom
          const n7 = newGrid[((y + 1) % height) * width + ((x + 1) % width)] // bottom-right
          
          // Encode neighborhood in upper bits
          const neighborhood = (n7 << 8) | (n6 << 7) | (n5 << 6) | (n4 << 5) | 
                             (n3 << 4) | (n2 << 3) | (n1 << 2) | (n0 << 1)
          
          gridWithNeighborhoods[idx] = cellState | neighborhood
        } else {
          gridWithNeighborhoods[idx] = 0
        }
      }
    }
    
    // Write to both buffers
    device.queue.writeBuffer(buffers[0], 0, gridWithNeighborhoods)
    device.queue.writeBuffer(buffers[1], 0, gridWithNeighborhoods)
    
    setGeneration(0)
  }, [deviceRef, cellBuffersRef, gridSize, density])
  
  const handleClear = useCallback(() => {
    const device = deviceRef.current
    const cellBuffers = cellBuffersRef.current
    if (!device || cellBuffers.length !== 2) return
    
    const cells = new Uint32Array(gridSize.width * gridSize.height)
    
    // Write to both buffers
    device.queue.writeBuffer(cellBuffers[0], 0, cells)
    device.queue.writeBuffer(cellBuffers[1], 0, cells)
    currentBufferRef.current = 0
    setGeneration(0)
    setIsPlaying(false)
  }, [gridSize])

  const handleStep = useCallback(() => {
    const device = deviceRef.current
    const computePipeline = computePipelineRef.current
    const bindGroup0 = bindGroup0Ref.current
    const bindGroup1 = bindGroup1Ref.current
    
    if (!device || !computePipeline || !bindGroup0 || !bindGroup1) return
    
    const commandEncoder = device.createCommandEncoder()
    const computePass = commandEncoder.beginComputePass()
    computePass.setPipeline(computePipeline)
    computePass.setBindGroup(0, currentBufferRef.current === 0 ? bindGroup0 : bindGroup1)
    computePass.dispatchWorkgroups(
      gridSize.width / workgroupSize,
      gridSize.height / workgroupSize
    )
    computePass.end()
    
    device.queue.submit([commandEncoder.finish()])
    currentBufferRef.current = 1 - currentBufferRef.current
    setGeneration(prev => prev + 1)
  }, [gridSize])

  const controlsStyle = {
    container: {
      position: 'fixed' as const,
      top: '20px',
      right: '20px',
      zIndex: 1000,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    collapsed: {
      width: '48px',
      height: '48px',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    expanded: {
      width: '320px',
      background: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '16px',
      padding: '20px',
      color: '#fff',
      maxHeight: '80vh',
      overflowY: 'auto' as const
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px'
    },
    button: {
      padding: '10px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '13px',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s',
      fontWeight: 500
    },
    primaryButton: {
      background: 'rgba(59, 130, 246, 0.5)',
      border: '1px solid rgba(59, 130, 246, 0.5)'
    },
    activeButton: {
      background: 'rgba(34, 197, 94, 0.5)',
      border: '1px solid rgba(34, 197, 94, 0.5)'
    },
    patternButton: {
      width: '100%',
      padding: '12px',
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '13px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      transition: 'all 0.2s',
      marginBottom: '8px'
    }
  }

  if (!webGPUSupported) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <AlertCircle size={48} color="#ef4444" />
        <h2 style={{ fontSize: '24px', margin: 0 }}>WebGPU Not Supported</h2>
        <p style={{ color: '#999', textAlign: 'center', maxWidth: '400px' }}>
          This simulation requires WebGPU support. Please use a compatible browser
          such as Chrome, Edge, or Safari Technology Preview.
        </p>
        <button
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            cursor: 'pointer'
          }}
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: '#000',
      overflow: 'hidden'
    }}>
      {/* Back button - floating */}
      <button
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          padding: '10px 16px',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          color: '#fff',
          fontSize: '13px',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1000,
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
        }}
        onClick={() => window.history.back()}
      >
        <ChevronLeft size={16} />
        Back
      </button>

      {/* Title - floating */}
      <div style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        color: '#fff',
        zIndex: 1000
      }}>
        <h1 style={{ 
          margin: 0, 
          fontSize: '20px', 
          fontWeight: 600,
          letterSpacing: '-0.02em'
        }}>
          Conway's Game of Life (WebGPU)
        </h1>
        <p style={{ 
          margin: '4px 0 0 0', 
          fontSize: '13px', 
          color: 'rgba(255,255,255,0.6)'
        }}>
          Generation {generation} • {gridSize.width}×{gridSize.height} grid • Zoom {camera.zoom.toFixed(1)}x
        </p>
      </div>

      {/* Controls hint */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        padding: '8px 12px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 1000
      }}>
        <span>Drag to pan • Scroll to zoom</span>
      </div>

      {/* Collapsible Controls */}
      <div style={controlsStyle.container}>
        {isControlsCollapsed ? (
          <div 
            style={controlsStyle.collapsed}
            onClick={() => setIsControlsCollapsed(false)}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)'
            }}
          >
            <Settings2 size={20} color="#fff" />
          </div>
        ) : (
          <div style={controlsStyle.expanded}>
            {/* Header */}
            <div style={controlsStyle.header}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Controls</h3>
              <button
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '4px'
                }}
                onClick={() => setIsControlsCollapsed(true)}
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Playback Controls */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                style={{
                  ...controlsStyle.button,
                  ...(isPlaying ? {} : controlsStyle.primaryButton),
                  flex: 1
                }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              
              <button
                style={controlsStyle.button}
                onClick={handleStep}
                disabled={isPlaying}
              >
                Step
              </button>
            </div>

            {/* Speed Control */}
            <Slider
              label="Speed"
              value={fps}
              min={1}
              max={120}
              step={1}
              onChange={setFps}
              unit=" FPS"
            />

            {/* Density Control */}
            <Slider
              label="Initial Density"
              value={density}
              min={5}
              max={80}
              step={5}
              onChange={setDensity}
              unit="%"
            />

            {/* Colorization Toggle */}
            <div style={{ 
              marginTop: '16px',
              marginBottom: '20px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                fontSize: '13px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                <span>Neighborhood Colors</span>
                <input
                  type="checkbox"
                  checked={useNeighborhoodColors}
                  onChange={(e) => setUseNeighborhoodColors(e.target.checked)}
                  style={{
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                />
              </label>
              <p style={{
                margin: '8px 0 0 0',
                fontSize: '11px',
                color: 'rgba(255,255,255,0.6)',
                lineHeight: 1.4
              }}>
                Colors cells based on their 8-neighbor pattern (256 unique hues)
              </p>
            </div>

            {/* Pattern Buttons */}
            <div style={{ marginTop: '24px', marginBottom: '16px' }}>
              <h4 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '13px', 
                fontWeight: 600,
                color: 'rgba(255,255,255,0.7)'
              }}>
                Patterns
              </h4>
              
              <button
                style={controlsStyle.patternButton}
                onClick={() => resetGrid()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Shuffle size={16} />
                Random
              </button>
              
              <button
                style={controlsStyle.patternButton}
                onClick={handleClear}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Square size={16} />
                Clear
              </button>
              
              <button
                style={controlsStyle.patternButton}
                onClick={() => resetGrid('glider')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Shuffle size={16} />
                Glider
              </button>
              
              <button
                style={controlsStyle.patternButton}
                onClick={() => resetGrid('pulsar')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Sparkles size={16} />
                Pulsar
              </button>
              
              <button
                style={controlsStyle.patternButton}
                onClick={() => resetGrid('gosper')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Hash size={16} />
                Gosper Gun
              </button>
              
              <button
                style={controlsStyle.patternButton}
                onClick={() => resetGrid('pentadecathlon')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Star size={16} />
                Pentadecathlon
              </button>
              
              <button
                style={controlsStyle.patternButton}
                onClick={() => resetGrid('spaceship')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Circle size={16} />
                Spaceship
              </button>
              
              <button
                style={controlsStyle.patternButton}
                onClick={() => resetGrid('rpentomino')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <Hexagon size={16} />
                R-Pentomino
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WebGPU Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
      />
    </div>
  )
} 