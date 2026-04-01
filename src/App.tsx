import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AppProvider } from "@/contexts/AppContext";
import MobileShell from "@/components/MobileShell";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import LoveFeed from "./pages/LoveFeed";
import LoveChat from "./pages/LoveChat";
import Memories from "./pages/Memories";
import Notes from "./pages/Notes";
import Gifts from "./pages/Gifts";
import Settings from "./pages/Settings";
import MoodSelector from "./pages/MoodSelector";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AppProvider>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <MobileShell>
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
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MobileShell>
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
