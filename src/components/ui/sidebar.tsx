import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

type SidebarContextValue = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({
  children,
  open,
  onOpenChange,
}: SidebarContextValue & { children: React.ReactNode }) {
  return (
    <SidebarContext.Provider value={{ open, onOpenChange }}>
      {children}
    </SidebarContext.Provider>
  );
}

function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("Sidebar components must be inside SidebarProvider");
  return context;
}

export function Sidebar({ children, className }: React.HTMLAttributes<HTMLElement>) {
  const { open } = useSidebar();
  return <aside className={cn("app-sidebar", open && "app-sidebar--open", className)}>{children}</aside>;
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sidebar-header", className)} {...props} />;
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sidebar-content", className)} {...props} />;
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sidebar-footer", className)} {...props} />;
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("sidebar-menu", className)} {...props} />;
}

export function SidebarMenuItem({ className, ...props }: React.LiHTMLAttributes<HTMLLIElement>) {
  return <li className={cn("sidebar-menu-item", className)} {...props} />;
}

export function SidebarMenuButton({
  active,
  className,
  children,
  href,
  onClick,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { active?: boolean }) {
  const { onOpenChange } = useSidebar();
  return (
    <a
      href={href}
      className={cn("sidebar-menu-button", active && "sidebar-menu-button--active", className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onOpenChange(false);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
