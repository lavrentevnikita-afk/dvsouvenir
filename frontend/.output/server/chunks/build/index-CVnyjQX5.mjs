import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, mergeProps, unref, withCtx, createTextVNode, ref, watch, createVNode, createBlock, openBlock, toDisplayString, withAsyncContext, useSSRContext } from 'vue';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { a as useNuxtData, u as useAsyncData } from './asyncData-D0yoREPk.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderClass, ssrRenderAttr } from 'vue/server-renderer';
import { a as _export_sfc, u as useRuntimeConfig } from './server.mjs';
import { _ as __nuxt_component_4 } from './ProductCard-C9CGbHDp.mjs';
import { u as useRecentlyViewedCategories } from './useRecentlyViewedCategories-B28JlI2v.mjs';
import { _ as _sfc_main$5 } from './ProductCardGrid-ov3JW6gY.mjs';
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
import './ProductPriceBlock-DEFQ0tZW.mjs';
import './cart-DZFIURht.mjs';
import './favorites-CzyYdspe.mjs';

const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "PromoCarousel",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { data } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("promo-banners", () => $fetch("/api/content/promo-banners"))), __temp = await __temp, __restore(), __temp);
    const banners = computed(() => {
      var _a2;
      var _a;
      return ((_a2 = (_a = data.value) == null ? void 0 : _a.banners) != null ? _a2 : []).filter((b) => !!b.imageUrl);
    });
    const idx = ref(0);
    const hasMany = computed(() => banners.value.length > 1);
    let timer;
    watch(
      () => banners.value.length,
      () => {
        idx.value = 0;
        if (timer) clearInterval(timer);
        if (banners.value.length > 1) timer = setInterval();
      }
    );
    function imgUrl(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      return url.startsWith("/") ? url : `/${url}`;
    }
    const prevIndex = computed(() => {
      if (!banners.value.length) return 0;
      return (idx.value - 1 + banners.value.length) % banners.value.length;
    });
    const nextIndex = computed(() => {
      if (!banners.value.length) return 0;
      return (idx.value + 1) % banners.value.length;
    });
    function posClass(i) {
      if (i === idx.value) return "is-active";
      if (i === prevIndex.value) return "is-prev";
      if (i === nextIndex.value) return "is-next";
      return "is-hidden";
    }
    return (_ctx, _push, _parent, _attrs) => {
      if (unref(banners).length) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "w-full px-4 pt-3 pb-4" }, _attrs))} data-v-e1788ac9><div class="mx-auto w-full max-w-[1440px]" data-v-e1788ac9><div class="relative rounded-3xl bg-slate-900/80 border border-white/10 shadow-sm" data-v-e1788ac9><div class="relative overflow-hidden rounded-3xl" data-v-e1788ac9><div class="promo-viewport h-[170px] sm:h-[220px]" data-v-e1788ac9><!--[-->`);
        ssrRenderList(unref(banners), (b, i) => {
          _push(`<div class="${ssrRenderClass([posClass(i), "promo-slide"])}" data-v-e1788ac9><button type="button" class="${ssrRenderClass([b.linkUrl ? "cursor-pointer" : "cursor-default", "block h-full w-full"])}" data-v-e1788ac9><img${ssrRenderAttr("src", imgUrl(b.imageUrl))}${ssrRenderAttr("alt", b.title || "\u041F\u0440\u043E\u043C\u043E")} class="h-full w-full object-cover" loading="lazy" data-v-e1788ac9></button></div>`);
        });
        _push(`<!--]--><div class="pointer-events-none absolute inset-0" data-v-e1788ac9><div class="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black/60 via-black/25 to-transparent" data-v-e1788ac9></div><div class="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black/60 via-black/25 to-transparent" data-v-e1788ac9></div></div></div></div>`);
        if (unref(hasMany)) {
          _push(`<button type="button" class="promo-arrow left" aria-label="\u041D\u0430\u0437\u0430\u0434" data-v-e1788ac9><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" data-v-e1788ac9><path stroke-linecap="round" stroke-linejoin="round" d="M15 18l-6-6 6-6" data-v-e1788ac9></path></svg></button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(hasMany)) {
          _push(`<button type="button" class="promo-arrow right" aria-label="\u0412\u043F\u0435\u0440\u0451\u0434" data-v-e1788ac9><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.5" data-v-e1788ac9><path stroke-linecap="round" stroke-linejoin="round" d="M9 18l6-6-6-6" data-v-e1788ac9></path></svg></button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(hasMany)) {
          _push(`<div class="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2" data-v-e1788ac9><!--[-->`);
          ssrRenderList(unref(banners), (_, i) => {
            _push(`<button type="button" class="${ssrRenderClass([i === unref(idx) ? "bg-white" : "bg-white/50 hover:bg-white/70", "h-2 w-2 rounded-full"])}"${ssrRenderAttr("aria-label", `\u0421\u043B\u0430\u0439\u0434 ${i + 1}`)} data-v-e1788ac9></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></section>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/PromoCarousel.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const PromoCarousel = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-e1788ac9"]]);
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "HomeCategoriesMega",
  __ssrInlineRender: true,
  props: {
    categories: {}
  },
  setup(__props) {
    var _a2;
    var _a, _b;
    const props = __props;
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const activeSlug = ref((_a2 = (_b = (_a = props.categories) == null ? void 0 : _a[0]) == null ? void 0 : _b.slug) != null ? _a2 : null);
    watch(
      () => props.categories,
      (v) => {
        if (!v || v.length === 0) {
          activeSlug.value = null;
          return;
        }
        if (!activeSlug.value || !v.find((c) => c.slug === activeSlug.value)) {
          activeSlug.value = v[0].slug;
        }
      },
      { immediate: true }
    );
    const activeCategory = computed(() => {
      var _a3;
      if (!activeSlug.value) return null;
      return (_a3 = props.categories.find((c) => c.slug === activeSlug.value)) != null ? _a3 : null;
    });
    function imgUrl(url) {
      if (!url) return null;
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      if (url.startsWith("/")) return `${apiBaseUrl}${url}`;
      return `${apiBaseUrl}/${url}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a3, _b2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "" }, _attrs))}><h2 class="text-3xl font-bold tracking-tight mb-4"> \u041C\u0438\u043B\u043B\u0438\u043E\u043D \u0442\u043E\u0432\u0430\u0440\u043E\u0432, \u0441\u043E\u0442\u043D\u0438 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u2014 \u043E\u0434\u0438\u043D \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A </h2><div class="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"><div class="grid grid-cols-12"><aside class="col-span-12 md:col-span-4 lg:col-span-3 bg-gray-50 border-r border-gray-200"><ul class="p-3 space-y-1"><!--[-->`);
      ssrRenderList(__props.categories, (c) => {
        _push(`<li class=""><button type="button" class="${ssrRenderClass([unref(activeSlug) === c.slug ? "bg-white shadow-sm border border-gray-200" : "hover:bg-white/70", "w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition"])}"><span class="shrink-0 h-8 w-8 rounded-lg bg-white border border-gray-200 grid place-items-center overflow-hidden">`);
        if (imgUrl(c.imageUrl)) {
          _push(`<img${ssrRenderAttr("src", imgUrl(c.imageUrl))}${ssrRenderAttr("alt", c.name)} class="h-full w-full object-cover">`);
        } else {
          _push(`<span class="text-xs font-semibold text-gray-500">${ssrInterpolate(c.name.slice(0, 1))}</span>`);
        }
        _push(`</span><span class="flex-1 min-w-0"><span class="block truncate text-sm font-medium text-gray-900">${ssrInterpolate(c.name)}</span>`);
        if (typeof c.productsCount === "number") {
          _push(`<span class="block text-xs text-gray-500">${ssrInterpolate(c.productsCount)} \u0442\u043E\u0432\u0430\u0440\u043E\u0432 </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</span><span class="text-gray-300">\u203A</span></button></li>`);
      });
      _push(`<!--]--></ul></aside><div class="col-span-12 md:col-span-8 lg:col-span-9 p-4">`);
      if (!unref(activeCategory)) {
        _push(`<div class="text-sm text-gray-500"> \u041D\u0435\u0442 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u0434\u043B\u044F \u043F\u043E\u043A\u0430\u0437\u0430 </div>`);
      } else {
        _push(`<div><div class="flex items-baseline justify-between mb-4"><div class=""><div class="text-lg font-semibold text-gray-900">${ssrInterpolate(unref(activeCategory).name)}</div><div class="text-xs text-gray-500">\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E</div></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/catalog/${unref(activeCategory).slug}`,
          class: "text-xs font-medium text-brand hover:underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E \u2192 `);
            } else {
              return [
                createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E \u2192 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"><!--[-->`);
        ssrRenderList((_a3 = unref(activeCategory).children) != null ? _a3 : [], (sc) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: sc.slug,
            to: `/catalog/${sc.slug}`,
            class: "group"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="rounded-2xl bg-gray-50 border border-gray-200 p-3 flex flex-col items-center text-center hover:bg-white hover:shadow-sm transition"${_scopeId}><div class="h-24 w-24 rounded-full bg-white border border-gray-200 overflow-hidden grid place-items-center"${_scopeId}>`);
                if (imgUrl(sc.imageUrl)) {
                  _push2(`<img${ssrRenderAttr("src", imgUrl(sc.imageUrl))}${ssrRenderAttr("alt", sc.name)} class="h-full w-full object-cover"${_scopeId}>`);
                } else {
                  _push2(`<span class="text-sm font-semibold text-gray-500"${_scopeId}>${ssrInterpolate(sc.name.slice(0, 1))}</span>`);
                }
                _push2(`</div><div class="mt-3 text-xs font-medium text-gray-900 line-clamp-2"${_scopeId}>${ssrInterpolate(sc.name)}</div></div>`);
              } else {
                return [
                  createVNode("div", { class: "rounded-2xl bg-gray-50 border border-gray-200 p-3 flex flex-col items-center text-center hover:bg-white hover:shadow-sm transition" }, [
                    createVNode("div", { class: "h-24 w-24 rounded-full bg-white border border-gray-200 overflow-hidden grid place-items-center" }, [
                      imgUrl(sc.imageUrl) ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: imgUrl(sc.imageUrl),
                        alt: sc.name,
                        class: "h-full w-full object-cover"
                      }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("span", {
                        key: 1,
                        class: "text-sm font-semibold text-gray-500"
                      }, toDisplayString(sc.name.slice(0, 1)), 1))
                    ]),
                    createVNode("div", { class: "mt-3 text-xs font-medium text-gray-900 line-clamp-2" }, toDisplayString(sc.name), 1)
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
        if (((_b2 = unref(activeCategory).children) != null ? _b2 : []).length === 0) {
          _push(`<div class="text-sm text-gray-500"> \u0423 \u044D\u0442\u043E\u0439 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div></div></div></section>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HomeCategoriesMega.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "HomePersonalizedProducts",
  __ssrInlineRender: true,
  props: {
    title: {},
    limit: {}
  },
  setup(__props) {
    const props = __props;
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    const auth = useAuthStore();
    auth.initFromStorage();
    const mode = computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "store" ? "b2b" : "retail";
    });
    const { items: recentCats } = useRecentlyViewedCategories();
    const title = computed(() => {
      var _a;
      return (_a = props.title) != null ? _a : "\u041E\u0431\u0440\u0430\u0442\u0438\u0442\u0435 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u0435";
    });
    computed(() => {
      var _a;
      return (_a = props.limit) != null ? _a : 12;
    });
    const products = ref([]);
    const pending = ref(false);
    const fetchPersonalized = async () => {
      return;
    };
    watch(
      () => recentCats.value.map((x) => x.slug).join("|"),
      () => fetchPersonalized()
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ProductCardSkeleton = __nuxt_component_4;
      if (unref(products).length || unref(pending)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="flex items-end justify-between gap-3"><h2 class="text-2xl font-semibold tracking-tight">${ssrInterpolate(unref(title))}</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/catalog",
          class: "text-xs text-gray-500 hover:text-gray-800"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u2192 `);
            } else {
              return [
                createTextVNode(" \u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u2192 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(pending)) {
          _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5"><!--[-->`);
          ssrRenderList(10, (i) => {
            _push(ssrRenderComponent(_component_ProductCardSkeleton, { key: i }, null, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(ssrRenderComponent(_sfc_main$5, {
            products: unref(products),
            mode: unref(mode),
            view: "medium",
            prefetch: false
          }, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HomePersonalizedProducts.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "HomeCategoryProducts",
  __ssrInlineRender: true,
  props: {
    category: {},
    limit: {}
  },
  setup(__props) {
    const props = __props;
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const auth = useAuthStore();
    auth.initFromStorage();
    const mode = computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "store" ? "b2b" : "retail";
    });
    const limit = computed(() => {
      var _a;
      return (_a = props.limit) != null ? _a : 12;
    });
    const products = ref([]);
    const pending = ref(false);
    async function fetchCategoryProducts() {
      var _a;
      const slug = String(((_a = props.category) == null ? void 0 : _a.slug) || "").trim();
      if (!slug) {
        products.value = [];
        return;
      }
      pending.value = true;
      try {
        const res = await $fetch("/api/catalog/products", {
          baseURL: apiBaseUrl,
          query: {
            category: slug,
            limit: limit.value,
            page: 1
          }
        }).catch(() => ({ products: [] }));
        products.value = Array.isArray(res == null ? void 0 : res.products) ? res.products : [];
      } finally {
        pending.value = false;
      }
    }
    watch(
      () => {
        var _a;
        return (_a = props.category) == null ? void 0 : _a.slug;
      },
      () => fetchCategoryProducts(),
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ProductCardSkeleton = __nuxt_component_4;
      if (unref(products).length || unref(pending)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="flex items-end justify-between gap-3"><h2 class="text-2xl font-semibold tracking-tight">${ssrInterpolate(__props.category.name)}</h2>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/catalog/${__props.category.slug}`,
          class: "text-xs text-gray-500 hover:text-gray-800"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u2192 `);
            } else {
              return [
                createTextVNode(" \u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u2192 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(pending)) {
          _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5"><!--[-->`);
          ssrRenderList(10, (i) => {
            _push(ssrRenderComponent(_component_ProductCardSkeleton, { key: i }, null, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(ssrRenderComponent(_sfc_main$5, {
            products: unref(products),
            mode: unref(mode),
            view: "medium",
            prefetch: false
          }, null, _parent));
        }
        _push(`</section>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/HomeCategoryProducts.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const { data: headerCategories } = useNuxtData("header-categories");
    const categoriesTree = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = headerCategories.value) == null ? void 0 : _a.categories) != null ? _a2 : [];
    });
    function flattenCategories(tree) {
      const out = [];
      const stack = Array.isArray(tree) ? [...tree] : [];
      while (stack.length) {
        const n = stack.shift();
        if (!n) continue;
        out.push(n);
        if (Array.isArray(n.children) && n.children.length) stack.push(...n.children);
      }
      return out;
    }
    const featuredCategories = computed(() => {
      const flat = flattenCategories(categoriesTree.value);
      return flat.filter((c) => (c == null ? void 0 : c.slug) && String(c.slug).trim() && Number(c.productsCount || 0) > 0).sort((a, b) => Number(b.productsCount || 0) - Number(a.productsCount || 0)).slice(0, 3).map((c) => ({ id: c.id, slug: c.slug, name: c.name }));
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(PromoCarousel, null, null, _parent));
      if (unref(categoriesTree).length) {
        _push(ssrRenderComponent(_sfc_main$3, { categories: unref(categoriesTree) }, null, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_sfc_main$2, null, null, _parent));
      _push(`<!--[-->`);
      ssrRenderList(unref(featuredCategories), (c) => {
        _push(ssrRenderComponent(_sfc_main$1, {
          key: c.slug,
          category: c,
          limit: 12
        }, null, _parent));
      });
      _push(`<!--]--><footer class="mt-12 border-t border-slate-200 pt-8 pb-6"><div class="grid grid-cols-1 md:grid-cols-4 gap-8"><div class="md:col-span-1"><div class="text-lg font-bold text-slate-900 mb-2">Souvenir Shop</div><p class="text-sm text-slate-500 leading-relaxed"> \u041A\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0441\u0443\u0432\u0435\u043D\u0438\u0440\u044B \u0438 \u043F\u043E\u0434\u0430\u0440\u043A\u0438 \u0434\u043B\u044F \u0440\u043E\u0437\u043D\u0438\u0447\u043D\u044B\u0445 \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u0435\u0439 \u0438 \u043E\u043F\u0442\u043E\u0432\u044B\u0445 \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u0432. </p></div><div><div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">\u041F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044F\u043C</div><ul class="space-y-2 text-sm"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/catalog",
        class: "text-slate-600 hover:text-slate-900 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u041A\u0430\u0442\u0430\u043B\u043E\u0433`);
          } else {
            return [
              createTextVNode("\u041A\u0430\u0442\u0430\u043B\u043E\u0433")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/cart",
        class: "text-slate-600 hover:text-slate-900 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u041A\u043E\u0440\u0437\u0438\u043D\u0430`);
          } else {
            return [
              createTextVNode("\u041A\u043E\u0440\u0437\u0438\u043D\u0430")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/wishlist",
        class: "text-slate-600 hover:text-slate-900 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435`);
          } else {
            return [
              createTextVNode("\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div><div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">\u041F\u0430\u0440\u0442\u043D\u0451\u0440\u0430\u043C</div><ul class="space-y-2 text-sm"><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/b2b/register",
        class: "text-slate-600 hover:text-slate-900 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430`);
          } else {
            return [
              createTextVNode("\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li><li>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/auth/login",
        class: "text-slate-600 hover:text-slate-900 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u0412\u0445\u043E\u0434 \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442`);
          } else {
            return [
              createTextVNode("\u0412\u0445\u043E\u0434 \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</li></ul></div><div><div class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B</div><ul class="space-y-2 text-sm text-slate-600"><li class="flex items-center gap-2"><svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg><a href="mailto:info@suvlavka.ru" class="hover:text-slate-900 transition-colors">info@suvlavka.ru</a></li><li class="flex items-center gap-2"><svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg><a href="tel:+78001234567" class="hover:text-slate-900 transition-colors">8 800 123-45-67</a></li></ul></div></div><div class="mt-8 pt-6 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4"><p class="text-xs text-slate-400"> \xA9 ${ssrInterpolate((/* @__PURE__ */ new Date()).getFullYear())} Souvenir Shop. \u0412\u0441\u0435 \u043F\u0440\u0430\u0432\u0430 \u0437\u0430\u0449\u0438\u0449\u0435\u043D\u044B. </p><div class="flex items-center gap-4 text-xs text-slate-400">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/privacy",
        class: "hover:text-slate-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438`);
          } else {
            return [
              createTextVNode("\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/terms",
        class: "hover:text-slate-600 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F`);
          } else {
            return [
              createTextVNode("\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></footer></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CVnyjQX5.mjs.map
