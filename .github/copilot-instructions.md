# TrakSense HVAC — Multi-Tenant IoT Monitoring Platform (Frontend)

---

## 🚨 CRITICAL: FILE ORGANIZATION RULES (READ FIRST!)

> **⚠️ MANDATORY:** Before creating ANY file, read `.github/ai-instructions/.copilot-rules`

### 🔴 NEVER Create Documentation in Root

**❌ WRONG:**
```
traksense-hvac-monit/
├── FASE_7.md ❌
├── IMPLEMENTACAO_NOVA.md ❌
├── GUIA_TESTE.md ❌
└── BUGFIX_ALGO.md ❌
```

**✅ CORRECT:**
```
traksense-hvac-monit/
└── docs/
    ├── fases/FASE_7.md ✅
    ├── implementacao/IMPLEMENTACAO_NOVA.md ✅
    ├── guias/GUIA_TESTE.md ✅
    └── bugfixes/BUGFIX_ALGO.md ✅
```

### 📋 Quick Reference: File Prefix → Location

| Prefix | Location | Example |
|--------|----------|---------|
| `FASE_*.md` | `docs/fases/` | `FASE_7_NOTIFICATIONS.md` |
| `IMPLEMENTACAO_*.md` | `docs/implementacao/` | `IMPLEMENTACAO_WEBSOCKET.md` |
| `GUIA_*.md` | `docs/guias/` | `GUIA_TESTE_ALERTAS.md` |
| `BUGFIX_*.md` | `docs/bugfixes/` | `BUGFIX_CHART_DISPLAY.md` |
| `INTEGRACAO_*.md` | `docs/integracao/` | `INTEGRACAO_API.md` |
| `MULTI_TENANT_*.md` | `docs/integracao/` | `MULTI_TENANT_FLOW.md` |

### 🛡️ Protection System

This project has **4 layers of protection** against file disorganization:

1. **`.copilot-rules`** - Quick rules summary (in `.github/ai-instructions/`)
2. **`AI_FILE_ORGANIZATION_WARNING.md`** - Visual guide
3. **`QUICK_REFERENCE.md`** - Lookup table
4. **`README.md`** - Comprehensive guide

**📖 Full details:** See `.github/ai-instructions/README.md`

### ✅ Before Creating Files - Checklist

- [ ] Is this a documentation file? → Use `docs/` with subfolder
- [ ] Does it have a prefix (FASE_, GUIA_, etc)? → Check table above
- [ ] Not in whitelist? → Use appropriate `docs/` subfolder
- [ ] When in doubt? → Read `.github/ai-instructions/.copilot-rules`

### 🎯 Root Whitelist (Only These Allowed)

**Configuration:** `package.json`, `tsconfig.json`, `vite.config.ts`, `tailwind.config.js`, `components.json`, `theme.json`  
**Environment:** `.env`, `.env.example`, `.gitignore`  
**Documentation:** `README.md`, `INDEX.md`, `SECURITY.md`, `LICENSE`  
**Entry:** `index.html`

**Everything else** → `docs/` with appropriate subfolder!

---

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

## 🔒 SECURITY: Recent Fixes (Nov 2025)

**⚠️ CRITICAL UPDATES - Multi-tenant security vulnerabilities have been addressed:**

### Frontend Security Fixes (11/11 Implemented)

1. **✅ Localhost URL Rebuild (CRÍTICO)**
   - **File:** `src/lib/tenant.ts` (lines 110-180)
   - **Fix:** Persists real `api_base_url` from backend JWT, no longer rebuilds localhost
   - **Impact:** API calls work in production environments

2. **✅ Storage Namespace Leaking (CRÍTICO)**
   - **File:** `src/store/auth.ts` (line 312)
   - **Fix:** Dynamic storage key scoped by `tenantStorage.detectTenantSlug()`
   - **Impact:** Sessions no longer leak between tenants

3. **✅ Legacy Registration Service**
   - **File:** `src/services/auth.service.ts` (lines 178-196)
   - **Fix:** Now uses `tenantStorage` and `reconfigureApiForTenant`
   - **Status:** ⚠️ DEPRECATED - Use `tenantAuthService.register()` instead

4. **✅ Token Storage in loadAssets**
   - **File:** `src/store/app.ts` (lines 389-420, line 716)
   - **Fix:** Uses `tenantStorage` instead of `localStorage`, removed auto-loading at module import
   - **Pattern:** Assets should load via `useEffect` after authentication

5. **✅ Chart Delta Always 0.0°C**
   - **File:** `src/components/charts/LineChartTemp.tsx` (lines 82-95)
   - **Fix:** Accesses full series data via `option.series[param.seriesIndex]?.data`
   - **Impact:** Tooltip now shows correct temperature deltas

6. **✅ Duplicate Auth Services**
   - **Files:** `tenantAuthService.ts` extended with `register`, `updateProfile`, `uploadAvatar`, `removeAvatar`, `changePassword`
   - **Status:** `auth.service.ts` is now DEPRECATED
   - **Migration:** All new code should use `tenantAuthService`

7. **✅ PII Logging (Compliance)**
   - **File:** `src/services/auth.service.ts` (lines 92-122)
   - **Fix:** Logs guarded with `import.meta.env.DEV`
   - **Impact:** No PII in production logs (LGPD/GDPR compliant)

8. **✅ Demo Credentials in Bundle**
   - **File:** `src/components/auth/LoginPage.tsx` (lines 34-50)
   - **Fix:** Demo users only load if `import.meta.env.DEV`
   - **Impact:** Production builds don't expose demo credentials

9. **✅ Unused Dependencies**
   - **File:** `package.json`
   - **Removed:** `@mantine/*`, `recharts`, `@vitejs/plugin-react`
   - **Impact:** 24% bundle size reduction

10. **✅ UTF-8 Encoding**
    - **File:** `.editorconfig` (created)
    - **Fix:** Enforces UTF-8 charset for all new files
    - **Impact:** Prevents rendering issues (�� characters)

11. **✅ Icon System**
    - **Current:** `lucide-react` (primary)
    - **Removed:** `@phosphor-icons/react` (unused)
    - **Removed:** GitHub Spark integration

### Recommended Migration Path

**Auth Service Migration:**
```typescript
// ❌ OLD (DEPRECATED)
import { authService } from '@/services/auth.service';
await authService.register(data);

// ✅ NEW (RECOMMENDED)
import { tenantAuthService } from '@/services/tenantAuthService';
await tenantAuthService.register(data);
```

**Asset Loading Pattern:**
```typescript
// ❌ OLD (Module-level auto-loading)
// Store automatically loads at import

// ✅ NEW (Component-level with auth check)
const { isAuthenticated } = useAuthStore();
const loadAssets = useAppStore(state => state.loadAssetsFromApi);

useEffect(() => {
  if (isAuthenticated) {
    loadAssets();
  }
}, [isAuthenticated, loadAssets]);
```

### Security Validation Checklist

**Before deploying:**
- [ ] API URL persists after login (not localhost)
- [ ] LocalStorage keys scoped by tenant: `ts:umc:auth`, `ts:acme:auth`
- [ ] Chart tooltips show correct deltas (not +0.0°C)
- [ ] Demo credentials button hidden in production
- [ ] No PII in production console logs
- [ ] Bundle doesn't include `@mantine/*` or `recharts`

**Documentation:** See `CORRECOES_SEGURANCA_COMPLETAS.md` for full details

---

## 🔧 RECENT FIXES: Architecture & API Integration (Nov 2025)

**⚠️ CRITICAL UPDATES - Additional fixes beyond security audit:**

### Frontend Fixes (5 additional corrections)

1. **✅ DRF Pagination Compatibility**
   - Files: `src/services/assetsService.ts`, `src/services/sitesService.ts`, `src/store/app.ts`
   - Fix: Changed from `limit/offset` to `page/page_size` (DRF standard)
   - Added: `getAllComplete()` methods that follow 'next' links automatically
   - Impact: Now loads ALL assets/sites across all pages (was limited to first 50)

2. **✅ Remove Duplicate JWT Storage**
   - File: `src/services/tenantAuthService.ts:157-164`
   - Fix: Removed token storage in localStorage/tenantStorage
   - Security: Backend uses HttpOnly cookies - frontend shouldn't store JWTs
   - Impact: Eliminates XSS token exposure risk

3. **✅ Safe Logout Implementation**
   - File: `src/services/tenantAuthService.ts:175-200`
   - Fix: Changed from `localStorage.clear()` to selective key removal
   - Preserves: Consent flags, preferences, non-auth data
   - Impact: Users don't lose unrelated settings on logout

4. **✅ Guard Sensitive Logs**
   - File: `src/services/tenantAuthService.ts` (multiple lines)
   - Fix: Wrapped all `console.log` with `import.meta.env.DEV` checks
   - Impact: No tenant names, usernames, or URLs logged in production

5. **✅ Add Asset Site Selection (DOCUMENTED)**
   - Note: Requires UI changes to `AddAssetDialog.tsx`
   - Current: Uses first available site (line 263)
   - Needed: Add site selector dropdown, pass `site_id` to `mapHVACAssetToApiAsset`
   - Impact: Assets currently created in wrong site for multi-site tenants

### Migration Guide

**Using Complete Pagination:**
```typescript
// ❌ OLD (Only gets first page)
const response = await assetsService.getAll({ limit: 100 });
const assets = response.results; // Missing data if > 100 assets

// ✅ NEW (Gets ALL pages automatically)
const assets = await assetsService.getAllComplete();
// Or with filters:
const siteAssets = await assetsService.getAllComplete({ site: siteId });
```

**Authentication Service:**
```typescript
// tenantAuthService now:
// - Does NOT store tokens in localStorage/tenantStorage
// - Relies on HttpOnly cookies for authentication
// - Only stores user metadata and tenant config for UI
```

**Production Console Logs:**
```typescript
// ❌ OLD (Logs in production)
console.log('Login successful:', username);

// ✅ NEW (Only in development)
if (import.meta.env.DEV) {
  console.log('Login successful:', username);
}
```

### API Integration Checklist

**Before deploying:**
- [ ] Assets/Sites load completely (check for 50+ items)
- [ ] HttpOnly cookies contain access_token (not localStorage)
- [ ] Logout preserves theme/language preferences
- [ ] No console.log output in production builds
- [ ] Site selector in Add Asset modal (or document as known issue)

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

## 🎯 CRITICAL: MQTT Topic-Based Data Loading

### ⚠️ ALWAYS Load Sensors by Asset/Site, NOT by Device

**RULE:** When loading sensors or telemetry, **ALWAYS use the Asset/Site hierarchy** that mirrors the MQTT topic structure. **NEVER load by individual device ID** unless absolutely necessary.

#### MQTT Topic Structure (Backend)
```
tenants/{tenant_slug}/sites/{site_name}/assets/{asset_tag}/telemetry
```

**Example:**
```
tenants/umc/sites/Uberlândia Medical Center/assets/CHILLER-001/telemetry
```

#### Why This Matters (Frontend Perspective)

❌ **WRONG APPROACH (Device-centric loading):**
```typescript
// Loading sensors from ONE device only
useEffect(() => {
  devicesService.listBySite(siteId)
    .then(devices => {
      // Problem: Selects only FIRST device or ONE specific type
      const selectedDevice = devices.find(d => d.device_type === 'GATEWAY') || devices[0];
      
      // Only loads sensors from THIS device
      loadTelemetry(selectedDevice.mqtt_client_id);
      // ❌ Missing sensors from other devices!
    });
}, [siteId]);

// Result: If asset has 2 devices (old + new gateway),
// frontend shows only 4 sensors instead of 9 total
```

✅ **CORRECT APPROACH (Asset-centric loading):**
```typescript
// Loading sensors from ALL assets (which include ALL devices)
useEffect(() => {
  if (!currentSite?.id) return;
  
  // 1. Get all assets from site
  assetsService.getBySite(currentSite.id)
    .then(async (response) => {
      const assetsList = response.results;
      
      // 2. For each asset, get ALL its sensors (from ALL devices)
      const allSensorsPromises = assetsList.map(asset => 
        assetsService.getSensors(asset.id) // Returns sensors from ALL devices
          .then(apiSensors => 
            apiSensors.map(s => convertToEnhancedSensor(s, asset))
          )
          .catch(() => [])
      );
      
      // 3. Flatten all sensors from all assets
      const sensorsArrays = await Promise.all(allSensorsPromises);
      const allSensors = sensorsArrays.flat();
      
      // 4. Update store with complete dataset
      useSensorsStore.setState({ items: allSensors });
    });
}, [currentSite?.id]);

// Result: Shows ALL 9 sensors (4 from old device + 5 from new gateway)
```

#### API Endpoints to Use

✅ **CORRECT: Asset-based endpoints**
```typescript
// Get all assets from a site
GET /api/assets/?site={site_id}
assetsService.getBySite(siteId)

// Get all sensors from an asset (includes ALL devices)
GET /api/assets/{asset_id}/sensors/
assetsService.getSensors(assetId)

// Get devices from a site (for device management UI)
GET /api/sites/{site_id}/devices/
devicesService.listBySite(siteId)
```

❌ **AVOID: Device-specific endpoints for sensor lists**
```typescript
// Only use if you specifically need ONE device's sensors
GET /api/devices/{device_id}/sensors/

// Only use for device summary (not for full sensor list)
GET /api/telemetry/device/{device_id}/summary/
```

#### Implementation Pattern: SensorsPage

```typescript
// src/components/pages/SensorsPage.tsx
export const SensorsPage: React.FC = () => {
  const { currentSite } = useAppStore();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);

  // Helper: Convert backend ApiSensor to frontend EnhancedSensor
  const convertToEnhancedSensor = (sensor: any, asset: any) => {
    const isOnline = sensor.last_reading_at 
      ? (Date.now() - new Date(sensor.last_reading_at).getTime()) < 5 * 60 * 1000
      : false;
    
    return {
      id: sensor.id?.toString() || sensor.tag,
      name: sensor.tag || `Sensor ${sensor.id}`,
      tag: sensor.tag,
      status: (isOnline ? 'online' : 'offline') as 'online' | 'offline',
      equipmentId: asset?.id?.toString() || 'unknown',
      equipmentName: asset?.name || asset?.tag || 'Unknown',
      type: sensor.metric_type || 'UNKNOWN',
      unit: sensor.unit || '',
      lastReading: sensor.last_value !== null ? {
        value: sensor.last_value,
        timestamp: new Date(sensor.last_reading_at)
      } : null,
      availability: isOnline ? 95 : 0,
      lastSeenAt: sensor.last_reading_at 
        ? new Date(sensor.last_reading_at).getTime() 
        : undefined,
    };
  };

  // Load sensors from ALL assets of selected site
  useEffect(() => {
    if (!currentSite?.id) return;
    
    setIsLoadingAssets(true);
    
    assetsService.getBySite(currentSite.id)
      .then(async (response) => {
        const assetsList = response.results;
        
        // Get sensors from each asset (respects MQTT topic hierarchy)
        const allSensorsPromises = assetsList.map(asset => 
          assetsService.getSensors(asset.id)
            .then(apiSensors => 
              apiSensors.map(s => convertToEnhancedSensor(s, asset))
            )
            .catch(() => [])
        );
        
        const sensorsArrays = await Promise.all(allSensorsPromises);
        const allSensors = sensorsArrays.flat();
        
        useSensorsStore.setState({ items: allSensors });
        setLastUpdate(new Date());
      })
      .finally(() => setIsLoadingAssets(false));
  }, [currentSite?.id]);

  // Auto-refresh every 30s (same pattern)
  useEffect(() => {
    if (!currentSite?.id) return;
    
    const intervalId = setInterval(() => {
      // Same loading logic as above
      assetsService.getBySite(currentSite.id)
        .then(async (response) => {
          // ... load sensors from all assets
        });
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [currentSite?.id]);
};
```

#### Benefits of Topic-Based Loading

✅ **Complete data:** Shows ALL sensors from ALL devices of an asset  
✅ **Multi-device support:** Asset can have multiple gateways/controllers  
✅ **Hierarchical consistency:** UI mirrors MQTT topic structure (tenant → site → asset)  
✅ **Automatic updates:** New devices added via MQTT appear automatically  
✅ **No code changes:** Adding new gateway doesn't require frontend updates  
✅ **Scalable:** Handles complex multi-device scenarios

#### Common Mistakes to Avoid

❌ Loading sensors via `devicesService.listBySite()` then selecting one device  
❌ Using `devices[0]` or `devices.find(d => d.device_type === 'GATEWAY')`  
❌ Calling `loadRealTelemetry(deviceId)` when you need all asset sensors  
❌ Creating device selector dropdowns for sensor pages (load all instead)  
❌ Filtering sensors by device before displaying (show all from asset)

#### When Device-Specific Loading IS Appropriate

✅ **Device Management UI:** Showing device details, firmware, status  
✅ **Device Configuration:** Editing individual device settings  
✅ **Troubleshooting:** Debugging specific device connectivity  
✅ **Device Comparison:** Comparing readings from different devices

#### Reference Implementations

See these files for correct patterns:
- **`src/components/pages/SensorsPage.tsx`** - Asset-based sensor loading with auto-refresh
- **`src/components/pages/AssetDetailsPage.tsx`** - AssetTelemetry tab (loads by asset)
- **`src/services/assetsService.ts`** - `getBySite()` and `getSensors()` methods
- **`src/store/sensors.ts`** - SensorsStore structure

#### Testing Checklist

When implementing sensor/telemetry features:
- [ ] Does it load sensors by Asset ID, not Device ID?
- [ ] Does it show sensors from ALL devices of an asset?
- [ ] Does it respect the Site → Asset → Device → Sensor hierarchy?
- [ ] Does it handle assets with multiple devices correctly?
- [ ] Does it auto-refresh to show new sensors from new devices?
- [ ] Does the console log show "Total consolidado: X sensores de Y asset(s)"?

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

## 🔐 Authentication Services (Updated Nov 2025)

### ⚠️ Service Migration Status

**✅ RECOMMENDED:** `tenantAuthService` (Multi-tenant aware)  
**⚠️ DEPRECATED:** `auth.service.ts` (Legacy, single-tenant)

### TenantAuthService API

**File:** `src/services/tenantAuthService.ts`

**Features:**
- ✅ Automatic tenant detection from JWT
- ✅ Reconfigures API base URL per tenant
- ✅ Isolated token storage (`tenantStorage`)
- ✅ Dynamic branding support
- ✅ All CRUD operations for user management

**Available Methods:**

```typescript
import { tenantAuthService } from '@/services/tenantAuthService';

// Authentication
await tenantAuthService.login(credentials);
await tenantAuthService.logout();
tenantAuthService.isAuthenticated();
tenantAuthService.getCurrentUser();
tenantAuthService.getAccessToken();
tenantAuthService.getRefreshToken();

// User Management (Added Nov 2025)
await tenantAuthService.register(data);           // ✅ NEW
await tenantAuthService.updateProfile(data);      // ✅ NEW
await tenantAuthService.uploadAvatar(file);       // ✅ NEW
await tenantAuthService.removeAvatar();           // ✅ NEW
await tenantAuthService.changePassword(data);     // ✅ NEW
```

**Example Usage:**

```typescript
// Login (auto-configures tenant)
const response = await tenantAuthService.login({
  username_or_email: 'user@example.com',
  password: 'password123'
});

// Register new user
const user = await tenantAuthService.register({
  username: 'newuser',
  email: 'newuser@example.com',
  password: 'password123',
  password_confirm: 'password123',
  first_name: 'John',
  last_name: 'Doe'
});

// Update profile
const updatedUser = await tenantAuthService.updateProfile({
  first_name: 'Jane',
  timezone: 'America/Sao_Paulo',
  time_format: '24h'
});

// Upload avatar
const userWithAvatar = await tenantAuthService.uploadAvatar(fileBlob);
```

### Legacy Auth Service (DEPRECATED)

**⚠️ DO NOT USE FOR NEW CODE**

**File:** `src/services/auth.service.ts`

- Still exists for backward compatibility
- Registration method updated to use `tenantStorage`
- All new features should use `tenantAuthService`
- Will be removed in future version

**Migration Path:**

```typescript
// ❌ OLD (Don't use)
import { authService } from '@/services/auth.service';

// ✅ NEW (Use this)
import { tenantAuthService } from '@/services/tenantAuthService';
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
