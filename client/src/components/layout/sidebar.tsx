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
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

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
      { name: "Convênios", href: "/insurance", icon: Shield }
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
  
  if (!user) return null;
  
  const navigationItems = getNavigationItems(user.userType);

  return (
    <aside className="w-64 lg:w-64 md:w-60 sm:w-56 bg-white shadow-lg border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
            <Stethoscope className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-medical-blue">OrthoCare</h1>
            <p className="text-sm text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

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
                      "flex items-center px-4 py-3 rounded-lg font-medium transition-colors cursor-pointer",
                      isActive
                        ? "text-medical-blue bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.userType}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  );
}
