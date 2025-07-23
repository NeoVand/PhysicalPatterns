# Physical Patterns - Architecture Document

## Overview
A modern, performant web application for exploring physical patterns through interactive simulations and educational content.

## Design Principles

### 1. Performance First
- **Progressive Loading**: Core app < 300KB, patterns load on demand
- **WebGL Optimization**: Efficient memory management, proper cleanup
- **Mobile Performance**: 60fps target on mid-range devices

### 2. Accessibility & Education
- **WCAG AA Compliance**: Keyboard navigation, screen reader support
- **Progressive Enhancement**: Fallbacks for WebGL failures
- **Educational First**: Content is primary, visualization enhances understanding

### 3. Maintainability
- **Modular Architecture**: Each pattern is self-contained
- **Type Safety**: Full TypeScript coverage
- **Testing**: Unit tests for logic, E2E for critical paths

## Technical Stack

### Core Dependencies
```json
{
  "react": "^18.3.1",           // Stable, not 19 yet
  "three": "^0.169.0",          // WebGL rendering
  "@react-three/fiber": "^8.x", // React Three.js renderer
  "zustand": "^5.0.2",          // Lightweight state management
  "react-router-dom": "^6.x"    // Routing
}
```

### Build & Dev Tools
- **Vite 6**: Fast builds with code splitting
- **@tailwindcss/vite**: Modern CSS with tree shaking
- **TypeScript 5.7**: Type safety
- **Vitest**: Testing framework

## Architecture Layers

### 1. Core Layer (Always Loaded)
```
src/
├── core/
│   ├── components/          # Essential UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── LoadingStates.tsx
│   │   └── Navigation.tsx
│   ├── hooks/              # Core hooks
│   │   ├── useWebGL.ts
│   │   ├── useResponsive.ts
│   │   └── useAccessibility.ts
│   ├── stores/             # Global state
│   │   ├── uiStore.ts      # Theme, layout
│   │   └── routerStore.ts  # Navigation state
│   └── utils/              # Utilities
│       ├── performance.ts
│       └── errors.ts
```

### 2. Pattern Layer (Lazy Loaded)
```
src/
├── patterns/
│   ├── _shared/            # Shared pattern utilities
│   │   ├── BasePattern.tsx
│   │   ├── PatternControls.tsx
│   │   └── WebGLManager.ts
│   └── [pattern-name]/     # Individual patterns
│       ├── index.tsx       # Entry point
│       ├── simulation.ts   # Physics logic
│       ├── shaders/        # GLSL shaders
│       ├── controls.ts     # Pattern-specific controls
│       ├── education.mdx   # Educational content
│       └── store.ts        # Pattern state
```

### 3. Feature Layer (Optional)
```
src/
├── features/
│   ├── export/             # Export functionality
│   ├── analytics/          # Usage tracking
│   └── collaboration/      # Future: Multi-user
```

## Critical Design Decisions

### 1. WebGL Memory Management
```typescript
// Every pattern must implement cleanup
interface Pattern {
  id: string
  name: string
  component: React.LazyExoticComponent<PatternComponent>
}

interface PatternComponent {
  simulation: WebGLSimulation
  controls?: ControlSchema
  education?: EducationalContent
}

abstract class WebGLSimulation {
  abstract init(canvas: HTMLCanvasElement): void
  abstract update(deltaTime: number): void
  abstract dispose(): void  // REQUIRED: Clean up all resources
}
```

### 2. Responsive Design Strategy
```typescript
// Mobile-first responsive system
const breakpoints = {
  mobile: 0,      // 0-767px
  tablet: 768,    // 768-1023px
  desktop: 1024,  // 1024px+
}

// Layout adapts completely, not just scales
<ResponsiveLayout>
  <MobileLayout />   // Bottom tabs, swipe navigation
  <TabletLayout />   // Side panel, touch optimized
  <DesktopLayout />  // Full features, hover states
</ResponsiveLayout>
```

### 3. State Management Architecture
```typescript
// Separate stores by lifecycle
// Global (persisted)
const useSettingsStore = create(persist({
  theme: 'system',
  quality: 'auto',
  education: true,
}))

// Session (temporary)
const useSimulationStore = create({
  playing: true,
  speed: 1.0,
})

// Pattern (disposed with pattern)
const createPatternStore = (initial: PatternState) => create({
  ...initial,
  reset: () => set(initial),
})
```

### 4. Error Handling Strategy
```typescript
// Graceful degradation at every level
<ErrorBoundary fallback={<PatternError />}>
  <WebGLErrorBoundary fallback={<Canvas2DFallback />}>
    <Pattern />
  </WebGLErrorBoundary>
</ErrorBoundary>

// WebGL detection and fallback
if (!WebGL.isSupported()) {
  return <Canvas2DSimulation /> // Simplified 2D version
}
```

### 5. Performance Monitoring
```typescript
// Built-in performance tracking
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 60,
    memory: 0,
    drawCalls: 0,
  })
  
  // Auto-adjust quality based on performance
  useEffect(() => {
    if (metrics.fps < 30) {
      qualityStore.decrease()
    }
  }, [metrics.fps])
}
```

## Bundle Strategy

### Initial Load (< 300KB)
- React + Router
- Core UI components
- Navigation
- Error boundaries

### Pattern Bundles (50-200KB each)
- Pattern code
- Required Three.js components
- Shaders
- Educational content

### Optional Features (loaded on use)
- Export functionality
- Advanced controls (Leva)
- Math rendering (KaTeX)
- Animations (Framer Motion)

## Mobile Considerations

### Touch Controls
```typescript
// All patterns must support touch
interface TouchControls {
  pan: boolean      // Two finger pan
  zoom: boolean     // Pinch zoom
  rotate: boolean   // Two finger rotate
  tap: boolean      // Tap to interact
}
```

### Performance Targets
- 60fps on iPhone 12 / Pixel 5
- < 100MB memory usage
- 3s initial load on 4G

### Offline Support
- Service worker for offline access
- Cached patterns continue to work
- Educational content available offline

## Security & Privacy

### No External Dependencies in Production
- All assets self-hosted
- No CDN dependencies
- No tracking by default

### Export Privacy
- All processing client-side
- No server uploads
- Local storage only

## Testing Strategy

### Unit Tests (Vitest)
- Physics calculations
- State management
- Utility functions

### Integration Tests
- Pattern loading/unloading
- Navigation flows
- Export functionality

### E2E Tests (Playwright)
- Critical user journeys
- Cross-browser testing
- Mobile testing

## Deployment

### GitHub Pages
- Automated via GitHub Actions
- Preview deployments for PRs
- Performance budgets enforced

### Performance Budgets
```json
{
  "bundles": {
    "main": { "maxSize": "300KB" },
    "pattern": { "maxSize": "200KB" }
  },
  "metrics": {
    "fcp": { "maxTime": "2s" },
    "lcp": { "maxTime": "3s" },
    "tti": { "maxTime": "4s" }
  }
}
```

## Future Considerations

### Planned Features
1. **WebGPU Support**: Next-gen graphics when available
2. **Collaborative Mode**: Share simulations in real-time
3. **Custom Patterns**: User-created simulations
4. **AI Explanations**: GPT-powered educational content

### Scalability
- CDN ready architecture
- Cloudflare Workers for API
- WebRTC for collaboration

## Development Guidelines

### Adding a New Pattern
1. Create folder in `src/patterns/[name]/`
2. Implement `WebGLSimulation` interface
3. Add educational content in MDX
4. Register in pattern registry
5. Add tests
6. Check performance budget

### Code Standards
- 100% TypeScript
- Prettier + ESLint
- Commit conventions
- PR templates

### Performance Checklist
- [ ] Dispose all Three.js resources
- [ ] Remove event listeners
- [ ] Cancel animation frames
- [ ] Clear timeouts/intervals
- [ ] Test on low-end devices
- [ ] Check memory leaks
- [ ] Verify 60fps target 