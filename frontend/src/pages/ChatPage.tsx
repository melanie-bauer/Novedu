import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, 
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Trash2,
  Clock,
  Search,
  Bot,
  Pencil,
  MoreHorizontal,
  Calendar,
  Zap,
} from 'lucide-react';
import { Chat, TutorConfig, ChatFolder, AIModel } from '@/types';
import ChatView from '@/components/chat/ChatView';
import TutorSelector from '@/components/chat/TutorSelector';
import { cn } from '@/lib/utils';
import { schoolYears, mockAIProviders } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

type SortMode = 'recent' | 'schoolYear';

const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { getAvailableTutors, getChatsByUser, getTutorById, addChat, deleteChat, updateChat, tutors } = useData();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isTutorSelectorOpen, setIsTutorSelectorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedTutors, setExpandedTutors] = useState<Set<string>>(new Set());
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set(['2024/25']));
  const [renamingChat, setRenamingChat] = useState<Chat | null>(null);
  const [newChatTitle, setNewChatTitle] = useState('');

  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  
  // Teachers and admins can access all tutors and direct model chat
  const availableTutors = (isTeacher || isAdmin)
    ? tutors.filter(t => t.createdBy === user?.id || isAdmin)
    : getAvailableTutors(user!.id, user!.classId);
    
  const userChats = getChatsByUser(user!.id);

  // Filter chats by search
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return userChats;
    const query = searchQuery.toLowerCase();
    return userChats.filter(chat => 
      chat.title.toLowerCase().includes(query) ||
      getTutorById(chat.tutorId)?.name.toLowerCase().includes(query)
    );
  }, [userChats, searchQuery, getTutorById]);

  // Organize chats by subject and tutor
  const chatFolders = useMemo(() => {
    if (sortMode === 'schoolYear') {
      // Group by school year first
      const yearMap = new Map<string, ChatFolder[]>();
      
      filteredChats.forEach(chat => {
        const tutor = getTutorById(chat.tutorId);
        if (!tutor) return;
        const year = chat.schoolYear || '2024/25';
        
        if (!yearMap.has(year)) {
          yearMap.set(year, []);
        }
        
        // Find or create subject folder within year
        const folders = yearMap.get(year)!;
        let subjectFolder = folders.find(f => f.subject === tutor.subject);
        if (!subjectFolder) {
          subjectFolder = { subject: tutor.subject, tutors: [] };
          folders.push(subjectFolder);
        }
        
        // Find or create tutor within subject
        let tutorEntry = subjectFolder.tutors.find(t => t.tutorId === tutor.id);
        if (!tutorEntry) {
          tutorEntry = { tutorId: tutor.id, tutorName: tutor.name, chats: [] };
          subjectFolder.tutors.push(tutorEntry);
        }
        
        tutorEntry.chats.push(chat);
      });
      
      return { type: 'schoolYear' as const, data: yearMap };
    }

    // Standard grouping by subject > tutor
    const folders: ChatFolder[] = [];
    const subjectMap = new Map<string, Map<string, Chat[]>>();

    filteredChats.forEach(chat => {
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

    return { type: 'subject' as const, data: folders.sort((a, b) => a.subject.localeCompare(b.subject)) };
  }, [filteredChats, getTutorById, sortMode]);

  const selectedChat = userChats.find(c => c.id === selectedChatId);
  const selectedTutor = selectedChat ? getTutorById(selectedChat.tutorId) : null;

  const toggleSubject = (subject: string) => {
    setExpandedSubjects(prev => {
      const next = new Set(prev);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
  };

  const toggleTutorExpand = (tutorId: string) => {
    setExpandedTutors(prev => {
      const next = new Set(prev);
      if (next.has(tutorId)) next.delete(tutorId);
      else next.add(tutorId);
      return next;
    });
  };

  const toggleYear = (year: string) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
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

  const handleNewModelChat = (model: AIModel, isTemporary: boolean) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      title: `Chat mit ${model.name}`,
      tutorId: null,
      modelId: model.id,
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
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
    if (selectedChatId === chatId) {
      setSelectedChatId(null);
    }
  };

  const handleRenameChat = () => {
    if (renamingChat && newChatTitle.trim()) {
      updateChat(renamingChat.id, { title: newChatTitle.trim() });
      setRenamingChat(null);
      setNewChatTitle('');
    }
  };

  const openRenameDialog = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingChat(chat);
    setNewChatTitle(chat.title);
  };

  const renderChatItem = (chat: Chat) => {
    const tutor = getTutorById(chat.tutorId);
    return (
      <button
        key={chat.id}
        onClick={() => setSelectedChatId(chat.id)}
        className={cn(
          "w-full group flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors",
          selectedChatId === chat.id
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
        )}
      >
        <MessageSquare className="w-3 h-3 flex-shrink-0" />
        <span className="truncate flex-1 text-left">{chat.title}</span>
        {chat.isTemporary && (
          <Clock className="w-3 h-3 text-sidebar-foreground/30" />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-sidebar-accent rounded transition-opacity">
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem onClick={(e) => openRenameDialog(chat, e as never)}>
              <Pencil className="w-3 h-3 mr-2" />
              Umbenennen
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => handleDeleteChat(chat.id, e as never)}
              className="text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </button>
    );
  };

  const renderSubjectFolder = (folder: ChatFolder) => (
    <div key={folder.subject}>
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
        <span className="ml-auto text-[10px] text-sidebar-foreground/40">
          {folder.tutors.reduce((acc, t) => acc + t.chats.length, 0)}
        </span>
      </button>

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
                  <span className="ml-auto text-[10px] text-sidebar-foreground/40">{chats.length}</span>
                </button>

                {expandedTutors.has(tutorId) && (
                  <div className="ml-4">
                    {chats.map(renderChatItem)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex">
      {/* Chat Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        {/* New Chat Button */}
        <div className="p-3 border-b border-sidebar-border">
          <Button 
            onClick={() => setIsTutorSelectorOpen(true)} 
            className="w-full gap-2"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            Neuer Chat
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-sidebar-border space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-sidebar-foreground/40" />
            <Input
              placeholder="Chats durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/40"
            />
          </div>
          <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
            <SelectTrigger className="h-7 text-xs bg-sidebar-accent border-sidebar-border text-sidebar-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Neueste zuerst</SelectItem>
              <SelectItem value="schoolYear">Nach Schuljahr</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          <div className="py-2 space-y-0.5">
            {availableTutors.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Bot className="w-10 h-10 mx-auto mb-3 text-sidebar-foreground/20" />
                <p className="text-xs text-sidebar-foreground/50 mb-1">
                  Keine Tutoren verfügbar
                </p>
                <p className="text-[10px] text-sidebar-foreground/40">
                  Es wurden dir noch keine Tutoren freigeschaltet
                </p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8 px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-sidebar-foreground/20" />
                <p className="text-xs text-sidebar-foreground/50">
                  {searchQuery ? 'Keine Chats gefunden' : 'Noch keine Chats'}
                </p>
              </div>
            ) : sortMode === 'schoolYear' && chatFolders.type === 'schoolYear' ? (
              // School year view
              Array.from(chatFolders.data.entries())
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, folders]) => (
                  <div key={year}>
                    <button
                      onClick={() => toggleYear(year)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 transition-colors"
                    >
                      {expandedYears.has(year) ? (
                        <ChevronDown className="w-3 h-3" />
                      ) : (
                        <ChevronRight className="w-3 h-3" />
                      )}
                      <Calendar className="w-3 h-3" />
                      <span>{year}</span>
                    </button>
                    {expandedYears.has(year) && (
                      <div className="ml-2">
                        {folders.map(renderSubjectFolder)}
                      </div>
                    )}
                  </div>
                ))
            ) : chatFolders.type === 'subject' ? (
              chatFolders.data.map(renderSubjectFolder)
            ) : null}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Chat Area */}
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
                {availableTutors.length === 0 
                  ? 'Es wurden dir noch keine Tutoren freigeschaltet. Kontaktiere deinen Lehrer.'
                  : (isTeacher || isAdmin)
                    ? 'Starte einen Chat mit einem Tutor zum Testen.'
                    : 'Wähle einen Tutor aus und stelle deine Fragen.'
                }
              </p>
              {availableTutors.length > 0 && (
                <Button 
                  size="lg" 
                  onClick={() => setIsTutorSelectorOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Neuen Chat starten
                </Button>
              )}
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
        onSelectModel={handleNewModelChat}
        isTeacher={isTeacher || isAdmin}
        showDirectModels={!isStudent}
      />

      {/* Rename Chat Dialog */}
      <Dialog open={!!renamingChat} onOpenChange={() => setRenamingChat(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Chat umbenennen</DialogTitle>
          </DialogHeader>
          <Input
            value={newChatTitle}
            onChange={(e) => setNewChatTitle(e.target.value)}
            placeholder="Chat-Titel..."
            onKeyDown={(e) => e.key === 'Enter' && handleRenameChat()}
          />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRenamingChat(null)}>
              Abbrechen
            </Button>
            <Button size="sm" onClick={handleRenameChat}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
