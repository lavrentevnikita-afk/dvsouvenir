import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { b as useRoute, u as useRuntimeConfig } from './server.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { defineComponent, computed, withAsyncContext, unref, mergeProps, withCtx, createTextVNode, useSSRContext } from 'vue';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const id = computed(() => Number(route.params.id));
    const apiBaseUrl = config.apiBaseUrl;
    const { data, pending, error } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "order",
      // <-- простой строковый ключ
      () => $fetch(`/api/orders/${id.value}`, {
        baseURL: apiBaseUrl,
        headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : void 0
      }),
      { watch: [id] }
    )), __temp = await __temp, __restore(), __temp);
    const order = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = data.value) == null ? void 0 : _a.order) != null ? _a2 : null;
    });
    const { data: receiptData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "order_receipt",
      () => $fetch(`/api/orders/${id.value}/receipt`, {
        baseURL: apiBaseUrl,
        headers: authStore.accessToken ? { Authorization: `Bearer ${authStore.accessToken}` } : void 0
      }),
      { watch: [id] }
    )), __temp = await __temp, __restore(), __temp);
    const receipt = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = receiptData.value) == null ? void 0 : _a.receipt) != null ? _a2 : null;
    });
    const isB2B = computed(() => {
      var _a;
      return ((_a = authStore.user) == null ? void 0 : _a.role) === "store";
    });
    const fmtMoney = (n) => {
      const v = Number(n);
      if (!Number.isFinite(v)) return "0 \u20BD";
      return `${Math.round(v).toLocaleString("ru-RU")} \u20BD`;
    };
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      if (unref(pending)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "text-sm text-gray-500" }, _attrs))}> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438 \u043E \u0437\u0430\u043A\u0430\u0437\u0435... </section>`);
      } else if (unref(error) || !unref(order)) {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-2" }, _attrs))}><h1 class="text-xl font-semibold">\u0417\u0430\u043A\u0430\u0437 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D</h1><p class="text-sm text-gray-600"> \u0412\u043E\u0437\u043C\u043E\u0436\u043D\u043E, \u043D\u043E\u043C\u0435\u0440 \u0437\u0430\u043A\u0430\u0437\u0430 \u0443\u043A\u0430\u0437\u0430\u043D \u043D\u0435\u0432\u0435\u0440\u043D\u043E \u0438\u043B\u0438 \u0437\u0430\u043A\u0430\u0437 \u0431\u044B\u043B \u0443\u0434\u0430\u043B\u0451\u043D. </p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/",
          class: "inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E `);
            } else {
              return [
                createTextVNode(" \u041D\u0430 \u0433\u043B\u0430\u0432\u043D\u0443\u044E ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
      } else {
        _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><header class="space-y-1"><h1 class="text-xl font-semibold"> \u0417\u0430\u043A\u0430\u0437 \u2116${ssrInterpolate(unref(order).id)}</h1><p class="text-sm text-gray-600"> \u0421\u043F\u0430\u0441\u0438\u0431\u043E! \u041C\u044B \u043F\u0440\u0438\u043D\u044F\u043B\u0438 \u0432\u0430\u0448 \u0437\u0430\u043A\u0430\u0437 \u0438 \u0441\u043A\u043E\u0440\u043E \u0441\u0432\u044F\u0436\u0435\u043C\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u0434\u043B\u044F \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F. </p></header><div class="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] items-start"><div class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm"><h2 class="text-sm font-semibold">\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430</h2>`);
        if (unref(receipt)) {
          _push(`<div class="space-y-2"><div class="flex flex-wrap gap-2"><!--[-->`);
          ssrRenderList(unref(receipt).statusSteps, (s) => {
            _push(`<span class="${ssrRenderClass([s.done ? "bg-slate-900 text-white" : "bg-gray-100 text-gray-700", "rounded-full px-3 py-1 text-[11px] font-medium"])}">${ssrInterpolate(s.label)}</span>`);
          });
          _push(`<!--]--></div><div class="rounded-lg bg-gray-50 p-3"><p class="text-xs font-semibold text-gray-900">${ssrInterpolate(unref(receipt).nextStep.title)}</p><p class="mt-1 text-xs text-gray-600">${ssrInterpolate(unref(receipt).nextStep.text)}</p></div></div>`);
        } else {
          _push(`<p class="text-xs text-gray-600"> \u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u0441\u0442\u0430\u0442\u0443\u0441: <span class="font-medium text-gray-900">${ssrInterpolate(unref(order).status)}</span></p>`);
        }
        if (unref(order).createdAt) {
          _push(`<p class="text-xs text-gray-600"> \u0414\u0430\u0442\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F: <span class="font-medium text-gray-900">${ssrInterpolate(new Date(unref(order).createdAt).toLocaleString())}</span></p>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isB2B) && unref(receipt)) {
          _push(`<button type="button" class="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"> \u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0441\u0447\u0451\u0442 </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><aside class="space-y-3 rounded-lg border border-gray-200 bg-white p-4 text-sm"><h2 class="text-sm font-semibold">\u0421\u043E\u0441\u0442\u0430\u0432 \u0437\u0430\u043A\u0430\u0437\u0430</h2><ul class="space-y-2 max-h-64 overflow-y-auto pr-1"><!--[-->`);
        ssrRenderList(((_a = unref(receipt)) == null ? void 0 : _a.items) || unref(order).items, (item) => {
          _push(`<li class="flex justify-between gap-2 text-xs"><div class="flex-1"><p class="font-medium text-gray-900 line-clamp-2">${ssrInterpolate(item.name || "\u0422\u043E\u0432\u0430\u0440 #" + item.productId)}</p><p class="text-[11px] text-gray-500"> x${ssrInterpolate(item.quantity)}</p></div><div class="text-right whitespace-nowrap"><p class="font-semibold">${ssrInterpolate(unref(receipt) ? fmtMoney(item.finalLine) : Number(item.price) * item.quantity + " \u20BD")}</p></div></li>`);
        });
        _push(`<!--]--></ul>`);
        if (unref(receipt)) {
          _push(`<div class="space-y-1 text-xs"><div class="flex justify-between"><span class="text-gray-600">\u0418\u0442\u043E\u0433\u043E \u0440\u043E\u0437\u043D\u0438\u0446\u0430</span><span class="font-medium">${ssrInterpolate(fmtMoney(unref(receipt).totals.retail))}</span></div>`);
          if (unref(receipt).totals.discount > 0) {
            _push(`<div class="flex justify-between"><span class="text-gray-600">\u0421\u043A\u0438\u0434\u043A\u0430</span><span class="font-medium">-${ssrInterpolate(fmtMoney(unref(receipt).totals.discount))}</span></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex justify-between text-sm font-semibold"><span>\u041A \u043E\u043F\u043B\u0430\u0442\u0435</span><span>${ssrInterpolate(fmtMoney(unref(receipt).totals.final))}</span></div></div>`);
        } else {
          _push(`<div class="flex justify-between text-sm font-semibold"><span>\u0418\u0442\u043E\u0433\u043E</span><span>${ssrInterpolate(Number(unref(order).totalPrice))} \u20BD</span></div>`);
        }
        _push(`</aside></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/catalog",
          class: "inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-xs font-medium text-white"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0438 `);
            } else {
              return [
                createTextVNode(" \u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0438 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</section>`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/order/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-uLtrjNuB.mjs.map
