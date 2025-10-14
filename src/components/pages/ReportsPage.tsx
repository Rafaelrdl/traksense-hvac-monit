import React, { useState } from 'react';
import { Mail, FileText, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequestReportMiniModal } from '@/modules/reports/RequestReportMiniModal';
import { ReportTemplatesGrid } from '@/modules/reports/ReportTemplatesGrid';
import { MyReportsTab } from '@/modules/reports/MyReportsTab';
import type { ReportTemplate } from '@/modules/reports/templates';

export const ReportsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('my-reports');

  const handleRequestReport = (template?: ReportTemplate) => {
    if (template) {
      setSelectedTemplate(template);
    } else {
      setSelectedTemplate(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios customizados e explore modelos predefinidos
          </p>
        </div>
        {activeTab === 'templates' && (
          <Button 
            onClick={() => handleRequestReport()} 
            className="flex items-center gap-2 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Solicitar relatórios personalizados
          </Button>
        )}
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-fit">
          <TabsTrigger value="my-reports" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Meus Relatórios</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            <span>Modelos</span>
          </TabsTrigger>
        </TabsList>

        {/* My Reports Tab */}
        <TabsContent value="my-reports" className="space-y-6">
          <MyReportsTab onRequestCustomReport={() => handleRequestReport()} />
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Modelos de Relatório</h2>
              <p className="text-sm text-muted-foreground">
                Explore nossos modelos predefinidos e solicite relatórios baseados neles
              </p>
            </div>
            <ReportTemplatesGrid onRequest={handleRequestReport} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Request Report Modal */}
      <RequestReportMiniModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
};