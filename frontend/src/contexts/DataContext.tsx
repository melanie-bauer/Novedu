import React, { createContext, useContext, useState, useCallback } from 'react';
import { TutorConfig, Chat, Message, Class, BudgetConfig, CostEntry, GlobalSettings } from '@/types';
import { mockTutors, mockChats, mockClasses, mockBudgets, mockCosts, mockGlobalSettings } from '@/data/mockData';

interface DataContextType {
  tutors: TutorConfig[];
  chats: Chat[];
  classes: Class[];
  favoriteClassIds: string[];
  budgets: BudgetConfig[];
  costs: CostEntry[];
  globalSettings: GlobalSettings;
  addTutor: (tutor: TutorConfig) => void;
  updateTutor: (id: string, updates: Partial<TutorConfig>) => void;
  deleteTutor: (id: string) => void;
  toggleTutor: (id: string) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  toggleFavoriteClass: (classId: string) => void;
  getAvailableTutors: (userId: string, classId?: string) => TutorConfig[];
  getChatsByUser: (userId: string) => Chat[];
  getTutorById: (id: string) => TutorConfig | undefined;
  updateBudget: (id: string, updates: Partial<BudgetConfig>) => void;
  updateGlobalSettings: (updates: Partial<GlobalSettings>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tutors, setTutors] = useState<TutorConfig[]>(mockTutors);
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [classes] = useState<Class[]>(mockClasses);
  const [favoriteClassIds, setFavoriteClassIds] = useState<string[]>([]);
  const [budgets, setBudgets] = useState<BudgetConfig[]>(mockBudgets);
  const [costs] = useState<CostEntry[]>(mockCosts);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(mockGlobalSettings);

  const addTutor = useCallback((tutor: TutorConfig) => {
    setTutors(prev => [...prev, tutor]);
  }, []);

  const updateTutor = useCallback((id: string, updates: Partial<TutorConfig>) => {
    setTutors(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t));
  }, []);

  const deleteTutor = useCallback((id: string) => {
    setTutors(prev => prev.filter(t => t.id !== id));
  }, []);

  const toggleTutor = useCallback((id: string) => {
    setTutors(prev => prev.map(t => 
      t.id === id ? { ...t, isEnabled: !t.isEnabled } : t
    ));
  }, []);

  const addChat = useCallback((chat: Chat) => {
    setChats(prev => [...prev, chat]);
  }, []);

  const updateChat = useCallback((id: string, updates: Partial<Chat>) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteChat = useCallback((id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
  }, []);

  const addMessage = useCallback((chatId: string, message: Message) => {
    setChats(prev => prev.map(c => 
      c.id === chatId 
        ? { ...c, messages: [...c.messages, message], updatedAt: new Date() }
        : c
    ));
  }, []);

  const toggleFavoriteClass = useCallback((classId: string) => {
    setFavoriteClassIds(prev => (
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    ));
  }, []);

  const getAvailableTutors = useCallback((userId: string, classId?: string): TutorConfig[] => {
    return tutors.filter(t => {
      if (!t.isEnabled || t.status !== 'published') return false;
      if (t.visibility === 'public') return true;
      if (t.assignedStudents.includes(userId)) return true;
      if (classId && t.assignedClasses.includes(classId)) return true;
      return false;
    });
  }, [tutors]);

  const getChatsByUser = useCallback((userId: string): Chat[] => {
    return chats.filter(c => c.userId === userId);
  }, [chats]);

  const getTutorById = useCallback((id: string): TutorConfig | undefined => {
    return tutors.find(t => t.id === id);
  }, [tutors]);

  const updateBudget = useCallback((id: string, updates: Partial<BudgetConfig>) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  }, []);

  const updateGlobalSettings = useCallback((updates: Partial<GlobalSettings>) => {
    setGlobalSettings(prev => ({ ...prev, ...updates, lastModifiedAt: new Date() }));
  }, []);

  return (
    <DataContext.Provider value={{
      tutors,
      chats,
      classes,
      favoriteClassIds,
      budgets,
      costs,
      globalSettings,
      addTutor,
      updateTutor,
      deleteTutor,
      toggleTutor,
      addChat,
      updateChat,
      deleteChat,
      addMessage,
      toggleFavoriteClass,
      getAvailableTutors,
      getChatsByUser,
      getTutorById,
      updateBudget,
      updateGlobalSettings,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
