import React, { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { TutorConfig } from '@/types';
import { modelOptions, subjectOptions, tutorIcons, didacticModes, mockAIProviders } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Eye, Upload, FileText, X, Info, Send, Bot, User, ChevronDown, HelpCircle, Calendar as CalendarIcon, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const TutorEditorPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tutors, addTutor, updateTutor, globalSettings } = useData();
  const { toast } = useToast();
  
  const isNew = id === 'new';
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
    model: availableModels[0]?.id || 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    icon: '📚',
    didacticMode: 'step-by-step' as string,
    safetyRules: {
      noPersonalData: true,
      noFullSolutions: true,
    },
    showSources: true,
    assignedClasses: [] as string[],
    assignedStudents: [] as string[],
    isEnabled: true,
    status: 'draft' as 'draft' | 'published',
    expiresAt: null as Date | null,
    assignment: '',
  });

  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [testMessages, setTestMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [testInput, setTestInput] = useState('');

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
        safetyRules: existingTutor.safetyRules || { noPersonalData: true, noFullSolutions: true },
        showSources: existingTutor.showSources ?? true,
        assignedClasses: existingTutor.assignedClasses,
        assignedStudents: existingTutor.assignedStudents,
        isEnabled: existingTutor.isEnabled,
        status: existingTutor.status,
        expiresAt: existingTutor.expiresAt ? new Date(existingTutor.expiresAt) : null,
        assignment: existingTutor.assignment || '',
      });
    }
  }, [existingTutor]);

  const buildClassAssignmentsFromForm = (
    existing: TutorConfig | null,
    newClassIds: string[],
    assignerId: string,
  ): { classId: string; assignedById: string }[] => {
    const prev =
      existing?.classAssignments && existing.classAssignments.length > 0
        ? existing.classAssignments
        : (existing?.assignedClasses ?? []).map((cid) => ({
            classId: cid,
            assignedById: existing!.createdBy,
          }));
    const newIdSet = new Set(newClassIds);
    const next = prev.filter((a) => newIdSet.has(a.classId));
    const have = new Set(next.map((a) => a.classId));
    newClassIds.forEach((cid) => {
      if (!have.has(cid)) {
        next.push({ classId: cid, assignedById: assignerId });
        have.add(cid);
      }
    });
    return next;
  };

  const handleSave = (publish: boolean = false) => {
    if (!formData.name || !formData.subject) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle alle Pflichtfelder aus (Name und Fach).',
        variant: 'destructive',
      });
      return;
    }

    const classAssignments = buildClassAssignmentsFromForm(
      existingTutor,
      formData.assignedClasses,
      user!.id,
    );

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
      isEnabled: formData.isEnabled,
      status: publish ? 'published' : formData.status,
      assignedClasses: formData.assignedClasses,
      classAssignments,
      assignedStudents: formData.assignedStudents,
      icon: formData.icon,
      color: 'blue',
      didacticMode: formData.didacticMode as any,
      safetyRules: formData.safetyRules,
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

  const examplePrompts = [
    'Erkläre mir das Thema einfach',
    'Kannst du mir ein Beispiel geben?',
    'Ich verstehe das nicht',
  ];

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
              {isNew ? 'Neuer Tutor erstellen' : `${existingTutor?.name} bearbeiten`}
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
          <Button size="sm" onClick={() => handleSave(true)}>
            <Eye className="w-4 h-4 mr-1" />
            Veröffentlichen
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="basic" className="h-full flex flex-col">
          <div className="px-6 pt-4 border-b bg-card">
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
                    <Select 
                      value={formData.subject} 
                      onValueChange={v => setFormData(prev => ({ ...prev, subject: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Fach wählen" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectOptions.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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

                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium text-sm">Tutor aktiviert</p>
                      <p className="text-xs text-muted-foreground">
                        Wenn aktiviert, können zugewiesene Schüler diesen Tutor nutzen
                      </p>
                    </div>
                    <Switch
                      checked={formData.isEnabled}
                      onCheckedChange={v => setFormData(prev => ({ ...prev, isEnabled: v }))}
                    />
                  </CardContent>
                </Card>
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
                    <SelectTrigger>
                      <SelectValue placeholder="Modell wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map(model => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center gap-2">
                            <span>{model.name}</span>
                            <span className="text-xs text-muted-foreground">({model.providerName})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableModels.find(m => m.id === formData.model)?.description && (
                    <p className="text-xs text-muted-foreground">
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

                {/* Safety Rules */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Sicherheitsregeln</CardTitle>
                    <CardDescription>Schütze deine Schüler vor unerwünschten Inhalten</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noPersonalData"
                        checked={formData.safetyRules.noPersonalData}
                        onCheckedChange={v => setFormData(prev => ({
                          ...prev,
                          safetyRules: { ...prev.safetyRules, noPersonalData: v as boolean }
                        }))}
                      />
                      <Label htmlFor="noPersonalData" className="text-sm font-normal">
                        Keine personenbezogenen Daten anfordern
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noFullSolutions"
                        checked={formData.safetyRules.noFullSolutions}
                        onCheckedChange={v => setFormData(prev => ({
                          ...prev,
                          safetyRules: { ...prev.safetyRules, noFullSolutions: v as boolean }
                        }))}
                      />
                      <Label htmlFor="noFullSolutions" className="text-sm font-normal">
                        Keine kompletten Lösungen bei Hausaufgaben (nur Hilfestellung)
                      </Label>
                    </div>
                  </CardContent>
                </Card>

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
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  );
};

export default TutorEditorPage;