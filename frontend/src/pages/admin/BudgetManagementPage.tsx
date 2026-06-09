import React, { useState, useMemo } from 'react';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, Search, Users, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { BudgetConfig } from '@/types';
import { mockClasses, mockUsers } from '@/data/mockData';

const ITEMS_PER_PAGE = 20;

const BudgetManagementPage: React.FC = () => {
  const { budgets, updateBudget } = useData();
  const [editingBudget, setEditingBudget] = useState<BudgetConfig | null>(null);
  const [editForm, setEditForm] = useState({
    totalLimit: 0,
    individualLimit: 0,
    warningThreshold: 80,
  });
  
  // Pagination and filtering state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('all');
  const [userPage, setUserPage] = useState(1);
  const [classSearch, setClassSearch] = useState('');
  const [classPage, setClassPage] = useState(1);

  const handleEdit = (budget: BudgetConfig) => {
    setEditingBudget(budget);
    setEditForm({
      totalLimit: budget.totalLimit,
      individualLimit: budget.individualLimit || 0,
      warningThreshold: budget.warningThreshold,
    });
  };

  const handleEditUser = (user: typeof mockUsers[0]) => {
    const syntheticBudget: BudgetConfig = {
      id: user.id,
      type: 'user',
      targetId: user.id,
      targetName: user.name,
      totalLimit: user.budget || 50,
      used: user.budgetUsed || 0,
      period: 'monthly',
      warningThreshold: 80,
    };
    handleEdit(syntheticBudget);
  };

  const handleSave = () => {
    if (editingBudget) {
      updateBudget(editingBudget.id, editForm);
      setEditingBudget(null);
    }
  };

  const roleBudgets = budgets.filter(b => b.type === 'role');
  const classBudgets = budgets.filter(b => b.type === 'class');
  const groupBudgets = budgets.filter(b => b.type === 'group');
  
  // Filtered and paginated users
  const filteredUsers = useMemo(() => {
    let users = mockUsers;
    
    if (userSearch) {
      const query = userSearch.toLowerCase();
      users = users.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }
    
    if (userRoleFilter !== 'all') {
      users = users.filter(u => u.role === userRoleFilter);
    }
    
    return users;
  }, [userSearch, userRoleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (userPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, userPage]);

  const userTotalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  // Filtered and paginated classes
  const filteredClasses = useMemo(() => {
    if (!classSearch) return classBudgets;
    const query = classSearch.toLowerCase();
    return classBudgets.filter(b => 
      b.targetName.toLowerCase().includes(query)
    );
  }, [classBudgets, classSearch]);

  const paginatedClasses = useMemo(() => {
    const start = (classPage - 1) * ITEMS_PER_PAGE;
    return filteredClasses.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredClasses, classPage]);

  const classTotalPages = Math.ceil(filteredClasses.length / ITEMS_PER_PAGE);

  const renderBudgetProgress = (used: number, limit: number) => {
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    return (
      <div className="flex items-center gap-2">
        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full ${
              percentage > 90 ? 'bg-destructive' : percentage > 80 ? 'bg-warning' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          €{used.toFixed(2)} / €{limit.toFixed(2)} ({percentage.toFixed(0)}%)
        </span>
      </div>
    );
  };

  const Pagination = ({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) => (
    <div className="flex items-center justify-between px-2 py-3 border-t">
      <span className="text-xs text-muted-foreground">
        Seite {page} von {totalPages}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Budgetverwaltung</h1>
          <p className="text-sm text-muted-foreground">
            Verwalte Budgets nach Rolle, Klasse oder Person. Alle Budgets haben automatisch einen Hard Cap.
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Hard Cap für alle Nutzer aktiv</p>
              <p className="text-xs text-muted-foreground">
                Anfragen werden automatisch blockiert, wenn das Budgetlimit erreicht ist. 
                Dies gilt für alle Schüler und Lehrer ohne Ausnahme.
              </p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="role" className="space-y-4">
          <TabsList>
            <TabsTrigger value="role">Nach Rolle</TabsTrigger>
            <TabsTrigger value="class">Nach Klasse</TabsTrigger>
            <TabsTrigger value="user">Nach Person ({mockUsers.length})</TabsTrigger>
          </TabsList>

          {/* Role Budgets */}
          <TabsContent value="role">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Standard-Budgets nach Rolle</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Budget/Monat</TableHead>
                      <TableHead>Warnschwelle</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleBudgets.map(budget => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.targetName}</TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <div>Gesamt: €{budget.totalLimit.toFixed(2)}</div>
                            {budget.individualLimit && (
                              <div className="text-muted-foreground">Pro Person: €{budget.individualLimit.toFixed(2)}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{budget.warningThreshold}%</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => handleEdit(budget)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Budgets */}
          <TabsContent value="class">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm">Budgets nach Klasse</CardTitle>
                <div className="relative w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Klasse suchen..."
                    value={classSearch}
                    onChange={(e) => { setClassSearch(e.target.value); setClassPage(1); }}
                    className="pl-9 h-8"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Klasse</TableHead>
                      <TableHead>Verbrauch</TableHead>
                      <TableHead>Warnschwelle</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedClasses.map(budget => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.targetName}</TableCell>
                        <TableCell>{renderBudgetProgress(budget.used, budget.totalLimit)}</TableCell>
                        <TableCell>{budget.warningThreshold}%</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => handleEdit(budget)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {classTotalPages > 1 && (
                  <Pagination 
                    page={classPage} 
                    totalPages={classTotalPages} 
                    onPageChange={setClassPage} 
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Budgets */}
          <TabsContent value="user">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Individuelle Budgets
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Select value={userRoleFilter} onValueChange={(v) => { setUserRoleFilter(v); setUserPage(1); }}>
                    <SelectTrigger className="w-[130px] h-8">
                      <SelectValue placeholder="Rolle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alle Rollen</SelectItem>
                      <SelectItem value="student">Schüler</SelectItem>
                      <SelectItem value="teacher">Lehrer</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Name oder E-Mail suchen..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
                      className="pl-9 h-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>E-Mail</TableHead>
                      <TableHead>Rolle</TableHead>
                      <TableHead>Verbrauch</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {user.role === 'student' ? 'Schüler' : user.role === 'teacher' ? 'Lehrer' : 'Admin'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {renderBudgetProgress(user.budgetUsed || 0, user.budget || 50)}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon-sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="flex items-center justify-between px-4 py-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    {filteredUsers.length} Nutzer gefunden • Seite {userPage} von {userTotalPages || 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setUserPage(p => p - 1)}
                      disabled={userPage <= 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => setUserPage(p => p + 1)}
                      disabled={userPage >= userTotalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={!!editingBudget} onOpenChange={() => setEditingBudget(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Budget bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">{editingBudget?.targetName}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalLimit">Gesamtbudget pro Monat (€)</Label>
                <Input
                  id="totalLimit"
                  type="number"
                  value={editForm.totalLimit}
                  onChange={(e) => setEditForm(prev => ({ ...prev, totalLimit: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              {editingBudget?.type !== 'user' && (
                <div className="space-y-2">
                  <Label htmlFor="individualLimit">Max. Budget pro Person (€)</Label>
                  <Input
                    id="individualLimit"
                    type="number"
                    value={editForm.individualLimit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, individualLimit: parseFloat(e.target.value) || 0 }))}
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Jede Person in dieser Gruppe kann maximal diesen Betrag verbrauchen.
                  </p>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Warnung bei</Label>
                  <span className="text-sm text-muted-foreground">{editForm.warningThreshold}%</span>
                </div>
                <Slider
                  value={[editForm.warningThreshold]}
                  min={50}
                  max={100}
                  step={5}
                  onValueChange={([v]) => setEditForm(prev => ({ ...prev, warningThreshold: v }))}
                />
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground">
                  ⚠️ <strong>Hard Cap ist immer aktiv</strong> – Anfragen werden bei Erreichen des Limits automatisch blockiert.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setEditingBudget(null)}>
                Abbrechen
              </Button>
              <Button size="sm" onClick={handleSave}>
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BudgetManagementPage;