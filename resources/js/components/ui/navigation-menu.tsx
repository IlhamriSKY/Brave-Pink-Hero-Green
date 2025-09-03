import * as React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * NavigationMenu (shadcn/ui)
 * Lightweight header navigation primitives to compose a site navbar.
 */
const NavigationMenu = NavigationMenuPrimitive.Root
const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "group flex flex-1 list-none items-center justify-center gap-1",
      className
    )}
    {...props}
  />
))
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName

const NavigationMenuItem = NavigationMenuPrimitive.Item

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(
      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-3 py-1 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children} <ChevronDown className="ml-1 h-3 w-3 transition group-data-[state=open]:rotate-180" />
  </NavigationMenuPrimitive.Trigger>
))
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName

const NavigationMenuLink = NavigationMenuPrimitive.Link

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "data-[motion=from-start]:animate-in data-[motion=from-end]:animate-in data-[motion=to-start]:animate-out data-[motion=to-end]:animate-out data-[motion=from-start]:slide-in-from-left-10 data-[motion=from-end]:slide-in-from-right-10 data-[motion=to-start]:slide-out-to-left-10 data-[motion=to-end]:slide-out-to-right-10 left-0 top-0 w-auto",
      className
    )}
    {...props}
  />
))
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
}

