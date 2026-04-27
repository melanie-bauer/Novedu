import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
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
  Users,
  Lock,
  Globe,
  Building2,
  ArrowRightLeft,
  X,
} from 'lucide-react';

type Visibility = 'private' | 'internal' | 'public';
type InternalScope = 'groups' | 'allTeachers';
type DragSource = 'left' | 'middle';

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
  const { user } = useAuth();
  const { tutors, classes, updateTutor } = useData();

  const myCreatedTutors = useMemo(() => {
    return tutors.filter((t) => t.createdBy === user?.id);
  }, [tutors, user?.id]);

  const [middleSearch, setMiddleSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [internalScope, setInternalScope] = useState<InternalScope>('groups');
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [selectedTutorIds, setSelectedTutorIds] = useState<string[]>(() =>
    tutors.filter((t) => !!t.visibility).map((t) => t.id),
  );
  const [visibilityByTutor, setVisibilityByTutor] = useState<Record<string, Visibility>>(() => {
    const initial: Record<string, Visibility> = {};
    tutors.forEach((tutor) => {
      if (tutor.visibility) {
        initial[tutor.id] = tutor.visibility;
      }
    });
    return initial;
  });

  useEffect(() => {
    if (!user?.id) return;

    const autoPrivateTutorIds = tutors
      .filter(
        (tutor) =>
          tutor.createdBy === user.id &&
          !tutor.visibility &&
          (tutor.assignedClasses.length > 0 || tutor.assignedStudents.length > 0),
      )
      .map((tutor) => tutor.id);

    if (autoPrivateTutorIds.length === 0) return;

    setSelectedTutorIds((prev) => Array.from(new Set([...prev, ...autoPrivateTutorIds])));
    setVisibilityByTutor((prev) => {
      const next = { ...prev };
      let changed = false;

      autoPrivateTutorIds.forEach((id) => {
        if (!next[id]) {
          next[id] = 'private';
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [tutors, user?.id]);

  const leftColumnTutors = useMemo(() => {
    return myCreatedTutors.filter((tutor) => !visibilityByTutor[tutor.id]);
  }, [myCreatedTutors, visibilityByTutor]);

  const middleSearchLower = middleSearch.trim().toLowerCase();
  const classSearchLower = classSearch.trim().toLowerCase();

  const selectedTutors = useMemo(() => {
    const base = tutors.filter((t) => selectedTutorIds.includes(t.id));

    if (!middleSearchLower) return base;

    return base.filter((tutor) => {
      const teacherName = getTeacherName(tutor.createdBy).toLowerCase();
      return (
        tutor.name.toLowerCase().includes(middleSearchLower) ||
        tutor.subject.toLowerCase().includes(middleSearchLower) ||
        tutor.description.toLowerCase().includes(middleSearchLower) ||
        teacherName.includes(middleSearchLower)
      );
    });
  }, [middleSearchLower, tutors, selectedTutorIds]);

  const tutorsByVisibility = useMemo(() => {
    const byVisibility: Record<Visibility, TutorConfig[]> = {
      private: [],
      internal: [],
      public: [],
    };

    selectedTutors.forEach((tutor) => {
      const visibility = visibilityByTutor[tutor.id];
      if (!visibility) return;
      byVisibility[visibility].push(tutor);
    });

    return byVisibility;
  }, [selectedTutors, visibilityByTutor]);

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

    setSelectedTutorIds((prev) => (prev.includes(tutorId) ? prev : [...prev, tutorId]));
    setVisibilityByTutor((prev) => ({
      ...prev,
      [tutorId]: visibility,
    }));

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

    if (dragPayload.source === 'left') {
      toast({
        title: 'Ungültige Aktion',
        description: 'Ziehe den Tutor zuerst in der Mitte auf Private, Internal oder Public.',
        variant: 'destructive',
      });
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

  const removeFromMiddle = (tutorId: string) => {
    setSelectedTutorIds((prev) => prev.filter((id) => id !== tutorId));
    setVisibilityByTutor((prev) => {
      const next = { ...prev };
      delete next[tutorId];
      return next;
    });

    updateTutor(tutorId, {
      visibility: undefined,
      internalVisibility: undefined,
    });
  };

  return (
    <div className="h-full flex flex-col p-6 gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tutor Start-Tab</h1>
          <p className="text-sm text-muted-foreground">
            Links erstellen, in der Mitte freigeben und rechts Klassen zuweisen.
          </p>
        </div>
        <Button onClick={() => navigate('/app/tutors/new')} className="gap-2">
          <Plus className="w-4 h-4" />
          Neuer Tutor
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 flex-1 min-h-0">
        <Card className="min-h-0 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              I) Meine erstellten Tutoren
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Alle von dir erstellten Tutoren. Ziehe sie in die Mitte.
            </p>
          </CardHeader>
          <CardContent className="min-h-0 overflow-auto space-y-2">
            {leftColumnTutors.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Tutoren erstellt.</p>
            ) : (
              leftColumnTutors.map((tutor) => {
                const colorClass = subjectColors[tutor.subject] || subjectColors.default;
                const isSelected = selectedTutorIds.includes(tutor.id);

                return (
                  <div
                    key={tutor.id}
                    draggable
                    onDragStart={() => onDragStart(tutor.id, 'left')}
                    className={cn(
                      'rounded-lg border p-3 bg-card cursor-grab active:cursor-grabbing transition-colors',
                      isSelected && 'border-primary/50 bg-primary/5',
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg">{tutor.icon}</span>
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
                          <p className="text-xs text-muted-foreground truncate">{tutor.subject}</p>
                        </div>
                      </div>
                      {isSelected && <Badge variant="secondary">Ausgewählt</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{tutor.description}</p>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="min-h-0 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              II) Sichtbarkeit verwalten
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={middleSearch}
                onChange={(e) => setMiddleSearch(e.target.value)}
                className="pl-9"
                placeholder="Suche: Name, Fach, Ersteller..."
              />
            </div>
          </CardHeader>
          <CardContent className="min-h-0 overflow-auto space-y-3">
            {(
              [
                {
                  key: 'private' as Visibility,
                  title: 'Private',
                  description: 'Nur für diesen Lehrer sichtbar',
                  icon: Lock,
                },
                {
                  key: 'internal' as Visibility,
                  title: 'Internal',
                  description:
                    internalScope === 'groups'
                      ? 'Für Lehrergruppen sichtbar'
                      : 'Für alle Lehrer sichtbar',
                  icon: Building2,
                },
                {
                  key: 'public' as Visibility,
                  title: 'Public',
                  description: 'Für alle Schüler und Lehrer freigegeben',
                  icon: Globe,
                },
              ]
            ).map((zone) => {
              const ZoneIcon = zone.icon;

              return (
                <div
                  key={zone.key}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropToVisibility(zone.key)}
                  className="rounded-lg border border-dashed p-3 bg-muted/20"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <ZoneIcon className="w-4 h-4" />
                        <p className="text-sm font-medium">{zone.title}</p>
                        <Badge variant="outline">{tutorsByVisibility[zone.key].length}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{zone.description}</p>
                    </div>
                    {zone.key === 'internal' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          setInternalScope((prev) => (prev === 'groups' ? 'allTeachers' : 'groups'))
                        }
                      >
                        {internalScope === 'groups' ? 'Lehrergruppen' : 'Alle Lehrer'}
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {tutorsByVisibility[zone.key].map((tutor) => {
                      const colorClass = subjectColors[tutor.subject] || subjectColors.default;

                      return (
                        <div
                          key={tutor.id}
                          draggable
                          onDragStart={() => onDragStart(tutor.id, 'middle')}
                          className="rounded-md border bg-background p-2 cursor-grab active:cursor-grabbing"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{tutor.icon} {tutor.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {tutor.subject} • {getTeacherName(tutor.createdBy)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className={cn('text-[10px]', colorClass)}>
                                {tutor.subject}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => removeFromMiddle(tutor.id)}
                                aria-label="Tutor aus Mitte entfernen"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {tutorsByVisibility[zone.key].length === 0 && (
                      <p className="text-xs text-muted-foreground">Tutor hierhin ziehen...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="min-h-0 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              III) Klassen zuweisen
            </CardTitle>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="pl-9"
                placeholder="Klassen suchen (z.B. 4, ahif, ... )"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Nur Drag & Drop aus der Mitte ist erlaubt.
            </p>
          </CardHeader>
          <CardContent className="min-h-0 overflow-auto space-y-3">
            {filteredClasses.map((classItem) => {
              const assignedTutors = tutors.filter((tutor) => tutor.assignedClasses.includes(classItem.id));

              return (
                <div
                  key={classItem.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDropToClass(classItem.id)}
                  className="rounded-lg border p-3 bg-card"
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
