import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$1 } from './ScrollToTop-6gGfRGk6.mjs';
import { defineComponent, ref, computed, mergeProps, withCtx, createVNode, unref, toDisplayString, useSSRContext } from 'vue';
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
  __name: "b2b",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const mobileNavOpen = ref(false);
    const userLabel = computed(() => {
      const u = auth.user;
      if (!u) return "\u0413\u043E\u0441\u0442\u044C";
      return u.name || u.email;
    });
    const roleLabel = computed(() => {
      var _a;
      const r = (_a = auth.user) == null ? void 0 : _a.role;
      if (r === "store") return "\u041C\u0430\u0433\u0430\u0437\u0438\u043D";
      if (r === "manager") return "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440";
      if (r === "admin") return "\u0410\u0434\u043C\u0438\u043D";
      return "\u0420\u043E\u0437\u043D\u0438\u0446\u0430";
    });
    const nav = computed(() => {
      var _a;
      const role = (_a = auth.user) == null ? void 0 : _a.role;
      if (role === "admin") {
        return [
          { to: "/b2b", label: "\u0414\u044D\u0448\u0431\u043E\u0440\u0434", desc: "\u0421\u0432\u043E\u0434\u043A\u0430", icon: "\u25A6" },
          { to: "/b2b/admin/catalog", label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433", desc: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u0438 \u0442\u043E\u0432\u0430\u0440\u044B", icon: "\u{1F5C2}\uFE0F" },
          { to: "/b2b/admin/promo", label: "\u041F\u0440\u043E\u043C\u043E", desc: "\u0411\u0430\u043D\u043D\u0435\u0440\u044B/\u0430\u043A\u0446\u0438\u0438", icon: "\u2728" },
          { to: "/b2b/admin/stores", label: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B", desc: "CRM", icon: "\u{1F3EA}" },
          { to: "/b2b/admin/orders", label: "\u0412\u0441\u0435 \u0437\u0430\u043A\u0430\u0437\u044B", desc: "\u0421\u043F\u0438\u0441\u043E\u043A", icon: "\u{1F9FE}" },
          { to: "/b2b/admin/in-work", label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435", desc: "\u0421\u0431\u043E\u0440\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432", icon: "\u{1F6E0}\uFE0F" },
          { to: "/b2b/admin/shipments", label: "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438", desc: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435", icon: "\u{1F69A}" },
          { to: "/b2b/admin/warehouse", label: "\u0421\u043A\u043B\u0430\u0434", desc: "\u041E\u0441\u0442\u0430\u0442\u043A\u0438 \u0438 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F", icon: "\u{1F4E6}" },
          { to: "/b2b/admin/production", label: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E", desc: "\u0417\u0430\u0434\u0430\u0447\u0438 \u043F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437", icon: "\u{1F3ED}" },
          { to: "/b2b/admin/settings", label: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", desc: "\u0420\u043E\u043B\u0438, \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438, \u043B\u043E\u0433\u0438", icon: "\u2699\uFE0F" },
          { to: "/b2b/admin/db", label: "\u0411\u0430\u0437\u0430 \u0434\u0430\u043D\u043D\u044B\u0445", desc: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 / \u043E\u043F\u0430\u0441\u043D\u043E\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435", icon: "\u{1F9E8}" }
        ];
      }
      if (role === "manager") {
        return [
          { to: "/b2b", label: "\u0414\u044D\u0448\u0431\u043E\u0440\u0434", desc: "\u0421\u0432\u043E\u0434\u043A\u0430", icon: "\u25A6" },
          { to: "/b2b/admin/stores", label: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B", desc: "CRM", icon: "\u{1F3EA}" },
          { to: "/b2b/admin/orders", label: "\u0412\u0441\u0435 \u0437\u0430\u043A\u0430\u0437\u044B", desc: "\u0421\u043F\u0438\u0441\u043E\u043A", icon: "\u{1F9FE}" },
          { to: "/b2b/admin/in-work", label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435", desc: "\u0421\u0431\u043E\u0440\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432", icon: "\u{1F6E0}\uFE0F" },
          { to: "/b2b/admin/shipments", label: "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438", desc: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435", icon: "\u{1F69A}" }
        ];
      }
      return [
        { to: "/b2b", label: "\u0414\u044D\u0448\u0431\u043E\u0440\u0434", desc: "\u0413\u043B\u0430\u0432\u043D\u0430\u044F", icon: "\u25A6" },
        { to: "/catalog", label: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433", desc: "\u041E\u043F\u0442\u043E\u0432\u044B\u0439 \u043A\u0430\u0442\u0430\u043B\u043E\u0433", icon: "\u{1F6D2}" },
        { to: "/b2b/quick-order", label: "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437", desc: "\u041F\u043E \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0430\u043C", icon: "\u26A1" },
        { to: "/b2b/orders", label: "\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B", desc: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F", icon: "\u{1F9FE}" },
        { to: "/b2b/settings", label: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C", desc: "\u0414\u0430\u043D\u043D\u044B\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430", icon: "\u2699\uFE0F" }
      ];
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_ScrollToTop = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen text-slate-900 bg-gray-50" }, _attrs))}><header class="sticky top-0 z-[1000] border-b border-gray-200 bg-white/90 backdrop-blur"><div class="w-full px-4 py-3 flex items-center justify-between gap-3"><div class="flex items-center gap-3"><button class="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100" aria-label="\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E"><span class="text-lg">\u2261</span></button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/b2b",
        class: "flex items-center gap-2"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span class="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-300/30 to-cyan-400/10 border border-gray-200 flex items-center justify-center"${_scopeId}><span class="text-amber-700 font-semibold"${_scopeId}>B2B</span></span><div class="leading-tight"${_scopeId}><div class="font-semibold text-sm"${_scopeId}>Souvenir</div><div class="text-[11px] text-gray-500"${_scopeId}>\u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432</div></div>`);
          } else {
            return [
              createVNode("span", { class: "w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-300/30 to-cyan-400/10 border border-gray-200 flex items-center justify-center" }, [
                createVNode("span", { class: "text-amber-700 font-semibold" }, "B2B")
              ]),
              createVNode("div", { class: "leading-tight" }, [
                createVNode("div", { class: "font-semibold text-sm" }, "Souvenir"),
                createVNode("div", { class: "text-[11px] text-gray-500" }, "\u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432")
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="flex items-center gap-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span${_scopeId}>\u2190</span><span${_scopeId}>\u0412 \u0440\u043E\u0437\u043D\u0438\u0446\u0443</span>`);
          } else {
            return [
              createVNode("span", null, "\u2190"),
              createVNode("span", null, "\u0412 \u0440\u043E\u0437\u043D\u0438\u0446\u0443")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div class="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white"><div class="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs">${ssrInterpolate(userLabel.value[0] || "U")}</div><div class="leading-tight"><div class="text-xs font-medium truncate max-w-[180px]">${ssrInterpolate(userLabel.value)}</div><div class="text-[11px] text-gray-500 flex items-center gap-2"><span class="inline-flex items-center gap-1"><span class="${ssrRenderClass([((_a = unref(auth).user) == null ? void 0 : _a.role) === "store" ? "bg-emerald-400" : ((_b = unref(auth).user) == null ? void 0 : _b.role) === "manager" ? "bg-sky-400" : "bg-slate-400", "w-1.5 h-1.5 rounded-full"])}"></span> ${ssrInterpolate(roleLabel.value)}</span><button class="hover:text-amber-700">\u0412\u044B\u0439\u0442\u0438</button></div></div></div></div></div></header><div class="w-full px-4 py-4 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 min-h-[calc(100vh-72px)] items-stretch"><aside class="md:sticky md:top-[72px] h-fit"><div class="${ssrRenderClass([mobileNavOpen.value ? "block" : "hidden md:block", "md:block"])}"><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200"><div class="text-xs text-gray-500">\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u044F</div><div class="text-sm font-semibold">B2B \u043C\u0435\u043D\u044E</div></div><nav class="p-2"><!--[-->`);
      ssrRenderList(nav.value, (item) => {
        _push(ssrRenderComponent(_component_NuxtLink, {
          key: item.to,
          to: item.to,
          class: "group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-100",
          "active-class": "bg-gray-100 border border-gray-200",
          onClick: ($event) => mobileNavOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center"${_scopeId}><span class="text-lg"${_scopeId}>${ssrInterpolate(item.icon)}</span></div><div class="min-w-0"${_scopeId}><div class="text-sm font-medium"${_scopeId}>${ssrInterpolate(item.label)}</div><div class="text-[11px] text-gray-500 truncate"${_scopeId}>${ssrInterpolate(item.desc)}</div></div>`);
            } else {
              return [
                createVNode("div", { class: "w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center" }, [
                  createVNode("span", { class: "text-lg" }, toDisplayString(item.icon), 1)
                ]),
                createVNode("div", { class: "min-w-0" }, [
                  createVNode("div", { class: "text-sm font-medium" }, toDisplayString(item.label), 1),
                  createVNode("div", { class: "text-[11px] text-gray-500 truncate" }, toDisplayString(item.desc), 1)
                ])
              ];
            }
          }),
          _: 2
        }, _parent));
      });
      _push(`<!--]--></nav><div class="p-4 border-t border-gray-200"><div class="rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 p-3"><div class="text-xs text-gray-700 font-medium">\u041F\u043E\u0434\u0441\u043A\u0430\u0437\u043A\u0430</div><div class="text-[11px] text-gray-500 mt-1"> \u0412 B2B \u0446\u0435\u043D\u044B \u0438 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441 \u043E\u0442\u043B\u0438\u0447\u0430\u044E\u0442\u0441\u044F \u043E\u0442 \u0440\u043E\u0437\u043D\u0438\u0446\u044B. \u0415\u0441\u043B\u0438 \u0447\u0442\u043E-\u0442\u043E \u0432\u044B\u0433\u043B\u044F\u0434\u0438\u0442 \u201C\u043D\u0435 \u0442\u0430\u043A\u201D \u2014 \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0440\u043E\u043B\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430. </div></div><div class="md:hidden mt-3"><button class="w-full px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u0412\u044B\u0439\u0442\u0438 </button></div></div></div></div></aside><main class="min-w-0 flex"><div class="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 flex-1 min-h-0 flex flex-col overflow-hidden"><div class="flex-1 min-h-0">`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/b2b.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=b2b-DnPJ6Fy8.mjs.map
