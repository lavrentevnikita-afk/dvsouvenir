import { f as defineStore } from './server.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';

const STORAGE_PREFIX = "cart";
function storageKey(userId) {
  return userId ? `${STORAGE_PREFIX}:user:${userId}` : `${STORAGE_PREFIX}:guest`;
}
function loadFromStorage(key) {
  return [];
}
function saveToStorage(key, items) {
  return;
}
const useCartStore = defineStore("cart", {
  state: () => ({
    items: [],
    _storageKey: null
  }),
  getters: {
    totalItems(state) {
      return state.items.reduce((acc, item) => acc + item.quantity, 0);
    },
    totalPrice(state) {
      return state.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    },
    isEmpty() {
      return this.totalItems === 0;
    }
  },
  actions: {
    _ensureKey() {
      var _a2;
      var _a;
      if (this._storageKey) return;
      const auth = useAuthStore();
      this._storageKey = storageKey((_a2 = (_a = auth.user) == null ? void 0 : _a.id) != null ? _a2 : null);
    },
    initFromStorage() {
      this._ensureKey();
      this.items = loadFromStorage(this._storageKey);
    },
    /**
     * Вызывается при смене пользователя (через клиентский плагин).
     * Делает перенос guest -> user при первом логине, если у пользователя ещё пусто.
     */
    handleAuthChange(userId, prevUserId) {
      if ((!prevUserId || prevUserId === null) && userId) {
        const guestKey = storageKey(null);
        const guestItems = loadFromStorage();
        const userItems = loadFromStorage();
        if (userItems.length === 0 && guestItems.length > 0) {
          try {
            (void 0).localStorage.removeItem(guestKey);
          } catch {
          }
        }
      }
      const nextKey = storageKey(userId != null ? userId : null);
      this._storageKey = nextKey;
      this.items = loadFromStorage();
    },
    _persist() {
      this._ensureKey();
      saveToStorage(this._storageKey, this.items);
    },
    addItem(product, quantity = 1) {
      this._ensureKey();
      const existing = this.items.find((i) => i.product.id === product.id);
      if (existing) {
        existing.quantity += quantity;
        if (existing.product.wholesalePrice == null && product.wholesalePrice != null) {
          existing.product.wholesalePrice = Number(product.wholesalePrice);
        }
      } else {
        this.items.push({ product, quantity });
      }
      this._persist();
    },
    removeItem(productId) {
      this._ensureKey();
      this.items = this.items.filter((item) => item.product.id !== productId);
      this._persist();
    },
    setQuantity(productId, quantity) {
      this._ensureKey();
      const item = this.items.find((i) => i.product.id === productId);
      if (!item) return;
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this._persist();
      }
    },
    clear() {
      this._ensureKey();
      this.items = [];
      this._persist();
    }
  }
});

export { useCartStore as u };
//# sourceMappingURL=cart-DZFIURht.mjs.map
