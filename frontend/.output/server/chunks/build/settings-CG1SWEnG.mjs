import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    const loading = ref(false);
    const saving = ref(false);
    const error = ref(null);
    const profile = ref(null);
    const form = reactive({
      companyName: "",
      displayName: "",
      logoUrl: "",
      address: "",
      city: "",
      phone: "",
      website: "",
      inn: "",
      kpp: "",
      ogrn: "",
      priceGroupId: null
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div><h1 class="text-2xl font-semibold">\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430</h1><p class="text-sm text-gray-600 mt-1"> \u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0432\u0438\u0442\u0440\u0438\u043D\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 (\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435, \u043B\u043E\u0433\u043E, \u0430\u0434\u0440\u0435\u0441) \u2014 \u0442\u0430\u043A \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0443 \u0438 \u0432\u0430\u0448\u0438\u043C \u043A\u043B\u0438\u0435\u043D\u0442\u0430\u043C \u0431\u0443\u0434\u0435\u0442 \u043F\u0440\u043E\u0449\u0435. </p></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-4"><div class="lg:col-span-2 space-y-4"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u041E\u0441\u043D\u043E\u0432\u043D\u043E\u0435</div><div class="text-xs text-gray-500 mt-1">\u0422\u043E, \u0447\u0442\u043E \u0431\u0443\u0434\u0435\u0442 \u0432\u0438\u0434\u043D\u043E \u0432 B2B \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435</div><div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3"><div class="md:col-span-2"><label class="text-xs text-gray-500">\u042E\u0440. \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (\u043A\u0430\u043A \u0432 \u0440\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u0430\u0445)</label><input${ssrRenderAttr("value", unref(form).companyName)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"></div><div class="md:col-span-2"><label class="text-xs text-gray-500">\u041F\u0443\u0431\u043B\u0438\u0447\u043D\u043E\u0435 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 (\u043A\u0430\u043A \u0431\u0443\u0434\u0435\u0442 \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0430\u0442\u044C\u0441\u044F)</label><input${ssrRenderAttr("value", unref(form).displayName)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="\u041D\u0430\u043F\u0440., \u041C\u0430\u0433\u0430\u0437\u0438\u043D \u0421\u0443\u0432\u0435\u043D\u0438\u0440\u043E\u0432 \u043D\u0430 \u041D\u0435\u0432\u0441\u043A\u043E\u043C"></div><div class="md:col-span-2"><label class="text-xs text-gray-500">\u0426\u0435\u043D\u043E\u0432\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430</label><select class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).priceGroupId) ? ssrLooseContain(unref(form).priceGroupId, null) : ssrLooseEqual(unref(form).priceGroupId, null)) ? " selected" : ""}>\u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E</option><option${ssrRenderAttr("value", 1)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).priceGroupId) ? ssrLooseContain(unref(form).priceGroupId, 1) : ssrLooseEqual(unref(form).priceGroupId, 1)) ? " selected" : ""}>\u041E\u043F\u0442-1</option><option${ssrRenderAttr("value", 2)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).priceGroupId) ? ssrLooseContain(unref(form).priceGroupId, 2) : ssrLooseEqual(unref(form).priceGroupId, 2)) ? " selected" : ""}>\u041E\u043F\u0442-2</option><option${ssrRenderAttr("value", 3)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).priceGroupId) ? ssrLooseContain(unref(form).priceGroupId, 3) : ssrLooseEqual(unref(form).priceGroupId, 3)) ? " selected" : ""}>\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0430\u044F</option></select><div class="mt-1 text-[11px] text-gray-500"> \u041F\u043E\u043A\u0430 \u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u0434\u043B\u044F MVP. \u0414\u0430\u043B\u044C\u0448\u0435 \u043C\u043E\u0436\u043D\u043E \u0431\u0443\u0434\u0435\u0442 \u043D\u0430\u0441\u0442\u0440\u0430\u0438\u0432\u0430\u0442\u044C \u0432 \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0435 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430. </div></div><div><label class="text-xs text-gray-500">\u0413\u043E\u0440\u043E\u0434</label><input${ssrRenderAttr("value", unref(form).city)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"></div><div><label class="text-xs text-gray-500">\u0422\u0435\u043B\u0435\u0444\u043E\u043D</label><input${ssrRenderAttr("value", unref(form).phone)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="+7XXXXXXXXXX"></div><div class="md:col-span-2"><label class="text-xs text-gray-500">\u0410\u0434\u0440\u0435\u0441</label><input${ssrRenderAttr("value", unref(form).address)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="\u0423\u043B\u0438\u0446\u0430, \u0434\u043E\u043C, \u043E\u0444\u0438\u0441"></div><div class="md:col-span-2"><label class="text-xs text-gray-500">\u0421\u0430\u0439\u0442 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)</label><input${ssrRenderAttr("value", unref(form).website)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="https://\u2026"></div></div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u0420\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u044B</div><div class="text-xs text-gray-500 mt-1">\u041C\u043E\u0436\u043D\u043E \u043E\u0441\u0442\u0430\u0432\u0438\u0442\u044C \u043F\u0443\u0441\u0442\u044B\u043C \u0438 \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043F\u043E\u0437\u0436\u0435</div><div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3"><div><label class="text-xs text-gray-500">\u0418\u041D\u041D</label><input${ssrRenderAttr("value", unref(form).inn)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"></div><div><label class="text-xs text-gray-500">\u041A\u041F\u041F</label><input${ssrRenderAttr("value", unref(form).kpp)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"></div><div><label class="text-xs text-gray-500">\u041E\u0413\u0420\u041D</label><input${ssrRenderAttr("value", unref(form).ogrn)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400"></div></div></div><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 text-slate-900 font-semibold disabled:opacity-50">${ssrInterpolate(unref(saving) ? "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435\u2026" : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")}</button>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b",
          class: "px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041D\u0430\u0437\u0430\u0434 \u0432 B2B `);
            } else {
              return [
                createTextVNode(" \u041D\u0430\u0437\u0430\u0434 \u0432 B2B ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><aside class="space-y-4"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u041B\u043E\u0433\u043E\u0442\u0438\u043F</div><div class="text-xs text-gray-500 mt-1">\u041C\u043E\u0436\u043D\u043E \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0443 (\u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u0441\u044F \u043A\u0430\u043A data-url)</div><div class="mt-3 flex items-center gap-3"><div class="w-16 h-16 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">`);
        if (unref(form).logoUrl) {
          _push(`<img${ssrRenderAttr("src", unref(form).logoUrl)} alt="logo" class="w-full h-full object-contain">`);
        } else {
          _push(`<span class="text-[11px] text-gray-400">\u041D\u0435\u0442</span>`);
        }
        _push(`</div><div class="flex-1"><input type="file" accept="image/*" class="text-xs">`);
        if (unref(form).logoUrl) {
          _push(`<button class="mt-2 text-xs text-gray-600 hover:text-gray-900"> \u0423\u0431\u0440\u0430\u0442\u044C \u043B\u043E\u0433\u043E\u0442\u0438\u043F </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441</div><div class="mt-1 flex items-center gap-2"><span class="${ssrRenderClass([((_a = unref(profile)) == null ? void 0 : _a.status) === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ((_b = unref(profile)) == null ? void 0 : _b.status) === "lead" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-gray-100 text-gray-700 border-gray-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(((_c = unref(profile)) == null ? void 0 : _c.status) || "\u2014")}</span><span class="text-xs text-gray-500">(\u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u044F \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u043C)</span></div></div></aside></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-CG1SWEnG.mjs.map
