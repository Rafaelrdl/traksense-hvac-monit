# Implementação Multi-Parâmetro para Regras de Alerta

## 📋 Resumo Executivo

Implementação completa do sistema de **múltiplos parâmetros por regra**, permitindo que uma única regra monitore vários sensores de um equipamento, cada um com configurações independentes de operador, threshold, duração, severidade e **mensagem personalizada**.

**Data**: ${new Date().toISOString().split('T')[0]}  
**Status**: ✅ Frontend Completo | ⏳ Backend Pendente

---

## 🎯 Objetivo

Permitir que o usuário concentre o monitoramento de múltiplos parâmetros de um mesmo equipamento em uma única regra, ao invés de criar N regras separadas.

### Exemplo Prático

**Antes** (sistema antigo):
- Regra 1: "Chiller CH-01 - Alta Temperatura" → monitora apenas temperatura
- Regra 2: "Chiller CH-01 - Alta Pressão" → monitora apenas pressão
- Regra 3: "Chiller CH-01 - Baixo Fluxo" → monitora apenas fluxo

**Depois** (novo sistema):
- Regra 1: "Chiller CH-01 - Monitoramento Completo"
  - Parâmetro 1: Temperatura > 25°C (CRITICAL, 5min) → "Temperatura crítica: {value}°C"
  - Parâmetro 2: Pressão > 300 PSI (HIGH, 10min) → "Pressão elevada: {value} PSI"
  - Parâmetro 3: Fluxo < 50 L/min (MEDIUM, 15min) → "Fluxo reduzido: {value} L/min"

---

## 📦 Arquivos Modificados/Criados

### ✅ 1. Types (`src/services/api/alerts.ts`)

**Criação da interface `RuleParameter`:**
```typescript
export interface RuleParameter {
  id?: number;
  parameter_key: string;        // Ex: "sensor_123"
  variable_key: string;          // Ex: "avg", "current"
  operator: Operator;            // >, >=, <, <=, ==, !=
  threshold: number;             // Valor limite
  duration: number;              // Minutos de cooldown
  severity: Severity;            // CRITICAL, HIGH, MEDIUM, LOW
  message_template: string;      // 🆕 Mensagem personalizada
  unit?: string;                 // Ex: "°C", "PSI"
}
```

**Modificação da interface `Rule`:**
```typescript
export interface Rule {
  // ... campos existentes ...
  
  // 🆕 NOVO: Array de parâmetros
  parameters: RuleParameter[];
  
  // DEPRECATED: Campos antigos (mantidos para compatibilidade)
  parameter_key?: string;
  operator?: Operator;
  threshold?: number;
  // ...
}
```

**Modificação de `CreateRuleRequest`:**
```typescript
export interface CreateRuleRequest {
  name: string;
  description: string;
  equipment: number;
  actions: NotificationAction[];
  enabled?: boolean;
  
  // 🆕 NOVO FORMATO: Array de parâmetros
  parameters?: RuleParameter[];
  
  // FORMATO ANTIGO (mantido para compatibilidade)
  parameter_key?: string;
  operator?: Operator;
  threshold?: number;
  duration?: number;
  severity?: Severity;
}
```

---

### ✅ 2. Novo Modal (`src/components/alerts/AddRuleModalMultiParam.tsx`)

**Componente completamente redesenhado com:**

#### Estados:
```typescript
// Básicos da regra
const [equipmentId, setEquipmentId] = useState<string>('');
const [ruleName, setRuleName] = useState('');
const [ruleDescription, setRuleDescription] = useState('');
const [actions, setActions] = useState<NotificationAction[]>(['IN_APP']);

// 🆕 Array de parâmetros (múltiplos)
const [parameters, setParameters] = useState<RuleParameter[]>([]);

// Parâmetros disponíveis do equipamento
const [availableParameters, setAvailableParameters] = useState<Array<{
  key: string; 
  label: string; 
  type: string;
  sensorId: number;
  sensorTag: string;
}>>([]);
```

#### Funcionalidades Principais:

**1. Adicionar Parâmetro**
```typescript
const addParameter = () => {
  const newParam: RuleParameter = {
    parameter_key: '',
    variable_key: '',
    operator: '>',
    threshold: 0,
    duration: 5,
    severity: 'MEDIUM',
    message_template: DEFAULT_MESSAGE_TEMPLATE,
  };
  setParameters([...parameters, newParam]);
};
```

**2. Remover Parâmetro**
```typescript
const removeParameter = (index: number) => {
  setParameters(parameters.filter((_, i) => i !== index));
};
```

**3. Atualizar Parâmetro Individual**
```typescript
const updateParameter = (index: number, field: keyof RuleParameter, value: any) => {
  const updated = [...parameters];
  updated[index] = { ...updated[index], [field]: value };
  setParameters(updated);
};
```

**4. Conversão de Regras Antigas**
```typescript
// Se é regra antiga (campo único), converter para array
if (editingRule.parameter_key) {
  setParameters([{
    parameter_key: editingRule.parameter_key,
    variable_key: editingRule.variable_key || '',
    operator: editingRule.operator!,
    threshold: editingRule.threshold!,
    duration: editingRule.duration!,
    severity: convertSeverity(editingRule.severity!),
    message_template: DEFAULT_MESSAGE_TEMPLATE,
    unit: editingRule.unit,
  }]);
}
```

#### UI Components:

**1. Card de Parâmetro** (repetido para cada parâmetro):
```tsx
<Card>
  <CardHeader>
    <CardTitle>Parâmetro {index + 1}</CardTitle>
    <Button onClick={() => removeParameter(index)}>
      <Trash2 />
    </Button>
  </CardHeader>
  <CardContent>
    {/* Seletor de Sensor */}
    <Select value={param.parameter_key} onChange={...}>
      {availableParameters.map(...)}
    </Select>
    
    {/* Operador + Threshold + Duração */}
    <div className="grid grid-cols-3 gap-3">
      <Select value={param.operator} />
      <Input type="number" value={param.threshold} />
      <Input type="number" value={param.duration} />
    </div>
    
    {/* Severidade */}
    <div className="grid grid-cols-4 gap-2">
      {SEVERITIES.map(sev => (
        <button onClick={() => updateParameter(index, 'severity', sev.value)}>
          {sev.label}
        </button>
      ))}
    </div>
    
    {/* 🆕 Mensagem Personalizada */}
    <Textarea
      value={param.message_template}
      onChange={(e) => updateParameter(index, 'message_template', e.target.value)}
      placeholder="Temperatura de {value}°C acima do limite de {threshold}°C"
    />
    <p className="text-xs">
      Variáveis: {"{sensor}"}, {"{value}"}, {"{threshold}"}, {"{operator}"}, {"{unit}"}
    </p>
  </CardContent>
</Card>
```

**2. Botão Adicionar Parâmetro**
```tsx
<Button onClick={addParameter} disabled={!equipmentId}>
  <Plus /> Adicionar Parâmetro
</Button>
```

**3. Validações**
- Nome da regra obrigatório
- Equipamento obrigatório
- Pelo menos 1 parâmetro
- Cada parâmetro deve ter sensor selecionado
- Cada parâmetro deve ter mensagem preenchida
- Pelo menos 1 ação selecionada

---

### ✅ 3. Integração (`AlertsPage.tsx` e `RuleBuilder.tsx`)

**Substituição do modal antigo:**
```typescript
// ANTES
import { AddRuleModal } from './AddRuleModal';
<AddRuleModal open={isOpen} onOpenChange={setIsOpen} />

// DEPOIS
import { AddRuleModalMultiParam } from './AddRuleModalMultiParam';
<AddRuleModalMultiParam open={isOpen} onOpenChange={setIsOpen} />
```

---

## 🎨 Constantes e Configurações

### Template Padrão de Mensagem
```typescript
const DEFAULT_MESSAGE_TEMPLATE = 
  "{sensor} está {operator} {threshold}{unit} (valor atual: {value}{unit})";
```

### Severidades
```typescript
const SEVERITIES = [
  { value: 'CRITICAL', label: 'Crítico', color: 'bg-red-100 text-red-800' },
  { value: 'HIGH', label: 'Alto', color: 'bg-orange-100 text-orange-800' },
  { value: 'MEDIUM', label: 'Médio', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'LOW', label: 'Baixo', color: 'bg-blue-100 text-blue-800' },
];
```

### Operadores
```typescript
const OPERATORS = [
  { value: '>', label: 'Maior que' },
  { value: '>=', label: 'Maior ou igual' },
  { value: '<', label: 'Menor que' },
  { value: '<=', label: 'Menor ou igual' },
  { value: '==', label: 'Igual' },
  { value: '!=', label: 'Diferente' },
];
```

---

## 🔄 Fluxo de Uso

### Criando Nova Regra Multi-Parâmetro

1. **Usuário clica** em "Criar Regra"
2. **Preenche informações básicas:**
   - Nome: "Chiller CH-01 - Monitoramento Completo"
   - Equipamento: "CH-01 (Chiller)"
   - Descrição: "Monitoramento de temperatura, pressão e fluxo"

3. **Clica em "Adicionar Parâmetro"** (repete 3 vezes)

4. **Parâmetro 1 - Temperatura:**
   - Sensor: "TEMP-001 - Temperature"
   - Operador: "Maior que"
   - Valor Limite: 25
   - Duração: 5 minutos
   - Severidade: CRITICAL
   - Mensagem: "🔥 Temperatura crítica: {value}°C (limite: {threshold}°C)"

5. **Parâmetro 2 - Pressão:**
   - Sensor: "PRESS-001 - Pressure"
   - Operador: "Maior que"
   - Valor Limite: 300
   - Duração: 10 minutos
   - Severidade: HIGH
   - Mensagem: "⚠️ Pressão elevada: {value} PSI (limite: {threshold} PSI)"

6. **Parâmetro 3 - Fluxo:**
   - Sensor: "FLOW-001 - Flow Rate"
   - Operador: "Menor que"
   - Valor Limite: 50
   - Duração: 15 minutos
   - Severidade: MEDIUM
   - Mensagem: "💧 Fluxo reduzido: {value} L/min (mínimo: {threshold} L/min)"

7. **Seleciona ações:** EMAIL, IN_APP, SMS

8. **Clica em "Criar Regra"**

9. **Sistema valida** e envia para backend:
```json
{
  "name": "Chiller CH-01 - Monitoramento Completo",
  "description": "Monitoramento de temperatura, pressão e fluxo",
  "equipment": 123,
  "parameters": [
    {
      "parameter_key": "sensor_456",
      "operator": ">",
      "threshold": 25,
      "duration": 5,
      "severity": "Critical",
      "message_template": "🔥 Temperatura crítica: {value}°C (limite: {threshold}°C)"
    },
    {
      "parameter_key": "sensor_457",
      "operator": ">",
      "threshold": 300,
      "duration": 10,
      "severity": "High",
      "message_template": "⚠️ Pressão elevada: {value} PSI (limite: {threshold} PSI)"
    },
    {
      "parameter_key": "sensor_458",
      "operator": "<",
      "threshold": 50,
      "duration": 15,
      "severity": "Medium",
      "message_template": "💧 Fluxo reduzido: {value} L/min (mínimo: {threshold} L/min)"
    }
  ],
  "actions": ["EMAIL", "IN_APP", "SMS"],
  "enabled": true
}
```

---

### Editando Regra Existente

**Regra Antiga (single-parameter):**
- Sistema detecta ausência de `parameters[]`
- Converte campos antigos para array com 1 item
- Usuário pode adicionar mais parâmetros
- Salva no novo formato

**Regra Nova (multi-parameter):**
- Carrega array de parâmetros
- Renderiza card para cada parâmetro
- Permite adicionar/remover parâmetros
- Salva no novo formato

---

## 🚧 Trabalho Pendente - BACKEND

### 1. Models Django (`traksense-backend/apps/alerts/models.py`)

**Criar novo model `RuleParameter`:**
```python
class RuleParameter(models.Model):
    """Parâmetro individual de uma regra multi-parâmetro"""
    
    rule = models.ForeignKey(
        'Rule',
        on_delete=models.CASCADE,
        related_name='parameters'
    )
    parameter_key = models.CharField(max_length=100)  # sensor_123
    variable_key = models.CharField(max_length=50, default='current')
    operator = models.CharField(
        max_length=2,
        choices=[
            ('>', 'Maior que'),
            ('>=', 'Maior ou igual'),
            ('<', 'Menor que'),
            ('<=', 'Menor ou igual'),
            ('==', 'Igual'),
            ('!=', 'Diferente'),
        ]
    )
    threshold = models.FloatField()
    duration = models.IntegerField(default=5)  # minutos
    severity = models.CharField(
        max_length=20,
        choices=[
            ('Critical', 'Crítico'),
            ('High', 'Alto'),
            ('Medium', 'Médio'),
            ('Low', 'Baixo'),
        ]
    )
    message_template = models.TextField()  # 🆕 Mensagem personalizada
    unit = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rule_parameters'
        ordering = ['id']
    
    def __str__(self):
        return f"{self.rule.name} - {self.parameter_key}"
```

**Modificar model `Rule`:**
```python
class Rule(models.Model):
    # ... campos existentes ...
    
    # DEPRECATED: Manter para compatibilidade com regras antigas
    parameter_key = models.CharField(max_length=100, blank=True, null=True)
    operator = models.CharField(max_length=2, blank=True, null=True)
    threshold = models.FloatField(blank=True, null=True)
    duration = models.IntegerField(blank=True, null=True)
    severity = models.CharField(max_length=20, blank=True, null=True)
    
    # Novos campos virão de RuleParameter via related_name='parameters'
```

### 2. Serializers (`traksense-backend/apps/alerts/serializers.py`)

```python
class RuleParameterSerializer(serializers.ModelSerializer):
    class Meta:
        model = RuleParameter
        fields = [
            'id',
            'parameter_key',
            'variable_key',
            'operator',
            'threshold',
            'duration',
            'severity',
            'message_template',
            'unit',
        ]

class RuleSerializer(serializers.ModelSerializer):
    parameters = RuleParameterSerializer(many=True, required=False)
    
    class Meta:
        model = Rule
        fields = [
            'id', 'name', 'description', 'equipment', 
            'actions', 'enabled', 'created_at', 'updated_at',
            'parameters',  # 🆕 NOVO
            # Campos deprecated mantidos para leitura
            'parameter_key', 'operator', 'threshold', 'duration', 'severity'
        ]
    
    def create(self, validated_data):
        parameters_data = validated_data.pop('parameters', [])
        rule = Rule.objects.create(**validated_data)
        
        # Criar parâmetros associados
        for param_data in parameters_data:
            RuleParameter.objects.create(rule=rule, **param_data)
        
        return rule
    
    def update(self, instance, validated_data):
        parameters_data = validated_data.pop('parameters', None)
        
        # Atualizar campos da regra
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Se parameters foi enviado, substituir todos
        if parameters_data is not None:
            instance.parameters.all().delete()
            for param_data in parameters_data:
                RuleParameter.objects.create(rule=instance, **param_data)
        
        return instance
```

### 3. Migration

```bash
python manage.py makemigrations alerts
python manage.py migrate alerts
```

### 4. Celery Task - Avaliação de Regras (`tasks.py`)

**Modificar `evaluate_rules_task` para iterar sobre parâmetros:**

```python
@shared_task
def evaluate_rules_task():
    """Avalia todas as regras ativas"""
    
    rules = Rule.objects.filter(enabled=True)
    
    for rule in rules:
        # Se é regra antiga (sem parameters)
        if rule.parameters.count() == 0:
            evaluate_single_parameter_rule(rule)
        else:
            # Regra nova: avaliar cada parâmetro
            for param in rule.parameters.all():
                evaluate_rule_parameter(rule, param)

def evaluate_rule_parameter(rule: Rule, param: RuleParameter):
    """Avalia um parâmetro específico de uma regra"""
    
    # Buscar valor atual do sensor
    sensor_id = extract_sensor_id(param.parameter_key)  # sensor_123 -> 123
    current_value = get_sensor_current_value(sensor_id, param.variable_key)
    
    # Avaliar condição
    condition_met = evaluate_condition(
        current_value,
        param.operator,
        param.threshold
    )
    
    if condition_met:
        # Verificar cooldown (duration em minutos)
        last_alert = Alert.objects.filter(
            rule=rule,
            parameter_key=param.parameter_key,
            created_at__gte=timezone.now() - timedelta(minutes=param.duration)
        ).first()
        
        if not last_alert:
            # Gerar mensagem usando template
            message = generate_message_from_template(
                param.message_template,
                sensor_tag=get_sensor_tag(sensor_id),
                current_value=current_value,
                threshold=param.threshold,
                operator=param.operator,
                unit=param.unit or ''
            )
            
            # Criar alerta
            alert = Alert.objects.create(
                rule=rule,
                equipment=rule.equipment,
                parameter_key=param.parameter_key,
                severity=param.severity,
                message=message,
                value=current_value,
                threshold=param.threshold,
                status='OPEN',
            )
            
            # Disparar notificações
            trigger_notifications(alert, rule.actions)

def generate_message_from_template(template: str, **kwargs) -> str:
    """
    Substitui variáveis no template
    Ex: "{sensor} está {operator} {threshold}{unit}" 
    -> "TEMP-001 está > 25°C"
    """
    return template.format(**kwargs)
```

### 5. API Endpoint - Teste

```bash
# Criar regra multi-parâmetro
curl -X POST http://localhost:8000/api/alerts/rules/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Chiller CH-01 - Monitoramento Completo",
    "description": "Temperatura, pressão e fluxo",
    "equipment": 123,
    "parameters": [
      {
        "parameter_key": "sensor_456",
        "operator": ">",
        "threshold": 25,
        "duration": 5,
        "severity": "Critical",
        "message_template": "Temperatura: {value}°C > {threshold}°C"
      },
      {
        "parameter_key": "sensor_457",
        "operator": ">",
        "threshold": 300,
        "duration": 10,
        "severity": "High",
        "message_template": "Pressão: {value} PSI > {threshold} PSI"
      }
    ],
    "actions": ["EMAIL", "IN_APP"],
    "enabled": true
  }'
```

---

## 📊 Benefícios

### 1. Organização
- **Antes**: 10 regras para monitorar 1 chiller com 10 sensores
- **Depois**: 1 regra para monitorar 1 chiller com 10 sensores

### 2. Manutenção
- Alterar ações (EMAIL → WhatsApp): 1 edição vs 10 edições
- Desabilitar monitoramento temporário: 1 toggle vs 10 toggles

### 3. Clareza
- Nome da regra reflete o equipamento, não o parâmetro
- Fácil identificar todas as condições de um equipamento

### 4. Personalização
- Mensagem customizada por parâmetro
- Severidade diferente por parâmetro
- Duração de cooldown específica

### 5. Rastreabilidade
- Alertas indicam qual parâmetro disparou
- Histórico agrupado por equipamento

---

## 🧪 Testes Recomendados

### Frontend (já implementado)

1. **Criar regra com 1 parâmetro**
   - Validar que funciona como antes

2. **Criar regra com 3 parâmetros**
   - Validar que cada card é independente
   - Validar remoção de parâmetro

3. **Editar regra antiga (single-parameter)**
   - Validar conversão para array
   - Adicionar mais parâmetros
   - Salvar e verificar

4. **Editar regra nova (multi-parameter)**
   - Modificar parâmetros existentes
   - Adicionar novos parâmetros
   - Remover parâmetros
   - Validar que mensagens personalizadas persistem

5. **Validações**
   - Tentar criar regra sem parâmetros → erro
   - Tentar criar parâmetro sem sensor → erro
   - Tentar criar parâmetro sem mensagem → erro

### Backend (pendente)

1. **Migration**
   - Rodar migration
   - Verificar criação de `rule_parameters` table
   - Verificar foreign key para `rules`

2. **API Create**
   - POST regra com `parameters[]`
   - Verificar criação no banco
   - Verificar resposta inclui parâmetros

3. **API Update**
   - PUT regra modificando parâmetros
   - Verificar que parâmetros antigos são deletados
   - Verificar que novos são criados

4. **API List/Retrieve**
   - GET regra multi-parâmetro
   - Verificar que retorna array completo

5. **Celery Task**
   - Criar leituras que disparem cada parâmetro
   - Verificar que alertas são criados com mensagens personalizadas
   - Verificar que cooldown funciona por parâmetro

6. **Compatibilidade**
   - Regras antigas ainda funcionam?
   - Editar regra antiga no novo formato funciona?

---

## 🔒 Retrocompatibilidade

### Garantias:

1. **Regras antigas continuam funcionando**
   - Campos `parameter_key`, `operator`, etc. mantidos no model
   - Celery task verifica se `parameters.count() == 0` e usa lógica antiga

2. **API aceita ambos formatos**
   - `CreateRuleRequest` tem campos opcionais
   - Backend detecta qual formato foi enviado

3. **Frontend converte regras antigas**
   - Ao editar regra sem `parameters[]`, converte para array
   - Usuário pode então adicionar mais parâmetros

4. **Migration não quebra dados existentes**
   - Apenas adiciona nova tabela
   - Não modifica tabela `rules`

---

## 📝 Checklist de Implementação

### Frontend ✅
- [x] Criar interface `RuleParameter`
- [x] Modificar interface `Rule`
- [x] Modificar `CreateRuleRequest`
- [x] Criar componente `AddRuleModalMultiParam`
- [x] Implementar estado de array de parâmetros
- [x] Implementar add/remove/update de parâmetros
- [x] Criar UI de card por parâmetro
- [x] Adicionar campo de mensagem personalizada
- [x] Implementar conversão de regras antigas
- [x] Integrar modal em `AlertsPage`
- [x] Integrar modal em `RuleBuilder`
- [x] Validações completas

### Backend ⏳
- [ ] Criar model `RuleParameter`
- [ ] Modificar model `Rule`
- [ ] Criar serializer `RuleParameterSerializer`
- [ ] Modificar serializer `RuleSerializer`
- [ ] Criar/rodar migration
- [ ] Modificar Celery task `evaluate_rules_task`
- [ ] Implementar `evaluate_rule_parameter`
- [ ] Implementar `generate_message_from_template`
- [ ] Testar API endpoints
- [ ] Testar task Celery

### Testes ⏳
- [ ] Testes unitários frontend
- [ ] Testes unitários backend
- [ ] Testes de integração
- [ ] Testes E2E

### Documentação ✅
- [x] Documentar estrutura de dados
- [x] Documentar fluxo de uso
- [x] Documentar pendências backend
- [x] Criar checklist

---

## 🚀 Próximos Passos

1. **Backend Django** (PRIORIDADE ALTA)
   - Criar models e serializers
   - Rodar migrations
   - Testar endpoints

2. **Backend Celery** (PRIORIDADE ALTA)
   - Modificar task de avaliação
   - Implementar geração de mensagens com template

3. **Testes** (PRIORIDADE MÉDIA)
   - Criar testes unitários
   - Testes E2E completos

4. **Otimizações** (PRIORIDADE BAIXA)
   - Cache de sensores disponíveis
   - Paginação de parâmetros (se > 10)
   - Drag & drop para reordenar

---

## 💡 Ideias Futuras

1. **Templates de Mensagem Pré-configurados**
   - Dropdown com mensagens comuns
   - Ex: "Alta temperatura", "Baixa pressão", etc.

2. **Validação de Variáveis no Template**
   - Verificar se variáveis usadas existem
   - Highlight de variáveis no textarea

3. **Preview de Mensagem**
   - Mostrar preview com valores exemplo
   - Ex: "Temperatura: 27.5°C > 25°C"

4. **Duplicar Parâmetro**
   - Botão para duplicar configuração
   - Facilita criação de parâmetros similares

5. **Import/Export de Regras**
   - Exportar regra como JSON
   - Importar em outro equipamento

6. **Templates de Regras**
   - Salvar regra como template
   - Aplicar template em múltiplos equipamentos

---

**Autor**: GitHub Copilot  
**Versão**: 1.0  
**Última Atualização**: ${new Date().toISOString()}
