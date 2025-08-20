
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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
  }, []);

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
          className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
          onClick={toggleSidebar}
          data-testid="mobile-menu-toggle"
        >
          {isCollapsed ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </Button>
      )}

      <aside 
        className={cn(
          "bg-white shadow-lg border-r border-gray-200 flex flex-col min-h-screen transition-all duration-300 ease-in-out z-50",
          isMobile ? "fixed left-0 top-0" : "relative",
          isCollapsed 
            ? isMobile 
              ? "-translate-x-full" 
              : "w-16"
            : isMobile 
              ? "w-64 translate-x-0" 
              : "w-64"
        )}
      >
        {/* Logo Header */}
        <div className={cn(
          "border-b border-gray-200 transition-all duration-300",
          isCollapsed && !isMobile ? "p-3" : "p-6"
        )}>
          <div className="flex items-center space-x-3">
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
          <div className="px-4 py-2 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="w-full justify-start"
              data-testid="desktop-sidebar-toggle"
            >
              <Menu className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Recolher</span>}
            </Button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-4">
            {navigationItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <li key={item.name}>
                  <Link href={item.href}>
                    <div
                      className={cn(
                        "flex items-center rounded-lg font-medium transition-colors cursor-pointer",
                        isActive
                          ? "text-medical-blue bg-blue-50"
                          : "text-gray-700 hover:bg-gray-50",
                        isCollapsed && !isMobile
                          ? "px-3 py-3 justify-center"
                          : "px-4 py-3"
                      )}
                      data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                      title={isCollapsed && !isMobile ? item.name : undefined}
                    >
                      <Icon className={cn(
                        "h-5 w-5 flex-shrink-0",
                        (!isCollapsed || isMobile) && "mr-3"
                      )} />
                      {(!isCollapsed || isMobile) && (
                        <span className="truncate">{item.name}</span>
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
