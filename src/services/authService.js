import { bootstrapAPI, db, instituteAPI } from '../db';

const ACCOUNTS_KEY = 'ta_accounts_v2';
const SESSION_KEY = 'ta_session_v2';

const DEMO_ACCOUNT = {
  id: 'demo-user',
  name: 'Demo Admin',
  email: 'demo@tuitionpro.app',
  password: 'demo123',
  instituteId: 1,
  role: 'admin',
};

const readJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ensureAccounts = async () => {
  const demoInstitute = await bootstrapAPI.ensureDemoInstitute();
  const existing = readJson(ACCOUNTS_KEY, []);
  const hasDemo = existing.some((acc) => acc.email === DEMO_ACCOUNT.email);

  if (!hasDemo) {
    writeJson(ACCOUNTS_KEY, [
      ...existing,
      {
        ...DEMO_ACCOUNT,
        instituteId: demoInstitute.id,
      },
    ]);
  }

  return readJson(ACCOUNTS_KEY, []);
};

const toSession = async (account) => {
  const institute = await instituteAPI.getInstituteById(account.instituteId);
  return {
    userId: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    instituteId: account.instituteId,
    instituteName: institute?.name || 'Institute',
  };
};

export const authService = {
  async bootstrap() {
    await ensureAccounts();
  },

  async login({ email, password }) {
    const accounts = await ensureAccounts();
    const account = accounts.find(
      (item) => item.email.toLowerCase() === String(email).toLowerCase() && item.password === password
    );

    if (!account) {
      throw new Error('Invalid email or password.');
    }

    const session = await toSession(account);
    writeJson(SESSION_KEY, session);
    return session;
  },

  async signup({ name, email, password, instituteName }) {
    const accounts = await ensureAccounts();
    const already = accounts.some((item) => item.email.toLowerCase() === String(email).toLowerCase());
    if (already) {
      throw new Error('An account with this email already exists.');
    }

    const instituteId = await instituteAPI.createInstitute({ name: instituteName });
    await db.users.add({
      email,
      instituteId,
      role: 'admin',
      createdAt: new Date(),
    });

    const account = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      instituteId,
      role: 'admin',
    };

    writeJson(ACCOUNTS_KEY, [...accounts, account]);

    const session = await toSession(account);
    writeJson(SESSION_KEY, session);
    return session;
  },

  getSession() {
    return readJson(SESSION_KEY, null);
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
  },

  getDemoCredentials() {
    return {
      email: DEMO_ACCOUNT.email,
      password: DEMO_ACCOUNT.password,
    };
  },
};
