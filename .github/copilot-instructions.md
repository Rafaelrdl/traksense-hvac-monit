# TrakSense HVAC — Multi-Tenant IoT Monitoring Platform (Frontend)

## Project Overview

TrakSense is an **IoT HVAC monitoring platform** that provides real-time visibility, predictive alerts, and asset lifecycle insights for critical HVAC systems in hospitals, industry, data centers, and commercial buildings.

**Core Technology Stack:**
- **Frontend**: React 19 + TypeScript + Vite 6.3.5
- **State Management**: Zustand stores with API integration
- **UI Components**: shadcn/ui (Radix UI primitives) + Tailwind CSS v4
- **Charts**: ECharts via `echarts-for-react` 
- **HTTP Client**: Axios with JWT authentication
- **Architecture**: Multi-tenant aware frontend (tenant detection, isolated storage, dynamic branding)
- **Data Flow**: Django API → Axios → Zustand stores → React components

---

## ⚠️ Important: Spark Integration REMOVED

**GitHub Spark has been completely removed from this project.** All Spark-specific code, dependencies, and configurations have been eliminated.

### Files Modified (Spark Removal)
- ✅ `vite.config.ts` - Removed sparkPlugin and icon proxy
- ✅ `package.json` - Removed @github/spark dependency
- ✅ `main.tsx` - Removed Spark import
- ✅ Icon imports - Migrated from @phosphor-icons to lucide-react
- ✅ Error fallback - Removed Spark-specific messages

### Current Vite Configuration

```ts
// vite.config.ts - Standard Vite + React setup
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
```

---

## 🏢 Multi-Tenant Architecture (IMPLEMENTED)

**The frontend now supports multi-tenant awareness with complete data isolation.**

### Key Features

1. **Tenant Detection** (`src/lib/tenant.ts`)
   - Automatic detection from JWT token (after login)
   - Fallback to hostname (nginx multi-domain)
   - Fallback to localStorage (previous tenant)
   - Default configuration

2. **Isolated Storage** (`src/lib/tenantStorage.ts`)
   - Data isolated by tenant namespace
   - Format: `{tenantSlug}:key` (e.g., `umc:access_token`)
   - Prevents data leakage between tenants
   - Backup/restore utilities included

3. **Dynamic Branding** (`src/hooks/useTenantBranding.ts`, `src/components/providers/TenantProvider.tsx`)
   - Logo customization per tenant
   - Color schemes (primary/secondary)
   - Dynamic favicon and page title
   - TenantLogo component for easy integration

4. **API Reconfiguration** (`src/lib/api.ts`, `src/services/tenantAuthService.ts`)
   - API base URL changes per tenant
   - Automatic reconfiguration after login
   - Token isolation per tenant
   - Example: `http://umc.localhost:8000/api` for UMC tenant

### Multi-Tenant Files Structure

```
src/
├── lib/
│   ├── tenant.ts              # Tenant detection and configuration
│   ├── tenantStorage.ts       # Isolated localStorage wrapper
│   ├── api.ts                 # Multi-tenant aware Axios client
│   └── migrations/
│       └── storageMigration.ts # Legacy data migration
│
├── services/
│   └── tenantAuthService.ts   # Tenant-aware authentication
│
├── hooks/
│   └── useTenantBranding.ts   # Branding hooks (useT enantConfig, useTenantBranding)
│
├── components/
│   ├── providers/
│   │   └── TenantProvider.tsx # React provider for branding
│   ├── tenant/
│   │   └── TenantLogo.tsx     # Dynamic logo component
│   └── debug/
│       └── TenantDebugPanel.tsx # Dev debug panel
│
└── examples/
    └── MultiTenantAppExample.tsx # Integration examples
```

### Usage Examples

**1. Wrap App with TenantProvider:**
```tsx
import { TenantProvider } from '@/components/providers/TenantProvider';

<TenantProvider>
  <App />
</TenantProvider>
```

**2. Use Tenant-Aware Authentication:**
```tsx
import { tenantAuthService } from '@/services/tenantAuthService';

// Login automatically detects and configures tenant
await tenantAuthService.login(credentials);

// Logout clears tenant data
await tenantAuthService.logout();
```

**3. Use Isolated Storage:**
```tsx
import { tenantStorage } from '@/lib/tenantStorage';

// Save (isolated by tenant)
tenantStorage.set('preferences', { theme: 'dark' });

// Read (isolated by tenant)
const prefs = tenantStorage.get('preferences');
```

**4. Use Dynamic Branding:**
```tsx
import { useTenantBranding } from '@/hooks/useTenantBranding';
import { TenantLogo } from '@/components/tenant/TenantLogo';

const { primaryColor, name } = useTenantBranding();

<TenantLogo size="md" showName />
<div style={{ color: primaryColor }}>{name}</div>
```

### Configured Tenants

```typescript
// Default tenants in src/lib/tenant.ts
UMC (Uberlândia Medical Center):
  - Slug: umc
  - Primary Color: 0A5F7F (teal)
  - API: http://umc.localhost:8000/api

ACME (Example):
  - Slug: acme  
  - Primary Color: FF6B00 (orange)
  - API: http://acme.localhost:8000/api
```

### Documentation
- **MULTI_TENANT_FRONTEND_GUIDE.md** - Complete implementation guide
- **MULTI_TENANT_SUMMARY.md** - Executive summary
- **TENANT_TEST_COMMANDS.md** - Testing commands and scenarios

---

## State Management Architecture

### Zustand Store Pattern

**Main App Store:** `src/store/app.ts`
```ts
// Centralized state for HVAC data and UI
interface AppState {
  assets: HVACAsset[]           // Equipment inventory (loaded from API)
  sensors: Sensor[]             // Sensor registry
  alerts: Alert[]               // Active alerts
  maintenanceTasks: MaintenanceTask[]
  availableSites: any[]         // Sites from API
  currentSite: any | null       // Selected site
  selectedAssetId: string | null
  selectedTimeRange: '1h' | '6h' | '24h' | '7d' | '30d'
  sidebarCollapsed: boolean
  
  // Loading states
  isLoadingAssets: boolean
  isLoadingSites: boolean
  error: string | null
  
  // API actions
  loadAssetsFromApi: () => Promise<void>
  loadAvailableSites: () => Promise<void>
  
  // Telemetry (Phase 3)
  telemetry: {
    currentDevice: string | null
    latestReadings: LatestReadingsResponse | null
    history: DeviceHistoryResponse | null
    summary: DeviceSummaryResponse | null
    isLoading: boolean
    error: string | null
  }
}

// Usage in components
const { assets, isLoadingAssets } = useAppStore()
const loadAssets = useAppStore(state => state.loadAssetsFromApi)
```

**Auth Store:** `src/store/auth.ts`
```ts
// Tenant-aware authentication (uses tenantAuthService)
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (credentials: Credentials) => Promise<void>  // Auto-configures tenant
  logout: () => Promise<void>                         // Clears tenant storage
  checkAuth: () => Promise<boolean>
}
```

### Store Principles

1. **Tenant-Aware Storage**: Use `tenantStorage` for isolated data
   ```ts
   // Good - isolated by tenant ✓
   import { tenantStorage } from '@/lib/tenantStorage'
   tenantStorage.set('preferences', userPrefs)
   
   // Avoid - shared across tenants ✗
   localStorage.setItem('preferences', JSON.stringify(userPrefs))
   ```

2. **Selector Usage**: Extract only what you need
   ```ts
   // Good ✓
   const assets = useAppStore(state => state.assets)
   
   // Avoid - causes unnecessary re-renders ✗
   const allState = useAppStore()
   ```

3. **Actions for API Calls**: Keep async logic in store actions
   ```ts
   loadAssetsFromApi: async () => {
     set({ isLoadingAssets: true, error: null })
     try {
       const response = await apiClient.get('/assets/')
       set({ assets: response.data, isLoadingAssets: false })
     } catch (error) {
       set({ error: error.message, isLoadingAssets: false })
     }
   }
   ```

4. **Multi-Tenant Data Loading**: Re-load when tenant changes
   ```ts
   useEffect(() => {
     loadAssetsFromApi()  // Uses correct tenant API
   }, [currentTenant])
   ```

---

## API Integration (Backend)

**API Client:** `src/lib/api.ts`

### Multi-Tenant Aware Axios Client

```ts
import { apiClient } from '@/lib/api'

// Base URL changes per tenant automatically
// Example: http://umc.localhost:8000/api for UMC tenant

// GET request
const assets = await apiClient.get('/assets/')

// POST request  
const newAsset = await apiClient.post('/assets/', data)

// PUT request
await apiClient.put(`/assets/${id}/`, updatedData)

// DELETE request
await apiClient.delete(`/assets/${id}/`)
```

### Key Features

- **Automatic Tenant URL**: Base URL set via `getTenantApiUrl()`
- **Token Management**: JWT access/refresh tokens in HttpOnly cookies
- **Interceptors**: 
  - Request: Adds `Authorization: Bearer {token}` header
  - Response: Auto-refresh on 401 errors
- **Tenant Reconfiguration**: `reconfigureApiForTenant(slug)` updates base URL

### Main Endpoints

**Authentication:**
```ts
POST /auth/register/     // User registration
POST /auth/login/        // Login (returns JWT tokens)
POST /auth/logout/       // Logout
GET  /auth/me/           // Current user info
POST /auth/change-password/
POST /auth/avatar/       // Upload avatar
```

**Assets (CRUD):**
```ts
GET    /assets/sites/      // List all sites
POST   /assets/sites/      // Create site
GET    /assets/sites/:id/  // Get site details
PUT    /assets/sites/:id/  // Update site
DELETE /assets/sites/:id/  // Delete site

// Similar patterns for:
/assets/assets/   // HVAC equipment
/assets/devices/  // Physical devices  
/assets/sensors/  // Individual sensors
```

**Telemetry (Phase 3):**
```ts
POST /ingest/                    // MQTT webhook ingestion
GET  /ingest/telemetry/          // Query telemetry data
GET  /ingest/latest/:device_id/  // Latest readings
GET  /ingest/history/:device_id/ // Historical data
GET  /ingest/summary/:device_id/ // Summary statistics
GET  /ingest/aggregates/         // Time-series aggregates
```

### Error Handling

```ts
try {
  const response = await apiClient.get('/assets/')
  return response.data
} catch (error) {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
  } else if (error.response?.status === 404) {
    // Not found
  } else {
    console.error('API Error:', error.response?.data || error.message)
  }
}
```

---

## Component Architecture

### Page Components (`src/components/pages/`)

**Pattern:** Full-page views that connect to Zustand stores and API

```tsx
// Example: AssetsPage.tsx
export const AssetsPage = () => {
  const { assets, isLoadingAssets, loadAssetsFromApi } = useAppStore()
  
  // Load assets from API on mount
  useEffect(() => {
    loadAssetsFromApi()
  }, [loadAssetsFromApi])
  
  if (isLoadingAssets) return <LoadingSpinner />
  if (assets.length === 0) return <EmptyState />
  
  return (
    <div className="space-y-6">
      <AssetList assets={assets} />
      <AssetDetails assetId={selectedAssetId} />
    </div>
  )
}
```

**Key Pages:**
- `DashboardPage.tsx` - Main overview with widget grid
- `AssetsPage.tsx` - Equipment inventory (loads from API)
- `SensorsPage.tsx` - Sensor registry and status (Phase 3)
- `AssetDetailsPage.tsx` - Individual asset telemetry (Phase 3)
- `AlertsPage.tsx` - Active alerts and history
- `MaintenancePage.tsx` - Maintenance schedules
- `AnalyticsPage.tsx` - Reports and trends
- `SettingsPage.tsx` - User preferences (tenant-isolated)

### Feature Components (`src/components/`)

**Asset Management:**
- `AssetCard.tsx` - Equipment card with status
- `AssetList.tsx` - Grid/list view of assets
- `AssetStatusBadge.tsx` - Online/offline/warning indicator

**Telemetry Visualization:**
- `TelemetryChart.tsx` - ECharts time-series (Phase 3)
- `GaugeWidget.tsx` - Real-time metrics
- `HistoricalChart.tsx` - Historical trends

**Alerts:**
- `AlertList.tsx` - Alert feed
- `AlertCard.tsx` - Individual alert details

**Tenant Components:**
- `TenantLogo.tsx` - Dynamic logo per tenant
- `TenantProvider.tsx` - Branding context
- `TenantDebugPanel.tsx` - Development debug panel

### shadcn/ui Integration

**Installed Components:** (via `npx shadcn@latest add <component>`)
- `button`, `card`, `badge`, `avatar`
- `dialog`, `dropdown-menu`, `select`
- `table`, `tabs`, `toast`
- `form`, `input`, `label`, `checkbox`
- `chart` (for dashboards)
- `sidebar` (collapsible navigation)

**Usage Pattern:**
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

<Card>
  <CardHeader>
    <CardTitle>Chiller Status <Badge variant="success">Online</Badge></CardTitle>
  </CardHeader>
  <CardContent>
    <Button variant="outline" size="sm">View Details</Button>
  </CardContent>
</Card>
```

### ECharts Visualization

**Location:** `src/components/charts/` (Phase 3 telemetry charts)

**Example: Telemetry Chart**
```tsx
import ReactECharts from 'echarts-for-react'

const TelemetryChart = ({ data, metricType }: Props) => {
  const option = {
    xAxis: { type: 'time' },
    yAxis: { type: 'value', name: metricType },
    series: [{
      type: 'line',
      smooth: true,
      data: data.map(d => [d.timestamp, d.value])
    }],
    tooltip: { trigger: 'axis' }
  }
  
  return <ReactECharts option={option} style={{ height: '400px' }} />
}
```

**Chart Types Used:**
- Line charts: Temperature, pressure trends
- Bar charts: Power consumption comparison
- Gauge charts: Real-time metrics (efficiency, load)
- Heatmaps: Multi-sensor correlation (advanced analytics)

---

## Routing Structure

**React Router** for navigation (`src/App.tsx`)

**Main Routes:**
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'

<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
  <Route path="/assets" element={<ProtectedRoute><AssetsPage /></ProtectedRoute>} />
  <Route path="/assets/:id" element={<ProtectedRoute><AssetDetailsPage /></ProtectedRoute>} />
  <Route path="/sensors" element={<ProtectedRoute><SensorsPage /></ProtectedRoute>} />
  <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
  <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
  <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
</Routes>
```

**ProtectedRoute Pattern:**
```tsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  const { checkAuth } = useAuthStore()
  
  useEffect(() => {
    checkAuth()
  }, [])
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
```

---
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

## TypeScript Patterns

### Strict Type Safety

**tsconfig.json settings:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**Type Definitions:** `src/types/`

```ts
// src/types/asset.ts
export interface HVACAsset {
  id: string
  name: string
  type: 'AHU' | 'Chiller' | 'VRF' | 'RTU' | 'Boiler' | 'CoolingTower'
  status: 'online' | 'offline' | 'warning' | 'error'
  location: string
  model: string
  capacity?: string
  lastMaintenance?: Date
  sensors: Sensor[]
  metadata?: Record<string, unknown>
}

// src/types/sensor.ts
export interface Sensor {
  id: string
  assetId: string
  name: string
  type: SensorType
  unit: string
  value: number
  min: number
  max: number
  threshold?: { warning: number; critical: number }
  lastUpdate: Date
  status: 'normal' | 'warning' | 'critical'
}

// src/types/telemetry.ts (Phase 3)
export interface TelemetryReading {
  timestamp: string  // ISO 8601
  device_id: string
  sensor_type: string
  value: number
  unit: string
}

export interface LatestReadingsResponse {
  device_id: string
  readings: Array<{
    sensor_type: string
    value: number
    unit: string
    timestamp: string
  }>
}
```

### Component Props Patterns

**Prefer explicit interfaces over inline types:**
```tsx
// Good ✓
interface AssetCardProps {
  asset: HVACAsset
  onClick?: (id: string) => void
  variant?: 'default' | 'compact'
}

export const AssetCard = ({ asset, onClick, variant = 'default' }: AssetCardProps) => {
  // ...
}

// Avoid inline types ✗
export const AssetCard = ({ asset, onClick }: { asset: HVACAsset; onClick: () => void }) => {
  // ...
}
```

**Use discriminated unions for complex state:**
```tsx
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: HVACAsset[] }
  | { status: 'error'; error: string }

const [state, setState] = useState<LoadingState>({ status: 'idle' })

// Type-safe pattern matching
if (state.status === 'success') {
  console.log(state.data) // TypeScript knows data exists
}
```

### API Response Typing

**Always type API responses:**
```tsx
import { apiClient } from '@/lib/api'
import type { HVACAsset } from '@/types/asset'

const loadAssets = async () => {
  const response = await apiClient.get<{ results: HVACAsset[] }>('/assets/')
  return response.data.results
}

// With error handling
const loadAssets = async (): Promise<HVACAsset[]> => {
  try {
    const response = await apiClient.get<{ results: HVACAsset[] }>('/assets/')
    return response.data.results
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Failed to load assets')
    }
    throw error
  }
}
```

---

---

## Development Workflow

### Local Development

**Start development server:**
```powershell
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api (ensure backend is running)
- Multi-tenant URLs: http://umc.localhost:5173, http://acme.localhost:5173

### Build & Preview

```powershell
# Production build
npm run build

# Preview production build
npm run preview
```

### Code Quality

```powershell
# TypeScript type checking
npm run type-check

# Linting (ESLint)
npm run lint

# Linting with auto-fix
npm run lint:fix
```

### Testing Multi-Tenant Features

**1. Test Tenant Detection:**
```typescript
// In browser console
import { getTenantConfig } from '@/lib/tenant'
console.log(getTenantConfig())
```

**2. Test Isolated Storage:**
```typescript
// In browser console
import { tenantStorage } from '@/lib/tenantStorage'
tenantStorage.set('test', { value: 123 })
console.log(tenantStorage.keys())  // Shows all keys for current tenant
```

**3. Test Branding:**
- Visit http://umc.localhost:5173 → Should show UMC branding (blue)
- Visit http://acme.localhost:5173 → Should show ACME branding (orange)

**4. Debug Panel (Development Only):**
```tsx
import { TenantDebugPanel } from '@/components/debug/TenantDebugPanel'

// Add to App.tsx temporarily
{import.meta.env.DEV && <TenantDebugPanel />}
```

### Debugging Tips

**API Calls:**
```ts
// Enable Axios request/response logging
import { apiClient } from '@/lib/api'

apiClient.interceptors.request.use(config => {
  console.log('🚀 API Request:', config.method?.toUpperCase(), config.url)
  return config
})

apiClient.interceptors.response.use(
  response => {
    console.log('✅ API Response:', response.status, response.config.url)
    return response
  },
  error => {
    console.error('❌ API Error:', error.response?.status, error.config?.url)
    return Promise.reject(error)
  }
)
```

**Zustand DevTools:**
```ts
// In store definition
import { devtools } from 'zustand/middleware'

export const useAppStore = create(
  devtools(
    (set, get) => ({
      // ...state and actions
    }),
    { name: 'AppStore' }
  )
)
```

**React DevTools:**
- Install React DevTools extension
- Use Components tab to inspect state
- Use Profiler to find performance bottlenecks

---

## Common Patterns & Best Practices

### 1. Loading States Pattern

```tsx
const SomeComponent = () => {
  const { data, isLoading, error } = useAppStore()
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner className="h-8 w-8" />
        <span className="ml-2">Carregando...</span>
      </div>
    )
  }
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }
  
  return <div>{/* render data */}</div>
}
```

### 2. Empty State Pattern

```tsx
if (!data || data.length === 0) {
  return (
    <Card className="flex flex-col items-center justify-center h-64">
      <InboxIcon className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">Nenhum ativo encontrado</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Comece adicionando seu primeiro equipamento
      </p>
      <Button onClick={() => openAddAssetDialog()}>
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Ativo
      </Button>
    </Card>
  )
}
```

### 3. Form Handling Pattern

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const assetSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  type: z.enum(['AHU', 'Chiller', 'VRF']),
  location: z.string().min(1, 'Localização é obrigatória'),
})

type AssetFormData = z.infer<typeof assetSchema>

const AssetForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<AssetFormData>({
    resolver: zodResolver(assetSchema)
  })
  
  const onSubmit = async (data: AssetFormData) => {
    try {
      await apiClient.post('/assets/', data)
      toast.success('Ativo criado com sucesso')
    } catch (error) {
      toast.error('Erro ao criar ativo')
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('name')} />
      {errors.name && <span className="text-destructive">{errors.name.message}</span>}
      {/* more fields */}
    </form>
  )
}
```

### 4. Conditional Rendering Pattern

```tsx
// Good - early returns ✓
if (!asset) return null
if (asset.status === 'offline') return <OfflineState />

return <OnlineState asset={asset} />

// Avoid - nested ternaries ✗
return asset ? (
  asset.status === 'offline' ? <OfflineState /> : <OnlineState asset={asset} />
) : null
```

### 5. Component Composition Pattern

```tsx
// Good - composable components ✓
<Card>
  <CardHeader>
    <CardTitle>{asset.name}</CardTitle>
    <CardDescription>{asset.location}</CardDescription>
  </CardHeader>
  <CardContent>
    <AssetMetrics asset={asset} />
  </CardContent>
  <CardFooter>
    <Button variant="outline">Ver Detalhes</Button>
  </CardFooter>
</Card>

// Avoid - monolithic components ✗
<AssetCard asset={asset} showHeader showMetrics showFooter />
```

---

## File Naming Conventions

- **Components**: PascalCase (`AssetCard.tsx`, `TelemetryChart.tsx`)
- **Utilities**: camelCase (`api.ts`, `tenant.ts`, `tenantStorage.ts`)
- **Types**: camelCase (`asset.ts`, `sensor.ts`, `telemetry.ts`)
- **Hooks**: camelCase with `use` prefix (`useTenantBranding.ts`, `useAssets.ts`)
- **Pages**: PascalCase with `Page` suffix (`DashboardPage.tsx`, `AssetsPage.tsx`)
- **Store**: camelCase (`app.ts`, `auth.ts`)

---

## Environment Variables

**File:** `.env` (not committed to git)

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Multi-tenant configuration (optional)
VITE_DEFAULT_TENANT=umc

# Feature flags (optional)
VITE_ENABLE_DEBUG_PANEL=true
```

**Usage in code:**
```ts
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'
const debugEnabled = import.meta.env.VITE_ENABLE_DEBUG_PANEL === 'true'
```

---

## Additional Resources

- **Multi-Tenant Guide**: `MULTI_TENANT_FRONTEND_GUIDE.md`
- **Multi-Tenant Summary**: `MULTI_TENANT_SUMMARY.md`
- **Testing Commands**: `TENANT_TEST_COMMANDS.md`
- **Backend README**: `../traksense-backend/README.md`
- **shadcn/ui Docs**: https://ui.shadcn.com
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **ECharts Docs**: https://echarts.apache.org/en/index.html
- **Tailwind CSS v4 Docs**: https://tailwindcss.com/docs

---

**Last Updated:** 2025
**Multi-Tenant System:** Implemented ✅
**Spark Integration:** Removed ✅
