
import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  Users, 
  UserCheck, 
  DoorOpen, 
  Shield, 
  BarChart3, 
  Stethoscope,
  User,
  LogOut,
  FileText,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState, useEffect } from "react";
import { useSidebarContext } from "@/App";

const getNavigationItems = (userType: string) => {
  const baseItems = [
    { name: "Agenda", href: "/", icon: Calendar },
    { name: "Consultas", href: "/appointments", icon: Calendar },
  ];

  if (userType === "Atendente" || userType === "Administrador") {
    baseItems.push(
      { name: "Pacientes", href: "/patients", icon: Users },
      { name: "Médicos", href: "/doctors", icon: UserCheck },
      { name: "Salas", href: "/rooms", icon: DoorOpen },
      { name: "Convênios", href: "/insurance", icon: Shield },
      { name: "TUSS", href: "/tuss", icon: FileText }
    );
  }
  
  if (userType === "Médico") {
    baseItems.push(
      { name: "Pacientes", href: "/patients", icon: Users }
    );
  }
  
  if (userType === "Controlador" || userType === "Administrador") {
    baseItems.push(
      { name: "Relatórios", href: "/reports", icon: BarChart3 }
    );
  }
  
  return baseItems;
};

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebarContext();
  const [isMobile, setIsMobile] = useState(false);
  
  if (!user) return null;
  
  const navigationItems = getNavigationItems(user.userType);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [setIsCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile menu button - sempre visível em mobile */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-4 z-50 bg-card shadow-md hover:bg-accent border"
          onClick={toggleSidebar}
          data-testid="mobile-menu-toggle"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      )}

      <aside 
        className={cn(
          "bg-card shadow-lg border-r border-border flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isMobile 
            ? "fixed left-0 top-0 z-50" 
            : "fixed left-0 top-0 z-10",
          isMobile
            ? isCollapsed 
              ? "-translate-x-full w-64" 
              : "w-64 translate-x-0"
            : isCollapsed 
              ? "w-16" 
              : "w-64"
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          "border-b border-border transition-all duration-300 flex items-center justify-center",
          isCollapsed && !isMobile ? "p-3" : "p-6"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed && !isMobile ? "justify-center" : "space-x-3"
          )}>
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Stethoscope className="text-primary-foreground text-lg" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold text-primary whitespace-nowrap">OrthoCare</h1>
                <p className="text-sm text-muted-foreground whitespace-nowrap">Sistema de Gestão</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse button for desktop */}
        {!isMobile && (
          <div className={cn(
            "border-b border-border transition-all duration-300",
            isCollapsed ? "px-2 py-2" : "px-4 py-2"
          )}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={cn(
                "transition-all duration-300",
                isCollapsed 
                  ? "w-full justify-center p-2" 
                  : "w-full justify-start"
              )}
              data-testid="desktop-sidebar-toggle"
              title={isCollapsed ? "Expandir menu" : "Recolher menu"}
            >
              <Menu className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Recolher</span>}
            </Button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 py-6">
          <ul className={cn(
            "space-y-2 transition-all duration-300",
            isCollapsed && !isMobile ? "px-2" : "px-4"
          )}>
            {navigationItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center rounded-lg font-medium transition-all duration-300 cursor-pointer group",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-foreground hover:bg-accent",
                        isCollapsed && !isMobile
                          ? "px-3 py-3 justify-center relative"
                          : "px-4 py-3"
                      )}
                      data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-300",
                        (!isCollapsed || isMobile) && "mr-3"
                      )} />
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate">{item.name}</span>
                      )}
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && !isMobile && (
                        <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 border">
                          {item.name}
                        </div>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className={cn(
          "border-t border-border space-y-3 transition-all duration-300",
          isCollapsed && !isMobile ? "p-2" : "p-4"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed && !isMobile ? "flex-col space-y-2" : "space-x-3"
          )}>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-muted-foreground text-sm" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.userType}</p>
              </div>
            )}
          </div>
          
          {/* Theme Toggle */}
          <div className={cn(
            "flex transition-all duration-300",
            isCollapsed && !isMobile ? "justify-center" : "justify-start"
          )}>
            <ThemeToggle />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-300",
              isCollapsed && !isMobile 
                ? "w-full p-2 justify-center" 
                : "w-full justify-start"
            )}
            data-testid="button-logout"
            title={isCollapsed && !isMobile ? "Sair" : undefined}
          >
            <LogOut className={cn(
              "h-4 w-4",
              (!isCollapsed || isMobile) && "mr-2"
            )} />
            {(!isCollapsed || isMobile) && "Sair"}
          </Button>
        </div>
      </aside>
    </>
  );
}
