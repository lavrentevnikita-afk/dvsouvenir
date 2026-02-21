import { _ as _sfc_main$1 } from './ProductLabel-Cfk69Yin.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig, b as useRoute } from './server.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "orders",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const route = useRoute();
    const q = ref("");
    const status = ref("all");
    const store = ref("all");
    const problematic = ref(false);
    const dateFrom = ref("");
    const dateTo = ref("");
    const loading = ref(false);
    const error = ref(null);
    const orders = ref([]);
    const selected = ref({});
    const bulkAction = ref("");
    const selectedIds = computed(() => Object.keys(selected.value).filter((k) => selected.value[Number(k)]).map((k) => Number(k)));
    function humanDate(dt) {
      if (!dt) return "\u2014";
      const d = new Date(dt);
      return d.toLocaleString();
    }
    const statusLabel = {
      new: "\u041D\u043E\u0432\u044B\u0439",
      confirmed: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D",
      in_work: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",
      shipped: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D",
      closed: "\u0417\u0430\u043A\u0440\u044B\u0442"
    };
    const whLabel = {
      ok: "OK",
      partial: "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E",
      deficit: "\u0414\u0435\u0444\u0438\u0446\u0438\u0442"
    };
    const prodLabel = {
      not_needed: "\u041D\u0435 \u043D\u0443\u0436\u043D\u043E",
      planned: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
      in_work: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",
      ready: "\u0413\u043E\u0442\u043E\u0432\u043E"
    };
    const shipLabel = {
      not_ready: "\u041D\u0435 \u0433\u043E\u0442\u043E\u0432\u043E",
      ready: "\u0413\u043E\u0442\u043E\u0432\u043E",
      shipped: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E"
    };
    async function load() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/ops/orders", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: {
            q: q.value || void 0,
            status: status.value === "all" ? void 0 : status.value,
            store: store.value === "all" ? void 0 : store.value,
            problematic: problematic.value ? "1" : void 0,
            dateFrom: dateFrom.value ? new Date(dateFrom.value).toISOString() : void 0,
            dateTo: dateTo.value ? (/* @__PURE__ */ new Date(dateTo.value + "T23:59:59.999Z")).toISOString() : void 0
          }
        });
        orders.value = Array.isArray(res == null ? void 0 : res.orders) ? res.orders : [];
        const keep = {};
        for (const o of orders.value) if (selected.value[o.id]) keep[o.id] = true;
        selected.value = keep;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0437\u0430\u043A\u0430\u0437\u044B";
      } finally {
        loading.value = false;
      }
    }
    const drawerOpen = ref(false);
    const drawerLoading = ref(false);
    const drawerError = ref(null);
    const activeId = ref(null);
    const detail = ref(null);
    const drawerComment = ref("");
    watch([q, status, store, problematic, dateFrom, dateTo], () => {
      load();
    });
    watch(
      () => route.query,
      (qry) => {
        const s = String((qry == null ? void 0 : qry.status) || "").trim();
        const qq = String((qry == null ? void 0 : qry.q) || "").trim();
        if (s && ["new", "confirmed", "in_work", "shipped", "closed", "all"].includes(s)) status.value = s;
        if (typeof (qry == null ? void 0 : qry.q) !== "undefined") q.value = qq;
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProductLabel = _sfc_main$1;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u0417\u0430\u043A\u0430\u0437\u044B</h1><p class="text-sm text-gray-600 mt-1">\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u043A\u0430\u043A \u0432 OMS: \u0441\u0442\u0430\u0442\u0443\u0441\u044B \u0441\u043A\u043B\u0430\u0434\u0430/\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430/\u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438 + \u043C\u0430\u0441\u0441\u043E\u0432\u044B\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F</p></div><div class="flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u042D\u043A\u0441\u043F\u043E\u0440\u0442 </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-4"><div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3"><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2 flex-1"><input${ssrRenderAttr("value", unref(q))} placeholder="\u041F\u043E\u0438\u0441\u043A: \u043D\u043E\u043C\u0435\u0440 / \u0442\u0435\u043B\u0435\u0444\u043E\u043D / \u0430\u0440\u0442\u0438\u043A\u0443\u043B / email" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "all") : ssrLooseEqual(unref(status), "all")) ? " selected" : ""}>\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B</option><option value="new"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "new") : ssrLooseEqual(unref(status), "new")) ? " selected" : ""}>\u041D\u043E\u0432\u044B\u0435</option><option value="confirmed"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "confirmed") : ssrLooseEqual(unref(status), "confirmed")) ? " selected" : ""}>\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0435</option><option value="in_work"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "in_work") : ssrLooseEqual(unref(status), "in_work")) ? " selected" : ""}>\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</option><option value="shipped"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "shipped") : ssrLooseEqual(unref(status), "shipped")) ? " selected" : ""}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0435</option><option value="closed"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "closed") : ssrLooseEqual(unref(status), "closed")) ? " selected" : ""}>\u0417\u0430\u043A\u0440\u044B\u0442\u044B\u0435</option></select><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(store)) ? ssrLooseContain(unref(store), "all") : ssrLooseEqual(unref(store), "all")) ? " selected" : ""}>\u0412\u0441\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B</option><option value="\u0421\u0430\u0439\u0442"${ssrIncludeBooleanAttr(Array.isArray(unref(store)) ? ssrLooseContain(unref(store), "\u0421\u0430\u0439\u0442") : ssrLooseEqual(unref(store), "\u0421\u0430\u0439\u0442")) ? " selected" : ""}>\u0421\u0430\u0439\u0442</option></select><label class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><input${ssrIncludeBooleanAttr(Array.isArray(unref(problematic)) ? ssrLooseContain(unref(problematic), null) : unref(problematic)) ? " checked" : ""} type="checkbox" class="rounded"><span>\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u043D\u044B\u0435</span></label></div><div class="flex flex-col sm:flex-row gap-2"><div class="flex gap-2"><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"></div><div class="flex gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0421\u0435\u0433\u043E\u0434\u043D\u044F</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041D\u0435\u0434\u0435\u043B\u044F</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041C\u0435\u0441\u044F\u0446</button></div></div></div><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div class="text-sm text-gray-600"> \u041D\u0430\u0439\u0434\u0435\u043D\u043E: <span class="font-semibold text-gray-900">${ssrInterpolate(unref(orders).length)}</span>`);
      if (unref(selectedIds).length) {
        _push(`<span class="ml-2">\xB7 \u0412\u044B\u0431\u0440\u0430\u043D\u043E: <span class="font-semibold text-gray-900">${ssrInterpolate(unref(selectedIds).length)}</span></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex items-center gap-2"><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(bulkAction)) ? ssrLooseContain(unref(bulkAction), "") : ssrLooseEqual(unref(bulkAction), "")) ? " selected" : ""}>\u041C\u0430\u0441\u0441\u043E\u0432\u044B\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F\u2026</option><option value="accept"${ssrIncludeBooleanAttr(Array.isArray(unref(bulkAction)) ? ssrLooseContain(unref(bulkAction), "accept") : ssrLooseEqual(unref(bulkAction), "accept")) ? " selected" : ""}>\u041F\u0440\u0438\u043D\u044F\u0442\u044C</option><option value="cancel"${ssrIncludeBooleanAttr(Array.isArray(unref(bulkAction)) ? ssrLooseContain(unref(bulkAction), "cancel") : ssrLooseEqual(unref(bulkAction), "cancel")) ? " selected" : ""}>\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C</option><option value="to_production"${ssrIncludeBooleanAttr(Array.isArray(unref(bulkAction)) ? ssrLooseContain(unref(bulkAction), "to_production") : ssrLooseEqual(unref(bulkAction), "to_production")) ? " selected" : ""}>\u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</option><option value="ship"${ssrIncludeBooleanAttr(Array.isArray(unref(bulkAction)) ? ssrLooseContain(unref(bulkAction), "ship") : ssrLooseEqual(unref(bulkAction), "ship")) ? " selected" : ""}>\u041F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E</option></select><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(!unref(selectedIds).length || !unref(bulkAction)) ? " disabled" : ""}> \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C </button></div></div></div>`);
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3 w-[48px]"><input type="checkbox" class="rounded"${ssrIncludeBooleanAttr(unref(orders).length && unref(selectedIds).length === unref(orders).length) ? " checked" : ""}></th><th class="text-left px-4 py-3">\u2116 / \u0434\u0430\u0442\u0430</th><th class="text-left px-4 py-3">\u041C\u0430\u0433\u0430\u0437\u0438\u043D / \u043A\u043B\u0438\u0435\u043D\u0442</th><th class="text-left px-4 py-3">\u0421\u0443\u043C\u043C\u0430</th><th class="text-left px-4 py-3">\u0421\u0442\u0430\u0442\u0443\u0441 \u0437\u0430\u043A\u0430\u0437\u0430</th><th class="text-left px-4 py-3">\u0421\u043A\u043B\u0430\u0434</th><th class="text-left px-4 py-3">\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</th><th class="text-left px-4 py-3">\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0430</th><th class="text-left px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(orders), (o) => {
          _push(`<tr class="border-t border-gray-100 hover:bg-gray-50/50"><td class="px-4 py-3 align-top"><input${ssrIncludeBooleanAttr(Array.isArray(unref(selected)[o.id]) ? ssrLooseContain(unref(selected)[o.id], null) : unref(selected)[o.id]) ? " checked" : ""} type="checkbox" class="rounded"></td><td class="px-4 py-3 align-top"><div class="font-semibold">#${ssrInterpolate(o.id)}</div><div class="text-xs text-gray-500">${ssrInterpolate(humanDate(o.createdAt))}</div></td><td class="px-4 py-3 align-top"><div class="text-xs text-gray-500">${ssrInterpolate(o.store || "\u2014")}</div><div class="font-medium">${ssrInterpolate(o.customerName)}</div><div class="text-xs text-gray-500">${ssrInterpolate(o.phone || "\u2014")} \xB7 ${ssrInterpolate(o.email)}</div></td><td class="px-4 py-3 align-top">${ssrInterpolate(o.totalPrice)} \u20BD</td><td class="px-4 py-3 align-top"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(statusLabel[o.status] || o.status)}</span></td><td class="px-4 py-3 align-top"><span class="${ssrRenderClass([o.warehouseStatus === "deficit" ? "bg-red-50 text-red-700 border-red-200" : o.warehouseStatus === "partial" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(whLabel[o.warehouseStatus] || o.warehouseStatus)}</span></td><td class="px-4 py-3 align-top"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(prodLabel[o.productionStatus] || o.productionStatus)}</span></td><td class="px-4 py-3 align-top"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(shipLabel[o.shipmentStatus] || o.shipmentStatus)}</span></td><td class="px-4 py-3 align-top"><div class="flex flex-wrap gap-2"><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u041E\u0442\u043A\u0440\u044B\u0442\u044C </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u041F\u0440\u0438\u043D\u044F\u0442\u044C </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E </button></div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(orders).length === 0) {
          _push(`<tr><td colspan="9" class="px-4 py-10 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      }
      if (unref(drawerOpen)) {
        _push(`<div class="fixed inset-0 z-[1100]"><div class="absolute inset-0 bg-black/30"></div><div class="absolute right-0 top-0 h-full w-full max-w-[680px] bg-white shadow-xl border-l border-gray-200"><div class="h-full flex flex-col"><div class="px-4 py-3 border-b border-gray-200 flex items-center justify-between"><div><div class="text-sm text-gray-500">\u041A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u0430</div>`);
        if (unref(activeId)) {
          _push(`<div class="text-xl font-semibold">#${ssrInterpolate(unref(activeId))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button></div><div class="flex-1 overflow-y-auto p-4 space-y-4">`);
        if (unref(drawerError)) {
          _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(drawerError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(drawerLoading)) {
          _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
        } else if (unref(detail)) {
          _push(`<!--[--><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><div class="text-xs text-gray-500">\u041A\u043B\u0438\u0435\u043D\u0442</div><div class="font-semibold">${ssrInterpolate(unref(detail).order.customerName)}</div><div class="text-sm text-gray-600">${ssrInterpolate(unref(detail).order.phone || "\u2014")} \xB7 ${ssrInterpolate(unref(detail).order.email)}</div></div><div><div class="text-xs text-gray-500">\u0410\u0434\u0440\u0435\u0441</div><div class="text-sm text-gray-800">${ssrInterpolate(unref(detail).order.address)}</div></div><div><div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441</div><div class="text-sm font-semibold">${ssrInterpolate(statusLabel[unref(detail).order.status] || unref(detail).order.status)}</div><div class="text-xs text-gray-500">${ssrInterpolate(humanDate(unref(detail).order.createdAt))}</div></div><div><div class="text-xs text-gray-500">\u0421\u0443\u043C\u043C\u0430</div><div class="text-sm font-semibold">${ssrInterpolate(unref(detail).order.totalPrice)} \u20BD</div></div></div><div class="flex flex-wrap gap-2 mt-4"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0437\u0430\u043A\u0430\u0437</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0435 \u0437\u0430\u0434\u0430\u043D\u0438\u0435</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0443</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0443</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C</button></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 border-b border-gray-200 bg-gray-50"><div class="text-sm font-semibold">\u0421\u043E\u0441\u0442\u0430\u0432 \u0437\u0430\u043A\u0430\u0437\u0430</div></div><div class="p-4 overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-500"><tr><th class="text-left py-2">\u041F\u043E\u0437\u0438\u0446\u0438\u044F</th><th class="text-left py-2">\u041A\u043E\u043B-\u0432\u043E</th><th class="text-left py-2">\u0426\u0435\u043D\u0430</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(detail).lines, (l) => {
            _push(`<tr class="border-t border-gray-100"><td class="py-2"><div class="flex items-start justify-between gap-3"><div><div class="font-medium">${ssrInterpolate(l.name)}</div><div class="mt-1">`);
            _push(ssrRenderComponent(_component_ProductLabel, {
              article: l.article,
              name: l.name,
              imageUrl: l.previewImageUrl
            }, null, _parent));
            _push(`</div></div></div></td><td class="py-2">${ssrInterpolate(l.quantity)}</td><td class="py-2">${ssrInterpolate(l.price)} \u20BD</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 border-b border-gray-200 bg-gray-50"><div class="text-sm font-semibold">\u0421\u043A\u043B\u0430\u0434</div></div><div class="p-4 space-y-2"><!--[-->`);
          ssrRenderList(unref(detail).lines, (l) => {
            _push(`<div class="rounded-xl border border-gray-200 p-3"><div class="flex items-start justify-between gap-2"><div><div class="font-medium">${ssrInterpolate(l.name)}</div><div class="mt-1">`);
            _push(ssrRenderComponent(_component_ProductLabel, {
              article: l.article,
              name: l.name,
              imageUrl: l.previewImageUrl
            }, null, _parent));
            _push(`</div><div class="text-xs text-gray-500 mt-1">\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E: ${ssrInterpolate(l.stock.available)} \xB7 \u0420\u0435\u0437\u0435\u0440\u0432: ${ssrInterpolate(l.stock.reservedQty)} \xB7 \u041E\u0441\u0442\u0430\u0442\u043E\u043A: ${ssrInterpolate(l.stock.qty)}</div></div><span class="${ssrRenderClass([l.stock.available >= l.quantity ? "bg-green-50 text-green-700 border-green-200" : l.stock.available > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-red-50 text-red-700 border-red-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(l.stock.available >= l.quantity ? "OK" : l.stock.available > 0 ? "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E" : "\u0414\u0435\u0444\u0438\u0446\u0438\u0442")}</span></div></div>`);
          });
          _push(`<!--]--></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between"><div class="text-sm font-semibold">\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</div><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u0421\u043E\u0437\u0434\u0430\u0442\u044C </button></div><div class="p-4 space-y-2">`);
          if ((unref(detail).productionTasks || []).length === 0) {
            _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0434\u0430\u043D\u0438\u0439 \u043D\u0435\u0442</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(detail).productionTasks || [], (t) => {
            var _a, _b, _c;
            _push(`<div class="rounded-xl border border-gray-200 p-3"><div class="flex items-start justify-between gap-2"><div><div class="font-medium"><span class="mr-2">\u0417\u0430\u0434\u0430\u043D\u0438\u0435</span><span class="inline-flex items-center gap-2">`);
            _push(ssrRenderComponent(_component_ProductLabel, {
              article: (_a = (unref(detail).lines || []).find((x) => x.productId === t.productId)) == null ? void 0 : _a.article,
              name: (_b = (unref(detail).lines || []).find((x) => x.productId === t.productId)) == null ? void 0 : _b.name,
              imageUrl: (_c = (unref(detail).lines || []).find((x) => x.productId === t.productId)) == null ? void 0 : _c.previewImageUrl
            }, null, _parent));
            _push(`<span class="text-sm text-gray-700">\xD7 ${ssrInterpolate(t.qty)}</span></span></div><div class="text-xs text-gray-500">${ssrInterpolate(humanDate(t.createdAt))}</div></div><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(prodLabel[t.status] || t.status)}</span></div></div>`);
          });
          _push(`<!--]--></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between"><div class="text-sm font-semibold">\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0430</div><div class="flex gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u0421\u043E\u0437\u0434\u0430\u0442\u044C </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C </button></div></div><div class="p-4">`);
          if (!unref(detail).shipment) {
            _push(`<div class="text-sm text-gray-500">\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0430 \u0435\u0449\u0435 \u043D\u0435 \u0441\u043E\u0437\u0434\u0430\u043D\u0430</div>`);
          } else {
            _push(`<div class="rounded-xl border border-gray-200 p-3"><div class="font-medium">#${ssrInterpolate(unref(detail).shipment.id)}</div><div class="text-xs text-gray-500">\u0421\u043E\u0437\u0434\u0430\u043D\u043E: ${ssrInterpolate(humanDate(unref(detail).shipment.createdAt))}</div>`);
            if (unref(detail).shipment.shippedAt) {
              _push(`<div class="text-xs text-gray-500">\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E: ${ssrInterpolate(humanDate(unref(detail).shipment.shippedAt))}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="mt-2"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(unref(detail).shipment.status === "shipped" ? "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E" : "\u041D\u0435 \u043E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E")}</span></div></div>`);
          }
          _push(`</div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 border-b border-gray-200 bg-gray-50"><div class="text-sm font-semibold">\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 + \u0438\u0441\u0442\u043E\u0440\u0438\u044F</div></div><div class="p-4 space-y-3"><div class="rounded-xl border border-gray-200 p-3"><div class="text-xs text-gray-500 mb-2">\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439</div><textarea rows="3" class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 \u0434\u043B\u044F \u043C\u0435\u043D\u0435\u0434\u0436\u0435\u0440\u043E\u0432">${ssrInterpolate(unref(drawerComment))}</textarea><div class="flex justify-end mt-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</button></div></div><div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(detail).history || [], (h, idx) => {
            _push(`<div class="rounded-xl border border-gray-200 bg-white px-3 py-2"><div class="text-xs text-gray-500">${ssrInterpolate(humanDate(h.at))}</div><div class="text-sm">${ssrInterpolate(h.text)}</div></div>`);
          });
          _push(`<!--]-->`);
          if ((unref(detail).history || []).length === 0) {
            _push(`<div class="text-sm text-gray-500">\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u0443\u0441\u0442\u0430</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div><!--]-->`);
        } else {
          _push(`<div class="text-sm text-gray-500">\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445</div>`);
        }
        _push(`</div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/orders.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=orders-D5bEVOZf.mjs.map
