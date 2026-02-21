import { toRef, isRef } from 'vue';
import { d as useNuxtApp } from './server.mjs';

const useStateKeyPrefix = "$s";
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = useStateKeyPrefix + _key;
  const nuxtApp = useNuxtApp();
  const state = toRef(nuxtApp.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (isRef(initialValue)) {
      nuxtApp.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
function useToast() {
  const toasts = useState("toasts", () => []);
  function remove(id) {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }
  function push(input) {
    const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const toast = {
      id,
      timeoutMs: 2800,
      ...input
    };
    toasts.value = [...toasts.value, toast];
    return id;
  }
  function success(message, title) {
    return push({ type: "success", message, title });
  }
  function error(message, title) {
    return push({ type: "error", message, title });
  }
  function info(message, title) {
    return push({ type: "info", message, title });
  }
  return { toasts, remove, push, success, error, info };
}

export { useToast as u };
//# sourceMappingURL=useToast-BeE5NKHL.mjs.map
