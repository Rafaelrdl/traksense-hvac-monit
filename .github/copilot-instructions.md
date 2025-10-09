# TrakSense HVAC — GitHub Spark IoT Monitoring Platform

## Project Overview

TrakSense is an **IoT HVAC monitoring platform** built on **GitHub Spark** that provides real-time visibility, predictive alerts, and asset lifecycle insights for critical HVAC systems in hospitals, industry, data centers, and commercial buildings.

**Core Technology Stack:**
- Frontend: React 19 + TypeScript running inside **GitHub Spark environment**
- State: Zustand stores with real-time simulation engine
- UI: shadcn/ui components (Radix UI primitives) + Tailwind CSS v4
- Charts: ECharts via `echarts-for-react` 
- Data Flow: Simulation engine → Zustand stores → React components

---

## Critical Spark Integration Rules

### Protected Files (NEVER MODIFY)

```
src/main.tsx          ❌ integrates with Spark runtime
src/main.css          ❌ Spark structural styles
index.html            ⚠️  only <title> and meta tags
package.json scripts  ❌ "dev", "build", "preview" are immutable
vite.config.ts        ⚠️  maintain sparkPlugin() and createIconImportProxy()
```

**Why:** Spark provides the execution environment. These files contain critical bindings that cannot be altered without breaking the integration.

### Vite Configuration Pattern

```ts
// vite.config.ts - REQUIRED plugins in this order
import sparkPlugin from "@github/spark/spark-vite-plugin";
import createIconImportProxy from "@github/spark/vitePhosphorIconProxyPlugin";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    createIconImportProxy() as PluginOption,  // REQUIRED
    sparkPlugin() as PluginOption,            // REQUIRED
  ]
})
```

### Asset Import Rules

**ALWAYS use explicit imports:**
```tsx
// ✅ Correct
import logo from '@/assets/logo.png'
<img src={logo} />

// ❌ Wrong - breaks in Spark build
<img src="/assets/logo.png" />
<img src={`/assets/${name}.png`} />
```

### Available Spark APIs

**Currently documented APIs:**
- `spark.llm()` - LLM integration
- `spark.kv` - Key-value persistence
- `spark.user()` - User context

**DO NOT** import undocumented Spark hooks beyond those explicitly approved in Spark documentation.

---

## State Management Architecture

### Zustand Store Pattern (Current Implementation)

**Main App Store:** `src/store/app.ts`
```ts
// Centralized state for HVAC data and UI
interface AppState {
  assets: HVACAsset[]           // Equipment inventory
  sensors: Sensor[]             // Sensor registry
  alerts: Alert[]               // Active alerts
  maintenanceTasks: MaintenanceTask[]
  selectedAssetId: string | null
  selectedTimeRange: '1h' | '6h' | '24h' | '7d' | '30d'
  sidebarCollapsed: boolean
  
  // Real-time simulation controls
  isSimulationRunning: boolean
  startSimulation: () => void
  stopSimulation: () => void
}

// Usage in components
const { assets, selectedAssetId } = useAppStore()
const setSelectedAsset = useAppStore(state => state.setSelectedAsset)
```

**Dashboard Store:** `src/store/dashboard.ts`
```ts
// Manages custom dashboard layouts
interface DashboardState {
  layouts: DashboardLayout[]        // Multiple saved layouts
  currentLayoutId: string
  editMode: boolean
  
  // Widget CRUD operations
  addWidget: (layoutId, widgetType, position) => void
  moveWidget: (layoutId, widgetId, position) => void
  removeWidget: (layoutId, widgetId) => void
}
```

### Persistence Strategy

**Current approach:**
- Zustand stores for reactive state
- `localStorage` for simple persistence (e.g., `sidebarCollapsed`)
- **No backend integration yet** - all data comes from simulation engine

**Future migration path:** Consider `spark.kv` for persistent storage when backend integration is implemented.

---

## Simulation Engine Architecture

**Location:** `src/lib/simulation.ts` (~1500 lines)

The simulation engine (`SimulationEngine` class) is the **data source of truth**. It generates realistic HVAC telemetry, equipment status, alerts, and maintenance data.

**Key Responsibilities:**
1. Generate 12+ HVAC assets (AHUs, Chillers, VRFs, RTUs, Cooling Towers)
2. Create 100+ sensors with realistic readings (temp, pressure, power, vibration)
3. Simulate telemetry history (time-series data)
4. Generate alerts based on threshold rules
5. Manage maintenance schedules and history

**Integration with Store:**
```ts
// src/store/app.ts initialization
assets: simEngine.getAssets(),
sensors: simEngine.getSensors(),
alerts: simEngine.getAlerts(),

// Real-time updates every 5 minutes
startSimulation: () => {
  simEngine.startRealTimeSimulation(300000)
  const refreshInterval = setInterval(() => {
    set({
      assets: simEngine.getAssets(),
      sensors: simEngine.getSensors(),
      alerts: simEngine.getAlerts(),
      lastUpdateTime: new Date()
    })
  }, 300000)
}
```

**HVAC Asset Types:**
```ts
type AssetType = 'AHU' | 'Chiller' | 'VRF' | 'RTU' | 'Boiler' | 'CoolingTower'
type SensorType = 'temp_supply' | 'temp_return' | 'pressure_suction' 
  | 'power_kw' | 'vibration' | 'dp_filter' | /* 20+ more */
```

**Critical:** When adding features that need data, extend `SimulationEngine` methods rather than creating separate mock data.

---

## Component Architecture

### Routing Structure

**Single-page navigation** via state changes in `App.tsx` (no react-router):
```tsx
// src/App.tsx
const [currentPage, setCurrentPage] = useState('overview')

// Pages defined in src/components/pages/
- OverviewPage      // Dashboard with KPIs and charts
- CustomDashboard   // Drag-and-drop widget builder
- AssetsPage        // Equipment grid view
- AssetDetailPage   // Single asset deep-dive
- SensorsPage       // Sensor catalog
- AlertsPage        // Alert management
- MaintenancePage   // Task scheduling
- ReportsPage       // Analytics exports
- SettingsPage      // Configuration
```

### Layout System

**Main Layout:** `src/components/layout/Layout.tsx`
```tsx
<Layout currentPage={currentPage} onNavigate={handleNavigation}>
  {/* Header with horizontal navigation */}
  <Header currentPage={currentPage} onNavigate={onNavigate} />
  
  {/* Max-width centered content */}
  <main className="mx-auto max-w-[1400px] px-6 py-6">
    {children}
  </main>
</Layout>
```

**Navigation:** Horizontal tab-based navigation in `Header.tsx` (no traditional sidebar).

### shadcn/ui Integration

**Location:** `src/components/ui/`

**DO NOT modify these files directly** - they're auto-generated by shadcn CLI.

**To add new components:**
```bash
npx shadcn@latest add [component-name]
```

**Configuration:** `components.json` defines paths and style (New York variant).

**Usage pattern:**
```tsx
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
```

---

## Custom Dashboard System

**Core Feature:** Drag-and-drop dashboard builder with 11+ widget types.

**Key Files:**
- `src/components/dashboard/CustomDashboard.tsx` - Main container with DnD context
- `src/components/dashboard/DraggableWidget.tsx` - Sortable widget wrapper
- `src/components/dashboard/WidgetPalette.tsx` - Widget library
- `src/components/dashboard/LayoutManager.tsx` - Layout CRUD
- `src/store/dashboard.ts` - Layout persistence

**Widget Types:**
```ts
type WidgetType = 
  | 'uptime-kpi' | 'alerts-kpi' | 'consumption-kpi' | 'health-kpi'
  | 'temperature-chart' | 'energy-chart' | 'filter-gauge' 
  | 'alerts-heatmap' | 'alerts-table' | 'maintenance-overview'
```

**Drag & Drop:** Uses `@dnd-kit` library (NOT react-beautiful-dnd):
```tsx
import { DndContext, closestCorners } from '@dnd-kit/core'
import { SortableContext, useSortable } from '@dnd-kit/sortable'
```

**Layout Persistence:** Stored in Zustand dashboard store (in-memory, no backend sync yet).

---

## Charting Pattern

**Library:** ECharts (NOT Recharts) via `echarts-for-react`

**Example:** `src/components/charts/LineChartTemp.tsx`
```tsx
import ReactECharts from 'echarts-for-react'

export const LineChartTemp = ({ data }) => {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Fornecimento', 'Retorno', 'Setpoint'] },
    xAxis: { type: 'time' },
    yAxis: { type: 'value', name: 'Temperatura (°C)' },
    series: [
      { name: 'Fornecimento', type: 'line', data: data.supply },
      { name: 'Retorno', type: 'line', data: data.return },
      { name: 'Setpoint', type: 'line', data: data.setpoint }
    ]
  }
  
  return <ReactECharts option={option} style={{ height: '300px' }} />
}
```

**Other Chart Components:**
- `BarChartEnergy.tsx` - Energy consumption bars
- `GaugeFilterHealth.tsx` - Filter health indicator
- `HeatmapAlarms.tsx` - Alert density heatmap
- `ScatterPerformance.tsx` - Performance scatter plot

---

## TypeScript Patterns

### Type Definitions

**Main types:** `src/types/hvac.ts` (248 lines)
```ts
interface HVACAsset {
  id: string
  tag: string                    // Equipment identifier (e.g., "AHU-001")
  type: 'AHU' | 'Chiller' | 'VRF' | 'RTU' | 'Boiler' | 'CoolingTower'
  location: string
  healthScore: number            // 0-100
  powerConsumption: number       // kWh/day
  status: 'OK' | 'Maintenance' | 'Stopped' | 'Alert'
  operatingHours: number
  lastMaintenance: Date
  specifications: Record<string, any>
}

interface Sensor {
  id: string
  tag: string                    // Sensor tag (e.g., "TEMP-001")
  assetId: string                // Parent equipment
  type: SensorType
  unit: string
  online: boolean
  lastReading: SensorReading | null
  availability: number           // uptime percentage
}

interface Alert {
  id: string
  assetId: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
  type: string
  message: string
  timestamp: Date
  acknowledged: boolean
  resolved: boolean
}
```

### Path Aliases

**Configured in `vite.config.ts` and `tsconfig.json`:**
```ts
'@' → 'src/'
'@/components' → 'src/components'
'@/lib' → 'src/lib'
'@/hooks' → 'src/hooks'
```

**Usage:**
```tsx
import { useAppStore } from '@/store/app'
import { Button } from '@/components/ui/button'
import { simEngine } from '@/lib/simulation'
```

---

## Styling System

### Tailwind CSS v4 + Custom Theme

**Configuration:** `tailwind.config.js` reads from `theme.json`

**Color System:** Uses CSS variables defined in `src/styles/theme.css`
```css
--color-neutral-1 through --color-neutral-12  /* Gray scale */
--color-accent-1 through --color-accent-12    /* Primary brand */
--color-fg, --color-fg-secondary              /* Text colors */
--color-bg, --color-bg-inset, --color-bg-overlay
```

**Spacing:** Uses Spark's 8pt grid system via CSS variables:
```
--size-0, --size-1, --size-2, ... --size-96
```

**Usage in components:**
```tsx
<div className="bg-bg text-fg rounded-lg p-4 space-y-3">
  <h2 className="text-2xl font-semibold text-accent-11">
    Equipment Status
  </h2>
</div>
```

### Responsive Design

**NO `useIsMobile()` hook currently** - use Tailwind responsive classes:
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
```

---

## Development Workflow

### Running the Application

```bash
# Start development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**NEVER** run `vite dev` or `tsc` directly - use npm scripts.

### Adding Dependencies

**Check Spark compatibility first** - especially for React/Vite versions:
```bash
# Safe to add utilities and UI libraries
npm install date-fns
npm install clsx

# AVOID changing these versions without testing in Spark
react@19.0.0
react-dom@19.0.0
vite@6.3.5
```

### Adding shadcn/ui Components

```bash
# Use the official CLI
npx shadcn@latest add card
npx shadcn@latest add select

# Components are added to src/components/ui/
```

---

## Testing Strategy

**Current state:** No test framework configured yet.

**Recommended approach when implementing:**
- Vitest for unit tests (React component testing)
- Testing Library for component interaction tests
- Mock `simEngine` for predictable test data

**Do NOT add Cypress/Playwright yet** - keep it lightweight for Spark environment.

---

## Troubleshooting Common Issues

### Spark Integration Failures

**Symptom:** App doesn't load or shows blank screen
**Check:**
1. `src/main.tsx` imports `@github/spark/spark`
2. `vite.config.ts` has both required Spark plugins
3. No modifications to `src/main.css`
4. Port 5173 is accessible

### Chart Rendering Issues

**Symptom:** ECharts not displaying
**Solutions:**
1. Verify data format matches ECharts series structure
2. Check explicit height is set: `style={{ height: '300px' }}`
3. Ensure data arrays are not empty
4. Add loading states with early returns

### State Update Problems

**Symptom:** UI not updating when data changes
**Solutions:**
1. Verify Zustand selector is correctly extracting state
2. Check simulation engine is running: `isSimulationRunning: true`
3. Use devtools to inspect store: `import { devtools } from 'zustand/middleware'`

---

## Project-Specific Patterns

### Time Range Calculations

**Pattern:** Use hook that computes time ranges from selectedTimeRange:
```ts
// From src/store/app.ts
export const useTimeRangeMs = () => {
  const range = useAppStore(state => state.selectedTimeRange)
  
  return useMemo(() => {
    const now = Date.now()
    switch (range) {
      case '1h': return { start: new Date(now - 60 * 60 * 1000), end: new Date(now) }
      case '24h': return { start: new Date(now - 24 * 60 * 60 * 1000), end: new Date(now) }
      // ...
    }
  }, [range])
}
```

### Asset Selection Flow

**Pattern:** Asset selection drives navigation:
```tsx
// Setting selected asset
useAppStore.getState().setSelectedAsset('ahu-001')

// Component reads selection
const selectedAssetId = useAppStore(state => state.selectedAssetId)
const selectedAsset = useSelectedAsset() // helper hook

// App.tsx conditionally renders AssetDetailPage
if (selectedAssetId && currentPage === 'assets') {
  return <AssetDetailPage />
}
```

### Alert Acknowledgment

**Pattern:** In-memory acknowledgment (no backend):
```ts
const acknowledgeAlert = useAppStore(state => state.acknowledgeAlert)

// Updates alert object
acknowledgeAlert(alertId)  
// Sets: acknowledged: true, acknowledgedAt: new Date()
```

---

## Key Architectural Decisions

### Why No React Router?
**Decision:** Use simple state-based navigation via `currentPage` state.
**Rationale:** Simpler for Spark environment, no URL management needed for SPA.

### Why ECharts over Recharts?
**Decision:** `echarts-for-react` for all charts.
**Rationale:** More powerful, better performance with large datasets, professional industrial monitoring look.

### Why Zustand over Redux?
**Decision:** Zustand stores for state management.
**Rationale:** Lighter weight, simpler API, no boilerplate, better TypeScript inference.

### Why Simulation Engine?
**Decision:** Robust simulation engine instead of static mock data.
**Rationale:** Demonstrates real-time capabilities, realistic edge cases, supports time-based queries.

---

## Essential Commands

```bash
# Development
npm run dev          # Start Spark app on :5173

# Code Quality
npm run lint         # ESLint check

# Build
npm run build        # TypeScript compile + Vite build
npm run preview      # Test production build

# Utilities
npm run kill         # Kill process on port 5000 (if needed)
npm run optimize     # Vite dependency optimization
```

---

## When to Extend vs Modify

### Always Extend (Add New Files)
- New pages in `src/components/pages/`
- New chart types in `src/components/charts/`
- New widgets in `src/components/dashboard/widgets/`
- New types in `src/types/`

### Modify Carefully (Existing Files)
- `src/store/app.ts` - adding state properties
- `src/lib/simulation.ts` - extending simulation data
- `src/App.tsx` - adding navigation routes

### Never Modify (Protected)
- `src/main.tsx`
- `src/main.css`
- `src/components/ui/*` (regenerate instead)
- `vite.config.ts` plugin order
- `package.json` scripts
