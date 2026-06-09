import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, MessageSquare, FileText, Download, BookOpen, Clock, Info, Bot,
} from 'lucide-react';
import { subjectColors } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

const StudentTutorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTutorById, addChat } = useData();

  const tutor = getTutorById(id || '');

  if (!tutor) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Tutor nicht gefunden</h2>
          <p className="text-muted-foreground mb-4">Der angeforderte Tutor existiert nicht oder wurde entfernt.</p>
          <Button onClick={() => navigate('/app/home')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const handleStartChat = () => {
    const newChat = {
      id: `chat-${Date.now()}`,
      title: 'Neuer Chat',
      tutorId: tutor.id,
      userId: user!.id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemporary: false,
      schoolYear: '2024/25',
    };
    addChat(newChat);
    navigate('/app/chat');
  };

  const getTutorStatus = () => {
    if (!tutor.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(tutor.expiresAt);
    
    if (isBefore(expiry, now)) {
      return { type: 'expired', label: 'Abgelaufen', color: 'destructive' };
    }
    if (isBefore(expiry, addDays(now, 7))) {
      return { type: 'expiring', label: `Läuft ab am ${format(expiry, 'dd.MM.yyyy', { locale: de })}`, color: 'warning' };
    }
    return { type: 'active', label: `Verfügbar bis ${format(expiry, 'dd.MM.yyyy', { locale: de })}`, color: 'secondary' };
  };

  const status = getTutorStatus();
  const colorClass = subjectColors[tutor.subject] || subjectColors.default;
  const showKnowledgeBase = !tutor.hideKnowledgeBase && tutor.knowledgeFiles && tutor.knowledgeFiles.length > 0;

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-card flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" onClick={() => navigate('/app/home')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <span className="text-4xl">{tutor.icon}</span>
          <div>
            <h1 className="text-xl font-semibold">{tutor.name}</h1>
            <Badge variant="outline" className={cn("text-xs", colorClass)}>
              {tutor.subject}
            </Badge>
          </div>
        </div>
        <Button size="lg" onClick={handleStartChat}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Chat starten
        </Button>
      </header>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Status & Info */}
          <div className="flex flex-wrap gap-3">
            {status && (
              <Badge variant={status.color as any} className="text-sm py-1 px-3">
                <Clock className="w-4 h-4 mr-2" />
                {status.label}
              </Badge>
            )}
            {tutor.didacticMode && (
              <Badge variant="outline" className="text-sm py-1 px-3">
                <BookOpen className="w-4 h-4 mr-2" />
                {tutor.didacticMode === 'socratic' && 'Sokratische Methode'}
                {tutor.didacticMode === 'hints' && 'Hinweise statt Lösungen'}
                {tutor.didacticMode === 'step-by-step' && 'Schritt für Schritt'}
                {tutor.didacticMode === 'concise' && 'Kurz & präzise'}
              </Badge>
            )}
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="w-4 h-4" />
                Über diesen Tutor
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {tutor.description || 'Keine Beschreibung verfügbar.'}
              </p>
            </CardContent>
          </Card>

          {/* Assignment Section */}
          {(tutor.assignment || (tutor.assignmentDocuments && tutor.assignmentDocuments.length > 0)) && (
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Arbeitsauftrag
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {tutor.assignment && (
                  <div className="p-6 border-b">
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {tutor.assignment}
                      </p>
                    </div>
                  </div>
                )}

                {tutor.assignmentDocuments && tutor.assignmentDocuments.length > 0 && (
                  <div className="p-6">
                    <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Dokumente ({tutor.assignmentDocuments.length})
                    </h4>
                    <div className="space-y-3">
                      {tutor.assignmentDocuments.map(doc => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(doc.size / 1024).toFixed(0)} KB • {format(new Date(doc.uploadedAt), 'dd.MM.yyyy', { locale: de })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">Ansehen</Button>
                            <Button variant="ghost" size="icon-sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/30 p-8">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground mb-2">Dokumentvorschau</p>
                        <p className="text-xs text-muted-foreground/60">
                          Klicke auf "Ansehen" um ein Dokument hier anzuzeigen
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Knowledge Base - downloadable unless teacher hides it */}
          {showKnowledgeBase && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Wissensbasis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Dieser Tutor hat Zugriff auf folgende Dokumente:
                </p>
                <div className="space-y-2">
                  {tutor.knowledgeFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon-sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Mode Info */}
          {tutor.didacticMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Lernmethode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50">
                  {tutor.didacticMode === 'socratic' && (
                    <div>
                      <p className="font-medium mb-1">Sokratische Methode</p>
                      <p className="text-sm text-muted-foreground">
                        Der Tutor stellt dir gezielte Fragen, um dich selbst zur Lösung zu führen.
                      </p>
                    </div>
                  )}
                  {tutor.didacticMode === 'hints' && (
                    <div>
                      <p className="font-medium mb-1">Hinweise statt Lösungen</p>
                      <p className="text-sm text-muted-foreground">
                        Der Tutor gibt dir Tipps und Denkanstöße, aber keine fertigen Lösungen.
                      </p>
                    </div>
                  )}
                  {tutor.didacticMode === 'step-by-step' && (
                    <div>
                      <p className="font-medium mb-1">Schritt für Schritt</p>
                      <p className="text-sm text-muted-foreground">
                        Der Tutor erklärt dir jeden Schritt ausführlich und verständlich.
                      </p>
                    </div>
                  )}
                  {tutor.didacticMode === 'concise' && (
                    <div>
                      <p className="font-medium mb-1">Kurz & Präzise</p>
                      <p className="text-sm text-muted-foreground">
                        Der Tutor gibt dir kompakte, auf den Punkt gebrachte Antworten.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StudentTutorDetailPage;