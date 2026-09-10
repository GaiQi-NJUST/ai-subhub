import type { UserProfile } from '../types';

const STORAGE_KEY_CURRENT_USER = 'ai_subhub_auth_current_user';
const STORAGE_KEY_USERS_DB = 'ai_subhub_users_db';
const BACKEND_URL = 'http://localhost:3001';

interface StoredUserAccount extends UserProfile {
  passwordHash: string;
}

function simpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return 'SH_' + Math.abs(hash).toString(36) + '_' + text.length;
}

function getLocalUsersDB(): StoredUserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS_DB);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsersDB(users: StoredUserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users db to localStorage:', err);
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }
}

export async function registerUser(
  account: string,
  password: string,
  nickname?: string
): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanAccount = account.trim();
  const cleanPassword = password.trim();
  const isEmail = cleanAccount.includes('@');
  const accountType: 'phone' | 'email' = isEmail ? 'email' : 'phone';

  if (!cleanAccount) {
    return { success: false, message: '请输入手机号或邮箱' };
  }
  if (accountType === 'phone' && !/^1[3-9]\d{9}$/.test(cleanAccount)) {
    return { success: false, message: '请输入合规的 11 位大陆手机号码' };
  }
  if (accountType === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanAccount)) {
    return { success: false, message: '请输入合规的电子邮箱地址' };
  }
  if (cleanPassword.length < 6) {
    return { success: false, message: '密码长度至少需要 6 位字符' };
  }

  // 1. 尝试向 Node.js 后端同步
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`${BACKEND_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        account: cleanAccount,
        password: cleanPassword,
        nickname: nickname?.trim(),
        accountType
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        syncToLocalDB(data.user, cleanPassword);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || '注册失败' };
      }
    }
  } catch {
    // 后端离线或静态部署环境
  }

  // 2. 本地降级逻辑
  const db = getLocalUsersDB();
  const exists = db.find(u => u.account.toLowerCase() === cleanAccount.toLowerCase());
  if (exists) {
    return { success: false, message: '该账号已被注册，请直接登录' };
  }

  const newUser: UserProfile = {
    id: 'USR-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    account: cleanAccount,
    accountType,
    nickname: nickname?.trim() || generateDefaultNickname(cleanAccount, accountType),
    createdAt: new Date().toISOString()
  };

  const storedAccount: StoredUserAccount = {
    ...newUser,
    passwordHash: simpleHash(cleanPassword)
  };

  db.push(storedAccount);
  saveLocalUsersDB(db);
  setCurrentUser(newUser);

  return { success: true, user: newUser };
}

export async function loginUser(
  account: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const cleanAccount = account.trim();
  const cleanPassword = password.trim();

  if (!cleanAccount || !cleanPassword) {
    return { success: false, message: '请输入账号和密码' };
  }

  // 1. 尝试向 Node.js 后端同步
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    const res = await fetch(`${BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ account: cleanAccount, password: cleanPassword }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
        syncToLocalDB(data.user, cleanPassword);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || '账号或密码错误' };
      }
    }
  } catch {
    // 降级本地
  }

  // 2. 本地降级校验
  const db = getLocalUsersDB();
  const found = db.find(u => u.account.toLowerCase() === cleanAccount.toLowerCase());
  if (!found) {
    return { success: false, message: '账号尚未注册，请先点击上方“注册”' };
  }

  if (found.passwordHash !== simpleHash(cleanPassword)) {
    return { success: false, message: '密码输入不正确，请重新检查' };
  }

  const { passwordHash: _, ...safeUser } = found;
  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

export function logoutUser(): void {
  setCurrentUser(null);
}

export function updateUserPreferences(prefs: {
  savedContact?: string;
  savedRemoteTool?: 'sunlogin' | 'todesk';
  savedOsType?: 'windows' | 'macos';
}): UserProfile | null {
  const current = getCurrentUser();
  if (!current) return null;

  const updated: UserProfile = {
    ...current,
    ...prefs
  };

  setCurrentUser(updated);

  const db = getLocalUsersDB();
  const idx = db.findIndex(u => u.id === updated.id);
  if (idx >= 0) {
    db[idx] = { ...db[idx], ...prefs };
    saveLocalUsersDB(db);
  }

  try {
    fetch(`${BACKEND_URL}/api/users/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: updated.id, ...prefs })
    }).catch(() => {});
  } catch {
    // ignore
  }

  return updated;
}

function syncToLocalDB(user: UserProfile, rawPassword?: string) {
  const db = getLocalUsersDB();
  const idx = db.findIndex(u => u.id === user.id || u.account.toLowerCase() === user.account.toLowerCase());
  const stored: StoredUserAccount = {
    ...user,
    passwordHash: rawPassword ? simpleHash(rawPassword) : (db[idx]?.passwordHash || 'SYNCED')
  };
  if (idx >= 0) {
    db[idx] = stored;
  } else {
    db.push(stored);
  }
  saveLocalUsersDB(db);
}

function generateDefaultNickname(account: string, type: 'phone' | 'email'): string {
  if (type === 'phone') {
    return account.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
  const prefix = account.split('@')[0];
  return prefix.length > 8 ? prefix.slice(0, 8) + '...' : prefix;
}

export function formatUserDisplayName(user: UserProfile | null): string {
  if (!user) return '未登录';
  if (user.nickname) return user.nickname;
  return generateDefaultNickname(user.account, user.accountType);
}
