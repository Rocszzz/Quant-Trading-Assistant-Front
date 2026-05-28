import { defineStore } from 'pinia';

interface UserState {
  token: string;
  username: string;
  roleName: string;
}

const TOKEN_KEY = 'quant_assistant_token';

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem(TOKEN_KEY) || '',
    username: localStorage.getItem('quant_assistant_username') || '',
    roleName: localStorage.getItem('quant_assistant_role') || '量化研究员'
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token)
  },
  actions: {
    login(username: string, token: string) {
      this.username = username;
      this.token = token;
      this.roleName = '量化研究员';
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('quant_assistant_username', username);
      localStorage.setItem('quant_assistant_role', this.roleName);
    },
    logout() {
      this.username = '';
      this.token = '';
      this.roleName = '';
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('quant_assistant_username');
      localStorage.removeItem('quant_assistant_role');
    }
  }
});
