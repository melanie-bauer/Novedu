import { User, Class, TutorConfig, Chat, BudgetConfig, CostEntry, GlobalSettings, AIProvider, Group, Role } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Admin Schulz',
    email: 'admin@schule.at',
    role: 'admin',
    avatar: 'AS',
    school: 'HTL Leonding',
    budget: 1000,
    budgetUsed: 450,
    budgetPeriod: 'monthly',
    isActive: true,
  },
  {
    id: 'teacher-1',
    name: 'Dr. Maria Schmidt',
    email: 'maria.schmidt@schule.at',
    role: 'teacher',
    avatar: 'MS',
    school: 'HTL Leonding',
    budget: 200,
    budgetUsed: 85,
    budgetPeriod: 'monthly',
    isActive: true,
  },
  {
    id: 'teacher-2',
    name: 'Thomas Müller',
    email: 'thomas.mueller@schule.at',
    role: 'teacher',
    avatar: 'TM',
    school: 'HTL Leonding',
    budget: 200,
    budgetUsed: 120,
    budgetPeriod: 'monthly',
    isActive: true,
  },
  {
    id: 'student-1',
    name: 'Anna Bauer',
    email: 'anna.bauer@schule.at',
    role: 'student',
    classId: 'class-a',
    avatar: 'AB',
    school: 'HTL Leonding',
    budget: 50,
    budgetUsed: 22,
    budgetPeriod: 'monthly',
    isActive: true,
  },
  {
    id: 'student-2',
    name: 'Ben Weber',
    email: 'ben.weber@schule.at',
    role: 'student',
    classId: 'class-a',
    avatar: 'BW',
    school: 'HTL Leonding',
    budget: 50,
    budgetUsed: 35,
    budgetPeriod: 'monthly',
    isActive: true,
  },
  {
    id: 'student-3',
    name: 'Clara Fischer',
    email: 'clara.fischer@schule.at',
    role: 'student',
    classId: 'class-a',
    avatar: 'CF',
    school: 'HTL Leonding',
    budget: 50,
    budgetUsed: 48,
    budgetPeriod: 'monthly',
    isActive: true,
  },
  {
    id: 'student-4',
    name: 'David Koch',
    email: 'david.koch@schule.at',
    role: 'student',
    classId: 'class-b',
    avatar: 'DK',
    school: 'HTL Leonding',
    budget: 50,
    budgetUsed: 15,
    budgetPeriod: 'weekly',
    isActive: true,
  },
  {
    id: 'student-5',
    name: 'Emma Hoffmann',
    email: 'emma.hoffmann@schule.at',
    role: 'student',
    classId: 'class-b',
    avatar: 'EH',
    school: 'HTL Leonding',
    budget: 50,
    budgetUsed: 42,
    budgetPeriod: 'monthly',
    isActive: true,
  },
  {
    id: 'student-6',
    name: 'Felix Braun',
    email: 'felix.braun@schule.at',
    role: 'student',
    classId: 'class-b',
    avatar: 'FB',
    school: 'HTL Leonding',
    budget: 50,
    budgetUsed: 28,
    budgetPeriod: 'monthly',
    isActive: false,
  },
];

export const mockClasses: Class[] = [
  {
    id: 'class-a',
    name: '5AHIF',
    teacherId: 'teacher-1',
    studentIds: ['student-1', 'student-2', 'student-3'],
    schoolYear: '2025/26',
  },
  {
    id: 'class-b',
    name: '4AHIF',
    teacherId: 'teacher-2',
    studentIds: ['student-4', 'student-5', 'student-6'],
    schoolYear: '2025/26',
  },
];

export const mockTutors: TutorConfig[] = [
  {
    id: 'tutor-1',
    name: 'Mathe-Meister',
    subject: 'Mathematik',
    description: 'Hilft bei allen mathematischen Fragen von Algebra bis Analysis',
    systemPrompt: 'Du bist ein freundlicher Mathematik-Tutor für Schüler der 5AHIF',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    knowledgeFiles: [
      { id: 'doc-1', name: 'mathe_formeln.pdf', uploadedAt: new Date('2024-01-10'), size: 2500000, type: 'application/pdf' },
    ],
    createdBy: 'teacher-1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-01'),
    isEnabled: true,
    status: 'published',
    assignedClasses: ['class-a'],
    assignedStudents: [],
    icon: '📐',
    color: 'blue',
    didacticMode: 'step-by-step',
    safetyRules: { noPersonalData: true, noFullSolutions: true },
    showSources: true,
    hideKnowledgeBase: false,
    expiresAt: new Date('2025-06-30'),
    assignment: 'Bearbeite die Übungsaufgaben zu quadratischen Gleichungen auf Seite 42-45 im Mathebuch.',
    assignmentDocuments: [
      { id: 'assign-1', name: 'Uebungsblatt_Quadratische_Gleichungen.pdf', type: 'application/pdf', size: 150000, uploadedAt: new Date('2024-03-01') }
    ],
  },
  {
    id: 'tutor-2',
    name: 'Deutsch-Detektiv',
    subject: 'Deutsch',
    description: 'Unterstützt bei Grammatik, Rechtschreibung und Textanalyse',
    systemPrompt: 'Du bist ein Deutsch-Tutor.',
    model: 'gpt-4',
    temperature: 0.8,
    maxTokens: 2048,
    knowledgeFiles: [],
    createdBy: 'teacher-1',
    createdAt: new Date('2024-01-20'),
    isEnabled: true,
    status: 'published',
    assignedClasses: ['class-a'],
    assignedStudents: ['student-4'],
    icon: '📚',
    color: 'green',
    didacticMode: 'hints',
    safetyRules: { noPersonalData: true, noFullSolutions: false },
    showSources: true,
  },
  {
    id: 'tutor-3',
    name: 'Physik-Profi',
    subject: 'Physik',
    description: 'Erklärt physikalische Phänomene verständlich',
    systemPrompt: 'Du bist ein Physik-Tutor.',
    model: 'gpt-3.5-turbo',
    temperature: 0.6,
    maxTokens: 1024,
    knowledgeFiles: [
      { id: 'doc-2', name: 'physik_experimente.pdf', uploadedAt: new Date('2024-02-05'), size: 1800000, type: 'application/pdf' },
    ],
    createdBy: 'teacher-2',
    createdAt: new Date('2024-02-01'),
    isEnabled: true,
    status: 'published',
    assignedClasses: ['class-b'],
    assignedStudents: [],
    icon: '⚡',
    color: 'yellow',
    didacticMode: 'socratic',
    safetyRules: { noPersonalData: true, noFullSolutions: true },
    showSources: false,
    expiresAt: new Date('2025-03-15'),
  },
  {
    id: 'tutor-4',
    name: 'Englisch-Experte',
    subject: 'Englisch',
    description: 'Verbessert Englischkenntnisse und Konversation',
    systemPrompt: 'You are an English tutor for German students.',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2048,
    knowledgeFiles: [],
    createdBy: 'teacher-2',
    createdAt: new Date('2024-02-10'),
    isEnabled: false,
    status: 'draft',
    assignedClasses: ['class-b'],
    assignedStudents: [],
    icon: '🌍',
    color: 'purple',
    didacticMode: 'concise',
    safetyRules: { noPersonalData: true, noFullSolutions: false },
    showSources: true,
  },
];

export const mockChats: Chat[] = [
  {
    id: 'chat-1',
    title: 'Quadratische Gleichungen',
    tutorId: 'tutor-1',
    userId: 'student-1',
    schoolYear: '2024/25',
    messages: [
      { id: 'msg-1', role: 'user', content: 'Kannst du mir erklären, wie ich quadratische Gleichungen löse?', timestamp: new Date('2024-03-01T10:00:00') },
      { id: 'msg-2', role: 'assistant', content: 'Natürlich! Quadratische Gleichungen haben die Form ax² + bx + c = 0.', timestamp: new Date('2024-03-01T10:00:05'), sources: ['mathe_formeln.pdf, S. 42'] },
    ],
    createdAt: new Date('2024-03-01T10:00:00'),
    updatedAt: new Date('2024-03-01T10:00:05'),
    isTemporary: false,
  },
  {
    id: 'chat-2',
    title: 'Gedichtanalyse Goethe',
    tutorId: 'tutor-2',
    userId: 'student-1',
    schoolYear: '2024/25',
    messages: [
      { id: 'msg-3', role: 'user', content: 'Wie analysiere ich ein Gedicht von Goethe?', timestamp: new Date('2024-03-02T14:00:00') },
      { id: 'msg-4', role: 'assistant', content: 'Eine Gedichtanalyse folgt einem strukturierten Aufbau.', timestamp: new Date('2024-03-02T14:00:10') },
    ],
    createdAt: new Date('2024-03-02T14:00:00'),
    updatedAt: new Date('2024-03-02T14:00:10'),
    isTemporary: false,
  },
  {
    id: 'chat-3',
    title: 'Vokabeltest Vorbereitung',
    tutorId: 'tutor-2',
    userId: 'student-1',
    schoolYear: '2023/24',
    messages: [],
    createdAt: new Date('2024-01-15T09:00:00'),
    updatedAt: new Date('2024-01-15T09:00:00'),
    isTemporary: false,
  },
];

export const mockGroups: Group[] = [
  { id: 'group-1', name: '5. Klassen', description: 'Höhere Informatik 5. Jahrgang', memberIds: ['student-1', 'student-2'], createdAt: new Date('2024-09-01'), budget: 20, budgetPeriod: 'monthly', warningThreshold: 80 },
  { id: 'group-2', name: 'Mathe-AG', description: 'Arbeitsgemeinschaft Mathematik', memberIds: ['student-3', 'student-4', 'student-5'], createdAt: new Date('2024-09-01'), budget: 15, budgetPeriod: 'monthly', warningThreshold: 80 },
  { id: 'group-3', name: 'Projektkurs Physik', description: 'Projektkurs Experimentalphysik', memberIds: ['student-4', 'student-6'], createdAt: new Date('2024-10-15') },
];

export const mockRoles: Role[] = [
  { id: 'student', name: 'Schüler', description: 'Standardrolle für Schüler', isSystem: true, maxIndividualBudget: 10, budgetPeriod: 'monthly', warningThreshold: 80, memberIds: ['student-1', 'student-2', 'student-3', 'student-4', 'student-5', 'student-6'] },
  { id: 'teacher', name: 'Lehrer', description: 'Standardrolle für Lehrkräfte', isSystem: true, maxIndividualBudget: 100, budgetPeriod: 'monthly', warningThreshold: 90, memberIds: ['teacher-1', 'teacher-2'] },
  { id: 'admin', name: 'Administrator', description: 'Vollzugriff auf alle Funktionen', isSystem: true, maxIndividualBudget: 1000, budgetPeriod: 'monthly', warningThreshold: 90, memberIds: ['admin-1'] },
  { id: 'tutor', name: 'Tutor', description: 'Schülertutor mit erweiterten Rechten', isSystem: false, maxIndividualBudget: 30, budgetPeriod: 'monthly', warningThreshold: 80, memberIds: [] },
];

export const mockBudgets: BudgetConfig[] = [
  { id: 'budget-1', type: 'role', targetId: 'student', targetName: 'Schüler', totalLimit: 500, individualLimit: 10, used: 0, period: 'monthly', warningThreshold: 80 },
  { id: 'budget-2', type: 'role', targetId: 'teacher', targetName: 'Lehrer', totalLimit: 2000, individualLimit: 100, used: 0, period: 'monthly', warningThreshold: 90 },
  { id: 'budget-3', type: 'class', targetId: 'class-a', targetName: '5AHIF', totalLimit: 300, individualLimit: 20, used: 105, period: 'monthly', warningThreshold: 80 },
  { id: 'budget-4', type: 'class', targetId: 'class-b', targetName: '4AHIF', totalLimit: 300, individualLimit: 20, used: 85, period: 'monthly', warningThreshold: 80 },
  { id: 'budget-5', type: 'group', targetId: 'group-1', targetName: '5. Klassen', totalLimit: 400, individualLimit: 20, used: 45, period: 'monthly', warningThreshold: 80 },
];

export const mockCosts: CostEntry[] = [
  { id: 'cost-1', userId: 'student-1', userName: 'Anna Bauer', tutorId: 'tutor-1', tutorName: 'Mathe-Meister', model: 'gpt-4', tokens: 1250, cost: 0.12, timestamp: new Date('2024-03-01T10:00:00') },
  { id: 'cost-2', userId: 'student-1', userName: 'Anna Bauer', tutorId: 'tutor-2', tutorName: 'Deutsch-Detektiv', model: 'gpt-4', tokens: 980, cost: 0.09, timestamp: new Date('2024-03-02T14:00:00') },
  { id: 'cost-3', userId: 'student-2', userName: 'Ben Weber', tutorId: 'tutor-1', tutorName: 'Mathe-Meister', model: 'gpt-4', tokens: 2100, cost: 0.21, timestamp: new Date('2024-03-03T11:00:00') },
  { id: 'cost-4', userId: 'student-4', userName: 'David Koch', tutorId: 'tutor-3', tutorName: 'Physik-Profi', model: 'gpt-3.5-turbo', tokens: 850, cost: 0.04, timestamp: new Date('2024-03-04T09:30:00') },
];

export const mockGlobalSettings: GlobalSettings = {
  systemPrompt: 'Du bist ein KI-Tutor an einer deutschen Schule. Verhalte dich stets respektvoll, geduldig und fördere selbstständiges Lernen.',
  lastModifiedBy: 'Admin Schulz',
  lastModifiedAt: new Date('2024-02-15'),
};

export const mockAIProviders: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    apiKeyConfigured: true,
    isEnabled: true,
    models: [
      { id: 'gpt-4', name: 'GPT-4', providerId: 'openai', description: 'Leistungsstärkstes Modell', costPer1kTokens: 0.03, maxTokens: 8192, isEnabled: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', providerId: 'openai', description: 'Schnellere Version von GPT-4', costPer1kTokens: 0.01, maxTokens: 128000, isEnabled: true },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', providerId: 'openai', description: 'Schnell und kostengünstig', costPer1kTokens: 0.0015, maxTokens: 4096, isEnabled: true },
      { id: 'gpt-5.2', name: 'GPT-5.2', providerId: 'openai', description: 'Neuestes Flaggschiff-Modell', costPer1kTokens: 0.06, maxTokens: 200000, isEnabled: false },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    apiKeyConfigured: true,
    isEnabled: true,
    models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', providerId: 'anthropic', description: 'Höchste Qualität', costPer1kTokens: 0.015, maxTokens: 200000, isEnabled: true },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', providerId: 'anthropic', description: 'Ausgewogenes Preis-Leistungs-Verhältnis', costPer1kTokens: 0.003, maxTokens: 200000, isEnabled: true },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', providerId: 'anthropic', description: 'Schnellstes Modell', costPer1kTokens: 0.00025, maxTokens: 200000, isEnabled: true },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    apiKeyConfigured: false,
    isEnabled: false,
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', providerId: 'google', description: 'Googles Sprachmodell', costPer1kTokens: 0.00025, maxTokens: 32000, isEnabled: false },
    ],
  },
];

export const subjectColors: Record<string, string> = {
  'Mathematik': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  'Deutsch': 'bg-green-500/10 text-green-600 border-green-500/20',
  'Physik': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  'Englisch': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  'Chemie': 'bg-red-500/10 text-red-600 border-red-500/20',
  'Biologie': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'Geschichte': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  'default': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export const didacticModes = [
  { value: 'socratic', label: 'Sokratisch', description: 'Führt durch Fragen zum Verständnis' },
  { value: 'hints', label: 'Hinweise', description: 'Gibt Hinweise statt Lösungen' },
  { value: 'step-by-step', label: 'Schritt für Schritt', description: 'Erklärt detailliert jeden Schritt' },
  { value: 'concise', label: 'Kurz & präzise', description: 'Kompakte, direkte Antworten' },
];

export const subjectOptions = [
  'Mathematik', 'Deutsch', 'Englisch', 'Physik', 'Chemie',
  'Biologie', 'Geschichte', 'Geographie', 'Informatik', 'Kunst', 'Musik', 'Sport',
];

export const tutorIcons = ['📐', '📚', '⚡', '🌍', '🧪', '🧬', '🏛️', '🌎', '💻', '🎨', '🎵', '⚽'];

export const schoolYears = ['2024/25', '2025/26', '2023/24'];

export const getEnabledModels = () => {
  return mockAIProviders
    .filter(p => p.isEnabled && p.apiKeyConfigured)
    .flatMap(p => p.models.filter(m => m.isEnabled));
};

export const modelOptions = mockAIProviders
  .filter(p => p.isEnabled && p.apiKeyConfigured)
  .flatMap(p => p.models.filter(m => m.isEnabled))
  .map(m => ({
    value: m.id,
    label: m.name,
    description: m.description || '',
  }));

export const getTeacherName = (teacherId: string): string => {
  const teacher = mockUsers.find(u => u.id === teacherId);
  return teacher?.name || 'Unbekannt';
};

export const budgetPeriodLabels: Record<string, string> = {
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  monthly: 'Monatlich',
  yearly: 'Jährlich',
};