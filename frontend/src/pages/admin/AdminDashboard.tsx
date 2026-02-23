import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Wallet, 
  BarChart3, 
  FileText,
  TrendingUp,
  AlertTriangle,
  Bot,
  ArrowRight,
} from 'lucide-react';
import { mockUsers, mockCosts } from '@/data/mockData';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { tutors, budgets } = useData();

  // Calculate KPIs
  const totalCostThisMonth = mockCosts.reduce((acc, c) => acc + c.cost, 0);
  const activeUsers = mockUsers.filter(u => u.budgetUsed && u.budgetUsed > 0).length;
  const usersNearBudget = mockUsers.filter(u => 
    u.budget && u.budgetUsed && (u.budgetUsed / u.budget) > 0.8
  ).length;

  // Top tutors by cost
  const tutorCosts = tutors.map(tutor => {
    const costs = mockCosts.filter(c => c.tutorId === tutor.id);
    return {
      ...tutor,
      totalCost: costs.reduce((acc, c) => acc + c.cost, 0),
    };
  }).sort((a, b) => b.totalCost - a.totalCost).slice(0, 5);

  const quickActions = [
    { icon: Wallet, label: 'Budgets verwalten', path: '/app/admin/budgets' },
    { icon: BarChart3, label: 'Kostenübersicht', path: '/app/admin/costs' },
    { icon: Users, label: 'Benutzer verwalten', path: '/app/admin/users' },
    { icon: FileText, label: 'Globalen Systemprompt bearbeiten', path: '/app/admin/policy' },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Übersicht über Nutzung, Kosten und Budgets
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gesamtverbrauch (Monat)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">€{totalCostThisMonth.toFixed(2)}</span>
                <Badge variant="secondary" className="text-[10px]">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktive Nutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{activeUsers}</span>
                <span className="text-sm text-muted-foreground">/ {mockUsers.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktive Tutoren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {tutors.filter(t => t.isEnabled && t.status === 'published').length}
              </span>
            </CardContent>
          </Card>

          <Card className={usersNearBudget > 0 ? 'border-warning' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                Budgetwarnungen
                {usersNearBudget > 0 && <AlertTriangle className="w-4 h-4 text-warning" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{usersNearBudget}</span>
                <span className="text-sm text-muted-foreground">Nutzer über 80%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tutors by Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Bot className="w-4 h-4" />
                Top 5 teuerste Tutoren
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tutorCosts.map((tutor, i) => (
                  <div key={tutor.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tutor.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{tutor.name}</p>
                        <p className="text-xs text-muted-foreground">{tutor.subject}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">€{tutor.totalCost.toFixed(2)}</span>
                  </div>
                ))}
                {tutorCosts.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Kostendaten
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Schnellzugriff</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.path}
                      variant="outline"
                      className="h-auto py-4 flex flex-col items-center gap-2"
                      onClick={() => navigate(action.path)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs text-center">{action.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Budget Warnings */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Nutzer mit hohem Verbrauch
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/app/admin/budgets')}>
                Alle anzeigen
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUsers
                  .filter(u => u.budget && u.budgetUsed && (u.budgetUsed / u.budget) > 0.7)
                  .sort((a, b) => ((b.budgetUsed || 0) / (b.budget || 1)) - ((a.budgetUsed || 0) / (a.budget || 1)))
                  .slice(0, 5)
                  .map(user => {
                    const percentage = ((user.budgetUsed || 0) / (user.budget || 1)) * 100;
                    return (
                      <div key={user.id} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{user.name}</span>
                            <span className="text-xs text-muted-foreground">
                              €{user.budgetUsed?.toFixed(2)} / €{user.budget?.toFixed(2)}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                percentage > 90 ? 'bg-destructive' : percentage > 80 ? 'bg-warning' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                        <Badge variant={percentage > 90 ? 'destructive' : 'secondary'} className="text-[10px]">
                          {percentage.toFixed(0)}%
                        </Badge>
                      </div>
                    );
                  })}
                {mockUsers.filter(u => u.budget && u.budgetUsed && (u.budgetUsed / u.budget) > 0.7).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Keine Warnungen
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
