import { Link, useLocation } from "wouter";
import { 
  Calendar, 
  Users, 
  UserCheck, 
  DoorOpen, 
  Shield, 
  BarChart3, 
  Stethoscope,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Appointments", href: "/appointments", icon: Calendar },
  { name: "Patients", href: "/patients", icon: Users },
  { name: "Doctors", href: "/doctors", icon: UserCheck },
  { name: "Clinic Rooms", href: "/rooms", icon: DoorOpen },
  { name: "Insurance Plans", href: "/insurance", icon: Shield },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-medical-blue rounded-lg flex items-center justify-center">
            <Stethoscope className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-medical-blue">OrthoCare</h1>
            <p className="text-sm text-gray-500">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 py-6">
        <ul className="space-y-2 px-4">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-4 py-3 rounded-lg font-medium transition-colors",
                      isActive
                        ? "text-medical-blue bg-blue-50"
                        : "text-gray-700 hover:bg-gray-50"
                    )}
                    data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User className="text-gray-600 text-sm" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Dr. Sarah Johnson</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
