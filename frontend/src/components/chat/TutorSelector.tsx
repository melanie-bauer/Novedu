import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TutorConfig, AIModel } from '@/types';
import { subjectColors, mockAIProviders, getTeacherName } from '@/data/mockData';
import { Clock, MessageSquare, Search, Zap, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TutorSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutors: TutorConfig[];
  onSelect: (tutor: TutorConfig, isTemporary: boolean) => void;
  onSelectModel?: (model: AIModel, isTemporary: boolean) => void;
  isTeacher?: boolean;
  showDirectModels?: boolean;
}

const TutorSelector: React.FC<TutorSelectorProps> = ({
  open,
  onOpenChange,
  tutors,
  onSelect,
  onSelectModel,
  isTeacher = false,
  showDirectModels = false,
}) => {
  const [isTemporary, setIsTemporary] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<TutorConfig | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('tutors');

  // Get available models for direct chat
  const availableModels = useMemo(() => {
    return mockAIProviders
      .filter(p => p.isEnabled && p.apiKeyConfigured)
      .flatMap(p => p.models.filter(m => m.isEnabled).map(m => ({
        ...m,
        providerName: p.name,
      })));
  }, []);

  const handleSelect = () => {
    if (activeTab === 'models' && selectedModel && onSelectModel) {
      onSelectModel(selectedModel, isTemporary);
      setSelectedModel(null);
      setIsTemporary(false);
    } else if (selectedTutor) {
      onSelect(selectedTutor, isTemporary);
      setSelectedTutor(null);
      setIsTemporary(false);
    }
  };

  // Filter tutors by search
  const filteredTutors = useMemo(() => {
    if (!searchQuery.trim()) return tutors;
    const query = searchQuery.toLowerCase();
    return tutors.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      getTeacherName(t.createdBy).toLowerCase().includes(query)
    );
  }, [tutors, searchQuery]);

  // Group tutors by subject
  const tutorsBySubject = filteredTutors.reduce((acc, tutor) => {
    if (!acc[tutor.subject]) {
      acc[tutor.subject] = [];
    }
    acc[tutor.subject].push(tutor);
    return acc;
  }, {} as Record<string, TutorConfig[]>);

  const hasSelection = activeTab === 'models' ? !!selectedModel : !!selectedTutor;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Neuer Chat</DialogTitle>
          <DialogDescription>
            {showDirectModels
              ? 'Wähle einen Tutor oder chatte direkt mit einem KI-Modell'
              : isTeacher 
                ? 'Wähle einen deiner Tutoren zum Testen'
                : 'Wähle einen KI-Tutor für deinen neuen Chat'
            }
          </DialogDescription>
        </DialogHeader>

        {showDirectModels ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tutors" className="gap-2">
                <Bot className="w-4 h-4" />
                Tutoren
              </TabsTrigger>
              <TabsTrigger value="models" className="gap-2">
                <Zap className="w-4 h-4" />
                Direkt mit KI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tutors" className="mt-4">
              {renderTutorList()}
            </TabsContent>

            <TabsContent value="models" className="mt-4">
              {renderModelList()}
            </TabsContent>
          </Tabs>
        ) : (
          renderTutorList()
        )}

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <div>
              <Label htmlFor="temporary" className="text-xs font-medium">
                Temporärer Chat
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Wird nicht gespeichert
              </p>
            </div>
          </div>
          <Switch
            id="temporary"
            checked={isTemporary}
            onCheckedChange={setIsTemporary}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button size="sm" onClick={handleSelect} disabled={!hasSelection}>
            Chat starten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  function renderTutorList() {
    if (tutors.length === 0) {
      return (
        <div className="text-center py-8">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            {isTeacher 
              ? 'Du hast noch keine Tutoren erstellt'
              : 'Keine Tutoren verfügbar'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tutor oder Lehrer suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <div className="max-h-[300px] overflow-y-auto space-y-3">
          {Object.entries(tutorsBySubject).map(([subject, subjectTutors]) => (
            <div key={subject}>
              <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                {subject}
              </p>
              <div className="space-y-1.5">
                {subjectTutors.map(tutor => {
                  const colorClass = subjectColors[tutor.subject] || subjectColors.default;
                  const isSelected = selectedTutor?.id === tutor.id;
                  
                  return (
                    <button
                      key={tutor.id}
                      onClick={() => {
                        setSelectedTutor(tutor);
                        setSelectedModel(null);
                      }}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 text-left transition-all",
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-transparent bg-muted/50 hover:bg-muted'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="text-2xl">{tutor.icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-medium text-sm">{tutor.name}</span>
                            {!tutor.isEnabled && (
                              <Badge variant="secondary" className="text-[10px]">
                                Deaktiviert
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {tutor.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60">
                            von {getTeacherName(tutor.createdBy)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {filteredTutors.length === 0 && searchQuery && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Tutoren gefunden
            </p>
          )}
        </div>
      </div>
    );
  }

  function renderModelList() {
    if (availableModels.length === 0) {
      return (
        <div className="text-center py-8">
          <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">
            Keine KI-Modelle konfiguriert
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
        {availableModels.map(model => {
          const isSelected = selectedModel?.id === model.id;
          
          return (
            <button
              key={model.id}
              onClick={() => {
                setSelectedModel(model);
                setSelectedTutor(null);
              }}
              className={cn(
                "w-full p-3 rounded-lg border-2 text-left transition-all",
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-transparent bg-muted/50 hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-medium text-sm">{model.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {model.providerName}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {model.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
};

export default TutorSelector;