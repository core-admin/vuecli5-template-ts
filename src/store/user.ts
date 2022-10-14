import { defineStore } from 'pinia';
import { UserInfo, RoleInfo } from '#/store';
import { pinia } from '@/internal/pinia';

interface UserState {
  userInfo: Nullable<UserInfo>;
  token?: string;
  roleList: RoleInfo[];
}

export const useUserStore = defineStore({
  id: 'app-user',
  persist: {
    strategies: [
      {
        // paths: ['userInfo', 'token', 'roleList'],
        paths: [],
      },
    ],
  },
  state: (): UserState => ({
    userInfo: null,
    token: undefined,
    roleList: [],
  }),
  getters: {
    getUserInfo(): UserInfo {
      return this.userInfo || ({} as UserInfo);
    },
    getToken(): string {
      return this.token as string;
    },
    getRoleList(): RoleInfo[] {
      return this.roleList.length > 0 ? this.roleList : [];
    },
  },
  actions: {
    setToken(info: string | undefined) {
      this.token = info ?? '';
    },
    setRoleList(roleList: RoleInfo[]) {
      this.roleList = roleList;
    },
    setUserInfo(info: UserInfo | null) {
      this.userInfo = info;
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
    },
    logout() {
      this.setToken(undefined);
      this.setUserInfo(null);
    },
  },
});

export function useUserStoreWithOut() {
  return useUserStore(pinia);
}
