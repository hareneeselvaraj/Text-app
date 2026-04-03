import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import MobileShell from "@/components/MobileShell";
import { useFirebaseNotifications } from "@/hooks/useFirebaseNotifications";
import InstallPrompt from "@/components/InstallPrompt";
import OfflineIndicator from "@/components/OfflineIndicator";
import LoadingScreen from "@/components/LoadingScreen";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import LoveFeed from "./pages/LoveFeed";
import LoveChat from "./pages/LoveChat";
import Memories from "./pages/Memories";
import Notes from "./pages/Notes";
import Gifts from "./pages/Gifts";
import Settings from "./pages/Settings";
import MoodSelector from "./pages/MoodSelector";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isLoading } = useApp();
  
  // Initialize and request Firebase Notifications
  useFirebaseNotifications();

  if (isLoading) return <LoadingScreen />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<LoveFeed />} />
        <Route path="/chat" element={<LoveChat />} />
        <Route path="/memories" element={<Memories />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/gifts" element={<Gifts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/mood" element={<MoodSelector />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <InstallPrompt />
      <OfflineIndicator />
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <BrowserRouter>
              <MobileShell>
                <AppRoutes />
              </MobileShell>
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
