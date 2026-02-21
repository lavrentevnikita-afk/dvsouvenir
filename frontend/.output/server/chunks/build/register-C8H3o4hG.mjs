import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, reactive, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    useAuthStore();
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    const form = reactive({
      name: "",
      email: "",
      password: "",
      companyName: "",
      inn: "",
      kpp: "",
      ogrn: ""
    });
    const loading = ref(false);
    const error = ref(null);
    const success = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div><h1 class="text-2xl font-semibold">\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430</h1><p class="text-sm text-gray-600 mt-1"> \u0417\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0434\u0430\u043D\u043D\u044B\u0435 \u2014 \u0437\u0430\u044F\u0432\u043A\u0430 \u0443\u0439\u0434\u0451\u0442 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0443. \u0414\u043E \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u0434\u043E\u0441\u0442\u0443\u043F \u0431\u0443\u0434\u0435\u0442 \u0432 \u0441\u0442\u0430\u0442\u0443\u0441\u0435 \u201C\u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438\u201D. </p></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(success)) {
        _push(`<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"> \u0417\u0430\u044F\u0432\u043A\u0430 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430. \u041E\u0436\u0438\u0434\u0430\u0439\u0442\u0435 \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u043C. </div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<form class="grid grid-cols-1 lg:grid-cols-2 gap-3"><div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u041A\u043E\u043D\u0442\u0430\u043A\u0442</div><div class="text-xs text-gray-500 mt-1">\u0414\u0430\u043D\u043D\u044B\u0435 \u0434\u043B\u044F \u0441\u0432\u044F\u0437\u0438 \u0438 \u0432\u0445\u043E\u0434\u0430</div><div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2"><div class="md:col-span-1"><label class="text-xs text-gray-500">\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u043E\u0435 \u0438\u043C\u044F</label><input${ssrRenderAttr("value", unref(form).name)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440, \u041D\u0438\u043A\u0438\u0442\u0430"></div><div class="md:col-span-1"><label class="text-xs text-gray-500">Email</label><input${ssrRenderAttr("value", unref(form).email)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="email@company.ru"></div><div class="md:col-span-1"><label class="text-xs text-gray-500">\u041F\u0430\u0440\u043E\u043B\u044C</label><input${ssrRenderAttr("value", unref(form).password)} type="password" class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"></div></div></div><div class="lg:col-span-2 rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u0420\u0435\u043A\u0432\u0438\u0437\u0438\u0442\u044B</div><div class="text-xs text-gray-500 mt-1">\u041C\u043E\u0436\u043D\u043E \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u044C \u043C\u0438\u043D\u0438\u043C\u0443\u043C, \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0435 \u2014 \u043F\u043E\u0437\u0436\u0435</div><div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2"><div class="md:col-span-2"><label class="text-xs text-gray-500">\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043E\u0440\u0433\u0430\u043D\u0438\u0437\u0430\u0446\u0438\u0438</label><input${ssrRenderAttr("value", unref(form).companyName)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="\u041E\u041E\u041E &quot;\u0420\u043E\u043C\u0430\u0448\u043A\u0430&quot;"></div><div><label class="text-xs text-gray-500">\u0418\u041D\u041D (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)</label><input${ssrRenderAttr("value", unref(form).inn)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="1234567890"></div><div><label class="text-xs text-gray-500">\u041A\u041F\u041F (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)</label><input${ssrRenderAttr("value", unref(form).kpp)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="123456789"></div><div class="md:col-span-2"><label class="text-xs text-gray-500">\u041E\u0413\u0420\u041D (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)</label><input${ssrRenderAttr("value", unref(form).ogrn)} class="mt-1 w-full px-3 py-2 rounded-xl bg-white border border-gray-200 outline-none focus:border-amber-400" placeholder="1234567890123"></div></div></div><div class="lg:col-span-2 flex flex-col sm:flex-row sm:items-center gap-2"><button${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-300 text-slate-900 font-semibold disabled:opacity-50">${ssrInterpolate(unref(loading) ? "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430\u2026" : "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443")}</button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "px-5 py-3 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm text-center"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442? \u0412\u043E\u0439\u0442\u0438 `);
          } else {
            return [
              createTextVNode(" \u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442? \u0412\u043E\u0439\u0442\u0438 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></form></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=register-C8H3o4hG.mjs.map
