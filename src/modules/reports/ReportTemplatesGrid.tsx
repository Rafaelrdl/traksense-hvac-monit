import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { reportTemplates, type ReportTemplate } from "./templates";

interface ReportTemplatesGridProps {
  onRequest: (template: ReportTemplate) => void;
}

export function ReportTemplatesGrid({ onRequest }: ReportTemplatesGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return reportTemplates;
    
    return reportTemplates.filter(template =>
      template.name.toLowerCase().includes(query) ||
      template.description.toLowerCase().includes(query) ||
      (template.tags ?? []).some(tag => tag.toLowerCase().includes(query))
    );
  }, [searchQuery]);

  const getOutputColor = (output: string) => {
    switch (output) {
      case 'PDF':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'CSV':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'XLSX':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative max-w-sm ml-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, descrição ou tag..."
            className="pl-9"
          />
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nenhum modelo encontrado
          </h3>
          <p className="text-muted-foreground">
            Tente uma busca diferente ou solicite um relatório personalizado
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-base leading-tight">
                  {template.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {template.description}
                </p>
                
                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {template.outputs && template.outputs.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Formatos disponíveis:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.outputs.map((output) => (
                        <span
                          key={output}
                          className={`text-xs px-2 py-1 rounded-md font-medium ${getOutputColor(output)}`}
                        >
                          {output}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => onRequest(template)}
                    className="w-full"
                  >
                    Solicitar este modelo
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center mt-6 p-3 bg-muted/30 rounded-md">
        <strong>Dica:</strong> Todos os modelos podem ser personalizados conforme suas necessidades específicas. 
        Use o botão "Solicitar relatórios personalizados" para requisitos únicos.
      </div>
    </section>
  );
}