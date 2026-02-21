import { l as defineNuxtRouteMiddleware, n as navigateTo, m as executeAsync } from './server.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import 'vue';
import '../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import 'vue/server-renderer';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const b2b = defineNuxtRouteMiddleware(async () => {
  var _a, _b, _c;
  let __temp, __restore;
  const auth = useAuthStore();
  auth.initFromStorage();
  if (!auth.isAuthenticated) {
    return navigateTo("/login");
  }
  try {
    ;
    [__temp, __restore] = executeAsync(() => auth.fetchMe()), await __temp, __restore();
    ;
  } catch {
    auth.logout();
    return navigateTo("/login");
  }
  if (((_a = auth.user) == null ? void 0 : _a.role) === "admin" || ((_b = auth.user) == null ? void 0 : _b.role) === "manager") {
    return navigateTo("/admin");
  }
  if (((_c = auth.user) == null ? void 0 : _c.role) !== "store") {
    return navigateTo("/");
  }
});

export { b2b as default };
//# sourceMappingURL=b2b-Cz_0tZNI.mjs.map
