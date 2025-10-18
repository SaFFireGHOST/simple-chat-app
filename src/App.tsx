import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ChatInterface } from './components/ChatInterface';

function AppContent() {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const handleLoginSuccess = () => {
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    setShowChat(true);
  };

  if (!user) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (showWelcome && !showChat) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  if (showChat) {
    return <ChatInterface />;
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
