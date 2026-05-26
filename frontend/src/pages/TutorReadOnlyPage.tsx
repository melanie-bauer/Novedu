import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { didacticModes, getTeacherName, mockAIProviders } from '@/data/mockData';
import {
  ArrowLeft,
  Bot,
  BookOpen,
  CalendarDays,
  Eye,
  FileText,
  Lock,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';

const visibilityLabels: Record<string, string> = {
  private: 'Privat',
  internal: 'Intern',
  public: 'Öffentlich',
};

const booleanLabel = (value?: boolean) => (value ? 'Ja' : 'Nein');
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
const publishedBadgeClass =
  'border-[#86b5d7] bg-[#86b5d7]/35 text-[#0a529a] hover:bg-[#86b5d7]/35 dark:border-[#86b5d7] dark:bg-[#86b5d7]/22 dark:text-[#dcecf7] dark:hover:bg-[#86b5d7]/22';
const draftBadgeClass =
  'border-[#dc931a]/60 bg-[#dc931a]/15 text-[#8a5908] hover:bg-[#dc931a]/15 dark:border-[#dc931a]/70 dark:bg-[#dc931a]/25 dark:text-[#ffe0a6] dark:hover:bg-[#dc931a]/25';
const panelBgClass = 'bg-[#f8fbfd] dark:bg-card';
const getSubjectBadgeClass = (subject: string) => subjectBadgeClasses[subject] || subjectBadgeClasses.default;

const TutorReadOnlyPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTutorById, classes } = useData();

  const tutor = getTutorById(id || '');

  if (!tutor) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md text-center">
          <Bot className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="text-xl font-semibold">Tutor nicht gefunden</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Der Tutor wurde gelöscht oder ist nicht mehr verfügbar.
          </p>
          <Button className="mt-4" onClick={() => navigate('/app/tutors')}>
            <ArrowLeft className="h-4 w-4" />
            Zurück
          </Button>
        </div>
      </div>
    );
  }

  const provider = mockAIProviders.find((item) => item.models.some((model) => model.id === tutor.model));
  const model = provider?.models.find((item) => item.id === tutor.model);
  const didacticMode = didacticModes.find((item) => item.value === tutor.didacticMode);
  const assignedClasses = classes.filter((classItem) => tutor.assignedClasses.includes(classItem.id));
  const isOwn = tutor.createdBy === user?.id;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#f3f7fa] dark:bg-background">
      <header className="border-b bg-[#f8fbfd] px-4 py-4 dark:bg-card sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon-sm" onClick={() => navigate('/app/tutors')} aria-label="Zurück">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted text-2xl">
              {tutor.icon}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">{tutor.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={cn(badgePillClass, getSubjectBadgeClass(tutor.subject))}>
                  {tutor.subject}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    badgePillClass,
                    tutor.status === 'draft'
                      ? draftBadgeClass
                      : publishedBadgeClass,
                  )}
                >
                  {tutor.status === 'draft' ? 'Entwurf' : 'Veröffentlicht'}
                </Badge>
                <Badge variant="outline" className={cn(badgePillClass, isOwn ? ownBadgeClass : foreignBadgeClass)}>
                  {isOwn ? 'Eigener Tutor' : `Von ${getTeacherName(tutor.createdBy)}`}
                </Badge>
              </div>
            </div>
          </div>
          {isOwn && (
            <Button onClick={() => navigate(`/app/tutors/${tutor.id}/edit`)}>
              Einstellungen bearbeiten
            </Button>
          )}
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div className="mx-auto grid max-w-6xl gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            <Card className={panelBgClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Eye className="h-4 w-4" />
                  Überblick
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Beschreibung</p>
                  <p className="mt-1 text-sm leading-relaxed">
                    {tutor.description || 'Keine Beschreibung hinterlegt.'}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <InfoTile label="Sichtbarkeit" value={visibilityLabels[tutor.visibility || 'private']} icon={Lock} />
                  <InfoTile label="Status" value={tutor.isEnabled ? 'Aktiv' : 'Deaktiviert'} icon={ShieldCheck} />
                  <InfoTile label="Ersteller" value={getTeacherName(tutor.createdBy)} icon={Users} />
                </div>
              </CardContent>
            </Card>

            <Card className={panelBgClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquareText className="h-4 w-4" />
                  System Prompt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-white p-4 dark:bg-slate-900">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {tutor.systemPrompt || 'Kein eigener System Prompt hinterlegt.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={panelBgClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-4 w-4" />
                  Lerneinstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <InfoTile label="Lernmethode" value={didacticMode?.label || 'Nicht gesetzt'} icon={BookOpen} />
                <InfoTile label="Quellen anzeigen" value={booleanLabel(tutor.showSources)} icon={FileText} />
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className={panelBgClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Settings2 className="h-4 w-4" />
                  Modell
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoTile label="Provider" value={provider?.name || 'Unbekannt'} icon={Bot} />
                <InfoTile label="Modell" value={model?.name || tutor.model} icon={Bot} />
                <InfoTile label="Temperatur" value={tutor.temperature.toFixed(1)} icon={SlidersHorizontal} />
                <InfoTile label="Max. Tokens" value={String(tutor.maxTokens)} icon={SlidersHorizontal} />
              </CardContent>
            </Card>

            <Card className={panelBgClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="h-4 w-4" />
                  Zugewiesene Klassen
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedClasses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Noch keiner Klasse zugewiesen.</p>
                ) : (
                  <div className="space-y-2">
                    {assignedClasses.map((classItem) => (
                      <div key={classItem.id} className="rounded-lg border bg-white px-3 py-2 dark:bg-slate-900">
                        <p className="font-medium">{classItem.name}</p>
                        <p className="text-xs text-muted-foreground">{classItem.schoolYear || 'Aktuelles Schuljahr'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className={panelBgClass}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-4 w-4" />
                  Verwaltung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <InfoTile label="Erstellt" value={new Date(tutor.createdAt).toLocaleDateString('de-AT')} icon={CalendarDays} />
                <InfoTile
                  label="Aktualisiert"
                  value={tutor.updatedAt ? new Date(tutor.updatedAt).toLocaleDateString('de-AT') : 'Nie'}
                  icon={CalendarDays}
                />
                <InfoTile
                  label="Ablaufdatum"
                  value={tutor.expiresAt ? new Date(tutor.expiresAt).toLocaleDateString('de-AT') : 'Keines'}
                  icon={CalendarDays}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </ScrollArea>
    </div>
  );
};

const InfoTile = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="rounded-lg border bg-white p-3 dark:bg-slate-900">
    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
    <p className="break-words text-sm font-medium">{value}</p>
  </div>
);

export default TutorReadOnlyPage;
