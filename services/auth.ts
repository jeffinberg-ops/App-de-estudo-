import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';
import { auth } from './firebase';

export interface AuthError {
  code: string;
  message: string;
}

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase não está configurado. Configure as credenciais no arquivo .env.local');
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  if (!auth) {
    throw new Error('Firebase não está configurado. Configure as credenciais no arquivo .env.local');
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const logOut = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Firebase não está configurado');
  }
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = (): User | null => {
  return auth?.currentUser || null;
};

export const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Email inválido';
    case 'auth/user-disabled':
      return 'Usuário desabilitado';
    case 'auth/user-not-found':
      return 'Usuário não encontrado';
    case 'auth/wrong-password':
      return 'Senha incorreta';
    case 'auth/email-already-in-use':
      return 'Email já está em uso';
    case 'auth/weak-password':
      return 'Senha muito fraca (mínimo 6 caracteres)';
    case 'auth/network-request-failed':
      return 'Erro de rede. Verifique sua conexão';
    default:
      return error.message || 'Erro desconhecido';
  }
};
