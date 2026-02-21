import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, ref, reactive, watch, mergeProps, withCtx, createTextVNode, unref, useSSRContext } from 'vue';
import { b as useRoute, u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
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
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const shopId = computed(() => Number(route.params.id));
    const loading = ref(false);
    const saving = ref(false);
    const errorUi = ref(null);
    const tab = ref("overview");
    const shop = ref(null);
    const orders = ref([]);
    const audit = ref([]);
    const form = reactive({
      status: "lead",
      discountPercent: 0,
      notes: ""
    });
    async function loadOrders() {
      if (!auth.accessToken) return;
      try {
        const res = await $fetch(`/api/admin/shops/${shopId.value}/orders`, {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        orders.value = Array.isArray(res == null ? void 0 : res.orders) ? res.orders : [];
      } catch (e) {
        orders.value = [];
      }
    }
    async function loadAudit() {
      if (!auth.accessToken) return;
      try {
        const res = await $fetch(`/api/admin/shops/${shopId.value}/audit`, {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        audit.value = Array.isArray(res == null ? void 0 : res.history) ? res.history : [];
      } catch {
        audit.value = [];
      }
    }
    watch(tab, async (t) => {
      if (t === "orders") await loadOrders();
      if (t === "audit") await loadAudit();
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex items-start justify-between gap-4"><div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/b2b/admin/stores",
        class: "text-sm text-gray-500 hover:text-gray-900"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u2190 \u041A \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430\u043C`);
          } else {
            return [
              createTextVNode("\u2190 \u041A \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430\u043C")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<h1 class="text-2xl font-semibold mt-1">${ssrInterpolate(((_a = unref(shop)) == null ? void 0 : _a.displayName) || ((_b = unref(shop)) == null ? void 0 : _b.companyName) || `\u041C\u0430\u0433\u0430\u0437\u0438\u043D #${unref(shopId)}`)}</h1><div class="text-sm text-gray-600 mt-1">`);
      if ((_c = unref(shop)) == null ? void 0 : _c.city) {
        _push(`<span>${ssrInterpolate(unref(shop).city)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (((_d = unref(shop)) == null ? void 0 : _d.city) && ((_e = unref(shop)) == null ? void 0 : _e.address)) {
        _push(`<span> \xB7 </span>`);
      } else {
        _push(`<!---->`);
      }
      if ((_f = unref(shop)) == null ? void 0 : _f.address) {
        _push(`<span>${ssrInterpolate(unref(shop).address)}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="flex items-center gap-2"><button class="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button><button class="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90"${ssrIncludeBooleanAttr(unref(saving) || unref(loading)) ? " disabled" : ""}>${ssrInterpolate(unref(saving) ? "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u2026" : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")}</button></div></div>`);
      if (unref(errorUi)) {
        _push(`<div class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3"><div class="font-medium text-red-800">${ssrInterpolate(unref(errorUi).title)}</div><div class="text-sm text-red-700 mt-1">${ssrInterpolate(unref(errorUi).text)}</div>`);
        if (unref(errorUi).actionText) {
          _push(`<button class="mt-3 px-3 py-2 rounded-xl border border-red-200 bg-white text-sm hover:bg-red-100">${ssrInterpolate(unref(errorUi).actionText)}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center gap-2"><button class="${ssrRenderClass([unref(tab) === "overview" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-gray-200 hover:bg-gray-100", "px-3 py-2 rounded-xl text-sm border"])}"> \u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 </button><button class="${ssrRenderClass([unref(tab) === "orders" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-gray-200 hover:bg-gray-100", "px-3 py-2 rounded-xl text-sm border"])}"> \u0417\u0430\u043A\u0430\u0437\u044B </button><button class="${ssrRenderClass([unref(tab) === "audit" ? "bg-slate-900 text-white border-slate-900" : "bg-white border-gray-200 hover:bg-gray-100", "px-3 py-2 rounded-xl text-sm border"])}"> \u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439 </button></div>`);
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else if (unref(tab) === "overview") {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-4"><div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-5"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div><div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441</div><select class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"><option value="lead"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "lead") : ssrLooseEqual(unref(form).status, "lead")) ? " selected" : ""}>lead</option><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "active") : ssrLooseEqual(unref(form).status, "active")) ? " selected" : ""}>active</option><option value="blocked"${ssrIncludeBooleanAttr(Array.isArray(unref(form).status) ? ssrLooseContain(unref(form).status, "blocked") : ssrLooseEqual(unref(form).status, "blocked")) ? " selected" : ""}>blocked</option></select></div><div><div class="text-xs text-gray-500">\u0421\u043A\u0438\u0434\u043A\u0430 %</div><input${ssrRenderAttr("value", unref(form).discountPercent)} type="number" min="0" max="100" step="1" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"></div><div class="md:col-span-2"><div class="text-xs text-gray-500">\u0417\u0430\u043C\u0435\u0442\u043A\u0430 (\u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u044F\u044F)</div><textarea rows="4" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0443\u0441\u043B\u043E\u0432\u0438\u044F, \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438, \u0434\u043E\u0433\u043E\u0432\u043E\u0440\u0451\u043D\u043D\u043E\u0441\u0442\u0438\u2026">${ssrInterpolate(unref(form).notes)}</textarea></div></div></div><div class="rounded-2xl border border-gray-200 bg-white p-5 space-y-3"><div class="text-sm font-semibold">\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u044B</div><div class="text-sm"><div class="text-xs text-gray-500">\u041A\u043E\u043D\u0442\u0430\u043A\u0442</div><div class="mt-1">${ssrInterpolate(((_h = (_g = unref(shop)) == null ? void 0 : _g.user) == null ? void 0 : _h.name) || "\u2014")}</div></div><div class="text-sm"><div class="text-xs text-gray-500">Email</div><div class="mt-1">${ssrInterpolate(((_j = (_i = unref(shop)) == null ? void 0 : _i.user) == null ? void 0 : _j.email) || "\u2014")}</div></div>`);
        if ((_k = unref(shop)) == null ? void 0 : _k.phone) {
          _push(`<div class="text-sm"><div class="text-xs text-gray-500">\u0422\u0435\u043B\u0435\u0444\u043E\u043D</div><div class="mt-1">${ssrInterpolate(unref(shop).phone)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_l = unref(shop)) == null ? void 0 : _l.website) {
          _push(`<div class="text-sm"><div class="text-xs text-gray-500">\u0421\u0430\u0439\u0442</div><div class="mt-1">${ssrInterpolate(unref(shop).website)}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="pt-3 border-t border-gray-100"><div class="text-xs text-gray-500">\u0417\u0430\u043A\u0430\u0437\u043E\u0432</div><div class="text-lg font-semibold mt-1">${ssrInterpolate((_a2 = (_m = unref(shop)) == null ? void 0 : _m.ordersCount) != null ? _a2 : 0)}</div>`);
        if ((_n = unref(shop)) == null ? void 0 : _n.lastOrderAt) {
          _push(`<div class="text-xs text-gray-500 mt-1">\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439: ${ssrInterpolate(new Date(unref(shop).lastOrderAt).toLocaleString())}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      } else if (unref(tab) === "orders") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-100 flex items-center justify-between"><div class="font-semibold">\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u043E\u0432</div><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C</button></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">ID</th><th class="text-left px-4 py-3">\u0414\u0430\u0442\u0430</th><th class="text-left px-4 py-3">\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-4 py-3">\u041F\u043E\u0437\u0438\u0446\u0438\u0439</th><th class="text-left px-4 py-3">\u0421\u0443\u043C\u043C\u0430</th><th class="text-right px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(orders), (o) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3 font-mono text-xs">${ssrInterpolate(o.id)}</td><td class="px-4 py-3">${ssrInterpolate(o.createdAt ? new Date(o.createdAt).toLocaleString() : "\u2014")}</td><td class="px-4 py-3"><span class="inline-flex px-2 py-1 rounded-lg border text-xs bg-gray-50 border-gray-200">${ssrInterpolate(o.status)}</span></td><td class="px-4 py-3">${ssrInterpolate(o.itemsCount)}</td><td class="px-4 py-3">${ssrInterpolate(o.totalPrice)}</td><td class="px-4 py-3 text-right">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/b2b/admin/orders?q=${encodeURIComponent(String(o.id))}`,
            class: "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0432 \u0437\u0430\u043A\u0430\u0437\u0430\u0445 `);
              } else {
                return [
                  createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0432 \u0437\u0430\u043A\u0430\u0437\u0430\u0445 ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(orders).length === 0) {
          _push(`<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      } else {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-100 flex items-center justify-between"><div class="font-semibold">\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0439</div><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C</button></div><div class="p-4 space-y-2 max-h-[70vh] overflow-auto"><!--[-->`);
        ssrRenderList(unref(audit), (h) => {
          _push(`<div class="rounded-xl border border-gray-200 p-3"><div class="flex items-center justify-between"><div class="text-sm font-medium">${ssrInterpolate(h.action)}</div><div class="text-xs text-gray-500">${ssrInterpolate(new Date(h.createdAt).toLocaleString())}</div></div>`);
          if (h.meta) {
            _push(`<pre class="mt-2 text-xs bg-gray-50 border border-gray-200 rounded-lg p-2 overflow-auto">${ssrInterpolate(JSON.stringify(h.meta, null, 2))}</pre>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]-->`);
        if (unref(audit).length === 0) {
          _push(`<div class="text-sm text-gray-500">\u041F\u043E\u043A\u0430 \u043F\u0443\u0441\u0442\u043E</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/stores/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-D2OCCbtZ.mjs.map
