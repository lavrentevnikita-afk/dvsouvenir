import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { u as useCartStore } from './cart-DZFIURht.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { c as useRouter, u as useRuntimeConfig } from './server.mjs';
import { defineComponent, reactive, ref, watch, computed, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList } from 'vue/server-renderer';
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
  __name: "checkout",
  __ssrInlineRender: true,
  setup(__props) {
    const cartStore = useCartStore();
    const authStore = useAuthStore();
    useRouter();
    const config = useRuntimeConfig();
    const form = reactive({
      name: "",
      phone: "",
      email: "",
      address: "",
      comment: ""
    });
    const isSubmitting = ref(false);
    ref(null);
    const errorHint = ref(null);
    const cartPreview = ref(null);
    async function refreshCartPreview() {
      if (cartStore.isEmpty) {
        cartPreview.value = { items: [], totals: { retail: 0, discount: 0, final: 0 }, canCheckout: false };
        return;
      }
      try {
        cartPreview.value = await $fetch("/api/cart/preview", {
          baseURL: config.public.apiBaseUrl,
          method: "POST",
          body: {
            items: cartStore.items.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
          },
          headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : void 0
        });
      } catch {
        cartPreview.value = null;
      }
    }
    watch(
      () => cartStore.items.map((i) => [i.product.id, i.quantity]),
      () => refreshCartPreview(),
      { deep: true, immediate: true }
    );
    computed(() => !cartStore.isEmpty);
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><header class="space-y-1"><h1 class="text-xl font-semibold">\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430</h1><p class="text-sm text-gray-600"> \u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u043A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u0438 \u0430\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438. </p></header>`);
      if (unref(cartStore).isEmpty) {
        _push(`<div class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500"> \u041A\u043E\u0440\u0437\u0438\u043D\u0430 \u043F\u0443\u0441\u0442\u0430. \u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B. <div class="mt-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/catalog",
          class: "inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 `);
            } else {
              return [
                createTextVNode(" \u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<form class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start"><div class="space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm"><div class="space-y-3"><div><label class="block text-xs font-medium text-gray-700 mb-1"> \u0418\u043C\u044F \u0438 \u0444\u0430\u043C\u0438\u043B\u0438\u044F </label><input${ssrRenderAttr("value", unref(form).name)} type="text" required class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"></div><div><label class="block text-xs font-medium text-gray-700 mb-1"> \u0422\u0435\u043B\u0435\u0444\u043E\u043D </label><input${ssrRenderAttr("value", unref(form).phone)} type="tel" required class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400" placeholder="+7XXXXXXXXXX"></div><div><label class="block text-xs font-medium text-gray-700 mb-1"> E-mail (\u043F\u043E \u0436\u0435\u043B\u0430\u043D\u0438\u044E) </label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400"></div><div><label class="block text-xs font-medium text-gray-700 mb-1"> \u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438 </label><textarea required rows="3" class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400 resize-none" placeholder="\u0413\u043E\u0440\u043E\u0434, \u0443\u043B\u0438\u0446\u0430, \u0434\u043E\u043C, \u043A\u0432\u0430\u0440\u0442\u0438\u0440\u0430">${ssrInterpolate(unref(form).address)}</textarea></div><div><label class="block text-xs font-medium text-gray-700 mb-1"> \u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u043A \u0437\u0430\u043A\u0430\u0437\u0443 </label><textarea rows="3" class="w-full rounded border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-400 resize-none" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0443\u0434\u043E\u0431\u043D\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u0434\u043B\u044F \u0437\u0432\u043E\u043D\u043A\u0430 \u0438\u043B\u0438 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438">${ssrInterpolate(unref(form).comment)}</textarea></div></div>`);
        if (unref(errorHint)) {
          _push(`<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"><div class="font-medium">${ssrInterpolate(unref(errorHint).title)}</div><div class="mt-1">${ssrInterpolate(unref(errorHint).text)}</div><div class="mt-2 flex flex-wrap gap-2">`);
          if (unref(errorHint).action === "refresh_cart") {
            _push(`<button type="button" class="inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-[11px] font-medium text-white"> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043A\u043E\u0440\u0437\u0438\u043D\u0443 </button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(errorHint).action === "relogin") {
            _push(`<button type="button" class="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white"> \u0412\u043E\u0439\u0442\u0438 </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="submit" class="mt-2 inline-flex items-center rounded-full bg-slate-900 px-6 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"${ssrIncludeBooleanAttr(unref(isSubmitting)) ? " disabled" : ""}>`);
        if (unref(isSubmitting)) {
          _push(`<span>\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C \u0437\u0430\u043A\u0430\u0437...</span>`);
        } else {
          _push(`<span>\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437</span>`);
        }
        _push(`</button></div><aside class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm"><h2 class="text-sm font-semibold">\u0412\u0430\u0448 \u0437\u0430\u043A\u0430\u0437</h2><ul class="space-y-2 max-h-64 overflow-y-auto pr-1"><!--[-->`);
        ssrRenderList(unref(cartStore).items, (item) => {
          var _a3;
          var _a22, _b2, _c, _d;
          _push(`<li class="flex justify-between gap-2 text-xs"><div class="flex-1"><p class="font-medium text-gray-900 line-clamp-2">${ssrInterpolate(item.product.name)}</p><p class="text-[11px] text-gray-500"> x${ssrInterpolate(item.quantity)}</p></div><div class="text-right whitespace-nowrap"><p class="font-semibold">${ssrInterpolate(Math.round((_a3 = (_d = (_c = (_b2 = (_a22 = unref(cartPreview)) == null ? void 0 : _a22.items) == null ? void 0 : _b2.find((p) => p.product.id === item.product.id)) == null ? void 0 : _c.price) == null ? void 0 : _d.finalLine) != null ? _a3 : item.product.price * item.quantity))} \u20BD </p></div></li>`);
        });
        _push(`<!--]--></ul><div class="flex justify-between text-sm font-semibold"><span>\u0418\u0442\u043E\u0433\u043E</span><span>${ssrInterpolate(Math.round((_a2 = (_b = (_a = unref(cartPreview)) == null ? void 0 : _a.totals) == null ? void 0 : _b.final) != null ? _a2 : unref(cartStore).totalPrice))} \u20BD</span></div></aside></form>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/checkout.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=checkout-BHDXZnZh.mjs.map
