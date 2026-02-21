import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { u as useRuntimeConfig } from './server.mjs';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
import { defineComponent, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
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
  async setup(__props) {
    let __temp, __restore;
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "catalog-categories",
      () => $fetch("/api/catalog/categories", {
        baseURL: apiBaseUrl
      })
    )), __temp = await __temp, __restore(), __temp);
    function imageUrl(url) {
      const u = String(url || "");
      if (!u) return "";
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      return `${apiBaseUrl}${u}`;
    }
    function visibleChildren(children) {
      return Array.isArray(children) ? children.slice(0, 8) : [];
    }
    function hiddenCount(children) {
      const n = Array.isArray(children) ? children.length : 0;
      return Math.max(0, n - 8);
    }
    function fmtCount(n) {
      const v = Number(n || 0);
      return Number.isFinite(v) ? v : 0;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><header class="space-y-1"><h1 class="text-xl font-semibold">\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0442\u043E\u0432\u0430\u0440\u043E\u0432</h1></header>`);
      if (unref(pending)) {
        _push(`<div class="text-sm text-gray-500"> \u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u043C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438... </div>`);
      } else if (unref(error)) {
        _push(`<div class="text-sm text-red-500"> \u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438. </div>`);
      } else {
        _push(`<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><!--[-->`);
        ssrRenderList((_a = unref(data)) == null ? void 0 : _a.categories, (root) => {
          var _a2;
          _push(`<article class="overflow-hidden rounded-2xl border border-gray-200 bg-white"><div class="flex items-stretch justify-between gap-3 bg-gray-100"><div class="p-4">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/catalog/${root.slug}`,
            class: "text-sm font-semibold text-gray-900 hover:text-slate-900"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(root.name)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(root.name), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          if (root.productsCount !== void 0) {
            _push(`<div class="mt-1 text-xs text-gray-500"> \u0412\u0441\u0435\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u043E\u0432: ${ssrInterpolate(fmtCount(root.productsCount))}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="h-24 w-36 shrink-0 bg-gradient-to-br from-gray-200 to-gray-100 overflow-hidden">`);
          if (root.imageUrl) {
            _push(`<img${ssrRenderAttr("src", imageUrl(root.imageUrl))} class="h-full w-full object-cover">`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="p-4">`);
          if ((_a2 = root.children) == null ? void 0 : _a2.length) {
            _push(`<div class="space-y-1"><!--[-->`);
            ssrRenderList(visibleChildren(root.children), (ch) => {
              _push(ssrRenderComponent(_component_NuxtLink, {
                key: ch.slug,
                to: `/catalog/${ch.slug}`,
                class: "block text-sm text-gray-800 hover:text-slate-900"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<span class="underline decoration-gray-200 underline-offset-2 hover:decoration-slate-400"${_scopeId}>${ssrInterpolate(ch.name)}</span><span class="ml-1 text-xs text-gray-400"${_scopeId}>${ssrInterpolate(fmtCount(ch.productsCount))},</span>`);
                  } else {
                    return [
                      createVNode("span", { class: "underline decoration-gray-200 underline-offset-2 hover:decoration-slate-400" }, toDisplayString(ch.name), 1),
                      createVNode("span", { class: "ml-1 text-xs text-gray-400" }, toDisplayString(fmtCount(ch.productsCount)) + ",", 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
            });
            _push(`<!--]-->`);
            if (hiddenCount(root.children)) {
              _push(`<div class="pt-1">`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/catalog/${root.slug}`,
                class: "text-sm font-semibold text-gray-900 hover:text-slate-900"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(` \u0415\u0449\u0451 ${ssrInterpolate(hiddenCount(root.children))} \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u25BE `);
                  } else {
                    return [
                      createTextVNode(" \u0415\u0449\u0451 " + toDisplayString(hiddenCount(root.children)) + " \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u25BE ", 1)
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          } else {
            _push(`<div class="text-sm text-gray-500"> \u041F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442. </div>`);
          }
          _push(`</div></article>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/catalog/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-B5Y7oTYZ.mjs.map
