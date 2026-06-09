import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Shield, GraduationCap, User as UserIcon, Pencil, Trash2, UserX, UserCheck, ChevronLeft, ChevronRight, Wallet } from 'lucide-react';
import { mockUsers, mockClasses, mockRoles, mockGroups, budgetPeriodLabels } from '@/data/mockData';
import { User } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ budget: '', role: '' as string, budgetPeriod: 'monthly' as string });
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  
  // Budget setup dialog
  const [budgetDialogOpen, setBudgetDialogOpen] = useState(false);
  const [budgetSetup, setBudgetSetup] = useState({
    selectedRoles: [] as string[],
    selectedGroups: [] as string[],
    maxBudget: '',
    period: 'monthly' as string,
  });

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchQuery || 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesClass = classFilter === 'all' || user.classId === classFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.isActive !== false) ||
        (statusFilter === 'inactive' && user.isActive === false);
      return matchesSearch && matchesRole && matchesClass && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, classFilter, statusFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'teacher': return 'Lehrer';
      default: return 'Schüler';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive" className="text-[10px]"><Shield className="w-3 h-3 mr-1" />Admin</Badge>;
      case 'teacher':
        return <Badge variant="default" className="text-[10px]"><GraduationCap className="w-3 h-3 mr-1" />Lehrer</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]"><UserIcon className="w-3 h-3 mr-1" />Schüler</Badge>;
    }
  };

  const getPeriodLabel = (period?: string) => budgetPeriodLabels[period || 'monthly'] || 'Monatlich';

  const getClassName = (classId?: string) => {
    if (!classId) return '-';
    const cls = mockClasses.find(c => c.id === classId);
    return cls?.name || '-';
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      budget: user.budget?.toString() || '',
      role: user.role,
      budgetPeriod: user.budgetPeriod || 'monthly',
    });
  };

  const handleSave = () => {
    if (editingUser) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? {
        ...u,
        budget: parseFloat(editForm.budget) || u.budget,
        role: editForm.role as any,
        budgetPeriod: editForm.budgetPeriod as any,
      } : u));
      toast({ title: 'Benutzer aktualisiert' });
      setEditingUser(null);
    }
  };

  const handleToggleActive = (user: User) => {
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !(u.isActive !== false) } : u));
    toast({ title: user.isActive !== false ? 'Benutzer deaktiviert' : 'Benutzer aktiviert' });
  };

  const handleDelete = () => {
    if (deletingUser) {
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id));
      toast({ title: 'Benutzer gelöscht' });
      setDeletingUser(null);
    }
  };

  const handleBudgetSetup = () => {
    toast({ title: 'Budget eingerichtet', description: `Budget für ${budgetSetup.selectedRoles.length} Rollen und ${budgetSetup.selectedGroups.length} Klassen konfiguriert.` });
    setBudgetDialogOpen(false);
    setBudgetSetup({ selectedRoles: [], selectedGroups: [], maxBudget: '', period: 'monthly' });
  };

  const toggleBudgetRole = (roleId: string) => {
    setBudgetSetup(prev => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleId) 
        ? prev.selectedRoles.filter(r => r !== roleId)
        : [...prev.selectedRoles, roleId],
    }));
  };

  const toggleBudgetGroup = (groupId: string) => {
    setBudgetSetup(prev => ({
      ...prev,
      selectedGroups: prev.selectedGroups.includes(groupId)
        ? prev.selectedGroups.filter(g => g !== groupId)
        : [...prev.selectedGroups, groupId],
    }));
  };

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Benutzerverwaltung</h1>
            <p className="text-sm text-muted-foreground">
              {users.length} Benutzer registriert
            </p>
          </div>
          <Button onClick={() => setBudgetDialogOpen(true)} variant="outline" className="gap-2">
            <Wallet className="w-4 h-4" />
            Budget einrichten
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Name oder E-Mail suchen..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Rolle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Rollen</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="teacher">Lehrer</SelectItem>
              <SelectItem value="student">Schüler</SelectItem>
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Klasse" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle Klassen</SelectItem>
              {mockClasses.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Alle</SelectItem>
              <SelectItem value="active">Aktiv</SelectItem>
              <SelectItem value="inactive">Deaktiviert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>E-Mail</TableHead>
                <TableHead>Rolle</TableHead>
                <TableHead>Klasse</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Reset</TableHead>
                <TableHead>Verbrauch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map(user => {
                const budgetPercentage = user.budget ? ((user.budgetUsed || 0) / user.budget) * 100 : 0;
                
                return (
                  <TableRow key={user.id} className={cn(user.isActive === false && "opacity-50")}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {user.avatar}
                        </div>
                        <span className="font-medium text-sm">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-sm">{getClassName(user.classId)}</TableCell>
                    <TableCell className="text-sm">€{user.budget?.toFixed(2) || '-'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{getPeriodLabel(user.budgetPeriod)}</TableCell>
                    <TableCell>
                      {user.budget ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden border border-border">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                budgetPercentage > 90 ? 'bg-destructive' : budgetPercentage > 80 ? 'bg-warning' : 'bg-primary'
                              )}
                              style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            €{(user.budgetUsed || 0).toFixed(2)} ({budgetPercentage.toFixed(0)}%)
                          </span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive !== false ? 'default' : 'secondary'} className="text-[10px]">
                        {user.isActive !== false ? 'Aktiv' : 'Deaktiviert'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(user)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleToggleActive(user)}>
                          {user.isActive !== false ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeletingUser(user)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <span className="text-xs text-muted-foreground">
                {filteredUsers.length} Benutzer • Seite {page} von {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon-sm" onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon-sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Benutzer bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Name</Label>
                <p className="font-medium">{editingUser?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">E-Mail</Label>
                <p className="text-sm">{editingUser?.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm(prev => ({ ...prev, role: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Schüler</SelectItem>
                    <SelectItem value="teacher">Lehrer</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (€)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={editForm.budget}
                  onChange={(e) => setEditForm(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="z.B. 50"
                />
              </div>
              <div className="space-y-2">
                <Label>Budget-Reset</Label>
                <Select value={editForm.budgetPeriod} onValueChange={(v) => setEditForm(prev => ({ ...prev, budgetPeriod: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setEditingUser(null)}>Abbrechen</Button>
              <Button size="sm" onClick={handleSave}>Speichern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Budget Setup Dialog */}
        <Dialog open={budgetDialogOpen} onOpenChange={setBudgetDialogOpen}>
          <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Budget einrichten</DialogTitle>
              <DialogDescription>
                Lege ein maximales Budget für ausgewählte Rollen und/oder Klassen fest.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="flex-1 -mx-6 px-6 max-h-[400px]">
              <div className="space-y-6">
                {/* Role selection */}
                <div className="space-y-2">
                  <Label className="font-medium">Rollen (Mehrfachauswahl)</Label>
                  <div className="space-y-1">
                    {mockRoles.map(role => (
                      <div key={role.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => toggleBudgetRole(role.id)}>
                        <Checkbox checked={budgetSetup.selectedRoles.includes(role.id)} onCheckedChange={() => toggleBudgetRole(role.id)} />
                        <span className="text-sm">{role.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Group selection */}
                <div className="space-y-2">
                  <Label className="font-medium">Klassen / Gruppen (Mehrfachauswahl)</Label>
                  <div className="space-y-1">
                    {mockGroups.map(group => (
                      <div key={group.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => toggleBudgetGroup(group.id)}>
                        <Checkbox checked={budgetSetup.selectedGroups.includes(group.id)} onCheckedChange={() => toggleBudgetGroup(group.id)} />
                        <span className="text-sm">{group.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Budget amount */}
                <div className="space-y-2">
                  <Label>Max. Budget pro Person (€)</Label>
                  <Input
                    type="number"
                    value={budgetSetup.maxBudget}
                    onChange={(e) => setBudgetSetup(prev => ({ ...prev, maxBudget: e.target.value }))}
                    placeholder="z.B. 10"
                  />
                </div>

                {/* Period */}
                <div className="space-y-2">
                  <Label>Zeitraum (Reset)</Label>
                  <Select value={budgetSetup.period} onValueChange={(v) => setBudgetSetup(prev => ({ ...prev, period: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Täglich</SelectItem>
                      <SelectItem value="weekly">Wöchentlich</SelectItem>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="yearly">Jährlich</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button variant="outline" onClick={() => setBudgetDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleBudgetSetup} disabled={!budgetSetup.maxBudget || (budgetSetup.selectedRoles.length === 0 && budgetSetup.selectedGroups.length === 0)}>
                Budget anwenden
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={!!deletingUser} onOpenChange={() => setDeletingUser(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Benutzer löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchtest du "{deletingUser?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default UserManagementPage;