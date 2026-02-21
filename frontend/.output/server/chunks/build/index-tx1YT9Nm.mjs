import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderComponent, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
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
    computed(() => {
      const config = useRuntimeConfig();
      return config.apiBaseUrl;
    });
    const isAdmin = computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "admin";
    });
    const isManager = computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "manager";
    });
    const loading = ref(false);
    const err = ref("");
    const dashboard = ref(null);
    const dateFrom = ref("");
    const dateTo = ref("");
    const attentionRows = computed(() => {
      var _a, _b, _c;
      const rows = [];
      const d = dashboard.value;
      for (const o of ((_a = d == null ? void 0 : d.attention) == null ? void 0 : _a.deficitOrders) || []) {
        rows.push({
          kind: "deficit_order",
          id: o.id,
          title: `\u0417\u0430\u043A\u0430\u0437 #${o.id}`,
          subtitle: "\u0414\u0435\u0444\u0438\u0446\u0438\u0442 / \u0436\u0434\u0451\u0442 \u0441\u043A\u043B\u0430\u0434",
          createdAt: o.createdAt,
          payload: o
        });
      }
      for (const t of ((_b = d == null ? void 0 : d.attention) == null ? void 0 : _b.overdueTasks) || []) {
        rows.push({
          kind: "overdue_task",
          id: t.id,
          title: `\u0417\u0430\u0434\u0430\u0447\u0430 #${t.id} \xB7 \u0417\u0430\u043A\u0430\u0437 #${t.orderId}`,
          subtitle: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E",
          createdAt: t.updatedAt || t.createdAt,
          payload: t
        });
      }
      for (const o of ((_c = d == null ? void 0 : d.attention) == null ? void 0 : _c.lateShipOrders) || []) {
        rows.push({
          kind: "late_ship",
          id: o.id,
          title: `\u0417\u0430\u043A\u0430\u0437 #${o.id}`,
          subtitle: "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430",
          createdAt: o.createdAt,
          payload: o
        });
      }
      return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 30);
    });
    const storeOrders = ref([]);
    const storeStats = computed(() => {
      const orders = storeOrders.value;
      return {
        totalOrders: orders.length,
        inProgress: orders.filter((o) => ["new", "processing", "in_work"].includes(o.status)).length,
        ready: orders.filter((o) => o.status === "ready").length
      };
    });
    function formatOrderDate(d) {
      if (!d) return "\u2014";
      return new Date(d).toLocaleDateString("ru-RU");
    }
    function formatMoney(v) {
      return Number(v || 0).toLocaleString("ru-RU");
    }
    function orderStatusLabel(s) {
      const map = {
        new: "\u041D\u043E\u0432\u044B\u0439",
        processing: "\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435",
        in_work: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",
        ready: "\u0413\u043E\u0442\u043E\u0432 \u043A \u0432\u044B\u0434\u0430\u0447\u0435",
        shipped: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D",
        delivered: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D",
        cancelled: "\u041E\u0442\u043C\u0435\u043D\u0451\u043D"
      };
      return map[s] || s;
    }
    function orderStatusClass(s) {
      if (s === "ready") return "bg-green-100 text-green-800 border border-green-200";
      if (s === "shipped" || s === "delivered") return "bg-blue-100 text-blue-800 border border-blue-200";
      if (s === "cancelled") return "bg-red-100 text-red-800 border border-red-200";
      return "bg-gray-100 text-gray-700 border border-gray-200";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a2;
      var _a, _b, _c;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (!isAdmin.value && !isManager.value && unref(auth).storeContext) {
        _push(`<!--[-->`);
        if (unref(auth).storeContext.status === "lead") {
          _push(`<div class="rounded-2xl border border-yellow-200 bg-yellow-50 p-6"><div class="flex items-start gap-4"><div class="text-3xl">\u23F3</div><div class="flex-1"><h3 class="text-lg font-semibold text-yellow-900">\u0417\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u0438\u0438</h3><p class="text-sm text-yellow-800 mt-2"> \u0412\u0430\u0448\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u043D\u0430 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044E B2B \u043A\u0430\u0431\u0438\u043D\u0435\u0442\u0430 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u043D\u0430 \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438. \u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440 \u0441\u0432\u044F\u0436\u0435\u0442\u0441\u044F \u0441 \u0432\u0430\u043C\u0438 \u0432 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043C\u044F. </p><p class="text-sm text-yellow-700 mt-2"> \u041F\u043E\u0441\u043B\u0435 \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u0432\u0430\u043C \u0441\u0442\u0430\u043D\u0443\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B \u043E\u043F\u0442\u043E\u0432\u044B\u0435 \u0446\u0435\u043D\u044B \u0438 \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u043D\u044B\u0439 \u0444\u0443\u043D\u043A\u0446\u0438\u043E\u043D\u0430\u043B. </p></div></div></div>`);
        } else if (unref(auth).storeContext.status === "blocked") {
          _push(`<div class="rounded-2xl border border-red-200 bg-red-50 p-6"><div class="flex items-start gap-4"><div class="text-3xl">\u{1F6AB}</div><div class="flex-1"><h3 class="text-lg font-semibold text-red-900">\u0414\u043E\u0441\u0442\u0443\u043F \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D</h3><p class="text-sm text-red-800 mt-2"> \u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D. \u0414\u043B\u044F \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044F \u043F\u043E\u0434\u0440\u043E\u0431\u043D\u043E\u0439 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438 \u0441\u0432\u044F\u0436\u0438\u0442\u0435\u0441\u044C \u0441 \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u043C. </p>`);
          if (unref(auth).storeContext.moderationNote) {
            _push(`<p class="text-sm text-red-700 mt-2 p-3 bg-red-100 rounded-lg"><strong>\u041F\u0440\u0438\u0447\u0438\u043D\u0430:</strong> ${ssrInterpolate(unref(auth).storeContext.moderationNote)}</p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="mt-4"><a href="mailto:support@suvlavka.ru" class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"> \u{1F4E7} \u0421\u0432\u044F\u0437\u0430\u0442\u044C\u0441\u044F \u0441 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439 </a></div></div></div></div>`);
        } else if (unref(auth).storeContext.status === "active") {
          _push(`<div class="rounded-2xl border border-green-200 bg-green-50 p-4"><div class="flex items-center gap-3"><div class="text-2xl">\u2705</div><div class="flex-1"><p class="text-sm text-green-800"><strong>\u0412\u0430\u0448 B2B \u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u0435\u043D.</strong> \u0421\u043A\u0438\u0434\u043A\u0430 ${ssrInterpolate(unref(auth).storeContext.discountPercent)}% \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0435\u0442\u0441\u044F \u043A\u043E \u0432\u0441\u0435\u043C \u0437\u0430\u043A\u0430\u0437\u0430\u043C. </p></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (isAdmin.value) {
        _push(`<!--[--><div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u0414\u044D\u0448\u0431\u043E\u0440\u0434</h1><p class="text-sm text-gray-600 mt-1">\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0441\u0432\u043E\u0434\u043A\u0430: \u0447\u0442\u043E \u0433\u043E\u0440\u0438\u0442 \u0438 \u043A\u0443\u0434\u0430 \u0438\u0434\u0442\u0438.</p></div><div class="flex flex-wrap items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0421\u0435\u0433\u043E\u0434\u043D\u044F</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041D\u0435\u0434\u0435\u043B\u044F</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041C\u0435\u0441\u044F\u0446</button><div class="h-8 w-px bg-gray-200 mx-1"></div><div class="flex items-center gap-2"><input${ssrRenderAttr("value", dateFrom.value)} type="date" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><span class="text-xs text-gray-400">\u2014</span><input${ssrRenderAttr("value", dateTo.value)} type="date" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C</button></div><div class="h-8 w-px bg-gray-200 mx-1"></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/admin/db",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F9E8} DB Viewer`);
            } else {
              return [
                createTextVNode("\u{1F9E8} DB Viewer")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
        if (err.value) {
          _push(`<div class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">${ssrInterpolate(err.value)}</div>`);
        } else if (loading.value) {
          _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between"><div><div class="text-sm font-semibold">\u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F</div><div class="text-xs text-gray-500 mt-1">\u0414\u0435\u0444\u0438\u0446\u0438\u0442\u044B, \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430, \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438.</div></div><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C</button></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u0422\u0438\u043F</th><th class="text-left px-4 py-3">\u041E\u0431\u044A\u0435\u043A\u0442</th><th class="text-left px-4 py-3">\u0414\u0430\u0442\u0430</th><th class="text-left px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(attentionRows.value, (r) => {
          var _a22, _b2, _c2, _d, _e;
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(r.subtitle)}</span></td><td class="px-4 py-3"><div class="font-medium">${ssrInterpolate(r.title)}</div>`);
          if (r.kind === "deficit_order") {
            _push(`<div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441: ${ssrInterpolate((_a22 = r.payload) == null ? void 0 : _a22.status)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "overdue_task") {
            _push(`<div class="text-xs text-gray-500">\u0422\u043E\u0432\u0430\u0440 ID: ${ssrInterpolate((_b2 = r.payload) == null ? void 0 : _b2.productId)} \xB7 \u041A\u043E\u043B-\u0432\u043E: ${ssrInterpolate((_c2 = r.payload) == null ? void 0 : _c2.qty)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "late_ship") {
            _push(`<div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441: ${ssrInterpolate((_d = r.payload) == null ? void 0 : _d.status)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 text-xs text-gray-500 tabular-nums">${ssrInterpolate(new Date(r.createdAt).toLocaleString("ru-RU"))}</td><td class="px-4 py-3"><div class="flex flex-wrap gap-2">`);
          if (r.kind === "deficit_order" || r.kind === "late_ship") {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: { path: "/b2b/admin/orders", query: { q: String(r.id) } },
              class: "px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u041A \u0437\u0430\u043A\u0430\u0437\u0443`);
                } else {
                  return [
                    createTextVNode("\u041A \u0437\u0430\u043A\u0430\u0437\u0443")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "deficit_order" || r.kind === "overdue_task") {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: { path: "/b2b/admin/production", query: { orderId: String(((_e = r.payload) == null ? void 0 : _e.orderId) || r.id) } },
              class: "px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E`);
                } else {
                  return [
                    createTextVNode("\u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "late_ship") {
            _push(`<button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs">\u041F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (attentionRows.value.length === 0) {
          _push(`<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">\u041F\u043E\u043A\u0430 \u0432\u0441\u0451 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E \u{1F389}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/b2b/admin/orders" },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a3, _b3, _c3, _d2, _e2, _f2, _g2, _h2;
            var _a22, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u0417\u0430\u043A\u0430\u0437\u044B</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0412\u0441\u0435\u0433\u043E</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a3 = (_c2 = (_b2 = (_a22 = dashboard.value) == null ? void 0 : _a22.kpi) == null ? void 0 : _b2.orders) == null ? void 0 : _c2.total) != null ? _a3 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041D\u043E\u0432\u044B\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b3 = (_f = (_e = (_d = dashboard.value) == null ? void 0 : _d.kpi) == null ? void 0 : _e.orders) == null ? void 0 : _f.new) != null ? _b3 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_c3 = (_i = (_h = (_g = dashboard.value) == null ? void 0 : _g.kpi) == null ? void 0 : _h.orders) == null ? void 0 : _i.inWork) != null ? _c3 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0416\u0434\u0443\u0442 \u0441\u043A\u043B\u0430\u0434</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_d2 = (_l = (_k = (_j = dashboard.value) == null ? void 0 : _j.kpi) == null ? void 0 : _k.orders) == null ? void 0 : _l.waitingWarehouse) != null ? _d2 : "\u2014")}</span></div></div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u0417\u0430\u043A\u0430\u0437\u044B"),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0412\u0441\u0435\u0433\u043E"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_e2 = (_o = (_n = (_m = dashboard.value) == null ? void 0 : _m.kpi) == null ? void 0 : _n.orders) == null ? void 0 : _o.total) != null ? _e2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041D\u043E\u0432\u044B\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_f2 = (_r = (_q = (_p = dashboard.value) == null ? void 0 : _p.kpi) == null ? void 0 : _q.orders) == null ? void 0 : _r.new) != null ? _f2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_g2 = (_u = (_t = (_s = dashboard.value) == null ? void 0 : _s.kpi) == null ? void 0 : _t.orders) == null ? void 0 : _u.inWork) != null ? _g2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0416\u0434\u0443\u0442 \u0441\u043A\u043B\u0430\u0434"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_h2 = (_x = (_w = (_v = dashboard.value) == null ? void 0 : _v.kpi) == null ? void 0 : _w.orders) == null ? void 0 : _x.waitingWarehouse) != null ? _h2 : "\u2014"), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/b2b/admin/orders", query: { status: "in_work" } },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a3, _b3, _c3, _d2;
            var _a22, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a3 = (_c2 = (_b2 = (_a22 = dashboard.value) == null ? void 0 : _a22.kpi) == null ? void 0 : _b2.shipments) == null ? void 0 : _c2.readyToShip) != null ? _a3 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0441\u0435\u0433\u043E\u0434\u043D\u044F</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b3 = (_f = (_e = (_d = dashboard.value) == null ? void 0 : _d.kpi) == null ? void 0 : _e.shipments) == null ? void 0 : _f.shippedToday) != null ? _b3 : "\u2014")}</span></div></div><div class="text-xs text-gray-500 mt-3"${_scopeId}>\u041A\u043B\u0438\u043A \u2192 \u0437\u0430\u043A\u0430\u0437\u044B</div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438"),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_c3 = (_i = (_h = (_g = dashboard.value) == null ? void 0 : _g.kpi) == null ? void 0 : _h.shipments) == null ? void 0 : _i.readyToShip) != null ? _c3 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0441\u0435\u0433\u043E\u0434\u043D\u044F"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_d2 = (_l = (_k = (_j = dashboard.value) == null ? void 0 : _j.kpi) == null ? void 0 : _k.shipments) == null ? void 0 : _l.shippedToday) != null ? _d2 : "\u2014"), 1)
                  ])
                ]),
                createVNode("div", { class: "text-xs text-gray-500 mt-3" }, "\u041A\u043B\u0438\u043A \u2192 \u0437\u0430\u043A\u0430\u0437\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/b2b/admin/warehouse" },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a3, _b3, _c3, _d2;
            var _a22, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u0421\u043A\u043B\u0430\u0434 (${ssrInterpolate(((_b2 = (_a22 = dashboard.value) == null ? void 0 : _a22.range) == null ? void 0 : _b2.warehouse) || "MAIN")})</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041F\u043E\u0437\u0438\u0446\u0438\u0439 \u0432 \u0434\u0435\u0444\u0438\u0446\u0438\u0442\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a3 = (_e = (_d = (_c2 = dashboard.value) == null ? void 0 : _c2.kpi) == null ? void 0 : _d.stocks) == null ? void 0 : _e.deficitPositions) != null ? _a3 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041A\u0440\u0438\u0442\u0438\u0447\u043D\u043E</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b3 = (_h = (_g = (_f = dashboard.value) == null ? void 0 : _f.kpi) == null ? void 0 : _g.stocks) == null ? void 0 : _h.criticalPositions) != null ? _b3 : "\u2014")}</span></div></div><div class="text-xs text-gray-500 mt-3"${_scopeId}>\u041A\u043B\u0438\u043A \u2192 \u0441\u043A\u043B\u0430\u0434</div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u0421\u043A\u043B\u0430\u0434 (" + toDisplayString(((_j = (_i = dashboard.value) == null ? void 0 : _i.range) == null ? void 0 : _j.warehouse) || "MAIN") + ")", 1),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041F\u043E\u0437\u0438\u0446\u0438\u0439 \u0432 \u0434\u0435\u0444\u0438\u0446\u0438\u0442\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_c3 = (_m = (_l = (_k = dashboard.value) == null ? void 0 : _k.kpi) == null ? void 0 : _l.stocks) == null ? void 0 : _m.deficitPositions) != null ? _c3 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041A\u0440\u0438\u0442\u0438\u0447\u043D\u043E"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_d2 = (_p = (_o = (_n = dashboard.value) == null ? void 0 : _n.kpi) == null ? void 0 : _o.stocks) == null ? void 0 : _p.criticalPositions) != null ? _d2 : "\u2014"), 1)
                  ])
                ]),
                createVNode("div", { class: "text-xs text-gray-500 mt-3" }, "\u041A\u043B\u0438\u043A \u2192 \u0441\u043A\u043B\u0430\u0434")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/b2b/admin/production" },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a3, _b3, _c3, _d2;
            var _a22, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a3 = (_c2 = (_b2 = (_a22 = dashboard.value) == null ? void 0 : _a22.kpi) == null ? void 0 : _b2.production) == null ? void 0 : _c2.inWork) != null ? _a3 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b3 = (_f = (_e = (_d = dashboard.value) == null ? void 0 : _d.kpi) == null ? void 0 : _e.production) == null ? void 0 : _f.overdue) != null ? _b3 : "\u2014")}</span></div></div><div class="text-xs text-gray-500 mt-3"${_scopeId}>\u041A\u043B\u0438\u043A \u2192 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E"),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_c3 = (_i = (_h = (_g = dashboard.value) == null ? void 0 : _g.kpi) == null ? void 0 : _h.production) == null ? void 0 : _i.inWork) != null ? _c3 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_d2 = (_l = (_k = (_j = dashboard.value) == null ? void 0 : _j.kpi) == null ? void 0 : _k.production) == null ? void 0 : _l.overdue) != null ? _d2 : "\u2014"), 1)
                  ])
                ]),
                createVNode("div", { class: "text-xs text-gray-500 mt-3" }, "\u041A\u043B\u0438\u043A \u2192 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
      } else if (isManager.value) {
        _push(`<!--[--><div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440</h1><p class="text-sm text-gray-600 mt-1">\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438 \u0438 \u0437\u0430\u043A\u0430\u0437\u0430\u043C.</p></div><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/admin/stores",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F3EA} \u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B`);
            } else {
              return [
                createTextVNode("\u{1F3EA} \u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/admin/orders",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F9FE} \u0417\u0430\u043A\u0430\u0437\u044B`);
            } else {
              return [
                createTextVNode("\u{1F9FE} \u0417\u0430\u043A\u0430\u0437\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/admin/in-work",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F6E0}\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0435`);
            } else {
              return [
                createTextVNode("\u{1F6E0}\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0435")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/admin/shipments",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F69A} \u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438`);
            } else {
              return [
                createTextVNode("\u{1F69A} \u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u041C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044F</div><div class="mt-1 text-lg font-semibold">\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B</div><div class="text-sm text-gray-600 mt-2">\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C, \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0442\u044C, \u043E\u0442\u043A\u043B\u043E\u043D\u044F\u0442\u044C.</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0438</div><div class="mt-1 text-lg font-semibold">\u0417\u0430\u043A\u0430\u0437\u044B</div><div class="text-sm text-gray-600 mt-2">\u0421\u0442\u0430\u0442\u0443\u0441\u044B, \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430, \u043A\u043E\u043C\u043C\u0443\u043D\u0438\u043A\u0430\u0446\u0438\u044F.</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u0421\u0431\u043E\u0440\u043A\u0430</div><div class="mt-1 text-lg font-semibold">\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</div><div class="text-sm text-gray-600 mt-2">\u0421\u0431\u043E\u0440\u043A\u0430 \u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u043E\u0432.</div></div></div><!--]-->`);
      } else {
        _push(`<!--[--><div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6"><div><h1 class="text-2xl font-semibold">\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C!</h1><p class="text-sm text-gray-600 mt-1"> B2B \u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430 ${ssrInterpolate(((_a = unref(auth).storeContext) == null ? void 0 : _a.displayName) || ((_b = unref(auth).storeContext) == null ? void 0 : _b.companyName) || "")}</p></div><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/catalog",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-900 text-sm font-semibold hover:bg-amber-500 transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u{1F6D2} \u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 `);
            } else {
              return [
                createTextVNode(" \u{1F6D2} \u0412 \u043A\u0430\u0442\u0430\u043B\u043E\u0433 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/quick-order",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u26A1 \u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 `);
            } else {
              return [
                createTextVNode(" \u26A1 \u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500 mb-1">\u0412\u0430\u0448\u0430 \u0441\u043A\u0438\u0434\u043A\u0430</div><div class="text-3xl font-bold text-amber-600">${ssrInterpolate((_a2 = (_c = unref(auth).storeContext) == null ? void 0 : _c.discountPercent) != null ? _a2 : 0)}%</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500 mb-1">\u0412\u0441\u0435\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u043E\u0432</div><div class="text-3xl font-bold text-slate-800">${ssrInterpolate(storeStats.value.totalOrders)}</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500 mb-1">\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435</div><div class="text-3xl font-bold text-blue-600">${ssrInterpolate(storeStats.value.inProgress)}</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500 mb-1">\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u0438\u044E</div><div class="text-3xl font-bold text-green-600">${ssrInterpolate(storeStats.value.ready)}</div></div></div>`);
        if (storeOrders.value.length) {
          _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden mb-6"><div class="p-4 border-b border-gray-100 flex items-center justify-between"><div><div class="text-sm font-semibold">\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B</div><div class="text-xs text-gray-500">\u0417\u0430\u043A\u0430\u0437\u044B \u0432 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435</div></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/b2b/orders",
            class: "text-sm text-blue-600 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u0412\u0441\u0435 \u0437\u0430\u043A\u0430\u0437\u044B \u2192`);
              } else {
                return [
                  createTextVNode("\u0412\u0441\u0435 \u0437\u0430\u043A\u0430\u0437\u044B \u2192")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u2116</th><th class="text-left px-4 py-3">\u0414\u0430\u0442\u0430</th><th class="text-left px-4 py-3">\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-4 py-3">\u0421\u0443\u043C\u043C\u0430</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(storeOrders.value.slice(0, 5), (o) => {
            _push(`<tr class="border-t border-gray-100 hover:bg-gray-50"><td class="px-4 py-3 font-medium">#${ssrInterpolate(o.id)}</td><td class="px-4 py-3 text-gray-600">${ssrInterpolate(formatOrderDate(o.createdAt))}</td><td class="px-4 py-3"><span class="${ssrRenderClass([orderStatusClass(o.status), "inline-flex px-2 py-1 rounded-lg text-xs font-medium"])}">${ssrInterpolate(orderStatusLabel(o.status))}</span></td><td class="px-4 py-3 font-semibold">${ssrInterpolate(formatMoney(o.totalPrice))} \u20BD</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 md:grid-cols-3 gap-4">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/catalog",
          class: "rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition group"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-2xl mb-3"${_scopeId}>\u{1F6D2}</div><div class="text-base font-semibold"${_scopeId}>\u041A\u0430\u0442\u0430\u043B\u043E\u0433</div><div class="text-sm text-gray-600 mt-1"${_scopeId}>\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0441 \u043E\u043F\u0442\u043E\u0432\u044B\u043C\u0438 \u0446\u0435\u043D\u0430\u043C\u0438</div>`);
            } else {
              return [
                createVNode("div", { class: "text-2xl mb-3" }, "\u{1F6D2}"),
                createVNode("div", { class: "text-base font-semibold" }, "\u041A\u0430\u0442\u0430\u043B\u043E\u0433"),
                createVNode("div", { class: "text-sm text-gray-600 mt-1" }, "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0441 \u043E\u043F\u0442\u043E\u0432\u044B\u043C\u0438 \u0446\u0435\u043D\u0430\u043C\u0438")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/quick-order",
          class: "rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition group"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-2xl mb-3"${_scopeId}>\u26A1</div><div class="text-base font-semibold"${_scopeId}>\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437</div><div class="text-sm text-gray-600 mt-1"${_scopeId}>\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B \u043F\u043E \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0430\u043C</div>`);
            } else {
              return [
                createVNode("div", { class: "text-2xl mb-3" }, "\u26A1"),
                createVNode("div", { class: "text-base font-semibold" }, "\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437"),
                createVNode("div", { class: "text-sm text-gray-600 mt-1" }, "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B \u043F\u043E \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0430\u043C")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/settings",
          class: "rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition group"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-2xl mb-3"${_scopeId}>\u2699\uFE0F</div><div class="text-base font-semibold"${_scopeId}>\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430</div><div class="text-sm text-gray-600 mt-1"${_scopeId}>\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438</div>`);
            } else {
              return [
                createVNode("div", { class: "text-2xl mb-3" }, "\u2699\uFE0F"),
                createVNode("div", { class: "text-base font-semibold" }, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430"),
                createVNode("div", { class: "text-sm text-gray-600 mt-1" }, "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u043A\u043E\u043C\u043F\u0430\u043D\u0438\u0438")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-tx1YT9Nm.mjs.map
