import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, mergeProps, withCtx, createTextVNode, unref, toDisplayString, createVNode, createBlock, openBlock, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderStyle, ssrRenderClass } from 'vue/server-renderer';
import { _ as __nuxt_component_4, a as _sfc_main$9 } from './ProductCard-C9CGbHDp.mjs';
import { b as useRoute, c as useRouter, u as useRuntimeConfig, a as _export_sfc } from './server.mjs';
import { _ as _sfc_main$7 } from './ProductCardGrid-ov3JW6gY.mjs';
import { _ as _sfc_main$8 } from './ProductPriceBlock-DEFQ0tZW.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
import { u as useRecentlyViewed } from './useRecentlyViewed-C1sjIei9.mjs';
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
import './cart-DZFIURht.mjs';
import './favorites-CzyYdspe.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "QuickFilterChips",
  __ssrInlineRender: true,
  props: {
    active: {}
  },
  emits: ["toggle"],
  setup(__props, { emit: __emit }) {
    const chips = [
      { key: "new", label: "\u041D\u043E\u0432\u0438\u043D\u043A\u0438" },
      { key: "hits", label: "\u0425\u0438\u0442\u044B" },
      { key: "inStock", label: "\u0412 \u043D\u0430\u043B\u0438\u0447\u0438\u0438" }
    ];
    const props = __props;
    const isActive = (key) => {
      var _a;
      return !!((_a = props.active) == null ? void 0 : _a[key]);
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-wrap gap-2" }, _attrs))}><!--[-->`);
      ssrRenderList(chips, (chip) => {
        _push(`<button type="button" class="${ssrRenderClass([
          isActive(chip.key) ? "border-slate-900 bg-slate-900 text-white" : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
          "rounded-full border px-3 py-1 text-xs"
        ])}">${ssrInterpolate(chip.label)}</button>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/QuickFilterChips.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "CatalogFiltersSidebar",
  __ssrInlineRender: true,
  props: {
    facets: {},
    priceMin: {},
    priceMax: {},
    inStock: { type: Boolean },
    onlyMyCity: { type: Boolean },
    cityName: {},
    selectedSpecs: {},
    selectedRanges: {}
  },
  emits: ["update:priceMin", "update:priceMax", "update:inStock", "update:onlyMyCity", "update:selectedSpecs", "update:selectedRanges", "apply", "reset"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const specs = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = props.facets) == null ? void 0 : _a.specs) != null ? _a2 : {};
    });
    function isChecked(key, val) {
      var _a;
      return Array.isArray((_a = props.selectedSpecs) == null ? void 0 : _a[key]) && props.selectedSpecs[key].includes(val);
    }
    function rangeValue(key, which) {
      var _a;
      const f = specs.value[key];
      if (!f || f.type !== "range") return 0;
      const cur = (_a = props.selectedRanges) == null ? void 0 : _a[key];
      const v = which === "min" ? cur == null ? void 0 : cur.min : cur == null ? void 0 : cur.max;
      return typeof v === "number" && Number.isFinite(v) ? v : which === "min" ? f.min : f.max;
    }
    const hasAnyFilters = computed(() => {
      const hasPrice = !!props.priceMin || !!props.priceMax;
      const hasStock = !!props.inStock;
      const hasCity = !!props.onlyMyCity;
      const hasSpecs = Object.keys(props.selectedSpecs || {}).length > 0;
      const hasRanges = Object.keys(props.selectedRanges || {}).length > 0;
      return hasPrice || hasStock || hasCity || hasSpecs || hasRanges;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<aside${ssrRenderAttrs(mergeProps({ class: "sticky top-20 space-y-3" }, _attrs))}><div class="rounded-xl border border-gray-200 bg-white p-3"><div class="flex items-center justify-between"><h3 class="text-sm font-semibold text-gray-900">\u0424\u0438\u043B\u044C\u0442\u0440\u044B</h3>`);
      if (unref(hasAnyFilters)) {
        _push(`<button type="button" class="text-xs text-gray-500 hover:text-gray-900"> \u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="mt-3 grid grid-cols-2 gap-2"><div class="flex flex-col gap-1"><label class="text-[11px] text-gray-500">\u0426\u0435\u043D\u0430 \u043E\u0442</label><input${ssrRenderAttr("value", __props.priceMin)} type="number" min="0" class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"></div><div class="flex flex-col gap-1"><label class="text-[11px] text-gray-500">\u0426\u0435\u043D\u0430 \u0434\u043E</label><input${ssrRenderAttr("value", __props.priceMax)} type="number" min="0" class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"></div></div><div class="mt-3 space-y-2"><label class="inline-flex items-center gap-2 text-xs text-gray-700"><input${ssrIncludeBooleanAttr(__props.inStock) ? " checked" : ""} type="checkbox" class="h-4 w-4 rounded border-gray-300 text-slate-900"> \u0422\u043E\u043B\u044C\u043A\u043E \u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438 </label><label class="inline-flex items-center gap-2 text-xs text-gray-700"><input${ssrIncludeBooleanAttr(__props.onlyMyCity) ? " checked" : ""} type="checkbox" class="h-4 w-4 rounded border-gray-300 text-slate-900"> \u0422\u043E\u043B\u044C\u043A\u043E \u043C\u043E\u0439 \u0433\u043E\u0440\u043E\u0434 `);
      if (__props.onlyMyCity && __props.cityName) {
        _push(`<span class="text-gray-400">(${ssrInterpolate(__props.cityName)})</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</label></div></div>`);
      if (Object.keys(unref(specs)).length) {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(specs), (facet, key) => {
          _push(`<details open class="rounded-xl border border-gray-200 bg-white"><summary class="cursor-pointer select-none px-3 py-2 text-sm font-medium text-gray-900">${ssrInterpolate(key)}</summary><div class="px-3 pb-3">`);
          if (facet.type === "enum") {
            _push(`<div class="max-h-56 overflow-auto space-y-2"><!--[-->`);
            ssrRenderList(facet.values, (opt) => {
              _push(`<label class="flex items-center justify-between gap-3 text-xs text-gray-700"><span class="inline-flex items-center gap-2"><input type="checkbox" class="h-4 w-4 rounded border-gray-300 text-slate-900"${ssrIncludeBooleanAttr(isChecked(key, opt.value)) ? " checked" : ""}><span class="line-clamp-1">${ssrInterpolate(opt.value)}</span></span><span class="text-[11px] text-gray-400">${ssrInterpolate(opt.count)}</span></label>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<div class="space-y-3"><div class="grid grid-cols-2 gap-2"><div class="flex flex-col gap-1"><label class="text-[11px] text-gray-500">\u041E\u0442</label><input type="number"${ssrRenderAttr("step", facet.step)} class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"${ssrRenderAttr("value", rangeValue(key, "min"))}></div><div class="flex flex-col gap-1"><label class="text-[11px] text-gray-500">\u0414\u043E</label><input type="number"${ssrRenderAttr("step", facet.step)} class="w-full rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"${ssrRenderAttr("value", rangeValue(key, "max"))}></div></div><div class="relative h-8"><input type="range" class="absolute inset-0 w-full"${ssrRenderAttr("min", facet.min)}${ssrRenderAttr("max", facet.max)}${ssrRenderAttr("step", facet.step)}${ssrRenderAttr("value", rangeValue(key, "min"))}><input type="range" class="absolute inset-0 w-full"${ssrRenderAttr("min", facet.min)}${ssrRenderAttr("max", facet.max)}${ssrRenderAttr("step", facet.step)}${ssrRenderAttr("value", rangeValue(key, "max"))}></div><p class="text-[11px] text-gray-500"> \u0414\u0438\u0430\u043F\u0430\u0437\u043E\u043D: ${ssrInterpolate(facet.min)} \u2014 ${ssrInterpolate(facet.max)}</p></div>`);
          }
          _push(`</div></details>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</aside>`);
    };
  }
});
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CatalogFiltersSidebar.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "ViewToggle",
  __ssrInlineRender: true,
  props: {
    modelValue: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const btnClass = (active) => active ? "bg-slate-900 text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50";
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white" }, _attrs))}><button type="button" class="${ssrRenderClass([btnClass(__props.modelValue === "grid-lg"), "grid h-9 w-9 place-items-center transition"])}" aria-label="\u0411\u043E\u043B\u044C\u0448\u0438\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438" title="\u0411\u043E\u043B\u044C\u0448\u0438\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="7" height="7" rx="1.3"></rect><rect x="13" y="4" width="7" height="7" rx="1.3"></rect><rect x="4" y="13" width="7" height="7" rx="1.3"></rect><rect x="13" y="13" width="7" height="7" rx="1.3"></rect></svg></button><button type="button" class="${ssrRenderClass([btnClass(__props.modelValue === "grid"), "grid h-9 w-9 place-items-center transition"])}" aria-label="\u0421\u0440\u0435\u0434\u043D\u0438\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438" title="\u0421\u0440\u0435\u0434\u043D\u0438\u0435 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0438"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true"><rect x="4" y="4" width="4" height="4" rx="1"></rect><rect x="10" y="4" width="4" height="4" rx="1"></rect><rect x="16" y="4" width="4" height="4" rx="1"></rect><rect x="4" y="10" width="4" height="4" rx="1"></rect><rect x="10" y="10" width="4" height="4" rx="1"></rect><rect x="16" y="10" width="4" height="4" rx="1"></rect><rect x="4" y="16" width="4" height="4" rx="1"></rect><rect x="10" y="16" width="4" height="4" rx="1"></rect><rect x="16" y="16" width="4" height="4" rx="1"></rect></svg></button><button type="button" class="${ssrRenderClass([btnClass(__props.modelValue === "list"), "grid h-9 w-9 place-items-center transition"])}" aria-label="\u0421\u043F\u0438\u0441\u043E\u043A" title="\u0421\u043F\u0438\u0441\u043E\u043A"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M8 6h12"></path><path d="M8 12h12"></path><path d="M8 18h12"></path><path d="M4 6h0"></path><path d="M4 12h0"></path><path d="M4 18h0"></path></svg></button></div>`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ViewToggle.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "CategoryMicroBanner",
  __ssrInlineRender: true,
  props: {
    title: {},
    text: {},
    href: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-lg border border-amber-200 bg-amber-50 p-4" }, _attrs))}><div class="flex items-start justify-between gap-3"><div class="space-y-1"><p class="text-sm font-semibold text-amber-900">${ssrInterpolate(__props.title)}</p>`);
      if (__props.text) {
        _push(`<p class="text-xs text-amber-800">${ssrInterpolate(__props.text)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.href) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: __props.href,
          class: "text-xs font-medium text-amber-900 underline"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 `);
            } else {
              return [
                createTextVNode(" \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CategoryMicroBanner.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const _sfc_main$2 = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  _push(`<article${ssrRenderAttrs(mergeProps({ class: "animate-pulse rounded-lg border border-gray-200 bg-white p-3" }, _attrs))}><div class="flex gap-3"><div class="h-16 w-16 rounded-md bg-gray-100"></div><div class="flex-1 space-y-2"><div class="h-3 w-3/4 rounded bg-gray-100"></div><div class="h-3 w-1/3 rounded bg-gray-100"></div><div class="h-3 w-1/2 rounded bg-gray-100"></div></div><div class="w-28 space-y-2"><div class="h-4 w-full rounded bg-gray-100"></div><div class="h-3 w-full rounded bg-gray-100"></div></div></div></article>`);
}
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductRowSkeleton.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["ssrRender", _sfc_ssrRender]]);
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ProductCardList",
  __ssrInlineRender: true,
  props: {
    products: {},
    mode: {},
    prefetch: { type: Boolean }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProductCard = _sfc_main$9;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-2" }, _attrs))}><!--[-->`);
      ssrRenderList(__props.products, (p) => {
        _push(ssrRenderComponent(_component_ProductCard, {
          key: p.id,
          product: p,
          mode: __props.mode,
          prefetch: __props.prefetch,
          view: "list"
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductCardList.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
function normalize(v) {
  if (v === "grid-lg" || v === "grid" || v === "list") return v;
  return null;
}
function useCatalogViewMode() {
  const route = useRoute();
  useRouter();
  const mode = ref("grid");
  const syncing = ref(false);
  watch(
    mode,
    async (v) => {
      return;
    },
    { flush: "post" }
  );
  watch(
    () => route.query.view,
    (q) => {
      const next = normalize(q);
      if (!next) return;
      if (next === mode.value) return;
      syncing.value = true;
      mode.value = next;
      syncing.value = false;
    }
  );
  return { mode };
}
const rowHeight = 108;
const overscan = 8;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[slug]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const auth = useAuthStore();
    auth.initFromStorage();
    const router = useRouter();
    const config = useRuntimeConfig();
    const cityStore = useCityStore();
    const apiBaseUrl = config.apiBaseUrl;
    const slug = computed(() => route.params.slug);
    const { data: catInfo } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "catinfo",
      () => $fetch(
        `/api/catalog/categories/${encodeURIComponent(slug.value)}`,
        {
          baseURL: apiBaseUrl
        }
      ),
      { watch: [slug] }
    )), __temp = await __temp, __restore(), __temp);
    const breadcrumbs = computed(() => {
      var _a;
      return Array.isArray((_a = catInfo.value) == null ? void 0 : _a.breadcrumbs) ? catInfo.value.breadcrumbs : [];
    });
    const categoryName = computed(() => {
      var _a, _b;
      return ((_b = (_a = catInfo.value) == null ? void 0 : _a.category) == null ? void 0 : _b.name) || slug.value;
    });
    const rootChildren = computed(() => {
      var _a;
      return Array.isArray((_a = catInfo.value) == null ? void 0 : _a.children) ? catInfo.value.children : [];
    });
    const isRootCategory = computed(() => {
      var _a, _b;
      return ((_b = (_a = catInfo.value) == null ? void 0 : _a.category) == null ? void 0 : _b.parentId) == null && rootChildren.value.length > 0;
    });
    const priceMin = ref(route.query.minPrice || null);
    const priceMax = ref(route.query.maxPrice || null);
    const inStock = ref(route.query.inStock === "true");
    const sort = ref(route.query.sort || "popularity");
    const onlyMyCity = ref(route.query.onlyMyCity === "true");
    const selectedSpecs = ref({});
    const selectedRanges = ref({});
    const facets = ref(null);
    function parseJsonParam(v, fallback) {
      if (typeof v !== "string" || !v) return fallback;
      try {
        const parsed = JSON.parse(v);
        return parsed != null ? parsed : fallback;
      } catch {
        return fallback;
      }
    }
    const { mode } = useCatalogViewMode();
    const priceMode = computed(
      () => {
        var _a;
        return route.path.startsWith("/b2b") || ((_a = auth.user) == null ? void 0 : _a.role) === "store" ? "b2b" : "retail";
      }
    );
    const buildBaseQuery = () => {
      const query = {
        category: slug.value,
        sort: sort.value
      };
      if (cityStore.code) query.city = cityStore.code;
      if (onlyMyCity.value) query.onlyMyCity = "true";
      if (priceMin.value) query.minPrice = priceMin.value;
      if (priceMax.value) query.maxPrice = priceMax.value;
      if (inStock.value) query.inStock = "true";
      return query;
    };
    const buildQuery = () => {
      const q = buildBaseQuery();
      if (Object.keys(selectedSpecs.value || {}).length) q.specs = JSON.stringify(selectedSpecs.value);
      if (Object.keys(selectedRanges.value || {}).length) q.specRanges = JSON.stringify(selectedRanges.value);
      return q;
    };
    function applyFilters() {
      router.push({ path: `/catalog/${slug.value}`, query: buildQuery() });
    }
    const quickActive = computed(() => ({
      new: sort.value === "new",
      hits: sort.value === "popularity",
      inStock: inStock.value
    }));
    function toggleQuick(key) {
      if (key === "inStock") {
        inStock.value = !inStock.value;
      } else if (key === "new") {
        sort.value = sort.value === "new" ? "popularity" : "new";
      } else if (key === "hits") {
        sort.value = sort.value === "popularity" ? "new" : "popularity";
      }
      applyFilters();
    }
    const page = ref(1);
    const limit = ref(24);
    const products = ref([]);
    const total = ref(0);
    const pending = ref(false);
    const loadError = ref(false);
    async function fetchPage(p, replace = false) {
      var _a;
      pending.value = true;
      loadError.value = false;
      try {
        const res = await $fetch("/api/catalog/products", {
          baseURL: apiBaseUrl,
          query: { ...buildQuery(), page: String(p), limit: String(limit.value) }
        });
        total.value = Number((_a = res == null ? void 0 : res.total) != null ? _a : 0);
        const next = Array.isArray(res == null ? void 0 : res.products) ? res.products : [];
        products.value = replace ? next : [...products.value, ...next];
      } catch {
        loadError.value = true;
        if (replace) products.value = [];
      } finally {
        pending.value = false;
      }
    }
    const hasProducts = computed(() => products.value.length > 0);
    const canLoadMore = computed(() => products.value.length < total.value);
    watch(
      [slug, () => route.query],
      () => {
        priceMin.value = route.query.minPrice || null;
        priceMax.value = route.query.maxPrice || null;
        inStock.value = route.query.inStock === "true";
        sort.value = route.query.sort || "popularity";
        onlyMyCity.value = route.query.onlyMyCity === "true";
        selectedSpecs.value = parseJsonParam(route.query.specs, {});
        selectedRanges.value = parseJsonParam(route.query.specRanges, {});
        page.value = 1;
        products.value = [];
        fetchPage(1, true);
        fetchFacets();
      },
      { immediate: true }
    );
    async function fetchFacets() {
      try {
        facets.value = await $fetch("/api/catalog/filters", {
          baseURL: apiBaseUrl,
          query: buildBaseQuery()
        });
      } catch {
        facets.value = null;
      }
    }
    watch(
      () => cityStore.code,
      () => {
        router.replace({ path: `/catalog/${slug.value}`, query: buildQuery() });
        page.value = 1;
        products.value = [];
        fetchPage(1, true);
        fetchFacets();
      }
    );
    const microBanners = computed(() => {
      var _a;
      const map = {
        souvenirs: [
          {
            title: "\u041F\u0440\u043E\u043C\u043E \u043D\u0435\u0434\u0435\u043B\u0438",
            text: "\u0421\u043E\u0431\u0435\u0440\u0438\u0442\u0435 \u043D\u0430\u0431\u043E\u0440 \u0438\u0437 3 \u0441\u0443\u0432\u0435\u043D\u0438\u0440\u043E\u0432 \u2014 \u0443\u0434\u043E\u0431\u043D\u043E \u0434\u043B\u044F \u043F\u043E\u0434\u0430\u0440\u043A\u043E\u0432 \u0438 \u0432\u0438\u0442\u0440\u0438\u043D\u044B.",
            href: "/catalog/souvenirs?sort=popularity"
          }
        ],
        gifts: [
          {
            title: "\u041D\u0430\u043D\u0435\u0441\u0435\u043D\u0438\u0435 \u043B\u043E\u0433\u043E\u0442\u0438\u043F\u0430",
            text: "\u041A\u043E\u0440\u043F\u043E\u0440\u0430\u0442\u0438\u0432\u043D\u044B\u0435 \u043F\u043E\u0434\u0430\u0440\u043A\u0438 \u2014 \u043F\u043E\u0434\u0441\u043A\u0430\u0436\u0435\u043C \u0432\u0430\u0440\u0438\u0430\u043D\u0442\u044B \u0438 \u0441\u0440\u043E\u043A\u0438.",
            href: "/catalog/gifts?sort=new"
          }
        ]
      };
      return (_a = map[slug.value]) != null ? _a : [];
    });
    const { items: recentlyViewed } = useRecentlyViewed();
    const virtualEnabled = computed(() => mode.value === "list" && products.value.length >= 120);
    const scroller = ref(null);
    const scrollTop = ref(0);
    const visibleRange = computed(() => {
      var _a2;
      var _a;
      if (!virtualEnabled.value) return { start: 0, end: products.value.length };
      const viewport = (_a2 = (_a = scroller.value) == null ? void 0 : _a.clientHeight) != null ? _a2 : 600;
      const start = Math.max(0, Math.floor(scrollTop.value / rowHeight) - overscan);
      const visibleCount = Math.ceil(viewport / rowHeight) + overscan * 2;
      const end = Math.min(products.value.length, start + visibleCount);
      return { start, end };
    });
    const topSpacer = computed(() => virtualEnabled.value ? visibleRange.value.start * rowHeight : 0);
    const bottomSpacer = computed(() => {
      if (!virtualEnabled.value) return 0;
      const hidden = products.value.length - visibleRange.value.end;
      return Math.max(0, hidden * rowHeight);
    });
    const visibleProducts = computed(() => {
      const { start, end } = visibleRange.value;
      return products.value.slice(start, end);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_QuickFilterChips = _sfc_main$6;
      const _component_CatalogFiltersSidebar = _sfc_main$5;
      const _component_ViewToggle = _sfc_main$4;
      const _component_CategoryMicroBanner = _sfc_main$3;
      const _component_ProductCardSkeleton = __nuxt_component_4;
      const _component_ProductRowSkeleton = __nuxt_component_6;
      const _component_ProductCardGrid = _sfc_main$7;
      const _component_ProductCardList = _sfc_main$1;
      const _component_ProductPriceBlock = _sfc_main$8;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><header class="space-y-2"><nav class="text-xs text-gray-500">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/catalog",
        class: "hover:text-slate-900"
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
      _push(`<!--[-->`);
      ssrRenderList(unref(breadcrumbs), (bc, idx) => {
        _push(`<!--[--><span class="mx-1">/</span>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/catalog/${bc.slug}`,
          class: ["hover:text-slate-900", idx === unref(breadcrumbs).length - 1 ? "text-gray-900 font-medium" : ""]
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(bc.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(bc.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`<!--]-->`);
      });
      _push(`<!--]--></nav><div class="flex flex-wrap items-center justify-between gap-3"><div class="space-y-1"><h1 class="text-xl font-semibold">${ssrInterpolate(unref(categoryName))}</h1><p class="text-sm text-gray-600">\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u0444\u0438\u043B\u044C\u0442\u0440\u044B, \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u0432\u0438\u0434\u0430 \u0438 \u0431\u044B\u0441\u0442\u0440\u044B\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u2014 \u043A\u0430\u043A \u0432 \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 e\u2011commerce.</p></div></div>`);
      _push(ssrRenderComponent(_component_QuickFilterChips, {
        active: unref(quickActive),
        onToggle: toggleQuick
      }, null, _parent));
      _push(`</header>`);
      if (unref(isRootCategory)) {
        _push(`<section class="space-y-3"><div class="flex items-center justify-between"><h2 class="text-base font-semibold">\u041F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438</h2><span class="text-xs text-gray-500">\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E</span></div><div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5"><!--[-->`);
        ssrRenderList(unref(rootChildren), (c) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: c.id,
            to: `/catalog/${c.slug}`,
            class: "group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-50",
            prefetch: ""
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b;
              if (_push2) {
                _push2(`<div class="aspect-[4/3]"${_scopeId}>`);
                if (c.previewImageUrl) {
                  _push2(`<img${ssrRenderAttr("src", c.previewImageUrl)}${ssrRenderAttr("alt", c.name)} class="h-full w-full object-cover" loading="lazy"${_scopeId}>`);
                } else {
                  _push2(`<div class="h-full w-full"${_scopeId}></div>`);
                }
                _push2(`</div><div class="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"${_scopeId}></div><div class="absolute bottom-2 left-2 right-2"${_scopeId}><div class="inline-flex max-w-full items-center gap-2 rounded-lg bg-white/80 px-2 py-1 backdrop-blur"${_scopeId}><span class="truncate text-sm font-medium text-gray-900"${_scopeId}>${ssrInterpolate(c.name)}</span><span class="shrink-0 text-xs text-gray-600"${_scopeId}>${ssrInterpolate((_a = c.productsCount) != null ? _a : 0)}</span></div></div><div class="absolute inset-0 ring-0 ring-slate-900/0 transition group-hover:ring-2 group-hover:ring-slate-900/15"${_scopeId}></div>`);
              } else {
                return [
                  createVNode("div", { class: "aspect-[4/3]" }, [
                    c.previewImageUrl ? (openBlock(), createBlock("img", {
                      key: 0,
                      src: c.previewImageUrl,
                      alt: c.name,
                      class: "h-full w-full object-cover",
                      loading: "lazy"
                    }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "h-full w-full"
                    }))
                  ]),
                  createVNode("div", { class: "absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" }),
                  createVNode("div", { class: "absolute bottom-2 left-2 right-2" }, [
                    createVNode("div", { class: "inline-flex max-w-full items-center gap-2 rounded-lg bg-white/80 px-2 py-1 backdrop-blur" }, [
                      createVNode("span", { class: "truncate text-sm font-medium text-gray-900" }, toDisplayString(c.name), 1),
                      createVNode("span", { class: "shrink-0 text-xs text-gray-600" }, toDisplayString((_b = c.productsCount) != null ? _b : 0), 1)
                    ])
                  ]),
                  createVNode("div", { class: "absolute inset-0 ring-0 ring-slate-900/0 transition group-hover:ring-2 group-hover:ring-slate-900/15" })
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div></section>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid gap-4 lg:grid-cols-[280px,1fr]">`);
      _push(ssrRenderComponent(_component_CatalogFiltersSidebar, {
        facets: unref(facets),
        "price-min": unref(priceMin),
        "price-max": unref(priceMax),
        "in-stock": unref(inStock),
        "only-my-city": unref(onlyMyCity),
        "city-name": unref(cityStore).name,
        "selected-specs": unref(selectedSpecs),
        "selected-ranges": unref(selectedRanges),
        "onUpdate:priceMin": (v) => priceMin.value = v,
        "onUpdate:priceMax": (v) => priceMax.value = v,
        "onUpdate:inStock": (v) => inStock.value = v,
        "onUpdate:onlyMyCity": (v) => onlyMyCity.value = v,
        "onUpdate:selectedSpecs": (v) => selectedSpecs.value = v,
        "onUpdate:selectedRanges": (v) => selectedRanges.value = v,
        onApply: applyFilters
      }, null, _parent));
      _push(`<div class="space-y-3"><div class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3"><div class="flex items-center gap-2"><label class="text-xs text-gray-500">\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430</label><select class="rounded border border-gray-200 px-2 py-1 text-xs outline-none focus:border-slate-400"><option value="popularity"${ssrIncludeBooleanAttr(Array.isArray(unref(sort)) ? ssrLooseContain(unref(sort), "popularity") : ssrLooseEqual(unref(sort), "popularity")) ? " selected" : ""}>\u041F\u043E \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u043E\u0441\u0442\u0438</option><option value="price"${ssrIncludeBooleanAttr(Array.isArray(unref(sort)) ? ssrLooseContain(unref(sort), "price") : ssrLooseEqual(unref(sort), "price")) ? " selected" : ""}>\u041F\u043E \u0446\u0435\u043D\u0435</option><option value="new"${ssrIncludeBooleanAttr(Array.isArray(unref(sort)) ? ssrLooseContain(unref(sort), "new") : ssrLooseEqual(unref(sort), "new")) ? " selected" : ""}>\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043D\u043E\u0432\u044B\u0435</option></select></div>`);
      _push(ssrRenderComponent(_component_ViewToggle, {
        modelValue: unref(mode),
        "onUpdate:modelValue": ($event) => isRef(mode) ? mode.value = $event : null
      }, null, _parent));
      _push(`</div>`);
      if (unref(microBanners).length) {
        _push(`<div class="grid gap-3 md:grid-cols-2"><!--[-->`);
        ssrRenderList(unref(microBanners), (b, i) => {
          _push(ssrRenderComponent(_component_CategoryMicroBanner, {
            key: i,
            title: b.title,
            text: b.text,
            href: b.href
          }, null, _parent));
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending) && !unref(products).length) {
        _push(`<div class="space-y-3">`);
        if (unref(mode) !== "list") {
          _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"><!--[-->`);
          ssrRenderList(12, (n) => {
            _push(ssrRenderComponent(_component_ProductCardSkeleton, { key: n }, null, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(8, (n) => {
            _push(ssrRenderComponent(_component_ProductRowSkeleton, { key: n }, null, _parent));
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
      } else if (unref(loadError)) {
        _push(`<div class="text-sm text-red-500">\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0435 \u0442\u043E\u0432\u0430\u0440\u043E\u0432.</div>`);
      } else if (!unref(hasProducts)) {
        _push(`<div class="text-sm text-gray-500">\u0412 \u044D\u0442\u043E\u0439 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0441 \u0442\u0430\u043A\u0438\u043C\u0438 \u0443\u0441\u043B\u043E\u0432\u0438\u044F\u043C\u0438 \u0444\u0438\u043B\u044C\u0442\u0440\u0430.</div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(mode) !== "list") {
          _push(ssrRenderComponent(_component_ProductCardGrid, {
            products: unref(products),
            mode: unref(priceMode),
            prefetch: true,
            view: unref(mode) === "grid-lg" ? "large" : "medium"
          }, null, _parent));
        } else {
          _push(`<div>`);
          if (unref(virtualEnabled)) {
            _push(`<div class="max-h-[70vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-2"><div style="${ssrRenderStyle({ height: unref(topSpacer) + "px" })}"></div><div class="space-y-2">`);
            _push(ssrRenderComponent(_component_ProductCardList, {
              products: unref(visibleProducts),
              mode: unref(priceMode),
              prefetch: true
            }, null, _parent));
            _push(`</div><div style="${ssrRenderStyle({ height: unref(bottomSpacer) + "px" })}"></div></div>`);
          } else {
            _push(`<div class="space-y-2">`);
            _push(ssrRenderComponent(_component_ProductCardList, {
              products: unref(products),
              mode: unref(priceMode),
              prefetch: true
            }, null, _parent));
            _push(`</div>`);
          }
          _push(`</div>`);
        }
        _push(`<div class="pt-2 flex items-center justify-center">`);
        if (unref(canLoadMore)) {
          _push(`<button type="button" class="inline-flex items-center rounded-full border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"${ssrIncludeBooleanAttr(unref(pending)) ? " disabled" : ""}>`);
          if (unref(pending)) {
            _push(`<span>\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C\u2026</span>`);
          } else {
            _push(`<span>\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u0435\u0449\u0451</span>`);
          }
          _push(`</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><!--]-->`);
      }
      _push(`</div></div>`);
      if (unref(recentlyViewed).length) {
        _push(`<section class="space-y-3 pt-4"><h2 class="text-base font-semibold">\u041D\u0435\u0434\u0430\u0432\u043D\u043E \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u043D\u044B\u0435</h2><div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6"><!--[-->`);
        ssrRenderList(unref(recentlyViewed).slice(0, 6), (rv) => {
          _push(`<article class="rounded-lg border border-gray-200 bg-white p-3 text-sm flex flex-col">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/product/${rv.id}`,
            prefetch: "",
            class: "space-y-2"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="aspect-square w-full overflow-hidden rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center"${_scopeId}>`);
                if (rv.imageUrl) {
                  _push2(`<img${ssrRenderAttr("src", rv.imageUrl)}${ssrRenderAttr("alt", rv.name)} class="h-full w-full object-cover" loading="lazy"${_scopeId}>`);
                } else {
                  _push2(`<div class="text-[11px] text-gray-400"${_scopeId}>\u041D\u0435\u0442 \u0444\u043E\u0442\u043E</div>`);
                }
                _push2(`</div><p class="font-medium text-gray-900 line-clamp-2"${_scopeId}>${ssrInterpolate(rv.name)}</p><p class="text-xs text-gray-500"${_scopeId}>${ssrInterpolate(rv.categoryName)}</p>`);
              } else {
                return [
                  createVNode("div", { class: "aspect-square w-full overflow-hidden rounded-md border border-gray-100 bg-gray-50 flex items-center justify-center" }, [
                    rv.imageUrl ? (openBlock(), createBlock("img", {
                      key: 0,
                      src: rv.imageUrl,
                      alt: rv.name,
                      class: "h-full w-full object-cover",
                      loading: "lazy"
                    }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "text-[11px] text-gray-400"
                    }, "\u041D\u0435\u0442 \u0444\u043E\u0442\u043E"))
                  ]),
                  createVNode("p", { class: "font-medium text-gray-900 line-clamp-2" }, toDisplayString(rv.name), 1),
                  createVNode("p", { class: "text-xs text-gray-500" }, toDisplayString(rv.categoryName), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="mt-auto pt-2">`);
          _push(ssrRenderComponent(_component_ProductPriceBlock, {
            "retail-price": rv.retailPrice,
            "wholesale-price": rv.wholesalePrice,
            mode: unref(priceMode),
            compact: ""
          }, null, _parent));
          _push(`</div></article>`);
        });
        _push(`<!--]--></div></section>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/catalog/[slug].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_slug_-BhFJSSrL.mjs.map
