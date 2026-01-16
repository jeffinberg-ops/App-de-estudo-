import React, { useState } from 'react';
import Login from './Login';
import Signup from './Signup';

interface AuthWrapperProps {
  onAuthSuccess: () => void;
  theme: 'dark' | 'light';
}

type AuthView = 'login' | 'signup';

const AuthWrapper: React.FC<AuthWrapperProps> = ({ onAuthSuccess, theme }) => {
  const [view, setView] = useState<AuthView>('login');

  return (
    <>
      {view === 'login' ? (
        <Login
          onSwitchToSignup={() => setView('signup')}
          onSuccess={onAuthSuccess}
          theme={theme}
        />
      ) : (
        <Signup
          onSwitchToLogin={() => setView('login')}
          onSuccess={onAuthSuccess}
          theme={theme}
        />
      )}
    </>
  );
};

export default AuthWrapper;
