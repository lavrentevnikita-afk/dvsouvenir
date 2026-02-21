import { f as defineStore, u as useRuntimeConfig } from './server.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';

const useFavoritesStore = defineStore("favorites", {
  state: () => ({
    productIds: /* @__PURE__ */ new Set(),
    loading: false,
    initialized: false
  }),
  getters: {
    total(state) {
      return state.productIds.size;
    },
    ids(state) {
      return Array.from(state.productIds);
    },
    isFavorite: (state) => {
      return (id) => state.productIds.has(Number(id));
    }
  },
  actions: {
    async initFromStorage() {
    },
    async fetchFromAPI() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.productIds.clear();
        this.initialized = true;
        return;
      }
      this.loading = true;
      try {
        const config = useRuntimeConfig();
        const response = await $fetch("/api/wishlist", {
          baseURL: config.public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          }
        });
        const items = response.items || [];
        this.productIds = new Set(items.map((item) => item.productId));
        this.initialized = true;
      } catch (error) {
        console.error("Failed to fetch favorites:", error);
        this.productIds.clear();
      } finally {
        this.loading = false;
      }
    },
    async toggle(productId) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        return false;
      }
      const isCurrentlyFavorite = this.productIds.has(productId);
      try {
        const config = useRuntimeConfig();
        if (isCurrentlyFavorite) {
          await $fetch(`/api/wishlist/${productId}`, {
            method: "DELETE",
            baseURL: config.public.apiBaseUrl,
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            }
          });
          this.productIds.delete(productId);
          return false;
        } else {
          await $fetch("/api/wishlist", {
            method: "POST",
            baseURL: config.public.apiBaseUrl,
            headers: {
              Authorization: `Bearer ${authStore.accessToken}`
            },
            body: { productId }
          });
          this.productIds.add(productId);
          return true;
        }
      } catch (error) {
        console.error("Failed to toggle favorite:", error);
        throw error;
      }
    },
    async addItem(productId) {
      if (this.productIds.has(productId)) {
        return;
      }
      await this.toggle(productId);
    },
    async removeItem(productId) {
      if (!this.productIds.has(productId)) {
        return;
      }
      await this.toggle(productId);
    },
    async checkMultiple(productIds) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        return {};
      }
      try {
        const config = useRuntimeConfig();
        const response = await $fetch("/api/wishlist/check-multiple", {
          method: "POST",
          baseURL: config.public.apiBaseUrl,
          headers: {
            Authorization: `Bearer ${authStore.accessToken}`
          },
          body: { productIds }
        });
        const wishlist = response.wishlist || {};
        for (const [id, inWishlist] of Object.entries(wishlist)) {
          const numId = Number(id);
          if (inWishlist) {
            this.productIds.add(numId);
          } else {
            this.productIds.delete(numId);
          }
        }
        return wishlist;
      } catch (error) {
        console.error("Failed to check multiple favorites:", error);
        return {};
      }
    },
    clear() {
      this.productIds.clear();
      this.initialized = false;
    }
  }
});

export { useFavoritesStore as u };
//# sourceMappingURL=favorites-CzyYdspe.mjs.map
