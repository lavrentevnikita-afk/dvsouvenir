import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, watch, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { u as useRuntimeConfig, c as useRouter } from './server.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "stores",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    useRouter();
    const status = ref("");
    const city = ref("");
    const q = ref("");
    const loading = ref(false);
    const error = ref(null);
    const shops = ref([]);
    function buildQuery() {
      const out = {};
      if (status.value) out.status = status.value;
      if (city.value.trim()) out.city = city.value.trim();
      if (q.value.trim()) out.q = q.value.trim();
      return out;
    }
    async function load() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/shops", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: buildQuery()
        });
        shops.value = Array.isArray(res == null ? void 0 : res.shops) ? res.shops : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B";
      } finally {
        loading.value = false;
      }
    }
    watch([status, city], load);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B</h1><p class="text-sm text-gray-600 mt-1">\u0415\u0434\u0438\u043D\u0430\u044F CRM: \u0437\u0430\u044F\u0432\u043A\u0438, \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0438 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435</p></div><div class="flex flex-col sm:flex-row items-start sm:items-center gap-2"><div class="flex items-center gap-2"><label class="text-xs text-gray-600">\u0421\u0442\u0430\u0442\u0443\u0441</label><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "") : ssrLooseEqual(unref(status), "")) ? " selected" : ""}>\u0432\u0441\u0435</option><option value="lead"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "lead") : ssrLooseEqual(unref(status), "lead")) ? " selected" : ""}>lead</option><option value="active"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "active") : ssrLooseEqual(unref(status), "active")) ? " selected" : ""}>active</option><option value="blocked"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "blocked") : ssrLooseEqual(unref(status), "blocked")) ? " selected" : ""}>blocked</option></select></div><input${ssrRenderAttr("value", unref(city))} class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm" placeholder="\u0413\u043E\u0440\u043E\u0434"><div class="flex items-center gap-2"><input${ssrRenderAttr("value", unref(q))} class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm w-[260px] max-w-full" placeholder="\u041F\u043E\u0438\u0441\u043A: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435, email, \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u2026"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041D\u0430\u0439\u0442\u0438 </button></div></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u041C\u0430\u0433\u0430\u0437\u0438\u043D</th><th class="text-left px-4 py-3">\u0413\u043E\u0440\u043E\u0434</th><th class="text-left px-4 py-3">\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-4 py-3">\u0421\u043A\u0438\u0434\u043A\u0430%</th><th class="text-left px-4 py-3">\u041A\u043E\u043D\u0442\u0430\u043A\u0442</th><th class="text-left px-4 py-3">\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0437\u0430\u043A\u0430\u0437</th><th class="text-right px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(shops), (s) => {
          var _a2;
          var _a, _b;
          _push(`<tr class="border-t border-gray-100 align-top"><td class="px-4 py-3"><div class="font-medium">${ssrInterpolate(s.displayName || s.companyName)}</div>`);
          if (s.address) {
            _push(`<div class="text-xs text-gray-500">${ssrInterpolate(s.address)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (s.notes) {
            _push(`<div class="text-xs text-gray-500">\u{1F4DD} ${ssrInterpolate(s.notes)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3"><div>${ssrInterpolate(s.city || "\u2014")}</div></td><td class="px-4 py-3"><span class="${ssrRenderClass([
            s.status === "active" ? "bg-green-50 border-green-200 text-green-800" : s.status === "blocked" ? "bg-red-50 border-red-200 text-red-800" : "bg-amber-50 border-amber-200 text-amber-800",
            "inline-flex items-center px-2 py-1 rounded-lg text-xs border"
          ])}">${ssrInterpolate(s.status)}</span></td><td class="px-4 py-3"><div class="text-sm">${ssrInterpolate(Number((_a2 = s.discountPercent) != null ? _a2 : 0))}%</div></td><td class="px-4 py-3"><div>${ssrInterpolate(((_a = s.user) == null ? void 0 : _a.name) || "\u2014")}</div><div class="text-xs text-gray-500">${ssrInterpolate((_b = s.user) == null ? void 0 : _b.email)}</div>`);
          if (s.phone) {
            _push(`<div class="text-xs text-gray-500">${ssrInterpolate(s.phone)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3">`);
          if (s.lastOrderAt) {
            _push(`<div class="text-sm">${ssrInterpolate(new Date(s.lastOrderAt).toLocaleString())}</div>`);
          } else {
            _push(`<div class="text-xs text-gray-400">\u2014</div>`);
          }
          if (s.ordersCount) {
            _push(`<div class="text-xs text-gray-500">\u0417\u0430\u043A\u0430\u0437\u043E\u0432: ${ssrInterpolate(s.ordersCount)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 text-right">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/b2b/admin/stores/${s.id}`,
            class: "inline-flex items-center px-3 py-2 rounded-xl bg-slate-900 text-white text-xs hover:opacity-90"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u041E\u0442\u043A\u0440\u044B\u0442\u044C `);
              } else {
                return [
                  createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(shops).length === 0) {
          _push(`<tr><td colspan="7" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/stores.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=stores-CTxDtpcU.mjs.map
