import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';

function AppContent() {
  const { user, loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);

  const handleLoginSuccess = () => {
    // This is called after a fresh login, so we trigger the welcome screen.
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    // After the welcome screen is done, we hide it to reveal the chat.
    setShowWelcome(false);
  };

  // While checking for a stored user, don't render anything.
  if (loading) {
    return null; // Or you could return a loading spinner component here
  }

  // If a user exists...
  if (user) {
    // ...and we need to show the welcome screen (because of a fresh login)...
    if (showWelcome) {
      return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }
    // ...otherwise, show the chat interface (for a restored session).
    return <ChatInterface />;
  }

  // If there's no user, show the login page.
  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;