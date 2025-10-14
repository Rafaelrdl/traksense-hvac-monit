export type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  outputs?: Array<"PDF" | "CSV" | "XLSX">;
  sampleImage?: string; // opcional: preview estático
};

export const reportTemplates: ReportTemplate[] = [
  {
    id: "consumo-mensal",
    name: "Consumo mensal por unidade",
    description: "Análise de consumo energético por unidade e zona, comparativo mês a mês com identificação de tendências e oportunidades de otimização.",
    tags: ["energia", "kWh", "consumo", "mensal"],
    outputs: ["PDF", "CSV"]
  },
  {
    id: "custo-zona",
    name: "Alocação de custos por zona",
    description: "Rateio detalhado de custos operacionais por zona térmica e equipamento, incluindo análise de eficiência por área.",
    tags: ["custos", "zona", "rateio", "financeiro"],
    outputs: ["PDF", "XLSX"]
  },
  {
    id: "manutencao-preditiva",
    name: "Manutenção preditiva",
    description: "Relatório de eventos críticos, anomalias detectadas e recomendações de manutenção baseadas em análise preditiva.",
    tags: ["manutenção", "alertas", "preditiva", "anomalias"],
    outputs: ["PDF"]
  },
  {
    id: "performance-hvac",
    name: "Performance de equipamentos HVAC",
    description: "Análise detalhada de performance de AHUs, Chillers, VRFs e demais equipamentos com métricas de eficiência.",
    tags: ["performance", "eficiência", "equipamentos"],
    outputs: ["PDF", "CSV", "XLSX"]
  },
  {
    id: "qualidade-ar",
    name: "Qualidade do ar interno",
    description: "Monitoramento da qualidade do ar interno com métricas de temperatura, umidade, CO2 e partículas.",
    tags: ["qualidade", "ar", "temperatura", "umidade", "CO2"],
    outputs: ["PDF", "CSV"]
  },
  {
    id: "uptime-disponibilidade",
    name: "Uptime e disponibilidade",
    description: "Relatório de disponibilidade dos sistemas HVAC, tempo de inatividade e análise de confiabilidade operacional.",
    tags: ["uptime", "disponibilidade", "confiabilidade"],
    outputs: ["PDF", "XLSX"]
  },
  {
    id: "benchmark-setores",
    name: "Benchmark entre setores",
    description: "Comparativo de performance entre diferentes setores ou unidades da organização com ranking e melhores práticas.",
    tags: ["benchmark", "comparativo", "setores", "ranking"],
    outputs: ["PDF", "XLSX"]
  },
  {
    id: "tendencias-consumo",
    name: "Tendências de consumo energético",
    description: "Análise histórica de tendências de consumo com projeções futuras e identificação de padrões sazonais.",
    tags: ["tendências", "projeção", "histórico", "sazonal"],
    outputs: ["PDF", "CSV"]
  },
  {
    id: "alertas-criticos",
    name: "Histórico de alertas críticos",
    description: "Compilação detalhada de todos os alertas críticos do período, causas raiz e ações corretivas aplicadas.",
    tags: ["alertas", "críticos", "histórico", "ações"],
    outputs: ["PDF", "CSV"]
  }
];