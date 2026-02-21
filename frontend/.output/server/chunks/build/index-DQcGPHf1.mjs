import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { n as navigateTo } from './server.mjs';
import { u as useHead } from './index-CCqbQxu4.mjs';
import { defineComponent, mergeProps, withCtx, createVNode, createBlock, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    var _a;
    const authStore = useAuthStore();
    if (!["manager", "admin"].includes(((_a = authStore.user) == null ? void 0 : _a.role) || "")) {
      navigateTo("/");
    }
    useHead({
      title: "\u041F\u0430\u043D\u0435\u043B\u044C \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50" }, _attrs))}><div class="container mx-auto px-4 py-8"><h1 class="text-3xl font-bold mb-6">\u041F\u0430\u043D\u0435\u043B\u044C \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u0430</h1><div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"><div class="bg-white rounded-lg shadow-sm p-6"><div class="flex items-center justify-between"><div><p class="text-gray-600 text-sm">\u041D\u043E\u0432\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B</p><p class="text-3xl font-bold text-blue-600 mt-2">-</p></div><div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div></div></div><div class="bg-white rounded-lg shadow-sm p-6"><div class="flex items-center justify-between"><div><p class="text-gray-600 text-sm">\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435</p><p class="text-3xl font-bold text-yellow-600 mt-2">-</p></div><div class="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div></div></div><div class="bg-white rounded-lg shadow-sm p-6"><div class="flex items-center justify-between"><div><p class="text-gray-600 text-sm">\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u044B\u0435</p><p class="text-3xl font-bold text-green-600 mt-2">-</p></div><div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></div></div></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-6">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/manager/orders",
        class: "bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex items-center gap-4"${_scopeId}><div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0"${_scopeId}><svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"${_scopeId}></path></svg></div><div${_scopeId}><h3 class="text-lg font-semibold"${_scopeId}>\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043C\u0438</h3><p class="text-sm text-gray-600 mt-1"${_scopeId}>\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0432\u0441\u0435\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432</p></div><svg class="w-5 h-5 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"${_scopeId}></path></svg></div>`);
          } else {
            return [
              createVNode("div", { class: "flex items-center gap-4" }, [
                createVNode("div", { class: "w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0" }, [
                  (openBlock(), createBlock("svg", {
                    class: "w-6 h-6 text-blue-600",
                    fill: "none",
                    viewBox: "0 0 24 24",
                    stroke: "currentColor"
                  }, [
                    createVNode("path", {
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      "stroke-width": "2",
                      d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    })
                  ]))
                ]),
                createVNode("div", null, [
                  createVNode("h3", { class: "text-lg font-semibold" }, "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043C\u0438"),
                  createVNode("p", { class: "text-sm text-gray-600 mt-1" }, "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0438 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0432\u0441\u0435\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432")
                ]),
                (openBlock(), createBlock("svg", {
                  class: "w-5 h-5 text-gray-400 ml-auto",
                  fill: "none",
                  viewBox: "0 0 24 24",
                  stroke: "currentColor"
                }, [
                  createVNode("path", {
                    "stroke-linecap": "round",
                    "stroke-linejoin": "round",
                    "stroke-width": "2",
                    d: "M9 5l7 7-7 7"
                  })
                ]))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="bg-white rounded-lg shadow-sm p-6 opacity-50 cursor-not-allowed"><div class="flex items-center gap-4"><div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"><svg class="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg></div><div><h3 class="text-lg font-semibold">\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430</h3><p class="text-sm text-gray-600 mt-1">\u0421\u043A\u043E\u0440\u043E...</p></div></div></div></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/manager/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DQcGPHf1.mjs.map
