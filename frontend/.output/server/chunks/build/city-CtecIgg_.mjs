import { f as defineStore, u as useRuntimeConfig } from './server.mjs';

const FALLBACK_CITIES = [
  { code: "MAIN", name: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E" }
];
const useCityStore = defineStore("city", {
  state: () => ({
    city: null,
    cities: FALLBACK_CITIES,
    initialized: false
  }),
  getters: {
    code: (s) => {
      var _a2;
      var _a;
      return (_a2 = (_a = s.city) == null ? void 0 : _a.code) != null ? _a2 : null;
    },
    name: (s) => {
      var _a2;
      var _a;
      return (_a2 = (_a = s.city) == null ? void 0 : _a.name) != null ? _a2 : null;
    }
  },
  actions: {
    async loadCities() {
      const config = useRuntimeConfig();
      const apiBaseUrl = config.apiBaseUrl;
      try {
        const res = await $fetch("/api/catalog/cities", {
          baseURL: apiBaseUrl
        });
        if (Array.isArray(res == null ? void 0 : res.cities) && res.cities.length) {
          this.cities = res.cities;
        }
      } catch {
      }
    },
    async init() {
      if (this.initialized) return;
      {
        this.initialized = true;
        return;
      }
    },
    persist() {
      return;
    },
    async setCity(code) {
      if (!code) {
        this.city = null;
        this.persist();
        return;
      }
      const c = String(code).trim().toUpperCase();
      const next = this.cities.find((x) => x.code === c) || { code: c, name: c };
      this.city = next;
      this.persist();
    }
  }
});

export { useCityStore as u };
//# sourceMappingURL=city-CtecIgg_.mjs.map
