import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  LogOut, 
  LayoutDashboard, 
  ListTodo, 
  Activity 
} from "lucide-react";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return <>{children}</>;

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    { href: "/activity", label: "Our Story", icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-card border-b md:border-r border-border p-6 flex flex-col sticky top-0 md:h-screen z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            <Heart className="fill-primary" size={20} />
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Us & We</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <div 
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200
                    ${isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-medium" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }
                  `}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-sm font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={() => logout.mutate()}
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-12 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
