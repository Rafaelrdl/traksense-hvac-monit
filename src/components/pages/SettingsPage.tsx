import React, { useState } from 'react';
import { Settings, Thermometer, Globe, Gauge, Palette, Save } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    temperatureUnit: 'celsius',
    timezone: 'America/Sao_Paulo',
    thresholds: {
      filterPressure: 250,
      vibrationLimit: 5,
      temperatureDeviation: 3
    },
    theme: 'light',
    notifications: {
      email: true,
      browser: true,
      sms: false
    }
  });

  const handleSave = () => {
    // Mock save functionality
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">
            Personalização do sistema e parâmetros operacionais
          </p>
        </div>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </div>

      {/* Units Configuration */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Thermometer className="w-5 h-5" />
          <span>Unidades de Medida</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Temperatura</label>
            <select
              value={settings.temperatureUnit}
              onChange={(e) => setSettings({...settings, temperatureUnit: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Vazão de Ar</label>
            <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
              <option value="m3h">m³/h</option>
              <option value="cfm">CFM</option>
            </select>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>Configurações Regionais</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Fuso Horário</label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({...settings, timezone: e.target.value})}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            >
              <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
              <option value="America/New_York">Nova York (UTC-5)</option>
              <option value="Europe/London">Londres (UTC+0)</option>
              <option value="Asia/Tokyo">Tóquio (UTC+9)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Formato de Data</label>
            <select className="w-full px-3 py-2 border border-input rounded-lg bg-background">
              <option value="dd/mm/yyyy">DD/MM/AAAA</option>
              <option value="mm/dd/yyyy">MM/DD/AAAA</option>
              <option value="yyyy-mm-dd">AAAA-MM-DD</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threshold Settings */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Gauge className="w-5 h-5" />
          <span>Limiares Padrão</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Pressão do Filtro (Pa) - Limite para Alerta
            </label>
            <input
              type="number"
              value={settings.thresholds.filterPressure}
              onChange={(e) => setSettings({
                ...settings,
                thresholds: {...settings.thresholds, filterPressure: parseInt(e.target.value)}
              })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Vibração (mm/s) - Limite para Alerta
            </label>
            <input
              type="number"
              value={settings.thresholds.vibrationLimit}
              onChange={(e) => setSettings({
                ...settings,
                thresholds: {...settings.thresholds, vibrationLimit: parseInt(e.target.value)}
              })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Desvio de Temperatura (°C) - Limite para Alerta
            </label>
            <input
              type="number"
              value={settings.thresholds.temperatureDeviation}
              onChange={(e) => setSettings({
                ...settings,
                thresholds: {...settings.thresholds, temperatureDeviation: parseInt(e.target.value)}
              })}
              className="w-full px-3 py-2 border border-input rounded-lg bg-background"
            />
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Palette className="w-5 h-5" />
          <span>Aparência</span>
        </h3>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tema</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                className="border-gray-300"
              />
              <span>Claro</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                className="border-gray-300"
              />
              <span>Escuro</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="theme"
                value="auto"
                checked={settings.theme === 'auto'}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                className="border-gray-300"
              />
              <span>Automático</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Notificações</span>
        </h3>
        
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.email}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, email: e.target.checked}
              })}
              className="border-gray-300"
            />
            <span>Notificações por Email</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.browser}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, browser: e.target.checked}
              })}
              className="border-gray-300"
            />
            <span>Notificações do Navegador</span>
          </label>
          
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={settings.notifications.sms}
              onChange={(e) => setSettings({
                ...settings,
                notifications: {...settings.notifications, sms: e.target.checked}
              })}
              className="border-gray-300"
            />
            <span>Notificações por SMS</span>
          </label>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Informações do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Versão:</span>
            <span className="ml-2 font-medium">TrakSense v1.0.0</span>
          </div>
          <div>
            <span className="text-muted-foreground">Última Atualização:</span>
            <span className="ml-2 font-medium">15/01/2024</span>
          </div>
          <div>
            <span className="text-muted-foreground">Sensores Conectados:</span>
            <span className="ml-2 font-medium">33</span>
          </div>
          <div>
            <span className="text-muted-foreground">Uptime do Sistema:</span>
            <span className="ml-2 font-medium">15d 8h 32m</span>
          </div>
        </div>
      </div>
    </div>
  );
};