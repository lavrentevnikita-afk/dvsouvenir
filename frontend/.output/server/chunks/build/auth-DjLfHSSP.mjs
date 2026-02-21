import { f as defineStore, u as useRuntimeConfig } from './server.mjs';

const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: null,
    initialized: false,
    storeContext: null
  }),
  getters: {
    isAuthenticated: (state) => !!state.user && !!state.accessToken
  },
  actions: {
    initFromStorage() {
      if (this.initialized) return;
      this.initialized = true;
    },
    persist() {
      return;
    },
    setSession(payload) {
      this.user = payload.user;
      this.accessToken = payload.accessToken;
      this.persist();
    },
    clearSession() {
      this.user = null;
      this.accessToken = null;
      this.persist();
    },
    async login(email, password) {
      const config = useRuntimeConfig();
      const apiBaseUrl = config.apiBaseUrl;
      const { accessToken, user } = await $fetch("/api/auth/login", {
        method: "POST",
        baseURL: apiBaseUrl,
        body: { email, password }
      });
      this.setSession({ accessToken, user });
    },
    async register(name, email, password) {
      const config = useRuntimeConfig();
      const apiBaseUrl = config.apiBaseUrl;
      const { accessToken, user } = await $fetch("/api/auth/register", {
        method: "POST",
        baseURL: apiBaseUrl,
        body: { name, email, password }
      });
      this.setSession({ accessToken, user });
    },
    async fetchMe() {
      var _a;
      if (!this.accessToken) return;
      const config = useRuntimeConfig();
      const apiBaseUrl = config.apiBaseUrl;
      const { user } = await $fetch("/api/auth/me", {
        baseURL: apiBaseUrl,
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      this.user = user;
      if (((_a = this.user) == null ? void 0 : _a.role) === "store") {
        try {
          await this.fetchStoreContext();
        } catch {
        }
      } else {
        this.storeContext = null;
      }
      this.persist();
    },
    async fetchStoreContext() {
      var _a2;
      var _a, _b, _c;
      if (!this.accessToken) return;
      const config = useRuntimeConfig();
      const apiBaseUrl = config.apiBaseUrl;
      const data = await $fetch("/api/b2b/me", {
        baseURL: apiBaseUrl,
        headers: {
          Authorization: `Bearer ${this.accessToken}`
        }
      });
      const discountPercent = Number((_a2 = (_a = data == null ? void 0 : data.storeProfile) == null ? void 0 : _a.discountPercent) != null ? _a2 : 0);
      const status = ((_b = data == null ? void 0 : data.storeProfile) == null ? void 0 : _b.status) || "lead";
      const moderationNote = ((_c = data == null ? void 0 : data.storeProfile) == null ? void 0 : _c.moderationNote) || null;
      this.storeContext = { discountPercent, status, moderationNote };
    },
    logout() {
      this.clearSession();
    }
  }
});

export { useAuthStore as u };
//# sourceMappingURL=auth-DjLfHSSP.mjs.map
