import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import { 
  Search, Plus, Pencil, Trash2, Users, UserPlus, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { mockGroups, mockUsers, mockRoles } from '@/data/mockData';
import { Group, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

const ITEMS_PER_PAGE = 15;

const GroupManagementPage: React.FC = () => {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>(mockGroups);
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupPage, setGroupPage] = useState(1);
  
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [deletingGroup, setDeletingGroup] = useState<Group | null>(null);
  const [managingMembers, setManagingMembers] = useState<Group | null>(null);
  
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [managingRoleMembers, setManagingRoleMembers] = useState<Role | null>(null);
  
  const [groupForm, setGroupForm] = useState({ name: '', description: '', budget: '', budgetPeriod: 'monthly', warningThreshold: 80 });
  const [roleForm, setRoleForm] = useState({ name: '', description: '', maxIndividualBudget: 0, budgetPeriod: 'monthly', warningThreshold: 80 });
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery) return groups;
    const query = searchQuery.toLowerCase();
    return groups.filter(g => g.name.toLowerCase().includes(query) || g.description?.toLowerCase().includes(query));
  }, [groups, searchQuery]);

  const paginatedGroups = useMemo(() => {
    const start = (groupPage - 1) * ITEMS_PER_PAGE;
    return filteredGroups.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGroups, groupPage]);

  const groupTotalPages = Math.ceil(filteredGroups.length / ITEMS_PER_PAGE);

  const handleCreateGroup = () => {
    setGroupForm({ name: '', description: '', budget: '', budgetPeriod: 'monthly', warningThreshold: 80 });
    setIsCreatingGroup(true);
  };

  const handleEditGroup = (group: Group) => {
    setGroupForm({ name: group.name, description: group.description || '', budget: group.budget?.toString() || '', budgetPeriod: group.budgetPeriod || 'monthly', warningThreshold: group.warningThreshold || 80 });
    setEditingGroup(group);
  };

  const handleSaveGroup = () => {
    if (isCreatingGroup) {
      const newGroup: Group = {
        id: `group-${Date.now()}`,
        name: groupForm.name,
        description: groupForm.description,
        memberIds: [],
        createdAt: new Date(),
        budget: parseFloat(groupForm.budget) || undefined,
        budgetPeriod: groupForm.budgetPeriod as any,
        warningThreshold: groupForm.warningThreshold,
      };
      setGroups(prev => [...prev, newGroup]);
      toast({ title: 'Klasse erstellt' });
    } else if (editingGroup) {
      setGroups(prev => prev.map(g => g.id === editingGroup.id ? { ...g, name: groupForm.name, description: groupForm.description, budget: parseFloat(groupForm.budget) || undefined, budgetPeriod: groupForm.budgetPeriod as any, warningThreshold: groupForm.warningThreshold } : g));
      toast({ title: 'Klasse aktualisiert' });
    }
    setIsCreatingGroup(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = () => {
    if (deletingGroup) {
      setGroups(prev => prev.filter(g => g.id !== deletingGroup.id));
      toast({ title: 'Klasse gelöscht' });
      setDeletingGroup(null);
    }
  };

  const handleManageMembers = (group: Group) => {
    setSelectedMembers(group.memberIds);
    setManagingMembers(group);
    setMemberSearch('');
  };

  const handleSaveMembers = () => {
    if (managingMembers) {
      setGroups(prev => prev.map(g => g.id === managingMembers.id ? { ...g, memberIds: selectedMembers } : g));
      toast({ title: 'Mitglieder aktualisiert' });
      setManagingMembers(null);
    }
  };

  const handleManageRoleMembers = (role: Role) => {
    setSelectedMembers(role.memberIds || []);
    setManagingRoleMembers(role);
    setMemberSearch('');
  };

  const handleSaveRoleMembers = () => {
    if (managingRoleMembers) {
      setRoles(prev => prev.map(r => r.id === managingRoleMembers.id ? { ...r, memberIds: selectedMembers } : r));
      toast({ title: 'Rollenmitglieder aktualisiert' });
      setManagingRoleMembers(null);
    }
  };

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
  };

  const handleCreateRole = () => {
    setRoleForm({ name: '', description: '', maxIndividualBudget: 0, budgetPeriod: 'monthly', warningThreshold: 80 });
    setIsCreatingRole(true);
  };

  const handleEditRole = (role: Role) => {
    setRoleForm({ name: role.name, description: role.description || '', maxIndividualBudget: role.maxIndividualBudget || 0, budgetPeriod: role.budgetPeriod || 'monthly', warningThreshold: role.warningThreshold || 80 });
    setEditingRole(role);
  };

  const handleSaveRole = () => {
    if (isCreatingRole) {
      const newRole: Role = {
        id: `role-${Date.now()}`,
        name: roleForm.name,
        description: roleForm.description,
        isSystem: false,
        maxIndividualBudget: roleForm.maxIndividualBudget,
        budgetPeriod: roleForm.budgetPeriod as any,
        warningThreshold: roleForm.warningThreshold,
        memberIds: [],
      };
      setRoles(prev => [...prev, newRole]);
      toast({ title: 'Rolle erstellt' });
    } else if (editingRole) {
      setRoles(prev => prev.map(r => r.id === editingRole.id ? { ...r, name: roleForm.name, description: roleForm.description, maxIndividualBudget: roleForm.maxIndividualBudget, budgetPeriod: roleForm.budgetPeriod as any, warningThreshold: roleForm.warningThreshold } : r));
      toast({ title: 'Rolle aktualisiert' });
    }
    setIsCreatingRole(false);
    setEditingRole(null);
  };

  const handleDeleteRole = () => {
    if (deletingRole) {
      setRoles(prev => prev.filter(r => r.id !== deletingRole.id));
      toast({ title: 'Rolle gelöscht' });
      setDeletingRole(null);
    }
  };

  const filteredMembers = useMemo(() => {
    if (!memberSearch) return mockUsers;
    const query = memberSearch.toLowerCase();
    return mockUsers.filter(u => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query));
  }, [memberSearch]);

  const getMemberNames = (memberIds: string[]) => {
    return memberIds.map(id => mockUsers.find(u => u.id === id)?.name).filter(Boolean).slice(0, 3).join(', ') + (memberIds.length > 3 ? ` +${memberIds.length - 3}` : '');
  };

  const renderMembersDialog = (entity: Group | Role | null, onClose: () => void, onSave: () => void) => (
    <Dialog open={!!entity} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mitglieder verwalten: {entity?.name}</DialogTitle>
          <DialogDescription>Wähle Personen aus, die zugewiesen werden sollen.</DialogDescription>
        </DialogHeader>
        <div className="relative mb-3">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Person suchen..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} className="pl-9" />
        </div>
        <ScrollArea className="flex-1 -mx-6 px-6 max-h-[300px]">
          <div className="space-y-1">
            {filteredMembers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => toggleMember(user.id)}>
                <Checkbox checked={selectedMembers.includes(user.id)} onCheckedChange={() => toggleMember(user.id)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {user.role === 'student' ? 'Schüler' : user.role === 'teacher' ? 'Lehrer' : 'Admin'}
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-3">{selectedMembers.length} Mitglieder ausgewählt</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button onClick={onSave}>Speichern</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="h-full overflow-auto p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Klassen & Rollen</h1>
          <p className="text-sm text-muted-foreground">Verwalte Klassen, Gruppen und Rollen für Benutzer</p>
        </div>

        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="groups">Klassen ({groups.length})</TabsTrigger>
            <TabsTrigger value="roles">Rollen ({roles.length})</TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm">Alle Klassen & Gruppen</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Klasse suchen..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setGroupPage(1); }} className="pl-9 h-8" />
                  </div>
                  <Button size="sm" onClick={handleCreateGroup}>
                    <Plus className="w-4 h-4 mr-1" />Neue Klasse
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Mitglieder</TableHead>
                      <TableHead>Budget/Person</TableHead>
                      <TableHead>Erstellt</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedGroups.map(group => (
                      <TableRow key={group.id}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">{group.description || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px]">
                              <Users className="w-3 h-3 mr-1" />{group.memberIds.length}
                            </Badge>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{getMemberNames(group.memberIds)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{group.budget ? `€${group.budget.toFixed(2)}` : '-'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(group.createdAt), 'dd.MM.yyyy', { locale: de })}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleManageMembers(group)}><UserPlus className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEditGroup(group)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => setDeletingGroup(group)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {paginatedGroups.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Keine Klassen gefunden</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
                {groupTotalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <span className="text-xs text-muted-foreground">Seite {groupPage} von {groupTotalPages}</span>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="icon-sm" onClick={() => setGroupPage(p => p - 1)} disabled={groupPage <= 1}><ChevronLeft className="w-4 h-4" /></Button>
                      <Button variant="outline" size="icon-sm" onClick={() => setGroupPage(p => p + 1)} disabled={groupPage >= groupTotalPages}><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-sm">Alle Rollen</CardTitle>
                <Button size="sm" onClick={handleCreateRole}>
                  <Plus className="w-4 h-4 mr-1" />Neue Rolle
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Mitglieder</TableHead>
                      <TableHead>Max. Einzelbudget</TableHead>
                      <TableHead>Warnschwelle</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead className="w-[120px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map(role => (
                      <TableRow key={role.id}>
                        <TableCell className="font-medium">{role.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{role.description || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            <Users className="w-3 h-3 mr-1" />{(role.memberIds || []).length}
                          </Badge>
                        </TableCell>
                        <TableCell>€{role.maxIndividualBudget?.toFixed(2) || '0.00'}</TableCell>
                        <TableCell>{role.warningThreshold || 80}%</TableCell>
                        <TableCell>
                          <Badge variant={role.isSystem ? 'secondary' : 'outline'} className="text-[10px]">
                            {role.isSystem ? 'System' : 'Benutzerdefiniert'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleManageRoleMembers(role)}><UserPlus className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEditRole(role)}><Pencil className="w-4 h-4" /></Button>
                            {!role.isSystem && (
                              <Button variant="ghost" size="icon-sm" onClick={() => setDeletingRole(role)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create/Edit Group Dialog */}
        <Dialog open={isCreatingGroup || !!editingGroup} onOpenChange={() => { setIsCreatingGroup(false); setEditingGroup(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isCreatingGroup ? 'Neue Klasse erstellen' : 'Klasse bearbeiten'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={groupForm.name} onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))} placeholder="z.B. 5AHIF oder Mathe-AG" />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung (optional)</Label>
                <Input value={groupForm.description} onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Kurze Beschreibung" />
              </div>
              <div className="space-y-2">
                <Label>Max. Budget pro Person (€)</Label>
                <Input type="number" value={groupForm.budget} onChange={(e) => setGroupForm(prev => ({ ...prev, budget: e.target.value }))} placeholder="z.B. 20 (überschreibt Rollen-Budget)" />
                <p className="text-[10px] text-muted-foreground">Überschreibt das Rollenbudget für Mitglieder dieser Klasse.</p>
              </div>
              <div className="space-y-2">
                <Label>Budget-Reset</Label>
                <Select value={groupForm.budgetPeriod} onValueChange={(v) => setGroupForm(prev => ({ ...prev, budgetPeriod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Warnschwelle</Label>
                  <span className="text-sm text-muted-foreground">{groupForm.warningThreshold}%</span>
                </div>
                <Slider value={[groupForm.warningThreshold]} min={50} max={100} step={5} onValueChange={([v]) => setGroupForm(prev => ({ ...prev, warningThreshold: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreatingGroup(false); setEditingGroup(null); }}>Abbrechen</Button>
              <Button onClick={handleSaveGroup} disabled={!groupForm.name.trim()}>{isCreatingGroup ? 'Erstellen' : 'Speichern'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Manage Members Dialog (Groups) */}
        {renderMembersDialog(managingMembers, () => setManagingMembers(null), handleSaveMembers)}

        {/* Manage Members Dialog (Roles) */}
        {renderMembersDialog(managingRoleMembers, () => setManagingRoleMembers(null), handleSaveRoleMembers)}

        {/* Create/Edit Role Dialog */}
        <Dialog open={isCreatingRole || !!editingRole} onOpenChange={() => { setIsCreatingRole(false); setEditingRole(null); }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{isCreatingRole ? 'Neue Rolle erstellen' : 'Rolle bearbeiten'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={roleForm.name} onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))} placeholder="z.B. Tutor oder Kursleiter" />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Input value={roleForm.description} onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Max. Einzelbudget (€)</Label>
                <Input type="number" value={roleForm.maxIndividualBudget} onChange={(e) => setRoleForm(prev => ({ ...prev, maxIndividualBudget: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div className="space-y-2">
                <Label>Budget-Reset</Label>
                <Select value={roleForm.budgetPeriod} onValueChange={(v) => setRoleForm(prev => ({ ...prev, budgetPeriod: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Täglich</SelectItem>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                    <SelectItem value="yearly">Jährlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Warnschwelle</Label>
                  <span className="text-sm text-muted-foreground">{roleForm.warningThreshold}%</span>
                </div>
                <Slider value={[roleForm.warningThreshold]} min={50} max={100} step={5} onValueChange={([v]) => setRoleForm(prev => ({ ...prev, warningThreshold: v }))} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsCreatingRole(false); setEditingRole(null); }}>Abbrechen</Button>
              <Button onClick={handleSaveRole} disabled={!roleForm.name.trim()}>{isCreatingRole ? 'Erstellen' : 'Speichern'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Group Dialog */}
        <AlertDialog open={!!deletingGroup} onOpenChange={() => setDeletingGroup(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Klasse löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchtest du die Klasse "{deletingGroup?.name}" wirklich löschen?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteGroup} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Role Dialog */}
        <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Rolle löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchtest du die Rolle "{deletingRole?.name}" wirklich löschen?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRole} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Löschen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default GroupManagementPage;