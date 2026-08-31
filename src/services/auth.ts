import { store } from './store';

export const SUPERADMIN_CREDENTIALS = {
  USERNAME: 'ffbonles@gmail.com',
  PASSWORD: 'ffbonles1607',
  ROLE: 'Super Administrator',
  NAME: 'Super Administrator Bonles',
};

const AUTH_STORAGE_KEY = 'bonles_superadmin_session_v1';

export interface AdminSession {
  email: string;
  role: string;
  name: string;
  loggedInAt: string;
  token: string;
}

class AuthService {
  private currentSession: AdminSession | null = null;

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const data = sessionStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        this.currentSession = JSON.parse(data) as AdminSession;
      }
    } catch {
      this.currentSession = null;
    }
  }

  isAuthenticated(): boolean {
    if (!this.currentSession) {
      this.restoreSession();
    }
    return !!this.currentSession && this.currentSession.email.toLowerCase() === SUPERADMIN_CREDENTIALS.USERNAME.toLowerCase();
  }

  getSession(): AdminSession | null {
    if (!this.currentSession) {
      this.restoreSession();
    }
    return this.currentSession;
  }

  login(usernameOrEmail: string, password: string, rememberMe = true): { success: boolean; message: string } {
    const cleanUsername = (usernameOrEmail || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    const expectedUsername = SUPERADMIN_CREDENTIALS.USERNAME.toLowerCase();
    const expectedPassword = SUPERADMIN_CREDENTIALS.PASSWORD;

    if (cleanUsername === expectedUsername && cleanPassword === expectedPassword) {
      const session: AdminSession = {
        email: SUPERADMIN_CREDENTIALS.USERNAME,
        role: SUPERADMIN_CREDENTIALS.ROLE,
        name: SUPERADMIN_CREDENTIALS.NAME,
        loggedInAt: new Date().toISOString(),
        token: `bnls_adm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      };

      this.currentSession = session;
      const sessionJson = JSON.stringify(session);
      
      sessionStorage.setItem(AUTH_STORAGE_KEY, sessionJson);
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, sessionJson);
      }

      // Log successful login audit trail
      store.addLog(
        'AUDIT',
        'SUPERADMIN_LOGIN',
        SUPERADMIN_CREDENTIALS.USERNAME,
        session.token,
        'Autentikasi Super Administrator berhasil. Hak akses penuh diberikan.',
        'SUCCESS'
      );

      return {
        success: true,
        message: 'Login Super Administrator berhasil. Mengalihkan ke panel administrasi...',
      };
    }

    // Log failed login attempt
    store.addLog(
      'AUDIT',
      'SUPERADMIN_LOGIN_FAILED',
      cleanUsername || 'UNKNOWN',
      'N/A',
      `Percobaan login Super Administrator ditolak: kredensial tidak cocok untuk user '${usernameOrEmail}'`,
      'FAILED'
    );

    return {
      success: false,
      message: 'Username / Email atau Password Super Administrator tidak valid. Akses ditolak.',
    };
  }

  logout(): void {
    const user = this.currentSession?.email || SUPERADMIN_CREDENTIALS.USERNAME;
    this.currentSession = null;
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_STORAGE_KEY);

    store.addLog(
      'AUDIT',
      'SUPERADMIN_LOGOUT',
      user,
      'N/A',
      'Sesi Super Administrator diakhiri secara manual oleh pengguna.',
      'SUCCESS'
    );
  }
}

export const authService = new AuthService();
