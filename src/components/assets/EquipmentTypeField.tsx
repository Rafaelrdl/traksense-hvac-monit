import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandGroup,
} from '@/components/ui/command';
import { ChevronDown, ListFilter, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EquipmentType } from '@/types/hvac';

export const EQUIPMENT_TYPES = [
  { value: 'CHILLER' as const, label: 'Chiller' },
  { value: 'AHU' as const, label: 'AHU (Unidade de Tratamento de Ar)' },
  { value: 'FAN_COIL' as const, label: 'Fan Coil' },
  { value: 'PUMP' as const, label: 'Bomba' },
  { value: 'BOILER' as const, label: 'Caldeira' },
  { value: 'COOLING_TOWER' as const, label: 'Torre de Resfriamento' },
  { value: 'VRF' as const, label: 'VRF (Variable Refrigerant Flow)' },
  { value: 'RTU' as const, label: 'RTU (Rooftop Unit)' },
  { value: 'VALVE' as const, label: 'Válvula' },
  { value: 'SENSOR' as const, label: 'Sensor' },
  { value: 'CONTROLLER' as const, label: 'Controlador' },
  { value: 'FILTER' as const, label: 'Filtro' },
  { value: 'DUCT' as const, label: 'Duto' },
  { value: 'METER' as const, label: 'Medidor' },
  { value: 'OTHER' as const, label: 'Outros' },
] as const;

interface EquipmentTypeFieldProps {
  value: EquipmentType;
  onChange: (value: EquipmentType) => void;
  otherValue?: string;
  onChangeOther?: (value: string) => void;
  required?: boolean;
  error?: string;
}

export function EquipmentTypeField({
  value,
  onChange,
  otherValue,
  onChangeOther,
  required = true,
  error,
}: EquipmentTypeFieldProps) {
  const [open, setOpen] = useState(false);
  const selected = EQUIPMENT_TYPES.find((opt) => opt.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="equipment-type">
        Tipo de equipamento {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="equipment-type"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'w-full justify-between',
              error && 'border-red-500 focus-visible:ring-red-500'
            )}
          >
            <span className="flex items-center gap-2">
              <ListFilter className="size-4 opacity-70" />
              {selected?.label ?? 'Selecionar tipo'}
            </span>
            <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar tipo..." />
            <CommandList>
              <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
              <CommandGroup>
                {EQUIPMENT_TYPES.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        value === opt.value ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}

      {value === 'OTHER' && (
        <div className="space-y-2 pt-2">
          <Label htmlFor="equipment-type-other">
            Especificar tipo <span className="text-red-500">*</span>
          </Label>
          <Input
            id="equipment-type-other"
            placeholder="Ex.: Trocador de Calor, Ventilador, etc."
            value={otherValue ?? ''}
            onChange={(e) => onChangeOther?.(e.target.value)}
            minLength={3}
            required
            className={cn(
              error && 'border-red-500 focus-visible:ring-red-500'
            )}
          />
          <p className="text-xs text-muted-foreground">
            Mínimo de 3 caracteres
          </p>
        </div>
      )}
    </div>
  );
}
