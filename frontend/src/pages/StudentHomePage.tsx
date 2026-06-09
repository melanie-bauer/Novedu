import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, MessageSquare, Clock, FileText, ChevronRight, Bot, AlertCircle,
} from 'lucide-react';
import { TutorConfig } from '@/types';
import { subjectColors } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { format, isBefore, addDays } from 'date-fns';
import { de } from 'date-fns/locale';

const StudentHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getAvailableTutors, addChat } = useData();
  const [searchQuery, setSearchQuery] = useState('');

  const availableTutors = getAvailableTutors(user!.id, user!.classId);

  const filteredTutors = useMemo(() => {
    if (!searchQuery.trim()) return availableTutors;
    const query = searchQuery.toLowerCase();
    return availableTutors.filter(t => 
      t.name.toLowerCase().includes(query) ||
      t.subject.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  }, [availableTutors, searchQuery]);

  const handleStartChat = (tutor: TutorConfig, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleViewDetails = (tutor: TutorConfig) => {
    navigate(`/app/tutor/${tutor.id}`);
  };

  const getTutorStatus = (tutor: TutorConfig) => {
    if (!tutor.expiresAt) return null;
    const now = new Date();
    const expiry = new Date(tutor.expiresAt);
    
    if (isBefore(expiry, now)) {
      return { type: 'expired', label: 'Abgelaufen', color: 'destructive' };
    }
    if (isBefore(expiry, addDays(now, 7))) {
      return { type: 'expiring', label: `Bis ${format(expiry, 'dd.MM.yyyy', { locale: de })}`, color: 'warning' };
    }
    return { type: 'active', label: `Bis ${format(expiry, 'dd.MM.yyyy', { locale: de })}`, color: 'secondary' };
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-card">
        <h1 className="text-2xl font-semibold mb-1">Meine Tutoren</h1>
        <p className="text-sm text-muted-foreground">
          Wähle einen Tutor aus, um mit dem Lernen zu beginnen
        </p>
      </header>

      {/* Search */}
      <div className="px-6 py-4 border-b bg-muted/30">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tutor suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-6">
        {filteredTutors.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">
                {availableTutors.length === 0 ? 'Keine Tutoren verfügbar' : 'Keine Tutoren gefunden'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {availableTutors.length === 0 
                  ? 'Es wurden dir noch keine Tutoren freigeschaltet. Kontaktiere deinen Lehrer.'
                  : 'Versuche einen anderen Suchbegriff'
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTutors.map(tutor => {
              const colorClass = subjectColors[tutor.subject] || subjectColors.default;
              const status = getTutorStatus(tutor);
              const hasAssignment = tutor.assignment || (tutor.assignmentDocuments && tutor.assignmentDocuments.length > 0);
              const isExpired = status?.type === 'expired';
              
              return (
                <Card 
                  key={tutor.id} 
                  className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/20 flex flex-col"
                  onClick={() => handleViewDetails(tutor)}
                >
                  <CardContent className="p-4 flex flex-col flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-4xl">{tutor.icon}</div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{tutor.name}</h3>
                        <Badge variant="outline" className={cn("text-[10px] mt-1", colorClass)}>
                          {tutor.subject}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
                      {tutor.description || 'Keine Beschreibung'}
                    </p>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.5rem]">
                      {isExpired ? (
                        <Badge variant="destructive" className="text-[10px]">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Abgelaufen
                        </Badge>
                      ) : status && (
                        <Badge variant={status.color as any} className="text-[10px]">
                          <Clock className="w-3 h-3 mr-1" />
                          {status.label}
                        </Badge>
                      )}
                      {hasAssignment && (
                        <Badge variant="outline" className="text-[10px] bg-primary/5">
                          <FileText className="w-3 h-3 mr-1" />
                          Arbeitsauftrag
                        </Badge>
                      )}
                    </div>

                    {/* Actions - always at bottom */}
                    <div className="flex gap-2 mt-auto">
                      <Button 
                        className="flex-1 h-9" 
                        size="sm"
                        onClick={(e) => handleStartChat(tutor, e)}
                        disabled={isExpired}
                      >
                        <MessageSquare className="w-3 h-3 mr-1" />
                        Chat starten
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-9 w-9 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(tutor);
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default StudentHomePage;