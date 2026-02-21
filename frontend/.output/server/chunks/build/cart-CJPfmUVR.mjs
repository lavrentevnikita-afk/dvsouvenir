import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$3 } from './ProductCard-C9CGbHDp.mjs';
import { c as useRouter, u as useRuntimeConfig, b as useRoute } from './server.mjs';
import { defineComponent, ref, watch, computed, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createBlock, createCommentVNode, createVNode, openBlock, reactive, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseEqual, ssrRenderSlot } from 'vue/server-renderer';
import { u as useCartStore } from './cart-DZFIURht.mjs';
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
import './ProductPriceBlock-DEFQ0tZW.mjs';
import './favorites-CzyYdspe.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

function normalizeApiError(err) {
  var _a, _b, _c, _d;
  const data = (err == null ? void 0 : err.data) || ((_a = err == null ? void 0 : err.response) == null ? void 0 : _a._data) || void 0;
  const code = ((_b = data == null ? void 0 : data.error) == null ? void 0 : _b.code) || (data == null ? void 0 : data.code) || "ERROR";
  const message = ((_c = data == null ? void 0 : data.error) == null ? void 0 : _c.message) || (data == null ? void 0 : data.message) || (err == null ? void 0 : err.message) || "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u043F\u0440\u043E\u0441\u0430";
  const details = ((_d = data == null ? void 0 : data.error) == null ? void 0 : _d.details) || (data == null ? void 0 : data.details);
  const requestId = data == null ? void 0 : data.requestId;
  return {
    code: String(code),
    message: Array.isArray(message) ? message.join(", ") : String(message),
    ...typeof details !== "undefined" ? { details } : {},
    ...requestId ? { requestId: String(requestId) } : {}
  };
}
function mapErrorToUi(e) {
  switch (e.code) {
    case "CART_ITEM_UNAVAILABLE":
      return {
        title: "\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B",
        text: "\u041D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u0442\u043E\u0432\u0430\u0440\u044B \u0441\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0435. \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u043A\u043E\u0440\u0437\u0438\u043D\u0443 \u0438 \u043F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.",
        actionLabel: "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043A\u043E\u0440\u0437\u0438\u043D\u0443",
        action: "refresh_cart"
      };
    case "ORDER_STATUS_CONFLICT":
      return {
        title: "\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430 \u0438\u0437\u043C\u0435\u043D\u0438\u043B\u0441\u044F",
        text: "\u0417\u0430\u043A\u0430\u0437 \u0443\u0436\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0451\u043D \u043A\u0435\u043C-\u0442\u043E \u0435\u0449\u0451 \u0438\u043B\u0438 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u0434\u0440\u0443\u0433\u043E\u043C \u0441\u0442\u0430\u0442\u0443\u0441\u0435. \u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0437\u0430\u043A\u0430\u0437\u0430.",
        actionLabel: "\u041F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437",
        action: "reload_order"
      };
    case "FORBIDDEN_ROLE":
      return {
        title: "\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u043F\u0440\u0430\u0432",
        text: "\u0423 \u0432\u0430\u0448\u0435\u0439 \u0440\u043E\u043B\u0438 \u043D\u0435\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0430 \u043A \u044D\u0442\u043E\u043C\u0443 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044E."
      };
    case "VALIDATION_ERROR":
      return {
        title: "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435",
        text: e.message || "\u041D\u0435\u043A\u043E\u0442\u043E\u0440\u044B\u0435 \u043F\u043E\u043B\u044F \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u044B \u043D\u0435\u0432\u0435\u0440\u043D\u043E."
      };
    case "UNAUTHORIZED":
      return {
        title: "\u041D\u0443\u0436\u043D\u043E \u0432\u043E\u0439\u0442\u0438",
        text: "\u0421\u0435\u0441\u0441\u0438\u044F \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u0430\u0441\u044C. \u0412\u043E\u0439\u0434\u0438\u0442\u0435 \u0441\u043D\u043E\u0432\u0430.",
        actionLabel: "\u0412\u043E\u0439\u0442\u0438",
        action: "relogin"
      };
    default:
      return {
        title: "\u041E\u0448\u0438\u0431\u043A\u0430",
        text: e.message || "\u0427\u0442\u043E-\u0442\u043E \u043F\u043E\u0448\u043B\u043E \u043D\u0435 \u0442\u0430\u043A. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0435\u0449\u0451 \u0440\u0430\u0437."
      };
  }
}
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "CartCrossSell",
  __ssrInlineRender: true,
  props: {
    productIds: {}
  },
  setup(__props) {
    const props = __props;
    const route = useRoute();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const priceMode = computed(() => route.path.startsWith("/b2b") ? "b2b" : "retail");
    const pending = ref(false);
    const products = ref([]);
    async function load() {
      var _a;
      if (!((_a = props.productIds) == null ? void 0 : _a.length)) {
        products.value = [];
        return;
      }
      pending.value = true;
      try {
        const details = await Promise.all(
          props.productIds.slice(0, 6).map(
            (id) => $fetch(`/api/catalog/products/${id}`, { baseURL: apiBaseUrl }).catch(() => null)
          )
        );
        const slugs = Array.from(
          new Set(
            details.map((d) => {
              var _a2, _b;
              return (_b = (_a2 = d == null ? void 0 : d.product) == null ? void 0 : _a2.category) == null ? void 0 : _b.slug;
            }).filter((x) => typeof x === "string" && x.length > 0)
          )
        );
        if (!slugs.length) {
          products.value = [];
          return;
        }
        const take = slugs.slice(0, 2);
        const lists = await Promise.all(
          take.map(
            (slug) => $fetch("/api/catalog/products", {
              baseURL: apiBaseUrl,
              query: { category: slug, sort: "popularity", limit: "8", page: "1" }
            }).catch(() => ({ products: [] }))
          )
        );
        const flat = lists.flatMap((r) => Array.isArray(r == null ? void 0 : r.products) ? r.products : []);
        const exclude = new Set(props.productIds);
        const uniq = [];
        const seen = /* @__PURE__ */ new Set();
        for (const p of flat) {
          if (!(p == null ? void 0 : p.id)) continue;
          if (exclude.has(p.id)) continue;
          if (seen.has(p.id)) continue;
          seen.add(p.id);
          uniq.push(p);
          if (uniq.length >= 6) break;
        }
        products.value = uniq;
      } finally {
        pending.value = false;
      }
    }
    watch(() => props.productIds.join(","), load);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProductCardSkeleton = __nuxt_component_4;
      const _component_ProductCard = _sfc_main$3;
      if (unref(pending) || unref(products).length) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}><h2 class="text-base font-semibold">\u0421 \u044D\u0442\u0438\u043C \u043F\u043E\u043A\u0443\u043F\u0430\u044E\u0442</h2>`);
        if (unref(pending)) {
          _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3"><!--[-->`);
          ssrRenderList(6, (n) => {
            _push(ssrRenderComponent(_component_ProductCardSkeleton, { key: n }, null, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3"><!--[-->`);
          ssrRenderList(unref(products), (p) => {
            _push(ssrRenderComponent(_component_ProductCard, {
              key: p.id,
              product: p,
              mode: unref(priceMode),
              prefetch: true
            }, null, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CartCrossSell.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CartSummary",
  __ssrInlineRender: true,
  props: {
    itemsCount: {},
    subtotal: {}
  },
  setup(__props) {
    const props = __props;
    const state = reactive({
      delivery: "pickup",
      payment: "card"
    });
    function save() {
      return;
    }
    watch(state, save, { deep: true });
    const deliveryPrice = computed(() => {
      if (state.delivery === "pickup") return 0;
      return props.subtotal >= 5e3 ? 0 : 390;
    });
    const total = computed(() => props.subtotal + deliveryPrice.value);
    const deliveryLabel = computed(() => state.delivery === "pickup" ? "\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437" : "\u041A\u0443\u0440\u044C\u0435\u0440");
    const paymentLabel = computed(() => state.payment === "card" ? "\u041A\u0430\u0440\u0442\u0430" : "\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "space-y-4 rounded-lg border border-gray-200 bg-white p-4 text-sm" }, _attrs))}><div class="flex items-center justify-between"><h2 class="text-sm font-semibold">\u0420\u0435\u0437\u044E\u043C\u0435</h2><span class="text-[11px] text-gray-500">${ssrInterpolate(__props.itemsCount)} \u0448\u0442.</span></div><div class="space-y-2"><p class="text-xs font-medium text-gray-700">\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430</p><div class="grid gap-2"><label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"><span class="text-sm">\u0421\u0430\u043C\u043E\u0432\u044B\u0432\u043E\u0437</span><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(state).delivery, "pickup")) ? " checked" : ""} type="radio" value="pickup"></label><label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"><span class="text-sm">\u041A\u0443\u0440\u044C\u0435\u0440</span><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(state).delivery, "courier")) ? " checked" : ""} type="radio" value="courier"></label><p class="text-[11px] text-gray-500"> \u041A\u0443\u0440\u044C\u0435\u0440: \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E \u043E\u0442 5000 \u20BD, \u0438\u043D\u0430\u0447\u0435 390 \u20BD. </p></div></div><div class="space-y-2"><p class="text-xs font-medium text-gray-700">\u041E\u043F\u043B\u0430\u0442\u0430</p><div class="grid gap-2"><label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"><span class="text-sm">\u041A\u0430\u0440\u0442\u0430</span><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(state).payment, "card")) ? " checked" : ""} type="radio" value="card"></label><label class="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"><span class="text-sm">\u041D\u0430\u043B\u0438\u0447\u043D\u044B\u0435</span><input${ssrIncludeBooleanAttr(ssrLooseEqual(unref(state).payment, "cash")) ? " checked" : ""} type="radio" value="cash"></label></div></div><div class="space-y-2 border-t border-gray-100 pt-3"><div class="flex justify-between text-xs text-gray-600"><span>\u0422\u043E\u0432\u0430\u0440\u044B</span><span>${ssrInterpolate(__props.subtotal)} \u20BD</span></div><div class="flex justify-between text-xs text-gray-600"><span>\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430 (${ssrInterpolate(unref(deliveryLabel))})</span><span>${ssrInterpolate(unref(deliveryPrice))} \u20BD</span></div><div class="flex justify-between text-base font-semibold"><span>\u0418\u0442\u043E\u0433\u043E</span><span>${ssrInterpolate(unref(total))} \u20BD</span></div><p class="text-[11px] text-gray-500"> \u0412\u044B\u0431\u0440\u0430\u043D\u043E: ${ssrInterpolate(unref(deliveryLabel))}, ${ssrInterpolate(unref(paymentLabel))}. </p></div>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</aside>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CartSummary.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const WHOLESALE_COEF = 0.85;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "cart",
  __ssrInlineRender: true,
  setup(__props) {
    const cartStore = useCartStore();
    const router = useRouter();
    const auth = useAuthStore();
    const config = useRuntimeConfig();
    auth.initFromStorage();
    const isLoading = ref(false);
    const preview = ref(null);
    const previewError = ref(null);
    async function loadPreview() {
      if (cartStore.isEmpty) {
        preview.value = { items: [], totals: { retail: 0, discount: 0, final: 0 }, canCheckout: false };
        return;
      }
      isLoading.value = true;
      previewError.value = null;
      try {
        const res = await $fetch("/api/cart/preview", {
          baseURL: config.public.apiBaseUrl,
          method: "POST",
          body: {
            items: cartStore.items.map((i) => ({ productId: i.product.id, quantity: i.quantity }))
          },
          headers: auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : void 0
        });
        preview.value = res;
      } catch (e) {
        previewError.value = mapErrorToUi(normalizeApiError(e));
      } finally {
        isLoading.value = false;
      }
    }
    watch(
      () => [cartStore.items.map((i) => [i.product.id, i.quantity]), auth.accessToken],
      () => {
        loadPreview();
      },
      { deep: true, immediate: true }
    );
    const items = computed(() => cartStore.items);
    const totalPrice = computed(() => {
      var _a2;
      var _a, _b;
      return (_a2 = (_b = (_a = preview.value) == null ? void 0 : _a.totals) == null ? void 0 : _b.final) != null ? _a2 : cartStore.totalPrice;
    });
    const wholesaleTotal = computed(
      () => cartStore.items.reduce((acc, item) => {
        const wp = item.product.wholesalePrice == null ? Number(item.product.price) * WHOLESALE_COEF : Number(item.product.wholesalePrice);
        return acc + wp * item.quantity;
      }, 0)
    );
    const b2bSavings = computed(() => {
      const retail = Number(totalPrice.value);
      const wholesale = Number(wholesaleTotal.value);
      const diff = retail - wholesale;
      return diff > 0 ? diff : 0;
    });
    const isEmpty = computed(() => cartStore.isEmpty);
    const productIds = computed(() => items.value.map((i) => i.product.id));
    function goToCheckout() {
      if (cartStore.isEmpty) return;
      if (preview.value && !preview.value.canCheckout) return;
      router.push("/checkout");
    }
    function statusLabel(s) {
      if (s === "in_stock") return "\u0412 \u043D\u0430\u043B\u0438\u0447\u0438\u0438";
      if (s === "made_to_order") return "\u041F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437";
      return "\u041E\u0436\u0438\u0434\u0430\u0435\u043C";
    }
    computed(() => {
      var _a2;
      var _a;
      const m = /* @__PURE__ */ new Map();
      for (const it of (_a2 = (_a = preview.value) == null ? void 0 : _a.items) != null ? _a2 : []) m.set(it.product.id, it);
      return m;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_CartCrossSell = _sfc_main$2;
      const _component_CartSummary = _sfc_main$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><header class="space-y-1"><h1 class="text-xl font-semibold">\u041A\u043E\u0440\u0437\u0438\u043D\u0430</h1><p class="text-sm text-gray-600"> \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B \u043F\u0435\u0440\u0435\u0434 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435\u043C \u0437\u0430\u043A\u0430\u0437\u0430. </p></header>`);
      if (unref(isEmpty)) {
        _push(`<div class="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-500"> \u0412\u0430\u0448\u0430 \u043A\u043E\u0440\u0437\u0438\u043D\u0430 \u043F\u0443\u0441\u0442\u0430. \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 \u0438 \u0434\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u0435 \u0442\u043E\u0432\u0430\u0440\u044B. <div class="mt-3">`);
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
        _push(`<div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start"><div class="space-y-6">`);
        if (unref(previewError)) {
          _push(`<div class="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700"><div class="font-medium">${ssrInterpolate(unref(previewError).title)}</div><div class="mt-1">${ssrInterpolate(unref(previewError).text)}</div>`);
          if (unref(previewError).action === "refresh_cart") {
            _push(`<button type="button" class="mt-2 inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-[11px] font-medium text-white"> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u043A\u043E\u0440\u0437\u0438\u043D\u0443 </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(items), (item) => {
          var _a2, _b2, _c2, _d2, _e2;
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
          _push(`<li class="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 text-sm"><div class="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50 flex items-center justify-center">`);
          if (item.product.imageUrl) {
            _push(`<img${ssrRenderAttr("src", item.product.imageUrl)}${ssrRenderAttr("alt", item.product.name)} class="h-full w-full object-cover">`);
          } else {
            _push(`<span class="text-[10px] text-gray-400"> \u041D\u0435\u0442 \u0444\u043E\u0442\u043E </span>`);
          }
          _push(`</div><div class="flex flex-1 flex-col gap-1"><div class="flex justify-between gap-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/product/${item.product.id}`,
            class: "font-medium text-gray-900 hover:text-brand line-clamp-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(item.product.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(item.product.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button type="button" class="text-[11px] text-gray-400 hover:text-red-500"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C </button></div><div class="flex flex-wrap items-center gap-2">`);
          if (item.product.article) {
            _push(`<p class="text-xs text-gray-500"> \u0410\u0440\u0442\u0438\u043A\u0443\u043B: ${ssrInterpolate(item.product.article)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span class="${ssrRenderClass([((_a2 = (_d = (_c = (_b = (_a = unref(preview)) == null ? void 0 : _a.items) == null ? void 0 : _b.find((p) => p.product.id === item.product.id)) == null ? void 0 : _c.availability) == null ? void 0 : _d.canOrder) != null ? _a2 : true) ? "border-gray-200 text-gray-600" : "border-red-200 text-red-700 bg-red-50", "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px]"])}">${ssrInterpolate(statusLabel((_b2 = (_h = (_g = (_f = (_e = unref(preview)) == null ? void 0 : _e.items) == null ? void 0 : _f.find((p) => p.product.id === item.product.id)) == null ? void 0 : _g.availability) == null ? void 0 : _h.status) != null ? _b2 : "awaiting"))}</span></div><div class="mt-1 flex items-center justify-between gap-3"><div class="inline-flex items-center rounded-full border border-gray-200 px-2 py-1 text-[11px]"><span class="mr-2 text-gray-500"> \u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E </span><input${ssrRenderAttr("value", item.quantity)} type="number" min="1" class="w-16 border-none bg-transparent text-xs outline-none"></div><div class="text-right"><p class="text-xs text-gray-500">\u0426\u0435\u043D\u0430</p><p class="text-sm font-semibold">${ssrInterpolate(Math.round((_c2 = (_l = (_k = (_j = (_i = unref(preview)) == null ? void 0 : _i.items) == null ? void 0 : _j.find((p) => p.product.id === item.product.id)) == null ? void 0 : _k.price) == null ? void 0 : _l.finalLine) != null ? _c2 : item.product.price * item.quantity))} \u20BD </p>`);
          if (((_d2 = (_p = (_o = (_n = (_m = unref(preview)) == null ? void 0 : _m.items) == null ? void 0 : _n.find((p) => p.product.id === item.product.id)) == null ? void 0 : _o.price) == null ? void 0 : _p.discountPercent) != null ? _d2 : 0) > 0) {
            _push(`<p class="text-[11px] text-gray-500"> \u0421\u043A\u0438\u0434\u043A\u0430 ${ssrInterpolate((_t = (_s = (_r = (_q = unref(preview)) == null ? void 0 : _q.items) == null ? void 0 : _r.find((p) => p.product.id === item.product.id)) == null ? void 0 : _s.price) == null ? void 0 : _t.discountPercent)}% </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
          if (!((_e2 = (_x = (_w = (_v = (_u = unref(preview)) == null ? void 0 : _u.items) == null ? void 0 : _v.find((p) => p.product.id === item.product.id)) == null ? void 0 : _w.availability) == null ? void 0 : _x.canOrder) != null ? _e2 : true)) {
            _push(`<p class="mt-2 text-[11px] text-red-600"> \u0421\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u043B\u044C\u0437\u044F \u0437\u0430\u043A\u0430\u0437\u0430\u0442\u044C \u0432 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u0435. </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></li>`);
        });
        _push(`<!--]--></ul>`);
        _push(ssrRenderComponent(_component_CartCrossSell, { "product-ids": unref(productIds) }, null, _parent));
        _push(`</div>`);
        _push(ssrRenderComponent(_component_CartSummary, {
          "items-count": unref(cartStore).totalItems,
          subtotal: unref(totalPrice)
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b;
            if (_push2) {
              if (unref(preview) && unref(preview).totals.discount > 0) {
                _push2(`<div class="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"${_scopeId}> \u0421\u043A\u0438\u0434\u043A\u0430 \u043F\u043E \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0443: \u2212${ssrInterpolate(Math.round(unref(preview).totals.discount))} \u20BD </div>`);
              } else {
                _push2(`<!---->`);
              }
              if (unref(preview) && !unref(preview).canCheckout) {
                _push2(`<div class="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"${_scopeId}> \u0412 \u043A\u043E\u0440\u0437\u0438\u043D\u0435 \u0435\u0441\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B \u0441\u043E \u0441\u0442\u0430\u0442\u0443\u0441\u043E\u043C \xAB\u041E\u0436\u0438\u0434\u0430\u0435\u043C\xBB \u0438\u043B\u0438 \u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u044B\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E\u043C \u2014 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E. </div>`);
              } else {
                _push2(`<!---->`);
              }
              if (((_a = unref(auth).user) == null ? void 0 : _a.role) !== "store" && unref(b2bSavings) > 0) {
                _push2(`<div class="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"${_scopeId}><div class="font-medium"${_scopeId}> \u041A\u0430\u043A \u043C\u0430\u0433\u0430\u0437\u0438\u043D \u0432\u044B \u0431\u044B \u0437\u0430\u043F\u043B\u0430\u0442\u0438\u043B\u0438 \u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E ${ssrInterpolate(Math.round(unref(wholesaleTotal)))} \u20BD </div><div class="mt-1 text-amber-800"${_scopeId}> \u042D\u043A\u043E\u043D\u043E\u043C\u0438\u044F \u0434\u043E ${ssrInterpolate(Math.round(unref(b2bSavings)))} \u20BD \u2014 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0439\u0442\u0435\u0441\u044C \u043A\u0430\u043A \u043C\u0430\u0433\u0430\u0437\u0438\u043D, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u043E\u043F\u0442\u043E\u0432\u044B\u0435 \u0446\u0435\u043D\u044B. </div>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: "/b2b/register",
                  class: "mt-2 inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u0421\u0442\u0430\u0442\u044C B2B `);
                    } else {
                      return [
                        createTextVNode(" \u0421\u0442\u0430\u0442\u044C B2B ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<button type="button" class="mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"${ssrIncludeBooleanAttr(unref(isEmpty) || (unref(preview) ? !unref(preview).canCheckout : false) || unref(isLoading)) ? " disabled" : ""}${_scopeId}> \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044E </button>`);
            } else {
              return [
                unref(preview) && unref(preview).totals.discount > 0 ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"
                }, " \u0421\u043A\u0438\u0434\u043A\u0430 \u043F\u043E \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0443: \u2212" + toDisplayString(Math.round(unref(preview).totals.discount)) + " \u20BD ", 1)) : createCommentVNode("", true),
                unref(preview) && !unref(preview).canCheckout ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                }, " \u0412 \u043A\u043E\u0440\u0437\u0438\u043D\u0435 \u0435\u0441\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B \u0441\u043E \u0441\u0442\u0430\u0442\u0443\u0441\u043E\u043C \xAB\u041E\u0436\u0438\u0434\u0430\u0435\u043C\xBB \u0438\u043B\u0438 \u043D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u044B\u043C \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E\u043C \u2014 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E. ")) : createCommentVNode("", true),
                ((_b = unref(auth).user) == null ? void 0 : _b.role) !== "store" && unref(b2bSavings) > 0 ? (openBlock(), createBlock("div", {
                  key: 2,
                  class: "mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"
                }, [
                  createVNode("div", { class: "font-medium" }, " \u041A\u0430\u043A \u043C\u0430\u0433\u0430\u0437\u0438\u043D \u0432\u044B \u0431\u044B \u0437\u0430\u043F\u043B\u0430\u0442\u0438\u043B\u0438 \u043F\u0440\u0438\u043C\u0435\u0440\u043D\u043E " + toDisplayString(Math.round(unref(wholesaleTotal))) + " \u20BD ", 1),
                  createVNode("div", { class: "mt-1 text-amber-800" }, " \u042D\u043A\u043E\u043D\u043E\u043C\u0438\u044F \u0434\u043E " + toDisplayString(Math.round(unref(b2bSavings))) + " \u20BD \u2014 \u0437\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0439\u0442\u0435\u0441\u044C \u043A\u0430\u043A \u043C\u0430\u0433\u0430\u0437\u0438\u043D, \u0447\u0442\u043E\u0431\u044B \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u044C \u043E\u043F\u0442\u043E\u0432\u044B\u0435 \u0446\u0435\u043D\u044B. ", 1),
                  createVNode(_component_NuxtLink, {
                    to: "/b2b/register",
                    class: "mt-2 inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u0421\u0442\u0430\u0442\u044C B2B ")
                    ]),
                    _: 1
                  })
                ])) : createCommentVNode("", true),
                createVNode("button", {
                  type: "button",
                  class: "mt-2 inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60",
                  disabled: unref(isEmpty) || (unref(preview) ? !unref(preview).canCheckout : false) || unref(isLoading),
                  onClick: goToCheckout
                }, " \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u044E ", 8, ["disabled"])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/cart.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=cart-CJPfmUVR.mjs.map
