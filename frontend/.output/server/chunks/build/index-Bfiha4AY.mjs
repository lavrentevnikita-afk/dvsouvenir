import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, computed, mergeProps, unref, withCtx, createVNode, createBlock, createCommentVNode, toDisplayString, openBlock, createTextVNode, Fragment, renderList, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrInterpolate, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const loading = ref(true);
    const errorMessage = ref("");
    const orders = ref([]);
    const filterCity = ref("");
    const filterPriority = ref("");
    const filterDate = ref("");
    const sortBy = ref("deadline");
    const sortedOrders = computed(() => {
      const list = [...orders.value || []];
      if (sortBy.value === "priority") {
        return list.sort((a, b) => {
          var _a, _b;
          const ap = (_a = a.priority) != null ? _a : 999;
          const bp = (_b = b.priority) != null ? _b : 999;
          if (ap !== bp) return ap - bp;
          const ad = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
          const bd = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
          return ad - bd;
        });
      }
      return list.sort((a, b) => {
        var _a, _b;
        const ad = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        const bd = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;
        if (ad !== bd) return ad - bd;
        const ap = (_a = a.priority) != null ? _a : 999;
        const bp = (_b = b.priority) != null ? _b : 999;
        return ap - bp;
      });
    });
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="flex items-start justify-between gap-3"><div><h1 class="text-xl font-semibold">\u041E\u0447\u0435\u0440\u0435\u0434\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430</h1><p class="text-sm text-gray-500">\u0421\u043F\u0438\u0441\u043E\u043A \u0437\u0430\u0434\u0430\u0447 \u043D\u0430 \u0441\u0431\u043E\u0440\u043A\u0443/\u0438\u0437\u0433\u043E\u0442\u043E\u0432\u043B\u0435\u043D\u0438\u0435. \u0426\u0435\u043D\u044B \u0441\u043A\u0440\u044B\u0442\u044B.</p></div><button class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}> \u{1F504} \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button></div>`);
      if (unref(errorMessage)) {
        _push(`<p class="text-sm text-red-600">${ssrInterpolate(unref(errorMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="grid gap-3 md:grid-cols-4"><label class="text-xs text-gray-500"> \u0413\u043E\u0440\u043E\u0434 <input${ssrRenderAttr("value", unref(filterCity))} class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" placeholder="\u041D\u0430\u043F\u0440. \u0412\u043B\u0430\u0434\u0438\u0432\u043E\u0441\u0442\u043E\u043A"></label><label class="text-xs text-gray-500"> \u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442 <select class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterPriority)) ? ssrLooseContain(unref(filterPriority), "") : ssrLooseEqual(unref(filterPriority), "")) ? " selected" : ""}>\u041B\u044E\u0431\u043E\u0439</option><!--[-->`);
      ssrRenderList([1, 2, 3, 4, 5], (p) => {
        _push(`<option${ssrRenderAttr("value", String(p))}${ssrIncludeBooleanAttr(Array.isArray(unref(filterPriority)) ? ssrLooseContain(unref(filterPriority), String(p)) : ssrLooseEqual(unref(filterPriority), String(p))) ? " selected" : ""}>${ssrInterpolate(p)}</option>`);
      });
      _push(`<!--]--></select></label><label class="text-xs text-gray-500"> \u0414\u0430\u0442\u0430 \u0434\u0435\u0434\u043B\u0430\u0439\u043D\u0430 <input${ssrRenderAttr("value", unref(filterDate))} type="date" class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"></label><label class="text-xs text-gray-500"> \u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430 <select class="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="deadline"${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), "deadline") : ssrLooseEqual(unref(sortBy), "deadline")) ? " selected" : ""}>\u041F\u043E \u0434\u0435\u0434\u043B\u0430\u0439\u043D\u0443</option><option value="priority"${ssrIncludeBooleanAttr(Array.isArray(unref(sortBy)) ? ssrLooseContain(unref(sortBy), "priority") : ssrLooseEqual(unref(sortBy), "priority")) ? " selected" : ""}>\u041F\u043E \u043F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442\u0443</option></select></label></div><div class="mt-3 flex flex-wrap gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}> \u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C </button></div></div>`);
      if (unref(loading)) {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500"> \u0417\u0430\u0433\u0440\u0443\u0436\u0430\u044E \u043E\u0447\u0435\u0440\u0435\u0434\u044C\u2026 </div>`);
      } else {
        _push(`<div class="grid gap-3">`);
        if (unref(orders).length === 0) {
          _push(`<div class="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500"> \u0421\u0435\u0439\u0447\u0430\u0441 \u043D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u201C\u0432 \u0440\u0430\u0431\u043E\u0442\u0435\u201D. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(sortedOrders), (o) => {
          _push(ssrRenderComponent(_component_NuxtLink, {
            key: o.orderId,
            to: `/production/orders/${o.orderId}`,
            class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              var _a, _b;
              if (_push2) {
                _push2(`<div class="flex items-start justify-between gap-4"${_scopeId}><div class="min-w-0"${_scopeId}><div class="flex items-center gap-2"${_scopeId}><div class="text-sm font-semibold"${_scopeId}>\u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate(o.orderId)}</div><span class="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700"${_scopeId}>${ssrInterpolate(o.status)}</span>`);
                if (o.priority) {
                  _push2(`<span class="text-[11px] px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700"${_scopeId}> P${ssrInterpolate(o.priority)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><div class="text-xs text-gray-500 mt-1"${_scopeId}> \u041F\u043E\u0437\u0438\u0446\u0438\u0438: ${ssrInterpolate(((_a = o.items) == null ? void 0 : _a.length) || 0)} `);
                if (o.deadline) {
                  _push2(`<span${_scopeId}> \u2022 \u0414\u0435\u0434\u043B\u0430\u0439\u043D: ${ssrInterpolate(new Date(o.deadline).toLocaleDateString())}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
                if (o.comments) {
                  _push2(`<div class="text-xs text-gray-600 mt-2 line-clamp-2"${_scopeId}> \u{1F4AC} ${ssrInterpolate(o.comments)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div><div class="text-sm"${_scopeId}>\u2192</div></div><div class="mt-3 flex flex-wrap gap-2"${_scopeId}><!--[-->`);
                ssrRenderList((o.items || []).slice(0, 6), (l) => {
                  _push2(`<span class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white"${_scopeId}>${ssrInterpolate(l.name)} \xD7 ${ssrInterpolate(l.quantity)}</span>`);
                });
                _push2(`<!--]-->`);
                if ((o.items || []).length > 6) {
                  _push2(`<span class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-gray-50"${_scopeId}> +${ssrInterpolate((o.items || []).length - 6)} \u0435\u0449\u0451 </span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div>`);
                if ((o.assets || []).length) {
                  _push2(`<div class="mt-3 flex flex-wrap gap-2"${_scopeId}><!--[-->`);
                  ssrRenderList((o.assets || []).slice(0, 6), (a, idx) => {
                    _push2(`<img${ssrRenderAttr("src", a)} class="h-10 w-10 rounded-xl border border-gray-200 object-cover bg-white" alt="asset"${_scopeId}>`);
                  });
                  _push2(`<!--]-->`);
                  if ((o.assets || []).length > 6) {
                    _push2(`<div class="h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-500"${_scopeId}> +${ssrInterpolate((o.assets || []).length - 6)}</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div>`);
                } else {
                  _push2(`<!---->`);
                }
              } else {
                return [
                  createVNode("div", { class: "flex items-start justify-between gap-4" }, [
                    createVNode("div", { class: "min-w-0" }, [
                      createVNode("div", { class: "flex items-center gap-2" }, [
                        createVNode("div", { class: "text-sm font-semibold" }, "\u0417\u0430\u043A\u0430\u0437 #" + toDisplayString(o.orderId), 1),
                        createVNode("span", { class: "text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-700" }, toDisplayString(o.status), 1),
                        o.priority ? (openBlock(), createBlock("span", {
                          key: 0,
                          class: "text-[11px] px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700"
                        }, " P" + toDisplayString(o.priority), 1)) : createCommentVNode("", true)
                      ]),
                      createVNode("div", { class: "text-xs text-gray-500 mt-1" }, [
                        createTextVNode(" \u041F\u043E\u0437\u0438\u0446\u0438\u0438: " + toDisplayString(((_b = o.items) == null ? void 0 : _b.length) || 0) + " ", 1),
                        o.deadline ? (openBlock(), createBlock("span", { key: 0 }, " \u2022 \u0414\u0435\u0434\u043B\u0430\u0439\u043D: " + toDisplayString(new Date(o.deadline).toLocaleDateString()), 1)) : createCommentVNode("", true)
                      ]),
                      o.comments ? (openBlock(), createBlock("div", {
                        key: 0,
                        class: "text-xs text-gray-600 mt-2 line-clamp-2"
                      }, " \u{1F4AC} " + toDisplayString(o.comments), 1)) : createCommentVNode("", true)
                    ]),
                    createVNode("div", { class: "text-sm" }, "\u2192")
                  ]),
                  createVNode("div", { class: "mt-3 flex flex-wrap gap-2" }, [
                    (openBlock(true), createBlock(Fragment, null, renderList((o.items || []).slice(0, 6), (l) => {
                      return openBlock(), createBlock("span", {
                        key: l.productId,
                        class: "text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white"
                      }, toDisplayString(l.name) + " \xD7 " + toDisplayString(l.quantity), 1);
                    }), 128)),
                    (o.items || []).length > 6 ? (openBlock(), createBlock("span", {
                      key: 0,
                      class: "text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-gray-50"
                    }, " +" + toDisplayString((o.items || []).length - 6) + " \u0435\u0449\u0451 ", 1)) : createCommentVNode("", true)
                  ]),
                  (o.assets || []).length ? (openBlock(), createBlock("div", {
                    key: 0,
                    class: "mt-3 flex flex-wrap gap-2"
                  }, [
                    (openBlock(true), createBlock(Fragment, null, renderList((o.assets || []).slice(0, 6), (a, idx) => {
                      return openBlock(), createBlock("img", {
                        key: a + idx,
                        src: a,
                        class: "h-10 w-10 rounded-xl border border-gray-200 object-cover bg-white",
                        alt: "asset"
                      }, null, 8, ["src"]);
                    }), 128)),
                    (o.assets || []).length > 6 ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "h-10 w-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-xs text-gray-500"
                    }, " +" + toDisplayString((o.assets || []).length - 6), 1)) : createCommentVNode("", true)
                  ])) : createCommentVNode("", true)
                ];
              }
            }),
            _: 2
          }, _parent));
        });
        _push(`<!--]--></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/production/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bfiha4AY.mjs.map
