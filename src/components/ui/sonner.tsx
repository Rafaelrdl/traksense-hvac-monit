import { useTheme } from "next-themes"
import { CSSProperties } from "react"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      expand={false}
      closeButton
      duration={2500}
      style={{
        '--success-icon-color': '#0d9488',
        '--error-icon-color': '#ef4444',
        '--warning-icon-color': '#f59e0b',
        '--info-icon-color': '#06b6d4',
      } as CSSProperties}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:min-w-[300px]",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:text-gray-900",
          description: "group-[.toast]:text-xs group-[.toast]:text-gray-600 group-[.toast]:mt-1",
          actionButton: "group-[.toast]:bg-teal-600 group-[.toast]:text-white group-[.toast]:text-xs group-[.toast]:rounded-md group-[.toast]:px-3 group-[.toast]:py-1.5",
          cancelButton: "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:text-xs group-[.toast]:rounded-md",
          closeButton: "group-[.toast]:!bg-teal-600 group-[.toast]:!text-white hover:group-[.toast]:!bg-teal-700 group-[.toast]:!rounded-full group-[.toast]:!border-2 group-[.toast]:!border-white [&>svg]:!text-white [&>svg]:!w-3 [&>svg]:!h-3",
          success: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-teal-600 [&>svg]:!text-teal-600 [&_[data-icon]]:!text-teal-600",
          error: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500 [&>svg]:!text-red-500",
          warning: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-amber-500 [&>svg]:!text-amber-500",
          info: "group-[.toaster]:border-l-4 group-[.toaster]:border-l-cyan-500 [&>svg]:!text-cyan-500",
          icon: "[&>svg]:!text-teal-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
