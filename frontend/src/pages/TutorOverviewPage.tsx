import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  Plus, 
  Search, 
  Pencil, 
  Copy, 
  Trash2,
  LayoutGrid,
  LayoutList,
  Users,
  Calendar,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { TutorConfig } from '@/types';
import { subjectColors, subjectOptions, mockClasses, mockUsers, getTeacherName } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

type ViewMode = 'grid' | 'list';

const TutorOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tutors, deleteTutor, toggleTutor, addTutor } = useData();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingTutor, setDeletingTutor] = useState<TutorConfig | null>(null);

  const isAdmin = user?.role === 'admin';
  
  // Admin sees all tutors, teachers see only their own
  const myTutors = isAdmin 
    ? tutors 
    : tutors.filter(t => t.createdBy === user?.id);

  const filteredTutors = useMemo(() => {
    return myTutors.filter(tutor => {
      const teacherName = getTeacherName(tutor.createdBy).toLowerCase();
      const matchesSearch = !searchQuery || 
        tutor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tutor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacherName.includes(searchQuery.toLowerCase());
      const matchesSubject = subjectFilter === 'all' || tutor.subject === subjectFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'published' && tutor.status === 'published' && tutor.isEnabled) ||
        (statusFilter === 'draft' && tutor.status === 'draft') ||
        (statusFilter === 'disabled' && !tutor.isEnabled);
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [myTutors, searchQuery, subjectFilter, statusFilter]);

  const handleDelete = () => {
    if (deletingTutor) {
      deleteTutor(deletingTutor.id);
      setDeletingTutor(null);
    }
  };

  const handleDuplicate = (tutor: TutorConfig) => {
    const newTutor: TutorConfig = {
      ...tutor,
      id: `tutor-${Date.now()}`,
      name: `${tutor.name} (Kopie)`,
      status: 'draft',
      isEnabled: false,
      createdBy: user!.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addTutor(newTutor);
  };

  const handleToggle = (tutor: TutorConfig, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleTutor(tutor.id);
  };

  const getAssignmentInfo = (tutor: TutorConfig) => {
    const classNames = tutor.assignedClasses
      .map(id => mockClasses.find(c => c.id === id)?.name)
      .filter(Boolean);
    const studentNames = tutor.assignedStudents
      .map(id => mockUsers.find(u => u.id === id)?.name)
      .filter(Boolean);
    return { classNames, studentNames, total: classNames.length + studentNames.length };
  };

  const getStatusBadge = (tutor: TutorConfig) => {
    if (!tutor.isEnabled) {
      return <Badge variant="secondary" className="text-[10px]">Deaktiviert</Badge>;
    }
    if (tutor.status === 'draft') {
      return <Badge variant="outline" className="text-[10px]">Entwurf</Badge>;
    }
    return <Badge variant="default" className="text-[10px] bg-success">Veröffentlicht</Badge>;
  };

  const getExpiryInfo = (tutor: TutorConfig) => {
    if (!tutor.expiresAt) return null;
    const expiry = new Date(tutor.expiresAt);
    const now = new Date();
    
    if (isBefore(expiry, now)) {
      return { label: 'Abgelaufen', color: 'text-destructive' };
    }
    if (isBefore(expiry, addDays(now, 7))) {
      return { label: `Bis ${format(expiry, 'dd.MM.', { locale: de })}`, color: 'text-warning' };
    }
    return { label: `Bis ${format(expiry, 'dd.MM.', { locale: de })}`, color: 'text-muted-foreground' };
  };

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Tutoren</h1>
          <p className="text-sm text-muted-foreground">
            {myTutors.length} Tutor{myTutors.length !== 1 && 'en'} {isAdmin ? 'insgesamt' : 'erstellt'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon">
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm">
                <strong>Was sind Tutoren?</strong><br />
                Tutoren sind KI-Assistenten, die du für deine Schüler erstellen kannst. 
                Jeder Tutor kann auf ein bestimmtes Fach spezialisiert sein und eigene Anweisungen bekommen.
              </p>
            </TooltipContent>
          </Tooltip>
          <Button onClick={() => navigate('/app/tutors/new')} className="gap-2">
            <Plus className="w-4 h-4" />
            Neuer Tutor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tutor oder Lehrer suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Fach" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Fächer</SelectItem>
            {subjectOptions.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="published">Veröffentlicht</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
            <SelectItem value="disabled">Deaktiviert</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center border rounded-lg p-0.5">
          <Button
            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={() => setViewMode('list')}
          >
            <LayoutList className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredTutors.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">
              {myTutors.length === 0 ? 'Noch keine Tutoren' : 'Keine Tutoren gefunden'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {myTutors.length === 0 
                ? 'Erstelle deinen ersten KI-Tutor für deine Schüler. Ein Tutor ist wie ein persönlicher Lernassistent.'
                : 'Versuche andere Filterkriterien'
              }
            </p>
            {myTutors.length === 0 && (
              <Button onClick={() => navigate('/app/tutors/new')}>
                Ersten Tutor erstellen
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
          {filteredTutors.map(tutor => {
            const colorClass = subjectColors[tutor.subject] || subjectColors.default;
            const assignment = getAssignmentInfo(tutor);
            const expiryInfo = getExpiryInfo(tutor);
            const hasAssignment = tutor.assignment || (tutor.assignmentDocuments && tutor.assignmentDocuments.length > 0);
            
            return (
              <Card 
                key={tutor.id} 
                className="group hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/app/tutors/${tutor.id}/edit`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{tutor.icon}</div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">{tutor.name}</span>
                        </div>
                        <Badge variant="outline" className={cn("text-[10px]", colorClass)}>
                          {tutor.subject}
                        </Badge>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={tutor.isEnabled}
                            onCheckedChange={() => toggleTutor(tutor.id)}
                            className="data-[state=checked]:bg-success"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {tutor.isEnabled ? 'Tutor deaktivieren' : 'Tutor aktivieren'}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {tutor.description || 'Keine Beschreibung'}
                  </p>

                  {/* Status badges */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {getStatusBadge(tutor)}
                    {hasAssignment && (
                      <Badge variant="outline" className="text-[10px]">
                        <FileText className="w-3 h-3 mr-1" />
                        Auftrag
                      </Badge>
                    )}
                    {expiryInfo && (
                      <Badge variant="outline" className={cn("text-[10px]", expiryInfo.color)}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {expiryInfo.label}
                      </Badge>
                    )}
                  </div>

                   <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>
                        {assignment.classNames.length} Klasse{assignment.classNames.length !== 1 && 'n'}
                        {assignment.studentNames.length > 0 && `, ${assignment.studentNames.length} Schüler`}
                      </span>
                    </div>
                    <span>{getTeacherName(tutor.createdBy)}</span>
                  </div>
                  
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex-1 h-7 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/tutors/${tutor.id}/edit`);
                      }}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Bearbeiten
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(tutor);
                      }}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon-sm"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingTutor(tutor);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Fach</TableHead>
                <TableHead>Aktiv</TableHead>
                <TableHead>Ablauf</TableHead>
                <TableHead>Freigaben</TableHead>
                <TableHead>Geändert</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTutors.map(tutor => {
                const colorClass = subjectColors[tutor.subject] || subjectColors.default;
                const assignment = getAssignmentInfo(tutor);
                const expiryInfo = getExpiryInfo(tutor);
                
                return (
                  <TableRow 
                    key={tutor.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/app/tutors/${tutor.id}/edit`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{tutor.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{tutor.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {tutor.description} • <span className="font-medium">{getTeacherName(tutor.createdBy)}</span>
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[10px]", colorClass)}>
                        {tutor.subject}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={tutor.isEnabled}
                        onCheckedChange={() => toggleTutor(tutor.id)}
                        className="data-[state=checked]:bg-success"
                      />
                    </TableCell>
                    <TableCell>
                      {expiryInfo ? (
                        <span className={cn("text-xs", expiryInfo.color)}>{expiryInfo.label}</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {assignment.total} Zuweisungen
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {format(tutor.updatedAt || tutor.createdAt, 'dd.MM.yy', { locale: de })}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicate(tutor);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingTutor(tutor);
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTutor} onOpenChange={() => setDeletingTutor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutor löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du "{deletingTutor?.name}" wirklich löschen? 
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TutorOverviewPage;