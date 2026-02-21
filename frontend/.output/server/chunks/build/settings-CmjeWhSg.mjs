import { defineComponent, ref, watch, mergeProps, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
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
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const tab = ref("users");
    const loading = ref(false);
    const error = ref(null);
    const users = ref([]);
    const reasons = ref([]);
    const logs = ref([]);
    ref(null);
    async function loadUsers() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/settings/users", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        users.value = Array.isArray(res == null ? void 0 : res.users) ? res.users : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439";
      } finally {
        loading.value = false;
      }
    }
    async function loadReasons() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/settings/dicts/issue-reasons", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        reasons.value = Array.isArray(res == null ? void 0 : res.reasons) ? res.reasons : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A";
      } finally {
        loading.value = false;
      }
    }
    async function loadLogs() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/settings/audit", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: { limit: 200 }
        });
        logs.value = Array.isArray(res == null ? void 0 : res.logs) ? res.logs : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043B\u043E\u0433\u0438";
      } finally {
        loading.value = false;
      }
    }
    watch(tab, async () => {
      if (tab.value === "users") return loadUsers();
      if (tab.value === "dicts") return loadReasons();
      if (tab.value === "logs") return loadLogs();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</h1><p class="text-sm text-gray-600 mt-1">\u041C\u0438\u043D\u0438\u043C\u0443\u043C, \u043D\u043E \u043F\u043E\u043B\u0435\u0437\u043D\u043E: \u0440\u043E\u043B\u0438, \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438, \u043B\u043E\u0433\u0438</p></div><div class="flex items-center gap-2"><button class="${ssrRenderClass([unref(tab) === "users" ? "bg-gray-100" : "", "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"])}"> \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438 \u0438 \u0440\u043E\u043B\u0438 </button><button class="${ssrRenderClass([unref(tab) === "dicts" ? "bg-gray-100" : "", "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"])}"> \u0421\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438 </button><button class="${ssrRenderClass([unref(tab) === "logs" ? "bg-gray-100" : "", "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"])}"> \u041B\u043E\u0433\u0438 </button><button class="${ssrRenderClass([unref(tab) === "integrations" ? "bg-gray-100" : "", "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"])}"> \u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438 </button></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "users") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">ID</th><th class="text-left px-4 py-3">\u0418\u043C\u044F</th><th class="text-left px-4 py-3">Email</th><th class="text-left px-4 py-3">\u0420\u043E\u043B\u044C</th><th class="text-right px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(users), (u) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3">${ssrInterpolate(u.id)}</td><td class="px-4 py-3">${ssrInterpolate(u.name)}</td><td class="px-4 py-3">${ssrInterpolate(u.email)}</td><td class="px-4 py-3"><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"${ssrRenderAttr("value", u.role)}><option value="admin">admin</option><option value="manager">manager</option><option value="warehouse">warehouse</option><option value="production">production</option><option value="store">store</option><option value="customer">customer</option></select></td><td class="px-4 py-3 text-right text-xs text-gray-500">\u2014</td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(users).length === 0) {
          _push(`<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "dicts") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3"><div class="flex items-center justify-between gap-2"><div><div class="text-sm font-medium">\u041F\u0440\u0438\u0447\u0438\u043D\u044B \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0439</div><div class="text-xs text-gray-500">\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0432 \u201C-\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435\u201D \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435</div></div><div class="flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">+ \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C</button><button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</button></div></div><div class="rounded-xl border border-gray-200 overflow-hidden"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">code</th><th class="text-left px-4 py-3">label</th><th class="text-right px-4 py-3">\u2014</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(reasons), (r, i) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3"><input${ssrRenderAttr("value", r.code)} class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></td><td class="px-4 py-3"><input${ssrRenderAttr("value", r.label)} class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></td><td class="px-4 py-3 text-right"><button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(reasons).length === 0) {
          _push(`<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "logs") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u0414\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F</th><th class="text-left px-4 py-3">Action</th><th class="text-left px-4 py-3">Entity</th><th class="text-left px-4 py-3">UserId</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(logs), (l) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3 text-xs text-gray-600">${ssrInterpolate(new Date(l.createdAt).toLocaleString())}</td><td class="px-4 py-3">${ssrInterpolate(l.action)}</td><td class="px-4 py-3 text-xs text-gray-600">${ssrInterpolate(l.entity || "\u2014")}</td><td class="px-4 py-3 text-xs text-gray-600">${ssrInterpolate(l.userId || "\u2014")}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(logs).length === 0) {
          _push(`<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "integrations") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-2"><div class="text-sm font-medium">\u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438</div><div class="text-sm text-gray-600">\u041F\u043E\u043A\u0430 \u0437\u0430\u0433\u043B\u0443\u0448\u043A\u0430: \u0441\u044E\u0434\u0430 \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441\u044B \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0439 (CRM/\u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430/\u043E\u043F\u043B\u0430\u0442\u0430).</div><div class="text-xs text-gray-500">\u0415\u0441\u043B\u0438 \u043D\u0443\u0436\u043D\u043E \u2014 \u044F \u0441\u0434\u0435\u043B\u0430\u044E UI \u043F\u043E\u0434 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0435 \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438 \u0438 health-check \u044D\u043D\u0434\u043F\u043E\u0438\u043D\u0442\u044B.</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-CmjeWhSg.mjs.map
