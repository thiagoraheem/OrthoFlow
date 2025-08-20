
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
      } else {
        // On desktop, start with sidebar expanded
        setIsCollapsed(false);
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="fixed top-4 left-2 z-50 lg:hidden bg-white shadow-md hover:bg-gray-50"
          onClick={toggleSidebar}
          data-testid="mobile-menu-toggle"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      )}

      <aside 
        className={cn(
          "bg-white shadow-lg border-r border-gray-200 flex flex-col min-h-screen transition-all duration-300 ease-in-out z-50",
          isMobile ? "fixed left-0 top-0" : "relative",
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
          "border-b border-gray-200 transition-all duration-300 flex items-center justify-center",
          isCollapsed && !isMobile ? "p-3" : "p-6"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed && !isMobile ? "justify-center" : "space-x-3"
          )}>
            <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center flex-shrink-0">
              <Stethoscope className="text-white text-lg" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="overflow-hidden">
                <h1 className="text-xl font-bold text-medical-blue whitespace-nowrap">OrthoCare</h1>
                <p className="text-sm text-gray-500 whitespace-nowrap">Sistema de Gestão</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse button for desktop */}
        {!isMobile && (
          <div className={cn(
            "border-b border-gray-200 transition-all duration-300",
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
                          ? "text-medical-blue bg-blue-50"
                          : "text-gray-700 hover:bg-gray-50",
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
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
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
          "border-t border-gray-200 space-y-3 transition-all duration-300",
          isCollapsed && !isMobile ? "p-2" : "p-4"
        )}>
          <div className={cn(
            "flex items-center transition-all duration-300",
            isCollapsed && !isMobile ? "flex-col space-y-2" : "space-x-3"
          )}>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="text-gray-600 text-sm" />
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.userType}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className={cn(
              "text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-300",
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
