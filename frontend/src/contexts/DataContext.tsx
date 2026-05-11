import React, { createContext, useContext, useState, useCallback } from 'react';
import { TutorConfig, Chat, Message, Class, BudgetConfig, CostEntry, GlobalSettings } from '@/types';
import { mockTutors, mockChats, mockClasses, mockBudgets, mockCosts, mockGlobalSettings } from '@/data/mockData';

interface DataContextType {
  tutors: TutorConfig[];
  chats: Chat[];
  classes: Class[];
  budgets: BudgetConfig[];
  costs: CostEntry[];
  globalSettings: GlobalSettings;
  addTutor: (tutor: TutorConfig) => void;
  updateTutor: (
    id: string,
    updates: Partial<TutorConfig>,
    meta?: { assignerIdForNewClassAssignments?: string },
  ) => void;
  deleteTutor: (id: string) => void;
  toggleTutor: (id: string) => void;
  assignTutorToClass: (tutorId: string, classId: string, assignerId: string) => void;
  unassignTutorFromClass: (tutorId: string, classId: string) => void;
  addChat: (chat: Chat) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  addMessage: (chatId: string, message: Message) => void;
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
  const [budgets, setBudgets] = useState<BudgetConfig[]>(mockBudgets);
  const [costs] = useState<CostEntry[]>(mockCosts);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(mockGlobalSettings);

  const addTutor = useCallback((tutor: TutorConfig) => {
    setTutors(prev => [...prev, tutor]);
  }, []);

  const updateTutor = useCallback(
    (id: string, updates: Partial<TutorConfig>, meta?: { assignerIdForNewClassAssignments?: string }) => {
      setTutors((prev) =>
        prev.map((t) => {
          if (t.id !== id) return t;
          const merged: TutorConfig = { ...t, ...updates, updatedAt: new Date() };
          const assigner = meta?.assignerIdForNewClassAssignments ?? merged.createdBy;

          if (updates.classAssignments !== undefined) {
            merged.classAssignments = updates.classAssignments;
            merged.assignedClasses = [...new Set(updates.classAssignments.map((a) => a.classId))];
          } else if (updates.assignedClasses !== undefined) {
            const prevAssignments =
              t.classAssignments && t.classAssignments.length > 0
                ? t.classAssignments
                : t.assignedClasses.map((cid) => ({ classId: cid, assignedById: t.createdBy }));
            const newIds = new Set(merged.assignedClasses);
            const next = prevAssignments.filter((a) => newIds.has(a.classId));
            const have = new Set(next.map((a) => a.classId));
            merged.assignedClasses.forEach((cid) => {
              if (!have.has(cid)) {
                next.push({ classId: cid, assignedById: assigner });
                have.add(cid);
              }
            });
            merged.classAssignments = next;
          }

          return merged;
        }),
      );
    },
    [],
  );

  const assignTutorToClass = useCallback((tutorId: string, classId: string, assignerId: string) => {
    setTutors((prev) =>
      prev.map((t) => {
        if (t.id !== tutorId) return t;
        const base =
          t.classAssignments && t.classAssignments.length > 0
            ? [...t.classAssignments]
            : t.assignedClasses.map((cid) => ({ classId: cid, assignedById: t.createdBy }));
        if (base.some((a) => a.classId === classId)) return t;
        const classAssignments = [...base, { classId, assignedById: assignerId }];
        const assignedClasses = [...new Set(classAssignments.map((a) => a.classId))];
        return { ...t, classAssignments, assignedClasses, updatedAt: new Date() };
      }),
    );
  }, []);

  const unassignTutorFromClass = useCallback((tutorId: string, classId: string) => {
    setTutors((prev) =>
      prev.map((t) => {
        if (t.id !== tutorId) return t;
        const base =
          t.classAssignments && t.classAssignments.length > 0
            ? t.classAssignments
            : t.assignedClasses.map((cid) => ({ classId: cid, assignedById: t.createdBy }));
        const classAssignments = base.filter((a) => a.classId !== classId);
        const assignedClasses = [...new Set(classAssignments.map((a) => a.classId))];
        return { ...t, classAssignments, assignedClasses, updatedAt: new Date() };
      }),
    );
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

  const getAvailableTutors = useCallback((userId: string, classId?: string): TutorConfig[] => {
    return tutors.filter(t => {
      if (!t.isEnabled || t.status !== 'published') return false;
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
      budgets,
      costs,
      globalSettings,
      addTutor,
      updateTutor,
      deleteTutor,
      toggleTutor,
      assignTutorToClass,
      unassignTutorFromClass,
      addChat,
      updateChat,
      deleteChat,
      addMessage,
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
