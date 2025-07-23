# Physical Patterns

An interactive exploration of emergent patterns in physics and mathematics, featuring GPU-accelerated simulations built with React and WebGPU.

## 🌟 Features

### Conway's Game of Life (WebGPU)
A high-performance implementation of Conway's Game of Life using WebGPU compute shaders:

- **GPU-Accelerated**: Utilizes WebGPU compute shaders for blazing-fast cellular automaton simulation
- **Neighborhood Coloring**: Revolutionary visualization that assigns unique colors to cells based on their 8-neighbor patterns (256 possible hues)
- **Interactive Controls**: 
  - Play/pause simulation with adjustable speed (1-120 FPS)
  - Smooth zoom and pan with mouse/trackpad
  - Draw/erase cells with mouse interaction
  - Initial density control
- **Pattern Library**: Quick access to classic patterns:
  - Glider
  - Pulsar
  - Gosper Glider Gun
  - Pentadecathlon
  - Lightweight Spaceship
  - R-pentomino
- **Responsive Design**: Automatically adapts grid size to window dimensions and device pixel ratio
- **High DPI Support**: Crisp rendering on Retina and other high-density displays

### Technical Implementation

- **WebGPU Compute Pipeline**: Parallel computation of Game of Life rules
- **Double Buffering**: Smooth updates without visual artifacts
- **WGSL Shaders**: Custom vertex and fragment shaders for efficient rendering
- **React 18**: Modern React with TypeScript for type safety
- **Vite**: Lightning-fast development and build tooling

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A browser with WebGPU support (Chrome 113+, Edge 113+, or Chrome Canary)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/PhysicalPatterns.git
cd PhysicalPatterns

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## 🎮 Controls

### Game of Life
- **Click/Drag**: Draw cells (hold Shift to erase)
- **Mouse Wheel**: Zoom in/out
- **Click and Drag**: Pan around the grid
- **Space**: Play/pause
- **Escape**: Toggle controls panel

## 🧮 The Mathematics

### Conway's Game of Life Rules
1. Any live cell with 2 or 3 neighbors survives
2. Any dead cell with exactly 3 neighbors becomes alive
3. All other cells die or remain dead

### Neighborhood Coloring Algorithm
Each living cell's color is determined by the state of its 8 neighbors:
- 2^8 = 256 possible neighborhood configurations
- Each configuration maps to a unique hue (0-360°)
- Creates beautiful emergent color patterns that reveal the underlying mathematical structure

## 🔧 Technical Details

### WebGPU Implementation
- Compute shader handles parallel cell updates
- Vertex shader applies camera transformations
- Fragment shader implements HSL-to-RGB conversion for smooth color gradients
- Efficient buffer management with minimal CPU-GPU data transfer

### Performance Optimizations
- Workgroup size optimization for GPU architecture
- Responsive grid sizing based on viewport
- Efficient double-buffering to prevent race conditions
- Smart camera system with smooth transformations

## 🎨 Future Patterns

Coming soon:
- **Ising Model**: Statistical mechanics simulation of ferromagnetism
- **Reaction-Diffusion**: Chemical pattern formation
- **Wave Equation**: Physical wave propagation
- **Boids**: Flocking behavior simulation
- **Fluid Dynamics**: Real-time fluid simulation

## 📝 License

MIT License - feel free to use this code for your own projects!

## 🙏 Acknowledgments

- Inspired by the beauty of emergent complexity in simple rules
- Built with modern web technologies for accessible scientific visualization
- Special thanks to the WebGPU community for making browser-based GPU compute possible
