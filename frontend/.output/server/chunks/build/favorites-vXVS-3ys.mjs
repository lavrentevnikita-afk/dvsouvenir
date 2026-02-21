import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$2 } from './server.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, unref, createVNode, createBlock, openBlock, toDisplayString, useSSRContext } from 'vue';
import { u as useHead } from './index-CCqbQxu4.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { u as useCartStore } from './cart-DZFIURht.mjs';
import { u as useToast } from './useToast-BeE5NKHL.mjs';
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
  __name: "favorites",
  __ssrInlineRender: true,
  setup(__props) {
    useAuthStore();
    const cartStore = useCartStore();
    const toast = useToast();
    const items = ref([]);
    const loading = ref(false);
    const removing = ref(null);
    const formatPrice = (price) => {
      return Number(price).toLocaleString("ru-RU");
    };
    const pluralItems = (count) => {
      const cases = [2, 0, 1, 1, 1, 2];
      const titles = ["\u0442\u043E\u0432\u0430\u0440", "\u0442\u043E\u0432\u0430\u0440\u0430", "\u0442\u043E\u0432\u0430\u0440\u043E\u0432"];
      return titles[count % 100 > 4 && count % 100 < 20 ? 2 : cases[Math.min(count % 10, 5)]];
    };
    const addToCart = (product) => {
      var _a, _b;
      cartStore.addItem(
        {
          id: Number(product.id),
          name: String(product.name || ""),
          price: Number(product.price),
          article: product.article,
          imageUrl: product.imageUrl || null,
          categorySlug: (_a = product.categorySlug) != null ? _a : null,
          categoryName: (_b = product.categoryName) != null ? _b : null
        },
        1
      );
      toast.success("\u0422\u043E\u0432\u0430\u0440 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443");
    };
    useHead({
      title: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_BaseButton = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))}><nav class="flex items-center gap-2 text-sm text-slate-500 mb-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/account",
        class: "hover:text-slate-900 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442`);
          } else {
            return [
              createTextVNode("\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span>\u2192</span><span class="text-slate-900">\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435</span></nav><h1 class="text-3xl font-bold mb-6">\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435</h1>`);
      if (unref(loading)) {
        _push(`<div class="text-center py-8 text-gray-500"> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430... </div>`);
      } else if (!unref(items) || unref(items).length === 0) {
        _push(`<div class="text-center py-12"><div class="text-6xl mb-4">\u{1F494}</div><h2 class="text-xl font-semibold text-gray-700 mb-2">\u0421\u043F\u0438\u0441\u043E\u043A \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0443\u0441\u0442</h2><p class="text-gray-500 mb-6">\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B, \u0447\u0442\u043E\u0431\u044B \u043D\u0435 \u043F\u043E\u0442\u0435\u0440\u044F\u0442\u044C \u0438\u0445</p>`);
        _push(ssrRenderComponent(_component_BaseButton, {
          variant: "primary",
          size: "lg",
          to: "/catalog"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 `);
            } else {
              return [
                createTextVNode(" \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div><p class="text-gray-600 mb-4">${ssrInterpolate(unref(items).length)} ${ssrInterpolate(pluralItems(unref(items).length))}</p><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          _push(`<div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/product/${item.product.slug || item.product.id}`,
            class: "block"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="aspect-square bg-gray-100 overflow-hidden"${_scopeId}>`);
                if (item.product.imageUrl) {
                  _push2(`<img${ssrRenderAttr("src", item.product.imageUrl)}${ssrRenderAttr("alt", item.product.name)} class="w-full h-full object-cover"${_scopeId}>`);
                } else {
                  _push2(`<div class="w-full h-full flex items-center justify-center text-gray-400"${_scopeId}> \u041D\u0435\u0442 \u0444\u043E\u0442\u043E </div>`);
                }
                _push2(`</div>`);
              } else {
                return [
                  createVNode("div", { class: "aspect-square bg-gray-100 overflow-hidden" }, [
                    item.product.imageUrl ? (openBlock(), createBlock("img", {
                      key: 0,
                      src: item.product.imageUrl,
                      alt: item.product.name,
                      class: "w-full h-full object-cover"
                    }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "w-full h-full flex items-center justify-center text-gray-400"
                    }, " \u041D\u0435\u0442 \u0444\u043E\u0442\u043E "))
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="p-4">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/product/${item.product.slug || item.product.id}`
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<h3 class="font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2 mb-2"${_scopeId}>${ssrInterpolate(item.product.name)}</h3>`);
              } else {
                return [
                  createVNode("h3", { class: "font-semibold text-gray-900 hover:text-blue-600 transition line-clamp-2 mb-2" }, toDisplayString(item.product.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="flex items-center justify-between"><span class="text-xl font-bold text-gray-900">${ssrInterpolate(formatPrice(item.product.price))} \u20BD </span><button${ssrIncludeBooleanAttr(unref(removing) === item.productId) ? " disabled" : ""} class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50" title="\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></svg></button></div>`);
          _push(ssrRenderComponent(_component_BaseButton, {
            onClick: ($event) => addToCart(item.product),
            variant: "primary",
            size: "md",
            "full-width": "",
            class: "mt-3"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u0412 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 `);
              } else {
                return [
                  createTextVNode(" \u0412 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/favorites.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=favorites-vXVS-3ys.mjs.map
