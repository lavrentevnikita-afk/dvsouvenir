import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { b as useRoute, c as useRouter, u as useRuntimeConfig } from './server.mjs';
import { defineComponent, computed, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useCityStore } from './city-CtecIgg_.mjs';
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
  __name: "search",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const router = useRouter();
    const query = computed({
      get: () => route.query.q || "",
      set: (value) => {
        router.push({ path: "/search", query: value ? { q: value } : {} });
      }
    });
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const cityStore = useCityStore();
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "search-results",
      () => query.value ? $fetch("/api/catalog/search", {
        baseURL: apiBaseUrl,
        query: { query: query.value, ...cityStore.code ? { city: cityStore.code } : {} }
      }) : Promise.resolve({ products: [] }),
      {
        watch: [query, () => cityStore.code]
      }
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><header class="space-y-2"><h1 class="text-xl font-semibold">\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0443</h1><p class="text-sm text-gray-600"> \u041F\u043E\u0438\u0441\u043A \u043F\u043E \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044E \u0442\u043E\u0432\u0430\u0440\u0430 \u0438 \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0443. </p><div class="flex gap-2"><input${ssrRenderAttr("value", unref(query))} type="search" class="flex-1 rounded-full border border-gray-300 px-3 py-1.5 text-sm" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u043C\u0430\u0433\u043D\u0438\u0442, \u043A\u0440\u0443\u0436\u043A\u0430 \u0438\u043B\u0438 \u0430\u0440\u0442\u0438\u043A\u0443\u043B SV-0001"></div></header>`);
      if (unref(pending)) {
        _push(`<div class="text-sm text-gray-500"> \u0418\u0434\u0451\u0442 \u043F\u043E\u0438\u0441\u043A\u2026 </div>`);
      } else if (unref(error)) {
        _push(`<div class="text-sm text-red-600"> \u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u043F\u043E\u0438\u0441\u043A\u0430 </div>`);
      } else if (!unref(query)) {
        _push(`<div class="text-sm text-gray-500"> \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0438\u043B\u0438 \u0430\u0440\u0442\u0438\u043A\u0443\u043B \u0442\u043E\u0432\u0430\u0440\u0430. </div>`);
      } else if (((_b = (_a = unref(data)) == null ? void 0 : _a.products) == null ? void 0 : _b.length) === 0) {
        _push(`<div class="text-sm text-gray-500"> \u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E. </div>`);
      } else {
        _push(`<ul class="space-y-2"><!--[-->`);
        ssrRenderList((_c = unref(data)) == null ? void 0 : _c.products, (product) => {
          _push(`<li class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm flex items-center justify-between gap-3"><div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/product/${product.id}`,
            class: "font-medium text-gray-900 hover:text-brand"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(product.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(product.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<p class="text-xs text-gray-500"> \u0410\u0440\u0442\u0438\u043A\u0443\u043B: ${ssrInterpolate(product.article)}</p></div><p class="font-semibold whitespace-nowrap">${ssrInterpolate(product.price)} \u20BD </p></li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/search.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=search-BNzivysw.mjs.map
