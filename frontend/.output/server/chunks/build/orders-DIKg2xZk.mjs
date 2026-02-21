import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, reactive, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { c as useRouter, u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrRenderComponent, ssrInterpolate, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { u as useCartStore } from './cart-DZFIURht.mjs';
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
  __name: "orders",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    const cart = useCartStore();
    auth.initFromStorage();
    cart.initFromStorage();
    useRouter();
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    const loading = ref(false);
    const error = ref(null);
    const orders = ref([]);
    const filters = reactive({
      q: "",
      status: "all",
      from: "",
      to: ""
    });
    const statusLabels = {
      new: "\u041D\u043E\u0432\u044B\u0439",
      processing: "\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435",
      paid: "\u041E\u043F\u043B\u0430\u0447\u0435\u043D",
      shipped: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D",
      done: "\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D",
      canceled: "\u041E\u0442\u043C\u0435\u043D\u0451\u043D"
    };
    function normalize(s) {
      return String(s != null ? s : "").trim().toLowerCase();
    }
    const filteredOrders = computed(() => {
      let list = [...orders.value];
      const q = normalize(filters.q);
      if (q) {
        list = list.filter((o) => normalize(o.id).includes(q) || normalize(o.customerName).includes(q));
      }
      if (filters.status !== "all") {
        list = list.filter((o) => normalize(o.status) === normalize(filters.status));
      }
      const from = filters.from ? /* @__PURE__ */ new Date(filters.from + "T00:00:00") : null;
      const to = filters.to ? /* @__PURE__ */ new Date(filters.to + "T23:59:59") : null;
      if (from || to) {
        list = list.filter((o) => {
          const d = new Date(o.createdAt);
          if (from && d < from) return false;
          if (to && d > to) return false;
          return true;
        });
      }
      return list;
    });
    function orderItemsCount(o) {
      return Array.isArray(o == null ? void 0 : o.items) ? o.items.reduce((s, it) => {
        var _a;
        return s + Number((_a = it.quantity) != null ? _a : 0);
      }, 0) : 0;
    }
    function formatMoney(v) {
      const n = Number(v);
      if (!Number.isFinite(n)) return String(v != null ? v : "\u2014");
      return n.toFixed(2);
    }
    function formatDate(d) {
      try {
        const dt = new Date(d);
        return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(dt);
      } catch {
        return "\u2014";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u0417\u0430\u043A\u0430\u0437\u044B</h1><p class="text-sm text-gray-600 mt-1"> \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430: \u0444\u0438\u043B\u044C\u0442\u0440\u044B, \u043F\u043E\u0432\u0442\u043E\u0440 \u0437\u0430\u043A\u0430\u0437\u0430 \u0438 \u0432\u044B\u0433\u0440\u0443\u0437\u043A\u0430 CSV. </p></div><div class="flex items-center gap-2"><button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button><button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(filteredOrders).length === 0) ? " disabled" : ""}> \u042D\u043A\u0441\u043F\u043E\u0440\u0442 CSV </button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/b2b/quick-order",
        class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u26A1 \u041D\u043E\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 `);
          } else {
            return [
              createTextVNode(" \u26A1 \u041D\u043E\u0432\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 lg:grid-cols-4 gap-3"><div class="lg:col-span-1 rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u0424\u0438\u043B\u044C\u0442\u0440\u044B</div><div class="mt-4 space-y-3"><div><label class="text-xs text-gray-500">\u041F\u043E\u0438\u0441\u043A (\u2116 \u0438\u043B\u0438 \u0438\u043C\u044F)</label><input${ssrRenderAttr("value", unref(filters).q)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70" placeholder="#123"></div><div><label class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441</label><select class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "all") : ssrLooseEqual(unref(filters).status, "all")) ? " selected" : ""}>\u0412\u0441\u0435</option><option value="new"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "new") : ssrLooseEqual(unref(filters).status, "new")) ? " selected" : ""}>\u041D\u043E\u0432\u044B\u0439</option><option value="processing"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "processing") : ssrLooseEqual(unref(filters).status, "processing")) ? " selected" : ""}>\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435</option><option value="paid"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "paid") : ssrLooseEqual(unref(filters).status, "paid")) ? " selected" : ""}>\u041E\u043F\u043B\u0430\u0447\u0435\u043D</option><option value="shipped"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "shipped") : ssrLooseEqual(unref(filters).status, "shipped")) ? " selected" : ""}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D</option><option value="done"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "done") : ssrLooseEqual(unref(filters).status, "done")) ? " selected" : ""}>\u0412\u044B\u043F\u043E\u043B\u043D\u0435\u043D</option><option value="canceled"${ssrIncludeBooleanAttr(Array.isArray(unref(filters).status) ? ssrLooseContain(unref(filters).status, "canceled") : ssrLooseEqual(unref(filters).status, "canceled")) ? " selected" : ""}>\u041E\u0442\u043C\u0435\u043D\u0451\u043D</option></select></div><div class="grid grid-cols-2 gap-2"><div><label class="text-xs text-gray-500">\u041E\u0442</label><input type="date"${ssrRenderAttr("value", unref(filters).from)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70"></div><div><label class="text-xs text-gray-500">\u0414\u043E</label><input type="date"${ssrRenderAttr("value", unref(filters).to)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-300/70"></div></div><button class="w-full px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C </button></div></div><div class="lg:col-span-3 rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between gap-3"><div><div class="text-sm font-semibold">\u0421\u043F\u0438\u0441\u043E\u043A \u0437\u0430\u043A\u0430\u0437\u043E\u0432</div><div class="text-xs text-gray-500 mt-1">\u041D\u0430\u0439\u0434\u0435\u043D\u043E: ${ssrInterpolate(unref(filteredOrders).length)}</div></div>`);
      if (unref(loading)) {
        _push(`<div class="text-xs text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="overflow-auto"><table class="min-w-full text-sm"><thead class="text-xs text-gray-500 bg-white"><tr><th class="text-left font-medium px-4 py-3">\u0417\u0430\u043A\u0430\u0437</th><th class="text-left font-medium px-4 py-3">\u0414\u0430\u0442\u0430</th><th class="text-left font-medium px-4 py-3">\u0421\u0443\u043C\u043C\u0430</th><th class="text-left font-medium px-4 py-3">\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-right font-medium px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody class="divide-y divide-gray-100">`);
      if (!unref(loading) && unref(filteredOrders).length === 0) {
        _push(`<tr><td colspan="5" class="px-4 py-6 text-center text-sm text-gray-500"> \u0417\u0430\u043A\u0430\u0437\u043E\u0432 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442. </td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(filteredOrders), (o) => {
        _push(`<tr class="hover:bg-gray-50"><td class="px-4 py-3"><div class="font-semibold">#${ssrInterpolate(o.id)}</div><div class="text-xs text-gray-500">${ssrInterpolate(orderItemsCount(o))} \u0448\u0442.</div></td><td class="px-4 py-3 text-gray-700">${ssrInterpolate(formatDate(o.createdAt))}</td><td class="px-4 py-3 text-gray-700">${ssrInterpolate(formatMoney(o.totalPrice))}</td><td class="px-4 py-3"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border border-gray-200 bg-white">${ssrInterpolate(statusLabels[o.status] || o.status)}</span></td><td class="px-4 py-3 text-right"><div class="flex justify-end gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> CSV </button></div></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/orders.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=orders-DIKg2xZk.mjs.map
