import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { mockUsers } from '@/data/mockData';
import { TutorConfig } from '@/types';
import {
  Search,
  Users,
  Lock,
  Globe,
  Building2,
  Plus,
  ChevronDown,
  X,
  Pencil,
  Trash2,
  GripVertical,
  Filter,
} from 'lucide-react';

type Visibility = 'private' | 'internal' | 'public';

/** Pro Swimlane: eigene Schulfarbe (#0a529a, #86b5d7, #dc931a; Rot für Akzente wo sinnvoll) */
const LANE_THEME: Record<
  Visibility,
  {
    top: string;
    title: string;
    icon: string;
    grip: string;
    contentBg: string;
  }
> = {
  private: {
    top: 'border-t-[3px] border-t-school-primary',
    title: 'text-foreground',
    icon: 'text-muted-foreground',
    grip: 'border-r-school-primary/30 bg-school-primary/10 hover:bg-school-primary/18',
    contentBg: 'bg-school-primary/[0.04]',
  },
  internal: {
    top: 'border-t-[3px] border-t-school-secondary',
    title: 'text-foreground',
    icon: 'text-muted-foreground',
    grip: 'border-r-school-secondary/35 bg-school-secondary/15 hover:bg-school-secondary/25',
    contentBg: 'bg-school-secondary/[0.06]',
  },
  public: {
    top: 'border-t-[3px] border-t-school-accent',
    title: 'text-foreground',
    icon: 'text-muted-foreground',
    grip: 'border-r-school-accent/35 bg-school-accent/12 hover:bg-school-accent/22',
    contentBg: 'bg-school-accent/[0.05]',
  },
};

const INTERNAL_VISIBILITY = 'groups' as const;

type DragSource = 'lane' | 'pool';

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

const DRAG_TIP_SESSION_KEY = 'novedu-tutor-drag-tip-shown';

const getTeacherName = (teacherId: string): string => {
  const teacher = mockUsers.find((u) => u.id === teacherId);
  return teacher?.name || 'Unbekannt';
};

const getClassAssignmentRows = (
  tutor: TutorConfig,
): { classId: string; assignedById: string }[] => {
  if (tutor.classAssignments && tutor.classAssignments.length > 0) {
    return tutor.classAssignments;
  }
  return tutor.assignedClasses.map((classId) => ({
    classId,
    assignedById: tutor.createdBy,
  }));
};

const TutorOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    tutors,
    classes,
    updateTutor,
    deleteTutor,
    assignTutorToClass,
    unassignTutorFromClass,
  } = useData();

  const [middleSearch, setMiddleSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [showDrafts, setShowDrafts] = useState(true);
  const [showForeignTutors, setShowForeignTutors] = useState(true);

  const [filterCollapsed, setFilterCollapsed] = useState(true);
  const [laneOpen, setLaneOpen] = useState<Record<Visibility, boolean>>({
    private: false,
    internal: false,
    public: false,
  });

  const [deptOpen, setDeptOpen] = useState<Record<string, boolean>>({});
  const [classOpen, setClassOpen] = useState<Record<string, boolean>>({});

  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dragOverLane, setDragOverLane] = useState<Visibility | null>(null);
  const [dragOverClassId, setDragOverClassId] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<PendingRemoval | null>(null);
  const [deletingTutor, setDeletingTutor] = useState<TutorConfig | null>(null);

  const uid = user?.id;

  const isMyTutor = (tutor: TutorConfig) => tutor.createdBy === uid;

  const middleSearchLower = middleSearch.trim().toLowerCase();
  const classSearchLower = classSearch.trim().toLowerCase();

  const filteredClasses = useMemo(() => {
    if (!classSearchLower) return classes;
    return classes.filter((c) => c.name.toLowerCase().includes(classSearchLower));
  }, [classSearchLower, classes]);

  const classesByDepartment = useMemo(() => {
    const map = new Map<string, typeof filteredClasses>();
    filteredClasses.forEach((c) => {
      const list = map.get(c.department) ?? [];
      list.push(c);
      map.set(c.department, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredClasses]);

  const tutorMatchesSearch = useCallback(
    (tutor: TutorConfig) => {
      if (!middleSearchLower) return true;
      const teacherName = getTeacherName(tutor.createdBy).toLowerCase();
      return (
        tutor.name.toLowerCase().includes(middleSearchLower) ||
        tutor.subject.toLowerCase().includes(middleSearchLower) ||
        tutor.description.toLowerCase().includes(middleSearchLower) ||
        teacherName.includes(middleSearchLower)
      );
    },
    [middleSearchLower],
  );

  const effectiveVisibility = (tutor: TutorConfig): Visibility => {
    if (tutor.status === 'draft') return 'private';
    return tutor.visibility ?? 'private';
  };

  const privateTutors = useMemo(
    () =>
      tutors.filter((t) => {
        if (!tutorMatchesSearch(t)) return false;
        if (effectiveVisibility(t) !== 'private') return false;
        if (t.createdBy !== uid) return false;
        if (t.status === 'draft' && !showDrafts) return false;
        return true;
      }),
    [tutors, tutorMatchesSearch, uid, showDrafts],
  );

  const internalTutors = useMemo(
    () =>
      tutors.filter((t) => {
        if (!tutorMatchesSearch(t)) return false;
        if (effectiveVisibility(t) !== 'internal') return false;
        if (!showForeignTutors && t.createdBy !== uid) return false;
        return true;
      }),
    [tutors, tutorMatchesSearch, uid, showForeignTutors],
  );

  const publicTutors = useMemo(
    () =>
      tutors.filter((t) => {
        if (!tutorMatchesSearch(t)) return false;
        if (effectiveVisibility(t) !== 'public') return false;
        if (!showForeignTutors && t.createdBy !== uid) return false;
        return true;
      }),
    [tutors, tutorMatchesSearch, uid, showForeignTutors],
  );

  const draggingTutor = useMemo(
    () => (dragPayload ? tutors.find((t) => t.id === dragPayload.tutorId) ?? null : null),
    [dragPayload, tutors],
  );

  const canAssignToClass =
    !!draggingTutor &&
    draggingTutor.status === 'published' &&
    effectiveVisibility(draggingTutor) !== 'private';

  const endDrag = useCallback(() => {
    setDragPayload(null);
    setDragOverLane(null);
    setDragOverClassId(null);
  }, []);

  useEffect(() => {
    const onDocDragEnd = () => endDrag();
    document.addEventListener('dragend', onDocDragEnd, true);
    return () => document.removeEventListener('dragend', onDocDragEnd, true);
  }, [endDrag]);

  const canDropOnLane = useCallback(
    (zoneKey: Visibility) => {
      if (!draggingTutor) return false;
      if (zoneKey === 'private') return true;
      return draggingTutor.status === 'published';
    },
    [draggingTutor],
  );

  const onDragStart = (e: React.DragEvent, tutorId: string, source: DragSource) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tutorId);
    setDragOverLane(null);
    setDragOverClassId(null);

    setDragPayload({ tutorId, source });
    try {
      if (!sessionStorage.getItem(DRAG_TIP_SESSION_KEY)) {
        sessionStorage.setItem(DRAG_TIP_SESSION_KEY, '1');
        toast({
          title: 'Drag & Drop',
          description:
            'Ziehe einen Tutor in eine Sichtbarkeits-Spalte oder auf eine Klasse zum Zuweisen.',
        });
      }
    } catch {
      /* ignore */
    }
  };

  const onDragEnd = () => endDrag();

  const onDropToVisibility = (visibility: Visibility) => {
    if (!dragPayload || !uid) {
      endDrag();
      return;
    }
    const tutorId = dragPayload.tutorId;
    const tutor = tutors.find((t) => t.id === tutorId);
    if (!tutor) {
      endDrag();
      return;
    }

    if (tutor.status === 'draft' && visibility !== 'private') {
      toast({
        title: 'Nicht möglich',
        description: 'Nur veröffentlichte Tutoren können nach Internal oder Public verschoben werden.',
        variant: 'destructive',
      });
      endDrag();
      return;
    }

    const allClassIds = classes.map((c) => c.id);
    const prevRows = getClassAssignmentRows(tutor);
    const byClass = new Map(prevRows.map((r) => [r.classId, r]));

    const nextRows = [...prevRows];
    if (visibility === 'public') {
      allClassIds.forEach((cid) => {
        if (!byClass.has(cid)) {
          nextRows.push({ classId: cid, assignedById: uid });
          byClass.set(cid, nextRows[nextRows.length - 1]);
        }
      });
    }

    updateTutor(tutorId, {
      visibility,
      internalVisibility: visibility === 'internal' ? INTERNAL_VISIBILITY : undefined,
      classAssignments: nextRows,
      assignedClasses: [...new Set(nextRows.map((r) => r.classId))],
    });

    endDrag();
  };

  const onDropToClass = (classId: string) => {
    if (!dragPayload || !uid) {
      endDrag();
      return;
    }
    const tutor = tutors.find((t) => t.id === dragPayload.tutorId);
    if (!tutor) {
      endDrag();
      return;
    }

    if (tutor.status !== 'published') {
      toast({
        title: 'Nicht möglich',
        description: 'Nur veröffentlichte Tutoren können Klassen zugewiesen werden.',
        variant: 'destructive',
      });
      endDrag();
      return;
    }

    const v = effectiveVisibility(tutor);
    if (v === 'private') {
      toast({
        title: 'Hinweis',
        description: 'Veröffentliche den Tutor oder verschiebe ihn nach Internal/Public, bevor du ihn zuweist.',
        variant: 'destructive',
      });
      endDrag();
      return;
    }

    const rows = getClassAssignmentRows(tutor);
    if (rows.some((r) => r.classId === classId)) {
      toast({
        title: 'Bereits zugewiesen',
        description: `${tutor.name} ist dieser Klasse bereits zugewiesen.`,
      });
      endDrag();
      return;
    }

    assignTutorToClass(tutor.id, classId, uid);
    toast({
      title: 'Tutor zugewiesen',
      description: `${tutor.name} wurde der Klasse hinzugefügt.`,
    });
    endDrag();
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
    unassignTutorFromClass(pendingRemoval.tutorId, pendingRemoval.classId);
    setPendingRemoval(null);
  };

  const handleDeleteTutor = () => {
    if (!deletingTutor) return;
    deleteTutor(deletingTutor.id);
    setDeletingTutor(null);
  };

  const tutorsForClass = (classId: string) => {
    return tutors.flatMap((tutor) => {
      const row = getClassAssignmentRows(tutor).find((r) => r.classId === classId);
      if (!row) return [];
      const v = effectiveVisibility(tutor);
      if (v === 'private' && !isMyTutor(tutor)) return [];
      if (v === 'private' && tutor.status === 'draft' && !showDrafts) return [];
      if ((v === 'internal' || v === 'public') && !showForeignTutors && !isMyTutor(tutor)) return [];
      return [{ tutor, assignment: row }];
    });
  };

  const laneDropHighlight = (zoneKey: Visibility) =>
    !!dragPayload &&
    dragOverLane === zoneKey &&
    canDropOnLane(zoneKey);

  const TutorSquareCard: React.FC<{
    tutor: TutorConfig;
    lane: Visibility;
  }> = ({ tutor, lane }) => {
    const mine = isMyTutor(tutor);
    const draft = tutor.status === 'draft';
    const theme = LANE_THEME[lane];

    return (
      <div
        className={cn(
          'group flex min-w-0 w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md select-none',
        )}
      >
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            onDragStart(e, tutor.id, 'lane');
          }}
          onDragEnd={onDragEnd}
          className={cn(
            'flex w-8 shrink-0 cursor-grab flex-col items-center justify-center border-r py-2 text-muted-foreground active:cursor-grabbing touch-none',
            theme.grip,
          )}
          style={{ WebkitUserDrag: 'element' } as React.CSSProperties}
          title="Zum Verschieben ziehen"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5 px-2 py-1.5">
          <div className="flex items-start justify-between gap-1">
            <span className="text-lg leading-none">{tutor.icon}</span>
            {mine && (
              <div className="flex shrink-0 gap-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/app/tutors/${tutor.id}/edit`);
                  }}
                  aria-label="Tutor bearbeiten"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="h-6 w-6 text-school-danger hover:bg-school-danger/10 hover:text-school-danger"
                  draggable={false}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingTutor(tutor);
                  }}
                  aria-label="Tutor löschen"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
          <p className="line-clamp-2 text-sm font-medium leading-tight">{tutor.name}</p>
          <p className="line-clamp-1 text-xs leading-tight text-muted-foreground">{tutor.subject}</p>
          <p className="line-clamp-1 text-[10px] leading-tight text-muted-foreground">
            {getTeacherName(tutor.createdBy)}
          </p>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {mine && (
              <Badge
                variant="outline"
                className="h-5 border-border px-1.5 py-0 text-[10px] font-normal text-foreground"
              >
                Eigener Tutor
              </Badge>
            )}
            {draft && (
              <Badge className="h-5 border border-school-danger/25 bg-school-danger/10 px-1.5 py-0 text-[10px] font-normal text-school-danger">
                Entwurf
              </Badge>
            )}
            {!draft && (
              <Badge
                variant="outline"
                className="h-5 border-border px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
              >
                Veröffentlicht
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  };

  const laneConfig: { key: Visibility; title: string; description: string; icon: typeof Lock }[] = [
    {
      key: 'private',
      title: 'Private',
      description: 'Nur für dich sichtbar (Entwürfe und private Tutoren)',
      icon: Lock,
    },
    {
      key: 'internal',
      title: 'Internal',
      description: 'Für Lehrergruppen sichtbar',
      icon: Building2,
    },
    {
      key: 'public',
      title: 'Public',
      description: 'Für alle Schüler und Lehrer freigegeben',
      icon: Globe,
    },
  ];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col p-4 md:p-6">
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] xl:grid-rows-[auto_minmax(0,1fr)] xl:items-stretch">
        <header className="shrink-0 xl:col-start-1 xl:row-start-1">
          <h1 className="text-2xl font-semibold">Tutoren</h1>
          <p className="text-sm text-muted-foreground">
            Sichtbarkeit am Griff links ziehen, rechts Klassen zuweisen.
          </p>
        </header>

        {/* Linke Spalte: „Tutor verwalten“ unter der Überschrift */}
        <Card className="relative flex min-h-0 flex-col overflow-hidden border-school-primary/15 bg-card shadow-md xl:col-start-1 xl:row-start-2 xl:min-h-0">
          <div
            className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-school-primary via-school-secondary to-school-accent"
            aria-hidden
          />
          <CardHeader className="relative shrink-0 space-y-3 border-b border-school-primary/10 bg-gradient-to-r from-school-primary/[0.07] via-school-secondary/[0.06] to-transparent pb-4 pl-5 pr-4 pt-6">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-base font-semibold leading-none tracking-tight text-foreground">
                  <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>Tutor verwalten</span>
                </div>
                <Button
                  size="sm"
                  className="h-7 shrink-0 gap-1 px-2.5 text-xs border border-school-primary/25 bg-school-primary text-white hover:bg-school-primary/90"
                  onClick={() => navigate('/app/tutors/new')}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Neuer Tutor
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Griff links greifen und in eine Spalte oder auf eine Klasse ziehen.
              </p>
            </div>

            <Collapsible open={!filterCollapsed} onOpenChange={(o) => setFilterCollapsed(!o)}>
              <div className="rounded-lg border border-school-primary/20 bg-background/80 px-3 py-2 shadow-sm backdrop-blur-sm dark:bg-card/60">
                <CollapsibleTrigger asChild>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-2 text-left text-sm font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-school-primary" />
                      Filter
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                        !filterCollapsed && 'rotate-180',
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-3 pt-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={middleSearch}
                      onChange={(e) => setMiddleSearch(e.target.value)}
                      className="pl-9"
                      placeholder="Suche: Name, Fach, Ersteller..."
                    />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
                    <Label htmlFor="draft-toggle" className="text-xs">
                      Drafts anzeigen
                    </Label>
                    <Switch id="draft-toggle" checked={showDrafts} onCheckedChange={setShowDrafts} />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-md border bg-background px-3 py-2">
                    <Label htmlFor="foreign-toggle" className="text-xs">
                      Fremde Tutoren (Internal/Public)
                    </Label>
                    <Switch
                      id="foreign-toggle"
                      checked={showForeignTutors}
                      onCheckedChange={setShowForeignTutors}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </CardHeader>

          <CardContent
            className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 pl-5 pr-4 scrollbar-thin"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverLane(null);
            }}
          >
            <div className="flex flex-col gap-6">
              {laneConfig.map((zone) => {
                const ZoneIcon = zone.icon;
                const list =
                  zone.key === 'private'
                    ? privateTutors
                    : zone.key === 'internal'
                      ? internalTutors
                      : publicTutors;
                const open = laneOpen[zone.key];
                const theme = LANE_THEME[zone.key];

                return (
                  <div
                    key={zone.key}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverLane(zone.key);
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverLane((prev) => (prev === zone.key ? null : prev));
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.types?.includes('text/plain')) {
                        e.dataTransfer.dropEffect = canDropOnLane(zone.key) ? 'move' : 'none';
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDropToVisibility(zone.key);
                    }}
                    className={cn(
                      'shrink-0 overflow-hidden rounded-lg border border-border bg-card shadow-sm',
                      theme.top,
                      laneDropHighlight(zone.key) &&
                        'ring-2 ring-dashed ring-school-primary/50 shadow-md',
                    )}
                  >
                    <Collapsible
                      open={open}
                      onOpenChange={(o) => setLaneOpen((prev) => ({ ...prev, [zone.key]: o }))}
                    >
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="flex w-full items-center justify-between gap-3 border-b border-border/80 bg-muted/25 px-2.5 py-2 text-left hover:bg-muted/40"
                        >
                          <div className="flex min-w-0 items-start gap-2.5">
                            <ZoneIcon className={cn('mt-0.5 h-4 w-4 shrink-0', theme.icon)} />
                            <div className="min-w-0 space-y-0.5">
                              <span
                                className={cn(
                                  'text-xs font-bold uppercase tracking-wide',
                                  theme.title,
                                )}
                              >
                                {zone.title}
                              </span>
                              <p className="text-xs text-muted-foreground">{zone.description}</p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant="secondary" className="tabular-nums">
                              {list.length}
                            </Badge>
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 text-muted-foreground transition-transform',
                                open && 'rotate-180',
                              )}
                            />
                          </div>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent
                        className={cn('border-t border-border/50 py-2', theme.contentBg)}
                      >
                        {list.length === 0 ? (
                          <p className="px-2.5 text-xs text-muted-foreground">
                            Tutor hierher ziehen (am Griff links) …
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 gap-2 px-2.5 sm:grid-cols-2 lg:grid-cols-3">
                            {list.map((t) => (
                              <TutorSquareCard key={t.id} tutor={t} lane={zone.key} />
                            ))}
                          </div>
                        )}
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Rechte Spalte: eine Zeile hoch, Karte bis oben (row-span 2) */}
        <Card className="flex min-h-0 flex-col overflow-hidden xl:col-start-2 xl:row-span-2 xl:row-start-1 xl:min-h-0">
          <CardHeader className="shrink-0 space-y-3 border-b pb-4 pt-6 xl:pt-4">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
              Klassen zuweisen
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                className="pl-9"
                placeholder="Klassen suchen (z.B. 4, ahif, …)"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Nur veröffentlichte Tutoren aus Internal/Public hier ablegen.
            </p>
          </CardHeader>

          <CardContent
            className="min-h-0 flex-1 space-y-0 overflow-y-auto overscroll-contain px-0 py-3 scrollbar-thin"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverLane(null);
              setDragOverClassId(null);
              if (e.dataTransfer.types?.includes('text/plain')) {
                e.dataTransfer.dropEffect = canAssignToClass ? 'move' : 'none';
              }
            }}
          >
              {classesByDepartment.length === 0 ? (
                <p className="px-6 text-sm text-muted-foreground">Keine Klassen gefunden.</p>
              ) : (
                classesByDepartment.map(([dept, deptClasses]) => (
                  <Collapsible
                    key={dept}
                    open={deptOpen[dept] ?? false}
                    onOpenChange={(o) => setDeptOpen((p) => ({ ...p, [dept]: o }))}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-school-primary hover:bg-muted/30"
                      >
                        <span>Abt. {dept}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                            deptOpen[dept] && 'rotate-180',
                          )}
                        />
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="mx-auto w-full max-w-md space-y-2 px-3 py-3">
                        {deptClasses.map((classItem) => {
                          const assigned = tutorsForClass(classItem.id);
                          const co = classOpen[classItem.id] ?? false;
                          return (
                            <div
                              key={classItem.id}
                              onDragEnter={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverClassId(classItem.id);
                              }}
                              onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (e.dataTransfer.types?.includes('text/plain')) {
                                  e.dataTransfer.dropEffect = canAssignToClass ? 'move' : 'none';
                                }
                              }}
                              onDragLeave={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                  setDragOverClassId((id) =>
                                    id === classItem.id ? null : id,
                                  );
                                }
                              }}
                              onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onDropToClass(classItem.id);
                              }}
                              className={cn(
                                'overflow-hidden rounded-lg border border-border bg-card shadow-sm',
                                canAssignToClass &&
                                  dragOverClassId === classItem.id &&
                                  'ring-2 ring-dashed ring-school-primary/60',
                              )}
                            >
                              <Collapsible
                                open={co}
                                onOpenChange={(o) =>
                                  setClassOpen((p) => ({ ...p, [classItem.id]: o }))
                                }
                              >
                                <CollapsibleTrigger asChild>
                                  <button
                                    type="button"
                                    className="flex w-full items-center justify-between gap-2 border-b border-border/60 bg-muted/15 px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/30"
                                  >
                                    <span>{classItem.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs tabular-nums text-muted-foreground">
                                        {assigned.length}
                                      </span>
                                      <ChevronDown
                                        className={cn(
                                          'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
                                          co && 'rotate-180',
                                        )}
                                      />
                                    </div>
                                  </button>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-3">
                                    {assigned.length === 0 ? (
                                      <div className="flex min-h-[3.25rem] items-center justify-center">
                                        <p className="text-center text-xs text-muted-foreground">
                                          Tutor hier ablegen…
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="divide-y divide-border/60 rounded-md border border-border/60 bg-background/60">
                                        {assigned.map(({ tutor, assignment }) => (
                                          <div
                                            key={`${classItem.id}-${tutor.id}`}
                                            className="flex items-start gap-2 px-2 py-2 text-xs"
                                          >
                                            <div className="min-w-0 flex-1">
                                              <p className="truncate text-sm font-medium">
                                                {tutor.icon} {tutor.name}
                                              </p>
                                              <p className="text-muted-foreground">
                                                {assignment.assignedById === uid ? (
                                                  <span className="text-school-primary">
                                                    Zugewiesen von mir
                                                  </span>
                                                ) : (
                                                  <>
                                                    Zugewiesen von{' '}
                                                    {getTeacherName(assignment.assignedById)}
                                                  </>
                                                )}
                                              </p>
                                              {tutor.createdBy !== uid && (
                                                <p className="mt-0.5 text-[10px] text-muted-foreground">
                                                  Tutor erstellt von{' '}
                                                  {getTeacherName(tutor.createdBy)}
                                                </p>
                                              )}
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="icon-sm"
                                              className="shrink-0"
                                              onClick={() =>
                                                confirmRemoveTutorFromClass(tutor.id, classItem.id)
                                              }
                                              aria-label="Zuweisung entfernen"
                                            >
                                              <X className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          );
                        })}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!pendingRemoval} onOpenChange={() => setPendingRemoval(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutor aus Klasse entfernen?</AlertDialogTitle>
            <AlertDialogDescription>
              „{pendingRemoval?.tutorName}“ aus „{pendingRemoval?.className}“ entfernen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={removeTutorFromClass}>Entfernen</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingTutor} onOpenChange={() => setDeletingTutor(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutor löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du „{deletingTutor?.name}“ wirklich löschen? Das kann nicht rückgängig gemacht
              werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTutor}
              className="bg-school-danger text-white hover:bg-school-danger/90"
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
