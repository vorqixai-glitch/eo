import { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { listProjects } from "@/lib/projects.functions";
import { Download } from "lucide-react";

import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Settings,
  Users,
  Bell,
  Search,
  Menu,
  MessageSquare,
  Sun,
  Moon,
  Laptop,
  Cpu,
  Leaf,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeType } from "@/lib/theme-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { theme, setTheme } = useTheme();

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => listProjects(),
  });

  const handleExportData = () => {
    const data = {
      type: "projects_summary",
      timestamp: new Date().toISOString(),
      projects,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `moss-projects-export.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/chat", icon: MessageSquare },
    { name: "Projects", href: "/dashboard", icon: Leaf },
    { name: "Swarm Agents", href: "/chat", icon: Users },
    { name: "Settings", href: "#", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-[60px] items-center border-b px-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <div className="h-8 w-8 rounded bg-primary text-primary-foreground flex items-center justify-center font-bold">
            R
          </div>
          <span className="">Replica</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-4 text-sm font-medium gap-1">
          {navigation.map((item) => {
            const isActive = currentPath === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                  isActive
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent />
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <header className="flex h-[60px] items-center gap-4 border-b bg-muted/40 px-6 lg:px-8">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-xl hidden md:flex"
            onClick={handleExportData}
          >
            <Download className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">Export Data</span>
          </Button>

          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Toggle notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Palette className="h-5 w-5" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("emerald")}>
                <Leaf className="mr-2 h-4 w-4" /> Emerald
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("cosmic")}>
                <Moon className="mr-2 h-4 w-4" /> Cosmic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("cyberpunk")}>
                <Cpu className="mr-2 h-4 w-4" /> Cyberpunk
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("classic")}>
                <Laptop className="mr-2 h-4 w-4" /> Classic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" /> Light
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
