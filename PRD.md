# TrakSense - IoT HVAC Monitoring Platform

TrakSense transforms HVAC data into actionable decisions with real-time visibility, predictive alerts, and asset lifecycle insights for critical systems in hospitals, industry, shopping centers, and data centers.

**Experience Qualities**: 
1. Professional - Clean, technical interface that builds confidence in critical system monitoring
2. Responsive - Real-time updates and immediate feedback for operational awareness  
3. Insightful - Clear data visualization that reveals patterns and actionable intelligence

**Complexity Level**: Complex Application (advanced functionality, multiple dashboards)
- Multi-module platform with sophisticated data visualization, real-time simulation, and comprehensive HVAC domain modeling

## Essential Features

### Real-time Dashboard Overview
- **Functionality**: Live KPI monitoring, temperature trends, energy consumption tracking
- **Purpose**: Immediate operational awareness and system health assessment
- **Trigger**: Landing page access, automatic data refresh every 3 seconds
- **Progression**: Load → Display KPIs → Update charts → Show active alerts → Refresh cycle
- **Success**: Users can assess overall system health within 5 seconds

### Asset Management & Details  
- **Functionality**: HVAC equipment catalog with individual asset performance analysis
- **Purpose**: Deep-dive monitoring of individual chillers, AHUs, and VRF units
- **Trigger**: Navigate to Assets page or click asset from dashboard
- **Progression**: List view → Search/filter → Select asset → Detail view → Time series analysis
- **Success**: Users can identify underperforming assets and maintenance needs

### Sensor Telemetry Monitoring
- **Functionality**: Real-time and historical sensor data with availability tracking
- **Purpose**: Monitor temperature, pressure, electrical, and mechanical parameters
- **Trigger**: Access Sensors page or drill-down from asset details
- **Progression**: Sensor catalog → Select sensor → View trends → Check availability → Export data
- **Success**: Complete visibility into sensor health and data quality

### Alert Management System
- **Functionality**: Rule-based alerting with severity classification and acknowledgment
- **Purpose**: Proactive notification of system anomalies and maintenance needs
- **Trigger**: Automatic rule evaluation or manual alert creation
- **Progression**: Rule triggers → Alert generated → Notification → Investigation → Acknowledgment
- **Success**: Critical issues identified within defined thresholds with minimal false positives

### Performance Analytics & Reports
- **Functionality**: Historical analysis, energy efficiency calculations, predictive insights
- **Purpose**: Optimize system performance and plan maintenance schedules
- **Trigger**: Navigate to Reports or schedule automated generation
- **Progression**: Select timeframe → Choose metrics → Generate analysis → Export results
- **Success**: Actionable insights for energy optimization and predictive maintenance

## Edge Case Handling
- **No Data States**: Friendly messages with guidance when sensors offline or data unavailable
- **Simulation Failures**: Graceful fallback to static data if real-time simulation encounters errors  
- **Network Issues**: Cached data display with clear offline indicators
- **Invalid Time Ranges**: Auto-correction to valid periods with user notification
- **Missing Assets**: Placeholder content with instructions for system configuration

## Design Direction
The interface should feel authoritative and precise - like a mission-critical control room interface. Clean, technical aesthetics with purposeful use of the teal brand color to indicate system health and operational status. Rich interface with comprehensive data visualization while maintaining clarity and preventing information overload.

## Color Selection
Complementary palette using teal and warm accents to create technical authority with human accessibility.

- **Primary Color**: Deep Teal `oklch(0.46 0.12 194)` - Communicates technical precision, reliability, and system health
- **Secondary Colors**: Medium Teal `oklch(0.52 0.09 194)` for secondary actions, Light Teal `oklch(0.78 0.05 194)` for backgrounds  
- **Accent Color**: Warm Amber `oklch(0.78 0.15 85)` - Attention-grabbing for warnings and important CTAs
- **Foreground/Background Pairings**: 
  - Background Light `oklch(0.98 0.01 194)`: Dark text `oklch(0.15 0.01 194)` - Ratio 11.2:1 ✓
  - Primary Teal: White text `oklch(0.99 0 0)` - Ratio 8.4:1 ✓  
  - Accent Amber: Dark text `oklch(0.15 0.01 194)` - Ratio 4.8:1 ✓
  - Card `oklch(1 0 0)`: Primary text `oklch(0.15 0.01 194)` - Ratio 15.1:1 ✓

## Font Selection
Inter typeface conveys technical precision while maintaining excellent readability across data-dense interfaces and various screen sizes.

- **Typographic Hierarchy**: 
  - H1 (Page Titles): Inter Bold/32px/tight tracking
  - H2 (Section Headers): Inter Semibold/24px/normal tracking  
  - H3 (Card Titles): Inter Medium/20px/normal tracking
  - Body (Data/Content): Inter Regular/16px/normal tracking
  - Caption (Labels/Meta): Inter Medium/14px/normal tracking

## Animations
Subtle, purposeful animations that reinforce the real-time nature of the monitoring platform while maintaining professional credibility.

- **Purposeful Meaning**: Gentle pulsing for live data updates, smooth transitions for chart updates, subtle loading states for data fetching
- **Hierarchy of Movement**: KPI counters animate on value changes, chart data transitions smoothly, alert notifications slide in from top-right

## Component Selection
- **Components**: Cards for KPIs and metrics, Tabs for multi-view layouts, Tables for sensor catalogs, Dialogs for detailed views, Progress indicators for health scores, Badges for status indicators
- **Customizations**: Custom ECharts components for HVAC-specific visualizations, specialized gauge components for filter health, heatmap components for alert density
- **States**: Interactive elements show hover states with subtle teal highlights, loading states with skeleton placeholders, error states with recovery guidance
- **Icon Selection**: Lucide icons for technical concepts (thermometer, zap, settings), custom HVAC equipment icons for asset types
- **Spacing**: Consistent 8pt grid system using Tailwind spacing scale (space-2, space-4, space-6, space-8)
- **Mobile**: Desktop-first responsive design with stacked layouts on smaller screens, collapsible sidebar, simplified chart interactions on touch devices