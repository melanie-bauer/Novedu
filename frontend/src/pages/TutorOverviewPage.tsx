import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { getTeacherName, subjectOptions } from '@/data/mockData';
import { Class, TutorConfig } from '@/types';
import {
  ArrowRightLeft,
  Building2,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  GripVertical,
  Globe,
  Lock,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  Users,
  X,
} from 'lucide-react';

type Visibility = 'private' | 'internal' | 'public';

interface DragPayload {
  tutorId: string;
  fromVisibility?: Visibility;
}

interface PendingDelete {
  tutorId: string;
  tutorName: string;
  classCount: number;
}

const visibilityMeta: Record<
  Visibility,
  {
    title: string;
    description: string;
    accent: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  private: {
    title: 'Privat',
    description: 'Nur für dich sichtbar. Entwürfe bleiben hier.',
    accent: 'border-l-[#0a529a]',
    icon: Lock,
  },
  internal: {
    title: 'Intern',
    description: 'Für alle Lehrpersonen sichtbar.',
    accent: 'border-l-[#86b5d7]',
    icon: Building2,
  },
  public: {
    title: 'Öffentlich',
    description: 'Für alle Schüler und Lehrpersonen sichtbar.',
    accent: 'border-l-[#dc931a]',
    icon: Globe,
  },
};

const visibilityOrder: Visibility[] = ['private', 'internal', 'public'];

const getInitialVisibility = (tutor: TutorConfig): Visibility => {
  if (tutor.visibility) return tutor.visibility;
  return 'private';
};

const getVisibleLane = (tutor: TutorConfig, currentUserId: string): Visibility | null => {
  const visibility = getInitialVisibility(tutor);
  if (visibility === 'private' && tutor.createdBy !== currentUserId) return null;
  return visibility;
};

const getClassDepartment = (classItem: Class): string => {
  const normalized = classItem.name.toUpperCase();
  if (normalized.includes('HIF') || normalized.includes('AHIF')) return 'ABT. INFORMATIK';
  if (normalized.includes('HEL')) return 'ABT. ELEKTRONIK';
  if (normalized.includes('HME')) return 'ABT. MEDIENTECHNIK';
  if (normalized.includes('HMB')) return 'ABT. MEDIZINTECHNIK';
  return 'ABT. FACHSCHULE';
};

const isFilterActive = (query: string, subjects: string[], showDrafts: boolean, mineOnly: boolean) =>
  query.trim().length > 0 || subjects.length > 0 || !showDrafts || mineOnly;

const badgePillClass = 'h-6 rounded-full px-3 text-xs font-semibold';
const subjectBadgeClasses: Record<string, string> = {
  Mathematik:
    'border-[#0a529a] bg-[#0a529a] text-white hover:bg-[#0a529a] dark:border-[#86b5d7] dark:bg-[#0a529a] dark:text-white dark:hover:bg-[#0a529a]',
  Deutsch:
    'border-[#86b5d7] bg-[#86b5d7]/30 text-[#0a529a] hover:bg-[#86b5d7]/30 dark:border-[#86b5d7] dark:bg-[#86b5d7]/25 dark:text-[#dcecf7] dark:hover:bg-[#86b5d7]/25',
  Physik:
    'border-[#dc931a] bg-[#dc931a]/18 text-[#8a5908] hover:bg-[#dc931a]/18 dark:border-[#dc931a] dark:bg-[#dc931a]/25 dark:text-[#ffe0a6] dark:hover:bg-[#dc931a]/25',
  Englisch:
    'border-[#a2122a] bg-[#a2122a]/12 text-[#a2122a] hover:bg-[#a2122a]/12 dark:border-[#a2122a] dark:bg-[#a2122a]/25 dark:text-[#ffd7df] dark:hover:bg-[#a2122a]/25',
  default:
    'border-slate-400 bg-slate-100 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-800',
};
const ownBadgeClass =
  'border-[#dc931a] bg-[#dc931a]/14 text-[#8a5908] hover:bg-[#dc931a]/14 dark:border-[#dc931a]/75 dark:bg-[#dc931a]/22 dark:text-[#ffe0a6] dark:hover:bg-[#dc931a]/22';
const foreignBadgeClass =
  'border-[#a2122a]/40 bg-[#a2122a]/10 text-[#a2122a] hover:bg-[#a2122a]/10 dark:border-[#a2122a]/70 dark:bg-[#a2122a]/25 dark:text-[#ffd7df] dark:hover:bg-[#a2122a]/25';
const draftBadgeClass =
  'border-[#dc931a]/60 bg-[#dc931a]/15 text-[#8a5908] hover:bg-[#dc931a]/15 dark:border-[#dc931a]/70 dark:bg-[#dc931a]/25 dark:text-[#ffe0a6] dark:hover:bg-[#dc931a]/25';
const countBadgeClass =
  'border-[#86b5d7] bg-[#86b5d7]/20 text-[#0a529a] hover:bg-[#86b5d7]/20 dark:border-[#86b5d7]/60 dark:bg-[#86b5d7]/15 dark:text-[#dcecf7] dark:hover:bg-[#86b5d7]/15';
const searchInputClass = 'bg-white text-foreground dark:bg-slate-900';
const panelBgClass = 'bg-[#f8fbfd] dark:bg-card';

const getSubjectBadgeClass = (subject: string) => subjectBadgeClasses[subject] || subjectBadgeClasses.default;

const TutorOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { tutors, classes, updateTutor, deleteTutor } = useData();
  const pageRef = useRef<HTMLDivElement | null>(null);

  const [nameQuery, setNameQuery] = useState('');
  const [subjectQuery, setSubjectQuery] = useState('');
  const [subjectFilterOpen, setSubjectFilterOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [showDrafts, setShowDrafts] = useState(true);
  const [showMineOnly, setShowMineOnly] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const [collapsedVisibilities, setCollapsedVisibilities] = useState<Record<Visibility, boolean>>({
    private: false,
    internal: false,
    public: false,
  });
  const [collapsedDepartments, setCollapsedDepartments] = useState<Record<string, boolean>>({});
  const [collapsedClasses, setCollapsedClasses] = useState<Record<string, boolean>>({});
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dragOverVisibility, setDragOverVisibility] = useState<Visibility | null>(null);
  const [dragOverClassId, setDragOverClassId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [mobileAssignTutor, setMobileAssignTutor] = useState<TutorConfig | null>(null);
  const [orderedTutorIds, setOrderedTutorIds] = useState<string[]>(() => tutors.map((tutor) => tutor.id));
  const [assignmentOwners, setAssignmentOwners] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    tutors.forEach((tutor) => {
      tutor.assignedClasses.forEach((classId) => {
        initial[`${tutor.id}:${classId}`] = tutor.createdBy;
      });
    });
    return initial;
  });

  const currentUserId = user?.id || '';
  const activeFilter = isFilterActive(nameQuery, selectedSubjects, showDrafts, showMineOnly);

  const autoScrollDuringDrag = (event: React.DragEvent) => {
    if (!dragPayload || !pageRef.current) return;

    const container = pageRef.current;
    const rect = container.getBoundingClientRect();
    const edgeSize = 96;
    const maxStep = 24;
    const topDistance = event.clientY - rect.top;
    const bottomDistance = rect.bottom - event.clientY;

    if (topDistance < edgeSize) {
      const strength = Math.max(0.15, Math.min(1, (edgeSize - topDistance) / edgeSize));
      container.scrollBy({ top: -maxStep * strength, behavior: 'auto' });
    } else if (bottomDistance < edgeSize) {
      const strength = Math.max(0.15, Math.min(1, (edgeSize - bottomDistance) / edgeSize));
      container.scrollBy({ top: maxStep * strength, behavior: 'auto' });
    }
  };

  useEffect(() => {
    setOrderedTutorIds((prev) => {
      const knownIds = new Set(prev);
      const nextIds = tutors.map((tutor) => tutor.id);
      return [...prev.filter((id) => nextIds.includes(id)), ...nextIds.filter((id) => !knownIds.has(id))];
    });
  }, [tutors]);

  useEffect(() => {
    setAssignmentOwners((prev) => {
      const next = { ...prev };
      tutors.forEach((tutor) => {
        tutor.assignedClasses.forEach((classId) => {
          const key = `${tutor.id}:${classId}`;
          if (!next[key]) next[key] = tutor.createdBy;
        });
      });
      return next;
    });
  }, [tutors]);

  const subjectSuggestions = useMemo(() => {
    const query = subjectQuery.trim().toLowerCase();
    return subjectOptions
      .filter((subject) => !selectedSubjects.includes(subject))
      .filter((subject) => (query ? subject.toLowerCase().includes(query) : true))
      .slice(0, 6);
  }, [selectedSubjects, subjectQuery]);

  const filteredTutors = useMemo(() => {
    const query = nameQuery.trim().toLowerCase();

    const orderIndex = new Map(orderedTutorIds.map((id, index) => [id, index]));

    return tutors.filter((tutor) => {
      const visibleLane = getVisibleLane(tutor, currentUserId);
      if (!visibleLane) return false;

      const teacherName = getTeacherName(tutor.createdBy).toLowerCase();
      const matchesQuery =
        !query ||
        tutor.name.toLowerCase().includes(query) ||
        tutor.subject.toLowerCase().includes(query) ||
        tutor.description.toLowerCase().includes(query) ||
        teacherName.includes(query);
      const matchesSubject = selectedSubjects.length === 0 || selectedSubjects.includes(tutor.subject);
      const matchesDraft = showDrafts || tutor.status !== 'draft';
      const matchesOwner = !showMineOnly || tutor.createdBy === currentUserId;

      return matchesQuery && matchesSubject && matchesDraft && matchesOwner;
    }).sort((a, b) => (orderIndex.get(a.id) ?? 9999) - (orderIndex.get(b.id) ?? 9999));
  }, [currentUserId, nameQuery, orderedTutorIds, selectedSubjects, showDrafts, showMineOnly, tutors]);

  const tutorsByVisibility = useMemo(() => {
    const grouped: Record<Visibility, TutorConfig[]> = {
      private: [],
      internal: [],
      public: [],
    };

    filteredTutors.forEach((tutor) => {
      const lane = getVisibleLane(tutor, currentUserId);
      if (lane) grouped[lane].push(tutor);
    });

    return grouped;
  }, [currentUserId, filteredTutors]);

  const totalByVisibility = useMemo(() => {
    return tutors.reduce(
      (acc, tutor) => {
        const lane = getVisibleLane(tutor, currentUserId);
        if (lane) acc[lane] += 1;
        return acc;
      },
      { private: 0, internal: 0, public: 0 } as Record<Visibility, number>,
    );
  }, [currentUserId, tutors]);

  const filteredClasses = useMemo(() => {
    const query = classSearch.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((classItem) => classItem.name.toLowerCase().includes(query));
  }, [classSearch, classes]);

  const classesByDepartment = useMemo(() => {
    return filteredClasses.reduce<Record<string, Class[]>>((acc, classItem) => {
      const department = getClassDepartment(classItem);
      acc[department] = acc[department] || [];
      acc[department].push(classItem);
      return acc;
    }, {});
  }, [filteredClasses]);

  const addSubjectFilter = (subject: string) => {
    setSelectedSubjects((prev) => (prev.includes(subject) ? prev : [...prev, subject]));
    setSubjectQuery('');
    setSubjectFilterOpen(false);
  };

  const removeSubjectFilter = (subject: string) => {
    setSelectedSubjects((prev) => prev.filter((item) => item !== subject));
  };

  const showToast = (title: string, description: string, tone: 'success' | 'warning' | 'error' = 'success') => {
    toast({
      title,
      description,
      variant: tone === 'error' ? 'destructive' : 'default',
      className:
        tone === 'success'
          ? 'border-[#86b5d7] bg-[#86b5d7]/20 text-[#0a529a]'
          : tone === 'warning'
            ? 'border-[#dc931a] bg-[#dc931a]/15 text-[#8a5908]'
            : undefined,
    });
  };

  const canDropToVisibility = (tutor: TutorConfig, visibility: Visibility) => {
    if (tutor.createdBy !== currentUserId) return false;
    if (tutor.status === 'draft' && visibility !== 'private') return false;
    return true;
  };

  const onDragStart = (tutor: TutorConfig, fromVisibility: Visibility) => {
    setDragPayload({ tutorId: tutor.id, fromVisibility });
  };

  const onDragEnd = () => {
    setDragPayload(null);
    setDragOverVisibility(null);
    setDragOverClassId(null);
  };

  const onDropToVisibility = (visibility: Visibility) => {
    if (!dragPayload) return;

    const tutor = tutors.find((item) => item.id === dragPayload.tutorId);
    if (!tutor) return onDragEnd();

    if (!canDropToVisibility(tutor, visibility)) {
      const isForeign = tutor.createdBy !== currentUserId;
      showToast(
        'Verschieben nicht möglich',
        isForeign
          ? 'Du kannst die Sichtbarkeit nur bei eigenen Tutoren ändern.'
          : 'Entwürfe können erst nach dem Veröffentlichen intern oder öffentlich sichtbar werden.',
        'warning',
      );
      return onDragEnd();
    }

    if (getInitialVisibility(tutor) === visibility) {
      return onDragEnd();
    }

    updateTutor(tutor.id, {
      visibility,
      internalVisibility: visibility === 'internal' ? 'allTeachers' : undefined,
    });

    showToast('Sichtbarkeit geändert', `${tutor.name} ist jetzt ${visibilityMeta[visibility].title.toLowerCase()}.`);
    onDragEnd();
  };

  const assignTutorToClass = (tutor: TutorConfig, classItem: Class) => {
    if (tutor.status === 'draft') {
      showToast(
        'Entwurf nicht zuweisbar',
        'Entwürfe müssen zuerst veröffentlicht werden, bevor sie Klassen zugewiesen werden.',
        'warning',
      );
      return false;
    }

    if (tutor.assignedClasses.includes(classItem.id)) {
      showToast('Bereits zugewiesen', `${tutor.name} ist ${classItem.name} schon zugewiesen.`, 'warning');
      return false;
    }

    updateTutor(tutor.id, {
      assignedClasses: [...tutor.assignedClasses, classItem.id],
    });
    setAssignmentOwners((prev) => ({
      ...prev,
      [`${tutor.id}:${classItem.id}`]: currentUserId,
    }));

    showToast('Tutor zugewiesen', `${tutor.name} wurde ${classItem.name} zugewiesen.`);
    return true;
  };

  const onDropToClass = (classItem: Class) => {
    if (!dragPayload) return;
    const tutor = tutors.find((item) => item.id === dragPayload.tutorId);
    if (tutor) assignTutorToClass(tutor, classItem);
    onDragEnd();
  };

  const removeTutorFromClass = (tutor: TutorConfig, classItem: Class) => {
    const assignmentOwner = assignmentOwners[`${tutor.id}:${classItem.id}`] || tutor.createdBy;
    if (assignmentOwner !== currentUserId) {
      showToast(
        'Nicht möglich',
        'Diese Zuweisung kommt von einer anderen Lehrperson und kann von dir nicht entfernt werden.',
        'warning',
      );
      return;
    }

    updateTutor(tutor.id, {
      assignedClasses: tutor.assignedClasses.filter((classId) => classId !== classItem.id),
    });
    setAssignmentOwners((prev) => {
      const next = { ...prev };
      delete next[`${tutor.id}:${classItem.id}`];
      return next;
    });
    showToast('Zuweisung entfernt', `${tutor.name} wurde aus ${classItem.name} entfernt.`);
  };

  const confirmDeleteTutor = (tutor: TutorConfig) => {
    if (tutor.createdBy !== currentUserId) return;

    setPendingDelete({
      tutorId: tutor.id,
      tutorName: tutor.name,
      classCount: tutor.assignedClasses.length,
    });
  };

  const executeDeleteTutor = () => {
    if (!pendingDelete) return;

    deleteTutor(pendingDelete.tutorId);
    showToast('Tutor gelöscht', `${pendingDelete.tutorName} wurde entfernt.`);
    setPendingDelete(null);
  };

  const renderCount = (visibility: Visibility) => {
    const visible = tutorsByVisibility[visibility].length;
    const total = totalByVisibility[visibility];
    return activeFilter ? `${visible} von ${total}` : `${total}`;
  };

  const renderTutorCard = (tutor: TutorConfig, visibility: Visibility) => {
    const isOwn = tutor.createdBy === currentUserId;
    const isDraft = tutor.status === 'draft';

    return (
      <div
        key={tutor.id}
        draggable
        onDragStart={() => onDragStart(tutor, visibility)}
        onDragEnd={onDragEnd}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.stopPropagation();
          onDragEnd();
        }}
        className={cn(
          'group flex min-h-[210px] flex-col rounded-lg border bg-card p-4 shadow-sm transition-all cursor-grab active:cursor-grabbing',
          'hover:border-[#86b5d7] hover:shadow-md',
          dragPayload?.tutorId === tutor.id && 'opacity-50 ring-2 ring-primary/40',
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 text-muted-foreground">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => navigate(`/app/tutors/${tutor.id}/view`)}
              aria-label="Tutor ansehen"
              title="Tutor ansehen"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {isOwn && (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigate(`/app/tutors/${tutor.id}/edit`)}
                  aria-label="Tutor bearbeiten"
                  title="Tutor bearbeiten"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-[#a2122a] hover:bg-[#a2122a]/10 hover:text-[#a2122a]"
                  onClick={() => confirmDeleteTutor(tutor)}
                  aria-label="Tutor löschen"
                  title="Tutor löschen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-background text-2xl">
            {tutor.icon}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold leading-tight">{tutor.name}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Erstellt von {getTeacherName(tutor.createdBy)}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge variant="outline" className={cn(badgePillClass, getSubjectBadgeClass(tutor.subject))}>
            {tutor.subject}
          </Badge>
          {isDraft && (
            <Badge variant="outline" className={cn(badgePillClass, draftBadgeClass)}>
              Entwurf
            </Badge>
          )}
          {isOwn && (
            <Badge variant="outline" className={cn(badgePillClass, ownBadgeClass)}>
              Eigener Tutor
            </Badge>
          )}
          {!isOwn && (
            <Badge variant="outline" className={cn(badgePillClass, foreignBadgeClass)}>
              Fremder Tutor
            </Badge>
          )}
        </div>

        <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground">{tutor.description}</p>

        <div className="mt-4 border-t pt-3 md:hidden">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            disabled={isDraft}
            onClick={() => setMobileAssignTutor(tutor)}
          >
            <Users className="h-3.5 w-3.5" />
            Klassen
          </Button>
        </div>
      </div>
    );
  };

  const renderClassCard = (classItem: Class) => {
    const assignedTutors = tutors.filter((tutor) => tutor.assignedClasses.includes(classItem.id));
    const isActiveDrop = dragOverClassId === classItem.id;
    const isCollapsed = collapsedClasses[classItem.id] ?? false;

    return (
      <div
        key={classItem.id}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOverClassId(classItem.id);
        }}
        onDragLeave={() => setDragOverClassId(null)}
        onDrop={() => onDropToClass(classItem)}
        className={cn(
          'overflow-hidden rounded-lg border bg-card transition-all',
          isActiveDrop && 'border-[#0a529a] bg-[#86b5d7]/15 shadow-md ring-2 ring-[#86b5d7]/40',
        )}
      >
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 border-b bg-muted/25 px-3 py-3 text-left"
          onClick={(event) => {
            event.stopPropagation();
            setCollapsedClasses((prev) => ({
              ...prev,
              [classItem.id]: !prev[classItem.id],
            }));
          }}
        >
          <p className="font-semibold">{classItem.name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn(badgePillClass, countBadgeClass)}>
              {assignedTutors.length}
            </Badge>
            <ChevronDown className={cn('h-4 w-4 transition-transform', isCollapsed && '-rotate-90')} />
          </div>
        </button>

        {!isCollapsed && (
          <div className="p-3">
            {assignedTutors.length === 0 ? (
              <div className="rounded-md border border-dashed bg-muted/30 px-3 py-5 text-center text-xs text-muted-foreground">
                Tutor hier ablegen
              </div>
            ) : (
              <div className="space-y-2">
                {assignedTutors.map((tutor) => {
                  const assignmentOwner = assignmentOwners[`${tutor.id}:${classItem.id}`] || tutor.createdBy;
                  const isOwnAssignment = assignmentOwner === currentUserId;
                  return (
                    <div
                      key={`${classItem.id}-${tutor.id}`}
                      className="flex items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {tutor.icon} {tutor.name}
                        </p>
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                          <span className="truncate text-xs text-muted-foreground">
                            {tutor.subject} - {getTeacherName(tutor.createdBy)}
                          </span>
                          {!isOwnAssignment && (
                            <Badge variant="outline" className={cn('shrink-0', badgePillClass, foreignBadgeClass)}>
                              von anderer Lehrperson
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isOwnAssignment ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="shrink-0 text-muted-foreground hover:text-[#a2122a]"
                          onClick={() => removeTutorFromClass(tutor, classItem)}
                          aria-label="Tutor von Klasse entfernen"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Eye className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderMobileAssignmentContent = () => {
    if (!mobileAssignTutor) return null;

    return (
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={classSearch}
            onChange={(event) => setClassSearch(event.target.value)}
            className={cn('pl-9', searchInputClass)}
            placeholder="Klasse suchen..."
          />
        </div>
        <div className="max-h-[55vh] space-y-2 overflow-auto pr-1">
          {filteredClasses.map((classItem) => {
            const assigned = mobileAssignTutor.assignedClasses.includes(classItem.id);
            return (
              <button
                key={classItem.id}
                type="button"
                className={cn(
                  'flex w-full items-center justify-between rounded-lg border p-3 text-left transition-colors',
                  assigned ? 'border-[#86b5d7] bg-[#86b5d7]/15' : 'bg-card hover:bg-muted/50',
                )}
                onClick={() => {
                  if (!assigned && assignTutorToClass(mobileAssignTutor, classItem)) {
                    setMobileAssignTutor((prev) =>
                      prev ? { ...prev, assignedClasses: [...prev.assignedClasses, classItem.id] } : prev,
                    );
                  }
                }}
              >
                <span>
                  <span className="block font-medium">{classItem.name}</span>
                  <span className="text-xs text-muted-foreground">{getClassDepartment(classItem)}</span>
                </span>
                {assigned ? (
                  <Badge variant="secondary">Zugewiesen</Badge>
                ) : (
                  <Badge variant="outline">Zuweisen</Badge>
                )}
              </button>
            );
          })}
          {filteredClasses.length === 0 && (
            <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
              Keine Klasse gefunden.
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={pageRef}
      onDragOver={autoScrollDuringDrag}
      className="h-full overflow-auto bg-[#f3f7fa] dark:bg-background"
    >

      <div className="grid items-start grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_430px]">
        <Card className={cn('overflow-hidden rounded-lg border shadow-sm', panelBgClass)}>
          <CardHeader className={cn('border-b pb-4', panelBgClass)}>
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ArrowRightLeft className="h-4 w-4" />
                  Tutoren verwalten
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Karten am Griff ziehen. Entwürfe bleiben privat und können keiner Klasse zugewiesen werden.
                </p>
              </div>
              <Button onClick={() => navigate('/app/tutors/new')} className="w-full shrink-0 xl:w-auto">
                <Plus className="h-4 w-4" />
                Neuer Tutor
              </Button>
            </div>

            <div className={cn('mt-4 rounded-lg border', panelBgClass)}>
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
                onClick={() => setFiltersOpen((prev) => !prev)}
              >
                <span className="flex items-center gap-2 font-medium">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                  {activeFilter && <Badge variant="secondary">aktiv</Badge>}
                </span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', !filtersOpen && '-rotate-90')} />
              </button>

              {filtersOpen && (
                <div className="space-y-3 border-t p-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={nameQuery}
                      onChange={(event) => setNameQuery(event.target.value)}
                      className={cn('pl-9', searchInputClass)}
                      placeholder="Name, Fach oder Ersteller suchen..."
                    />
                  </div>

                  <div className="relative">
                    <div className={cn('flex min-h-10 items-center gap-1.5 rounded-lg border px-2 py-1 focus-within:ring-2 focus-within:ring-ring', searchInputClass)}>
                      <SlidersHorizontal className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
                        {selectedSubjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="gap-1">
                            {subject}
                            <button
                              type="button"
                              onClick={() => removeSubjectFilter(subject)}
                              className="rounded-full hover:text-foreground"
                              aria-label={`${subject} entfernen`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        <input
                          value={subjectQuery}
                          onChange={(event) => setSubjectQuery(event.target.value)}
                          onFocus={() => setSubjectFilterOpen(true)}
                          onBlur={() => window.setTimeout(() => setSubjectFilterOpen(false), 100)}
                          className="min-w-[11rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground"
                          placeholder={selectedSubjects.length ? 'weiteres Fach...' : 'Fächer filtern...'}
                        />
                      </div>
                    </div>
                    {subjectFilterOpen && subjectSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 top-[calc(100%+0.25rem)] z-20 rounded-lg border bg-popover p-1 shadow-md">
                        {subjectSuggestions.map((subject) => (
                          <button
                            key={subject}
                            type="button"
                            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              addSubjectFilter(subject);
                            }}
                          >
                            {subject}
                            <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 lg:max-w-xl">
                    <label className="flex h-10 items-center justify-between gap-3 rounded-lg border bg-card px-3 text-sm">
                      <span>Entwürfe</span>
                      <Switch checked={showDrafts} onCheckedChange={setShowDrafts} />
                    </label>
                    <label className="flex h-10 items-center justify-between gap-3 rounded-lg border bg-card px-3 text-sm">
                      <span>Nur eigene</span>
                      <Switch checked={showMineOnly} onCheckedChange={setShowMineOnly} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-4">
            <div className="space-y-4">
              {visibilityOrder.map((visibility) => {
                const meta = visibilityMeta[visibility];
                const Icon = meta.icon;
                const isCollapsed = collapsedVisibilities[visibility];
                const draggedTutor = dragPayload ? tutors.find((item) => item.id === dragPayload.tutorId) : null;
                const invalidDrop = !!draggedTutor && !canDropToVisibility(draggedTutor, visibility);

                return (
                  <section
                    key={visibility}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDragOverVisibility(visibility);
                    }}
                    onDragLeave={() => setDragOverVisibility(null)}
                    onDrop={() => onDropToVisibility(visibility)}
                    className={cn(
                      'overflow-hidden rounded-lg border border-l-4 bg-card shadow-sm transition-all',
                      meta.accent,
                      dragOverVisibility === visibility && !invalidDrop && 'ring-2 ring-primary/25',
                      dragOverVisibility === visibility && invalidDrop && 'border-[#a2122a]/45 bg-[#a2122a]/10 ring-2 ring-[#a2122a]/25',
                    )}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 border-b bg-muted/35 px-4 py-3 text-left"
                      onClick={() =>
                        setCollapsedVisibilities((prev) => ({
                          ...prev,
                          [visibility]: !prev[visibility],
                        }))
                      }
                    >
                      <span className="flex min-w-0 items-start gap-3">
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-card">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="min-w-0">
                          <span className="font-semibold">{meta.title}</span>
                          <span className="mt-1 block text-sm text-muted-foreground">{meta.description}</span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <Badge variant="outline" className={cn(badgePillClass, countBadgeClass)}>
                          {renderCount(visibility)}
                        </Badge>
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isCollapsed && '-rotate-90')} />
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 p-3">
                        {tutorsByVisibility[visibility].map((tutor) => renderTutorCard(tutor, visibility))}
                        {tutorsByVisibility[visibility].length === 0 && (
                          <div className="col-span-full rounded-lg border border-dashed bg-muted/20 px-4 py-8 text-center">
                            <ChevronsUpDown className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
                            <p className="text-sm font-medium">Tutor hierhin ziehen</p>
                            <p className="text-xs text-muted-foreground">
                              Diese Fläche wird beim Ziehen deutlich markiert.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className={cn('hidden overflow-hidden rounded-lg border shadow-sm md:block', panelBgClass)}>
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Klassen zuweisen
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={classSearch}
                onChange={(event) => setClassSearch(event.target.value)}
                className={cn('pl-9', searchInputClass)}
                placeholder="Klassen suchen (z.B. 4, ahif, ...)"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Veröffentlichte Tutoren aus der Mitte auf eine Klasse ziehen.
            </p>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {Object.entries(classesByDepartment).map(([department, departmentClasses]) => {
                const isCollapsed = collapsedDepartments[department] ?? true;
                return (
                  <section key={department} className="overflow-hidden rounded-lg border bg-card">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 border-b bg-muted/30 px-3 py-2 text-left"
                      onClick={() =>
                        setCollapsedDepartments((prev) => ({
                          ...prev,
                          [department]: !prev[department],
                        }))
                      }
                    >
                      <span className="text-sm font-semibold tracking-wide text-primary">{department}</span>
                      <span className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(badgePillClass, countBadgeClass)}>
                          {departmentClasses.length}
                        </Badge>
                        <ChevronDown className={cn('h-4 w-4 transition-transform', isCollapsed && '-rotate-90')} />
                      </span>
                    </button>
                    {!isCollapsed && <div className="space-y-3 p-3">{departmentClasses.map(renderClassCard)}</div>}
                  </section>
                );
              })}
              {filteredClasses.length === 0 && (
                <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Keine passende Klasse gefunden.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tutor wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.tutorName} wird vollständig gelöscht. Dabei werden auch alle
              Klassenzuweisungen dieses Tutors entfernt
              {pendingDelete?.classCount ? ` (${pendingDelete.classCount} Klasse(n)).` : '.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={executeDeleteTutor} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Drawer open={!!mobileAssignTutor} onOpenChange={(open) => !open && setMobileAssignTutor(null)}>
        <DrawerContent className="md:hidden">
          <DrawerHeader>
            <DrawerTitle>Klassen zuweisen</DrawerTitle>
            <DrawerDescription>
              {mobileAssignTutor?.name} kann mehreren Klassen gleichzeitig zugewiesen werden.
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{renderMobileAssignmentContent()}</div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TutorOverviewPage;
