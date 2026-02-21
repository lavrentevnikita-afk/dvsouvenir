import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, withAsyncContext, ref, watch, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { n as navigateTo, u as useRuntimeConfig } from './server.mjs';
import { u as useHead } from './index-CCqbQxu4.mjs';
import { u as useAsyncData } from './asyncData-D0yoREPk.mjs';
import { u as useToast } from './useToast-BeE5NKHL.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  async setup(__props) {
    var _a, _b;
    let __temp, __restore;
    const route = useRoute();
    const authStore = useAuthStore();
    const config = useRuntimeConfig();
    useToast();
    if (!["manager", "admin"].includes(((_a = authStore.user) == null ? void 0 : _a.role) || "")) {
      navigateTo("/");
    }
    const orderId = parseInt(route.params.id);
    const { data: order, pending, error, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `manager-order-${orderId}`,
      () => $fetch(`/api/manager/orders/${orderId}`, {
        baseURL: config.public.apiBaseUrl,
        headers: authStore.accessToken ? {
          Authorization: `Bearer ${authStore.accessToken}`
        } : void 0
      })
    )), __temp = await __temp, __restore(), __temp);
    const newStatus = ref(((_b = order.value) == null ? void 0 : _b.status) || "new");
    const statusNote = ref("");
    const updatingStatus = ref(false);
    watch(() => {
      var _a2;
      return (_a2 = order.value) == null ? void 0 : _a2.status;
    }, (status) => {
      if (status) newStatus.value = status;
    });
    const getImageUrl = (asset) => {
      if (asset.startsWith("http")) return asset;
      return `${config.public.apiBaseUrl}/uploads/products/${asset}`;
    };
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
      title: `\u0417\u0430\u043A\u0430\u0437 #${orderId} - \u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440`
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50" }, _attrs))}><div class="container mx-auto px-4 py-8">`);
      if (unref(pending)) {
        _push(`<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p class="mt-4 text-gray-600">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u0430...</p></div>`);
      } else if (unref(error)) {
        _push(`<div class="bg-red-50 border border-red-200 rounded-lg p-4"><p class="text-red-700">${ssrInterpolate(unref(error).message || "\u041E\u0448\u0438\u0431\u043A\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0437\u0430\u043A\u0430\u0437\u0430")}</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/manager/orders",
          class: "mt-4 inline-block text-blue-600 hover:text-blue-800"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0441\u043F\u0438\u0441\u043A\u0443 `);
            } else {
              return [
                createTextVNode(" \u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0441\u043F\u0438\u0441\u043A\u0443 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(order)) {
        _push(`<div class="space-y-6"><div class="flex justify-between items-center"><div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/manager/orders",
          class: "text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0441\u043F\u0438\u0441\u043A\u0443 `);
            } else {
              return [
                createTextVNode(" \u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0441\u043F\u0438\u0441\u043A\u0443 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<h1 class="text-3xl font-bold">\u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate(unref(order).id)}</h1><p class="text-gray-600 mt-1">\u043E\u0442 ${ssrInterpolate(formatDate(unref(order).createdAt))}</p></div><span class="${ssrRenderClass([getStatusClass(unref(order).status), "px-4 py-2 text-sm font-semibold rounded-full"])}">${ssrInterpolate(getStatusLabel(unref(order).status))}</span></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-6"><div class="lg:col-span-2 space-y-6"><div class="bg-white rounded-lg shadow-sm p-6"><h2 class="text-xl font-semibold mb-4">\u0422\u043E\u0432\u0430\u0440\u044B</h2><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(order).items, (item) => {
          var _a2, _b2;
          _push(`<div class="flex gap-4 pb-4 border-b last:border-0">`);
          if ((_b2 = (_a2 = item.product) == null ? void 0 : _a2.assets) == null ? void 0 : _b2[0]) {
            _push(`<img${ssrRenderAttr("src", getImageUrl(item.product.assets[0]))}${ssrRenderAttr("alt", item.productName)} class="w-20 h-20 object-cover rounded">`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="flex-1"><h3 class="font-medium">${ssrInterpolate(item.productName)}</h3><p class="text-sm text-gray-600 mt-1">${ssrInterpolate(item.quantity)} \xD7 ${ssrInterpolate(formatPrice(item.unitPrice))}</p></div><div class="text-right"><p class="font-semibold">${ssrInterpolate(formatPrice(item.lineTotal))}</p></div></div>`);
        });
        _push(`<!--]--></div><div class="mt-4 pt-4 border-t flex justify-between items-center"><span class="text-lg font-semibold">\u0418\u0442\u043E\u0433\u043E:</span><span class="text-2xl font-bold text-blue-600">${ssrInterpolate(formatPrice(unref(order).totalPrice))}</span></div></div><div class="bg-white rounded-lg shadow-sm p-6"><h2 class="text-xl font-semibold mb-4">\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u043E\u043C</h2><div class="space-y-4"><div><label class="block text-sm font-medium text-gray-700 mb-2">\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441</label><select class="w-full px-3 py-2 border border-gray-300 rounded-md"><option value="new"${ssrIncludeBooleanAttr(Array.isArray(newStatus.value) ? ssrLooseContain(newStatus.value, "new") : ssrLooseEqual(newStatus.value, "new")) ? " selected" : ""}>\u041D\u043E\u0432\u044B\u0439</option><option value="processing"${ssrIncludeBooleanAttr(Array.isArray(newStatus.value) ? ssrLooseContain(newStatus.value, "processing") : ssrLooseEqual(newStatus.value, "processing")) ? " selected" : ""}>\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435</option><option value="ready"${ssrIncludeBooleanAttr(Array.isArray(newStatus.value) ? ssrLooseContain(newStatus.value, "ready") : ssrLooseEqual(newStatus.value, "ready")) ? " selected" : ""}>\u0413\u043E\u0442\u043E\u0432</option><option value="shipped"${ssrIncludeBooleanAttr(Array.isArray(newStatus.value) ? ssrLooseContain(newStatus.value, "shipped") : ssrLooseEqual(newStatus.value, "shipped")) ? " selected" : ""}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D</option><option value="delivered"${ssrIncludeBooleanAttr(Array.isArray(newStatus.value) ? ssrLooseContain(newStatus.value, "delivered") : ssrLooseEqual(newStatus.value, "delivered")) ? " selected" : ""}>\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D</option><option value="cancelled"${ssrIncludeBooleanAttr(Array.isArray(newStatus.value) ? ssrLooseContain(newStatus.value, "cancelled") : ssrLooseEqual(newStatus.value, "cancelled")) ? " selected" : ""}>\u041E\u0442\u043C\u0435\u043D\u0435\u043D</option></select></div><div><label class="block text-sm font-medium text-gray-700 mb-2">\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u0435 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)</label><textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="\u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439...">${ssrInterpolate(statusNote.value)}</textarea></div><button${ssrIncludeBooleanAttr(updatingStatus.value || newStatus.value === unref(order).status) ? " disabled" : ""} class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed">${ssrInterpolate(updatingStatus.value ? "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435..." : "\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441")}</button></div></div></div><div class="space-y-6"><div class="bg-white rounded-lg shadow-sm p-6"><h2 class="text-xl font-semibold mb-4">\u041A\u043B\u0438\u0435\u043D\u0442</h2><div class="space-y-3"><div><p class="text-sm text-gray-600">\u0418\u043C\u044F</p><p class="font-medium">${ssrInterpolate(unref(order).customerName)}</p></div><div><p class="text-sm text-gray-600">Email</p><p class="font-medium">${ssrInterpolate(unref(order).email)}</p></div>`);
        if (unref(order).phone) {
          _push(`<div><p class="text-sm text-gray-600">\u0422\u0435\u043B\u0435\u0444\u043E\u043D</p><p class="font-medium">${ssrInterpolate(unref(order).phone)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="bg-white rounded-lg shadow-sm p-6"><h2 class="text-xl font-semibold mb-4">\u0414\u043E\u0441\u0442\u0430\u0432\u043A\u0430</h2><p class="text-gray-700">${ssrInterpolate(unref(order).address)}</p>`);
        if (unref(order).comment) {
          _push(`<p class="mt-3 text-sm text-gray-600"><span class="font-medium">\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439:</span> ${ssrInterpolate(unref(order).comment)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/manager/orders/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=_id_-BYAH8viv.mjs.map
