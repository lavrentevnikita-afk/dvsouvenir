import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, ref, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { b as useRoute, u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
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
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    const id = computed(() => Number(route.params.id));
    const auth = useAuthStore();
    auth.initFromStorage();
    const loading = ref(true);
    const saving = ref(false);
    const errorMessage = ref("");
    const okMessage = ref("");
    const order = ref(null);
    const lines = ref([]);
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="flex items-start justify-between gap-3"><div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/production",
        class: "text-xs text-gray-500 hover:text-gray-700"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 \u041D\u0430\u0437\u0430\u0434 \u0432 \u043E\u0447\u0435\u0440\u0435\u0434\u044C`);
          } else {
            return [
              createTextVNode("\u2190 \u041D\u0430\u0437\u0430\u0434 \u0432 \u043E\u0447\u0435\u0440\u0435\u0434\u044C")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 class="text-xl font-semibold mt-1">\u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate(unref(id))}</h1>`);
      if (unref(order)) {
        _push(`<p class="text-sm text-gray-500"> \u0421\u0442\u0430\u0442\u0443\u0441: <span class="font-medium">${ssrInterpolate(unref(order).status)}</span></p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><button class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"${ssrIncludeBooleanAttr(unref(loading) || unref(saving) || !unref(order)) ? " disabled" : ""}> \u2705 \u0413\u043E\u0442\u043E\u0432\u043E </button></div>`);
      if (unref(errorMessage)) {
        _push(`<p class="text-sm text-red-600">${ssrInterpolate(unref(errorMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(okMessage)) {
        _push(`<p class="text-sm text-emerald-700">${ssrInterpolate(unref(okMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500"> \u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u0437\u0430\u043A\u0430\u0437\u2026 </div>`);
      } else if (unref(order)) {
        _push(`<div class="grid gap-3"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-medium">\u0414\u0430\u043D\u043D\u044B\u0435</div><div class="text-sm text-gray-600 mt-2"><div><span class="text-gray-500">\u041A\u043B\u0438\u0435\u043D\u0442:</span> ${ssrInterpolate(unref(order).customerName)}</div><div class="mt-1"><span class="text-gray-500">\u0410\u0434\u0440\u0435\u0441:</span> ${ssrInterpolate(unref(order).address)}</div>`);
        if (unref(order).comment) {
          _push(`<div class="mt-1"><span class="text-gray-500">\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439:</span> ${ssrInterpolate(unref(order).comment)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).deadlineAt) {
          _push(`<div class="mt-1"><span class="text-gray-500">\u0414\u0435\u0434\u043B\u0430\u0439\u043D:</span> ${ssrInterpolate(new Date(unref(order).deadlineAt).toLocaleString())}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).priority !== null && unref(order).priority !== void 0) {
          _push(`<div class="mt-1"><span class="text-gray-500">\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442:</span> ${ssrInterpolate(unref(order).priority)}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(order).packagingRequirements) {
          _push(`<div class="mt-1"><span class="text-gray-500">\u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430:</span><pre class="mt-1 text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-3">${ssrInterpolate(JSON.stringify(unref(order).packagingRequirements, null, 2))}</pre></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="mt-1"><span class="text-gray-500">\u0421\u043E\u0437\u0434\u0430\u043D:</span> ${ssrInterpolate(new Date(unref(order).createdAt).toLocaleString())}</div></div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-medium">\u0421\u0431\u043E\u0440\u043A\u0430</div><div class="mt-3 grid gap-3"><!--[-->`);
        ssrRenderList(unref(lines), (l) => {
          _push(`<div class="rounded-2xl border border-gray-100 p-3"><div class="flex items-start justify-between gap-3"><div><div class="flex items-center gap-2"><input type="checkbox" class="h-4 w-4"${ssrIncludeBooleanAttr(Boolean(l.checked)) ? " checked" : ""}><div class="font-medium">${ssrInterpolate(l.name)}</div></div><div class="text-xs text-gray-500 mt-1">#${ssrInterpolate(l.productId)} \xB7 \u041A\u043E\u043B-\u0432\u043E: <span class="font-medium">${ssrInterpolate(l.quantity)}</span></div>`);
          if (l.stock) {
            _push(`<div class="text-xs text-gray-600 mt-1"> \u041D\u0430\u043B\u0438\u0447\u0438\u0435: \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E ${ssrInterpolate(l.stock.available)} (\u0432\u0441\u0435\u0433\u043E ${ssrInterpolate(l.stock.qty)}) </div>`);
          } else {
            _push(`<!---->`);
          }
          if (l.personalization) {
            _push(`<div class="mt-2"><div class="text-xs text-gray-500">\u041F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F</div><pre class="mt-1 text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-xl p-3">${ssrInterpolate(JSON.stringify(l.personalization, null, 2))}</pre></div>`);
          } else {
            _push(`<!---->`);
          }
          if (l.itemNotes) {
            _push(`<div class="mt-2 text-xs text-gray-700"><span class="text-gray-500">\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435:</span> ${ssrInterpolate(l.itemNotes)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="shrink-0 text-right">`);
          if (l.checked) {
            _push(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">\u0433\u043E\u0442\u043E\u0432\u043E</span>`);
          } else {
            _push(`<span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-100">\u0432 \u0440\u0430\u0431\u043E\u0442\u0435</span>`);
          }
          _push(`</div></div>`);
          if (l.assets && l.assets.length) {
            _push(`<div class="mt-3"><div class="text-xs text-gray-500">\u041C\u0430\u043A\u0435\u0442\u044B/\u0444\u0430\u0439\u043B\u044B</div><div class="mt-2 flex flex-wrap gap-2"><!--[-->`);
            ssrRenderList(l.assets.slice(0, 8), (url, idx) => {
              _push(`<a${ssrRenderAttr("href", url)} target="_blank" class="block w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-white" title="\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0430\u043A\u0435\u0442"><img${ssrRenderAttr("src", url)} class="w-full h-full object-cover"></a>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><p class="mt-3 text-xs text-gray-500">\u0426\u0435\u043D\u044B \u0441\u043A\u0440\u044B\u0442\u044B \u0434\u043B\u044F \u0440\u043E\u043B\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430. \u041E\u0442\u043C\u0435\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u0447\u0435\u043A\u043B\u0438\u0441\u0442\u043E\u043C \u0438 \u043D\u0430\u0436\u043C\u0438 \u201C\u0413\u043E\u0442\u043E\u0432\u043E\u201D.</p></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/orders/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-Cop7mI7f.mjs.map
