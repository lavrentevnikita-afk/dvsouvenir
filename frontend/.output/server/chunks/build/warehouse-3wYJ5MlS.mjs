import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig, b as useRoute } from './server.mjs';
import { ssrRenderAttrs, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
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
  __name: "warehouse",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const route = useRoute();
    const tab = ref(route.query.tab || "items");
    const warehouse = ref(String(route.query.warehouse || "BLANKS").toUpperCase());
    const deficitOnly = ref(false);
    const withReservedOnly = ref(false);
    const loading = ref(false);
    const error = ref(null);
    const items = ref([]);
    function whLabel(code) {
      const c = String(code || "").toUpperCase();
      if (c === "BLANKS") return "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438";
      if (c === "FINISHED") return "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F";
      if (c === "DEFECT") return "\u0411\u0440\u0430\u043A";
      return c;
    }
    async function loadItems() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/warehouse/items", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: { warehouse: warehouse.value }
        });
        items.value = Array.isArray(res == null ? void 0 : res.items) ? res.items : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u043A\u043B\u0430\u0434";
      } finally {
        loading.value = false;
      }
    }
    const displayedItems = computed(() => {
      const arr = items.value;
      return arr.filter((it) => {
        const free = Number((it == null ? void 0 : it.free) || 0);
        const reserved = Number((it == null ? void 0 : it.reserved) || 0);
        if (deficitOnly.value) {
          if (warehouse.value === "BLANKS") {
            if (!(it == null ? void 0 : it.purchaseNeeded) && free > 0) return false;
          } else {
            if (free > 0) return false;
          }
        }
        if (withReservedOnly.value && reserved <= 0) return false;
        return true;
      });
    });
    watch([warehouse, tab], async () => {
      if (tab.value === "items") await loadItems();
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "p-4 space-y-4" }, _attrs))}><div class="flex items-center justify-between gap-3 flex-wrap"><h1 class="text-xl font-semibold">\u0421\u043A\u043B\u0430\u0434</h1><div class="flex items-center gap-2"><button class="${ssrRenderClass([unref(tab) === "items" ? "bg-black text-white" : "bg-white", "px-3 py-1 rounded border"])}"> \u0422\u043E\u0432\u0430\u0440\u044B </button><button class="${ssrRenderClass([unref(tab) === "movements" ? "bg-black text-white" : "bg-white", "px-3 py-1 rounded border"])}"> \u0414\u0432\u0438\u0436\u0435\u043D\u0438\u044F </button><button class="${ssrRenderClass([unref(tab) === "inventory" ? "bg-black text-white" : "bg-white", "px-3 py-1 rounded border"])}"> \u0418\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F </button></div></div>`);
      if (unref(tab) === "items") {
        _push(`<div class="space-y-3"><div class="flex flex-wrap items-end gap-4"><label class="text-sm"><div class="text-gray-500 mb-1">\u0421\u043A\u043B\u0430\u0434</div><select class="border rounded px-2 py-1"><option value="BLANKS"${ssrIncludeBooleanAttr(Array.isArray(unref(warehouse)) ? ssrLooseContain(unref(warehouse), "BLANKS") : ssrLooseEqual(unref(warehouse), "BLANKS")) ? " selected" : ""}>\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438</option><option value="FINISHED"${ssrIncludeBooleanAttr(Array.isArray(unref(warehouse)) ? ssrLooseContain(unref(warehouse), "FINISHED") : ssrLooseEqual(unref(warehouse), "FINISHED")) ? " selected" : ""}>\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F</option><option value="DEFECT"${ssrIncludeBooleanAttr(Array.isArray(unref(warehouse)) ? ssrLooseContain(unref(warehouse), "DEFECT") : ssrLooseEqual(unref(warehouse), "DEFECT")) ? " selected" : ""}>\u0411\u0440\u0430\u043A</option></select></label><label class="flex items-center gap-2 text-sm select-none"><input${ssrIncludeBooleanAttr(Array.isArray(unref(deficitOnly)) ? ssrLooseContain(unref(deficitOnly), null) : unref(deficitOnly)) ? " checked" : ""} type="checkbox" class="border"> \u0414\u0435\u0444\u0438\u0446\u0438\u0442 </label><label class="flex items-center gap-2 text-sm select-none"><input${ssrIncludeBooleanAttr(Array.isArray(unref(withReservedOnly)) ? ssrLooseContain(unref(withReservedOnly), null) : unref(withReservedOnly)) ? " checked" : ""} type="checkbox" class="border"> \u0421 \u0440\u0435\u0437\u0435\u0440\u0432\u043E\u043C </label><button class="ml-auto px-3 py-1 rounded border"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button></div>`);
        if (unref(error)) {
          _push(`<div class="p-3 border rounded bg-red-50 text-red-700">${ssrInterpolate(unref(error))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="border rounded overflow-hidden"><table class="w-full text-sm"><thead class="bg-gray-50"><tr><th class="text-left p-2">\u0422\u043E\u0432\u0430\u0440</th><th class="text-left p-2">SKU</th><th class="text-left p-2">\u0422\u0438\u043F</th><th class="text-right p-2">\u041A\u043E\u043B-\u0432\u043E</th><th class="text-right p-2">\u0420\u0435\u0437\u0435\u0440\u0432</th><th class="text-right p-2">\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E</th>`);
        if (unref(warehouse) === "BLANKS") {
          _push(`<th class="text-left p-2">\u0417\u0430\u043A\u0443\u043F\u043A\u0430</th>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tr></thead><tbody>`);
        if (unref(loading)) {
          _push(`<tr><td class="p-3"${ssrRenderAttr("colspan", unref(warehouse) === "BLANKS" ? 7 : 6)}>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</td></tr>`);
        } else if (unref(displayedItems).length === 0) {
          _push(`<tr><td class="p-3"${ssrRenderAttr("colspan", unref(warehouse) === "BLANKS" ? 7 : 6)}>\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(displayedItems), (it) => {
          _push(`<tr class="border-t"><td class="p-2"><div class="font-medium">${ssrInterpolate(it.product.name)}</div><div class="text-xs text-gray-500">ID: ${ssrInterpolate(it.product.id)} \xB7 ${ssrInterpolate(whLabel(unref(warehouse)))}</div></td><td class="p-2">${ssrInterpolate(it.product.sku)}</td><td class="p-2">${ssrInterpolate(it.product.kind)}</td><td class="p-2 text-right">${ssrInterpolate(it.qty)}</td><td class="p-2 text-right">${ssrInterpolate(it.reserved)}</td><td class="p-2 text-right font-semibold">${ssrInterpolate(it.free)}</td>`);
          if (unref(warehouse) === "BLANKS") {
            _push(`<td class="p-2"><span class="${ssrRenderClass([it.purchaseNeeded ? "bg-yellow-50 border-yellow-200 text-yellow-800" : "bg-green-50 border-green-200 text-green-800", "inline-flex items-center px-2 py-0.5 rounded border text-xs"])}">${ssrInterpolate(it.purchaseNeeded ? "\u041D\u0443\u0436\u043D\u043E" : "\u041E\u043A")}</span></td>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else if (unref(tab) === "movements") {
        _push(`<div class="border rounded p-4"><div class="text-sm text-gray-600"> \u0412\u043A\u043B\u0430\u0434\u043A\u0430 \xAB\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u044F\xBB \u0431\u0443\u0434\u0435\u0442 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C \u0448\u0430\u0433\u0435 (API: /api/admin/warehouse/movements). </div></div>`);
      } else {
        _push(`<div class="border rounded p-4"><div class="text-sm text-gray-600"> \u0412\u043A\u043B\u0430\u0434\u043A\u0430 \xAB\u0418\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F\xBB \u0431\u0443\u0434\u0435\u0442 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u0432 \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u043C \u0448\u0430\u0433\u0435 (\u0441\u0435\u0441\u0441\u0438\u0438/\u0441\u0442\u0440\u043E\u043A\u0438 \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u0438). </div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/warehouse.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=warehouse-3wYJ5MlS.mjs.map
