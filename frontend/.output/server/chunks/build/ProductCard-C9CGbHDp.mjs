import { defineComponent, computed, ref, watch, unref, mergeProps, withCtx, createVNode, createBlock, openBlock, toDisplayString, createCommentVNode, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
import { a as _export_sfc, b as useRoute, u as useRuntimeConfig, _ as _sfc_main$2$1 } from './server.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$2 } from './ProductPriceBlock-DEFQ0tZW.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { u as useCartStore } from './cart-DZFIURht.mjs';
import { u as useFavoritesStore } from './favorites-CzyYdspe.mjs';

const _sfc_main$1 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<article${ssrRenderAttrs(mergeProps({ class: "animate-pulse rounded-lg border border-gray-200 bg-white p-3" }, _attrs))}><div class="aspect-square w-full rounded-md bg-gray-100"></div><div class="mt-3 space-y-2"><div class="h-3 w-4/5 rounded bg-gray-100"></div><div class="h-3 w-2/5 rounded bg-gray-100"></div><div class="h-4 w-1/2 rounded bg-gray-100"></div></div></article>`);
}
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductCardSkeleton.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProductCard",
  __ssrInlineRender: true,
  props: {
    product: {},
    view: {},
    mode: {},
    prefetch: { type: Boolean }
  },
  setup(__props) {
    const route = useRoute();
    const auth = useAuthStore();
    auth.initFromStorage();
    const cartStore = useCartStore();
    const favStore = useFavoritesStore();
    const props = __props;
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    function normalize(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return `${apiBaseUrl}${normalized}`;
    }
    const view = computed(() => {
      var _a;
      return (_a = props.view) != null ? _a : "medium";
    });
    const gallery = computed(() => {
      var _a;
      return (Array.isArray((_a = props.product) == null ? void 0 : _a.images) ? props.product.images : []).map((i) => ({ ...i, url: normalize(String((i == null ? void 0 : i.url) || "")) }));
    });
    const activeImg = ref(0);
    const hoverSegs = computed(() => {
      var _a2;
      var _a;
      const len = (_a2 = (_a = gallery.value) == null ? void 0 : _a.length) != null ? _a2 : 0;
      return Math.min(len, 5);
    });
    const activeSeg = computed(() => {
      var _a2;
      var _a;
      const len = (_a2 = (_a = gallery.value) == null ? void 0 : _a.length) != null ? _a2 : 0;
      const segs = hoverSegs.value;
      if (len <= 1 || segs <= 1) return 0;
      return Math.min(segs - 1, Math.floor(activeImg.value / (len - 1) * segs));
    });
    function setActiveByPointer(e) {
      var _a2, _b2;
      var _a, _b, _c;
      const len = (_a2 = (_a = gallery.value) == null ? void 0 : _a.length) != null ? _a2 : 0;
      const segs = hoverSegs.value;
      if (len <= 1 || segs <= 1) return;
      const el = e.currentTarget;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const clientX = (_b2 = (_c = (_b = e.touches) == null ? void 0 : _b[0]) == null ? void 0 : _c.clientX) != null ? _b2 : e.clientX;
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const seg = Math.min(segs - 1, Math.floor(x / rect.width * segs));
      const idx = Math.min(len - 1, Math.round(seg / (segs - 1) * (len - 1)));
      activeImg.value = idx;
    }
    watch(
      () => {
        var _a;
        return (_a = props.product) == null ? void 0 : _a.id;
      },
      () => {
        activeImg.value = 0;
      }
    );
    const imageUrl = computed(() => {
      var _a, _b, _c, _d;
      return ((_b = (_a = gallery.value) == null ? void 0 : _a[activeImg.value]) == null ? void 0 : _b.url) || ((_d = (_c = gallery.value) == null ? void 0 : _c[0]) == null ? void 0 : _d.url) || null;
    });
    const isB2B = computed(
      () => {
        var _a;
        return props.mode === "b2b" || route.path.startsWith("/b2b") || ((_a = auth.user) == null ? void 0 : _a.role) === "store";
      }
    );
    computed(() => isB2B.value ? "b2b" : "retail");
    const to = computed(() => {
      var _a;
      return `/product/${(_a = props.product) == null ? void 0 : _a.id}`;
    });
    const retailPrice = computed(() => {
      var _a2;
      var _a, _b;
      return (_a2 = (_a = props.product) == null ? void 0 : _a.retailPrice) != null ? _a2 : (_b = props.product) == null ? void 0 : _b.price;
    });
    const wholesalePrice = computed(() => {
      var _a2;
      var _a, _b, _c;
      if (isB2B.value && ((_b = (_a = props.product) == null ? void 0 : _a.priceInfo) == null ? void 0 : _b.final) != null) return props.product.priceInfo.final;
      const direct = (_a2 = (_c = props.product) == null ? void 0 : _c.wholesalePrice) != null ? _a2 : null;
      return direct;
    });
    const oldPrice = computed(() => {
      var _a, _b, _c, _d;
      const candidates = [
        (_a = props.product) == null ? void 0 : _a.oldPrice,
        (_b = props.product) == null ? void 0 : _b.previousPrice,
        (_c = props.product) == null ? void 0 : _c.compareAtPrice,
        (_d = props.product) == null ? void 0 : _d.retailOldPrice
      ];
      const cur = Number(retailPrice.value);
      for (const c of candidates) {
        const v = Number(c);
        if (Number.isFinite(v) && v > cur) return v;
      }
      return null;
    });
    const discountPercent = computed(() => {
      if (!oldPrice.value) return null;
      const cur = Number(retailPrice.value);
      const old = Number(oldPrice.value);
      if (!Number.isFinite(cur) || !Number.isFinite(old) || old <= 0 || old <= cur) return null;
      return Math.round((old - cur) / old * 100);
    });
    const isNew = computed(() => {
      var _a, _b;
      return Boolean(((_a = props.product) == null ? void 0 : _a.isNew) || ((_b = props.product) == null ? void 0 : _b.new));
    });
    const isPromo = computed(() => {
      var _a, _b;
      return Boolean(((_a = props.product) == null ? void 0 : _a.isPromo) || ((_b = props.product) == null ? void 0 : _b.promo));
    });
    const displayedRating = computed(() => {
      var _a;
      const api = Number((_a = props.product) == null ? void 0 : _a.rating);
      if (Number.isFinite(api) && api > 0) return Math.round(api * 10) / 10;
      return 0;
    });
    const displayedReviewCount = computed(() => {
      var _a;
      const api = Number((_a = props.product) == null ? void 0 : _a.reviewsCount);
      if (Number.isFinite(api) && api > 0) return Math.trunc(api);
      return 0;
    });
    function reviewsLabel(n) {
      const v = Math.abs(n) % 100;
      const n1 = v % 10;
      if (v > 10 && v < 20) return "\u043E\u0442\u0437\u044B\u0432\u043E\u0432";
      if (n1 > 1 && n1 < 5) return "\u043E\u0442\u0437\u044B\u0432\u0430";
      if (n1 === 1) return "\u043E\u0442\u0437\u044B\u0432";
      return "\u043E\u0442\u0437\u044B\u0432\u043E\u0432";
    }
    const isFav = computed(() => {
      var _a;
      return favStore.isFavorite(Number((_a = props.product) == null ? void 0 : _a.id));
    });
    function toSnapshot() {
      var _a2, _b2;
      var _a, _b, _c, _d, _e, _f;
      return {
        id: Number(props.product.id),
        name: String(props.product.name || ""),
        price: Number(props.product.price),
        wholesalePrice: props.product.wholesalePrice == null ? null : Number(props.product.wholesalePrice),
        article: props.product.article,
        imageUrl: ((_b = (_a = gallery.value) == null ? void 0 : _a[0]) == null ? void 0 : _b.url) || null,
        categorySlug: (_a2 = (_d = (_c = props.product) == null ? void 0 : _c.category) == null ? void 0 : _d.slug) != null ? _a2 : null,
        categoryName: (_b2 = (_f = (_e = props.product) == null ? void 0 : _e.category) == null ? void 0 : _f.name) != null ? _b2 : null
      };
    }
    const qty = computed(() => {
      var _a2;
      var _a;
      const id = Number((_a = props.product) == null ? void 0 : _a.id);
      const it = cartStore.items.find((i) => i.product.id === id);
      return (_a2 = it == null ? void 0 : it.quantity) != null ? _a2 : 0;
    });
    function addFirst(e) {
      e == null ? void 0 : e.preventDefault();
      e == null ? void 0 : e.stopPropagation();
      cartStore.addItem(toSnapshot(), 1);
    }
    const cardBase = computed(() => {
      return "group relative rounded-xl border border-gray-200 bg-white text-sm transition hover:border-slate-300 hover:shadow-sm";
    });
    const pad = computed(() => view.value === "large" ? "p-3" : view.value === "medium" ? "p-3" : "p-3");
    const imageWrapClass = computed(() => {
      if (view.value === "large") return "aspect-square";
      if (view.value === "medium") return "aspect-square";
      return "h-16 w-16 aspect-square";
    });
    const titleClass = computed(() => {
      if (view.value === "large") return "text-[15px] font-medium text-gray-900 line-clamp-2";
      if (view.value === "medium") return "text-[14px] font-medium text-gray-900 line-clamp-2";
      return "text-[14px] font-medium text-gray-900 line-clamp-2";
    });
    computed(() => {
      if (view.value === "large") return "text-lg font-semibold text-gray-900";
      if (view.value === "medium") return "text-base font-semibold text-gray-900";
      return "text-base font-semibold text-gray-900";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ProductPriceBlock = _sfc_main$2;
      const _component_BaseButton = _sfc_main$2$1;
      if (unref(view) === "list") {
        _push(`<article${ssrRenderAttrs(mergeProps({
          class: [unref(cardBase), unref(pad)]
        }, _attrs))}><div class="flex gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(to),
          prefetch: __props.prefetch,
          class: "flex gap-3 flex-1 min-w-0"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b, _c, _d;
            if (_push2) {
              _push2(`<div class="${ssrRenderClass([unref(imageWrapClass), "flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center"])}"${_scopeId}>`);
              if (unref(imageUrl)) {
                _push2(`<img${ssrRenderAttr("src", unref(imageUrl))}${ssrRenderAttr("alt", __props.product.name)} class="h-full w-full object-cover" loading="lazy"${_scopeId}>`);
              } else {
                _push2(`<div class="text-[11px] text-gray-400"${_scopeId}>\u041D\u0435\u0442 \u0444\u043E\u0442\u043E</div>`);
              }
              _push2(`</div><div class="min-w-0"${_scopeId}><p class="${ssrRenderClass(unref(titleClass))}"${_scopeId}>${ssrInterpolate(__props.product.name)}</p><div class="mt-1 space-y-0.5"${_scopeId}>`);
              if ((_a = __props.product.category) == null ? void 0 : _a.name) {
                _push2(`<p class="text-xs text-gray-500"${_scopeId}>${ssrInterpolate((_b = __props.product.category) == null ? void 0 : _b.name)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              if (__props.product.article) {
                _push2(`<p class="text-[11px] text-gray-400"${_scopeId}>\u0410\u0440\u0442: ${ssrInterpolate(__props.product.article)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            } else {
              return [
                createVNode("div", {
                  class: ["flex-shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center", unref(imageWrapClass)]
                }, [
                  unref(imageUrl) ? (openBlock(), createBlock("img", {
                    key: 0,
                    src: unref(imageUrl),
                    alt: __props.product.name,
                    class: "h-full w-full object-cover",
                    loading: "lazy"
                  }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-[11px] text-gray-400"
                  }, "\u041D\u0435\u0442 \u0444\u043E\u0442\u043E"))
                ], 2),
                createVNode("div", { class: "min-w-0" }, [
                  createVNode("p", { class: unref(titleClass) }, toDisplayString(__props.product.name), 3),
                  createVNode("div", { class: "mt-1 space-y-0.5" }, [
                    ((_c = __props.product.category) == null ? void 0 : _c.name) ? (openBlock(), createBlock("p", {
                      key: 0,
                      class: "text-xs text-gray-500"
                    }, toDisplayString((_d = __props.product.category) == null ? void 0 : _d.name), 1)) : createCommentVNode("", true),
                    __props.product.article ? (openBlock(), createBlock("p", {
                      key: 1,
                      class: "text-[11px] text-gray-400"
                    }, "\u0410\u0440\u0442: " + toDisplayString(__props.product.article), 1)) : createCommentVNode("", true)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="w-36 flex-shrink-0 flex flex-col items-end gap-2"><div class="text-right w-full">`);
        _push(ssrRenderComponent(_component_ProductPriceBlock, {
          "retail-price": unref(retailPrice),
          "wholesale-price": unref(wholesalePrice),
          compact: ""
        }, null, _parent));
        _push(`</div><div class="flex items-center justify-end gap-2">`);
        if (unref(displayedRating)) {
          _push(`<div class="flex items-center gap-1 text-xs text-gray-600"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 17.3l-6.18 3.25 1.18-6.9L1.99 8.8l6.92-1L12 1.5l3.09 6.3 6.92 1-5.01 4.85 1.18 6.9z"></path></svg><span class="font-medium text-gray-800">${ssrInterpolate(unref(displayedRating))}</span>`);
          if (unref(displayedReviewCount)) {
            _push(`<span class="text-gray-400">\u2022 ${ssrInterpolate(unref(displayedReviewCount))} ${ssrInterpolate(reviewsLabel(unref(displayedReviewCount)))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-slate-300"${ssrRenderAttr("title", unref(isFav) ? "\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E" : "\u0412 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435")}><svg viewBox="0 0 24 24" class="h-4 w-4"${ssrRenderAttr("fill", unref(isFav) ? "currentColor" : "none")} stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-4.6-9.5-9.1C.6 8.2 2.4 5 5.8 5c2 0 3.3 1.1 4.2 2.2C10.9 6.1 12.2 5 14.2 5c3.4 0 5.2 3.2 3.3 6.9C19 16.4 12 21 12 21z"></path></svg></button></div><div class="w-full flex justify-end">`);
        if (unref(qty) === 0) {
          _push(`<div class="w-full">`);
          _push(ssrRenderComponent(_component_BaseButton, {
            variant: "primary",
            size: "sm",
            "full-width": "",
            onClick: addFirst
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
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="inline-flex items-center overflow-hidden rounded-full border border-gray-200 bg-white"><button type="button" class="h-9 w-10 hover:bg-gray-50">\u2212</button><div class="h-9 min-w-[2.5rem] flex items-center justify-center text-sm font-medium text-gray-900">${ssrInterpolate(unref(qty))}</div><button type="button" class="h-9 w-10 hover:bg-gray-50">+</button></div>`);
        }
        _push(`</div></div></div></article>`);
      } else {
        _push(`<article${ssrRenderAttrs(mergeProps({
          class: [unref(cardBase), unref(pad), "flex flex-col"]
        }, _attrs))}><div class="absolute left-2 top-2 z-10 flex items-center gap-2"><button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white/95 backdrop-blur hover:bg-white"${ssrRenderAttr("title", unref(isFav) ? "\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E" : "\u0412 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435")}><svg viewBox="0 0 24 24" class="h-4 w-4"${ssrRenderAttr("fill", unref(isFav) ? "currentColor" : "none")} stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-4.6-9.5-9.1C.6 8.2 2.4 5 5.8 5c2 0 3.3 1.1 4.2 2.2C10.9 6.1 12.2 5 14.2 5c3.4 0 5.2 3.2 3.3 6.9C19 16.4 12 21 12 21z"></path></svg></button></div><div class="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">`);
        if (unref(discountPercent)) {
          _push(`<span class="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700"> \u2212${ssrInterpolate(unref(discountPercent))}% </span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isNew)) {
          _push(`<span class="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">New</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isPromo)) {
          _push(`<span class="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-700">\u0410\u043A\u0446\u0438\u044F</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(to),
          prefetch: __props.prefetch,
          class: "space-y-2"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a, _b, _c, _d;
            if (_push2) {
              _push2(`<div class="${ssrRenderClass(["aspect-square", "relative w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center"])}"${_scopeId}>`);
              if (unref(imageUrl)) {
                _push2(`<img${ssrRenderAttr("src", unref(imageUrl))}${ssrRenderAttr("alt", __props.product.name)} class="h-full w-full object-cover" loading="lazy"${_scopeId}>`);
              } else {
                _push2(`<div class="text-[11px] text-gray-400"${_scopeId}>\u041D\u0435\u0442 \u0444\u043E\u0442\u043E</div>`);
              }
              if (unref(gallery).length > 1) {
                _push2(`<div class="pointer-events-none absolute left-2 right-2 top-2 flex gap-1"${_scopeId}><!--[-->`);
                ssrRenderList(unref(hoverSegs), (n) => {
                  _push2(`<span class="${ssrRenderClass([n - 1 === unref(activeSeg) ? "bg-slate-900/80" : "bg-white/70", "h-1 flex-1 rounded-full"])}"${_scopeId}></span>`);
                });
                _push2(`<!--]--></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div><div class="space-y-1"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_ProductPriceBlock, {
                "retail-price": unref(retailPrice),
                "wholesale-price": unref(wholesalePrice)
              }, null, _parent2, _scopeId));
              _push2(`<p class="${ssrRenderClass(unref(titleClass))}"${_scopeId}>${ssrInterpolate(__props.product.name)}</p>`);
              if (__props.product.article) {
                _push2(`<p class="text-[11px] text-gray-400"${_scopeId}>\u0410\u0440\u0442: ${ssrInterpolate(__props.product.article)}</p>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<div class="flex items-center justify-between gap-2"${_scopeId}><div class="flex items-center gap-1 text-xs text-gray-600"${_scopeId}>`);
              if (unref(displayedRating)) {
                _push2(`<!--[--><svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true"${_scopeId}><path d="M12 17.3l-6.18 3.25 1.18-6.9L1.99 8.8l6.92-1L12 1.5l3.09 6.3 6.92 1-5.01 4.85 1.18 6.9z"${_scopeId}></path></svg><span class="font-medium text-gray-800"${_scopeId}>${ssrInterpolate(unref(displayedRating))}</span>`);
                if (unref(displayedReviewCount)) {
                  _push2(`<span class="text-gray-400"${_scopeId}>\u2022 ${ssrInterpolate(unref(displayedReviewCount))} ${ssrInterpolate(reviewsLabel(unref(displayedReviewCount)))}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<!--]-->`);
              } else {
                _push2(`<span class="text-gray-400"${_scopeId}>\u2014</span>`);
              }
              _push2(`</div>`);
              if (((_a = __props.product.category) == null ? void 0 : _a.name) && unref(view) === "medium") {
                _push2(`<span class="text-[11px] text-gray-400 truncate"${_scopeId}>${ssrInterpolate((_b = __props.product.category) == null ? void 0 : _b.name)}</span>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div></div>`);
            } else {
              return [
                createVNode("div", {
                  class: ["relative w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50 flex items-center justify-center", "aspect-square"],
                  onMousemove: setActiveByPointer,
                  onTouchmovePassive: setActiveByPointer,
                  onMouseleave: ($event) => activeImg.value = 0
                }, [
                  unref(imageUrl) ? (openBlock(), createBlock("img", {
                    key: 0,
                    src: unref(imageUrl),
                    alt: __props.product.name,
                    class: "h-full w-full object-cover",
                    loading: "lazy"
                  }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                    key: 1,
                    class: "text-[11px] text-gray-400"
                  }, "\u041D\u0435\u0442 \u0444\u043E\u0442\u043E")),
                  unref(gallery).length > 1 ? (openBlock(), createBlock("div", {
                    key: 2,
                    class: "pointer-events-none absolute left-2 right-2 top-2 flex gap-1"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList(unref(hoverSegs), (n) => {
                      return openBlock(), createBlock("span", {
                        key: n,
                        class: ["h-1 flex-1 rounded-full", n - 1 === unref(activeSeg) ? "bg-slate-900/80" : "bg-white/70"]
                      }, null, 2);
                    }), 128))
                  ])) : createCommentVNode("", true)
                ], 40, ["onMouseleave"]),
                createVNode("div", { class: "space-y-1" }, [
                  createVNode(_component_ProductPriceBlock, {
                    "retail-price": unref(retailPrice),
                    "wholesale-price": unref(wholesalePrice)
                  }, null, 8, ["retail-price", "wholesale-price"]),
                  createVNode("p", { class: unref(titleClass) }, toDisplayString(__props.product.name), 3),
                  __props.product.article ? (openBlock(), createBlock("p", {
                    key: 0,
                    class: "text-[11px] text-gray-400"
                  }, "\u0410\u0440\u0442: " + toDisplayString(__props.product.article), 1)) : createCommentVNode("", true),
                  createVNode("div", { class: "flex items-center justify-between gap-2" }, [
                    createVNode("div", { class: "flex items-center gap-1 text-xs text-gray-600" }, [
                      unref(displayedRating) ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                        (openBlock(), createBlock("svg", {
                          viewBox: "0 0 24 24",
                          class: "h-4 w-4",
                          fill: "currentColor",
                          "aria-hidden": "true"
                        }, [
                          createVNode("path", { d: "M12 17.3l-6.18 3.25 1.18-6.9L1.99 8.8l6.92-1L12 1.5l3.09 6.3 6.92 1-5.01 4.85 1.18 6.9z" })
                        ])),
                        createVNode("span", { class: "font-medium text-gray-800" }, toDisplayString(unref(displayedRating)), 1),
                        unref(displayedReviewCount) ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "text-gray-400"
                        }, "\u2022 " + toDisplayString(unref(displayedReviewCount)) + " " + toDisplayString(reviewsLabel(unref(displayedReviewCount))), 1)) : createCommentVNode("", true)
                      ], 64)) : (openBlock(), createBlock("span", {
                        key: 1,
                        class: "text-gray-400"
                      }, "\u2014"))
                    ]),
                    ((_c = __props.product.category) == null ? void 0 : _c.name) && unref(view) === "medium" ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-[11px] text-gray-400 truncate"
                    }, toDisplayString((_d = __props.product.category) == null ? void 0 : _d.name), 1)) : createCommentVNode("", true)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="mt-auto pt-2">`);
        if (unref(qty) === 0) {
          _push(`<div>`);
          _push(ssrRenderComponent(_component_BaseButton, {
            variant: "primary",
            size: "md",
            "full-width": "",
            onClick: addFirst
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
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<div class="inline-flex w-full items-center justify-between overflow-hidden rounded-full border border-gray-200 bg-white"><button type="button" class="h-10 w-12 hover:bg-gray-50">\u2212</button><div class="h-10 flex-1 flex items-center justify-center text-sm font-semibold text-gray-900">${ssrInterpolate(unref(qty))}</div><button type="button" class="h-10 w-12 hover:bg-gray-50">+</button></div>`);
        }
        _push(`</div></article>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { __nuxt_component_4 as _, _sfc_main as a };
//# sourceMappingURL=ProductCard-C9CGbHDp.mjs.map
