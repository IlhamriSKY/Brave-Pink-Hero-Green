import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: { className?: string } & React.ComponentProps<'div'>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
