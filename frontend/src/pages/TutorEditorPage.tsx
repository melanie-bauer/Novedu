import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { TutorConfig } from '@/types';
import { modelOptions, subjectOptions, tutorIcons, didacticModes, mockAIProviders } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Save,
  Eye,
  Upload,
  FileText,
  X,
  Info,
  Send,
  Bot,
  User,
  ChevronDown,
  HelpCircle,
  Calendar as CalendarIcon,
  Lightbulb,
  Check,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const comparisonPromptExamples = [
  { id: 'example-1', label: 'Beispiel 1', defaultPrompt: 'Erkläre mir das Thema einfach' },
  { id: 'example-2', label: 'Beispiel 2', defaultPrompt: 'Kannst du mir ein Beispiel geben?' },
  { id: 'example-3', label: 'Beispiel 3', defaultPrompt: 'Ich verstehe das nicht' },
] as const;

type ComparisonPromptExampleId = (typeof comparisonPromptExamples)[number]['id'];

const createComparisonPromptStore = () => ({
  activeExampleId: comparisonPromptExamples[0].id as ComparisonPromptExampleId,
  prompts: comparisonPromptExamples.reduce(
    (acc, example) => {
      acc[example.id] = example.defaultPrompt;
      return acc;
    },
    {} as Record<ComparisonPromptExampleId, string>,
  ),
});

const TutorEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tutors, addTutor, updateTutor, globalSettings } = useData();
  const { toast } = useToast();
  
  const isNew = !id || id === 'new';
  const existingTutor = isNew ? null : tutors.find(t => t.id === id);

  // Get all enabled models from providers
  const availableModels = mockAIProviders
    .filter(p => p.isEnabled && p.apiKeyConfigured)
    .flatMap(p => p.models.filter(m => m.isEnabled).map(m => ({
      ...m,
      providerName: p.name,
    })));

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    targetGroup: '',
    systemPrompt: '',
    model: availableModels[0]?.id || 'gpt-5.5',
    temperature: 0.7,
    maxTokens: 2048,
    icon: '📚',
    didacticMode: 'step-by-step' as string,
    showSources: true,
    assignedClasses: [] as string[],
    assignedStudents: [] as string[],
    status: 'draft' as 'draft' | 'published',
    expiresAt: null as Date | null,
    assignment: '',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [testMessages, setTestMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [testInput, setTestInput] = useState('');
  const [subjectPickerOpen, setSubjectPickerOpen] = useState(false);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [comparisonPromptStore, setComparisonPromptStore] = useState(createComparisonPromptStore);
  const [comparisonModelIds, setComparisonModelIds] = useState<string[]>([]);
  const [comparisonExecutedPrompt, setComparisonExecutedPrompt] = useState<string | null>(null);
  const [comparisonExecutedModels, setComparisonExecutedModels] = useState<typeof availableModels>([]);

  useEffect(() => {
    if (existingTutor) {
      setFormData({
        name: existingTutor.name,
        subject: existingTutor.subject,
        description: existingTutor.description,
        targetGroup: '',
        systemPrompt: existingTutor.systemPrompt,
        model: existingTutor.model,
        temperature: existingTutor.temperature,
        maxTokens: existingTutor.maxTokens,
        icon: existingTutor.icon,
        didacticMode: existingTutor.didacticMode || 'step-by-step',
        showSources: existingTutor.showSources ?? true,
        assignedClasses: existingTutor.assignedClasses,
        assignedStudents: existingTutor.assignedStudents,
        status: existingTutor.status,
        expiresAt: existingTutor.expiresAt ? new Date(existingTutor.expiresAt) : null,
        assignment: existingTutor.assignment || '',
      });
    }
  }, [existingTutor]);

  const canPublish = useMemo(() => {
    return formData.name.trim().length > 0 && formData.subject.trim().length > 0;
  }, [formData.name, formData.subject]);

  const currentModel = useMemo(
    () => availableModels.find((model) => model.id === formData.model) || availableModels[0] || null,
    [availableModels, formData.model],
  );

  const tokenUsageLabel = (costPer1kTokens: number) => {
    if (costPer1kTokens <= 0.001) return 'wenig Tokenverbrauch';
    if (costPer1kTokens <= 0.002) return 'geringere Tokenverbrauch';
    if (costPer1kTokens <= 0.004) return 'mittlerer Tokenverbrauch';
    if (costPer1kTokens <= 0.006) return 'hoher Tokenverbrauch';
    return 'sehr hoher Tokenverbrauch';
  };

  const tokenUsageBadgeClass = (costPer1kTokens: number) => {
    if (costPer1kTokens <= 0.001) {
      return 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300';
    }
    if (costPer1kTokens <= 0.002) {
      return 'border border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/15 dark:text-green-300';
    }
    if (costPer1kTokens <= 0.004) {
      return 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300';
    }
    if (costPer1kTokens <= 0.006) {
      return 'border border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-500/30 dark:bg-orange-500/15 dark:text-orange-300';
    }
    return 'border border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/15 dark:text-red-300';
  };

  const didacticModeExplanation = useMemo(() => {
    const explanations: Record<string, { title: string; effect: string; system: string; teacher: string }> = {
      'socratic': {
        title: 'Sokratisch',
        effect: 'stellt Rückfragen und führt über Denken zur Lösung',
        system: 'Bevorzuge Fragen statt fertiger Lösungen und fordere Begründungen ein.',
        teacher: 'Füge konkrete Leitfragen und typische Denkfehler hinzu.',
      },
      'hints': {
        title: 'Hinweise',
        effect: 'gibt gezielte Hinweise statt direkter Lösungen',
        system: 'Antworte mit kurzen Tipps, die den nächsten sinnvollen Schritt zeigen.',
        teacher: 'Formuliere, wann der Tutor stoppen und nur andeuten soll.',
      },
      'step-by-step': {
        title: 'Schritt für Schritt',
        effect: 'zerlegt Antworten in kleine, nachvollziehbare Schritte',
        system: 'Gliedere Erklärungen in nummerierte Schritte und prüfe das Verständnis zwischendurch.',
        teacher: 'Definiere die gewünschte Detailtiefe und wann Beispiele verwendet werden sollen.',
      },
      'concise': {
        title: 'Kurz & präzise',
        effect: 'hält Antworten knapp und direkt',
        system: 'Bleibe knapp, liefere die Kernaussage zuerst und vermeide Umwege.',
        teacher: 'Lege fest, wie kurz die Antwort maximal sein soll.',
      },
    };

    return explanations[formData.didacticMode] || explanations['step-by-step'];
  }, [formData.didacticMode]);

  const didacticPromptExamples = useMemo(() => {
    const examples: Record<string, string[]> = {
      'socratic': [
        'Stelle zuerst Rückfragen und fordere Begründungen ein, bevor du erklärst.',
        'Führe Lernende mit Leitfragen Schritt für Schritt zur Lösung.',
        'Gib keine fertige Lösung, sondern begleite nur den Denkprozess.',
      ],
      'hints': [
        'Gib kurze Hinweise statt vollständiger Lösungen.',
        'Nenne nur den nächsten sinnvollen Schritt und stoppe danach.',
        'Lass Lernende selbst rechnen; gib nur Tipps und benötigte Formeln.',
      ],
      'step-by-step': [
        'Erkläre in nummerierten Schritten und prüfe das Verständnis zwischendurch.',
        'Zerlege Aufgaben in kleine Schritte und gib kurze Beispiele.',
        'Zeige jeden Rechenschritt mit einer kurzen Begründung.',
      ],
      'concise': [
        'Antworte sehr knapp und nenne die Kernaussage zuerst.',
        'Beschränke dich auf wenige Sätze und vermeide Ausschweifungen.',
        'Nenne nur die entscheidenden Schritte ohne Zusatzdetails.',
      ],
    };

    return examples[formData.didacticMode] || examples['step-by-step'];
  }, [formData.didacticMode]);

  const promptPreview = useMemo(() => {
    const generatedSystem = [
      `Du bist ein ${formData.subject || 'Fach'}-Tutor für Schülerinnen und Schüler.`,
      `Arbeite nach der Lernmethode "${didacticModeExplanation.title}".`,
      didacticModeExplanation.system,
      formData.showSources ? 'Nenne verwendete Quellen, wenn sie hilfreich sind.' : 'Nenne keine Quellen, außer sie werden explizit verlangt.',
    ].filter(Boolean).join(' ');

    const teacherPrompt = formData.systemPrompt.trim() || `Erkläre Inhalte verständlich und geduldig. Fokus: ${formData.description || 'kein zusätzlicher Fokus angegeben'}.`;

    const finalPrompt = [globalSettings.systemPrompt, generatedSystem, teacherPrompt].join('\n\n');

    return { generatedSystem, teacherPrompt, finalPrompt };
  }, [didacticModeExplanation.system, didacticModeExplanation.title, formData.description, formData.showSources, formData.subject, formData.systemPrompt, globalSettings.systemPrompt]);

  const comparisonSelectedModels = useMemo(() => {
    return comparisonModelIds
      .map((modelId) => availableModels.find((model) => model.id === modelId))
      .filter((model): model is (typeof availableModels)[number] => Boolean(model));
  }, [availableModels, comparisonModelIds]);

  const activeComparisonPrompt = comparisonPromptStore.prompts[comparisonPromptStore.activeExampleId] || '';

  const updateComparisonPrompt = (nextPrompt: string) => {
    setComparisonPromptStore((prev) => ({
      ...prev,
      prompts: {
        ...prev.prompts,
        [prev.activeExampleId]: nextPrompt,
      },
    }));
  };

  const selectComparisonPromptExample = (exampleId: ComparisonPromptExampleId) => {
    setComparisonPromptStore((prev) => ({
      ...prev,
      activeExampleId: exampleId,
    }));
  };

  const getComparisonPromptFallback = (exampleId: ComparisonPromptExampleId) =>
    comparisonPromptExamples.find((example) => example.id === exampleId)?.defaultPrompt || comparisonPromptExamples[0].defaultPrompt;

  const examplePrompts = comparisonPromptExamples.map((example) => example.defaultPrompt);

  const pickComparisonDefaults = () => {
    if (availableModels.length <= 3) return availableModels.map((model) => model.id);

    const sorted = [...availableModels].sort((a, b) => a.maxTokens - b.maxTokens);
    const lowBucket = sorted.slice(0, Math.max(1, Math.ceil(sorted.length / 3)));
    const midBucket = sorted.slice(Math.floor(sorted.length / 3), Math.floor((sorted.length * 2) / 3));
    const highBucket = sorted.slice(Math.floor((sorted.length * 2) / 3));

    const pickFrom = (bucket: typeof availableModels) => bucket[Math.floor(Math.random() * bucket.length)]?.id;
    const picks = [pickFrom(lowBucket), pickFrom(midBucket), pickFrom(highBucket)].filter(Boolean) as string[];

    return Array.from(new Set(picks)).slice(0, 3);
  };

  useEffect(() => {
    if (!comparisonOpen) return;

    const validIds = comparisonModelIds.filter((modelId) => availableModels.some((model) => model.id === modelId));
    if (validIds.length !== comparisonModelIds.length) {
      setComparisonModelIds(validIds);
    }
  }, [availableModels, comparisonModelIds, comparisonOpen]);

  const toggleComparisonModel = (modelId: string) => {
    setComparisonModelIds((prev) => (
      prev.includes(modelId)
        ? prev.filter((id) => id !== modelId)
        : prev.length >= 3
          ? prev
          : [...prev, modelId]
    ));
  };

  const buildComparisonResponse = (
    modelName: string,
    providerName: string,
    modelCost: number,
    maxTokens: number,
    score: number,
    prompt: string,
  ) => {
    const style = formData.didacticMode === 'socratic'
      ? 'fragt zuerst nach dem Denkweg'
      : formData.didacticMode === 'hints'
        ? 'gibt vorsichtige Hinweise'
        : formData.didacticMode === 'concise'
          ? 'antwortet knapp und direkt'
          : 'erklärt sehr schrittweise';

    const depth = modelCost <= 0.001
      ? 'sehr kostenbewusst'
      : modelCost <= 0.003
        ? 'kostenbewusst'
        : modelCost <= 0.006
          ? 'ausgewogen'
          : 'detailreich';
    const costTone = modelCost <= 0.001
      ? 'sehr kosteneffizient'
      : modelCost <= 0.003
        ? 'kosteneffizient'
        : modelCost <= 0.006
          ? 'ausgewogen bei den Kosten'
          : 'preisintensiver';
    const contextTone = maxTokens >= 1000000
      ? 'sehr großes Kontextfenster'
      : maxTokens >= 400000
        ? 'großes Kontextfenster'
        : maxTokens >= 200000
          ? 'solides Kontextfenster'
          : 'kleineres Kontextfenster';
    const strength = score >= 85
      ? 'sehr stark'
      : score >= 72
        ? 'stark'
        : score >= 60
          ? 'ausgewogen'
          : score >= 50
            ? 'grundlegend'
            : 'schwach';

    return `${modelName} (${providerName}) wirkt insgesamt ${strength}. Antwortprofil: ${depth}, ${style}. Schwerpunkt: ${costTone} und ${contextTone}. Anfrage: "${prompt}"`;
  };

  const modelScore = (modelCost: number, maxTokens: number) => {
    const costScore = modelCost <= 0.001
      ? 40
      : modelCost <= 0.002
        ? 34
        : modelCost <= 0.003
          ? 28
          : modelCost <= 0.004
            ? 22
            : modelCost <= 0.006
              ? 18
              : 12;
    const capacityScore = maxTokens >= 1000000 ? 38 : maxTokens >= 400000 ? 28 : maxTokens >= 200000 ? 18 : 12;
    const clarityScore = formData.didacticMode === 'step-by-step' ? 20 : formData.didacticMode === 'concise' ? 16 : 18;
    const total = costScore + capacityScore + clarityScore;
    return Math.min(95, Math.max(35, total));
  };

  const comparisonScores = useMemo(() => {
    const scoreModels = comparisonExecutedPrompt ? comparisonExecutedModels : comparisonSelectedModels;
    const entries = scoreModels.map((model) => [model.id, modelScore(model.costPer1kTokens, model.maxTokens)] as const);
    const maxScore = entries.length > 0 ? Math.max(...entries.map(([, score]) => score)) : 0;
    const winnerIds = entries.filter(([, score]) => score === maxScore).map(([id]) => id);
    return {
      scores: Object.fromEntries(entries) as Record<string, number>,
      maxScore,
      winnerIds,
    };
  }, [comparisonExecutedModels, comparisonExecutedPrompt, comparisonSelectedModels, formData.didacticMode]);

  const modelTokenStats = (prompt: string, modelCost: number, maxTokens: number) => {
    const promptTokens = Math.max(18, Math.round(prompt.length / 3.5));
    const responseTokens = Math.max(48, Math.min(Math.round(80 + maxTokens / 180), 260));
    const totalTokens = promptTokens + responseTokens;
    const estimatedCost = ((totalTokens / 1000) * modelCost).toFixed(4);

    return {
      promptTokens,
      responseTokens,
      totalTokens,
      estimatedCost,
    };
  };

  const handleSave = (publish: boolean = false) => {
    if (publish && !canPublish) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle alle Pflichtfelder aus (Name und Fach), bevor du veröffentlichst.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || !formData.subject) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle alle Pflichtfelder aus (Name und Fach).',
        variant: 'destructive',
      });
      return;
    }

    const tutorData: TutorConfig = {
      id: existingTutor?.id || `tutor-${Date.now()}`,
      name: formData.name,
      subject: formData.subject,
      description: formData.description,
      systemPrompt: formData.systemPrompt || `Du bist ein freundlicher ${formData.subject}-Tutor für Schüler. Erkläre Konzepte verständlich und geduldig.`,
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      knowledgeFiles: existingTutor?.knowledgeFiles || [],
      createdBy: existingTutor?.createdBy || user!.id,
      createdAt: existingTutor?.createdAt || new Date(),
      updatedAt: new Date(),
      isEnabled: publish,
      status: publish ? 'published' : formData.status,
      assignedClasses: formData.assignedClasses,
      assignedStudents: formData.assignedStudents,
      icon: formData.icon,
      color: 'blue',
      didacticMode: formData.didacticMode as any,
      safetyRules: undefined,
      showSources: formData.showSources,
      expiresAt: formData.expiresAt || undefined,
      assignment: formData.assignment || undefined,
      assignmentDocuments: existingTutor?.assignmentDocuments || [],
      visibility: existingTutor?.visibility,
      internalVisibility: existingTutor?.internalVisibility,
    };

    if (existingTutor) {
      updateTutor(existingTutor.id, {
        ...tutorData,
        status: publish ? 'published' : 'draft',
        visibility: publish ? 'private' : tutorData.visibility,
        internalVisibility: publish ? undefined : tutorData.internalVisibility,
      });
      toast({ title: publish ? 'Tutor veröffentlicht' : 'Änderungen gespeichert' });
    } else {
      addTutor({
        ...tutorData,
        status: publish ? 'published' : 'draft',
        visibility: publish ? 'private' : tutorData.visibility,
        internalVisibility: publish ? undefined : tutorData.internalVisibility,
      });
      toast({ title: publish ? 'Tutor erstellt und veröffentlicht' : 'Tutor als Entwurf gespeichert' });
    }

    navigate('/app/tutors');
  };

  const handleTestSend = () => {
    if (!testInput.trim()) return;
    
    setTestMessages(prev => [...prev, { role: 'user', content: testInput }]);
    setTestInput('');
    
    setTimeout(() => {
      setTestMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Dies ist eine Testantwort vom ${formData.name || 'Tutor'}. Im echten Betrieb würde hier die KI-Antwort erscheinen.`
      }]);
    }, 500);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate('/app/tutors')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="font-semibold">
              {isNew ? 'Neuen Tutor erstellen' : `${existingTutor?.name ?? 'Tutor'} bearbeiten`}
            </h1>
            <p className="text-xs text-muted-foreground">
              {formData.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => handleSave(false)}>
            <Save className="w-4 h-4 mr-1" />
            Als Entwurf speichern
          </Button>
          <Button size="sm" onClick={() => handleSave(true)} disabled={!canPublish}>
            <Eye className="w-4 h-4 mr-1" />
            Veröffentlichen
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="basic" className="h-full flex flex-col">
          <div className="flex items-center justify-center border-b bg-card px-6 py-4">
            <TabsList className="w-full max-w-3xl grid grid-cols-4">
              <TabsTrigger value="basic">Basis</TabsTrigger>
              <TabsTrigger value="behavior">Verhalten</TabsTrigger>
              <TabsTrigger value="knowledge">Wissen</TabsTrigger>
              <TabsTrigger value="preview">Vorschau</TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            <div className="max-w-3xl mx-auto p-6">
              {/* Tab 1: Basic */}
              <TabsContent value="basic" className="mt-0 space-y-6">
                {/* Help Card for new users */}
                {isNew && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <Lightbulb className="h-4 w-4 text-primary" />
                    <AlertDescription className="text-sm">
                      <strong>Tipp für Einsteiger:</strong> Ein Tutor ist ein KI-Assistent, den deine Schüler nutzen können. 
                      Gib ihm einen Namen, wähle das Fach und beschreibe kurz, wobei er helfen soll. 
                      Den Rest kannst du später anpassen.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Tutor Name *
                      <span className="text-xs text-muted-foreground ml-2">Wie soll der Tutor heißen?</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="z.B. Mathe-Meister, Deutsch-Helfer"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">
                      Fach *
                      <span className="text-xs text-muted-foreground ml-2">Für welches Fach?</span>
                    </Label>
                    <Popover open={subjectPickerOpen} onOpenChange={setSubjectPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="subject"
                          variant="outline"
                          role="combobox"
                          aria-expanded={subjectPickerOpen}
                          className={cn(
                            'w-full justify-between font-normal',
                            !formData.subject && 'text-muted-foreground',
                          )}
                        >
                          {formData.subject || 'Fach wählen'}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                          <CommandInput className="h-9" placeholder="Fach suchen..." />
                          <CommandList className="max-h-52">
                            <CommandEmpty>Kein Fach gefunden.</CommandEmpty>
                            <CommandGroup>
                              {subjectOptions.map((subject) => (
                                <CommandItem
                                  key={subject}
                                  value={subject}
                                  className="py-2"
                                  onSelect={() => {
                                    setFormData((prev) => ({ ...prev, subject }));
                                    setSubjectPickerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      'mr-2 h-4 w-4',
                                      formData.subject === subject ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  {subject}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Beschreibung
                    <span className="text-xs text-muted-foreground ml-2">Was macht dieser Tutor?</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="z.B. Hilft Schülern bei Textaufgaben und erklärt mathematische Konzepte Schritt für Schritt"
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Icon
                    <span className="text-xs text-muted-foreground ml-2">Wähle ein passendes Symbol</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {tutorIcons.map(icon => (
                      <Button
                        key={icon}
                        type="button"
                        variant={formData.icon === icon ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      >
                        {icon}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label>
                    Verfügbar bis (optional)
                    <span className="text-xs text-muted-foreground ml-2">Wann soll der Tutor automatisch deaktiviert werden?</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left", !formData.expiresAt && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.expiresAt 
                          ? format(formData.expiresAt, 'dd. MMMM yyyy', { locale: de })
                          : 'Kein Ablaufdatum'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.expiresAt || undefined}
                        onSelect={(date) => setFormData(prev => ({ ...prev, expiresAt: date || null }))}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                      {formData.expiresAt && (
                        <div className="p-2 border-t">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="w-full"
                            onClick={() => setFormData(prev => ({ ...prev, expiresAt: null }))}
                          >
                            Ablaufdatum entfernen
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

              </TabsContent>

              {/* Tab 2: Behavior */}
              <TabsContent value="behavior" className="mt-0 space-y-6">
                {/* Model Selection */}
                <div className="space-y-2">
                  <Label>
                    KI-Modell
                    <span className="text-xs text-muted-foreground ml-2">Welche KI soll der Tutor verwenden?</span>
                  </Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={v => setFormData(prev => ({ ...prev, model: v }))}
                  >
                    <SelectTrigger className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50 [&>span]:text-slate-950 dark:[&>span]:text-slate-50">
                      <SelectValue placeholder="Modell wählen" />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-slate-950 dark:bg-slate-950 dark:text-slate-50">
                      {availableModels.map(model => (
                        <SelectItem key={model.id} value={model.id} className="py-2 focus:bg-slate-100 dark:focus:bg-slate-800">
                          <div className="flex w-full items-center gap-2 pr-2">
                            <span className="font-medium text-slate-950 dark:text-slate-50">{model.name}</span>
                            <span className="text-xs text-slate-600 dark:text-slate-400">({model.providerName})</span>
                            <Badge variant="secondary" className={cn('ml-auto text-[10px] font-semibold', tokenUsageBadgeClass(model.costPer1kTokens))}>
                              {tokenUsageLabel(model.costPer1kTokens)}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableModels.find(m => m.id === formData.model)?.description && (
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      {availableModels.find(m => m.id === formData.model)?.description}
                    </p>
                  )}
                </div>

                {/* Didactic Mode */}
                <div className="space-y-2">
                  <Label>
                    Lernmethode
                    <span className="text-xs text-muted-foreground ml-2">Wie soll der Tutor antworten?</span>
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {didacticModes.map(mode => (
                      <Card
                        key={mode.value}
                        className={cn(
                          "cursor-pointer transition-colors",
                          formData.didacticMode === mode.value && "border-primary bg-primary/5"
                        )}
                        onClick={() => setFormData(prev => ({ ...prev, didacticMode: mode.value }))}
                      >
                        <CardContent className="p-3">
                          <p className="font-medium text-sm">{mode.label}</p>
                          <p className="text-xs text-muted-foreground">{mode.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Prompt-Beispiele zur Lernmethode</CardTitle>
                    <CardDescription>
                      Diese Beispiele zeigen, wie sich die aktuell gewählte Lernmethode auf Prompts auswirkt.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg border bg-muted/25 p-3">
                      <p className="text-sm font-medium">{didacticModeExplanation.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{didacticModeExplanation.effect}</p>
                    </div>
                    <div className="space-y-2">
                      {didacticPromptExamples.map((example) => (
                        <button
                          key={example}
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40"
                          onClick={() => setFormData(prev => ({ ...prev, systemPrompt: prev.systemPrompt.trim() || example }))}
                        >
                          <span className="pr-3">{example}</span>
                          <Badge variant="secondary" className="shrink-0">Beispiel</Badge>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Klick auf ein Beispiel übernimmt es nur dann in das Anweisungsfeld, wenn dort noch kein Text steht.
                    </p>
                  </CardContent>
                </Card>

                {/* System Prompt */}
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">
                    Anweisungen für den Tutor (optional)
                    <span className="text-xs text-muted-foreground ml-2">Was soll der Tutor besonders beachten?</span>
                  </Label>
                  <Textarea
                    id="systemPrompt"
                    placeholder="z.B. Erkläre alles so, als würdest du mit einem 10-Jährigen sprechen. Verwende viele Beispiele aus dem Alltag."
                    value={formData.systemPrompt}
                    onChange={e => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Wenn du nichts eingibst, wird automatisch ein passender Text für das gewählte Fach erstellt.
                  </p>
                </div>

                {/* Advanced Settings */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Erweiterte Einstellungen (für Experten)
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", advancedOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-4">
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        Diese Einstellungen sind für fortgeschrittene Nutzer. Im Normalfall müssen sie nicht geändert werden.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Temperatur (Kreativität)</Label>
                          <p className="text-xs text-muted-foreground">
                            Niedrig = präzise, Hoch = kreativer
                          </p>
                        </div>
                        <span className="text-sm font-medium">{formData.temperature.toFixed(1)}</span>
                      </div>
                      <Slider
                        value={[formData.temperature]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([v]) => setFormData(prev => ({ ...prev, temperature: v }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Maximale Antwortlänge (Tokens)</Label>
                      <Input
                        type="number"
                        value={formData.maxTokens}
                        onChange={e => setFormData(prev => ({ ...prev, maxTokens: parseInt(e.target.value) || 2048 }))}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Der globale Systemprompt der Schule wird automatisch zu jedem Tutor hinzugefügt.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Prompt-Struktur</CardTitle>
                    <CardDescription>
                      So setzt sich der finale Prompt aus System, Lernmethode und deinem Text zusammen.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">System generiert</p>
                        <p className="mt-2 text-sm font-medium">{didacticModeExplanation.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{didacticModeExplanation.effect}</p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Von der Lehrkraft</p>
                        <p className="mt-2 text-sm font-medium">Freitext, Aufgabe und Zusatzhinweise</p>
                        <p className="mt-1 text-xs text-muted-foreground">{didacticModeExplanation.teacher}</p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aktuelles Modell</p>
                        <p className="mt-2 text-sm font-medium">{currentModel?.name || 'Modell wählen'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {currentModel
                            ? `${currentModel.providerName} · ${tokenUsageLabel(currentModel.costPer1kTokens)}`
                            : 'Das ausgewählte Modell verarbeitet den fertigen Prompt.'}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Die Lernmethode oben ändert den Inhalt des Prompts. Das Modell hier ist nur die Engine, die darauf antwortet.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">System generiert</p>
                        <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
{promptPreview.generatedSystem}
                        </pre>
                      </div>
                      <div className="rounded-lg border p-4">
                        <p className="text-sm font-semibold">Lehrkraft schreibt</p>
                        <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
{promptPreview.teacherPrompt}
                        </pre>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <p className="text-sm font-semibold">Finaler Prompt</p>
                      <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
{promptPreview.finalPrompt}
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                {canPublish ? (
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-medium text-sm">Bereit zum Veröffentlichen</p>
                        <p className="text-xs text-muted-foreground">
                          Name und Fach sind ausgefüllt, du kannst den Tutor jetzt freigeben.
                        </p>
                      </div>
                      <Button onClick={() => handleSave(true)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Veröffentlichen
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      Sobald Name und Fach ausgefüllt sind, erscheint hier der Veröffentlichungs-Button.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              {/* Tab 3: Knowledge Base & Assignment */}
              <TabsContent value="knowledge" className="mt-0 space-y-6">
                {/* Assignment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Arbeitsauftrag (optional)</CardTitle>
                    <CardDescription>
                      Gib deinen Schülern einen konkreten Auftrag, den sie mit Hilfe dieses Tutors bearbeiten sollen
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="z.B. Bearbeite die Aufgaben 1-5 auf Seite 42. Der Tutor hilft dir bei Fragen, gibt aber keine fertigen Lösungen."
                      value={formData.assignment}
                      onChange={e => setFormData(prev => ({ ...prev, assignment: e.target.value }))}
                      rows={4}
                    />
                    <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Dokumente zum Arbeitsauftrag hochladen</p>
                      <p className="text-xs text-muted-foreground">PDF, Word (max. 10MB)</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Knowledge Base */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Wissensbasis (optional)</CardTitle>
                    <CardDescription>
                      Lade Dokumente hoch, die der Tutor als zusätzliches Wissen nutzen soll
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Dateien hierher ziehen</p>
                      <p className="text-xs text-muted-foreground">oder klicken zum Auswählen</p>
                      <p className="text-xs text-muted-foreground mt-2">PDF, DOCX, TXT (max. 10MB)</p>
                    </div>

                    {existingTutor?.knowledgeFiles && existingTutor.knowledgeFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Hochgeladene Dokumente</p>
                        {existingTutor.knowledgeFiles.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-2 border rounded-lg">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {(doc.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="icon-sm">
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">Quellen im Chat anzeigen</p>
                      <p className="text-xs text-muted-foreground">
                        Zeigt Schülern, welche Dokumente für die Antwort verwendet wurden
                      </p>
                    </div>
                    <Switch
                      checked={formData.showSources}
                      onCheckedChange={v => setFormData(prev => ({ ...prev, showSources: v }))}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab 4: Preview */}
              <TabsContent value="preview" className="mt-0 space-y-4">
                <Card className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{formData.icon}</span>
                      <div>
                        <CardTitle className="text-sm">{formData.name || 'Tutor-Name'}</CardTitle>
                        <CardDescription className="text-xs">
                          {formData.subject || 'Fach wählen'} • Vorschau
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-64 overflow-y-auto p-4 space-y-3">
                      {testMessages.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-muted-foreground">
                            Teste deinen Tutor mit Beispiel-Prompts
                          </p>
                        </div>
                      ) : (
                        testMessages.map((msg, i) => (
                          <div key={i} className={cn("flex gap-2", msg.role === 'user' && "flex-row-reverse")}>
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                              msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                              {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                            </div>
                            <div className={cn(
                              "rounded-lg px-3 py-2 text-sm max-w-[80%]",
                              msg.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                              {msg.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 border-t">
                      <div className="flex gap-2 mb-2 flex-wrap">
                        {examplePrompts.map((prompt, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            onClick={() => setTestInput(prompt)}
                          >
                            {prompt}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nachricht eingeben..."
                          value={testInput}
                          onChange={(e) => setTestInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleTestSend()}
                        />
                        <Button size="icon" onClick={handleTestSend}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="text-sm">Modellvergleich</CardTitle>
                        <CardDescription>
                          Vergleiche bis zu drei Modelle, teste einen Prompt und sieh Antworten, Token-Volumen und Kosten auf einen Blick.
                        </CardDescription>
                      </div>
                      {!comparisonOpen ? (
                        <Button size="sm" onClick={() => {
                          setComparisonOpen(true);
                          setComparisonModelIds((prev) => (prev.length > 0 ? prev : pickComparisonDefaults()));
                        }} disabled={availableModels.length < 2}>
                          Vergleich öffnen
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => setComparisonOpen(false)}>
                          Vergleich schließen
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!comparisonOpen ? (
                      <Alert>
                        <Bot className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {availableModels.length < 2
                            ? 'Für den Vergleich werden mindestens zwei Modelle benötigt.'
                            : 'Öffne den Vergleich, wähle 1 bis 3 Modelle aus und starte dann einen Testprompt.'}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label>Modelle auswählen (max. 3)</Label>
                          <div className="flex flex-wrap gap-2">
                            {availableModels.map((model) => {
                              const selected = comparisonModelIds.includes(model.id);
                              return (
                                <Button
                                  key={model.id}
                                  type="button"
                                  variant={selected ? 'default' : 'outline'}
                                  size="sm"
                                  className="text-xs"
                                  onClick={() => toggleComparisonModel(model.id)}
                                >
                                  {model.name} {selected ? '• aktiv' : ''}
                                </Button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="comparisonPrompt">Test-Prompt</Label>
                          <Textarea
                            id="comparisonPrompt"
                            value={activeComparisonPrompt}
                            onChange={(event) => updateComparisonPrompt(event.target.value)}
                            rows={3}
                            placeholder="Was soll das Modell beantworten?"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {comparisonPromptExamples.map((example) => (
                            <Button
                              key={example.id}
                              variant={comparisonPromptStore.activeExampleId === example.id ? 'default' : 'outline'}
                              size="sm"
                              className="text-xs"
                              onClick={() => selectComparisonPromptExample(example.id)}
                            >
                              {example.label}
                            </Button>
                          ))}
                          <Button
                            size="sm"
                            onClick={() => {
                              setComparisonExecutedModels(comparisonSelectedModels);
                              setComparisonExecutedPrompt(
                                activeComparisonPrompt.trim() || getComparisonPromptFallback(comparisonPromptStore.activeExampleId),
                              );
                            }}
                            disabled={comparisonModelIds.length < 2}
                          >
                            Vergleich starten
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Jedes Beispiel speichert jetzt seinen eigenen Text. Du kannst also zwischen Beispiel 1 bis 3 wechseln, ohne Eingaben zu verlieren.
                        </p>

                        {comparisonExecutedPrompt ? (
                          <div className="space-y-3">
                            <div className="rounded-lg border bg-muted/25 p-3 text-sm">
                              <p className="font-medium">Prompt</p>
                              <p className="mt-1 text-muted-foreground">{comparisonExecutedPrompt}</p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                Auswahl: {comparisonExecutedModels.length} Modell{comparisonExecutedModels.length === 1 ? '' : 'e'}
                              </p>
                            </div>

                            <div className="grid gap-3">
                              {comparisonExecutedModels.map((model) => {
                                const stats = modelTokenStats(comparisonExecutedPrompt, model.costPer1kTokens, model.maxTokens);
                                const score = comparisonScores.scores[model.id] ?? 0;
                                const response = buildComparisonResponse(
                                  model.name,
                                  model.providerName,
                                  model.costPer1kTokens,
                                  model.maxTokens,
                                  score,
                                  comparisonExecutedPrompt,
                                );
                                const isWinner = comparisonScores.winnerIds.includes(model.id) && comparisonExecutedModels.length > 1;

                                return (
                                  <div key={model.id} className="rounded-lg border p-4">
                                    <div className="flex items-start justify-between gap-3">
                                      <div>
                                        <p className="font-semibold text-sm">{model.name}</p>
                                        <p className="text-xs text-muted-foreground">{model.providerName}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {isWinner && <Badge>Sieger</Badge>}
                                        <Badge variant="secondary">{score}/100</Badge>
                                      </div>
                                    </div>

                                    <div className="mt-3 space-y-3 text-sm">
                                      <p className="rounded-md bg-muted/40 p-3">{response}</p>
                                      <div className="grid gap-2 sm:grid-cols-4 text-xs text-muted-foreground">
                                        <div className="rounded-md border bg-muted/20 p-2">
                                          <span className="block font-medium text-foreground">Prompt-Tokens</span>
                                          {stats.promptTokens}
                                        </div>
                                        <div className="rounded-md border bg-muted/20 p-2">
                                          <span className="block font-medium text-foreground">Antwort-Tokens</span>
                                          {stats.responseTokens}
                                        </div>
                                        <div className="rounded-md border bg-muted/20 p-2">
                                          <span className="block font-medium text-foreground">Gesamt-Tokens</span>
                                          {stats.totalTokens}
                                        </div>
                                        <div className="rounded-md border bg-muted/20 p-2">
                                          <span className="block font-medium text-foreground">Kosten (ca.)</span>
                                          {stats.estimatedCost} €
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <Alert>
                            <Bot className="h-4 w-4" />
                            <AlertDescription className="text-xs">
                              Wähle mindestens zwei Modelle, schreibe einen Test-Prompt und starte den Vergleich.
                            </AlertDescription>
                          </Alert>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default TutorEditorPage;