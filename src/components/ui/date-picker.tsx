import { forwardRef } from "react"
import ReactDatePicker, { registerLocale } from "react-datepicker"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import "react-datepicker/dist/react-datepicker.css"

// Registrar locale português
registerLocale("pt-BR", ptBR)

interface DatePickerProps {
  selected?: Date
  onChange: (date: Date | null) => void
  placeholderText?: string
  className?: string
  disabled?: boolean
}

const DatePickerInput = forwardRef<HTMLButtonElement, any>(
  ({ value, onClick, placeholderText }, ref) => (
    <Button
      ref={ref}
      variant="outline"
      onClick={onClick}
      className={cn(
        "w-full justify-start text-left font-normal",
        !value && "text-muted-foreground"
      )}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value || placeholderText}
    </Button>
  )
)

DatePickerInput.displayName = "DatePickerInput"

export function DatePicker({
  selected,
  onChange,
  placeholderText = "Selecione a data",
  className,
  disabled = false,
}: DatePickerProps) {
  return (
    <div className={cn("date-picker-wrapper", className)}>
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        locale="pt-BR"
        dateFormat="dd/MM/yyyy"
        customInput={<DatePickerInput placeholderText={placeholderText} />}
        disabled={disabled}
        calendarStartDay={0} // Domingo como primeiro dia
        showPopperArrow={false}
        popperClassName="date-picker-popper"
        calendarClassName="date-picker-calendar"
      />
    </div>
  )
}
