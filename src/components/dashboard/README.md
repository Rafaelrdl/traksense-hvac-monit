# Custom Dashboard System

This TrakSense dashboard system provides a flexible, drag-and-drop interface for creating personalized monitoring layouts.

## Features

### 🎛️ Drag & Drop Interface
- **Reorder widgets**: Drag widgets to reorganize your dashboard layout
- **Visual feedback**: See real-time preview while dragging
- **Snap to grid**: Automatic alignment to maintain clean layouts

### 🎨 Widget Management
- **11+ Widget types**: KPIs, charts, gauges, tables and heatmaps
- **Multiple sizes**: Small (1 col), Medium (3 cols), Large (6 cols)
- **Real-time data**: All widgets display live HVAC system data
- **Configurable**: Customize titles and sizes for each widget

### 💾 Layout Persistence
- **Multiple layouts**: Create unlimited custom dashboard layouts
- **Template system**: Copy existing layouts as starting points
- **Auto-save**: Changes persist automatically
- **Layout switching**: Quick switch between different dashboard views

### 🔧 Edit Mode
- **Protected editing**: Toggle edit mode to prevent accidental changes
- **Widget controls**: Remove, configure, or move widgets easily
- **Add widgets**: Browse widget library and add new monitoring components
- **Visual indicators**: Clear visual feedback for editable elements

## Available Widgets

### Key Performance Indicators (KPIs)
- **Uptime Devices**: Device availability percentage
- **Active Alerts**: Number of current system alerts
- **Energy Consumption**: Daily power usage totals
- **HVAC Health**: Average system health scores
- **MTBF**: Mean time between failures
- **MTTR**: Mean time to repair

### Charts & Visualizations
- **Temperature Trends**: Real-time temperature monitoring with setpoints
- **Energy Consumption**: Hourly power usage bar charts
- **Filter Health Gauge**: Visual filter condition indicator
- **Alert Heatmap**: Time-based alert density visualization

### Data Tables
- **Active Alerts**: Sortable table of current system alerts with severity indicators

## How to Use

### Basic Navigation
1. Click "Dashboard Custom" in the sidebar
2. Select your preferred layout from the dropdown
3. Use the time range selector to adjust data periods

### Creating Custom Layouts
1. Click "Manage" next to the layout selector
2. Enter a new layout name
3. Optionally copy from an existing layout
4. Click "Create Layout"

### Editing Dashboards
1. Toggle "Edit Mode" switch in the header
2. **Add widgets**: Click "Add Widget" to browse available components
3. **Move widgets**: Drag the grip handle to reposition
4. **Configure widgets**: Click the settings icon to customize
5. **Remove widgets**: Click the X icon to delete
6. Click "Save" or toggle edit mode off to finish

### Managing Layouts
- **Switch layouts**: Use the dropdown to change active layout
- **Rename**: Click the edit icon in the manage dialog
- **Copy**: Create duplicates with the copy icon
- **Delete**: Remove layouts (except default) with the trash icon

## Technical Architecture

### Components
- `CustomDashboard`: Main dashboard container with drag-and-drop context
- `DraggableWidget`: Individual widget wrapper with sort functionality
- `WidgetPalette`: Widget selection and addition interface
- `LayoutManager`: Layout CRUD operations interface
- `WidgetConfig`: Individual widget configuration dialog

### State Management
- **Dashboard Store**: Zustand store managing layouts and widgets
- **App Store**: Global application state for HVAC data
- **Persistent Storage**: Layouts saved to localStorage

### Drag & Drop
- **@dnd-kit**: Modern, accessible drag-and-drop library
- **Sortable widgets**: Grid-based sorting with collision detection
- **Touch support**: Works on mobile and tablet devices

## Data Integration

All widgets display real-time data from the HVAC simulation engine:
- **Temperature sensors**: Supply, return, and setpoint values
- **Energy monitoring**: Power consumption and efficiency metrics
- **System health**: Calculated health scores and maintenance indicators
- **Alert management**: Active alerts with severity and timestamps

## Responsive Design

- **Desktop-first**: Optimized for large monitoring displays
- **Grid system**: Responsive 6-column grid layout
- **Mobile adaptation**: Widgets stack on smaller screens
- **Touch-friendly**: Large touch targets and gestures support