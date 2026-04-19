import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { LanguageProvider } from '@/lib/i18n.jsx';
import { AppProvider } from '@/lib/AppContext.jsx';
import Splash from '@/pages/Splash';
import LanguageSelect from '@/pages/LanguageSelect';

import Home from '@/pages/Home';
import Navigate from '@/pages/Navigate';
import SOS from '@/pages/SOS';
import Report from '@/pages/Report';
import Settings from '@/pages/Settings';
import Analytics from '@/pages/Analytics';
import AppLayout from '@/components/layout/AppLayout';
const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/splash" element={<Splash />} />
      <Route path="/language" element={<LanguageSelect />} />

      <Route path="/sos" element={<SOS />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/navigate" element={<Navigate />} />
        <Route path="/report" element={<Report />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <LanguageProvider>
        <AppProvider>
          <QueryClientProvider client={queryClientInstance}>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </QueryClientProvider>
        </AppProvider>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App