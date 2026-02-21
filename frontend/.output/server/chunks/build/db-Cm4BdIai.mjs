import { defineComponent, computed, ref, watch, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrRenderList, ssrInterpolate, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
  __name: "db",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const apiBaseUrl = computed(() => {
      const config = useRuntimeConfig();
      return config.apiBaseUrl;
    });
    const tables = ref([]);
    const table = ref("");
    const rows = ref([]);
    const columns = ref([]);
    const limit = ref(50);
    const offset = ref(0);
    const count = ref(0);
    const loading = ref(false);
    const error = ref("");
    const dangerUnlocked = ref(false);
    const dangerPhrase = ref("");
    const confirmEnabled = computed(() => dangerPhrase.value.trim() === "\u042F \u041F\u041E\u041D\u0418\u041C\u0410\u042E");
    const editRowId = ref(null);
    const editDraft = ref({});
    const saveConfirm = ref("");
    const totalPages = computed(() => Math.max(1, Math.ceil((count.value || 0) / limit.value)));
    const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
    async function api(path, opts = {}) {
      if (!auth.accessToken) throw new Error("\u041D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u0430");
      return await $fetch(path, {
        baseURL: apiBaseUrl.value,
        ...opts,
        headers: {
          ...opts.headers || {},
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
    }
    async function loadTable() {
      var _a;
      if (!table.value) return;
      loading.value = true;
      error.value = "";
      editRowId.value = null;
      editDraft.value = {};
      saveConfirm.value = "";
      try {
        const res = await api(
          `/api/admin/db/table/${table.value}?limit=${limit.value}&offset=${offset.value}`
        );
        columns.value = res.columns;
        rows.value = res.rows;
        count.value = res.count;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || (e == null ? void 0 : e.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u0443";
      } finally {
        loading.value = false;
      }
    }
    watch(table, () => {
      offset.value = 0;
      loadTable();
    });
    watch([limit, offset], () => {
      loadTable();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1 class="text-lg font-semibold">DB Viewer</h1><p class="text-sm text-gray-500 mt-1"> \u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0438 (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E) \u043E\u043F\u0430\u0441\u043D\u043E\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u0430\u0431\u043B\u0438\u0446. \u0422\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F admin. </p><div class="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4"><div class="flex items-start gap-3"><div class="w-10 h-10 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center"><span class="text-xl">\u26A0\uFE0F</span></div><div class="min-w-0"><div class="font-semibold text-red-700">\u041E\u041F\u0410\u0421\u041D\u041E</div><div class="text-sm text-red-700/80 mt-1"> \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0431\u0430\u0437\u044B \u043C\u043E\u0436\u0435\u0442 \u0441\u043B\u043E\u043C\u0430\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D, \u0437\u0430\u043A\u0430\u0437\u044B \u0438 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E. \u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440. </div><div class="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center"><input${ssrRenderAttr("value", dangerPhrase.value)} class="w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm" placeholder="\u041D\u0430\u043F\u0438\u0448\u0438: \u042F \u041F\u041E\u041D\u0418\u041C\u0410\u042E"><button class="${ssrRenderClass([confirmEnabled.value ? "bg-red-600 text-white border-red-600" : "bg-white text-red-700 border-red-200 opacity-60", "px-4 py-2 rounded-xl text-sm font-medium border"])}"${ssrIncludeBooleanAttr(!confirmEnabled.value) ? " disabled" : ""}> \u0420\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 </button>`);
      if (dangerUnlocked.value) {
        _push(`<button class="px-4 py-2 rounded-xl text-sm font-medium border border-red-200 text-red-700 bg-white"> \u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0431\u0440\u0430\u0442\u043D\u043E </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div><div class="mt-6 flex flex-col md:flex-row gap-3 md:items-end"><div class="w-full md:w-72"><label class="text-xs font-medium text-gray-600">\u0422\u0430\u0431\u043B\u0438\u0446\u0430</label><select class="w-full mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"><!--[-->`);
      ssrRenderList(tables.value, (t) => {
        _push(`<option${ssrRenderAttr("value", t)}${ssrIncludeBooleanAttr(Array.isArray(table.value) ? ssrLooseContain(table.value, t) : ssrLooseEqual(table.value, t)) ? " selected" : ""}>${ssrInterpolate(t)}</option>`);
      });
      _push(`<!--]--></select></div><div class="w-full md:w-40"><label class="text-xs font-medium text-gray-600">\u041B\u0438\u043C\u0438\u0442</label><select class="w-full mt-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"><option${ssrRenderAttr("value", 25)}${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, 25) : ssrLooseEqual(limit.value, 25)) ? " selected" : ""}>25</option><option${ssrRenderAttr("value", 50)}${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, 50) : ssrLooseEqual(limit.value, 50)) ? " selected" : ""}>50</option><option${ssrRenderAttr("value", 100)}${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, 100) : ssrLooseEqual(limit.value, 100)) ? " selected" : ""}>100</option><option${ssrRenderAttr("value", 200)}${ssrIncludeBooleanAttr(Array.isArray(limit.value) ? ssrLooseContain(limit.value, 200) : ssrLooseEqual(limit.value, 200)) ? " selected" : ""}>200</option></select></div><div class="ml-auto flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 text-sm"${ssrIncludeBooleanAttr(currentPage.value <= 1) ? " disabled" : ""}>\u2190</button><div class="text-sm text-gray-600">${ssrInterpolate(currentPage.value)} / ${ssrInterpolate(totalPages.value)}</div><button class="px-3 py-2 rounded-xl border border-gray-200 text-sm"${ssrIncludeBooleanAttr(currentPage.value >= totalPages.value) ? " disabled" : ""}>\u2192</button></div></div>`);
      if (error.value) {
        _push(`<p class="mt-4 text-sm text-red-600">${ssrInterpolate(error.value)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-4 rounded-2xl border border-gray-200 overflow-hidden"><div class="overflow-auto"><table class="min-w-full text-xs"><thead class="bg-gray-50 border-b border-gray-200"><tr><th class="px-3 py-2 text-left whitespace-nowrap">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th><!--[-->`);
      ssrRenderList(columns.value, (c) => {
        _push(`<th class="px-3 py-2 text-left whitespace-nowrap">${ssrInterpolate(c)}</th>`);
      });
      _push(`<!--]--></tr></thead><tbody>`);
      if (loading.value) {
        _push(`<tr><td${ssrRenderAttr("colspan", columns.value.length + 1)} class="px-3 py-4 text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(rows.value, (r) => {
        _push(`<tr class="border-t border-gray-100 align-top"><td class="px-3 py-2 whitespace-nowrap">`);
        if (editRowId.value === r.id) {
          _push(`<!--[--><button class="px-3 py-1 rounded-lg text-xs border border-gray-200"> \u041E\u0442\u043C\u0435\u043D\u0430 </button><button class="${ssrRenderClass([dangerUnlocked.value ? "bg-red-600 text-white" : "bg-gray-200 text-gray-500", "ml-2 px-3 py-1 rounded-lg text-xs"])}"${ssrIncludeBooleanAttr(!dangerUnlocked.value) ? " disabled" : ""}> \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C </button><!--]-->`);
        } else {
          _push(`<button${ssrIncludeBooleanAttr(!dangerUnlocked.value) ? " disabled" : ""} class="${ssrRenderClass([dangerUnlocked.value ? "" : "opacity-50 cursor-not-allowed", "px-3 py-1 rounded-lg text-xs border border-gray-200"])}"> \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C </button>`);
        }
        _push(`</td><!--[-->`);
        ssrRenderList(columns.value, (c) => {
          _push(`<td class="px-3 py-2 whitespace-nowrap">`);
          if (editRowId.value === r.id && dangerUnlocked.value) {
            _push(`<input${ssrRenderAttr("value", editDraft.value[c])} class="w-full min-w-[140px] rounded-lg border border-gray-200 px-2 py-1">`);
          } else {
            _push(`<span class="text-gray-800">${ssrInterpolate(r[c])}</span>`);
          }
          _push(`</td>`);
        });
        _push(`<!--]--></tr>`);
      });
      _push(`<!--]--></tbody></table></div>`);
      if (editRowId.value && dangerUnlocked.value) {
        _push(`<div class="p-3 border-t border-gray-200 bg-white"><div class="text-xs text-gray-600"> \u0427\u0442\u043E\u0431\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F, \u0432\u0432\u0435\u0434\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435: <b>YES_I_AM_SURE</b></div><input${ssrRenderAttr("value", saveConfirm.value)} class="mt-2 w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm" placeholder="YES_I_AM_SURE"></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/db.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=db-Cm4BdIai.mjs.map
