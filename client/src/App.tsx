import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Patients from "@/pages/patients";
import Doctors from "@/pages/doctors";
import Rooms from "@/pages/rooms";
import Insurance from "@/pages/insurance";
import TussPage from "@/pages/tuss";
import Sidebar from "@/components/layout/sidebar";
import { createContext, useContext, useState, useEffect } from 'react';

// Context para estado do sidebar
const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {}
});

export const useSidebarContext = () => useContext(SidebarContext);

function AuthenticatedApp() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <SidebarContext.Provider value={{ isCollapsed: sidebarCollapsed, setIsCollapsed: setSidebarCollapsed }}>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className={`flex-1 transition-all duration-300 ${
          isMobile 
            ? 'ml-0 w-full' 
            : sidebarCollapsed 
              ? 'ml-16' 
              : 'ml-64'
        }`}>
          <div className={`p-6 ${isMobile ? 'pt-16' : ''}`}>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/agenda" component={Dashboard} />
              <Route path="/appointments" component={Appointments} />
              <Route path="/patients" component={Patients} />
              <Route path="/doctors" component={Doctors} />
              <Route path="/rooms" component={Rooms} />
              <Route path="/insurance" component={Insurance} />
              <Route path="/tuss" component={TussPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </main>
      </div>
    </SidebarContext.Provider>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-medical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;