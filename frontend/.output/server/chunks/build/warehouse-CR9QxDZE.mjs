import { _ as _sfc_main$1, a as _sfc_main$2 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$3 } from './AdminSelect-4bn3Tbjh.mjs';
import { _ as _sfc_main$4 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$5 } from './AdminStatusBadge-BRoIy5Uv.mjs';
import { _ as _sfc_main$6 } from './AdminInput-CTfEX194.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, withCtx, isRef, createTextVNode, createVNode, withDirectives, vModelCheckbox, createBlock, createCommentVNode, openBlock, Fragment, renderList, toDisplayString, vModelText, useSSRContext } from 'vue';
import { u as useRuntimeConfig, b as useRoute, n as navigateTo } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrInterpolate, ssrRenderAttr, ssrRenderList } from 'vue/server-renderer';
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
  __name: "warehouse",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const route = useRoute();
    const tab = ref(route.query.tab || "items");
    const warehouse = ref(String(route.query.warehouse || "BLANKS").toUpperCase());
    const deficitOnly = ref(false);
    const withReservedOnly = ref(false);
    const loading = ref(false);
    const error = ref(null);
    const items = ref([]);
    const mWarehouse = ref(String(route.query.warehouse || "BLANKS").toUpperCase());
    const dateFrom = ref("");
    const dateTo = ref("");
    const productId = ref("");
    const orderId = ref("");
    const workOrderId = ref("");
    const movementsLoading = ref(false);
    const movementsError = ref(null);
    const movements = ref([]);
    const invWarehouse = ref(String(route.query.warehouse || "BLANKS").toUpperCase());
    const invSessionId = ref(String(route.query.inventoryId || ""));
    const inv = ref(null);
    const invLines = ref([]);
    const invWarnings = ref([]);
    const invLoading = ref(false);
    const invError = ref(null);
    const invSaveLoading = ref(false);
    const invApplyLoading = ref(false);
    const invToast = ref(null);
    function whLabel(code) {
      const c = String(code || "").toUpperCase();
      if (c === "BLANKS") return "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438";
      if (c === "FINISHED") return "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F";
      if (c === "DEFECT") return "\u0411\u0440\u0430\u043A";
      return c;
    }
    async function loadItems() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/warehouse/items", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: { warehouse: warehouse.value }
        });
        items.value = Array.isArray(res == null ? void 0 : res.items) ? res.items : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u043A\u043B\u0430\u0434";
      } finally {
        loading.value = false;
      }
    }
    function typeLabel(t) {
      const tt = String(t || "").toLowerCase();
      if (tt === "in") return "\u041F\u0440\u0438\u0445\u043E\u0434";
      if (tt === "out") return "\u0420\u0430\u0441\u0445\u043E\u0434";
      if (tt === "reserve") return "\u0420\u0435\u0437\u0435\u0440\u0432";
      if (tt === "unreserve") return "\u0421\u043D\u044F\u0442\u0438\u0435 \u0440\u0435\u0437\u0435\u0440\u0432\u0430";
      if (tt === "adjust") return "\u041A\u043E\u0440\u0440\u0435\u043A\u0442\u0438\u0440\u043E\u0432\u043A\u0430";
      if (tt === "inventory_adjust") return "\u0418\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F";
      return t;
    }
    function typeBadgeClass(t) {
      const tt = String(t || "").toLowerCase();
      if (tt === "in") return "bg-green-50 border-green-200 text-green-800";
      if (tt === "out") return "bg-red-50 border-red-200 text-red-800";
      if (tt === "reserve") return "bg-blue-50 border-blue-200 text-blue-800";
      if (tt === "unreserve") return "bg-gray-50 border-gray-200 text-gray-800";
      if (tt === "adjust") return "bg-yellow-50 border-yellow-200 text-yellow-800";
      if (tt === "inventory_adjust") return "bg-purple-50 border-purple-200 text-purple-800";
      return "bg-gray-50 border-gray-200 text-gray-800";
    }
    async function loadInventory(id) {
      var _a;
      if (!auth.accessToken) return;
      if (!id) return;
      invLoading.value = true;
      invError.value = null;
      invToast.value = null;
      try {
        const res = await $fetch(`/api/admin/inventory/${id}`, {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        inv.value = (res == null ? void 0 : res.session) || null;
        invLines.value = Array.isArray(res == null ? void 0 : res.lines) ? res.lines : [];
        invWarnings.value = Array.isArray(res == null ? void 0 : res.warnings) ? res.warnings : [];
      } catch (e) {
        invError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044E";
      } finally {
        invLoading.value = false;
      }
    }
    async function createInventory() {
      var _a, _b;
      if (!auth.accessToken) return;
      invLoading.value = true;
      invError.value = null;
      invToast.value = null;
      try {
        const res = await $fetch("/api/admin/inventory", {
          baseURL: apiBaseUrl,
          method: "POST",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { warehouse: invWarehouse.value }
        });
        const sid = String(((_a = res == null ? void 0 : res.session) == null ? void 0 : _a.id) || "");
        if (!sid) throw new Error("no session id");
        invSessionId.value = sid;
        inv.value = (res == null ? void 0 : res.session) || null;
        invLines.value = Array.isArray(res == null ? void 0 : res.lines) ? res.lines : [];
        invWarnings.value = Array.isArray(res == null ? void 0 : res.warnings) ? res.warnings : [];
        navigateTo({ path: "/admin/warehouse", query: { ...route.query, tab: "inventory", warehouse: invWarehouse.value, inventoryId: sid } });
      } catch (e) {
        invError.value = ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044E";
      } finally {
        invLoading.value = false;
      }
    }
    async function saveInventoryFacts() {
      var _a;
      if (!auth.accessToken) return;
      if (!invSessionId.value) return;
      invSaveLoading.value = true;
      invError.value = null;
      invToast.value = null;
      try {
        const payloadLines = invLines.value.map((l) => ({
          productId: l.productId,
          factQty: l.factQty === "" || l.factQty == null ? null : Number(l.factQty)
        }));
        const res = await $fetch(`/api/admin/inventory/${invSessionId.value}/lines`, {
          baseURL: apiBaseUrl,
          method: "PUT",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { lines: payloadLines }
        });
        inv.value = (res == null ? void 0 : res.session) || null;
        invLines.value = Array.isArray(res == null ? void 0 : res.lines) ? res.lines : [];
        invWarnings.value = Array.isArray(res == null ? void 0 : res.warnings) ? res.warnings : [];
        invToast.value = "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E";
      } catch (e) {
        invError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0444\u0430\u043A\u0442";
      } finally {
        invSaveLoading.value = false;
      }
    }
    async function applyInventory() {
      var _a, _b;
      if (!auth.accessToken) return;
      if (!invSessionId.value) return;
      invApplyLoading.value = true;
      invError.value = null;
      invToast.value = null;
      try {
        const res = await $fetch(`/api/admin/inventory/${invSessionId.value}/apply`, {
          baseURL: apiBaseUrl,
          method: "POST",
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        invToast.value = ((_a = res == null ? void 0 : res.warnings) == null ? void 0 : _a.length) ? `\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E (\u0435\u0441\u0442\u044C \u043F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F: ${res.warnings.length})` : "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E";
        await loadInventory(invSessionId.value);
        await loadItems();
      } catch (e) {
        invError.value = ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044E";
      } finally {
        invApplyLoading.value = false;
      }
    }
    async function loadMovements() {
      var _a;
      if (!auth.accessToken) return;
      movementsLoading.value = true;
      movementsError.value = null;
      try {
        const res = await $fetch("/api/admin/warehouse/movements", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: {
            warehouse: mWarehouse.value,
            ...productId.value ? { productId: productId.value } : {},
            ...orderId.value ? { orderId: orderId.value } : {},
            ...workOrderId.value ? { workOrderId: workOrderId.value } : {},
            ...dateFrom.value ? { dateFrom: dateFrom.value } : {},
            ...dateTo.value ? { dateTo: dateTo.value } : {}
          }
        });
        movements.value = Array.isArray(res == null ? void 0 : res.movements) ? res.movements : [];
      } catch (e) {
        movementsError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F";
      } finally {
        movementsLoading.value = false;
      }
    }
    const displayedItems = computed(() => {
      const arr = items.value;
      return arr.filter((it) => {
        const free = Number((it == null ? void 0 : it.free) || 0);
        const reserved = Number((it == null ? void 0 : it.reserved) || 0);
        if (deficitOnly.value) {
          if (warehouse.value === "BLANKS") {
            if (!(it == null ? void 0 : it.purchaseNeeded) && free > 0) return false;
          } else {
            if (free > 0) return false;
          }
        }
        if (withReservedOnly.value && reserved <= 0) return false;
        return true;
      });
    });
    watch([warehouse, tab], async () => {
      if (tab.value === "items") await loadItems();
    });
    watch([mWarehouse, tab], async () => {
      if (tab.value === "movements") await loadMovements();
    });
    function onWarehouseChanged() {
      mWarehouse.value = warehouse.value;
      invWarehouse.value = warehouse.value;
      navigateTo({ path: "/admin/warehouse", query: { ...route.query, tab: tab.value, warehouse: warehouse.value } });
    }
    function onMovementsWarehouseChanged() {
      warehouse.value = mWarehouse.value;
      invWarehouse.value = mWarehouse.value;
      navigateTo({ path: "/admin/warehouse", query: { ...route.query, tab: tab.value, warehouse: mWarehouse.value } });
    }
    function onInvWarehouseChanged() {
      warehouse.value = invWarehouse.value;
      mWarehouse.value = invWarehouse.value;
      navigateTo({ path: "/admin/warehouse", query: { ...route.query, tab: tab.value, warehouse: invWarehouse.value } });
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminCard = _sfc_main$2;
      const _component_AdminSelect = _sfc_main$3;
      const _component_AdminButton = _sfc_main$4;
      const _component_AdminStatusBadge = _sfc_main$5;
      const _component_AdminInput = _sfc_main$6;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u0421\u043A\u043B\u0430\u0434",
        description: "\u041E\u0441\u0442\u0430\u0442\u043A\u0438, \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u0438 \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F",
        icon: "\u{1F4E6}"
      }, null, _parent));
      _push(`<div class="flex items-center gap-1 p-1 rounded-xl bg-slate-100 w-fit"><button class="${ssrRenderClass([unref(tab) === "items" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900", "px-4 py-2 rounded-lg text-sm font-medium transition-all"])}"> \u0422\u043E\u0432\u0430\u0440\u044B </button><button class="${ssrRenderClass([unref(tab) === "movements" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900", "px-4 py-2 rounded-lg text-sm font-medium transition-all"])}"> \u0414\u0432\u0438\u0436\u0435\u043D\u0438\u044F </button><button class="${ssrRenderClass([unref(tab) === "inventory" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900", "px-4 py-2 rounded-lg text-sm font-medium transition-all"])}"> \u0418\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044F </button></div>`);
      if (unref(tab) === "items") {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex flex-wrap items-end gap-4"${_scopeId}><div class="flex-1 min-w-[200px]"${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>\u0421\u043A\u043B\u0430\u0434</label>`);
              _push2(ssrRenderComponent(_component_AdminSelect, {
                modelValue: unref(warehouse),
                "onUpdate:modelValue": ($event) => isRef(warehouse) ? warehouse.value = $event : null,
                onChange: onWarehouseChanged,
                options: [
                  { value: "BLANKS", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438" },
                  { value: "FINISHED", label: "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F" },
                  { value: "DEFECT", label: "\u0411\u0440\u0430\u043A" }
                ]
              }, null, _parent2, _scopeId));
              _push2(`</div><label class="flex items-center gap-2 text-sm select-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(deficitOnly)) ? ssrLooseContain(unref(deficitOnly), null) : unref(deficitOnly)) ? " checked" : ""} type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"${_scopeId}><span class="text-slate-700"${_scopeId}>\u0414\u0435\u0444\u0438\u0446\u0438\u0442</span></label><label class="flex items-center gap-2 text-sm select-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"${_scopeId}><input${ssrIncludeBooleanAttr(Array.isArray(unref(withReservedOnly)) ? ssrLooseContain(unref(withReservedOnly), null) : unref(withReservedOnly)) ? " checked" : ""} type="checkbox" class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"${_scopeId}><span class="text-slate-700"${_scopeId}>\u0421 \u0440\u0435\u0437\u0435\u0440\u0432\u043E\u043C</span></label>`);
              _push2(ssrRenderComponent(_component_AdminButton, {
                onClick: loadItems,
                loading: unref(loading),
                class: "ml-auto"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C `);
                  } else {
                    return [
                      createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex flex-wrap items-end gap-4" }, [
                  createVNode("div", { class: "flex-1 min-w-[200px]" }, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "\u0421\u043A\u043B\u0430\u0434"),
                    createVNode(_component_AdminSelect, {
                      modelValue: unref(warehouse),
                      "onUpdate:modelValue": ($event) => isRef(warehouse) ? warehouse.value = $event : null,
                      onChange: onWarehouseChanged,
                      options: [
                        { value: "BLANKS", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438" },
                        { value: "FINISHED", label: "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F" },
                        { value: "DEFECT", label: "\u0411\u0440\u0430\u043A" }
                      ]
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("label", { class: "flex items-center gap-2 text-sm select-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" }, [
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => isRef(deficitOnly) ? deficitOnly.value = $event : null,
                      type: "checkbox",
                      class: "rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelCheckbox, unref(deficitOnly)]
                    ]),
                    createVNode("span", { class: "text-slate-700" }, "\u0414\u0435\u0444\u0438\u0446\u0438\u0442")
                  ]),
                  createVNode("label", { class: "flex items-center gap-2 text-sm select-none px-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" }, [
                    withDirectives(createVNode("input", {
                      "onUpdate:modelValue": ($event) => isRef(withReservedOnly) ? withReservedOnly.value = $event : null,
                      type: "checkbox",
                      class: "rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vModelCheckbox, unref(withReservedOnly)]
                    ]),
                    createVNode("span", { class: "text-slate-700" }, "\u0421 \u0440\u0435\u0437\u0435\u0440\u0432\u043E\u043C")
                  ]),
                  createVNode(_component_AdminButton, {
                    onClick: loadItems,
                    loading: unref(loading),
                    class: "ml-auto"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ])
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
        _push(ssrRenderComponent(_component_AdminCard, { padding: false }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="overflow-x-auto"${_scopeId}><table class="w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0422\u043E\u0432\u0430\u0440</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>SKU</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0422\u0438\u043F</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u041A\u043E\u043B-\u0432\u043E</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0420\u0435\u0437\u0435\u0440\u0432</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E</th>`);
              if (unref(warehouse) === "BLANKS") {
                _push2(`<th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0417\u0430\u043A\u0443\u043F\u043A\u0430</th>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</tr></thead><tbody${_scopeId}>`);
              if (unref(loading)) {
                _push2(`<tr${_scopeId}><td class="px-5 py-12 text-center text-slate-500"${ssrRenderAttr("colspan", unref(warehouse) === "BLANKS" ? 7 : 6)}${_scopeId}><div class="flex items-center justify-center gap-3"${_scopeId}><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg><span${_scopeId}>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></td></tr>`);
              } else if (unref(displayedItems).length === 0) {
                _push2(`<tr${_scopeId}><td class="px-5 py-12 text-center text-slate-500"${ssrRenderAttr("colspan", unref(warehouse) === "BLANKS" ? 7 : 6)}${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F4E6}</div><div${_scopeId}>\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</div></td></tr>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(unref(displayedItems), (it) => {
                _push2(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-5 py-4"${_scopeId}><div class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(it.product.name)}</div><div class="text-xs text-slate-500"${_scopeId}>ID: ${ssrInterpolate(it.product.id)} \xB7 ${ssrInterpolate(whLabel(unref(warehouse)))}</div></td><td class="px-5 py-4 text-slate-600"${_scopeId}>${ssrInterpolate(it.product.sku)}</td><td class="px-5 py-4 text-slate-600"${_scopeId}>${ssrInterpolate(it.product.kind)}</td><td class="px-5 py-4 text-right font-medium text-slate-900"${_scopeId}>${ssrInterpolate(it.qty)}</td><td class="px-5 py-4 text-right text-amber-600 font-medium"${_scopeId}>${ssrInterpolate(it.reserved)}</td><td class="px-5 py-4 text-right font-bold text-slate-900"${_scopeId}>${ssrInterpolate(it.free)}</td>`);
                if (unref(warehouse) === "BLANKS") {
                  _push2(`<td class="px-5 py-4"${_scopeId}>`);
                  _push2(ssrRenderComponent(_component_AdminStatusBadge, {
                    status: it.purchaseNeeded ? "deficit" : "ok",
                    map: {
                      deficit: { label: "\u041D\u0443\u0436\u043D\u043E", color: "amber" },
                      ok: { label: "\u041E\u043A", color: "green" }
                    }
                  }, null, _parent2, _scopeId));
                  _push2(`</td>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</tr>`);
              });
              _push2(`<!--]--></tbody></table></div>`);
            } else {
              return [
                createVNode("div", { class: "overflow-x-auto" }, [
                  createVNode("table", { class: "w-full text-sm" }, [
                    createVNode("thead", { class: "bg-slate-50 text-xs text-slate-600 uppercase tracking-wide" }, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0422\u043E\u0432\u0430\u0440"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "SKU"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0422\u0438\u043F"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u041A\u043E\u043B-\u0432\u043E"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0420\u0435\u0437\u0435\u0440\u0432"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E"),
                        unref(warehouse) === "BLANKS" ? (openBlock(), createBlock("th", {
                          key: 0,
                          class: "text-left px-5 py-3.5 font-semibold"
                        }, "\u0417\u0430\u043A\u0443\u043F\u043A\u0430")) : createCommentVNode("", true)
                      ])
                    ]),
                    createVNode("tbody", null, [
                      unref(loading) ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          class: "px-5 py-12 text-center text-slate-500",
                          colspan: unref(warehouse) === "BLANKS" ? 7 : 6
                        }, [
                          createVNode("div", { class: "flex items-center justify-center gap-3" }, [
                            (openBlock(), createBlock("svg", {
                              class: "animate-spin w-5 h-5",
                              fill: "none",
                              viewBox: "0 0 24 24"
                            }, [
                              createVNode("circle", {
                                class: "opacity-25",
                                cx: "12",
                                cy: "12",
                                r: "10",
                                stroke: "currentColor",
                                "stroke-width": "4"
                              }),
                              createVNode("path", {
                                class: "opacity-75",
                                fill: "currentColor",
                                d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                              })
                            ])),
                            createVNode("span", null, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026")
                          ])
                        ], 8, ["colspan"])
                      ])) : unref(displayedItems).length === 0 ? (openBlock(), createBlock("tr", { key: 1 }, [
                        createVNode("td", {
                          class: "px-5 py-12 text-center text-slate-500",
                          colspan: unref(warehouse) === "BLANKS" ? 7 : 6
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F4E6}"),
                          createVNode("div", null, "\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B")
                        ], 8, ["colspan"])
                      ])) : createCommentVNode("", true),
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(displayedItems), (it) => {
                        return openBlock(), createBlock("tr", {
                          key: it.product.id,
                          class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                        }, [
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-semibold text-slate-900" }, toDisplayString(it.product.name), 1),
                            createVNode("div", { class: "text-xs text-slate-500" }, "ID: " + toDisplayString(it.product.id) + " \xB7 " + toDisplayString(whLabel(unref(warehouse))), 1)
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-slate-600" }, toDisplayString(it.product.sku), 1),
                          createVNode("td", { class: "px-5 py-4 text-slate-600" }, toDisplayString(it.product.kind), 1),
                          createVNode("td", { class: "px-5 py-4 text-right font-medium text-slate-900" }, toDisplayString(it.qty), 1),
                          createVNode("td", { class: "px-5 py-4 text-right text-amber-600 font-medium" }, toDisplayString(it.reserved), 1),
                          createVNode("td", { class: "px-5 py-4 text-right font-bold text-slate-900" }, toDisplayString(it.free), 1),
                          unref(warehouse) === "BLANKS" ? (openBlock(), createBlock("td", {
                            key: 0,
                            class: "px-5 py-4"
                          }, [
                            createVNode(_component_AdminStatusBadge, {
                              status: it.purchaseNeeded ? "deficit" : "ok",
                              map: {
                                deficit: { label: "\u041D\u0443\u0436\u043D\u043E", color: "amber" },
                                ok: { label: "\u041E\u043A", color: "green" }
                              }
                            }, null, 8, ["status"])
                          ])) : createCommentVNode("", true)
                        ]);
                      }), 128))
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else if (unref(tab) === "movements") {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex flex-wrap items-end gap-4"${_scopeId}><div${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>\u0421\u043A\u043B\u0430\u0434</label>`);
              _push2(ssrRenderComponent(_component_AdminSelect, {
                modelValue: unref(mWarehouse),
                "onUpdate:modelValue": ($event) => isRef(mWarehouse) ? mWarehouse.value = $event : null,
                onChange: onMovementsWarehouseChanged,
                options: [
                  { value: "BLANKS", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438" },
                  { value: "FINISHED", label: "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F" },
                  { value: "DEFECT", label: "\u0411\u0440\u0430\u043A" }
                ]
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>\u0414\u0430\u0442\u0430 \u0441</label>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: unref(dateFrom),
                "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                type: "date"
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>\u0414\u0430\u0442\u0430 \u043F\u043E</label>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: unref(dateTo),
                "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                type: "date"
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>Product ID</label>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: unref(productId),
                "onUpdate:modelValue": ($event) => isRef(productId) ? productId.value = $event : null,
                placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 12"
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>\u0417\u0430\u043A\u0430\u0437</label>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: unref(orderId),
                "onUpdate:modelValue": ($event) => isRef(orderId) ? orderId.value = $event : null,
                placeholder: "#"
              }, null, _parent2, _scopeId));
              _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>WO</label>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: unref(workOrderId),
                "onUpdate:modelValue": ($event) => isRef(workOrderId) ? workOrderId.value = $event : null,
                placeholder: "#"
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
              _push2(ssrRenderComponent(_component_AdminButton, {
                onClick: loadMovements,
                loading: unref(movementsLoading),
                class: "ml-auto"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C `);
                  } else {
                    return [
                      createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex flex-wrap items-end gap-4" }, [
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "\u0421\u043A\u043B\u0430\u0434"),
                    createVNode(_component_AdminSelect, {
                      modelValue: unref(mWarehouse),
                      "onUpdate:modelValue": ($event) => isRef(mWarehouse) ? mWarehouse.value = $event : null,
                      onChange: onMovementsWarehouseChanged,
                      options: [
                        { value: "BLANKS", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438" },
                        { value: "FINISHED", label: "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F" },
                        { value: "DEFECT", label: "\u0411\u0440\u0430\u043A" }
                      ]
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "\u0414\u0430\u0442\u0430 \u0441"),
                    createVNode(_component_AdminInput, {
                      modelValue: unref(dateFrom),
                      "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                      type: "date"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "\u0414\u0430\u0442\u0430 \u043F\u043E"),
                    createVNode(_component_AdminInput, {
                      modelValue: unref(dateTo),
                      "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                      type: "date"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "Product ID"),
                    createVNode(_component_AdminInput, {
                      modelValue: unref(productId),
                      "onUpdate:modelValue": ($event) => isRef(productId) ? productId.value = $event : null,
                      placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 12"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "\u0417\u0430\u043A\u0430\u0437"),
                    createVNode(_component_AdminInput, {
                      modelValue: unref(orderId),
                      "onUpdate:modelValue": ($event) => isRef(orderId) ? orderId.value = $event : null,
                      placeholder: "#"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "WO"),
                    createVNode(_component_AdminInput, {
                      modelValue: unref(workOrderId),
                      "onUpdate:modelValue": ($event) => isRef(workOrderId) ? workOrderId.value = $event : null,
                      placeholder: "#"
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode(_component_AdminButton, {
                    onClick: loadMovements,
                    loading: unref(movementsLoading),
                    class: "ml-auto"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
                    ]),
                    _: 1
                  }, 8, ["loading"])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(movementsError)) {
          _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(unref(movementsError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_AdminCard, { padding: false }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(movementsLoading)) {
                _push2(`<div class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="flex items-center justify-center gap-3"${_scopeId}><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg><span${_scopeId}>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></div>`);
              } else if (unref(movements).length === 0) {
                _push2(`<div class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F504}</div><div${_scopeId}>\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</div></div>`);
              } else {
                _push2(`<div class="divide-y divide-slate-100"${_scopeId}><!--[-->`);
                ssrRenderList(unref(movements), (m) => {
                  var _a2, _b2, _c, _d;
                  _push2(`<div class="px-5 py-4 hover:bg-slate-50/70 transition-colors"${_scopeId}><div class="flex items-start justify-between gap-3"${_scopeId}><div class="min-w-0"${_scopeId}><div class="flex items-center gap-2 flex-wrap"${_scopeId}><span class="${ssrRenderClass([typeBadgeClass(m.type), "inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium"])}"${_scopeId}>${ssrInterpolate(typeLabel(m.type))}</span><span class="font-bold text-slate-900"${_scopeId}>${ssrInterpolate(m.qty)}</span><span class="text-slate-400"${_scopeId}>\xB7</span><span class="font-medium text-slate-700 truncate"${_scopeId}>${ssrInterpolate(((_a2 = m.product) == null ? void 0 : _a2.name) || "product#" + m.productId)}</span>`);
                  if ((_b2 = m.product) == null ? void 0 : _b2.article) {
                    _push2(`<span class="text-xs text-slate-500"${_scopeId}>SKU: ${ssrInterpolate(m.product.article)}</span>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div><div class="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2"${_scopeId}><span${_scopeId}>${ssrInterpolate(new Date(m.createdAt).toLocaleString())}</span><span class="text-slate-300"${_scopeId}>\xB7</span><span${_scopeId}>${ssrInterpolate(whLabel(m.warehouse))}</span>`);
                  if (m.orderId) {
                    _push2(`<!--[--><span class="text-slate-300"${_scopeId}>\xB7</span>`);
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      class: "text-slate-700 hover:underline",
                      to: { path: "/admin/orders", query: { q: String(m.orderId) } }
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(` \u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate(m.orderId)}`);
                        } else {
                          return [
                            createTextVNode(" \u0417\u0430\u043A\u0430\u0437 #" + toDisplayString(m.orderId), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                    _push2(`<!--]-->`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (m.workOrderId) {
                    _push2(`<!--[--><span class="text-slate-300"${_scopeId}>\xB7</span>`);
                    _push2(ssrRenderComponent(_component_NuxtLink, {
                      class: "text-slate-700 hover:underline",
                      to: { path: "/admin/production", query: { q: String(m.workOrderId) } }
                    }, {
                      default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                        if (_push3) {
                          _push3(` WO #${ssrInterpolate(m.workOrderId)}`);
                        } else {
                          return [
                            createTextVNode(" WO #" + toDisplayString(m.workOrderId), 1)
                          ];
                        }
                      }),
                      _: 2
                    }, _parent2, _scopeId));
                    _push2(`<!--]-->`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (m.user) {
                    _push2(`<!--[--><span class="text-slate-300"${_scopeId}>\xB7</span><span${_scopeId}>by ${ssrInterpolate(((_c = m.user) == null ? void 0 : _c.name) || ((_d = m.user) == null ? void 0 : _d.email))}</span><!--]-->`);
                  } else {
                    _push2(`<!---->`);
                  }
                  if (m.note) {
                    _push2(`<!--[--><span class="text-slate-300"${_scopeId}>\xB7</span><span class="truncate"${_scopeId}>${ssrInterpolate(m.note)}</span><!--]-->`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div><div class="text-xs text-slate-400 whitespace-nowrap"${_scopeId}>#${ssrInterpolate(m.id)}</div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              }
            } else {
              return [
                unref(movementsLoading) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "px-5 py-12 text-center text-slate-500"
                }, [
                  createVNode("div", { class: "flex items-center justify-center gap-3" }, [
                    (openBlock(), createBlock("svg", {
                      class: "animate-spin w-5 h-5",
                      fill: "none",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("circle", {
                        class: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        "stroke-width": "4"
                      }),
                      createVNode("path", {
                        class: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      })
                    ])),
                    createVNode("span", null, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026")
                  ])
                ])) : unref(movements).length === 0 ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "px-5 py-12 text-center text-slate-500"
                }, [
                  createVNode("div", { class: "text-4xl mb-2" }, "\u{1F504}"),
                  createVNode("div", null, "\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B")
                ])) : (openBlock(), createBlock("div", {
                  key: 2,
                  class: "divide-y divide-slate-100"
                }, [
                  (openBlock(true), createBlock(Fragment, null, renderList(unref(movements), (m) => {
                    var _a2, _b2, _c, _d;
                    return openBlock(), createBlock("div", {
                      key: m.id,
                      class: "px-5 py-4 hover:bg-slate-50/70 transition-colors"
                    }, [
                      createVNode("div", { class: "flex items-start justify-between gap-3" }, [
                        createVNode("div", { class: "min-w-0" }, [
                          createVNode("div", { class: "flex items-center gap-2 flex-wrap" }, [
                            createVNode("span", {
                              class: ["inline-flex items-center px-2.5 py-1 rounded-lg border text-xs font-medium", typeBadgeClass(m.type)]
                            }, toDisplayString(typeLabel(m.type)), 3),
                            createVNode("span", { class: "font-bold text-slate-900" }, toDisplayString(m.qty), 1),
                            createVNode("span", { class: "text-slate-400" }, "\xB7"),
                            createVNode("span", { class: "font-medium text-slate-700 truncate" }, toDisplayString(((_a2 = m.product) == null ? void 0 : _a2.name) || "product#" + m.productId), 1),
                            ((_b2 = m.product) == null ? void 0 : _b2.article) ? (openBlock(), createBlock("span", {
                              key: 0,
                              class: "text-xs text-slate-500"
                            }, "SKU: " + toDisplayString(m.product.article), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("div", { class: "mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-2" }, [
                            createVNode("span", null, toDisplayString(new Date(m.createdAt).toLocaleString()), 1),
                            createVNode("span", { class: "text-slate-300" }, "\xB7"),
                            createVNode("span", null, toDisplayString(whLabel(m.warehouse)), 1),
                            m.orderId ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createVNode("span", { class: "text-slate-300" }, "\xB7"),
                              createVNode(_component_NuxtLink, {
                                class: "text-slate-700 hover:underline",
                                to: { path: "/admin/orders", query: { q: String(m.orderId) } }
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u0417\u0430\u043A\u0430\u0437 #" + toDisplayString(m.orderId), 1)
                                ]),
                                _: 2
                              }, 1032, ["to"])
                            ], 64)) : createCommentVNode("", true),
                            m.workOrderId ? (openBlock(), createBlock(Fragment, { key: 1 }, [
                              createVNode("span", { class: "text-slate-300" }, "\xB7"),
                              createVNode(_component_NuxtLink, {
                                class: "text-slate-700 hover:underline",
                                to: { path: "/admin/production", query: { q: String(m.workOrderId) } }
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" WO #" + toDisplayString(m.workOrderId), 1)
                                ]),
                                _: 2
                              }, 1032, ["to"])
                            ], 64)) : createCommentVNode("", true),
                            m.user ? (openBlock(), createBlock(Fragment, { key: 2 }, [
                              createVNode("span", { class: "text-slate-300" }, "\xB7"),
                              createVNode("span", null, "by " + toDisplayString(((_c = m.user) == null ? void 0 : _c.name) || ((_d = m.user) == null ? void 0 : _d.email)), 1)
                            ], 64)) : createCommentVNode("", true),
                            m.note ? (openBlock(), createBlock(Fragment, { key: 3 }, [
                              createVNode("span", { class: "text-slate-300" }, "\xB7"),
                              createVNode("span", { class: "truncate" }, toDisplayString(m.note), 1)
                            ], 64)) : createCommentVNode("", true)
                          ])
                        ]),
                        createVNode("div", { class: "text-xs text-slate-400 whitespace-nowrap" }, "#" + toDisplayString(m.id), 1)
                      ])
                    ]);
                  }), 128))
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      } else {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            if (_push2) {
              _push2(`<div class="flex flex-wrap items-end gap-4"${_scopeId}><div${_scopeId}><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide"${_scopeId}>\u0421\u043A\u043B\u0430\u0434</label>`);
              _push2(ssrRenderComponent(_component_AdminSelect, {
                modelValue: unref(invWarehouse),
                "onUpdate:modelValue": ($event) => isRef(invWarehouse) ? invWarehouse.value = $event : null,
                onChange: onInvWarehouseChanged,
                options: [
                  { value: "BLANKS", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438" },
                  { value: "FINISHED", label: "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F" },
                  { value: "DEFECT", label: "\u0411\u0440\u0430\u043A" }
                ]
              }, null, _parent2, _scopeId));
              _push2(`</div>`);
              _push2(ssrRenderComponent(_component_AdminButton, {
                variant: "primary",
                onClick: createInventory,
                loading: unref(invLoading)
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044E `);
                  } else {
                    return [
                      createTextVNode(" \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044E ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              if (unref(invSessionId)) {
                _push2(ssrRenderComponent(_component_AdminButton, {
                  onClick: ($event) => loadInventory(unref(invSessionId)),
                  loading: unref(invLoading)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C `);
                    } else {
                      return [
                        createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
              } else {
                _push2(`<!---->`);
              }
              if (unref(inv)) {
                _push2(`<div class="ml-auto flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-xl"${_scopeId}><span${_scopeId}>\u0421\u0435\u0441\u0441\u0438\u044F #${ssrInterpolate(unref(inv).id)}</span>`);
                _push2(ssrRenderComponent(_component_AdminStatusBadge, {
                  status: unref(inv).status,
                  map: { draft: { label: "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A", color: "amber" }, applied: { label: "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E", color: "green" } }
                }, null, _parent2, _scopeId));
                _push2(`<span${_scopeId}>${ssrInterpolate(whLabel((_a2 = unref(inv).warehouse) == null ? void 0 : _a2.code))}</span></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex flex-wrap items-end gap-4" }, [
                  createVNode("div", null, [
                    createVNode("label", { class: "block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide" }, "\u0421\u043A\u043B\u0430\u0434"),
                    createVNode(_component_AdminSelect, {
                      modelValue: unref(invWarehouse),
                      "onUpdate:modelValue": ($event) => isRef(invWarehouse) ? invWarehouse.value = $event : null,
                      onChange: onInvWarehouseChanged,
                      options: [
                        { value: "BLANKS", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438" },
                        { value: "FINISHED", label: "\u0413\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F" },
                        { value: "DEFECT", label: "\u0411\u0440\u0430\u043A" }
                      ]
                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                  ]),
                  createVNode(_component_AdminButton, {
                    variant: "primary",
                    onClick: createInventory,
                    loading: unref(invLoading)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u044E ")
                    ]),
                    _: 1
                  }, 8, ["loading"]),
                  unref(invSessionId) ? (openBlock(), createBlock(_component_AdminButton, {
                    key: 0,
                    onClick: ($event) => loadInventory(unref(invSessionId)),
                    loading: unref(invLoading)
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
                    ]),
                    _: 1
                  }, 8, ["onClick", "loading"])) : createCommentVNode("", true),
                  unref(inv) ? (openBlock(), createBlock("div", {
                    key: 1,
                    class: "ml-auto flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-2 rounded-xl"
                  }, [
                    createVNode("span", null, "\u0421\u0435\u0441\u0441\u0438\u044F #" + toDisplayString(unref(inv).id), 1),
                    createVNode(_component_AdminStatusBadge, {
                      status: unref(inv).status,
                      map: { draft: { label: "\u0427\u0435\u0440\u043D\u043E\u0432\u0438\u043A", color: "amber" }, applied: { label: "\u041F\u0440\u0438\u043C\u0435\u043D\u0435\u043D\u043E", color: "green" } }
                    }, null, 8, ["status"]),
                    createVNode("span", null, toDisplayString(whLabel((_b2 = unref(inv).warehouse) == null ? void 0 : _b2.code)), 1)
                  ])) : createCommentVNode("", true)
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(invToast)) {
          _push(`<div class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2"><span>\u2705</span> ${ssrInterpolate(unref(invToast))}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(invError)) {
          _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(unref(invError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(invWarnings).length) {
          _push(`<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-center gap-2"><span>\u26A0\uFE0F</span> \u0415\u0441\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438, \u0433\u0434\u0435 <b>\u0424\u0430\u043A\u0442 &lt; \u0420\u0435\u0437\u0435\u0440\u0432</b>: ${ssrInterpolate(unref(invWarnings).length)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_AdminCard, { padding: false }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(invLoading)) {
                _push2(`<div class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="flex items-center justify-center gap-3"${_scopeId}><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"${_scopeId}><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"${_scopeId}></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"${_scopeId}></path></svg><span${_scopeId}>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></div>`);
              } else if (!unref(invSessionId)) {
                _push2(`<div class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F4CA}</div><div${_scopeId}>\u0421\u043E\u0437\u0434\u0430\u0439 \u0441\u0435\u0441\u0441\u0438\u044E \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u2014 \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u0434\u0435\u043B\u0430\u0435\u0442 snapshot \u043E\u0441\u0442\u0430\u0442\u043A\u043E\u0432</div></div>`);
              } else {
                _push2(`<div${_scopeId}><table class="w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0422\u043E\u0432\u0430\u0440</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0421\u0438\u0441\u0442\u0435\u043C\u0430</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0420\u0435\u0437\u0435\u0440\u0432</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0424\u0430\u043A\u0442</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0394</th></tr></thead><tbody${_scopeId}>`);
                if (unref(invLines).length === 0) {
                  _push2(`<tr${_scopeId}><td class="px-5 py-12 text-center text-slate-500" colspan="5"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F4CA}</div><div${_scopeId}>\u041D\u0435\u0442 \u043F\u043E\u0437\u0438\u0446\u0438\u0439</div></td></tr>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<!--[-->`);
                ssrRenderList(unref(invLines), (l) => {
                  var _a2, _b2, _c;
                  _push2(`<tr class="${ssrRenderClass([l.warningFactLessThanReserved ? "bg-amber-50/50" : "", "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"])}"${_scopeId}><td class="px-5 py-4"${_scopeId}><div class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(((_a2 = l.product) == null ? void 0 : _a2.name) || "product#" + l.productId)}</div><div class="text-xs text-slate-500"${_scopeId}>ID: ${ssrInterpolate(l.productId)} \xB7 SKU: ${ssrInterpolate((_b2 = l.product) == null ? void 0 : _b2.sku)}</div></td><td class="px-5 py-4 text-right font-medium text-slate-700"${_scopeId}>${ssrInterpolate(l.systemQty)}</td><td class="px-5 py-4 text-right text-amber-600 font-medium"${_scopeId}>${ssrInterpolate(l.reserved)}</td><td class="px-5 py-4 text-right"${_scopeId}><input${ssrRenderAttr("value", l.factQty)} type="number" min="0" class="border border-slate-200 rounded-lg px-3 py-2 w-24 text-right shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"${ssrIncludeBooleanAttr(((_c = unref(inv)) == null ? void 0 : _c.status) !== "draft") ? " disabled" : ""}${_scopeId}></td><td class="${ssrRenderClass([Number(l.delta) < 0 ? "text-red-600" : "text-emerald-600", "px-5 py-4 text-right font-bold"])}"${_scopeId}>${ssrInterpolate(l.factQty == null ? "\u2014" : l.delta)}</td></tr>`);
                });
                _push2(`<!--]--></tbody></table></div>`);
              }
            } else {
              return [
                unref(invLoading) ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "px-5 py-12 text-center text-slate-500"
                }, [
                  createVNode("div", { class: "flex items-center justify-center gap-3" }, [
                    (openBlock(), createBlock("svg", {
                      class: "animate-spin w-5 h-5",
                      fill: "none",
                      viewBox: "0 0 24 24"
                    }, [
                      createVNode("circle", {
                        class: "opacity-25",
                        cx: "12",
                        cy: "12",
                        r: "10",
                        stroke: "currentColor",
                        "stroke-width": "4"
                      }),
                      createVNode("path", {
                        class: "opacity-75",
                        fill: "currentColor",
                        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      })
                    ])),
                    createVNode("span", null, "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026")
                  ])
                ])) : !unref(invSessionId) ? (openBlock(), createBlock("div", {
                  key: 1,
                  class: "px-5 py-12 text-center text-slate-500"
                }, [
                  createVNode("div", { class: "text-4xl mb-2" }, "\u{1F4CA}"),
                  createVNode("div", null, "\u0421\u043E\u0437\u0434\u0430\u0439 \u0441\u0435\u0441\u0441\u0438\u044E \u0438\u043D\u0432\u0435\u043D\u0442\u0430\u0440\u0438\u0437\u0430\u0446\u0438\u0438 \u2014 \u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0441\u0434\u0435\u043B\u0430\u0435\u0442 snapshot \u043E\u0441\u0442\u0430\u0442\u043A\u043E\u0432")
                ])) : (openBlock(), createBlock("div", { key: 2 }, [
                  createVNode("table", { class: "w-full text-sm" }, [
                    createVNode("thead", { class: "bg-slate-50 text-xs text-slate-600 uppercase tracking-wide" }, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0422\u043E\u0432\u0430\u0440"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0421\u0438\u0441\u0442\u0435\u043C\u0430"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0420\u0435\u0437\u0435\u0440\u0432"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0424\u0430\u043A\u0442"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0394")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      unref(invLines).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          class: "px-5 py-12 text-center text-slate-500",
                          colspan: "5"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F4CA}"),
                          createVNode("div", null, "\u041D\u0435\u0442 \u043F\u043E\u0437\u0438\u0446\u0438\u0439")
                        ])
                      ])) : createCommentVNode("", true),
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(invLines), (l) => {
                        var _a2, _b2, _c;
                        return openBlock(), createBlock("tr", {
                          key: l.id,
                          class: ["border-t border-slate-100 hover:bg-slate-50/70 transition-colors", l.warningFactLessThanReserved ? "bg-amber-50/50" : ""]
                        }, [
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-semibold text-slate-900" }, toDisplayString(((_a2 = l.product) == null ? void 0 : _a2.name) || "product#" + l.productId), 1),
                            createVNode("div", { class: "text-xs text-slate-500" }, "ID: " + toDisplayString(l.productId) + " \xB7 SKU: " + toDisplayString((_b2 = l.product) == null ? void 0 : _b2.sku), 1)
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-right font-medium text-slate-700" }, toDisplayString(l.systemQty), 1),
                          createVNode("td", { class: "px-5 py-4 text-right text-amber-600 font-medium" }, toDisplayString(l.reserved), 1),
                          createVNode("td", { class: "px-5 py-4 text-right" }, [
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => l.factQty = $event,
                              type: "number",
                              min: "0",
                              class: "border border-slate-200 rounded-lg px-3 py-2 w-24 text-right shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all",
                              disabled: ((_c = unref(inv)) == null ? void 0 : _c.status) !== "draft"
                            }, null, 8, ["onUpdate:modelValue", "disabled"]), [
                              [
                                vModelText,
                                l.factQty,
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("td", {
                            class: ["px-5 py-4 text-right font-bold", Number(l.delta) < 0 ? "text-red-600" : "text-emerald-600"]
                          }, toDisplayString(l.factQty == null ? "\u2014" : l.delta), 3)
                        ], 2);
                      }), 128))
                    ])
                  ])
                ]))
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(invSessionId)) {
          _push(`<div class="flex items-center gap-3">`);
          _push(ssrRenderComponent(_component_AdminButton, {
            onClick: saveInventoryFacts,
            loading: unref(invSaveLoading),
            disabled: ((_a = unref(inv)) == null ? void 0 : _a.status) !== "draft"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0444\u0430\u043A\u0442 `);
              } else {
                return [
                  createTextVNode(" \u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0444\u0430\u043A\u0442 ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(ssrRenderComponent(_component_AdminButton, {
            variant: "primary",
            onClick: applyInventory,
            loading: unref(invApplyLoading),
            disabled: ((_b = unref(inv)) == null ? void 0 : _b.status) !== "draft"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u2705 \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0440\u0430\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F `);
              } else {
                return [
                  createTextVNode(" \u2705 \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C \u0440\u0430\u0441\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`<div class="text-xs text-slate-500"> \u041C\u0430\u0441\u0442\u0435\u0440: \u0441\u043E\u0437\u0434\u0430\u0442\u044C \u2192 \u0441\u0432\u0435\u0440\u0438\u0442\u044C \u0444\u0430\u043A\u0442 \u2192 \u043F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C. \u0414\u0432\u0438\u0436\u0435\u043D\u0438\u044F \u043F\u0438\u0448\u0443\u0442\u0441\u044F \u043A\u0430\u043A <b>inventory_adjust</b>. </div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/warehouse.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=warehouse-CR9QxDZE.mjs.map
