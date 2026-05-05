import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { mockUsers, subjectColors } from '@/data/mockData';
import { TutorConfig } from '@/types';
import {
  Plus,
  Search,
  Lock,
  Globe,
  Building2,
  ArrowRightLeft,
  X,
} from 'lucide-react';

type Visibility = 'private' | 'internal' | 'public';
type InternalScope = 'groups' | 'allTeachers';
type DragSource = 'middle';

interface DragPayload {
  tutorId: string;
  source: DragSource;
}

interface PendingRemoval {
  tutorId: string;
  classId: string;
  tutorName: string;
  className: string;
}

const getTeacherName = (teacherId: string): string => {
  const teacher = mockUsers.find((u) => u.id === teacherId);
  return teacher?.name || 'Unbekannt';
};

const TutorOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tutors, classes, updateTutor } = useData();

  const [middleSearch, setMiddleSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [internalScope, setInternalScope] = useState<InternalScope>('groups');
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);

  const middleSearchLower = middleSearch.trim().toLowerCase();
  const classSearchLower = classSearch.trim().toLowerCase();

  const selectedTutors = useMemo(() => {
    if (!middleSearchLower) return tutors;

    return tutors.filter((tutor) => {
      const teacherName = getTeacherName(tutor.createdBy).toLowerCase();
      return (
        tutor.name.toLowerCase().includes(middleSearchLower) ||
        tutor.subject.toLowerCase().includes(middleSearchLower) ||
        tutor.description.toLowerCase().includes(middleSearchLower) ||
        teacherName.includes(middleSearchLower)
      );
    });
  }, [middleSearchLower, tutors]);

  const tutorsByVisibility = useMemo(() => {
    const byVisibility: Record<Visibility, TutorConfig[]> = {
      private: [],
      internal: [],
      public: [],
    };

    selectedTutors.forEach((tutor) => {
      const visibility = tutor.visibility ?? 'private';
      byVisibility[visibility].push(tutor);
    });

    return byVisibility;
  }, [selectedTutors]);

  const filteredClasses = useMemo(() => {
    if (!classSearchLower) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(classSearchLower));
  }, [classSearchLower, classes]);

  const onDragStart = (tutorId: string, source: DragSource) => {
    setDragPayload({ tutorId, source });
  };

  const onDropToVisibility = (visibility: Visibility) => {
    if (!dragPayload) return;

    const tutorId = dragPayload.tutorId;
    const tutor = tutors.find((t) => t.id === tutorId);

    if (!tutor) {
      setDragPayload(null);
      return;
    }

    const allClassIds = classes.map((classItem) => classItem.id);
    const assignedClassesForUpdate =
      visibility === 'public'
        ? Array.from(new Set([...tutor.assignedClasses, ...allClassIds]))
        : tutor.assignedClasses;

    updateTutor(tutorId, {
      visibility,
      internalVisibility: visibility === 'internal' ? internalScope : undefined,
      assignedClasses: assignedClassesForUpdate,
    });

    setDragPayload(null);
  };

  const onDropToClass = (classId: string) => {
    if (!dragPayload) return;

    const tutor = tutors.find((t) => t.id === dragPayload.tutorId);
    if (!tutor) {
      setDragPayload(null);
      return;
    }

    if (tutor.assignedClasses.includes(classId)) {
      toast({
        title: 'Bereits zugewiesen',
        description: `${tutor.name} ist dieser Klasse bereits zugewiesen.`,
      });
      setDragPayload(null);
      return;
    }

    updateTutor(tutor.id, {
      assignedClasses: [...tutor.assignedClasses, classId],
    });

    toast({
      title: 'Tutor zugewiesen',
      description: `${tutor.name} wurde erfolgreich zu einer Klasse hinzugefügt.`,
    });

    setDragPayload(null);
  };

  const confirmRemoveTutorFromClass = (tutorId: string, classId: string) => {
    const tutor = tutors.find((t) => t.id === tutorId);
    const classItem = classes.find((c) => c.id === classId);

    if (!tutor || !classItem) return;

    setPendingRemoval({
      tutorId,
      classId,
      tutorName: tutor.name,
      className: classItem.name,
    });
  };

  const removeTutorFromClass = () => {
    if (!pendingRemoval) return;

    const { tutorId, classId } = pendingRemoval;
    const tutor = tutors.find((t) => t.id === tutorId);
    if (!tutor) {
      setPendingRemoval(null);
      return;
    }

    updateTutor(tutorId, {
      assignedClasses: tutor.assignedClasses.filter((id) => id !== classId),
    });

    setPendingRemoval(null);
  };

  const visibilitySections: Array<{
    key: Visibility;
    title: string;
    description: string;
    icon: React.ElementType;
  }> = [
    {
      key: 'private',
      title: 'Private',
      description: 'Nur für den Ersteller sichtbar. Entwürfe landen hier ebenfalls.',
      icon: Lock,
    },
    {
      key: 'internal',
      title: 'Internal',
      description:
        internalScope === 'groups' ? 'Sichtbar für ausgewählte Lehrergruppen.' : 'Sichtbar für alle Lehrer.',
      icon: Building2,
    },
    {
      key: 'public',
      title: 'Public',
      description: 'Für die ganze Schule freigegeben.',
      icon: Globe,
    },
  ];

  const renderTutorCard = (tutor: TutorConfig, zone: Visibility) => {
    const colorClass = subjectColors[tutor.subject] || subjectColors.default;
    const isDraft = !tutor.visibility;

    return (
      <div
        key={tutor.id}
        draggable
        onDragStart={() => onDragStart(tutor.id, 'middle')}
        className={cn(
          'rounded-xl border bg-background px-3 py-2.5 shadow-sm cursor-grab active:cursor-grabbing transition-colors',
          zone === 'private' && isDraft && 'border-dashed border-muted-foreground/30 bg-muted/20',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{tutor.icon}</span>
              <div className="min-w-0">
                <button
                  type="button"
                  className="text-sm font-medium truncate hover:underline text-left"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/tutors/${tutor.id}/edit`);
                  }}
                >
                  {tutor.name}
                </button>
                <p className="text-[11px] text-muted-foreground truncate">
                  {tutor.subject} • {getTeacherName(tutor.createdBy)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{tutor.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className={cn('text-[10px] whitespace-nowrap', colorClass)}>
              {tutor.subject}
            </Badge>
            {isDraft && zone === 'private' && (
              <Badge variant="secondary" className="text-[10px] whitespace-nowrap">
                Entwurf
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full min-h-0 flex flex-col gap-4 p-4 lg:p-6 bg-muted/20 overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Tutor Management</h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Tutoren in Private, Internal und Public einsortieren und rechts Klassen zuweisen.
          </p>
        </div>
        <Button onClick={() => navigate('/app/tutors/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Neuer Tutor
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 flex-1 min-h-0 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.75fr)]">
        <div className="min-h-0 space-y-4">
          {visibilitySections.map((zone) => {
            const ZoneIcon = zone.icon;

            return (
              <Card key={zone.key} className="min-h-0 overflow-hidden border-border/70 shadow-sm">
                <CardHeader className="pb-3 border-b bg-muted/20">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <ZoneIcon className="w-4 h-4" />
                        {zone.title}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{zone.description}</p>
                    </div>
                    <Badge variant="secondary">{tutorsByVisibility[zone.key].length}</Badge>
                  </div>
                </CardHeader>
                <CardContent
                  className="min-h-0 max-h-[22rem] overflow-auto space-y-2 pt-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropToVisibility(zone.key)}
                >
                  {tutorsByVisibility[zone.key].map((tutor) => renderTutorCard(tutor, zone.key))}
                  {tutorsByVisibility[zone.key].length === 0 && (
                    <div className="rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-sm text-muted-foreground text-center">
                      Tutor hierhin ziehen...
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="min-h-0 flex flex-col overflow-hidden xl:max-h-[calc(100vh-11rem)]">
          <CardHeader className="pb-3 border-b bg-muted/20">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              Klassenzuordnung
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="pl-9"
                placeholder="Klassen suchen (z.B. 4, ahif, ...)"
              />
            </div>
            <p className="text-xs text-muted-foreground">Tutoren aus der Mitte per Drag & Drop zuweisen.</p>
          </CardHeader>
          <CardContent className="min-h-0 overflow-auto space-y-3 pt-4">
            {filteredClasses.map((classItem) => {
              const assignedTutors = tutors.filter((tutor) => tutor.assignedClasses.includes(classItem.id));

              return (
                <div
                  key={classItem.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropToClass(classItem.id)}
                  className="rounded-xl border p-3 bg-card shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{classItem.name}</p>
                    <Badge variant="secondary">{assignedTutors.length}</Badge>
                  </div>

                  {assignedTutors.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Tutor aus der Mitte hier ablegen...</p>
                  ) : (
                    <div className="space-y-1.5">
                      {assignedTutors.map((tutor) => (
                        <div
                          key={`${classItem.id}-${tutor.id}`}
                          className="rounded-md border bg-muted/30 px-2 py-1.5 text-xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {tutor.icon} {tutor.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {tutor.subject} • {getTeacherName(tutor.createdBy)}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => confirmRemoveTutorFromClass(tutor.id, classItem.id)}
                            aria-label="Tutor von Klasse entfernen"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {filteredClasses.length === 0 && (
              <p className="text-sm text-muted-foreground">Keine Klassen gefunden.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!pendingRemoval} onOpenChange={() => setPendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutor aus Klasse entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du "{pendingRemoval?.tutorName}" wirklich aus "{pendingRemoval?.className}" entfernen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={removeTutorFromClass}>Entfernen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TutorOverviewPage;
