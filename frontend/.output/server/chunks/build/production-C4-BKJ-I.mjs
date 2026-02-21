import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { o as __nuxt_component_1 } from './server.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList } from 'vue/server-renderer';
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
  __name: "production",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const mobileNavOpen = ref(false);
    const userLabel = computed(() => {
      const u = auth.user;
      if (!u) return "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E";
      return u.name || u.email || "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E";
    });
    const nav = [
      { to: "/production", label: "\u041E\u0447\u0435\u0440\u0435\u0434\u044C", desc: "\u0417\u0430\u043A\u0430\u0437\u044B \u0432 \u0440\u0430\u0431\u043E\u0442\u0435", icon: "\u{1F9D1}\u200D\u{1F3ED}" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_NuxtPage = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen text-slate-900 bg-gray-50" }, _attrs))}><header class="sticky top-0 z-[1000] border-b border-gray-200 bg-white/90 backdrop-blur"><div class="w-full px-4 py-3 flex items-center justify-between gap-3"><div class="flex items-center gap-3"><button class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100" aria-label="\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E"><span class="text-lg">\u2261</span></button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/production",
        class: "flex items-center gap-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-slate-900/0 border border-gray-200 flex items-center justify-center"${_scopeId}><span class="text-emerald-700 font-semibold"${_scopeId}>P</span></span><div class="leading-tight"${_scopeId}><div class="font-semibold text-sm"${_scopeId}>Souvenir / Production</div><div class="text-[11px] text-gray-500"${_scopeId}>\u043E\u0447\u0435\u0440\u0435\u0434\u044C \u0441\u0431\u043E\u0440\u043A\u0438</div></div>`);
          } else {
            return [
              createVNode("span", { class: "w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-slate-900/0 border border-gray-200 flex items-center justify-center" }, [
                createVNode("span", { class: "text-emerald-700 font-semibold" }, "P")
              ]),
              createVNode("div", { class: "leading-tight" }, [
                createVNode("div", { class: "font-semibold text-sm" }, "Souvenir / Production"),
                createVNode("div", { class: "text-[11px] text-gray-500" }, "\u043E\u0447\u0435\u0440\u0435\u0434\u044C \u0441\u0431\u043E\u0440\u043A\u0438")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex items-center gap-2"><div class="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white"><div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs">${ssrInterpolate((((_a = userLabel.value) == null ? void 0 : _a[0]) || "P").toUpperCase())}</div><div class="leading-tight"><div class="text-xs font-medium truncate max-w-[180px]">${ssrInterpolate(userLabel.value)}</div><div class="text-[11px] text-gray-500">\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</div></div></div><button class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"><span>\u{1F6AA}</span><span class="hidden sm:inline">\u0412\u044B\u0439\u0442\u0438</span></button></div></div></header><div class="w-full px-4 py-4 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[calc(100vh-72px)] items-stretch"><aside class="md:sticky md:top-[72px] h-fit"><div class="${ssrRenderClass(mobileNavOpen.value ? "block" : "hidden md:block")}"><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200"><div class="text-xs text-gray-500">\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F</div><div class="text-sm font-semibold">Production</div></div><nav class="p-2"><!--[-->`);
      ssrRenderList(nav, (it) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: it.to,
          to: it.to,
          class: "block rounded-xl p-3 hover:bg-gray-50 border border-transparent",
          "active-class": "bg-gray-50 border-gray-200"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-start gap-3"${_scopeId}><div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm"${_scopeId}>${ssrInterpolate(it.icon)}</div><div class="leading-tight"${_scopeId}><div class="text-sm font-medium"${_scopeId}>${ssrInterpolate(it.label)}</div><div class="text-[11px] text-gray-500"${_scopeId}>${ssrInterpolate(it.desc)}</div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-start gap-3" }, [
                  createVNode("div", { class: "w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-sm" }, toDisplayString(it.icon), 1),
                  createVNode("div", { class: "leading-tight" }, [
                    createVNode("div", { class: "text-sm font-medium" }, toDisplayString(it.label), 1),
                    createVNode("div", { class: "text-[11px] text-gray-500" }, toDisplayString(it.desc), 1)
                  ])
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav></div></div></aside><main>`);
      _push(ssrRenderComponent(_component_NuxtPage, null, null, _parent));
      _push(`</main></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/production.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=production-C4-BKJ-I.mjs.map
