import { LayoutDashboard, Package, Plus, Settings, LogOut, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: "dashboard" | "inventory" | "add-medicine" | "dispense-medicine" | "categories" | "reports") => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const { user, logout } = useAuth();
  
  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "inventory" as const, label: "Inventory", icon: Package },
    { id: "reports" as const, label: "Reports", icon: FileText }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="bg-card border-t border-border p-4 fixed bottom-0 left-0 right-0 md:relative md:border-t-0 md:border-r md:p-6 md:min-h-screen md:w-64">
      {/* Logo - only show on desktop */}
      <div className="hidden md:flex items-center justify-center mb-8 pb-6 border-b border-border">
        <img 
          src="/duinwell-logo.png" 
          alt="Duinwell Youth Priority Clinic" 
          className="h-20 w-auto object-contain"
        />
      </div>
      
      <div className="flex justify-around md:flex-col md:space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 md:flex-none md:justify-start gap-2 ${
                isActive 
                  ? "bg-medical-primary text-white hover:bg-medical-primary/90" 
                  : "hover:bg-medical-primary/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden md:inline">{item.label}</span>
            </Button>
          );
        })}
        
        {/* User info and logout */}
        <div className="hidden md:block mt-auto pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-2">
            Logged in as: <span className="font-medium text-foreground">{user?.fullName}</span>
          </div>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;