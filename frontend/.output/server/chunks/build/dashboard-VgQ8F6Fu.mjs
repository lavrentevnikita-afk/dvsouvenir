import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, ref, mergeProps, withCtx, createVNode, useSSRContext } from 'vue';
import { a as _export_sfc, u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "dashboard",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    computed(() => {
      const config = useRuntimeConfig();
      return config.apiBaseUrl;
    });
    computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "admin";
    });
    const loading = ref(false);
    const err = ref("");
    const dashboard2 = ref(null);
    const sales = ref([]);
    const retailVsB2b = ref(null);
    const selectedDays = ref(30);
    function money(v) {
      const n = Number(v || 0);
      try {
        return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " \u20BD";
      } catch {
        return `${Math.round(n)} \u20BD`;
      }
    }
    function formatDate(dateStr) {
      try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
      } catch {
        return dateStr;
      }
    }
    const maxRevenue = computed(() => {
      var _a;
      if (!((_a = sales.value) == null ? void 0 : _a.length)) return 0;
      return Math.max(...sales.value.map((s) => Number(s.revenue || 0)));
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-gray-50 p-4 md:p-8" }, _attrs))} data-v-b62cf2d1><div class="mb-8" data-v-b62cf2d1><h1 class="text-3xl font-bold text-gray-900" data-v-b62cf2d1>\u{1F4CA} \u0414\u0430\u0448\u0431\u043E\u0440\u0434 \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0430</h1><p class="text-gray-600 mt-2" data-v-b62cf2d1>\u041A\u043B\u044E\u0447\u0435\u0432\u044B\u0435 \u043C\u0435\u0442\u0440\u0438\u043A\u0438 \u0438 \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430</p></div>`);
      if (err.value) {
        _push(`<div class="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800" data-v-b62cf2d1>${ssrInterpolate(err.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (loading.value) {
        _push(`<div class="text-center py-12" data-v-b62cf2d1><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" data-v-b62cf2d1></div><p class="mt-4 text-gray-600" data-v-b62cf2d1>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445...</p></div>`);
      } else if (dashboard2.value) {
        _push(`<div class="space-y-8" data-v-b62cf2d1><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-v-b62cf2d1><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><div class="flex items-center justify-between" data-v-b62cf2d1><div data-v-b62cf2d1><p class="text-sm text-gray-600" data-v-b62cf2d1>\u041E\u0431\u0449\u0430\u044F \u0432\u044B\u0440\u0443\u0447\u043A\u0430</p><p class="text-2xl font-bold text-gray-900 mt-2" data-v-b62cf2d1>${ssrInterpolate(money(dashboard2.value.totalRevenue))}</p></div><div class="p-3 bg-green-100 rounded-lg" data-v-b62cf2d1><span class="text-2xl" data-v-b62cf2d1>\u{1F4B0}</span></div></div></div><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><div class="flex items-center justify-between" data-v-b62cf2d1><div data-v-b62cf2d1><p class="text-sm text-gray-600" data-v-b62cf2d1>\u0412\u0441\u0435\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u043E\u0432</p><p class="text-2xl font-bold text-gray-900 mt-2" data-v-b62cf2d1>${ssrInterpolate(dashboard2.value.ordersCount)}</p></div><div class="p-3 bg-blue-100 rounded-lg" data-v-b62cf2d1><span class="text-2xl" data-v-b62cf2d1>\u{1F4E6}</span></div></div></div><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><div class="flex items-center justify-between" data-v-b62cf2d1><div data-v-b62cf2d1><p class="text-sm text-gray-600" data-v-b62cf2d1>\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0447\u0435\u043A</p><p class="text-2xl font-bold text-gray-900 mt-2" data-v-b62cf2d1>${ssrInterpolate(money(dashboard2.value.averageOrderValue))}</p></div><div class="p-3 bg-purple-100 rounded-lg" data-v-b62cf2d1><span class="text-2xl" data-v-b62cf2d1>\u{1F4B3}</span></div></div></div><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><div class="flex items-center justify-between" data-v-b62cf2d1><div data-v-b62cf2d1><p class="text-sm text-gray-600" data-v-b62cf2d1>\u0417\u0430\u043A\u0430\u0437\u043E\u0432 \u0441\u0435\u0433\u043E\u0434\u043D\u044F</p><p class="text-2xl font-bold text-gray-900 mt-2" data-v-b62cf2d1>${ssrInterpolate(dashboard2.value.ordersToday)}</p></div><div class="p-3 bg-orange-100 rounded-lg" data-v-b62cf2d1><span class="text-2xl" data-v-b62cf2d1>\u{1F525}</span></div></div></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-6" data-v-b62cf2d1><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><h3 class="text-lg font-semibold text-gray-900 mb-4" data-v-b62cf2d1>\u{1F4C8} \u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043F\u043E \u043F\u0435\u0440\u0438\u043E\u0434\u0430\u043C</h3><div class="space-y-3" data-v-b62cf2d1><div class="flex justify-between items-center" data-v-b62cf2d1><span class="text-gray-600" data-v-b62cf2d1>\u042D\u0442\u0430 \u043D\u0435\u0434\u0435\u043B\u044F:</span><span class="font-semibold text-gray-900" data-v-b62cf2d1>${ssrInterpolate(dashboard2.value.ordersThisWeek)} \u0437\u0430\u043A\u0430\u0437\u043E\u0432</span></div><div class="flex justify-between items-center" data-v-b62cf2d1><span class="text-gray-600" data-v-b62cf2d1>\u042D\u0442\u043E\u0442 \u043C\u0435\u0441\u044F\u0446:</span><span class="font-semibold text-gray-900" data-v-b62cf2d1>${ssrInterpolate(dashboard2.value.ordersThisMonth)} \u0437\u0430\u043A\u0430\u0437\u043E\u0432</span></div></div></div>`);
        if (retailVsB2b.value) {
          _push(`<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><h3 class="text-lg font-semibold text-gray-900 mb-4" data-v-b62cf2d1>\u{1F3EA} \u0420\u043E\u0437\u043D\u0438\u0446\u0430 vs B2B</h3><div class="space-y-3" data-v-b62cf2d1><div data-v-b62cf2d1><div class="flex justify-between items-center mb-1" data-v-b62cf2d1><span class="text-sm text-gray-600" data-v-b62cf2d1>\u0420\u043E\u0437\u043D\u0438\u0446\u0430</span><span class="text-sm font-medium" data-v-b62cf2d1>${ssrInterpolate(retailVsB2b.value.retail.ordersShare.toFixed(1))}%</span></div><div class="w-full bg-gray-200 rounded-full h-2" data-v-b62cf2d1><div class="bg-blue-500 h-2 rounded-full" style="${ssrRenderStyle({ width: retailVsB2b.value.retail.ordersShare + "%" })}" data-v-b62cf2d1></div></div><p class="text-xs text-gray-500 mt-1" data-v-b62cf2d1>${ssrInterpolate(retailVsB2b.value.retail.ordersCount)} \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u2022 ${ssrInterpolate(money(retailVsB2b.value.retail.revenue))}</p></div><div data-v-b62cf2d1><div class="flex justify-between items-center mb-1" data-v-b62cf2d1><span class="text-sm text-gray-600" data-v-b62cf2d1>B2B</span><span class="text-sm font-medium" data-v-b62cf2d1>${ssrInterpolate(retailVsB2b.value.b2b.ordersShare.toFixed(1))}%</span></div><div class="w-full bg-gray-200 rounded-full h-2" data-v-b62cf2d1><div class="bg-green-500 h-2 rounded-full" style="${ssrRenderStyle({ width: retailVsB2b.value.b2b.ordersShare + "%" })}" data-v-b62cf2d1></div></div><p class="text-xs text-gray-500 mt-1" data-v-b62cf2d1>${ssrInterpolate(retailVsB2b.value.b2b.ordersCount)} \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u2022 ${ssrInterpolate(money(retailVsB2b.value.b2b.revenue))}</p></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><div class="flex items-center justify-between mb-6" data-v-b62cf2d1><h3 class="text-lg font-semibold text-gray-900" data-v-b62cf2d1>\u{1F4CA} \u041F\u0440\u043E\u0434\u0430\u0436\u0438 \u043F\u043E \u0434\u043D\u044F\u043C</h3><select class="px-3 py-2 border border-gray-300 rounded-lg text-sm" data-v-b62cf2d1><option${ssrRenderAttr("value", 7)} data-v-b62cf2d1${ssrIncludeBooleanAttr(Array.isArray(selectedDays.value) ? ssrLooseContain(selectedDays.value, 7) : ssrLooseEqual(selectedDays.value, 7)) ? " selected" : ""}>7 \u0434\u043D\u0435\u0439</option><option${ssrRenderAttr("value", 14)} data-v-b62cf2d1${ssrIncludeBooleanAttr(Array.isArray(selectedDays.value) ? ssrLooseContain(selectedDays.value, 14) : ssrLooseEqual(selectedDays.value, 14)) ? " selected" : ""}>14 \u0434\u043D\u0435\u0439</option><option${ssrRenderAttr("value", 30)} data-v-b62cf2d1${ssrIncludeBooleanAttr(Array.isArray(selectedDays.value) ? ssrLooseContain(selectedDays.value, 30) : ssrLooseEqual(selectedDays.value, 30)) ? " selected" : ""}>30 \u0434\u043D\u0435\u0439</option><option${ssrRenderAttr("value", 90)} data-v-b62cf2d1${ssrIncludeBooleanAttr(Array.isArray(selectedDays.value) ? ssrLooseContain(selectedDays.value, 90) : ssrLooseEqual(selectedDays.value, 90)) ? " selected" : ""}>90 \u0434\u043D\u0435\u0439</option></select></div>`);
        if (sales.value.length) {
          _push(`<div class="space-y-2" data-v-b62cf2d1><!--[-->`);
          ssrRenderList(sales.value, (day) => {
            _push(`<div class="flex items-center gap-3" data-v-b62cf2d1><span class="text-xs text-gray-500 w-16" data-v-b62cf2d1>${ssrInterpolate(formatDate(day.date))}</span><div class="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden" data-v-b62cf2d1><div class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center px-3 text-white text-sm font-medium" style="${ssrRenderStyle({ width: maxRevenue.value > 0 ? day.revenue / maxRevenue.value * 100 + "%" : "0%" })}" data-v-b62cf2d1>`);
            if (day.revenue > maxRevenue.value * 0.15) {
              _push(`<span data-v-b62cf2d1>${ssrInterpolate(money(day.revenue))}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><span class="text-xs text-gray-600 w-20 text-right" data-v-b62cf2d1>${ssrInterpolate(day.ordersCount)} \u0437\u0430\u043A.</span></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8 text-gray-500" data-v-b62cf2d1>\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0437\u0430 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0438\u043E\u0434</div>`);
        }
        _push(`</div><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><h3 class="text-lg font-semibold text-gray-900 mb-4" data-v-b62cf2d1>\u{1F3C6} \u0422\u043E\u043F-5 \u0442\u043E\u0432\u0430\u0440\u043E\u0432</h3><div class="overflow-x-auto" data-v-b62cf2d1><table class="w-full text-sm" data-v-b62cf2d1><thead class="border-b border-gray-200" data-v-b62cf2d1><tr data-v-b62cf2d1><th class="text-left py-3 px-2 font-medium text-gray-600" data-v-b62cf2d1>#</th><th class="text-left py-3 px-2 font-medium text-gray-600" data-v-b62cf2d1>\u0422\u043E\u0432\u0430\u0440</th><th class="text-left py-3 px-2 font-medium text-gray-600" data-v-b62cf2d1>\u0410\u0440\u0442\u0438\u043A\u0443\u043B</th><th class="text-right py-3 px-2 font-medium text-gray-600" data-v-b62cf2d1>\u041A\u043E\u043B-\u0432\u043E</th><th class="text-right py-3 px-2 font-medium text-gray-600" data-v-b62cf2d1>\u0412\u044B\u0440\u0443\u0447\u043A\u0430</th></tr></thead><tbody data-v-b62cf2d1><!--[-->`);
        ssrRenderList(dashboard2.value.topProducts, (product, idx) => {
          _push(`<tr class="border-b border-gray-100 hover:bg-gray-50" data-v-b62cf2d1><td class="py-3 px-2 text-gray-500" data-v-b62cf2d1>${ssrInterpolate(idx + 1)}</td><td class="py-3 px-2 font-medium text-gray-900" data-v-b62cf2d1>${ssrInterpolate(product.name)}</td><td class="py-3 px-2 text-gray-600" data-v-b62cf2d1>${ssrInterpolate(product.article)}</td><td class="py-3 px-2 text-right text-gray-900" data-v-b62cf2d1>${ssrInterpolate(product.qty)}</td><td class="py-3 px-2 text-right font-semibold text-gray-900" data-v-b62cf2d1>${ssrInterpolate(money(product.revenue))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div><div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200" data-v-b62cf2d1><h3 class="text-lg font-semibold text-gray-900 mb-4" data-v-b62cf2d1>\u{1F552} \u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u044B</h3><div class="space-y-3" data-v-b62cf2d1><!--[-->`);
        ssrRenderList(dashboard2.value.recentOrders, (order) => {
          _push(`<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition" data-v-b62cf2d1><div class="flex-1" data-v-b62cf2d1><p class="font-medium text-gray-900" data-v-b62cf2d1>\u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate(order.id)}</p><p class="text-sm text-gray-600" data-v-b62cf2d1>${ssrInterpolate(order.customerName || order.email)}</p></div><div class="flex items-center gap-4" data-v-b62cf2d1><span class="${ssrRenderClass([{
            "bg-yellow-100 text-yellow-800": order.status === "new" || order.status === "pending",
            "bg-blue-100 text-blue-800": order.status === "processing" || order.status === "in_production",
            "bg-green-100 text-green-800": order.status === "completed" || order.status === "shipped",
            "bg-gray-100 text-gray-800": order.status === "cancelled"
          }, "px-3 py-1 rounded-full text-xs font-medium"])}" data-v-b62cf2d1>${ssrInterpolate(order.status)}</span><span class="font-semibold text-gray-900 w-32 text-right" data-v-b62cf2d1>${ssrInterpolate(money(order.totalPrice))}</span></div></div>`);
        });
        _push(`<!--]--></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4" data-v-b62cf2d1>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/analytics",
          class: "p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-md hover:shadow-lg transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-3xl mb-3" data-v-b62cf2d1${_scopeId}>\u{1F4C8}</div><h4 class="font-semibold text-lg" data-v-b62cf2d1${_scopeId}>\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430</h4><p class="text-sm text-blue-100 mt-1" data-v-b62cf2d1${_scopeId}>\u041E\u0442\u0447\u0435\u0442\u044B \u0438 \u0444\u0438\u043B\u044C\u0442\u0440\u044B</p>`);
            } else {
              return [
                createVNode("div", { class: "text-3xl mb-3" }, "\u{1F4C8}"),
                createVNode("h4", { class: "font-semibold text-lg" }, "\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430"),
                createVNode("p", { class: "text-sm text-blue-100 mt-1" }, "\u041E\u0442\u0447\u0435\u0442\u044B \u0438 \u0444\u0438\u043B\u044C\u0442\u0440\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/orders",
          class: "p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-md hover:shadow-lg transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-3xl mb-3" data-v-b62cf2d1${_scopeId}>\u{1F4E6}</div><h4 class="font-semibold text-lg" data-v-b62cf2d1${_scopeId}>\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043C\u0438</h4><p class="text-sm text-purple-100 mt-1" data-v-b62cf2d1${_scopeId}>\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u044B</p>`);
            } else {
              return [
                createVNode("div", { class: "text-3xl mb-3" }, "\u{1F4E6}"),
                createVNode("h4", { class: "font-semibold text-lg" }, "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u0430\u043C\u0438"),
                createVNode("p", { class: "text-sm text-purple-100 mt-1" }, "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/catalog",
          class: "p-6 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-md hover:shadow-lg transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-3xl mb-3" data-v-b62cf2d1${_scopeId}>\u{1F6CD}\uFE0F</div><h4 class="font-semibold text-lg" data-v-b62cf2d1${_scopeId}>\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0442\u043E\u0432\u0430\u0440\u043E\u0432</h4><p class="text-sm text-green-100 mt-1" data-v-b62cf2d1${_scopeId}>\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430\u043C\u0438</p>`);
            } else {
              return [
                createVNode("div", { class: "text-3xl mb-3" }, "\u{1F6CD}\uFE0F"),
                createVNode("h4", { class: "font-semibold text-lg" }, "\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0442\u043E\u0432\u0430\u0440\u043E\u0432"),
                createVNode("p", { class: "text-sm text-green-100 mt-1" }, "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u0430\u043C\u0438")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else if (!loading.value) {
        _push(`<div class="text-center py-12 text-gray-500" data-v-b62cf2d1><p data-v-b62cf2d1>\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445 \u0434\u043B\u044F \u043E\u0442\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F</p></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/dashboard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const dashboard = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b62cf2d1"]]);

export { dashboard as default };
//# sourceMappingURL=dashboard-VgQ8F6Fu.mjs.map
