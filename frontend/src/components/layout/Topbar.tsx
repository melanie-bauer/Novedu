import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sun, Moon, LogOut, User, Shield, GraduationCap } from 'lucide-react';

interface TopbarProps {
  schoolName?: string;
}

const Topbar: React.FC<TopbarProps> = ({ schoolName = 'EduTutor AI' }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin':
        return { icon: Shield, label: 'Admin', color: 'text-red-500' };
      case 'teacher':
        return { icon: GraduationCap, label: 'Lehrer', color: 'text-primary' };
      default:
        return { icon: User, label: 'Schüler', color: 'text-blue-500' };
    }
  };

  const roleBadge = getRoleBadge();
  const RoleIcon = roleBadge.icon;

  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4">
      {/* Logo / School Name */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-semibold text-sm text-foreground">{schoolName}</h1>
          {user?.school && (
            <p className="text-xs text-muted-foreground">{user.school}</p>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2 h-9 px-2 hover:bg-muted">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user?.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-medium leading-none text-foreground">{user?.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <RoleIcon className={`w-3 h-3 ${roleBadge.color}`} />
                  <span className="text-[10px] text-muted-foreground">{roleBadge.label}</span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground font-normal">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <User className="w-4 h-4 mr-2" />
              Profil anzeigen
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground text-xs" disabled>
              Datenschutz & AGB
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Abmelden
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Topbar;