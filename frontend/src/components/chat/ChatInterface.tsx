import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  GraduationCap, 
  LogOut, 
  Plus, 
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  Clock,
  Settings,
  Sun,
  Moon,
  Bot
} from 'lucide-react';
import { Chat, TutorConfig, ChatFolder } from '@/types';
import ChatView from './ChatView';
import TutorSelector from './TutorSelector';
import TutorManager from './TutorManager';
import { cn } from '@/lib/utils';
import { modelOptions } from '@/data/mockData';

const ChatInterface: React.FC = () => {
  const { user, logout } = useAuth();
  const { getAvailableTutors, getChatsByUser, getTutorById, addChat, deleteChat, tutors } = useData();
  const { theme, toggleTheme } = useTheme();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isTutorSelectorOpen, setIsTutorSelectorOpen] = useState(false);
  const [isTutorManagerOpen, setIsTutorManagerOpen] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedTutors, setExpandedTutors] = useState<Set<string>>(new Set());

  const isTeacher = user?.role === 'teacher';
  
  // For teachers, show all tutors they created + standard models
  // For students, show only assigned tutors
  const availableTutors = isTeacher 
    ? tutors.filter(t => t.createdBy === user?.id)
    : getAvailableTutors(user!.id, user!.classId);
    
  const userChats = getChatsByUser(user!.id);

  // Organize chats by subject and tutor
  const chatFolders = useMemo(() => {
    const folders: ChatFolder[] = [];
    const subjectMap = new Map<string, Map<string, Chat[]>>();

    userChats.forEach(chat => {
      const tutor = getTutorById(chat.tutorId);
      if (!tutor) return;

      if (!subjectMap.has(tutor.subject)) {
        subjectMap.set(tutor.subject, new Map());
      }
      const tutorMap = subjectMap.get(tutor.subject)!;
      
      if (!tutorMap.has(tutor.id)) {
        tutorMap.set(tutor.id, []);
      }
      tutorMap.get(tutor.id)!.push(chat);
    });

    subjectMap.forEach((tutorMap, subject) => {
      const tutorsList: ChatFolder['tutors'] = [];
      tutorMap.forEach((chats, tutorId) => {
        const tutor = getTutorById(tutorId);
        if (tutor) {
          tutorsList.push({
            tutorId,
            tutorName: tutor.name,
            chats: chats.sort((a, b) => 
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ),
          });
        }
      });
      folders.push({ subject, tutors: tutorsList });
    });

    return folders.sort((a, b) => a.subject.localeCompare(b.subject));
  }, [userChats, getTutorById]);

  const selectedChat = userChats.find(c => c.id === selectedChatId);
  const selectedTutor = selectedChat ? getTutorById(selectedChat.tutorId) : null;

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) {
        next.delete(subject);
      } else {
        next.add(subject);
      }
      return next;
    });
  };

  const toggleTutorExpand = (tutorId: string) => {
    setExpandedTutors(prev => {
      const next = new Set(prev);
      if (next.has(tutorId)) {
        next.delete(tutorId);
      } else {
        next.add(tutorId);
      }
      return next;
    });
  };

  const handleNewChat = (tutor: TutorConfig, isTemporary: boolean) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: 'Neuer Chat',
      tutorId: tutor.id,
      userId: user!.id,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isTemporary,
      schoolYear: '2024/25',
    };
    addChat(newChat);
    setSelectedChatId(newChat.id);
    setIsTutorSelectorOpen(false);
    setExpandedSubjects(prev => new Set([...prev, tutor.subject]));
    setExpandedTutors(prev => new Set([...prev, tutor.id]));
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-sidebar-primary" />
            </div>
            <span className="font-semibold text-sidebar-foreground">EduTutor</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleTheme}
            className="text-sidebar-foreground/60 hover:text-sidebar-foreground"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button 
            onClick={() => setIsTutorSelectorOpen(true)} 
            className="w-full gap-2"
            variant="outline"
          >
            <Plus className="w-4 h-4" />
            Neuer Chat
          </Button>
        </div>

        {/* Teacher: Tutor Management */}
        {isTeacher && (
          <div className="px-3 pb-2">
            <Button 
              onClick={() => setIsTutorManagerOpen(true)} 
              variant="ghost"
              className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-sidebar-foreground"
            >
              <Settings className="w-4 h-4" />
              Tutoren verwalten
              <span className="ml-auto text-xs bg-sidebar-accent px-1.5 py-0.5 rounded">
                {availableTutors.length}
              </span>
            </Button>
          </div>
        )}

        <div className="px-3 py-2">
          <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Chats
          </p>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          <div className="py-1 space-y-0.5">
            {chatFolders.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-sidebar-foreground/20" />
                <p className="text-xs text-sidebar-foreground/50">
                  Noch keine Chats
                </p>
              </div>
            ) : (
              chatFolders.map(folder => (
                <div key={folder.subject}>
                  {/* Subject Folder */}
                  <button
                    onClick={() => toggleSubject(folder.subject)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-sidebar-foreground/60 hover:bg-sidebar-accent/50 transition-colors"
                  >
                    {expandedSubjects.has(folder.subject) ? (
                      <ChevronDown className="w-3 h-3" />
                    ) : (
                      <ChevronRight className="w-3 h-3" />
                    )}
                    <span>{folder.subject}</span>
                  </button>

                  {/* Tutors within Subject */}
                  {expandedSubjects.has(folder.subject) && (
                    <div className="ml-2">
                      {folder.tutors.map(({ tutorId, tutorName, chats }) => {
                        const tutor = getTutorById(tutorId);
                        return (
                          <div key={tutorId}>
                            <button
                              onClick={() => toggleTutorExpand(tutorId)}
                              className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-xs text-sidebar-foreground/50 hover:bg-sidebar-accent/50 transition-colors"
                            >
                              {expandedTutors.has(tutorId) ? (
                                <ChevronDown className="w-3 h-3" />
                              ) : (
                                <ChevronRight className="w-3 h-3" />
                              )}
                              <span>{tutor?.icon}</span>
                              <span className="truncate">{tutorName}</span>
                            </button>

                            {expandedTutors.has(tutorId) && (
                              <div className="ml-4">
                                {chats.map(chat => (
                                  <button
                                    key={chat.id}
                                    onClick={() => setSelectedChatId(chat.id)}
                                    className={cn(
                                      "w-full group flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
                                      selectedChatId === chat.id
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                                    )}
                                  >
                                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate flex-1 text-left">
                                      {chat.title}
                                    </span>
                                    {chat.isTemporary && (
                                      <Clock className="w-3 h-3 text-sidebar-foreground/30" />
                                    )}
                                    <button
                                      onClick={(e) => handleDeleteChat(chat.id, e)}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-destructive transition-opacity"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* User Info */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-medium text-sidebar-primary">
              {user?.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">
                {user?.name}
              </p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">
                {isTeacher ? 'Lehrer' : 'Schüler'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              onClick={logout} 
              className="text-sidebar-foreground/50 hover:text-sidebar-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {selectedChat && selectedTutor ? (
          <ChatView 
            chat={selectedChat} 
            tutor={selectedTutor}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="text-center max-w-md px-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                <Bot className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Womit kann ich helfen?</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {isTeacher 
                  ? 'Starte einen Chat mit einem deiner Tutoren zum Testen oder erstelle neue Tutoren.'
                  : 'Wähle einen Tutor aus und stelle deine Fragen.'
                }
              </p>
              <Button 
                size="lg" 
                onClick={() => setIsTutorSelectorOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Neuen Chat starten
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Tutor Selector Modal */}
      <TutorSelector
        open={isTutorSelectorOpen}
        onOpenChange={setIsTutorSelectorOpen}
        tutors={availableTutors}
        onSelect={handleNewChat}
        isTeacher={isTeacher}
      />

      {/* Tutor Manager Modal (Teachers only) */}
      {isTeacher && (
        <TutorManager
          open={isTutorManagerOpen}
          onOpenChange={setIsTutorManagerOpen}
        />
      )}
    </div>
  );
};

export default ChatInterface;
