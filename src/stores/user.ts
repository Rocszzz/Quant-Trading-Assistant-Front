import { defineStore } from 'pinia';

import type { LoginUser } from '@/types/auth';

interface UserState {
  token: string;
  userId?: number;
  username: string;
  nickname: string;
  roleName: string;
}

const TOKEN_KEY = 'quant_assistant_token';
const USER_ID_KEY = 'quant_assistant_user_id';
const USERNAME_KEY = 'quant_assistant_username';
const NICKNAME_KEY = 'quant_assistant_nickname';
const ROLE_KEY = 'quant_assistant_role';
const DEFAULT_ROLE_NAME = '量化研究员';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    userId: Number(localStorage.getItem(USER_ID_KEY)) || undefined,
    username: localStorage.getItem(USERNAME_KEY) || '',
    nickname: localStorage.getItem(NICKNAME_KEY) || '',
    roleName: localStorage.getItem(ROLE_KEY) || DEFAULT_ROLE_NAME
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    displayName: (state) => state.nickname || state.username || 'Guest'
  },
  actions: {
    setLoginSession(token: string, user: LoginUser) {
      this.token = token;
      this.userId = user.id;
      this.username = user.username;
      this.nickname = user.nickname;
      this.roleName = DEFAULT_ROLE_NAME;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_ID_KEY, String(user.id));
      localStorage.setItem(USERNAME_KEY, user.username);
      localStorage.setItem(NICKNAME_KEY, user.nickname);
      localStorage.setItem(ROLE_KEY, this.roleName);
    },
    logout() {
      this.username = '';
      this.nickname = '';
      this.token = '';
      this.userId = undefined;
      this.roleName = '';
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_ID_KEY);
      localStorage.removeItem(USERNAME_KEY);
      localStorage.removeItem(NICKNAME_KEY);
      localStorage.removeItem(ROLE_KEY);
    }
  }
});
