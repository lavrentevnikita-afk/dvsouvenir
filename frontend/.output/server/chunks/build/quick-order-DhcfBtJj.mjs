import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "quick-order",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    const cart = useCartStore();
    auth.initFromStorage();
    cart.initFromStorage();
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    const rows = ref([
      { article: "", qty: 1, product: null, price: null, stockTotal: null, stockByWarehouse: [], error: null }
    ]);
    const pasteText = ref("");
    const loading = ref(false);
    const error = ref(null);
    function stockBadge(total) {
      if (total === null) return "\u2014";
      if (total > 20) return "\u043C\u043D\u043E\u0433\u043E";
      if (total >= 5) return "\u043C\u0430\u043B\u043E";
      return "\u043F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437";
    }
    const totalSum = computed(() => {
      return rows.value.reduce((s, r) => {
        var _a, _b;
        const qty = Number((_a = r.qty) != null ? _a : 0);
        const price = Number((_b = r.price) != null ? _b : 0);
        if (!Number.isFinite(qty) || !Number.isFinite(price)) return s;
        return s + qty * price;
      }, 0);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-5" }, _attrs))}><div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437</h1><p class="text-sm text-gray-600 mt-1"> \u0412\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0441\u043F\u0438\u0441\u043A\u043E\u043C <span class="text-gray-700 font-medium">\u0430\u0440\u0442\u0438\u043A\u0443\u043B;\u043A\u043E\u043B-\u0432\u043E</span> \u0438\u043B\u0438 \u0434\u043E\u0431\u0430\u0432\u043B\u044F\u0439\u0442\u0435 \u0441\u0442\u0440\u043E\u043A\u0438 \u0432\u0440\u0443\u0447\u043D\u0443\u044E. </p></div><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/b2b/orders",
        class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u{1F9FE} \u041A \u0437\u0430\u043A\u0430\u0437\u0430\u043C `);
          } else {
            return [
              createTextVNode(" \u{1F9FE} \u041A \u0437\u0430\u043A\u0430\u0437\u0430\u043C ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(loading) ? "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026" : "\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B/\u043E\u0441\u0442\u0430\u0442\u043A\u0438")}</button><button class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50"${ssrIncludeBooleanAttr(unref(rows).every((r) => !r.product)) ? " disabled" : ""}> \u{1F6D2} \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 </button></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid grid-cols-1 lg:grid-cols-5 gap-3"><div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u0412\u0441\u0442\u0430\u0432\u043A\u0430 \u0441\u043F\u0438\u0441\u043A\u043E\u043C</div><div class="text-xs text-gray-500 mt-1">\u0424\u043E\u0440\u043C\u0430\u0442: <span class="text-gray-600">\u0430\u0440\u0442\u0438\u043A\u0443\u043B;\u043A\u043E\u043B-\u0432\u043E</span></div><textarea class="mt-3 w-full min-h-[180px] rounded-xl border border-gray-200 bg-white p-3 text-sm outline-none focus:border-amber-300/70" placeholder="SV-0001;10\\nSV-0002;4\\nSV-0003;1">${ssrInterpolate(unref(pasteText))}</textarea><div class="mt-3 flex items-center gap-2"><button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C </button><button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C </button></div></div><div class="lg:col-span-3 rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between gap-3"><div><div class="text-sm font-semibold">\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043F\u043E\u0437\u0438\u0446\u0438\u0439</div><div class="text-xs text-gray-500 mt-1">\u0410\u0440\u0442\u0438\u043A\u0443\u043B \u2192 \u0442\u043E\u0432\u0430\u0440, \u0446\u0435\u043D\u0430, \u043E\u0441\u0442\u0430\u0442\u043E\u043A. \u041A\u043E\u043B-\u0432\u043E \u043C\u043E\u0436\u043D\u043E \u043C\u0435\u043D\u044F\u0442\u044C.</div></div><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> + \u0421\u0442\u0440\u043E\u043A\u0430 </button></div><div class="overflow-auto"><table class="min-w-full text-sm"><thead class="text-xs text-gray-500 bg-white"><tr><th class="text-left font-medium px-4 py-3">\u0410\u0440\u0442\u0438\u043A\u0443\u043B</th><th class="text-left font-medium px-4 py-3">\u0422\u043E\u0432\u0430\u0440</th><th class="text-left font-medium px-4 py-3">\u0426\u0435\u043D\u0430 (\u043E\u043F\u0442)</th><th class="text-left font-medium px-4 py-3">\u041E\u0441\u0442\u0430\u0442\u043E\u043A</th><th class="text-left font-medium px-4 py-3">\u041A\u043E\u043B-\u0432\u043E</th><th class="text-right font-medium px-4 py-3"></th></tr></thead><tbody class="divide-y divide-gray-100"><!--[-->`);
      ssrRenderList(unref(rows), (r, i) => {
        var _a;
        _push(`<tr class="hover:bg-gray-50"><td class="px-4 py-3"><input${ssrRenderAttr("value", r.article)} class="w-32 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-amber-300/70" placeholder="SV-0001">`);
        if (r.error) {
          _push(`<div class="text-[11px] text-red-600 mt-1">${ssrInterpolate(r.error)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td><td class="px-4 py-3">`);
        if (r.product) {
          _push(`<div class="font-medium">${ssrInterpolate(r.product.name)}</div>`);
        } else {
          _push(`<div class="text-gray-500">\u2014</div>`);
        }
        if (r.product) {
          _push(`<div class="text-[11px] text-gray-500">#${ssrInterpolate(r.product.id)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td><td class="px-4 py-3">`);
        if (r.price !== null) {
          _push(`<div class="font-medium">${ssrInterpolate(r.price.toFixed(2))}</div>`);
        } else {
          _push(`<div class="text-gray-500">\u2014</div>`);
        }
        _push(`</td><td class="px-4 py-3"><div class="font-medium">${ssrInterpolate(stockBadge(r.stockTotal))}</div>`);
        if (r.stockTotal !== null) {
          _push(`<div class="text-[11px] text-gray-500">${ssrInterpolate(r.stockTotal)} \u0448\u0442.</div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_a = r.stockByWarehouse) == null ? void 0 : _a.length) {
          _push(`<div class="text-[11px] text-gray-500 mt-1"><!--[-->`);
          ssrRenderList(r.stockByWarehouse, (w, wi) => {
            _push(`<span>${ssrInterpolate(w.warehouse)}: ${ssrInterpolate(w.qty)}`);
            if (wi < r.stockByWarehouse.length - 1) {
              _push(`<span> \xB7 </span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</span>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td><td class="px-4 py-3"><input${ssrRenderAttr("value", r.qty)} type="number" min="0" class="w-20 rounded-lg border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-amber-300/70"></td><td class="px-4 py-3 text-right"><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C </button></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div><div class="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"><div class="text-xs text-gray-500">\u0418\u0442\u043E\u0433\u043E: ${ssrInterpolate(unref(totalSum).toFixed(2))}</div><div class="flex items-center gap-2"><button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044C </button><button class="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50"${ssrIncludeBooleanAttr(unref(rows).every((r) => !r.product)) ? " disabled" : ""}> \u0412 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 </button></div></div></div></div></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/quick-order.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=quick-order-DhcfBtJj.mjs.map
