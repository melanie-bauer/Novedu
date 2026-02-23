import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

// Pages
import LoginPage from "@/pages/LoginPage";
import ChatPage from "@/pages/ChatPage";
import StudentHomePage from "@/pages/StudentHomePage";
import StudentTutorDetailPage from "@/pages/StudentTutorDetailPage";
import TutorOverviewPage from "@/pages/TutorOverviewPage";
import TutorEditorPage from "@/pages/TutorEditorPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UserManagementPage from "@/pages/admin/UserManagementPage";
// BudgetManagementPage removed - budgets managed in Klassen & Rollen
import CostOverviewPage from "@/pages/admin/CostOverviewPage";
import GlobalPromptPage from "@/pages/admin/GlobalPromptPage";
import ProviderManagementPage from "@/pages/admin/ProviderManagementPage";
import GroupManagementPage from "@/pages/admin/GroupManagementPage";

// Layout
import AppLayout from "@/components/layout/AppLayout";

const queryClient = new QueryClient();

// Role-based redirect component
const RoleBasedRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/app/admin" replace />;
    case 'teacher':
      return <Navigate to="/app/tutors" replace />;
    case 'student':
      return <Navigate to="/app/home" replace />;
    default:
      return <Navigate to="/app/chat" replace />;
  }
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<RoleBasedRedirect />} />
                  <Route path="home" element={<StudentHomePage />} />
                  <Route path="tutor/:id" element={<StudentTutorDetailPage />} />
                  <Route path="chat" element={<ChatPage />} />
                  <Route path="tutors" element={<TutorOverviewPage />} />
                  <Route path="tutors/:id/edit" element={<TutorEditorPage />} />
                  <Route path="tutors/new" element={<TutorEditorPage />} />
                  <Route path="admin" element={<AdminDashboard />} />
                  <Route path="admin/users" element={<UserManagementPage />} />
                  {/* Budgets page removed - managed in Klassen & Rollen */}
                  <Route path="admin/costs" element={<CostOverviewPage />} />
                  <Route path="admin/policy" element={<GlobalPromptPage />} />
                  <Route path="admin/providers" element={<ProviderManagementPage />} />
                  <Route path="admin/groups" element={<GroupManagementPage />} />
                </Route>
                <Route path="/" element={<Navigate to="/app" replace />} />
                <Route path="*" element={<Navigate to="/app" replace />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
