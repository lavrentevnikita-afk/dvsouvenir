import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, isRef, withDirectives, vModelCheckbox, createBlock, createCommentVNode, toDisplayString, openBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderList, ssrRenderClass } from 'vue/server-renderer';
import { _ as _sfc_main$1$1, a as _sfc_main$4 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$3 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$5 } from './AdminInput-CTfEX194.mjs';
import { _ as _sfc_main$6 } from './AdminSelect-4bn3Tbjh.mjs';
import { _ as _sfc_main$7 } from './ProductLabel-Cfk69Yin.mjs';
import { u as useRuntimeConfig, b as useRoute } from './server.mjs';
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

const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "AdminBreadcrumbs",
  __ssrInlineRender: true,
  props: {
    items: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<nav${ssrRenderAttrs(mergeProps({ class: "flex items-center gap-2 text-sm mb-4" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/admin",
        class: "flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"${_scopeId}><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"${_scopeId}></path></svg><span class="hidden sm:inline"${_scopeId}>\u0413\u043B\u0430\u0432\u043D\u0430\u044F</span>`);
          } else {
            return [
              (openBlock(), createBlock("svg", {
                class: "w-4 h-4",
                fill: "none",
                viewBox: "0 0 24 24",
                stroke: "currentColor"
              }, [
                createVNode("path", {
                  "stroke-linecap": "round",
                  "stroke-linejoin": "round",
                  "stroke-width": "2",
                  d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                })
              ])),
              createVNode("span", { class: "hidden sm:inline" }, "\u0413\u043B\u0430\u0432\u043D\u0430\u044F")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<!--[-->`);
      ssrRenderList(__props.items, (item, idx) => {
        _push(`<!--[--><svg class="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>`);
        if (item.to && idx < __props.items.length - 1) {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: item.to,
            class: "flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                if (item.icon) {
                  _push2(`<span class="text-base"${_scopeId}>${ssrInterpolate(item.icon)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<span${_scopeId}>${ssrInterpolate(item.label)}</span>`);
              } else {
                return [
                  item.icon ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "text-base"
                  }, toDisplayString(item.icon), 1)) : createCommentVNode("", true),
                  createVNode("span", null, toDisplayString(item.label), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
        } else {
          _push(`<span class="flex items-center gap-1.5 text-gray-900 font-medium">`);
          if (item.icon) {
            _push(`<span class="text-base">${ssrInterpolate(item.icon)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span>${ssrInterpolate(item.label)}</span></span>`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--></nav>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AdminBreadcrumbs.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminPagination",
  __ssrInlineRender: true,
  props: {
    page: {},
    totalPages: {},
    totalItems: {},
    perPage: {}
  },
  emits: ["update:page"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const displayedPages = computed(() => {
      const pages = [];
      const total = props.totalPages;
      const current = props.page;
      if (total <= 7) {
        for (let i = 1; i <= total; i++) pages.push(i);
      } else {
        pages.push(1);
        if (current > 3) pages.push("...");
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 2) pages.push("...");
        pages.push(total);
      }
      return pages;
    });
    const startItem = computed(() => {
      if (!props.perPage || !props.totalItems) return null;
      return (props.page - 1) * props.perPage + 1;
    });
    const endItem = computed(() => {
      if (!props.perPage || !props.totalItems) return null;
      return Math.min(props.page * props.perPage, props.totalItems);
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col sm:flex-row items-center justify-between gap-4 py-4" }, _attrs))}>`);
      if (__props.totalItems) {
        _push(`<div class="text-sm text-gray-500"> \u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E <span class="font-medium text-gray-900">${ssrInterpolate(startItem.value)}</span> - <span class="font-medium text-gray-900">${ssrInterpolate(endItem.value)}</span> \u0438\u0437 <span class="font-medium text-gray-900">${ssrInterpolate(__props.totalItems)}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center gap-1"><button${ssrIncludeBooleanAttr(__props.page <= 1) ? " disabled" : ""} class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg></button><!--[-->`);
      ssrRenderList(displayedPages.value, (p, idx) => {
        _push(`<!--[-->`);
        if (p === "...") {
          _push(`<span class="px-2 text-gray-400">...</span>`);
        } else {
          _push(`<button class="${ssrRenderClass([
            "min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all",
            p === __props.page ? "bg-slate-900 text-white shadow-sm" : "border border-gray-200 hover:bg-gray-50 text-gray-700"
          ])}">${ssrInterpolate(p)}</button>`);
        }
        _push(`<!--]-->`);
      });
      _push(`<!--]--><button${ssrIncludeBooleanAttr(__props.page >= __props.totalPages) ? " disabled" : ""} class="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg></button></div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AdminPagination.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
function useDebounce(value, delay = 300) {
  const debouncedValue = ref(value.value);
  let timeout = null;
  watch(value, (newValue) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });
  return debouncedValue;
}
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
    const debouncedQ = useDebounce(q, 300);
    const status = ref("all");
    const store = ref("all");
    const problematic = ref(false);
    const overdue = ref(false);
    const dateFrom = ref("");
    const dateTo = ref("");
    const page = ref(1);
    const perPage = ref(20);
    const loading = ref(false);
    const error = ref(null);
    const orders = ref([]);
    const storeOptions = ref([]);
    const totalItems = computed(() => orders.value.length);
    const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value) || 1);
    const paginatedOrders = computed(() => {
      const start = (page.value - 1) * perPage.value;
      return orders.value.slice(start, start + perPage.value);
    });
    const selected = ref({});
    const bulkAction = ref("");
    const selectedIds = computed(() => Object.keys(selected.value).filter((k) => selected.value[Number(k)]).map((k) => Number(k)));
    function presetToday() {
      const d = /* @__PURE__ */ new Date();
      const s = d.toISOString().slice(0, 10);
      dateFrom.value = s;
      dateTo.value = s;
    }
    function presetWeek() {
      const now = /* @__PURE__ */ new Date();
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      dateFrom.value = from.toISOString().slice(0, 10);
      dateTo.value = now.toISOString().slice(0, 10);
    }
    function presetMonth() {
      const now = /* @__PURE__ */ new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFrom.value = from.toISOString().slice(0, 10);
      dateTo.value = now.toISOString().slice(0, 10);
    }
    function humanDate(dt) {
      if (!dt) return "\u2014";
      const d = new Date(dt);
      return d.toLocaleString();
    }
    const statusLabel = {
      new: "\u041D\u043E\u0432\u044B\u0439",
      confirmed: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D",
      in_work: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",
      needs_materials: "\u041D\u0443\u0436\u043D\u044B \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B",
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
            overdue: overdue.value ? "1" : void 0,
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
    function exportCsv() {
      const headers = ["id", "createdAt", "store", "customerName", "phone", "email", "totalPrice", "status", "warehouseStatus", "productionStatus", "shipmentStatus"];
      const rows = orders.value.map((o) => headers.map((h) => {
        const val = o[h];
        const s = val === null || typeof val === "undefined" ? "" : String(val);
        return /[\n\r",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","));
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = (void 0).createElement("a");
      a.href = url;
      a.download = `orders_${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.csv`;
      (void 0).body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }
    const drawerOpen = ref(false);
    const drawerLoading = ref(false);
    const drawerError = ref(null);
    const activeId = ref(null);
    const detail = ref(null);
    const drawerComment = ref("");
    const allocations = ref([]);
    const allocationsLoading = ref(false);
    const allocationByProductId = computed(() => {
      const map = {};
      for (const a of allocations.value) {
        const pid = Number(a == null ? void 0 : a.productId);
        if (!pid) continue;
        if (!map[pid]) map[pid] = { finished: 0, blanks: 0 };
        const qty = Number((a == null ? void 0 : a.qty) || 0);
        if ((a == null ? void 0 : a.status) !== "active") continue;
        if ((a == null ? void 0 : a.kind) === "FINISHED") map[pid].finished += qty;
        if ((a == null ? void 0 : a.kind) === "BLANKS") map[pid].blanks += qty;
      }
      return map;
    });
    const canReadyToShip = computed(() => {
      var _a;
      if (!detail.value) return false;
      const lines = Array.isArray((_a = detail.value) == null ? void 0 : _a.lines) ? detail.value.lines : [];
      if (!lines.length) return false;
      return lines.every((l) => {
        var _a2;
        return (((_a2 = allocationByProductId.value[Number(l.productId)]) == null ? void 0 : _a2.finished) || 0) >= (Number(l.quantity) || 0);
      });
    });
    async function loadAllocations(id) {
      if (!auth.accessToken) return;
      allocationsLoading.value = true;
      try {
        const res = await $fetch(`/api/ops/orders/${id}/allocations`, {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        allocations.value = Array.isArray(res == null ? void 0 : res.allocations) ? res.allocations : [];
      } catch {
        allocations.value = [];
      } finally {
        allocationsLoading.value = false;
      }
    }
    async function openOrder(id) {
      var _a;
      if (!auth.accessToken) return;
      drawerOpen.value = true;
      drawerLoading.value = true;
      drawerError.value = null;
      activeId.value = id;
      try {
        detail.value = await $fetch(`/api/ops/orders/${id}`, {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        await loadAllocations(id);
      } catch (e) {
        drawerError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043A\u0440\u044B\u0442\u044C \u0437\u0430\u043A\u0430\u0437";
      } finally {
        drawerLoading.value = false;
      }
    }
    async function acceptOne(id) {
      if (!auth.accessToken) return;
      await $fetch(`/api/ops/orders/${id}/accept`, {
        baseURL: apiBaseUrl,
        method: "POST",
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        body: { warehouse: "FINISHED" }
      });
      await load();
      if (activeId.value === id) await openOrder(id);
    }
    async function cancelOne(id) {
      if (!auth.accessToken) return;
      await $fetch(`/api/ops/orders/${id}/cancel`, {
        baseURL: apiBaseUrl,
        method: "POST",
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      await load();
      if (activeId.value === id) await openOrder(id);
    }
    async function toProduction(id) {
      if (!auth.accessToken) return;
      await $fetch(`/api/ops/orders/${id}/production`, {
        baseURL: apiBaseUrl,
        method: "POST",
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        body: { warehouse: "FINISHED" }
      });
      await load();
      if (activeId.value === id) await openOrder(id);
    }
    async function shipOne(id) {
      if (!auth.accessToken) return;
      await $fetch(`/api/ops/orders/${id}/ship`, {
        baseURL: apiBaseUrl,
        method: "POST",
        headers: { Authorization: `Bearer ${auth.accessToken}` }
      });
      await load();
      if (activeId.value === id) await openOrder(id);
    }
    async function runBulk() {
      const ids = selectedIds.value;
      if (!ids.length || !bulkAction.value) return;
      for (const id of ids) {
        if (bulkAction.value === "accept") await acceptOne(id);
        if (bulkAction.value === "cancel") await cancelOne(id);
        if (bulkAction.value === "to_production") await toProduction(id);
        if (bulkAction.value === "ship") await shipOne(id);
      }
      bulkAction.value = "";
    }
    watch([debouncedQ, status, store, problematic, overdue, dateFrom, dateTo], () => {
      page.value = 1;
      load();
    });
    watch(
      () => route.query,
      (qry) => {
        const s = String((qry == null ? void 0 : qry.status) || "").trim();
        const qq = String((qry == null ? void 0 : qry.q) || "").trim();
        if (s && ["new", "confirmed", "in_work", "needs_materials", "shipped", "closed", "all"].includes(s)) status.value = s;
        if (typeof (qry == null ? void 0 : qry.q) !== "undefined") q.value = qq;
        overdue.value = String((qry == null ? void 0 : qry.overdue) || "").toLowerCase() === "1" || String((qry == null ? void 0 : qry.overdue) || "").toLowerCase() === "true";
      },
      { immediate: true }
    );
    const breadcrumbs = [
      { label: "\u0417\u0430\u043A\u0430\u0437\u044B", to: "/admin/orders", icon: "\u{1F4E6}" }
    ];
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_AdminBreadcrumbs = _sfc_main$2;
      const _component_AdminPageHeader = _sfc_main$1$1;
      const _component_AdminButton = _sfc_main$3;
      const _component_AdminCard = _sfc_main$4;
      const _component_AdminInput = _sfc_main$5;
      const _component_AdminSelect = _sfc_main$6;
      const _component_AdminPagination = _sfc_main$1;
      const _component_ProductLabel = _sfc_main$7;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminBreadcrumbs, { items: breadcrumbs }, null, _parent));
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u0417\u0430\u043A\u0430\u0437\u044B",
        description: "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432: \u0441\u0442\u0430\u0442\u0443\u0441\u044B \u0441\u043A\u043B\u0430\u0434\u0430/\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430/\u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438 + \u043C\u0430\u0441\u0441\u043E\u0432\u044B\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F",
        icon: "\u{1F4CB}"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminButton, { onClick: exportCsv }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u042D\u043A\u0441\u043F\u043E\u0440\u0442`);
                } else {
                  return [
                    createTextVNode("\u042D\u043A\u0441\u043F\u043E\u0440\u0442")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminButton, {
              variant: "primary",
              onClick: load
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C`);
                } else {
                  return [
                    createTextVNode("\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminButton, { onClick: exportCsv }, {
                default: withCtx(() => [
                  createTextVNode("\u042D\u043A\u0441\u043F\u043E\u0440\u0442")
                ]),
                _: 1
              }),
              createVNode(_component_AdminButton, {
                variant: "primary",
                onClick: load
              }, {
                default: withCtx(() => [
                  createTextVNode("\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_AdminCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4"${_scopeId}><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 flex-1"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(q),
              "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
              placeholder: "\u041F\u043E\u0438\u0441\u043A: \u043D\u043E\u043C\u0435\u0440 / \u0442\u0435\u043B\u0435\u0444\u043E\u043D / \u0430\u0440\u0442\u0438\u043A\u0443\u043B",
              icon: "search"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(status),
              "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null,
              options: [
                { value: "all", label: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" },
                { value: "new", label: "\u041D\u043E\u0432\u044B\u0435" },
                { value: "confirmed", label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0435" },
                { value: "in_work", label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435" },
                { value: "needs_materials", label: "\u041D\u0443\u0436\u043D\u044B \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B" },
                { value: "shipped", label: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0435" },
                { value: "closed", label: "\u0417\u0430\u043A\u0440\u044B\u0442\u044B\u0435" }
              ]
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(store),
              "onUpdate:modelValue": ($event) => isRef(store) ? store.value = $event : null,
              options: [{ value: "all", label: "\u0412\u0441\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B" }, { value: "\u0421\u0430\u0439\u0442", label: "\u0421\u0430\u0439\u0442" }, ...unref(storeOptions)]
            }, null, _parent2, _scopeId));
            _push2(`<div class="flex gap-2"${_scopeId}><label class="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex-1"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(problematic)) ? ssrLooseContain(unref(problematic), null) : unref(problematic)) ? " checked" : ""} type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"${_scopeId}><span class="text-slate-700"${_scopeId}>\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u043D\u044B\u0435</span></label><label class="inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex-1"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(overdue)) ? ssrLooseContain(unref(overdue), null) : unref(overdue)) ? " checked" : ""} type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"${_scopeId}><span class="text-slate-700"${_scopeId}>\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435</span></label></div></div><div class="flex flex-col sm:flex-row gap-3"${_scopeId}><div class="flex gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(dateFrom),
              "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
              type: "date",
              icon: "calendar"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(dateTo),
              "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
              type: "date",
              icon: "calendar"
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"${_scopeId}><button class="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors"${_scopeId}>\u0421\u0435\u0433\u043E\u0434\u043D\u044F</button><button class="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors"${_scopeId}>\u041D\u0435\u0434\u0435\u043B\u044F</button><button class="px-4 py-2.5 hover:bg-slate-50 text-sm font-medium transition-colors"${_scopeId}>\u041C\u0435\u0441\u044F\u0446</button></div></div></div><div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 mt-4 border-t border-slate-100"${_scopeId}><div class="text-sm text-slate-600"${_scopeId}> \u041D\u0430\u0439\u0434\u0435\u043D\u043E: <span class="font-bold text-slate-900"${_scopeId}>${ssrInterpolate(unref(orders).length)}</span>`);
            if (unref(selectedIds).length) {
              _push2(`<span class="ml-2 px-2 py-0.5 bg-slate-900 text-white rounded-lg text-xs"${_scopeId}>\u0412\u044B\u0431\u0440\u0430\u043D\u043E: ${ssrInterpolate(unref(selectedIds).length)}</span>`);
            } else {
              _push2(`<!---->`);
            }
            _push2(`</div><div class="flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(bulkAction),
              "onUpdate:modelValue": ($event) => isRef(bulkAction) ? bulkAction.value = $event : null,
              options: [
                { value: "", label: "\u041C\u0430\u0441\u0441\u043E\u0432\u044B\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F\u2026" },
                { value: "accept", label: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C" },
                { value: "cancel", label: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C" },
                { value: "to_production", label: "\u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E" },
                { value: "ship", label: "\u041F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E" }
              ]
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminButton, {
              disabled: !unref(selectedIds).length || !unref(bulkAction),
              onClick: runBulk
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C `);
                } else {
                  return [
                    createTextVNode(" \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4" }, [
                createVNode("div", { class: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 flex-1" }, [
                  createVNode(_component_AdminInput, {
                    modelValue: unref(q),
                    "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                    placeholder: "\u041F\u043E\u0438\u0441\u043A: \u043D\u043E\u043C\u0435\u0440 / \u0442\u0435\u043B\u0435\u0444\u043E\u043D / \u0430\u0440\u0442\u0438\u043A\u0443\u043B",
                    icon: "search"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(status),
                    "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null,
                    options: [
                      { value: "all", label: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" },
                      { value: "new", label: "\u041D\u043E\u0432\u044B\u0435" },
                      { value: "confirmed", label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D\u043D\u044B\u0435" },
                      { value: "in_work", label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435" },
                      { value: "needs_materials", label: "\u041D\u0443\u0436\u043D\u044B \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B" },
                      { value: "shipped", label: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0435" },
                      { value: "closed", label: "\u0417\u0430\u043A\u0440\u044B\u0442\u044B\u0435" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(store),
                    "onUpdate:modelValue": ($event) => isRef(store) ? store.value = $event : null,
                    options: [{ value: "all", label: "\u0412\u0441\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B" }, { value: "\u0421\u0430\u0439\u0442", label: "\u0421\u0430\u0439\u0442" }, ...unref(storeOptions)]
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "options"]),
                  createVNode("div", { class: "flex gap-2" }, [
                    createVNode("label", { class: "inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex-1" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => isRef(problematic) ? problematic.value = $event : null,
                        type: "checkbox",
                        class: "rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, unref(problematic)]
                      ]),
                      createVNode("span", { class: "text-slate-700" }, "\u041F\u0440\u043E\u0431\u043B\u0435\u043C\u043D\u044B\u0435")
                    ]),
                    createVNode("label", { class: "inline-flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm cursor-pointer hover:bg-slate-50 transition-colors flex-1" }, [
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => isRef(overdue) ? overdue.value = $event : null,
                        type: "checkbox",
                        class: "rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelCheckbox, unref(overdue)]
                      ]),
                      createVNode("span", { class: "text-slate-700" }, "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435")
                    ])
                  ])
                ]),
                createVNode("div", { class: "flex flex-col sm:flex-row gap-3" }, [
                  createVNode("div", { class: "flex gap-2" }, [
                    createVNode(_component_AdminInput, {
                      modelValue: unref(dateFrom),
                      "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                      type: "date",
                      icon: "calendar"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                    createVNode(_component_AdminInput, {
                      modelValue: unref(dateTo),
                      "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                      type: "date",
                      icon: "calendar"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("div", { class: "inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm" }, [
                    createVNode("button", {
                      class: "px-4 py-2.5 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors",
                      onClick: presetToday
                    }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F"),
                    createVNode("button", {
                      class: "px-4 py-2.5 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors",
                      onClick: presetWeek
                    }, "\u041D\u0435\u0434\u0435\u043B\u044F"),
                    createVNode("button", {
                      class: "px-4 py-2.5 hover:bg-slate-50 text-sm font-medium transition-colors",
                      onClick: presetMonth
                    }, "\u041C\u0435\u0441\u044F\u0446")
                  ])
                ])
              ]),
              createVNode("div", { class: "flex flex-col md:flex-row md:items-center md:justify-between gap-3 pt-4 mt-4 border-t border-slate-100" }, [
                createVNode("div", { class: "text-sm text-slate-600" }, [
                  createTextVNode(" \u041D\u0430\u0439\u0434\u0435\u043D\u043E: "),
                  createVNode("span", { class: "font-bold text-slate-900" }, toDisplayString(unref(orders).length), 1),
                  unref(selectedIds).length ? (openBlock(), createBlock("span", {
                    key: 0,
                    class: "ml-2 px-2 py-0.5 bg-slate-900 text-white rounded-lg text-xs"
                  }, "\u0412\u044B\u0431\u0440\u0430\u043D\u043E: " + toDisplayString(unref(selectedIds).length), 1)) : createCommentVNode("", true)
                ]),
                createVNode("div", { class: "flex items-center gap-2" }, [
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(bulkAction),
                    "onUpdate:modelValue": ($event) => isRef(bulkAction) ? bulkAction.value = $event : null,
                    options: [
                      { value: "", label: "\u041C\u0430\u0441\u0441\u043E\u0432\u044B\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044F\u2026" },
                      { value: "accept", label: "\u041F\u0440\u0438\u043D\u044F\u0442\u044C" },
                      { value: "cancel", label: "\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C" },
                      { value: "to_production", label: "\u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E" },
                      { value: "ship", label: "\u041F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminButton, {
                    disabled: !unref(selectedIds).length || !unref(bulkAction),
                    onClick: runBulk
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C ")
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(loading)) {
        _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0437\u0430\u043A\u0430\u0437\u043E\u0432\u2026</span></div></div>`);
      } else {
        _push(`<div class="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"><tr><th class="text-left px-4 py-3 w-[48px]"><input type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"${ssrIncludeBooleanAttr(unref(orders).length && unref(selectedIds).length === unref(orders).length) ? " checked" : ""}></th><th class="text-left px-4 py-3 font-semibold">\u2116 / \u0434\u0430\u0442\u0430</th><th class="text-left px-4 py-3 font-semibold">\u041C\u0430\u0433\u0430\u0437\u0438\u043D / \u043A\u043B\u0438\u0435\u043D\u0442</th><th class="text-left px-4 py-3 font-semibold">\u0421\u0443\u043C\u043C\u0430</th><th class="text-left px-4 py-3 font-semibold">\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-4 py-3 font-semibold">\u0421\u043A\u043B\u0430\u0434</th><th class="text-left px-4 py-3 font-semibold">\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</th><th class="text-left px-4 py-3 font-semibold">\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0430</th><th class="text-left px-4 py-3 font-semibold">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(paginatedOrders), (o) => {
          _push(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"><td class="px-4 py-3.5 align-top"><input${ssrIncludeBooleanAttr(Array.isArray(unref(selected)[o.id]) ? ssrLooseContain(unref(selected)[o.id], null) : unref(selected)[o.id]) ? " checked" : ""} type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"></td><td class="px-4 py-3.5 align-top"><div class="font-bold text-slate-900">#${ssrInterpolate(o.id)}</div><div class="text-xs text-gray-500">${ssrInterpolate(humanDate(o.createdAt))}</div></td><td class="px-4 py-3 align-top"><div class="text-xs text-gray-500">${ssrInterpolate(o.store || "\u2014")}`);
          if (o.shopCity) {
            _push(`<span class="ml-1 text-gray-400">(${ssrInterpolate(o.shopCity)})</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="font-medium">${ssrInterpolate(o.customerName)}</div><div class="text-xs text-gray-500">${ssrInterpolate(o.phone || "\u2014")} \xB7 ${ssrInterpolate(o.email)}</div></td><td class="px-4 py-3 align-top">${ssrInterpolate(o.totalPrice)} \u20BD</td><td class="px-4 py-3 align-top"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(statusLabel[o.status] || o.status)}</span></td><td class="px-4 py-3 align-top"><span class="${ssrRenderClass([o.warehouseStatus === "deficit" ? "bg-red-50 text-red-700 border-red-200" : o.warehouseStatus === "partial" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(whLabel[o.warehouseStatus] || o.warehouseStatus)}</span></td><td class="px-4 py-3 align-top"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(prodLabel[o.productionStatus] || o.productionStatus)}</span></td><td class="px-4 py-3 align-top"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(shipLabel[o.shipmentStatus] || o.shipmentStatus)}</span></td><td class="px-4 py-3 align-top"><div class="flex flex-wrap gap-2"><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u041E\u0442\u043A\u0440\u044B\u0442\u044C </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u041F\u0440\u0438\u043D\u044F\u0442\u044C </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"> \u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E </button></div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(orders).length === 0) {
          _push(`<tr><td colspan="9" class="px-4 py-10 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div>`);
        if (unref(totalPages) > 1) {
          _push(ssrRenderComponent(_component_AdminPagination, {
            page: unref(page),
            "onUpdate:page": ($event) => isRef(page) ? page.value = $event : null,
            "total-pages": unref(totalPages),
            "total-items": unref(totalItems),
            "per-page": unref(perPage)
          }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
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
          _push(`<!--[--><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><div class="text-xs text-gray-500">\u041A\u043B\u0438\u0435\u043D\u0442</div><div class="font-semibold">${ssrInterpolate(unref(detail).order.customerName)}</div><div class="text-sm text-gray-600">${ssrInterpolate(unref(detail).order.phone || "\u2014")} \xB7 ${ssrInterpolate(unref(detail).order.email)}</div></div><div><div class="text-xs text-gray-500">\u0410\u0434\u0440\u0435\u0441</div><div class="text-sm text-gray-800">${ssrInterpolate(unref(detail).order.address)}</div></div><div><div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441</div><div class="text-sm font-semibold">${ssrInterpolate(statusLabel[unref(detail).order.status] || unref(detail).order.status)}</div><div class="text-xs text-gray-500">${ssrInterpolate(humanDate(unref(detail).order.createdAt))}</div></div><div><div class="text-xs text-gray-500">\u0421\u0443\u043C\u043C\u0430</div><div class="text-sm font-semibold">${ssrInterpolate(unref(detail).order.totalPrice)} \u20BD</div></div></div><div class="flex flex-wrap gap-2 mt-4"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0417\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0421\u043D\u044F\u0442\u044C \u0440\u0435\u0437\u0435\u0440\u0432</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</button><button class="${ssrRenderClass([unref(canReadyToShip) ? "border-gray-200 hover:bg-gray-100" : "border-gray-200/60 text-gray-400 cursor-not-allowed bg-gray-50", "px-3 py-2 rounded-xl border text-sm"])}"${ssrIncludeBooleanAttr(!unref(canReadyToShip)) ? " disabled" : ""}> \u0413\u043E\u0442\u043E\u0432 \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435 </button><button class="${ssrRenderClass([unref(canReadyToShip) ? "border-gray-200 hover:bg-gray-100" : "border-gray-200/60 text-gray-400 cursor-not-allowed bg-gray-50", "px-3 py-2 rounded-xl border text-sm"])}"${ssrIncludeBooleanAttr(!unref(canReadyToShip)) ? " disabled" : ""}> \u041E\u0442\u0433\u0440\u0443\u0437\u0438\u0442\u044C </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C</button><button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-sm">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between"><div class="text-sm font-semibold">\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0430\u0446\u0438\u044F</div>`);
          if (unref(allocationsLoading)) {
            _push(`<div class="text-xs text-gray-500">\u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435\u2026</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="p-4 space-y-3"><!--[-->`);
          ssrRenderList(unref(detail).lines, (l) => {
            var _a2, _b2, _c, _d, _e, _f;
            _push(`<div class="rounded-xl border border-gray-200 p-3"><div class="flex items-start justify-between gap-3"><div><div class="font-medium">${ssrInterpolate(l.name)}</div><div class="text-xs text-gray-500 mt-1">\u041D\u0443\u0436\u043D\u043E: ${ssrInterpolate(l.quantity)}</div></div><div class="text-right"><div class="text-xs text-gray-500">FINISHED</div><div class="font-semibold tabular-nums">${ssrInterpolate(((_a2 = unref(allocationByProductId)[l.productId]) == null ? void 0 : _a2.finished) || 0)} / ${ssrInterpolate(l.quantity)}</div><div class="text-xs text-gray-500 mt-2">BLANKS</div><div class="font-semibold tabular-nums">${ssrInterpolate(((_b2 = unref(allocationByProductId)[l.productId]) == null ? void 0 : _b2.blanks) || 0)} / ${ssrInterpolate(Math.max(0, l.quantity - (((_c = unref(allocationByProductId)[l.productId]) == null ? void 0 : _c.finished) || 0)))}</div></div></div><div class="mt-2 text-xs">`);
            if ((((_d = unref(allocationByProductId)[l.productId]) == null ? void 0 : _d.finished) || 0) >= l.quantity) {
              _push(`<span class="text-green-700">\u2705 \u0413\u043E\u0442\u043E\u0432\u043E</span>`);
            } else if ((((_e = unref(allocationByProductId)[l.productId]) == null ? void 0 : _e.finished) || 0) + (((_f = unref(allocationByProductId)[l.productId]) == null ? void 0 : _f.blanks) || 0) >= l.quantity) {
              _push(`<span class="text-amber-700">\u26A0\uFE0F \u041D\u0443\u0436\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</span>`);
            } else {
              _push(`<span class="text-red-700">\u274C \u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432</span>`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]-->`);
          if (((_b = (_a = unref(detail)) == null ? void 0 : _a.order) == null ? void 0 : _b.allocationIssues) && unref(detail).order.allocationIssues.length) {
            _push(`<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"><div class="font-semibold mb-1">\u041F\u0440\u0438\u0447\u0438\u043D\u044B:</div><ul class="list-disc pl-5 space-y-1"><!--[-->`);
            ssrRenderList(unref(detail).order.allocationIssues, (i, idx) => {
              _push(`<li>${ssrInterpolate(i.message || i.code)}</li>`);
            });
            _push(`<!--]--></ul></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 border-b border-gray-200 bg-gray-50"><div class="text-sm font-semibold">\u0421\u043E\u0441\u0442\u0430\u0432 \u0437\u0430\u043A\u0430\u0437\u0430</div></div><div class="p-4 overflow-x-auto"><table class="w-full text-sm"><thead class="text-xs text-gray-500"><tr><th class="text-left py-2">\u041F\u043E\u0437\u0438\u0446\u0438\u044F</th><th class="text-left py-2">\u041A\u043E\u043B-\u0432\u043E</th><th class="text-left py-2">\u0426\u0435\u043D\u0430</th></tr></thead><tbody><!--[-->`);
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
          if ((unref(detail).workOrders || []).length) {
            _push(`<div class="space-y-2"><div class="text-xs text-gray-500">Work Orders</div><!--[-->`);
            ssrRenderList(unref(detail).workOrders || [], (wo) => {
              var _a2;
              _push(`<div class="rounded-xl border border-gray-200 p-3"><div class="flex items-start justify-between gap-2"><div><div class="font-medium">#${ssrInterpolate(wo.id)} \xB7 ${ssrInterpolate(((_a2 = wo.product) == null ? void 0 : _a2.name) || "\u0422\u043E\u0432\u0430\u0440 #" + wo.productId)}</div><div class="text-xs text-gray-500 mt-1">\u0413\u043E\u0442\u043E\u0432\u043E: ${ssrInterpolate(wo.qtyDone)} / ${ssrInterpolate(wo.qtyPlanned)}`);
              if (Number(wo.qtyDefect || 0) > 0) {
                _push(`<span> \xB7 \u0431\u0440\u0430\u043A ${ssrInterpolate(wo.qtyDefect)}</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div></div><span class="px-2 py-1 rounded-lg border border-gray-200 text-xs">${ssrInterpolate(wo.status)}</span></div></div>`);
            });
            _push(`<!--]-->`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: { path: "/admin/production", query: { orderId: String(unref(detail).order.id) } },
              class: "inline-flex items-center text-sm text-gray-900 underline"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E`);
                } else {
                  return [
                    createTextVNode("\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E")
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((unref(detail).productionTasks || []).length === 0) {
            _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0434\u0430\u043D\u0438\u0439 \u043D\u0435\u0442</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(detail).productionTasks || [], (t) => {
            var _a2, _b2, _c;
            _push(`<div class="rounded-xl border border-gray-200 p-3"><div class="flex items-start justify-between gap-2"><div><div class="font-medium"><span class="mr-2">\u0417\u0430\u0434\u0430\u043D\u0438\u0435</span><span class="inline-flex items-center gap-2">`);
            _push(ssrRenderComponent(_component_ProductLabel, {
              article: (_a2 = (unref(detail).lines || []).find((x) => x.productId === t.productId)) == null ? void 0 : _a2.article,
              name: (_b2 = (unref(detail).lines || []).find((x) => x.productId === t.productId)) == null ? void 0 : _b2.name,
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/orders.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=orders-B7dN-bAa.mjs.map
