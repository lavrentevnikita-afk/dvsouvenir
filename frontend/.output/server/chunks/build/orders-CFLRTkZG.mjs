import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { n as navigateTo, u as useRuntimeConfig } from './server.mjs';
import { u as useHead } from './index-CCqbQxu4.mjs';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
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
  __name: "orders",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a;
    let __temp, __restore;
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    if (!["manager", "admin"].includes(((_a = authStore.user) == null ? void 0 : _a.role) || "")) {
      navigateTo("/");
    }
    const filters = ref({
      status: "",
      search: "",
      dateFrom: "",
      dateTo: "",
      page: 1,
      limit: 20
    });
    const buildUrl = () => {
      const params = new URLSearchParams();
      if (filters.value.status) params.append("status", filters.value.status);
      if (filters.value.search) params.append("search", filters.value.search);
      if (filters.value.dateFrom) params.append("dateFrom", filters.value.dateFrom);
      if (filters.value.dateTo) params.append("dateTo", filters.value.dateTo);
      params.append("page", String(filters.value.page));
      params.append("limit", String(filters.value.limit));
      return `/api/manager/orders?${params.toString()}`;
    };
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "manager-orders",
      () => $fetch(buildUrl(), {
        baseURL: config.public.apiBaseUrl,
        headers: authStore.accessToken ? {
          Authorization: `Bearer ${authStore.accessToken}`
        } : void 0
      })
    )), __temp = await __temp, __restore(), __temp);
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    };
    const formatPrice = (price) => {
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB"
      }).format(price);
    };
    const getStatusLabel = (status) => {
      const labels = {
        new: "\u041D\u043E\u0432\u044B\u0439",
        processing: "\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435",
        ready: "\u0413\u043E\u0442\u043E\u0432",
        shipped: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D",
        delivered: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D",
        cancelled: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D"
      };
      return labels[status] || status;
    };
    const getStatusClass = (status) => {
      const classes = {
        new: "bg-blue-100 text-blue-800",
        processing: "bg-yellow-100 text-yellow-800",
        ready: "bg-green-100 text-green-800",
        shipped: "bg-purple-100 text-purple-800",
        delivered: "bg-gray-100 text-gray-800",
        cancelled: "bg-red-100 text-red-800"
      };
      return classes[status] || "bg-gray-100 text-gray-800";
    };
    useHead({
      title: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043C\u0438 - \u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440"
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50" }, _attrs))}><div class="container mx-auto px-4 py-8"><h1 class="text-3xl font-bold mb-6">\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043C\u0438</h1><div class="bg-white rounded-lg shadow-sm p-4 mb-6"><div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">\u0421\u0442\u0430\u0442\u0443\u0441</label><select class="w-full px-3 py-2 border border-gray-300 rounded-md"><option value=""${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "") : ssrLooseEqual(filters.value.status, "")) ? " selected" : ""}>\u0412\u0441\u0435</option><option value="new"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "new") : ssrLooseEqual(filters.value.status, "new")) ? " selected" : ""}>\u041D\u043E\u0432\u044B\u0439</option><option value="processing"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "processing") : ssrLooseEqual(filters.value.status, "processing")) ? " selected" : ""}>\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435</option><option value="ready"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "ready") : ssrLooseEqual(filters.value.status, "ready")) ? " selected" : ""}>\u0413\u043E\u0442\u043E\u0432</option><option value="shipped"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "shipped") : ssrLooseEqual(filters.value.status, "shipped")) ? " selected" : ""}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D</option><option value="delivered"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "delivered") : ssrLooseEqual(filters.value.status, "delivered")) ? " selected" : ""}>\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "cancelled") : ssrLooseEqual(filters.value.status, "cancelled")) ? " selected" : ""}>\u041E\u0442\u043C\u0435\u043D\u0435\u043D</option></select></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\u041F\u043E\u0438\u0441\u043A</label><input${ssrRenderAttr("value", filters.value.search)} type="text" placeholder="\u2116, \u0438\u043C\u044F, email" class="w-full px-3 py-2 border border-gray-300 rounded-md"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\u041E\u0442</label><input${ssrRenderAttr("value", filters.value.dateFrom)} type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\u0414\u043E</label><input${ssrRenderAttr("value", filters.value.dateTo)} type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md"></div></div><div class="mt-4 flex gap-2"><button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"> \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C </button><button class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"> \u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C </button></div></div>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p class="mt-4 text-gray-600">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432...</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4"><p class="text-red-700">${ssrInterpolate(unref(error).message || "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0437\u0430\u043A\u0430\u0437\u043E\u0432")}</p></div>`);
      } else if ((_b = (_a2 = unref(data)) == null ? void 0 : _a2.orders) == null ? void 0 : _b.length) {
        _push(`<div class="bg-white rounded-lg shadow-sm overflow-hidden"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-gray-50"><tr><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> \u2116 \u0417\u0430\u043A\u0430\u0437\u0430 </th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> \u041A\u043B\u0438\u0435\u043D\u0442 </th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> \u0414\u0430\u0442\u0430 </th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> \u0421\u0443\u043C\u043C\u0430 </th><th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> \u0421\u0442\u0430\u0442\u0443\u0441 </th><th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"> \u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F </th></tr></thead><tbody class="bg-white divide-y divide-gray-200"><!--[-->`);
        ssrRenderList(unref(data).orders, (order) => {
          _push(`<tr class="hover:bg-gray-50"><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"> #${ssrInterpolate(order.id)}</td><td class="px-6 py-4 whitespace-nowrap"><div class="text-sm font-medium text-gray-900">${ssrInterpolate(order.customerName)}</div><div class="text-sm text-gray-500">${ssrInterpolate(order.email)}</div></td><td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${ssrInterpolate(formatDate(order.createdAt))}</td><td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${ssrInterpolate(formatPrice(order.totalPrice))}</td><td class="px-6 py-4 whitespace-nowrap"><span class="${ssrRenderClass([getStatusClass(order.status), "px-2 py-1 text-xs font-semibold rounded-full"])}">${ssrInterpolate(getStatusLabel(order.status))}</span></td><td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/manager/orders/${order.id}`,
            class: "text-blue-600 hover:text-blue-900"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 `);
              } else {
                return [
                  createTextVNode(" \u041F\u043E\u0434\u0440\u043E\u0431\u043D\u0435\u0435 ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
        if (unref(data).totalPages > 1) {
          _push(`<div class="px-6 py-4 flex justify-between items-center border-t border-gray-200"><div class="text-sm text-gray-700"> \u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E ${ssrInterpolate(unref(data).orders.length)} \u0438\u0437 ${ssrInterpolate(unref(data).total)} \u0437\u0430\u043A\u0430\u0437\u043E\u0432 </div><div class="flex gap-2"><!--[-->`);
          ssrRenderList(unref(data).totalPages, (page) => {
            _push(`<button class="${ssrRenderClass([
              "px-3 py-1 rounded-md text-sm",
              page === unref(data).page ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            ])}">${ssrInterpolate(page)}</button>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<div class="bg-white rounded-lg shadow-sm p-12 text-center"><svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><h3 class="mt-4 text-lg font-medium text-gray-900">\u0417\u0430\u043A\u0430\u0437\u043E\u0432 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E</h3><p class="mt-2 text-gray-600">\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0444\u0438\u043B\u044C\u0442\u0440\u044B</p></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/manager/orders.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=orders-CFLRTkZG.mjs.map
