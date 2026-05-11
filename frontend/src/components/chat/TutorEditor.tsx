import React, { useState, useEffect } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TutorConfig } from '@/types';
import { modelOptions, subjectOptions, tutorIcons, mockClasses, mockUsers } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

interface TutorEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: TutorConfig | null;
}

const TutorEditor: React.FC<TutorEditorProps> = ({ open, onOpenChange, tutor }) => {
  const { user } = useAuth();
  const { addTutor, updateTutor } = useData();
  const { toast } = useToast();
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple');

  const myClasses = mockClasses.filter(c => c.teacherId === user?.id);
  const allStudents = mockUsers.filter(u => u.role === 'student');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    systemPrompt: '',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    icon: '📚',
    assignedClasses: [] as string[],
    assignedStudents: [] as string[],
    isEnabled: true,
  });

  useEffect(() => {
    if (tutor) {
      setFormData({
        name: tutor.name,
        subject: tutor.subject,
        description: tutor.description,
        systemPrompt: tutor.systemPrompt,
        model: tutor.model,
        temperature: tutor.temperature,
        maxTokens: tutor.maxTokens,
        icon: tutor.icon,
        assignedClasses: tutor.assignedClasses,
        assignedStudents: tutor.assignedStudents,
        isEnabled: tutor.isEnabled,
      });
    } else {
      setFormData({
        name: '',
        subject: '',
        description: '',
        systemPrompt: '',
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2048,
        icon: '📚',
        assignedClasses: [],
        assignedStudents: [],
        isEnabled: true,
      });
    }
  }, [tutor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.subject) {
      toast({
        title: 'Fehler',
        description: 'Bitte fülle alle Pflichtfelder aus.',
        variant: 'destructive',
      });
      return;
    }

    const prevAssignments =
      tutor?.classAssignments && tutor.classAssignments.length > 0
        ? tutor.classAssignments
        : (tutor?.assignedClasses ?? []).map((cid) => ({
            classId: cid,
            assignedById: tutor!.createdBy,
          }));
    const newIdSet = new Set(formData.assignedClasses);
    const classAssignments = prevAssignments.filter((a) => newIdSet.has(a.classId));
    const have = new Set(classAssignments.map((a) => a.classId));
    formData.assignedClasses.forEach((cid) => {
      if (!have.has(cid)) {
        classAssignments.push({ classId: cid, assignedById: user!.id });
        have.add(cid);
      }
    });

    const tutorData: TutorConfig = {
      id: tutor?.id || `tutor-${Date.now()}`,
      name: formData.name,
      subject: formData.subject,
      description: formData.description,
      systemPrompt: formData.systemPrompt || `Du bist ein freundlicher ${formData.subject}-Tutor. Hilf den Schülern bei ihren Fragen und erkläre Konzepte verständlich.`,
      model: formData.model,
      temperature: formData.temperature,
      maxTokens: formData.maxTokens,
      knowledgeFiles: tutor?.knowledgeFiles || [],
      createdBy: user!.id,
      createdAt: tutor?.createdAt || new Date(),
      isEnabled: formData.isEnabled,
      status: tutor?.status || 'draft',
      assignedClasses: formData.assignedClasses,
      classAssignments,
      assignedStudents: formData.assignedStudents,
      icon: formData.icon,
      color: 'blue',
    };

    if (tutor) {
      updateTutor(tutor.id, tutorData);
      toast({ title: 'Tutor aktualisiert' });
    } else {
      addTutor(tutorData);
      toast({ title: 'Tutor erstellt' });
    }

    onOpenChange(false);
  };

  const toggleClass = (classId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(classId)
        ? prev.assignedClasses.filter(id => id !== classId)
        : [...prev.assignedClasses, classId],
    }));
  };

  const toggleStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedStudents: prev.assignedStudents.includes(studentId)
        ? prev.assignedStudents.filter(id => id !== studentId)
        : [...prev.assignedStudents, studentId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tutor ? 'Tutor bearbeiten' : 'Neuer Tutor'}
          </DialogTitle>
          <DialogDescription>
            {tutor ? 'Bearbeite die Einstellungen' : 'Erstelle einen neuen KI-Tutor'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2 mb-4">
          <Button
            type="button"
            variant={mode === 'simple' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('simple')}
          >
            Einfach
          </Button>
          <Button
            type="button"
            variant={mode === 'advanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMode('advanced')}
          >
            Erweitert
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="basic">Grundlagen</TabsTrigger>
              <TabsTrigger value="prompt">Anweisungen</TabsTrigger>
              <TabsTrigger value="assign">Zuweisung</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs">Name *</Label>
                  <Input
                    id="name"
                    placeholder="z.B. Mathe-Meister"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-xs">Fach *</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={v => setFormData(prev => ({ ...prev, subject: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjectOptions.map(subject => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Kurze Beschreibung..."
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Icon</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tutorIcons.map(icon => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? 'default' : 'outline'}
                      size="icon-sm"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              {mode === 'advanced' && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs">KI-Modell</Label>
                    <Select 
                      value={formData.model} 
                      onValueChange={v => setFormData(prev => ({ ...prev, model: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {modelOptions.map(model => (
                          <SelectItem key={model.value} value={model.value}>
                            {model.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs">Temperatur</Label>
                        <span className="text-xs text-muted-foreground">
                          {formData.temperature.toFixed(1)}
                        </span>
                      </div>
                      <Slider
                        value={[formData.temperature]}
                        min={0}
                        max={1}
                        step={0.1}
                        onValueChange={([v]) => setFormData(prev => ({ ...prev, temperature: v }))}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-xs">Max. Tokens</Label>
                        <span className="text-xs text-muted-foreground">
                          {formData.maxTokens}
                        </span>
                      </div>
                      <Slider
                        value={[formData.maxTokens]}
                        min={256}
                        max={4096}
                        step={256}
                        onValueChange={([v]) => setFormData(prev => ({ ...prev, maxTokens: v }))}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs font-medium">Aktiviert</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Schüler können diesen Tutor nutzen
                  </p>
                </div>
                <Switch
                  checked={formData.isEnabled}
                  onCheckedChange={v => setFormData(prev => ({ ...prev, isEnabled: v }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="prompt" className="space-y-3 mt-4">
              <div className="space-y-1.5">
                <Label htmlFor="systemPrompt" className="text-xs">System-Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  placeholder="Du bist ein freundlicher Tutor..."
                  value={formData.systemPrompt}
                  onChange={e => setFormData(prev => ({ ...prev, systemPrompt: e.target.value }))}
                  rows={6}
                  className="font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-1">💡 Tipps:</p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  <li>• Rolle des Tutors klar beschreiben</li>
                  <li>• Niveau der Schüler angeben</li>
                  <li>• Kommunikationsstil definieren</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="assign" className="space-y-4 mt-4">
              <div>
                <Label className="text-xs mb-2 block">Klassen zuweisen</Label>
                <div className="space-y-1.5">
                  {myClasses.map(cls => (
                    <div
                      key={cls.id}
                      className="flex items-center space-x-2 p-2 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleClass(cls.id)}
                    >
                      <Checkbox
                        checked={formData.assignedClasses.includes(cls.id)}
                        onCheckedChange={() => toggleClass(cls.id)}
                      />
                      <div>
                        <p className="text-sm font-medium">{cls.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {cls.studentIds.length} Schüler
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-xs mb-2 block">Einzelne Schüler</Label>
                <div className="flex flex-wrap gap-1.5">
                  {allStudents
                    .filter(s => !myClasses.some(c => 
                      formData.assignedClasses.includes(c.id) && c.studentIds.includes(s.id)
                    ))
                    .map(student => (
                      <Badge
                        key={student.id}
                        variant={formData.assignedStudents.includes(student.id) ? 'default' : 'outline'}
                        className="cursor-pointer text-xs"
                        onClick={() => toggleStudent(student.id)}
                      >
                        {student.name}
                      </Badge>
                    ))
                  }
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" size="sm">
              {tutor ? 'Speichern' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TutorEditor;
