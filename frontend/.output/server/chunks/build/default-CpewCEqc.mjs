import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { c as useRouter, u as useRuntimeConfig, k as __nuxt_component_2, b as useRoute } from './server.mjs';
import { defineComponent, withAsyncContext, computed, ref, watch, mergeProps, withCtx, createVNode, unref, createTextVNode, toDisplayString, createBlock, createCommentVNode, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrInterpolate, ssrRenderSlot, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderAttr } from 'vue/server-renderer';
import { u as useCityStore } from './city-CtecIgg_.mjs';
import { _ as _sfc_main$3 } from './ScrollToTop-6gGfRGk6.mjs';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
import { u as useCartStore } from './cart-DZFIURht.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { u as useFavoritesStore } from './favorites-CzyYdspe.mjs';
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

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "SmartSearchBar",
  __ssrInlineRender: true,
  props: {
    placeholder: {},
    maxWidthClass: {}
  },
  setup(__props) {
    useRouter();
    const route = useRoute();
    const cityStore = useCityStore();
    const term = ref("");
    const isOpen = ref(false);
    const isLoading = ref(false);
    const correctedQuery = ref(null);
    const products = ref([]);
    const categories = ref([]);
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    function resolveUrl(url) {
      if (!url) return "";
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      return `${apiBaseUrl}${url}`;
    }
    function firstImage(p) {
      var _a, _b;
      const u = (_b = (_a = p == null ? void 0 : p.images) == null ? void 0 : _a[0]) == null ? void 0 : _b.url;
      return resolveUrl(u);
    }
    let t = null;
    watch(
      () => term.value,
      (v) => {
        correctedQuery.value = null;
        const q = v.trim();
        if (!q) {
          products.value = [];
          categories.value = [];
          isOpen.value = false;
          if (t) clearTimeout(t);
          return;
        }
        isOpen.value = true;
        if (t) clearTimeout(t);
        t = setTimeout(async () => {
          var _a, _b, _c;
          isLoading.value = true;
          try {
            const res = await $fetch("/api/catalog/suggest", {
              baseURL: apiBaseUrl,
              query: {
                query: q,
                limit: 8,
                ...cityStore.code ? { city: cityStore.code } : {}
              }
            });
            products.value = (_a = res == null ? void 0 : res.products) != null ? _a : [];
            categories.value = (_b = res == null ? void 0 : res.categories) != null ? _b : [];
            correctedQuery.value = (_c = res == null ? void 0 : res.correctedQuery) != null ? _c : null;
          } catch {
            products.value = [];
            categories.value = [];
          } finally {
            isLoading.value = false;
          }
        }, 150);
      },
      { immediate: true }
    );
    watch(
      () => route.fullPath,
      () => {
        isOpen.value = false;
      }
    );
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        "data-smart-search": "",
        class: ["relative hidden md:flex flex-1 items-center", __props.maxWidthClass || "max-w-sm"]
      }, _attrs))}><form class="w-full flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 bg-gray-50"><input${ssrRenderAttr("value", unref(term))} type="text" class="flex-1 bg-transparent text-xs outline-none"${ssrRenderAttr("placeholder", __props.placeholder || "\u041F\u043E\u0438\u0441\u043A \u043F\u043E \u0442\u043E\u0432\u0430\u0440\u0430\u043C...")} autocomplete="off"><button type="submit" class="text-[11px] font-medium text-slate-700 hover:text-slate-900"> \u041D\u0430\u0439\u0442\u0438 </button></form>`);
      if (unref(isOpen)) {
        _push(`<div class="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden z-[999]">`);
        if (unref(isLoading)) {
          _push(`<div class="px-4 py-3 text-xs text-gray-500"> \u0418\u0449\u0443\u2026 </div>`);
        } else {
          _push(`<div class="max-h-[420px] overflow-auto">`);
          if (unref(correctedQuery)) {
            _push(`<button type="button" class="w-full text-left px-4 py-2 text-xs bg-gray-50 hover:bg-gray-100 border-b border-gray-200"> \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u0432\u044B \u0438\u043C\u0435\u043B\u0438 \u0432 \u0432\u0438\u0434\u0443: <span class="font-semibold">${ssrInterpolate(unref(correctedQuery))}</span></button>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(categories).length) {
            _push(`<div class="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-500"> \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(categories), (c) => {
            _push(`<button type="button" class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"><div class="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">`);
            if (c.imageUrl) {
              _push(`<img${ssrRenderAttr("src", resolveUrl(c.imageUrl))}${ssrRenderAttr("alt", c.name)} class="h-full w-full object-cover">`);
            } else {
              _push(`<div class="text-[10px] text-gray-400">#</div>`);
            }
            _push(`</div><div class="flex-1 min-w-0"><div class="truncate font-medium text-gray-900">${ssrInterpolate(c.name)}</div><div class="truncate text-[11px] text-gray-500">/catalog/${ssrInterpolate(c.slug)}</div></div></button>`);
          });
          _push(`<!--]-->`);
          if (unref(products).length) {
            _push(`<div class="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-500"> \u0422\u043E\u0432\u0430\u0440\u044B </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(products), (p) => {
            var _a;
            _push(`<button type="button" class="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50"><div class="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden shrink-0">`);
            if (firstImage(p)) {
              _push(`<img${ssrRenderAttr("src", firstImage(p))}${ssrRenderAttr("alt", p.name)} class="h-full w-full object-cover">`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="flex-1 min-w-0"><div class="truncate font-medium text-gray-900">${ssrInterpolate(p.name)}</div><div class="flex items-center gap-2 text-[11px] text-gray-500">`);
            if (p.article) {
              _push(`<span>\u0410\u0440\u0442: ${ssrInterpolate(p.article)}</span>`);
            } else {
              _push(`<!---->`);
            }
            if ((_a = p.category) == null ? void 0 : _a.name) {
              _push(`<span class="truncate">\u2014 ${ssrInterpolate(p.category.name)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div></button>`);
          });
          _push(`<!--]-->`);
          if (!unref(categories).length && !unref(products).length) {
            _push(`<div class="px-4 py-3 text-xs text-gray-500"> \u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E. \u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0435 \u043D\u0430\u043F\u0438\u0441\u0430\u043D\u0438\u0435. </div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/SmartSearchBar.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "CityPicker",
  __ssrInlineRender: true,
  setup(__props) {
    const cityStore = useCityStore();
    const value = computed({
      get: () => {
        var _a;
        return (_a = cityStore.code) != null ? _a : "";
      },
      set: (v) => cityStore.setCity(v || null)
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-2" }, _attrs))}><span class="hidden sm:inline text-[11px] text-gray-500">\u0413\u043E\u0440\u043E\u0434</span><select class="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[11px] outline-none focus:border-slate-400"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(value)) ? ssrLooseContain(unref(value), "") : ssrLooseEqual(unref(value), "")) ? " selected" : ""}>\u0412\u0441\u0435 \u0433\u043E\u0440\u043E\u0434\u0430</option><!--[-->`);
      ssrRenderList(unref(cityStore).cities, (c) => {
        _push(`<option${ssrRenderAttr("value", c.code)}${ssrIncludeBooleanAttr(Array.isArray(unref(value)) ? ssrLooseContain(unref(value), c.code) : ssrLooseEqual(unref(value), c.code)) ? " selected" : ""}>${ssrInterpolate(c.name)}</option>`);
      });
      _push(`<!--]--></select></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CityPicker.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const router = useRouter();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const { data: headerCategories } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "header-categories",
      () => $fetch("/api/catalog/categories", {
        baseURL: apiBaseUrl
      })
    )), __temp = await __temp, __restore(), __temp);
    const categoriesTree = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = headerCategories.value) == null ? void 0 : _a.categories) != null ? _a2 : [];
    });
    const categoriesForHeader = computed(() => {
      const limit = activeHoliday.value ? 5 : 6;
      return [...categoriesTree.value].sort((a, b) => {
        var _a, _b;
        return ((_a = b.productsCount) != null ? _a : 0) - ((_b = a.productsCount) != null ? _b : 0);
      }).slice(0, limit);
    });
    const catalogOpen = ref(false);
    const activeRootSlug = ref(null);
    watch(
      () => router.currentRoute.value.fullPath,
      () => {
        catalogOpen.value = false;
      }
    );
    const activeHoliday = computed(() => {
      const now = /* @__PURE__ */ new Date();
      const m = now.getMonth() + 1;
      const d = now.getDate();
      if (m === 12 && d >= 1 || m === 1 && d <= 15) return "\u041D\u043E\u0432\u044B\u0439 \u0433\u043E\u0434";
      if (m === 2 && d >= 15 && d <= 28) return "23 \u0444\u0435\u0432\u0440\u0430\u043B\u044F";
      if (m === 3 && d >= 1 && d <= 10) return "8 \u043C\u0430\u0440\u0442\u0430";
      if (m === 8 && d >= 15 || m === 9 && d <= 10) return "1 \u0441\u0435\u043D\u0442\u044F\u0431\u0440\u044F";
      return null;
    });
    const cartStore = useCartStore();
    const favStore = useFavoritesStore();
    const authStore = useAuthStore();
    useCityStore();
    const cartCount = computed(() => cartStore.totalItems);
    const favCount = computed(() => favStore.total);
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const currentUser = computed(() => authStore.user);
    const isB2BUser = computed(() => {
      var _a;
      const role = (_a = currentUser.value) == null ? void 0 : _a.role;
      return role === "store" || role === "manager";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_SmartSearchBar = _sfc_main$2;
      const _component_ClientOnly = __nuxt_component_2;
      const _component_ScrollToTop = _sfc_main$3;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex flex-col bg-gray-50" }, _attrs))}><header class="sticky top-0 z-[1000] bg-white border-b border-gray-200"><div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4"><div class="flex items-center gap-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "flex items-center gap-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white"${_scopeId}> SS </span><span class="text-sm font-semibold tracking-tight"${_scopeId}> Souvenir Shop </span>`);
          } else {
            return [
              createVNode("span", { class: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white" }, " SS "),
              createVNode("span", { class: "text-sm font-semibold tracking-tight" }, " Souvenir Shop ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<nav class="hidden md:flex items-center gap-3 text-xs font-medium text-gray-600"><div class="relative"><button type="button" class="${ssrRenderClass([{ "text-slate-900": unref(catalogOpen) }, "inline-flex items-center gap-1 hover:text-slate-900 transition-colors"])}"><span>\u041A\u0430\u0442\u0430\u043B\u043E\u0433</span><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6"></path></svg></button>`);
      if (unref(catalogOpen)) {
        _push(`<div class="absolute left-0 mt-2 w-[560px] rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"><div class="grid grid-cols-2"><div class="border-r border-gray-100 p-2 max-h-[360px] overflow-auto"><!--[-->`);
        ssrRenderList(unref(categoriesTree), (c) => {
          _push(`<button type="button" class="${ssrRenderClass([{ "bg-gray-50 text-slate-900 font-semibold": unref(activeRootSlug) === c.slug }, "w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-gray-50"])}">${ssrInterpolate(c.name)}</button>`);
        });
        _push(`<!--]--></div><div class="p-2 max-h-[360px] overflow-auto"><!--[-->`);
        ssrRenderList(unref(categoriesTree), (root) => {
          _push(`<!--[-->`);
          if (root.slug === unref(activeRootSlug)) {
            _push(`<div class="space-y-1">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/catalog/${root.slug}`,
              class: "block px-3 py-2 rounded-xl text-sm font-semibold text-slate-900 hover:bg-gray-50",
              onClick: ($event) => catalogOpen.value = false
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` \u0412\u0441\u0435 \u0442\u043E\u0432\u0430\u0440\u044B \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 `);
                } else {
                  return [
                    createTextVNode(" \u0412\u0441\u0435 \u0442\u043E\u0432\u0430\u0440\u044B \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<div class="h-px bg-gray-100 my-1"></div><!--[-->`);
            ssrRenderList(root.children || [], (ch) => {
              _push(ssrRenderComponent(_component_NuxtLink, {
                key: ch.slug,
                to: `/catalog/${ch.slug}`,
                class: "block px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-slate-900",
                onClick: ($event) => catalogOpen.value = false
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`${ssrInterpolate(ch.name)}`);
                  } else {
                    return [
                      createTextVNode(toDisplayString(ch.name), 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(isB2BUser)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b",
          class: "hover:text-slate-900 transition-colors",
          "active-class": "text-slate-900"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` B2B `);
            } else {
              return [
                createTextVNode(" B2B ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      if (unref(isAuthenticated)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/account",
          class: "hover:text-slate-900 transition-colors",
          "active-class": "text-slate-900"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B `);
            } else {
              return [
                createTextVNode(" \u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</nav></div><div class="flex-1 flex items-center justify-end gap-3">`);
      _push(ssrRenderComponent(_sfc_main$1, null, null, _parent));
      _push(ssrRenderComponent(_component_SmartSearchBar, null, null, _parent));
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-2 text-xs"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_NuxtLink, {
              to: "/login",
              class: "text-[11px] font-medium text-slate-700 hover:text-slate-900"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` \u0412\u043E\u0439\u0442\u0438 `);
                } else {
                  return [
                    createTextVNode(" \u0412\u043E\u0439\u0442\u0438 ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-2 text-xs" }, [
                createVNode(_component_NuxtLink, {
                  to: "/login",
                  class: "text-[11px] font-medium text-slate-700 hover:text-slate-900"
                }, {
                  default: withCtx(() => [
                    createTextVNode(" \u0412\u043E\u0439\u0442\u0438 ")
                  ]),
                  _: 1
                })
              ])
            ];
          }
        })
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/favorites",
        class: "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-slate-900 hover:border-slate-300",
        title: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-4.6-9.5-9.1C.6 8.2 2.4 5 5.8 5c2 0 3.3 1.1 4.2 2.2C10.9 6.1 12.2 5 14.2 5c3.4 0 5.2 3.2 3.3 6.9C19 16.4 12 21 12 21z"${_scopeId}></path></svg>`);
            if (unref(favCount) > 0) {
              _push2(`<span class="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white"${_scopeId}>${ssrInterpolate(unref(favCount))}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              (openBlock(), createBlock("svg", {
                viewBox: "0 0 24 24",
                class: "h-4 w-4",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "M12 21s-7-4.6-9.5-9.1C.6 8.2 2.4 5 5.8 5c2 0 3.3 1.1 4.2 2.2C10.9 6.1 12.2 5 14.2 5c3.4 0 5.2 3.2 3.3 6.9C19 16.4 12 21 12 21z"
                })
              ])),
              unref(favCount) > 0 ? (openBlock(), createBlock("span", {
                key: 0,
                class: "absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-semibold text-white"
              }, toDisplayString(unref(favCount)), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/cart",
        class: "inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>\u041A\u043E\u0440\u0437\u0438\u043D\u0430</span>`);
            if (unref(cartCount) > 0) {
              _push2(`<span class="inline-flex min-w-[20px] justify-center rounded-full bg-white/10 px-1 text-[11px]"${_scopeId}>${ssrInterpolate(unref(cartCount))}</span>`);
            } else {
              _push2(`<!---->`);
            }
          } else {
            return [
              createVNode("span", null, "\u041A\u043E\u0440\u0437\u0438\u043D\u0430"),
              unref(cartCount) > 0 ? (openBlock(), createBlock("span", {
                key: 0,
                class: "inline-flex min-w-[20px] justify-center rounded-full bg-white/10 px-1 text-[11px]"
              }, toDisplayString(unref(cartCount)), 1)) : createCommentVNode("", true)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="bg-slate-900"><div class="max-w-6xl mx-auto px-4 py-2 flex items-center gap-2 overflow-x-auto">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/search?q=\u0430\u043A\u0446\u0438\u0438",
        class: "shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white hover:bg-white/15"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M13 3s-1 2-1 3c0 2 2 3 2 5 0 2-1 3-2 4 0-2-2-3-2-6 0-2 1-4 3-6z"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" d="M12 21a7 7 0 0 0 7-7c0-2.2-1-3.8-2.4-5.1.2 1.7-.5 3.1-1.6 4.2.1-2.6-1.4-4.3-3-5.6C9.2 9 8 11 8 13c0 1.5.7 2.7 1.7 3.7C8.3 16.3 7.5 15 7.3 13.4A7 7 0 0 0 5 14a7 7 0 0 0 7 7z"${_scopeId}></path></svg><span${_scopeId}>\u0410\u043A\u0446\u0438\u0438</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                viewBox: "0 0 24 24",
                class: "h-4 w-4",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "M13 3s-1 2-1 3c0 2 2 3 2 5 0 2-1 3-2 4 0-2-2-3-2-6 0-2 1-4 3-6z"
                }),
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "M12 21a7 7 0 0 0 7-7c0-2.2-1-3.8-2.4-5.1.2 1.7-.5 3.1-1.6 4.2.1-2.6-1.4-4.3-3-5.6C9.2 9 8 11 8 13c0 1.5.7 2.7 1.7 3.7C8.3 16.3 7.5 15 7.3 13.4A7 7 0 0 0 5 14a7 7 0 0 0 7 7z"
                })
              ])),
              createVNode("span", null, "\u0410\u043A\u0446\u0438\u0438")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/search?q=\u043D\u043E\u0432\u0438\u043D\u043A\u0438",
        class: "shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white hover:bg-white/15"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M12 2l1.2 4.2L17.4 8l-4.2 1.2L12 13.4 10.8 9.2 6.6 8l4.2-1.8L12 2z"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" d="M5 12l.9 3.1L9 16l-3.1.9L5 20l-.9-3.1L1 16l3.1-.9L5 12z"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" d="M19 12l.9 3.1L23 16l-3.1.9L19 20l-.9-3.1L15 16l3.1-.9L19 12z"${_scopeId}></path></svg><span${_scopeId}>\u041D\u043E\u0432\u0438\u043D\u043A\u0438</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                viewBox: "0 0 24 24",
                class: "h-4 w-4",
                fill: "none",
                stroke: "currentColor",
                "stroke-width": "2"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "M12 2l1.2 4.2L17.4 8l-4.2 1.2L12 13.4 10.8 9.2 6.6 8l4.2-1.8L12 2z"
                }),
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "M5 12l.9 3.1L9 16l-3.1.9L5 20l-.9-3.1L1 16l3.1-.9L5 12z"
                }),
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  d: "M19 12l.9 3.1L23 16l-3.1.9L19 20l-.9-3.1L15 16l3.1-.9L19 12z"
                })
              ])),
              createVNode("span", null, "\u041D\u043E\u0432\u0438\u043D\u043A\u0438")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(activeHoliday)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: `/search?q=${encodeURIComponent(unref(activeHoliday))}`,
          class: "shrink-0 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-semibold text-white hover:bg-white/15"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" d="M12 2v8"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" d="M9 6h6"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" d="M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z"${_scopeId}></path></svg><span${_scopeId}>${ssrInterpolate(unref(activeHoliday))}</span>`);
            } else {
              return [
                (openBlock(), createBlock("svg", {
                  viewBox: "0 0 24 24",
                  class: "h-4 w-4",
                  fill: "none",
                  stroke: "currentColor",
                  "stroke-width": "2"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M12 2v8"
                  }),
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M9 6h6"
                  }),
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    d: "M6 10h12v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V10z"
                  })
                ])),
                createVNode("span", null, toDisplayString(unref(activeHoliday)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="h-5 w-px bg-white/15 mx-1 shrink-0"></div><!--[-->`);
      ssrRenderList(unref(categoriesForHeader), (c) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: c.slug,
          to: `/catalog/${c.slug}`,
          class: "shrink-0 px-2 py-1 text-[12px] font-medium text-white/80 hover:text-white",
          "active-class": "text-white"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(c.name)}`);
            } else {
              return [
                createTextVNode(toDisplayString(c.name), 1)
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></div></div></header><main class="flex-1 max-w-6xl mx-auto w-full px-4 py-4">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main>`);
      _push(ssrRenderComponent(_component_ScrollToTop, null, null, _parent));
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=default-CpewCEqc.mjs.map
