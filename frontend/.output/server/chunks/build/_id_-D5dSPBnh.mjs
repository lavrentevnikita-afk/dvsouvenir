import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$1$1, a as _sfc_main$3 } from './ProductAvailabilityBadge-Dp6_CtFm.mjs';
import { _ as _sfc_main$2 } from './ProductPriceBlock-DEFQ0tZW.mjs';
import { _ as __nuxt_component_4, a as _sfc_main$4 } from './ProductCard-C9CGbHDp.mjs';
import { defineComponent, computed, withAsyncContext, ref, watch, unref, mergeProps, withCtx, createTextVNode, toDisplayString, reactive, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderList, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderTeleport, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { b as useRoute, u as useRuntimeConfig, k as __nuxt_component_2 } from './server.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { u as useCartStore } from './cart-DZFIURht.mjs';
import { u as useRecentlyViewed } from './useRecentlyViewed-C1sjIei9.mjs';
import { u as useRecentlyViewedCategories } from './useRecentlyViewedCategories-B28JlI2v.mjs';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
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
import './favorites-CzyYdspe.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const STORAGE_PREFIX = "reviews:";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ProductReviewsBasic",
  __ssrInlineRender: true,
  props: {
    productId: {},
    productName: {}
  },
  setup(__props) {
    const props = __props;
    computed(() => `${STORAGE_PREFIX}${props.productId}`);
    const list = ref([]);
    const form = reactive({ name: "", rating: 5, text: "" });
    const error = ref(null);
    function load() {
      return;
    }
    watch(() => props.productId, load);
    const avg = computed(() => {
      if (!list.value.length) return 0;
      const sum = list.value.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
      return Math.round(sum / list.value.length * 10) / 10;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-3" }, _attrs))}><div class="flex items-end justify-between gap-4"><div><h2 class="text-base font-semibold">\u041E\u0442\u0437\u044B\u0432\u044B</h2><p class="text-xs text-gray-500"> \u0411\u0430\u0437\u043E\u0432\u044B\u0435 \u043E\u0442\u0437\u044B\u0432\u044B (\u0431\u0435\u0437 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438) \u0441\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u0442\u0441\u044F \u0432 \u0432\u0430\u0448\u0435\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435. </p></div>`);
      if (unref(list).length) {
        _push(`<div class="text-right"><p class="text-xs text-gray-500">\u0421\u0440\u0435\u0434\u043D\u044F\u044F \u043E\u0446\u0435\u043D\u043A\u0430</p><p class="text-sm font-semibold">${ssrInterpolate(unref(avg))} / 5</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="rounded-lg border border-gray-200 bg-white p-4"><form class="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]"><div class="space-y-2"><label class="block"><span class="text-xs text-gray-500">\u0418\u043C\u044F</span><input${ssrRenderAttr("value", unref(form).name)} type="text" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u0410\u043D\u043D\u0430" class="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-900"></label><label class="block"><span class="text-xs text-gray-500">\u041E\u0442\u0437\u044B\u0432</span><textarea rows="3" placeholder="\u0427\u0442\u043E \u043F\u043E\u043D\u0440\u0430\u0432\u0438\u043B\u043E\u0441\u044C?" class="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-900">${ssrInterpolate(unref(form).text)}</textarea></label>`);
      if (unref(error)) {
        _push(`<p class="text-xs text-red-500">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="space-y-2"><label class="block"><span class="text-xs text-gray-500">\u041E\u0446\u0435\u043D\u043A\u0430</span><select class="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-slate-900"><!--[-->`);
      ssrRenderList(5, (n) => {
        _push(`<option${ssrRenderAttr("value", n)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).rating) ? ssrLooseContain(unref(form).rating, n) : ssrLooseEqual(unref(form).rating, n)) ? " selected" : ""}>${ssrInterpolate(n)}</option>`);
      });
      _push(`<!--]--></select></label><button type="submit" class="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"> \u041E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043E\u0442\u0437\u044B\u0432 </button></div></form></div>`);
      if (!unref(list).length) {
        _push(`<div class="text-sm text-gray-500"> \u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043E\u0442\u0437\u044B\u0432\u043E\u0432. \u0411\u0443\u0434\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u043C! </div>`);
      } else {
        _push(`<ul class="space-y-3"><!--[-->`);
        ssrRenderList(unref(list), (r) => {
          _push(`<li class="rounded-lg border border-gray-200 bg-white p-4"><div class="flex items-start justify-between gap-3"><div><p class="text-sm font-medium text-gray-900">${ssrInterpolate(r.name)}</p><p class="text-xs text-gray-500">${ssrInterpolate(new Date(r.createdAt).toLocaleDateString())}</p></div><div class="text-xs font-semibold text-gray-800">${ssrInterpolate(r.rating)} / 5</div></div><p class="mt-2 text-sm text-gray-700 whitespace-pre-line">${ssrInterpolate(r.text)}</p></li>`);
        });
        _push(`<!--]--></ul>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductReviewsBasic.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const cartStore = useCartStore();
    cartStore.initFromStorage();
    useRecentlyViewed();
    useRecentlyViewedCategories();
    const id = computed(() => Number(route.params.id));
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "product",
      () => $fetch(`/api/catalog/products/${id.value}`, {
        baseURL: apiBaseUrl
      }),
      { watch: [id] }
    )), __temp = await __temp, __restore(), __temp);
    const product = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = data.value) == null ? void 0 : _a.product) != null ? _a2 : null;
    });
    const catSlug = computed(() => {
      var _a, _b;
      return String(((_b = (_a = product.value) == null ? void 0 : _a.category) == null ? void 0 : _b.slug) || "");
    });
    const { data: catInfo } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "product_catinfo",
      () => catSlug.value ? $fetch(
        `/api/catalog/categories/${encodeURIComponent(catSlug.value)}`,
        { baseURL: apiBaseUrl }
      ) : null,
      { watch: [catSlug] }
    )), __temp = await __temp, __restore(), __temp);
    const breadcrumbs = computed(() => {
      var _a, _b;
      const apiCrumbs = Array.isArray((_a = catInfo.value) == null ? void 0 : _a.breadcrumbs) ? catInfo.value.breadcrumbs : null;
      if (apiCrumbs && apiCrumbs.length) return apiCrumbs;
      const out = [];
      const seen = /* @__PURE__ */ new Set();
      let cur = (_b = product.value) == null ? void 0 : _b.category;
      let guard = 0;
      while (cur && guard < 10) {
        guard += 1;
        if (seen.has(cur)) break;
        seen.add(cur);
        if (cur.slug && cur.name) out.unshift({ slug: String(cur.slug), name: String(cur.name) });
        cur = cur.parent;
      }
      return out;
    });
    const priceMode = computed(
      () => {
        var _a;
        return route.path.startsWith("/b2b") || ((_a = auth.user) == null ? void 0 : _a.role) === "store" ? "b2b" : "retail";
      }
    );
    const retailPrice = computed(() => {
      var _a2;
      var _a, _b;
      return (_a2 = (_a = product.value) == null ? void 0 : _a.retailPrice) != null ? _a2 : (_b = product.value) == null ? void 0 : _b.price;
    });
    const wholesalePrice = computed(() => {
      var _a2;
      var _a, _b, _c;
      if (priceMode.value === "b2b" && ((_b = (_a = product.value) == null ? void 0 : _a.priceInfo) == null ? void 0 : _b.final) != null) return product.value.priceInfo.final;
      const direct = (_a2 = (_c = product.value) == null ? void 0 : _c.wholesalePrice) != null ? _a2 : null;
      return direct;
    });
    const images = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = product.value) == null ? void 0 : _a.images) != null ? _a2 : [];
    });
    const isAvailable = computed(() => {
      var _a;
      return !!((_a = product.value) == null ? void 0 : _a.isAvailable);
    });
    const availabilityStatus = computed(() => {
      var _a;
      return (_a = product.value) == null ? void 0 : _a.availabilityStatus;
    });
    const canOrder = computed(() => {
      var _a;
      const v = (_a = product.value) == null ? void 0 : _a.canOrder;
      if (typeof v === "boolean") return v;
      return isAvailable.value;
    });
    const reviewCount = ref(0);
    const reviewAvg = ref(0);
    const questionsCount = computed(() => {
      var _a;
      const v = (_a = product.value) == null ? void 0 : _a.questionsCount;
      return Number.isFinite(Number(v)) ? Number(v) : 0;
    });
    const displayedRating = computed(() => {
      var _a;
      const api = Number((_a = product.value) == null ? void 0 : _a.rating);
      if (Number.isFinite(api) && api > 0) return Math.round(api * 10) / 10;
      return reviewAvg.value;
    });
    const displayedReviewCount = computed(() => {
      var _a;
      const api = Number((_a = product.value) == null ? void 0 : _a.reviewsCount);
      if (Number.isFinite(api) && api > 0) return Math.trunc(api);
      return reviewCount.value;
    });
    const availabilityHint = computed(() => {
      var _a2, _b;
      var _a;
      const specs = (_a = product.value) == null ? void 0 : _a.specs;
      return (_b = (_a2 = specs == null ? void 0 : specs["\u041D\u0430\u043B\u0438\u0447\u0438\u0435"]) != null ? _a2 : specs == null ? void 0 : specs.availability) != null ? _b : null;
    });
    watch(
      product,
      (p) => {
        return;
      },
      { immediate: true }
    );
    const similar = ref([]);
    const similarPending = ref(false);
    const recommended = ref([]);
    const recommendedPending = ref(false);
    watch(
      () => {
        var _a, _b;
        return (_b = (_a = product.value) == null ? void 0 : _a.category) == null ? void 0 : _b.slug;
      },
      async (catSlug2) => {
        if (!catSlug2 || !product.value) {
          similar.value = [];
          return;
        }
        similarPending.value = true;
        try {
          const res = await $fetch("/api/catalog/products", {
            baseURL: apiBaseUrl,
            query: {
              category: catSlug2,
              sort: "popularity",
              limit: "8",
              page: "1"
            }
          });
          const items = Array.isArray(res == null ? void 0 : res.products) ? res.products : [];
          similar.value = items.filter((x) => {
            var _a;
            return (x == null ? void 0 : x.id) !== ((_a = product.value) == null ? void 0 : _a.id);
          }).slice(0, 6);
        } catch {
          similar.value = [];
        } finally {
          similarPending.value = false;
        }
      },
      { immediate: true }
    );
    watch(
      () => {
        var _a, _b, _c;
        return {
          productId: (_a = product.value) == null ? void 0 : _a.id,
          categorySlug: (_c = (_b = product.value) == null ? void 0 : _b.category) == null ? void 0 : _c.slug
        };
      },
      async (ctx) => {
        if (!ctx.productId) {
          recommended.value = [];
          return;
        }
        recommendedPending.value = true;
        try {
          const res = await $fetch("/api/catalog/products", {
            baseURL: apiBaseUrl,
            query: {
              sort: "popularity",
              limit: "24",
              page: "1"
            }
          });
          const items = Array.isArray(res == null ? void 0 : res.products) ? res.products : [];
          const filtered = items.filter((x) => (x == null ? void 0 : x.id) !== ctx.productId).filter((x) => {
            var _a;
            const slug = (_a = x == null ? void 0 : x.category) == null ? void 0 : _a.slug;
            return ctx.categorySlug ? slug && slug !== ctx.categorySlug : true;
          });
          recommended.value = filtered.slice(0, 4);
        } catch {
          recommended.value = [];
        } finally {
          recommendedPending.value = false;
        }
      },
      { immediate: true }
    );
    const addingToCart = ref(false);
    const addError = ref(null);
    const qty = ref(1);
    useToast();
    const reviewsElId = computed(() => `reviews_${id.value}`);
    const detailsElId = computed(() => `details_${id.value}`);
    const detailsTab = ref("description");
    const descExpanded = ref(false);
    const descriptionText = computed(() => {
      var _a2;
      var _a;
      const t = String((_a2 = (_a = product.value) == null ? void 0 : _a.description) != null ? _a2 : "").trim();
      return t;
    });
    const descriptionNeedsClamp = computed(() => descriptionText.value.length > 420);
    const descriptionShown = computed(() => {
      if (!descriptionText.value) return "";
      if (descExpanded.value) return descriptionText.value;
      return descriptionNeedsClamp.value ? `${descriptionText.value.slice(0, 420).trim()}\u2026` : descriptionText.value;
    });
    computed(() => {
      var _a2;
      var _a;
      const d = String((_a2 = (_a = product.value) == null ? void 0 : _a.description) != null ? _a2 : "").trim();
      if (!d) return "";
      return d.length > 420 ? `${d.slice(0, 420)}\u2026` : d;
    });
    const inCartItem = computed(() => cartStore.items.find((i) => {
      var _a2;
      var _a;
      return i.product.id === ((_a2 = (_a = product.value) == null ? void 0 : _a.id) != null ? _a2 : -1);
    }) || null);
    const inCartQty = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = inCartItem.value) == null ? void 0 : _a.quantity) != null ? _a2 : 0;
    });
    const SPEC_GROUPS = [
      {
        title: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438",
        keys: [
          { key: "\u041D\u0430\u0431\u043E\u0440", label: "\u041D\u0430\u0431\u043E\u0440" },
          { key: "\u0426\u0432\u0435\u0442", label: "\u0426\u0432\u0435\u0442" },
          { key: "\u041E\u0431\u044A\u0451\u043C, \u043B", label: "\u041E\u0431\u044A\u0451\u043C, \u043B" },
          { key: "\u041E\u0431\u044A\u0451\u043C, \u043C\u043B", label: "\u041E\u0431\u044A\u0451\u043C, \u043C\u043B" },
          { key: "\u0412\u0438\u0434 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438", label: "\u0412\u0438\u0434 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438" },
          { key: "\u0420\u0438\u0441\u0443\u043D\u043E\u043A", label: "\u0420\u0438\u0441\u0443\u043D\u043E\u043A" },
          { key: "\u041A\u0440\u044B\u0448\u043A\u0430", label: "\u041A\u0440\u044B\u0448\u043A\u0430" },
          { key: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043A\u0440\u044B\u0448\u043A\u0438", label: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043A\u0440\u044B\u0448\u043A\u0438" },
          { key: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B", label: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B" },
          { key: "\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u0430\u044F \u043A\u0440\u044B\u0448\u043A\u0430", label: "\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u0430\u044F \u043A\u0440\u044B\u0448\u043A\u0430" },
          { key: "\u0414\u043B\u044F \u0434\u0435\u0442\u0435\u0439 \u0434\u043E 3 \u043B\u0435\u0442", label: "\u0414\u043B\u044F \u0434\u0435\u0442\u0435\u0439 \u0434\u043E 3 \u043B\u0435\u0442" },
          { key: "\u041C\u043E\u0436\u043D\u043E \u043C\u044B\u0442\u044C \u0432 \u043F\u043E\u0441\u0443\u0434\u043E\u043C\u043E\u0435\u0447\u043D\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u0435", label: "\u041C\u043E\u0436\u043D\u043E \u043C\u044B\u0442\u044C \u0432 \u043F\u043E\u0441\u0443\u0434\u043E\u043C\u043E\u0435\u0447\u043D\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u0435" },
          { key: "\u041C\u043E\u0436\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0432 \u0421\u0412\u0427-\u043F\u0435\u0447\u0438", label: "\u041C\u043E\u0436\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0432 \u0421\u0412\u0427-\u043F\u0435\u0447\u0438" },
          { key: "\u0422\u0435\u043A\u0441\u0442\u0443\u0440\u0430", label: "\u0422\u0435\u043A\u0441\u0442\u0443\u0440\u0430" },
          { key: "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435", label: "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435" },
          { key: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u0442\u043E\u0432\u0430\u0440\u0430", label: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438" }
        ]
      },
      {
        title: "\u0413\u0430\u0431\u0430\u0440\u0438\u0442\u044B \u0438 \u0432\u0435\u0441",
        keys: [
          { key: "\u0420\u0430\u0437\u043C\u0435\u0440 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)", label: "\u0420\u0430\u0437\u043C\u0435\u0440 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)" },
          { key: "\u0412\u0435\u0441 \u0431\u0440\u0443\u0442\u0442\u043E, \u0433", label: "\u0412\u0435\u0441 \u0431\u0440\u0443\u0442\u0442\u043E, \u0433" },
          // показываем системный вес тоже, если задан
          { key: "__weight", label: "\u0412\u0435\u0441 (\u0441\u043B\u0443\u0436\u0435\u0431\u043D\u044B\u0439), \u043A\u0433" }
        ]
      },
      {
        title: "\u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \u0438 \u0444\u0430\u0441\u043E\u0432\u043A\u0430",
        keys: [
          { key: "\u0412 \u0431\u043E\u043A\u0441\u0435", label: "\u0412 \u0431\u043E\u043A\u0441\u0435" },
          { key: "\u0424\u0430\u0441\u043E\u0432\u043A\u0430", label: "\u0424\u0430\u0441\u043E\u0432\u043A\u0430" },
          { key: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0430", label: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0430" },
          { key: "\u0420\u0430\u0437\u043C\u0435\u0440 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)", label: "\u0420\u0430\u0437\u043C\u0435\u0440 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)" }
        ]
      },
      {
        title: "\u041E\u0431\u0449\u0438\u0435",
        keys: [
          { key: "__article", label: "\u0410\u0440\u0442\u0438\u043A\u0443\u043B" },
          { key: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442", label: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442" },
          { key: "\u0421\u0442\u0440\u0430\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C", label: "\u0421\u0442\u0440\u0430\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C" },
          { key: "\u0421\u043E\u0441\u0442\u0430\u0432", label: "\u0421\u043E\u0441\u0442\u0430\u0432" },
          { key: "\u0421\u0435\u0440\u0438\u044F", label: "\u0421\u0435\u0440\u0438\u044F" }
        ]
      }
    ];
    const specsModalOpen = ref(false);
    function safeStr(v) {
      const s = String(v != null ? v : "").trim();
      return s ? s : null;
    }
    function formatWeight(kg) {
      if (kg === null || kg === void 0 || Number.isNaN(Number(kg))) return null;
      const n = Number(kg);
      if (n < 1) return `${Math.round(n * 1e3)} \u0433`;
      return `${n} \u043A\u0433`;
    }
    const specsData = computed(() => {
      var _a, _b, _c;
      const out = {};
      const s = (_a = product.value) == null ? void 0 : _a.specs;
      if (s && typeof s === "object") {
        for (const [k, v] of Object.entries(s)) {
          const val = safeStr(v);
          if (val) out[k] = val;
        }
      }
      const w = formatWeight((_b = product.value) == null ? void 0 : _b.weight);
      if (w) out["__weight"] = w;
      const art = safeStr((_c = product.value) == null ? void 0 : _c.article);
      if (art) out["__article"] = art;
      return out;
    });
    const groupedSpecs = computed(() => {
      const out = [];
      const s = specsData.value;
      for (const g of SPEC_GROUPS) {
        const rows = g.keys.map((k) => ({ label: k.label, value: s[k.key] })).filter((x) => !!x.value);
        if (rows.length) out.push({ title: g.title, rows });
      }
      const known = new Set(SPEC_GROUPS.flatMap((g) => g.keys.map((k) => k.key)));
      const extras = Object.keys(s).filter((k) => !known.has(k)).sort((a, b) => a.localeCompare(b)).map((k) => ({ label: k, value: s[k] }));
      if (extras.length) out.push({ title: "\u0414\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u043E", rows: extras });
      return out;
    });
    const quickSpecs = computed(() => {
      const s = specsData.value;
      const pick = [
        { key: "__article", label: "\u0410\u0440\u0442\u0438\u043A\u0443\u043B" },
        { key: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442", label: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442" },
        { key: "\u0421\u0442\u0440\u0430\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C", label: "\u0421\u0442\u0440\u0430\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C" },
        { key: "\u0421\u043E\u0441\u0442\u0430\u0432", label: "\u0421\u043E\u0441\u0442\u0430\u0432" },
        { key: "\u0421\u0435\u0440\u0438\u044F", label: "\u0421\u0435\u0440\u0438\u044F" }
      ];
      return pick.map((p) => ({ ...p, value: s[p.key] })).filter((x) => !!x.value);
    });
    watch(
      () => inCartQty.value,
      (q) => {
        if (q <= 0 && qty.value < 1) qty.value = 1;
      },
      { immediate: true }
    );
    function starFill(idx) {
      const r = Math.max(0, Math.min(5, Number(displayedRating.value) || 0));
      const full = r - (idx - 1);
      return Math.max(0, Math.min(1, full));
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ProductGallery = _sfc_main$1$1;
      const _component_ProductPriceBlock = _sfc_main$2;
      const _component_ProductAvailabilityBadge = _sfc_main$3;
      const _component_ProductCardSkeleton = __nuxt_component_4;
      const _component_ProductCard = _sfc_main$4;
      const _component_ProductReviewsBasic = _sfc_main$1;
      const _component_ClientOnly = __nuxt_component_2;
      if (unref(pending)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "text-sm text-gray-500" }, _attrs))}> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0442\u043E\u0432\u0430\u0440\u0430... </section>`);
      } else if (unref(error) || !unref(product)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "text-sm text-gray-500" }, _attrs))}> \u0422\u043E\u0432\u0430\u0440 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D </section>`);
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><nav class="text-xs text-gray-500">`);
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
        ssrRenderList(unref(breadcrumbs), (bc) => {
          _push(`<!--[--><span class="mx-1">/</span>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/catalog/${bc.slug}`,
            class: "hover:text-slate-900"
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
        _push(`<!--]-->`);
        if ((_a = unref(product)) == null ? void 0 : _a.name) {
          _push(`<span class="mx-1">/</span>`);
        } else {
          _push(`<!---->`);
        }
        if ((_b = unref(product)) == null ? void 0 : _b.name) {
          _push(`<span class="text-gray-900 font-medium">${ssrInterpolate(unref(product).name)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</nav><div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_340px] items-start">`);
        _push(ssrRenderComponent(_component_ProductGallery, {
          images: unref(images),
          alt: unref(product).name
        }, null, _parent));
        _push(`<div class="space-y-4"><header class="space-y-2"><h1 class="text-xl font-semibold leading-snug">${ssrInterpolate(unref(product).name)}</h1><div class="flex flex-wrap items-center gap-3 text-sm"><button type="button" class="inline-flex items-center gap-2"><span class="inline-flex items-center gap-0.5"><!--[-->`);
        ssrRenderList(5, (i) => {
          _push(`<span class="relative inline-flex"><svg width="16" height="16" viewBox="0 0 20 20" class="block"><defs><linearGradient${ssrRenderAttr("id", `g_${unref(product).id}_${i}`)} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#facc15"></stop><stop${ssrRenderAttr("offset", `${starFill(i) * 100}%`)} stop-color="#facc15"></stop><stop${ssrRenderAttr("offset", `${starFill(i) * 100}%`)} stop-color="#e5e7eb"></stop><stop offset="100%" stop-color="#e5e7eb"></stop></linearGradient></defs><path${ssrRenderAttr("fill", `url(#g_${unref(product).id}_${i})`)} d="M10 1.5l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.9l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.5z"></path></svg></span>`);
        });
        _push(`<!--]--></span><span class="font-semibold text-gray-900">${ssrInterpolate(unref(displayedRating) || 0)}</span></button><button type="button" class="text-xs text-gray-500 hover:text-slate-900">${ssrInterpolate(unref(displayedReviewCount))} \u043E\u0442\u0437\u044B\u0432\u043E\u0432 </button><span class="text-xs text-gray-500">${ssrInterpolate(unref(questionsCount))} \u0432\u043E\u043F\u0440\u043E\u0441\u0430</span></div><div class="flex flex-wrap items-center gap-2 text-xs text-gray-500"><span>\u0410\u0440\u0442: ${ssrInterpolate(unref(product).article)}</span>`);
        if (unref(product).category) {
          _push(`<span>\xB7 ${ssrInterpolate(unref(product).category.name)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(specsData)["\u0426\u0432\u0435\u0442"]) {
          _push(`<span>\xB7 ${ssrInterpolate(unref(specsData)["\u0426\u0432\u0435\u0442"])}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></header>`);
        if (unref(quickSpecs).length) {
          _push(`<div class="rounded-2xl border border-gray-200 bg-white"><div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"><div class="text-sm font-semibold">\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438</div>`);
          if (unref(groupedSpecs).length) {
            _push(`<button type="button" class="text-xs text-sky-700 hover:underline"> \u0412\u0441\u0435 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="px-4 py-2"><!--[-->`);
          ssrRenderList(unref(quickSpecs), (row) => {
            _push(`<div class="grid grid-cols-2 gap-3 py-2 text-sm border-b border-gray-100 last:border-b-0"><div class="text-gray-500">${ssrInterpolate(row.label)}</div><div class="text-right font-medium text-gray-900">${ssrInterpolate(row.value)}</div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><aside class="lg:sticky lg:top-4"><div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3"><div class="flex items-center justify-between gap-3">`);
        _push(ssrRenderComponent(_component_ProductPriceBlock, {
          "retail-price": unref(retailPrice),
          "wholesale-price": unref(wholesalePrice),
          mode: unref(priceMode)
        }, null, _parent));
        _push(ssrRenderComponent(_component_ProductAvailabilityBadge, {
          status: unref(availabilityStatus),
          "can-order": unref(canOrder),
          "is-available": unref(isAvailable),
          hint: unref(availabilityHint)
        }, null, _parent));
        _push(`</div><div class="flex flex-wrap items-center gap-3"><div class="inline-flex items-center rounded-full border border-gray-200 bg-white overflow-hidden"><button type="button" class="px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"${ssrIncludeBooleanAttr(!unref(canOrder)) ? " disabled" : ""}> - </button><input class="w-14 text-center text-sm py-2 outline-none"${ssrRenderAttr("value", unref(inCartQty) > 0 ? unref(inCartQty) : unref(qty))} readonly><button type="button" class="px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"${ssrIncludeBooleanAttr(!unref(canOrder)) ? " disabled" : ""}> + </button></div>`);
        if (unref(inCartQty) === 0) {
          _push(`<button type="button" class="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-900 px-6 py-2 text-sm font-medium text-white disabled:opacity-60 disabled:cursor-not-allowed"${ssrIncludeBooleanAttr(!unref(canOrder) || unref(addingToCart)) ? " disabled" : ""}>`);
          if (unref(addingToCart)) {
            _push(`<span>\u0414\u043E\u0431\u0430\u0432\u043B\u044F\u0435\u043C...</span>`);
          } else {
            _push(`<span>${ssrInterpolate(unref(canOrder) ? "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \u043A\u043E\u0440\u0437\u0438\u043D\u0443" : "\u041E\u0436\u0438\u0434\u0430\u0435\u043C \u043F\u043E\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u0435")}</span>`);
          }
          _push(`</button>`);
        } else {
          _push(`<button type="button" class="flex-1 inline-flex items-center justify-center rounded-xl border border-red-200 text-red-700 px-6 py-2 text-sm font-medium hover:bg-red-50"> \u{1F5D1} \u0423\u0434\u0430\u043B\u0438\u0442\u044C </button>`);
        }
        _push(`</div>`);
        if (unref(addError)) {
          _push(`<p class="text-xs text-red-500">${ssrInterpolate(unref(addError))}</p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(specsData)["__weight"]) {
          _push(`<div class="text-xs text-gray-500"> \u0412\u0435\u0441: ${ssrInterpolate(unref(specsData)["__weight"])}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></aside></div><section${ssrRenderAttr("id", unref(detailsElId))} class="rounded-2xl border border-gray-200 bg-white scroll-mt-24"><div class="flex items-center gap-6 px-4 pt-4 border-b border-gray-100"><button type="button" class="${ssrRenderClass([unref(detailsTab) === "description" ? "text-slate-900" : "text-gray-500 hover:text-slate-900", "relative pb-3 text-sm font-medium"])}"> \u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 `);
        if (unref(detailsTab) === "description") {
          _push(`<span class="absolute left-0 right-0 -bottom-px h-0.5 bg-sky-600"></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button><button type="button" class="${ssrRenderClass([unref(detailsTab) === "specs" ? "text-slate-900" : "text-gray-500 hover:text-slate-900", "relative pb-3 text-sm font-medium"])}"> \u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 `);
        if (unref(detailsTab) === "specs") {
          _push(`<span class="absolute left-0 right-0 -bottom-px h-0.5 bg-sky-600"></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button></div><div class="p-4">`);
        if (unref(detailsTab) === "description") {
          _push(`<div class="space-y-3"><div class="text-sm text-gray-800 whitespace-pre-line leading-relaxed">`);
          if (unref(descriptionText)) {
            _push(`<!--[-->${ssrInterpolate(unref(descriptionShown))}<!--]-->`);
          } else {
            _push(`<span class="text-gray-500">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442</span>`);
          }
          _push(`</div>`);
          if (unref(descriptionText) && unref(descriptionNeedsClamp)) {
            _push(`<button type="button" class="text-sm text-sky-700 hover:underline">${ssrInterpolate(unref(descExpanded) ? "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C" : "\u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E")}</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="space-y-6"><!--[-->`);
          ssrRenderList(unref(groupedSpecs), (g) => {
            _push(`<div class="space-y-2"><div class="text-sm font-semibold text-gray-900">${ssrInterpolate(g.title)}</div><dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white"><!--[-->`);
            ssrRenderList(g.rows, (row) => {
              _push(`<div class="grid grid-cols-2 gap-3 px-3 py-2 text-sm"><dt class="text-gray-500">${ssrInterpolate(row.label)}</dt><dd class="font-medium text-gray-900 text-right">${ssrInterpolate(row.value)}</dd></div>`);
            });
            _push(`<!--]--></dl></div>`);
          });
          _push(`<!--]-->`);
          if (!unref(groupedSpecs).length) {
            _push(`<div class="text-sm text-gray-500">\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 \u043D\u0435 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u044B.</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div></section>`);
        ssrRenderTeleport(_push, (_push2) => {
          if (unref(specsModalOpen)) {
            _push2(`<div class="fixed inset-0 z-50"><div class="absolute inset-0 bg-black/40"></div><div class="absolute inset-0 flex items-center justify-center p-4"><div class="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl"><div class="flex items-center justify-between gap-3 p-4 border-b border-gray-100"><div class="text-base font-semibold">\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 \u0442\u043E\u0432\u0430\u0440\u0430</div><button class="px-2 py-1 rounded-lg hover:bg-gray-100">\u2715</button></div><div class="p-4 overflow-auto max-h-[calc(85vh-64px)] space-y-6"><!--[-->`);
            ssrRenderList(unref(groupedSpecs), (g) => {
              _push2(`<div class="space-y-2"><div class="text-sm font-semibold">${ssrInterpolate(g.title)}</div><dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white"><!--[-->`);
              ssrRenderList(g.rows, (row) => {
                _push2(`<div class="grid grid-cols-2 gap-3 px-3 py-2 text-sm"><dt class="text-gray-500">${ssrInterpolate(row.label)}</dt><dd class="font-medium text-gray-900 text-right">${ssrInterpolate(row.value)}</dd></div>`);
              });
              _push2(`<!--]--></dl></div>`);
            });
            _push2(`<!--]-->`);
            if (!unref(groupedSpecs).length) {
              _push2(`<div class="text-sm text-gray-500">\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 \u043D\u0435 \u0437\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u044B.</div>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div></div></div></div>`);
          } else {
            _push2(`<!---->`);
          }
        }, "body", false, _parent);
        if (unref(similarPending) || unref(similar).length) {
          _push(`<section class="space-y-3"><h2 class="text-base font-semibold">\u041F\u043E\u0445\u043E\u0436\u0438\u0435 \u0442\u043E\u0432\u0430\u0440\u044B</h2>`);
          if (unref(similarPending)) {
            _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6"><!--[-->`);
            ssrRenderList(6, (n) => {
              _push(ssrRenderComponent(_component_ProductCardSkeleton, { key: n }, null, _parent));
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6"><!--[-->`);
            ssrRenderList(unref(similar), (p) => {
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
        if (unref(recommendedPending) || unref(recommended).length) {
          _push(`<section class="space-y-3"><h2 class="text-base font-semibold">\u0422\u0430\u043A\u0436\u0435 \u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u043C</h2>`);
          if (unref(recommendedPending)) {
            _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"><!--[-->`);
            ssrRenderList(4, (n) => {
              _push(ssrRenderComponent(_component_ProductCardSkeleton, { key: n }, null, _parent));
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<div class="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4"><!--[-->`);
            ssrRenderList(unref(recommended), (p) => {
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
        _push(`<section${ssrRenderAttr("id", unref(reviewsElId))} class="scroll-mt-24">`);
        _push(ssrRenderComponent(_component_ProductReviewsBasic, {
          "product-id": unref(product).id,
          "product-name": unref(product).name
        }, null, _parent));
        _push(`</section>`);
        _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
        _push(`</section>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/product/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-D5dSPBnh.mjs.map
