import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { n as navigateTo, u as useRuntimeConfig, _ as _sfc_main$2$1 } from './server.mjs';
import { defineComponent, ref, withAsyncContext, mergeProps, withCtx, createTextVNode, unref, toDisplayString, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList, ssrRenderSlot } from 'vue/server-renderer';
import { useRouter } from 'vue-router';
import { u as useCartStore } from './cart-DZFIURht.mjs';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
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

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "BaseBadge",
  __ssrInlineRender: true,
  props: {
    variant: { default: "neutral" },
    size: { default: "md" }
  },
  setup(__props) {
    const props = __props;
    const badgeClasses = computed(() => {
      const classes = [
        "inline-flex items-center font-medium rounded-full"
      ];
      if (props.size === "sm") {
        classes.push("px-2 py-0.5 text-xs");
      } else {
        classes.push("px-3 py-1 text-sm");
      }
      if (props.variant === "success") {
        classes.push("bg-green-100 text-green-800");
      } else if (props.variant === "warning") {
        classes.push("bg-[#ffc700]/20 text-[#ff9500]");
      } else if (props.variant === "danger") {
        classes.push("bg-red-100 text-red-800");
      } else if (props.variant === "info") {
        classes.push("bg-[#a4b4ff]/20 text-[#3659fa]");
      } else if (props.variant === "neutral") {
        classes.push("bg-gray-100 text-gray-800");
      }
      return classes.join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({ class: unref(badgeClasses) }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</span>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/BaseBadge.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "OrderCard",
  __ssrInlineRender: true,
  props: {
    order: {}
  },
  setup(__props) {
    const props = __props;
    const cartStore = useCartStore();
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    const router = useRouter();
    const downloadInvoice = async () => {
      try {
        const response = await fetch(`${config.public.apiBaseUrl}/api/orders/${props.order.id}/invoice-pdf`, {
          headers: {
            "Authorization": `Bearer ${authStore.accessToken}`
          }
        });
        if (!response.ok) throw new Error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0441\u0447\u0435\u0442\u0430");
        const blob = await response.blob();
        const url = (void 0).URL.createObjectURL(blob);
        const a = (void 0).createElement("a");
        a.href = url;
        a.download = `invoice-${props.order.id}.pdf`;
        (void 0).body.appendChild(a);
        a.click();
        (void 0).URL.revokeObjectURL(url);
        (void 0).body.removeChild(a);
      } catch (error) {
        console.error("Error downloading invoice:", error);
        alert("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043A\u0430\u0447\u0430\u0442\u044C \u0441\u0447\u0435\u0442");
      }
    };
    const downloadWaybill = async () => {
      try {
        const response = await fetch(`${config.public.apiBaseUrl}/api/orders/${props.order.id}/waybill-pdf`, {
          headers: {
            "Authorization": `Bearer ${authStore.accessToken}`
          }
        });
        if (!response.ok) throw new Error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043D\u0430\u043A\u043B\u0430\u0434\u043D\u043E\u0439");
        const blob = await response.blob();
        const url = (void 0).URL.createObjectURL(blob);
        const a = (void 0).createElement("a");
        a.href = url;
        a.download = `waybill-${props.order.id}.pdf`;
        (void 0).body.appendChild(a);
        a.click();
        (void 0).URL.revokeObjectURL(url);
        (void 0).body.removeChild(a);
      } catch (error) {
        console.error("Error downloading waybill:", error);
        alert("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043A\u0430\u0447\u0430\u0442\u044C \u043D\u0430\u043A\u043B\u0430\u0434\u043D\u0443\u044E");
      }
    };
    const statusText = computed(() => {
      const statuses = {
        new: "\u041D\u043E\u0432\u044B\u0439",
        processing: "\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435",
        ready: "\u0413\u043E\u0442\u043E\u0432",
        shipped: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D",
        delivered: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D",
        cancelled: "\u041E\u0442\u043C\u0435\u043D\u0435\u043D"
      };
      return statuses[props.order.status] || props.order.status;
    });
    const statusVariant = computed(() => {
      const variants = {
        new: "info",
        processing: "warning",
        ready: "success",
        shipped: "info",
        delivered: "success",
        cancelled: "danger"
      };
      return variants[props.order.status] || "neutral";
    });
    const formattedDate = computed(() => {
      const date = new Date(props.order.createdAt);
      return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    });
    const formattedPrice = computed(() => {
      return Number(props.order.totalPrice).toLocaleString("ru-RU", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    });
    const itemsPreview = computed(() => {
      const items = props.order.items || [];
      if (items.length === 0) return "\u041D\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u043E\u0432";
      const first3 = items.slice(0, 3);
      const names = first3.map((item) => `${item.name} (${item.quantity} \u0448\u0442.)`);
      if (items.length > 3) {
        return names.join(", ") + ` \u0438 \u0435\u0449\u0435 ${items.length - 3}...`;
      }
      return names.join(", ");
    });
    const repeatOrder = async () => {
      for (const item of props.order.items || []) {
        cartStore.addItem(item.productId, item.quantity);
      }
      router.push("/cart");
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseBadge = _sfc_main$2;
      const _component_BaseButton = _sfc_main$2$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow" }, _attrs))}><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"><div class="flex-1"><div class="flex items-center gap-3 mb-2"><h3 class="text-lg font-semibold">\u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate(__props.order.id)}</h3>`);
      _push(ssrRenderComponent(_component_BaseBadge, {
        variant: statusVariant.value,
        size: "sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(statusText.value)}`);
          } else {
            return [
              createTextVNode(toDisplayString(statusText.value), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="text-sm text-gray-600">${ssrInterpolate(formattedDate.value)}</p><div class="mt-3"><p class="text-sm text-gray-700">${ssrInterpolate(itemsPreview.value)}</p></div></div><div class="flex flex-col items-end gap-3"><div class="text-right"><p class="text-2xl font-bold text-gray-900">${ssrInterpolate(formattedPrice.value)} \u20BD</p>`);
      if (__props.order.discountPercent > 0) {
        _push(`<p class="text-sm text-green-600"> \u0421\u043A\u0438\u0434\u043A\u0430 ${ssrInterpolate(__props.order.discountPercent)}% </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex flex-wrap gap-2">`);
      _push(ssrRenderComponent(_component_BaseButton, {
        to: `/order/${__props.order.id}`,
        variant: "primary",
        size: "sm"
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
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_BaseButton, {
        onClick: repeatOrder,
        variant: "secondary",
        size: "sm",
        title: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u{1F504} \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C `);
          } else {
            return [
              createTextVNode(" \u{1F504} \u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_BaseButton, {
        onClick: downloadInvoice,
        variant: "success",
        size: "sm",
        title: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0441\u0447\u0435\u0442"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u{1F4C4} \u0421\u0447\u0435\u0442 `);
          } else {
            return [
              createTextVNode(" \u{1F4C4} \u0421\u0447\u0435\u0442 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_BaseButton, {
        onClick: downloadWaybill,
        variant: "primary",
        size: "sm",
        title: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043D\u0430\u043A\u043B\u0430\u0434\u043D\u0443\u044E"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u{1F4CB} \u041D\u0430\u043A\u043B\u0430\u0434\u043D\u0430\u044F `);
          } else {
            return [
              createTextVNode(" \u{1F4CB} \u041D\u0430\u043A\u043B\u0430\u0434\u043D\u0430\u044F ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/OrderCard.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "orders",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    if (!authStore.isAuthenticated) {
      navigateTo("/login");
    }
    const filters = ref({
      status: "",
      dateFrom: "",
      dateTo: "",
      search: "",
      page: 1,
      limit: 10
    });
    const buildUrl = () => {
      const params = new URLSearchParams();
      if (filters.value.status) params.append("status", filters.value.status);
      if (filters.value.dateFrom) params.append("dateFrom", filters.value.dateFrom);
      if (filters.value.dateTo) params.append("dateTo", filters.value.dateTo);
      if (filters.value.search) params.append("search", filters.value.search);
      params.append("page", String(filters.value.page));
      params.append("limit", String(filters.value.limit));
      return `/api/orders/my?${params.toString()}`;
    };
    const { data, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "my-orders",
      () => $fetch(buildUrl(), {
        baseURL: config.public.apiBaseUrl,
        headers: authStore.accessToken ? {
          Authorization: `Bearer ${authStore.accessToken}`
        } : void 0
      }),
      { watch: [filters] }
    )), __temp = await __temp, __restore(), __temp);
    const applyFilters = () => {
      filters.value.page = 1;
      refresh();
    };
    const resetFilters = () => {
      filters.value = {
        status: "",
        dateFrom: "",
        dateTo: "",
        search: "",
        page: 1,
        limit: 10
      };
      refresh();
    };
    const goToPage = (page) => {
      filters.value.page = page;
      refresh();
      (void 0).scrollTo({ top: 0, behavior: "smooth" });
    };
    useHead({
      title: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u043E\u0432"
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_BaseButton = _sfc_main$2$1;
      const _component_OrderCard = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))}><nav class="flex items-center gap-2 text-sm text-slate-500 mb-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/account",
        class: "hover:text-slate-900 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442`);
          } else {
            return [
              createTextVNode("\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span>\u2192</span><span class="text-slate-900">\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u043E\u0432</span></nav><h1 class="text-3xl font-bold mb-6">\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u043A\u0430\u0437\u043E\u0432</h1><div class="bg-white rounded-lg shadow-sm p-4 mb-6"><div class="grid grid-cols-1 md:grid-cols-4 gap-4"><div><label class="block text-sm font-medium text-gray-700 mb-1">\u0421\u0442\u0430\u0442\u0443\u0441</label><select class="w-full px-3 py-2 border border-gray-300 rounded-md"><option value=""${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "") : ssrLooseEqual(filters.value.status, "")) ? " selected" : ""}>\u0412\u0441\u0435</option><option value="new"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "new") : ssrLooseEqual(filters.value.status, "new")) ? " selected" : ""}>\u041D\u043E\u0432\u044B\u0439</option><option value="processing"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "processing") : ssrLooseEqual(filters.value.status, "processing")) ? " selected" : ""}>\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435</option><option value="ready"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "ready") : ssrLooseEqual(filters.value.status, "ready")) ? " selected" : ""}>\u0413\u043E\u0442\u043E\u0432</option><option value="shipped"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "shipped") : ssrLooseEqual(filters.value.status, "shipped")) ? " selected" : ""}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D</option><option value="delivered"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "delivered") : ssrLooseEqual(filters.value.status, "delivered")) ? " selected" : ""}>\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(filters.value.status) ? ssrLooseContain(filters.value.status, "cancelled") : ssrLooseEqual(filters.value.status, "cancelled")) ? " selected" : ""}>\u041E\u0442\u043C\u0435\u043D\u0435\u043D</option></select></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\u041E\u0442</label><input${ssrRenderAttr("value", filters.value.dateFrom)} type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\u0414\u043E</label><input${ssrRenderAttr("value", filters.value.dateTo)} type="date" class="w-full px-3 py-2 border border-gray-300 rounded-md"></div><div><label class="block text-sm font-medium text-gray-700 mb-1">\u041F\u043E\u0438\u0441\u043A</label><input${ssrRenderAttr("value", filters.value.search)} type="text" placeholder="\u2116 \u0437\u0430\u043A\u0430\u0437\u0430 \u0438\u043B\u0438 \u0438\u043C\u044F" class="w-full px-3 py-2 border border-gray-300 rounded-md"></div></div><div class="mt-4 flex gap-2">`);
      _push(ssrRenderComponent(_component_BaseButton, {
        onClick: applyFilters,
        variant: "primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C `);
          } else {
            return [
              createTextVNode(" \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_BaseButton, {
        onClick: resetFilters,
        variant: "secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C `);
          } else {
            return [
              createTextVNode(" \u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(pending)) {
        _push(`<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p class="mt-4 text-gray-600">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432...</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"><p class="text-red-700">${ssrInterpolate(unref(error).message || "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0437\u0430\u043A\u0430\u0437\u043E\u0432")}</p></div>`);
      } else if ((_b = (_a = unref(data)) == null ? void 0 : _a.orders) == null ? void 0 : _b.length) {
        _push(`<div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(data).orders, (order) => {
          _push(ssrRenderComponent(_component_OrderCard, {
            key: order.id,
            order
          }, null, _parent));
        });
        _push(`<!--]-->`);
        if (unref(data).totalPages > 1) {
          _push(`<div class="flex justify-center gap-2 mt-6"><!--[-->`);
          ssrRenderList(unref(data).totalPages, (page) => {
            _push(ssrRenderComponent(_component_BaseButton, {
              key: page,
              onClick: ($event) => goToPage(page),
              variant: page === unref(data).page ? "primary" : "secondary",
              size: "sm"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(page)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(page), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="text-center text-sm text-gray-600"> \u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E ${ssrInterpolate(unref(data).orders.length)} \u0438\u0437 ${ssrInterpolate(unref(data).total)} \u0437\u0430\u043A\u0430\u0437\u043E\u0432 </div></div>`);
      } else {
        _push(`<div class="text-center py-12"><svg class="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg><h3 class="mt-4 text-lg font-medium text-gray-900">\u041D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432</h3><p class="mt-2 text-gray-600">\u0423 \u0432\u0430\u0441 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u043D\u044B\u0445 \u0437\u0430\u043A\u0430\u0437\u043E\u0432</p>`);
        _push(ssrRenderComponent(_component_BaseButton, {
          variant: "primary",
          size: "lg",
          to: "/catalog",
          class: "mt-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 `);
            } else {
              return [
                createTextVNode(" \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/orders.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=orders-C0x3zlvh.mjs.map
