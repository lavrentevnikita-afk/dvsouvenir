import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$1 } from './ScrollToTop-6gGfRGk6.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, unref, createBlock, openBlock, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
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
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "admin",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const mobileNavOpen = ref(false);
    const userLabel = computed(() => {
      const u = auth.user;
      if (!u) return "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440";
      return u.name || u.email || "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440";
    });
    const roleLabel = computed(() => {
      var _a;
      const r = (_a = auth.user) == null ? void 0 : _a.role;
      if (r === "manager") return "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440";
      if (r === "admin") return "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440";
      return "\u0421\u043E\u0442\u0440\u0443\u0434\u043D\u0438\u043A";
    });
    const nav = computed(() => {
      var _a;
      const items = [
        { to: "/admin", label: "\u0414\u044D\u0448\u0431\u043E\u0440\u0434", desc: "\u0421\u0432\u043E\u0434\u043A\u0430", icon: "\u25A6", roles: ["manager", "admin"] },
        { to: "/admin/stores", label: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B", desc: "\u0421\u043F\u0438\u0441\u043E\u043A \u0438 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044F", icon: "\u{1F3EA}", roles: ["manager", "admin"] },
        { to: "/admin/orders", label: "\u0412\u0441\u0435 \u0437\u0430\u043A\u0430\u0437\u044B", desc: "\u0421\u043F\u0438\u0441\u043E\u043A", icon: "\u{1F9FE}", roles: ["manager", "admin"] },
        { to: "/admin/in-work", label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435", desc: "\u0421\u0431\u043E\u0440\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432", icon: "\u{1F6E0}\uFE0F", roles: ["manager", "admin"] },
        { to: "/admin/shipments", label: "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438", desc: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435", icon: "\u{1F69A}", roles: ["manager", "admin"] },
        // Аналитика (только admin)
        { to: "/admin/analytics", label: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430", desc: "\u041F\u0440\u043E\u0434\u0430\u0436\u0438 \u0438 \u0434\u0435\u0444\u0438\u0446\u0438\u0442", icon: "\u{1F4CA}", roles: ["admin"] },
        // Только admin
        { to: "/admin/catalog", label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433", desc: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u0438 \u0442\u043E\u0432\u0430\u0440\u044B", icon: "\u{1F5C2}\uFE0F", roles: ["admin"] },
        { to: "/admin/promo", label: "\u041F\u0440\u043E\u043C\u043E", desc: "\u0411\u0430\u043D\u043D\u0435\u0440\u044B/\u0430\u043A\u0446\u0438\u0438", icon: "\u2728", roles: ["admin"] },
        { to: "/admin/warehouse", label: "\u0421\u043A\u043B\u0430\u0434", desc: "\u041E\u0441\u0442\u0430\u0442\u043A\u0438 \u0438 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F", icon: "\u{1F4E6}", roles: ["admin"] },
        { to: "/admin/production", label: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E", desc: "\u0417\u0430\u0434\u0430\u0447\u0438 \u043F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437", icon: "\u{1F3ED}", roles: ["admin"] },
        { to: "/admin/settings", label: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", desc: "\u0420\u043E\u043B\u0438, \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438, \u043B\u043E\u0433\u0438", icon: "\u2699\uFE0F", roles: ["admin"] },
        { to: "/admin/db", label: "\u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445", desc: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 / \u043E\u043F\u0430\u0441\u043D\u043E\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435", icon: "\u{1F9E8}", roles: ["admin"] }
      ];
      const r = (_a = auth.user) == null ? void 0 : _a.role;
      return items.filter((it) => (it.roles || []).includes(r || ""));
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ScrollToTop = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen text-slate-900 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100" }, _attrs))}><header class="sticky top-0 z-[1000] border-b border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-sm"><div class="w-full px-4 py-3 flex items-center justify-between gap-3"><div class="flex items-center gap-3"><button class="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors" aria-label="\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin",
        class: "flex items-center gap-3 group"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow"${_scopeId}><span class="text-white font-bold text-lg"${_scopeId}>S</span></span><div class="leading-tight"${_scopeId}><div class="font-bold text-base bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent"${_scopeId}>Souvenir</div><div class="text-[11px] text-slate-500 font-medium tracking-wide"${_scopeId}>ADMIN PANEL</div></div>`);
          } else {
            return [
              createVNode("span", { class: "w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow" }, [
                createVNode("span", { class: "text-white font-bold text-lg" }, "S")
              ]),
              createVNode("div", { class: "leading-tight" }, [
                createVNode("div", { class: "font-bold text-base bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent" }, "Souvenir"),
                createVNode("div", { class: "text-[11px] text-slate-500 font-medium tracking-wide" }, "ADMIN PANEL")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex items-center gap-2"><div class="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 text-xs text-slate-500"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg><span>Ctrl+K</span></div><div class="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl border border-gray-200 bg-white shadow-sm"><div class="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">${ssrInterpolate((((_a = userLabel.value) == null ? void 0 : _a[0]) || "A").toUpperCase())}</div><div class="leading-tight"><div class="text-sm font-semibold truncate max-w-[150px]">${ssrInterpolate(userLabel.value)}</div><div class="text-[11px] text-slate-500 flex items-center gap-2"><span class="inline-flex items-center gap-1"><span class="${ssrRenderClass([((_b = unref(auth).user) == null ? void 0 : _b.role) === "admin" ? "bg-emerald-500" : "bg-amber-500", "w-2 h-2 rounded-full"])}"></span> ${ssrInterpolate(roleLabel.value)}</span></div></div></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin/settings",
        class: "inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors",
        "aria-label": "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"${_scopeId}></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"${_scopeId}></path></svg>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-5 h-5 text-slate-600",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                }),
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                })
              ]))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="inline-flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors" aria-label="\u0412\u044B\u0439\u0442\u0438"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg></button></div></div></header><div class="w-full px-4 py-5 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-5 min-h-[calc(100vh-72px)] items-stretch"><aside class="md:sticky md:top-[88px] h-fit"><div class="${ssrRenderClass(mobileNavOpen.value ? "block" : "hidden md:block")}"><div class="rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm overflow-hidden shadow-sm"><div class="p-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-transparent"><div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F</div><div class="text-sm font-bold text-slate-800 mt-0.5">\u041F\u0430\u043D\u0435\u043B\u044C \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F</div></div><nav class="p-2 space-y-1"><!--[-->`);
      ssrRenderList(nav.value, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.to,
          to: item.to,
          class: "group flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 border border-transparent",
          "active-class": "!bg-gradient-to-r from-slate-100 to-slate-50 !border-slate-200 shadow-sm",
          onClick: ($event) => mobileNavOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="w-9 h-9 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"${_scopeId}><span class="text-base"${_scopeId}>${ssrInterpolate(item.icon)}</span></div><div class="min-w-0 flex-1"${_scopeId}><div class="text-sm font-medium text-slate-800"${_scopeId}>${ssrInterpolate(item.label)}</div><div class="text-[10px] text-slate-400 truncate"${_scopeId}>${ssrInterpolate(item.desc)}</div></div><svg class="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"${_scopeId}></path></svg>`);
            } else {
              return [
                createVNode("div", { class: "w-9 h-9 rounded-xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm" }, [
                  createVNode("span", { class: "text-base" }, toDisplayString(item.icon), 1)
                ]),
                createVNode("div", { class: "min-w-0 flex-1" }, [
                  createVNode("div", { class: "text-sm font-medium text-slate-800" }, toDisplayString(item.label), 1),
                  createVNode("div", { class: "text-[10px] text-slate-400 truncate" }, toDisplayString(item.desc), 1)
                ]),
                (openBlock(), createBlock("svg", {
                  class: "w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all",
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
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><div class="p-3 border-t border-gray-100 md:hidden"><button class="w-full px-3 py-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors"> \u0412\u044B\u0439\u0442\u0438 \u0438\u0437 \u0441\u0438\u0441\u0442\u0435\u043C\u044B </button></div></div><div class="mt-4 rounded-2xl border border-gray-200/80 bg-white/90 backdrop-blur-sm p-4 hidden md:block shadow-sm"><div class="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-3">\u0411\u044B\u0441\u0442\u0440\u044B\u0435 \u043A\u043B\u0430\u0432\u0438\u0448\u0438</div><div class="space-y-2 text-xs"><div class="flex items-center justify-between text-slate-600"><span>\u041F\u043E\u0438\u0441\u043A</span><kbd class="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">Ctrl+/</kbd></div><div class="flex items-center justify-between text-slate-600"><span>\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</span><kbd class="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">Ctrl+S</kbd></div><div class="flex items-center justify-between text-slate-600"><span>\u0417\u0430\u043A\u0440\u044B\u0442\u044C</span><kbd class="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px]">Esc</kbd></div></div></div></div></aside><main class="min-w-0 flex"><div class="flex-1 min-h-0 flex flex-col p-9"><div class="flex-1 min-h-0">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div></main>`);
      _push(ssrRenderComponent(_component_ScrollToTop, null, null, _parent));
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/admin.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=admin-BBfKSStl.mjs.map
