import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  MessageSquare,
  Bot,
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Home,
  UsersRound,
} from 'lucide-react';

interface SidebarNavProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

const SidebarNav: React.FC<SidebarNavProps> = ({ collapsed = false, onToggle }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      path: '/app/home',
      icon: Home,
      label: 'Start',
      roles: ['student'],
    },
    {
      path: '/app/chat',
      icon: MessageSquare,
      label: 'Chat',
      roles: ['student', 'teacher', 'admin'],
    },
    {
      path: '/app/tutors',
      icon: Bot,
      label: 'Tutoren',
      roles: ['teacher', 'admin'],
    },
    {
      path: '/app/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      roles: ['admin'],
      exact: true,
    },
    {
      path: '/app/admin/users',
      icon: Users,
      label: 'Benutzer',
      roles: ['admin'],
    },
    {
      path: '/app/admin/groups',
      icon: UsersRound,
      label: 'Klassen & Rollen',
      roles: ['admin'],
    },
    {
      path: '/app/admin/costs',
      icon: BarChart3,
      label: 'Kosten',
      roles: ['admin'],
    },
    {
      path: '/app/admin/providers',
      icon: Settings,
      label: 'KI-Modelle',
      roles: ['admin'],
    },
    {
      path: '/app/admin/policy',
      icon: FileText,
      label: 'Systemprompt',
      roles: ['admin'],
    },
  ];

  const visibleItems = navItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    if (location.pathname === path) return true;
    if (path === '/app/admin') {
      return location.pathname === '/app/admin';
    }
    return location.pathname.startsWith(path + '/');
  };

  return (
    <aside className={cn(
      "bg-card border-r border-border flex flex-col transition-all duration-200",
      collapsed ? "w-16" : "w-56"
    )}>
      {/* Toggle Button */}
      <div className="p-2 flex justify-end">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onToggle}
          className="text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, (item as any).exact);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  active 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Budget Info for non-admin users */}
      {!collapsed && user?.role !== 'admin' && user?.budget && (
        <div className="p-3 border-t border-border">
          <div className="text-xs text-muted-foreground mb-1">Budget</div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground">
              €{user.budgetUsed?.toFixed(2)} / €{user.budget.toFixed(2)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full mt-1.5 overflow-hidden border border-border">
            <div 
              className={cn(
                "h-full rounded-full transition-all",
                (user.budgetUsed || 0) / user.budget > 0.8 
                  ? "bg-destructive" 
                  : "bg-primary"
              )}
              style={{ width: `${Math.min(((user.budgetUsed || 0) / user.budget) * 100, 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Anfragen werden bei Erreichen des Limits blockiert
          </p>
        </div>
      )}
    </aside>
  );
};

export default SidebarNav;