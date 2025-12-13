import { cn } from "@/lib/utils"

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusColors: Record<string, string> = {
  actif: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  inactif: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  maintenance: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  en_panne: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  default: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const colorClass = statusColors[status.toLowerCase()] || statusColors.default

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        colorClass,
        className,
      )}
    >
      {status}
    </span>
  )
}
