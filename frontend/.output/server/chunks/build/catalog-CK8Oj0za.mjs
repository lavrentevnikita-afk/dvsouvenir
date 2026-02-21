import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminInput-CTfEX194.mjs';
import { _ as _sfc_main$5 } from './AdminSelect-4bn3Tbjh.mjs';
import { _ as _sfc_main$1$1, a as _sfc_main$6 } from './ProductAvailabilityBadge-Dp6_CtFm.mjs';
import { _ as _sfc_main$7 } from './ProductPriceBlock-DEFQ0tZW.mjs';
import { defineComponent, ref, computed, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, isRef, withKeys, withDirectives, vModelCheckbox, createBlock, createCommentVNode, openBlock, Fragment, renderList, toDisplayString, vModelSelect, withModifiers, vModelText, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrRenderList, ssrRenderAttr, ssrLooseEqual } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
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
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "catalog",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const tab = ref("products");
    const loading = ref(false);
    const error = ref(null);
    const { push: toast } = useToast();
    const categories = ref([]);
    const products = ref([]);
    const productImages = ref([]);
    const warehouses = ref([]);
    const cities = ref([]);
    const cityForm = ref({ code: "", regionCode: "", name: "" });
    const q = ref("");
    const categoryId = ref("");
    const issueFilter = ref("");
    const cityFilter = ref("");
    const kindFilter = ref("");
    const showArchived = ref(false);
    const catForm = ref(
      { slug: "", name: "", description: "", imageUrl: "", parentId: null, sortOrder: 0, isActive: true }
    );
    const roots = computed(() => categories.value.filter((c) => !c.parent));
    const categoryOptions = computed(() => {
      var _a;
      const byParent = {};
      for (const c of categories.value) {
        const pid = ((_a = c.parent) == null ? void 0 : _a.id) ? String(c.parent.id) : "root";
        byParent[pid] = byParent[pid] || [];
        byParent[pid].push(c);
      }
      const out = [];
      const rootsSorted = [...byParent["root"] || []].sort((a, b) => {
        var _a2, _b;
        return ((_a2 = a.sortOrder) != null ? _a2 : 0) - ((_b = b.sortOrder) != null ? _b : 0) || String(a.name).localeCompare(String(b.name));
      });
      for (const r of rootsSorted) {
        out.push({ id: r.id, name: r.name, level: 0, isRoot: true });
        const kids = [...byParent[String(r.id)] || []].sort((a, b) => {
          var _a2, _b;
          return ((_a2 = a.sortOrder) != null ? _a2 : 0) - ((_b = b.sortOrder) != null ? _b : 0) || String(a.name).localeCompare(String(b.name));
        });
        for (const k of kids) {
          out.push({ id: k.id, name: k.name, level: 1, isRoot: false });
        }
      }
      return out;
    });
    const categoryById = computed(() => {
      const map = {};
      for (const c of categories.value) map[c.id] = c;
      return map;
    });
    const productForm = ref({
      id: void 0,
      slug: "",
      name: "",
      article: "",
      price: "0.00",
      weight: "",
      categoryId: "",
      city: "",
      isAvailable: true,
      isActive: true,
      kind: "finished",
      description: ""
    });
    const showProductModal = ref(false);
    const showCloneModal = ref(false);
    const cloneSourceProduct = ref(null);
    const cloneFields = ref({
      name: true,
      price: true,
      weight: true,
      city: true,
      categoryId: true,
      isAvailable: true,
      kind: true,
      description: true,
      specs: true
    });
    const cloneIncludeImages = ref(true);
    const createMoreInModal = ref(false);
    const productModalTab = ref("edit");
    const showPreviewModal = ref(false);
    const historyLoading = ref(false);
    const historyError = ref(null);
    const productHistory = ref([]);
    const bomLoading = ref(false);
    const bomError = ref(null);
    const bomItems = ref([]);
    const blanksLoading = ref(false);
    const blanksQ = ref("");
    const blankProducts = ref([]);
    const editingCell = ref(null);
    const editingValue = ref("");
    const editingOriginal = ref(null);
    const editingSaving = ref(false);
    const ignoreNextBlur = ref(false);
    const changedCells = ref({});
    function recomputeIssues(p) {
      var _a;
      const issues = [];
      const priceNum = Number(p == null ? void 0 : p.price);
      if (!(p == null ? void 0 : p.price) || Number.isNaN(priceNum) || priceNum <= 0) issues.push("no_price");
      if (!(p == null ? void 0 : p.images) || !Array.isArray(p.images) || p.images.length === 0) issues.push("no_image");
      if (!(p == null ? void 0 : p.category) || !((_a = p == null ? void 0 : p.category) == null ? void 0 : _a.id)) issues.push("no_category");
      p.issues = issues;
    }
    function cellKey(id, field) {
      return `${id}:${field}`;
    }
    function markChanged(id, field) {
      const key = cellKey(id, field);
      changedCells.value[key] = true;
    }
    function startEdit(p, field) {
      var _a2, _b2, _c, _d;
      var _a, _b;
      if (!(p == null ? void 0 : p.id)) return;
      if (editingSaving.value) return;
      editingCell.value = { id: p.id, field };
      if (field === "price") {
        editingOriginal.value = String((_a2 = p.price) != null ? _a2 : "");
        editingValue.value = String((_b2 = p.price) != null ? _b2 : "");
      } else if (field === "categoryId") {
        editingOriginal.value = (_c = (_a = p.category) == null ? void 0 : _a.id) != null ? _c : "";
        editingValue.value = (_d = (_b = p.category) == null ? void 0 : _b.id) != null ? _d : "";
      } else if (field === "isActive") {
        editingOriginal.value = p.isActive !== false;
        editingValue.value = p.isActive !== false;
      } else if (field === "isAvailable") {
        editingOriginal.value = !!p.isAvailable;
        editingValue.value = !!p.isAvailable;
      }
    }
    function cancelEdit() {
      editingCell.value = null;
      editingValue.value = "";
      editingOriginal.value = null;
    }
    function productById(id) {
      return products.value.find((x) => x.id === id);
    }
    async function patchProductInline(id, field, value) {
      var _a, _b, _c;
      if (!auth.accessToken) return;
      const p = productById(id);
      if (!p) return;
      const original = editingOriginal.value;
      const hasChanged = String(value) !== String(original);
      if (!hasChanged) {
        cancelEdit();
        return;
      }
      const payload = {};
      if (field === "price") payload.price = String(value).trim();
      if (field === "categoryId") payload.categoryId = Number(value);
      if (field === "isActive") payload.isActive = value === true;
      if (field === "isAvailable") payload.isAvailable = value === true;
      editingSaving.value = true;
      try {
        await $fetch(`/api/admin/catalog/products/${id}`, {
          baseURL: apiBaseUrl,
          method: "PATCH",
          headers: authHeaders(),
          body: payload
        });
        if (field === "price") p.price = payload.price;
        if (field === "categoryId") {
          const c = (_a = categoryById.value) == null ? void 0 : _a[payload.categoryId];
          p.category = c ? { id: c.id, name: c.name, slug: c.slug } : null;
        }
        if (field === "isActive") p.isActive = payload.isActive;
        if (field === "isAvailable") p.isAvailable = payload.isAvailable;
        recomputeIssues(p);
        markChanged(id, field);
        toast({ type: "success", message: "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E" });
        cancelEdit();
      } catch (e) {
        toast({ type: "error", message: ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" });
        if (field === "price") p.price = String(original != null ? original : p.price);
        if (field === "categoryId") {
          const c = (_c = categoryById.value) == null ? void 0 : _c[Number(original)];
          p.category = c ? { id: c.id, name: c.name, slug: c.slug } : p.category;
        }
        if (field === "isActive") p.isActive = original === true;
        if (field === "isAvailable") p.isAvailable = original === true;
        recomputeIssues(p);
        cancelEdit();
      } finally {
        editingSaving.value = false;
      }
    }
    function saveEditClick() {
      if (!editingCell.value) return;
      ignoreNextBlur.value = true;
      patchProductInline(editingCell.value.id, editingCell.value.field, editingValue.value);
    }
    function cancelEditClick() {
      ignoreNextBlur.value = true;
      cancelEdit();
    }
    function onEditBlur() {
      if (ignoreNextBlur.value) return;
      if (!editingCell.value) return;
      patchProductInline(editingCell.value.id, editingCell.value.field, editingValue.value);
    }
    function onEditKeydown(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        saveEditClick();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEditClick();
      }
    }
    const SPEC_FIELDS = [
      // Особенности
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041D\u0430\u0431\u043E\u0440", label: "\u041D\u0430\u0431\u043E\u0440", type: "select", options: ["\u0414\u0430", "\u041D\u0435\u0442"] },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u0426\u0432\u0435\u0442", label: "\u0426\u0432\u0435\u0442", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0421\u0435\u0440\u044B\u0439" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041E\u0431\u044A\u0451\u043C, \u043B", label: "\u041E\u0431\u044A\u0451\u043C, \u043B", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 0.43" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041E\u0431\u044A\u0451\u043C, \u043C\u043B", label: "\u041E\u0431\u044A\u0451\u043C, \u043C\u043B", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 430" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u0412\u0438\u0434 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438", label: "\u0412\u0438\u0434 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041F\u0430\u043A\u0435\u0442" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u0420\u0438\u0441\u0443\u043D\u043E\u043A", label: "\u0420\u0438\u0441\u0443\u043D\u043E\u043A", type: "select", options: ["\u0414\u0430", "\u041D\u0435\u0442"] },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041A\u0440\u044B\u0448\u043A\u0430", label: "\u041A\u0440\u044B\u0448\u043A\u0430", type: "select", options: ["\u0414\u0430", "\u041D\u0435\u0442"] },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043A\u0440\u044B\u0448\u043A\u0438", label: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B \u043A\u0440\u044B\u0448\u043A\u0438", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0416\u0435\u0441\u0442\u044C / \u0414\u0435\u0440\u0435\u0432\u043E" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B", label: "\u041C\u0430\u0442\u0435\u0440\u0438\u0430\u043B", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0416\u0435\u0441\u0442\u044C" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u0430\u044F \u043A\u0440\u044B\u0448\u043A\u0430", label: "\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u0430\u044F \u043A\u0440\u044B\u0448\u043A\u0430", type: "select", options: ["\u0414\u0430", "\u041D\u0435\u0442"] },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u0414\u043B\u044F \u0434\u0435\u0442\u0435\u0439 \u0434\u043E 3 \u043B\u0435\u0442", label: "\u0414\u043B\u044F \u0434\u0435\u0442\u0435\u0439 \u0434\u043E 3 \u043B\u0435\u0442", type: "select", options: ["\u0414\u0430", "\u041D\u0435\u0442"] },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041C\u043E\u0436\u043D\u043E \u043C\u044B\u0442\u044C \u0432 \u043F\u043E\u0441\u0443\u0434\u043E\u043C\u043E\u0435\u0447\u043D\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u0435", label: "\u041C\u043E\u0436\u043D\u043E \u043C\u044B\u0442\u044C \u0432 \u043F\u043E\u0441\u0443\u0434\u043E\u043C\u043E\u0435\u0447\u043D\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u0435", type: "select", options: ["\u0414\u0430", "\u041D\u0435\u0442"] },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041C\u043E\u0436\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0432 \u0421\u0412\u0427-\u043F\u0435\u0447\u0438", label: "\u041C\u043E\u0436\u043D\u043E \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C \u0432 \u0421\u0412\u0427-\u043F\u0435\u0447\u0438", type: "select", options: ["\u0414\u0430", "\u041D\u0435\u0442"] },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u0422\u0435\u043A\u0441\u0442\u0443\u0440\u0430", label: "\u0422\u0435\u043A\u0441\u0442\u0443\u0440\u0430", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0421 \u0440\u0435\u043B\u044C\u0435\u0444\u043E\u043C" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435", label: "\u041D\u0430\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0414\u043B\u044F \u0441\u044B\u043F\u0443\u0447\u0438\u0445" },
      { group: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", key: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438 \u0442\u043E\u0432\u0430\u0440\u0430", label: "\u041E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0438", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0411\u0435\u0437 \u043E\u0441\u043E\u0431\u0435\u043D\u043D\u043E\u0441\u0442\u0435\u0439" },
      // Габариты и вес
      { group: "\u0413\u0430\u0431\u0430\u0440\u0438\u0442\u044B \u0438 \u0432\u0435\u0441", key: "\u0420\u0430\u0437\u043C\u0435\u0440 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)", label: "\u0420\u0430\u0437\u043C\u0435\u0440 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 11,5 \xD7 11,5 \xD7 7,3" },
      { group: "\u0413\u0430\u0431\u0430\u0440\u0438\u0442\u044B \u0438 \u0432\u0435\u0441", key: "\u0412\u0435\u0441 \u0431\u0440\u0443\u0442\u0442\u043E, \u0433", label: "\u0412\u0435\u0441 \u0431\u0440\u0443\u0442\u0442\u043E, \u0433", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 75" },
      // Упаковка и фасовка
      { group: "\u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \u0438 \u0444\u0430\u0441\u043E\u0432\u043A\u0430", key: "\u0412 \u0431\u043E\u043A\u0441\u0435", label: "\u0412 \u0431\u043E\u043A\u0441\u0435", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 96 \u0448\u0442" },
      { group: "\u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \u0438 \u0444\u0430\u0441\u043E\u0432\u043A\u0430", key: "\u0424\u0430\u0441\u043E\u0432\u043A\u0430", label: "\u0424\u0430\u0441\u043E\u0432\u043A\u0430", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u043F\u043E 1 \u0448\u0442." },
      { group: "\u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \u0438 \u0444\u0430\u0441\u043E\u0432\u043A\u0430", key: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0430", label: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0430", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041F\u0430\u043A\u0435\u0442" },
      { group: "\u0423\u043F\u0430\u043A\u043E\u0432\u043A\u0430 \u0438 \u0444\u0430\u0441\u043E\u0432\u043A\u0430", key: "\u0420\u0430\u0437\u043C\u0435\u0440 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)", label: "\u0420\u0430\u0437\u043C\u0435\u0440 \u0443\u043F\u0430\u043A\u043E\u0432\u043A\u0438 (\u0414 \xD7 \u0428 \xD7 \u0412, \u0441\u043C)", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: 11,5 \xD7 7,3 \xD7 7,3" },
      // Общие
      { group: "\u041E\u0431\u0449\u0438\u0435", key: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442", label: "\u0421\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0435 \u043F\u043E\u0434\u043B\u0435\u0436\u0438\u0442 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0446\u0438\u0438" },
      { group: "\u041E\u0431\u0449\u0438\u0435", key: "\u0421\u0442\u0440\u0430\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C", label: "\u0421\u0442\u0440\u0430\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041A\u0438\u0442\u0430\u0439" },
      { group: "\u041E\u0431\u0449\u0438\u0435", key: "\u0421\u043E\u0441\u0442\u0430\u0432", label: "\u0421\u043E\u0441\u0442\u0430\u0432", placeholder: "\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0416\u0435\u0441\u0442\u044C" },
      { group: "\u041E\u0431\u0449\u0438\u0435", key: "\u0421\u0435\u0440\u0438\u044F", label: "\u0421\u0435\u0440\u0438\u044F", placeholder: '\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041F\u043E\u0441\u0443\u0434\u0430 \u0438\u0437 \u0436\u0435\u0441\u0442\u0438 "\u0420\u043E\u043C\u0431"' }
    ];
    const specForm = ref({});
    function resetSpecForm() {
      const next = {};
      for (const f of SPEC_FIELDS) next[f.key] = "";
      specForm.value = next;
    }
    ref({});
    const lastAutoArticle = ref("");
    const lastAutoKind = ref("");
    async function fetchAutoArticle(city) {
      if (!auth.accessToken) return;
      if (productForm.value.id) return;
      const currentArticle = String(productForm.value.article || "").trim();
      if (currentArticle && currentArticle !== lastAutoArticle.value) return;
      try {
        const cityCode = String(city || "").trim().toUpperCase();
        const res = await $fetch("/api/admin/catalog/next-article", {
          baseURL: apiBaseUrl,
          headers: authHeaders(),
          // city optional: если не выбран — всё равно дадим "00-xxxx"
          query: cityCode ? { city: cityCode } : void 0
        });
        if (res == null ? void 0 : res.article) {
          productForm.value.article = String(res.article);
          lastAutoArticle.value = String(res.article);
        }
      } catch {
      }
    }
    watch(
      () => productForm.value.city,
      async (city) => {
        await fetchAutoArticle(city);
      }
    );
    watch(
      () => productForm.value.categoryId,
      (cid) => {
        if (productForm.value.id) return;
        const currentKind = productForm.value.kind === "blank" || productForm.value.kind === "finished" ? productForm.value.kind : "finished";
        if (lastAutoKind.value && currentKind !== lastAutoKind.value) return;
        const cat = categories.value.find((c) => Number(c == null ? void 0 : c.id) === Number(cid));
        const name = String((cat == null ? void 0 : cat.name) || "").toLowerCase();
        const nextKind = name.includes("\u0437\u0430\u0433\u043E\u0442\u043E\u0432") ? "blank" : "finished";
        productForm.value.kind = nextKind;
        lastAutoKind.value = nextKind;
      }
    );
    function authHeaders() {
      return auth.accessToken ? { Authorization: `Bearer ${auth.accessToken}` } : {};
    }
    async function loadCategories() {
      if (!auth.accessToken) return;
      const res = await $fetch("/api/admin/catalog/categories", {
        baseURL: apiBaseUrl,
        headers: authHeaders()
      });
      categories.value = Array.isArray(res == null ? void 0 : res.categories) ? res.categories : [];
    }
    async function loadProducts() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/catalog/products", {
          baseURL: apiBaseUrl,
          headers: authHeaders(),
          query: {
            q: q.value || void 0,
            categoryId: categoryId.value === "" ? void 0 : categoryId.value,
            issue: issueFilter.value || void 0,
            city: cityFilter.value || void 0,
            kind: kindFilter.value || void 0,
            showArchived: showArchived.value ? "true" : void 0,
            limit: 100
          }
        });
        products.value = Array.isArray(res == null ? void 0 : res.products) ? res.products : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043A\u0430\u0442\u0430\u043B\u043E\u0433";
      } finally {
        loading.value = false;
      }
    }
    async function loadProductHistory(productId) {
      var _a;
      if (!auth.accessToken) return;
      historyLoading.value = true;
      historyError.value = null;
      try {
        const res = await $fetch(`/api/admin/catalog/products/${productId}/history`, {
          baseURL: apiBaseUrl,
          headers: authHeaders()
        });
        productHistory.value = Array.isArray(res == null ? void 0 : res.events) ? res.events : [];
      } catch (e) {
        historyError.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0438\u0441\u0442\u043E\u0440\u0438\u044E";
        productHistory.value = [];
      } finally {
        historyLoading.value = false;
      }
    }
    async function reloadAll() {
      var _a;
      loading.value = true;
      error.value = null;
      try {
        await loadCategories();
        await loadProducts();
        await loadWarehouses();
        await loadCities();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435";
      } finally {
        loading.value = false;
      }
    }
    async function loadCities() {
      if (!auth.accessToken) return;
      try {
        const res = await $fetch("/api/ops/cities", {
          baseURL: apiBaseUrl,
          headers: authHeaders()
        });
        cities.value = Array.isArray(res == null ? void 0 : res.cities) ? res.cities : [];
      } catch {
        cities.value = [];
      }
    }
    async function loadWarehouses() {
      if (!auth.accessToken) return;
      try {
        const res = await $fetch("/api/ops/warehouses", {
          baseURL: apiBaseUrl,
          headers: authHeaders()
        });
        warehouses.value = Array.isArray(res == null ? void 0 : res.warehouses) ? res.warehouses : [];
      } catch {
        warehouses.value = [];
      }
    }
    function resetProductForm() {
      var _a, _b;
      lastAutoArticle.value = "";
      productImages.value = [];
      productForm.value = {
        id: void 0,
        slug: "",
        name: "",
        article: "",
        price: "0.00",
        weight: "",
        categoryId: ((_b = (_a = categories.value) == null ? void 0 : _a[0]) == null ? void 0 : _b.id) || "",
        city: "",
        isAvailable: true,
        isActive: true,
        kind: "finished",
        description: ""
      };
      resetSpecForm();
      bomItems.value = [];
      bomError.value = null;
    }
    function openNewProductModal() {
      resetProductForm();
      createMoreInModal.value = false;
      showProductModal.value = true;
      fetchAutoArticle(productForm.value.city);
    }
    function editProduct(p) {
      var _a;
      productImages.value = Array.isArray(p == null ? void 0 : p.images) ? p.images : [];
      productForm.value = {
        id: p.id,
        slug: String(p.slug || ""),
        name: String(p.name || ""),
        article: String(p.article || ""),
        price: String(p.price || "0.00"),
        weight: p.weight === null || p.weight === void 0 ? "" : String(p.weight),
        categoryId: ((_a = p.category) == null ? void 0 : _a.id) || "",
        city: p.city ? String(p.city) : "",
        isAvailable: !!p.isAvailable,
        isActive: p.isActive !== false,
        kind: p.kind === "blank" || p.kind === "finished" ? p.kind : "finished",
        description: p.description ? String(p.description) : ""
      };
      const s = (p == null ? void 0 : p.specs) && typeof p.specs === "object" ? p.specs : {};
      const next = {};
      for (const f of SPEC_FIELDS) next[f.key] = (s == null ? void 0 : s[f.key]) ? String(s[f.key]) : "";
      specForm.value = next;
      tab.value = "products";
      createMoreInModal.value = false;
      showProductModal.value = true;
    }
    async function loadBlankProducts(search = "") {
      if (!auth.accessToken) return;
      blanksLoading.value = true;
      try {
        const res = await $fetch("/api/admin/catalog/products", {
          baseURL: apiBaseUrl,
          method: "GET",
          headers: authHeaders(),
          query: {
            limit: 200,
            page: 1,
            q: String(search || "").trim() || void 0,
            kind: "blank"
          }
        });
        blankProducts.value = Array.isArray(res == null ? void 0 : res.products) ? res.products : [];
      } catch {
        blankProducts.value = [];
      } finally {
        blanksLoading.value = false;
      }
    }
    async function loadBomForCurrentProduct() {
      var _a, _b;
      const pid = Number((_a = productForm.value) == null ? void 0 : _a.id);
      bomError.value = null;
      if (!auth.accessToken) return;
      if (!pid) {
        bomItems.value = [];
        return;
      }
      bomLoading.value = true;
      try {
        const res = await $fetch(`/api/admin/catalog/products/${pid}/bom`, {
          baseURL: apiBaseUrl,
          method: "GET",
          headers: authHeaders()
        });
        const items = Array.isArray(res == null ? void 0 : res.items) ? res.items : [];
        bomItems.value = items.map((x) => {
          var _a2;
          return { componentProductId: Number(x.componentProductId), qty: Number((_a2 = x.qty) != null ? _a2 : 1) };
        });
      } catch (e) {
        bomError.value = ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0440\u0435\u0446\u0435\u043F\u0442";
        bomItems.value = [];
      } finally {
        bomLoading.value = false;
      }
    }
    function buildPreviewDraftProduct() {
      var _a2, _b;
      var _a;
      const c = productForm.value.categoryId ? categoryById.value[Number(productForm.value.categoryId)] : null;
      const images = orderedProductImages.value.map((x, idx) => {
        var _a3, _b2;
        return {
          id: (_a3 = x.id) != null ? _a3 : `tmp_${idx}`,
          url: x.url,
          sortOrder: Number((_b2 = x.sortOrder) != null ? _b2 : idx)
        };
      });
      const specs = {};
      for (const f of SPEC_FIELDS) {
        const raw = String((_a2 = (_a = specForm.value) == null ? void 0 : _a[f.key]) != null ? _a2 : "").trim();
        if (raw) specs[f.key] = raw;
      }
      const priceNum = Number(String(productForm.value.price || "").replace(",", "."));
      return {
        id: (_b = productForm.value.id) != null ? _b : 0,
        slug: String(productForm.value.slug || "").trim(),
        name: String(productForm.value.name || "").trim() || "(\u0431\u0435\u0437 \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u044F)",
        article: String(productForm.value.article || "").trim(),
        price: Number.isFinite(priceNum) ? priceNum : null,
        retailPrice: Number.isFinite(priceNum) ? priceNum : null,
        wholesalePrice: null,
        isAvailable: !!productForm.value.isAvailable,
        isActive: productForm.value.isActive !== false,
        kind: productForm.value.kind,
        description: String(productForm.value.description || "").trim(),
        category: c ? { id: c.id, name: c.name, slug: c.slug, parent: c.parent ? { id: c.parent.id, name: c.parent.name, slug: c.parent.slug } : null } : null,
        images,
        specs: Object.keys(specs).length ? specs : null
      };
    }
    const previewDraft = computed(() => {
      try {
        return buildPreviewDraftProduct();
      } catch {
        return null;
      }
    });
    const FIELD_LABELS = {
      name: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
      slug: "Slug",
      article: "\u0410\u0440\u0442\u0438\u043A\u0443\u043B",
      price: "\u0426\u0435\u043D\u0430",
      weight: "\u0412\u0435\u0441",
      city: "\u0413\u043E\u0440\u043E\u0434",
      categoryId: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F",
      isAvailable: "\u0414\u043E\u0441\u0442\u0443\u043F\u0435\u043D",
      isActive: "\u0410\u043A\u0442\u0438\u0432\u0435\u043D",
      kind: "\u0422\u0438\u043F",
      description: "\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435",
      specs: "\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438"
    };
    function formatHistoryValue(v) {
      if (v === null || v === void 0) return "\u2014";
      if (typeof v === "boolean") return v ? "\u0434\u0430" : "\u043D\u0435\u0442";
      if (typeof v === "object") return JSON.stringify(v);
      return String(v);
    }
    async function archiveProduct(id) {
      var _a;
      if (!auth.accessToken) return;
      if (!confirm("\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440 \u0432 \u0430\u0440\u0445\u0438\u0432?")) return;
      error.value = null;
      try {
        await $fetch(`/api/admin/catalog/products/${id}`, {
          baseURL: apiBaseUrl,
          method: "DELETE",
          headers: authHeaders()
        });
        await loadProducts();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440";
      }
    }
    async function unarchiveProduct(id) {
      var _a;
      if (!auth.accessToken) return;
      if (!confirm("\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440 \u0438\u0437 \u0430\u0440\u0445\u0438\u0432\u0430?")) return;
      error.value = null;
      try {
        await $fetch(`/api/admin/catalog/products/${id}`, {
          baseURL: apiBaseUrl,
          method: "PATCH",
          headers: authHeaders(),
          body: { archived: false }
        });
        await loadProducts();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440";
      }
    }
    async function cloneProduct(p) {
      openCloneModal(p);
    }
    function openCloneModal(p) {
      cloneSourceProduct.value = p;
      cloneFields.value = {
        name: true,
        price: true,
        weight: true,
        city: true,
        categoryId: true,
        isAvailable: true,
        kind: true,
        description: true,
        specs: true
      };
      cloneIncludeImages.value = true;
      showCloneModal.value = true;
    }
    async function setProductActive(p, isActive) {
      var _a;
      if (!auth.accessToken) return;
      error.value = null;
      try {
        await $fetch(`/api/admin/catalog/products/${p.id}`, {
          baseURL: apiBaseUrl,
          method: "PATCH",
          headers: authHeaders(),
          body: { isActive }
        });
        await loadProducts();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0442\u043E\u0432\u0430\u0440";
      }
    }
    function imageUrl(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return `${apiBaseUrl}${normalized}`;
    }
    function productThumb(p) {
      const img = Array.isArray(p == null ? void 0 : p.images) ? p.images[0] : null;
      const url = (img == null ? void 0 : img.url) ? String(img.url) : "";
      return url ? imageUrl(url) : "";
    }
    ref(null);
    const orderedProductImages = computed(() => {
      const list = Array.isArray(productImages.value) ? [...productImages.value] : [];
      list.sort((a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) || Number(a.id || 0) - Number(b.id || 0));
      return list;
    });
    watch(showProductModal, (open) => {
      var _a;
      if (!open) {
        productModalTab.value = "edit";
        showPreviewModal.value = false;
        productHistory.value = [];
        historyError.value = null;
        historyLoading.value = false;
        bomItems.value = [];
        bomError.value = null;
        return;
      }
      productModalTab.value = "edit";
      if (!((_a = blankProducts.value) == null ? void 0 : _a.length)) {
        loadBlankProducts(blanksQ.value);
      }
      loadBomForCurrentProduct();
    });
    watch(productModalTab, async (t) => {
      var _a;
      if (t !== "history") return;
      const pid = Number((_a = productForm.value) == null ? void 0 : _a.id);
      if (!pid) {
        productHistory.value = [];
        historyError.value = "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0442\u043E\u0432\u0430\u0440\u0430";
        return;
      }
      await loadProductHistory(pid);
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminInput = _sfc_main$4;
      const _component_AdminSelect = _sfc_main$5;
      const _component_ProductGallery = _sfc_main$1$1;
      const _component_ProductAvailabilityBadge = _sfc_main$6;
      const _component_ProductPriceBlock = _sfc_main$7;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u041A\u0430\u0442\u0430\u043B\u043E\u0433",
        description: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438, \u0442\u043E\u0432\u0430\u0440\u044B, \u0446\u0435\u043D\u044B \u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F (\u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435)",
        icon: "\u{1F4DA}"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminButton, { onClick: reloadAll }, {
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
              createVNode(_component_AdminButton, { onClick: reloadAll }, {
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
      _push(`<div class="bg-slate-100 p-1 rounded-xl inline-flex gap-1"><button class="${ssrRenderClass([unref(tab) === "products" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u{1F4E6} \u0422\u043E\u0432\u0430\u0440\u044B </button><button class="${ssrRenderClass([unref(tab) === "categories" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u{1F5C2}\uFE0F \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 </button><button class="${ssrRenderClass([unref(tab) === "cities" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u{1F3D9}\uFE0F \u0413\u043E\u0440\u043E\u0434\u0430 </button></div>`);
      if (unref(tab) === "products") {
        _push(`<div class="space-y-4">`);
        _push(ssrRenderComponent(_component_AdminCard, null, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex flex-col lg:flex-row lg:items-center gap-3"${_scopeId}>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: unref(q),
                "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                class: "flex-1",
                placeholder: "\u043F\u043E\u0438\u0441\u043A: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 / \u0430\u0440\u0442\u0438\u043A\u0443\u043B / slug",
                icon: "search",
                onKeydown: loadProducts
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_AdminSelect, {
                modelValue: unref(categoryId),
                "onUpdate:modelValue": [($event) => isRef(categoryId) ? categoryId.value = $event : null, loadProducts],
                options: [{ value: "", label: "\u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }, ...unref(categoryOptions).map((c) => ({ value: c.id, label: (c.level === 1 ? "\u2014 " : "") + c.name }))]
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_AdminSelect, {
                modelValue: unref(issueFilter),
                "onUpdate:modelValue": [($event) => isRef(issueFilter) ? issueFilter.value = $event : null, loadProducts],
                options: [{ value: "", label: "\u0412\u0441\u0435 \u0442\u043E\u0432\u0430\u0440\u044B" }, { value: "no_price", label: "\u0411\u0435\u0437 \u0446\u0435\u043D\u044B" }, { value: "no_image", label: "\u0411\u0435\u0437 \u0444\u043E\u0442\u043E" }, { value: "no_category", label: "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }]
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_AdminSelect, {
                modelValue: unref(cityFilter),
                "onUpdate:modelValue": [($event) => isRef(cityFilter) ? cityFilter.value = $event : null, loadProducts],
                options: [{ value: "", label: "\u0412\u0441\u0435 \u0433\u043E\u0440\u043E\u0434\u0430" }, ...unref(cities).map((c) => ({ value: c.code, label: `${c.name || c.code} (${c.code})` }))]
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_AdminSelect, {
                modelValue: unref(kindFilter),
                "onUpdate:modelValue": [($event) => isRef(kindFilter) ? kindFilter.value = $event : null, loadProducts],
                options: [{ value: "", label: "\u0422\u0438\u043F: \u0432\u0441\u0435" }, { value: "blank", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430" }, { value: "finished", label: "\u0413\u043E\u0442\u043E\u0432\u044B\u0439" }]
              }, null, _parent2, _scopeId));
              _push2(`<label class="flex items-center gap-2 text-sm text-slate-700 select-none whitespace-nowrap"${_scopeId}><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(showArchived)) ? ssrLooseContain(unref(showArchived), null) : unref(showArchived)) ? " checked" : ""} class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"${_scopeId}> \u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0430\u0440\u0445\u0438\u0432 </label>`);
              _push2(ssrRenderComponent(_component_AdminButton, { onClick: loadProducts }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u041D\u0430\u0439\u0442\u0438`);
                  } else {
                    return [
                      createTextVNode("\u041D\u0430\u0439\u0442\u0438")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_AdminButton, {
                variant: "primary",
                onClick: openNewProductModal
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440`);
                  } else {
                    return [
                      createTextVNode("\u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex flex-col lg:flex-row lg:items-center gap-3" }, [
                  createVNode(_component_AdminInput, {
                    modelValue: unref(q),
                    "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                    class: "flex-1",
                    placeholder: "\u043F\u043E\u0438\u0441\u043A: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 / \u0430\u0440\u0442\u0438\u043A\u0443\u043B / slug",
                    icon: "search",
                    onKeydown: withKeys(loadProducts, ["enter"])
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(categoryId),
                    "onUpdate:modelValue": [($event) => isRef(categoryId) ? categoryId.value = $event : null, loadProducts],
                    options: [{ value: "", label: "\u0412\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }, ...unref(categoryOptions).map((c) => ({ value: c.id, label: (c.level === 1 ? "\u2014 " : "") + c.name }))]
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "options"]),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(issueFilter),
                    "onUpdate:modelValue": [($event) => isRef(issueFilter) ? issueFilter.value = $event : null, loadProducts],
                    options: [{ value: "", label: "\u0412\u0441\u0435 \u0442\u043E\u0432\u0430\u0440\u044B" }, { value: "no_price", label: "\u0411\u0435\u0437 \u0446\u0435\u043D\u044B" }, { value: "no_image", label: "\u0411\u0435\u0437 \u0444\u043E\u0442\u043E" }, { value: "no_category", label: "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438" }]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(cityFilter),
                    "onUpdate:modelValue": [($event) => isRef(cityFilter) ? cityFilter.value = $event : null, loadProducts],
                    options: [{ value: "", label: "\u0412\u0441\u0435 \u0433\u043E\u0440\u043E\u0434\u0430" }, ...unref(cities).map((c) => ({ value: c.code, label: `${c.name || c.code} (${c.code})` }))]
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "options"]),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(kindFilter),
                    "onUpdate:modelValue": [($event) => isRef(kindFilter) ? kindFilter.value = $event : null, loadProducts],
                    options: [{ value: "", label: "\u0422\u0438\u043F: \u0432\u0441\u0435" }, { value: "blank", label: "\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430" }, { value: "finished", label: "\u0413\u043E\u0442\u043E\u0432\u044B\u0439" }]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode("label", { class: "flex items-center gap-2 text-sm text-slate-700 select-none whitespace-nowrap" }, [
                    withDirectives(createVNode("input", {
                      type: "checkbox",
                      "onUpdate:modelValue": ($event) => isRef(showArchived) ? showArchived.value = $event : null,
                      onChange: loadProducts,
                      class: "rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                    }, null, 40, ["onUpdate:modelValue"]), [
                      [vModelCheckbox, unref(showArchived)]
                    ]),
                    createTextVNode(" \u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0430\u0440\u0445\u0438\u0432 ")
                  ]),
                  createVNode(_component_AdminButton, { onClick: loadProducts }, {
                    default: withCtx(() => [
                      createTextVNode("\u041D\u0430\u0439\u0442\u0438")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_AdminButton, {
                    variant: "primary",
                    onClick: openNewProductModal
                  }, {
                    default: withCtx(() => [
                      createTextVNode("\u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440")
                    ]),
                    _: 1
                  })
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (unref(loading)) {
          _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></div>`);
        } else {
          _push(ssrRenderComponent(_component_AdminCard, { padding: false }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="overflow-x-auto"${_scopeId}><table class="w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left font-semibold px-5 py-3.5"${_scopeId}>SKU/\u0430\u0440\u0442\u0438\u043A\u0443\u043B</th><th class="text-left font-semibold px-5 py-3.5"${_scopeId}>\u0424\u043E\u0442\u043E</th><th class="text-left font-semibold px-5 py-3.5"${_scopeId}>\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435</th><th class="text-left font-semibold px-5 py-3.5"${_scopeId}>\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F</th><th class="text-right font-semibold px-5 py-3.5"${_scopeId}>\u0426\u0435\u043D\u0430</th><th class="text-left font-semibold px-5 py-3.5"${_scopeId}>\u0412\u0438\u0434</th><th class="text-left font-semibold px-5 py-3.5"${_scopeId}>\u0414\u043E\u0441\u0442\u0443\u043F\u0435\u043D</th><th class="text-left font-semibold px-5 py-3.5"${_scopeId}>\u0410\u043A\u0442\u0438\u0432\u0435\u043D</th><th class="text-right font-semibold px-5 py-3.5"${_scopeId}>\u041E\u0441\u0442\u0430\u0442\u043E\u043A</th><th class="text-right font-semibold px-5 py-3.5"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody${_scopeId}><!--[-->`);
                ssrRenderList(unref(products), (p) => {
                  var _a3;
                  var _a2, _b2, _c2, _d, _e;
                  _push2(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-5 py-4 font-mono text-xs text-slate-600"${_scopeId}>${ssrInterpolate(p.article)}</td><td class="px-5 py-4"${_scopeId}><div class="h-10 w-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden"${_scopeId}>`);
                  if (productThumb(p)) {
                    _push2(`<img${ssrRenderAttr("src", productThumb(p))} alt="" class="h-full w-full object-cover" loading="lazy"${_scopeId}>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></td><td class="px-5 py-4"${_scopeId}><div class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(p.name)}</div><div class="text-[11px] text-slate-500"${_scopeId}>${ssrInterpolate(p.slug)}</div>`);
                  if (Array.isArray(p.issues) && p.issues.length) {
                    _push2(`<div class="mt-1 flex flex-wrap gap-1"${_scopeId}>`);
                    if (p.issues.includes("no_price")) {
                      _push2(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-red-200 bg-red-50 text-red-800"${_scopeId}>\u{1F534} \u043D\u0435\u0442 \u0446\u0435\u043D\u044B</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    if (p.issues.includes("no_image")) {
                      _push2(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-amber-200 bg-amber-50 text-amber-800"${_scopeId}>\u{1F7E1} \u043D\u0435\u0442 \u0444\u043E\u0442\u043E</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    if (p.issues.includes("no_category")) {
                      _push2(`<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-sky-200 bg-sky-50 text-sky-800"${_scopeId}>\u{1F535} \u043D\u0435\u0442 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438</span>`);
                    } else {
                      _push2(`<!---->`);
                    }
                    _push2(`</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</td><td class="px-4 py-3"${_scopeId}><div class="${ssrRenderClass([unref(changedCells)[cellKey(p.id, "categoryId")] ? "bg-emerald-50" : "", "inline-flex items-center gap-2 rounded-lg px-2 py-1"])}"${_scopeId}>`);
                  if (((_a2 = unref(editingCell)) == null ? void 0 : _a2.id) === p.id && unref(editingCell).field === "categoryId") {
                    _push2(`<!--[--><select class="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs"${_scopeId}><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(editingValue)) ? ssrLooseContain(unref(editingValue), "") : ssrLooseEqual(unref(editingValue), "")) ? " selected" : ""}${_scopeId}>\u2014</option><!--[-->`);
                    ssrRenderList(unref(categoryOptions), (c) => {
                      _push2(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(c.isRoot) ? " disabled" : ""}${ssrIncludeBooleanAttr(Array.isArray(unref(editingValue)) ? ssrLooseContain(unref(editingValue), c.id) : ssrLooseEqual(unref(editingValue), c.id)) ? " selected" : ""}${_scopeId}>${ssrInterpolate(c.level === 1 ? "\u2014 " : "")}${ssrInterpolate(c.name)}</option>`);
                    });
                    _push2(`<!--]--></select><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2714</button><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2716</button><!--]-->`);
                  } else {
                    _push2(`<button class="text-left hover:underline underline-offset-4 text-sm" title="\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C"${_scopeId}>${ssrInterpolate(((_b2 = p.category) == null ? void 0 : _b2.name) || "\u2014")}</button>`);
                  }
                  _push2(`</div></td><td class="px-4 py-3 text-right tabular-nums"${_scopeId}><div class="${ssrRenderClass([unref(changedCells)[cellKey(p.id, "price")] ? "bg-emerald-50" : "", "inline-flex items-center justify-end gap-2 rounded-lg px-2 py-1"])}"${_scopeId}>`);
                  if (((_c2 = unref(editingCell)) == null ? void 0 : _c2.id) === p.id && unref(editingCell).field === "price") {
                    _push2(`<!--[--><input${ssrRenderAttr("value", unref(editingValue))} class="w-24 px-2 py-1 rounded-lg border border-gray-200 text-xs text-right" inputmode="decimal"${_scopeId}><span class="text-xs text-gray-500"${_scopeId}>\u20BD</span><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2714</button><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2716</button><!--]-->`);
                  } else {
                    _push2(`<button class="hover:underline underline-offset-4" title="\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C"${_scopeId}>${ssrInterpolate(p.price)} \u20BD </button>`);
                  }
                  _push2(`</div></td><td class="px-4 py-3"${_scopeId}><span class="${ssrRenderClass([p.kind === "blank" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}"${_scopeId}>${ssrInterpolate(p.kind === "blank" ? "\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430" : "\u0433\u043E\u0442\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440")}</span></td><td class="px-4 py-3"${_scopeId}><div class="${ssrRenderClass([unref(changedCells)[cellKey(p.id, "isAvailable")] ? "bg-emerald-50" : "", "inline-flex items-center gap-2 rounded-lg px-2 py-1"])}"${_scopeId}>`);
                  if (((_d = unref(editingCell)) == null ? void 0 : _d.id) === p.id && unref(editingCell).field === "isAvailable") {
                    _push2(`<!--[--><select class="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs"${_scopeId}><option${ssrRenderAttr("value", true)}${ssrIncludeBooleanAttr(Array.isArray(unref(editingValue)) ? ssrLooseContain(unref(editingValue), true) : ssrLooseEqual(unref(editingValue), true)) ? " selected" : ""}${_scopeId}>\u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438</option><option${ssrRenderAttr("value", false)}${ssrIncludeBooleanAttr(Array.isArray(unref(editingValue)) ? ssrLooseContain(unref(editingValue), false) : ssrLooseEqual(unref(editingValue), false)) ? " selected" : ""}${_scopeId}>\u043D\u0435\u0442</option></select><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2714</button><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2716</button><!--]-->`);
                  } else {
                    _push2(`<button class="${ssrRenderClass([p.isAvailable ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-gray-100 text-gray-600 border-gray-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border hover:opacity-90"])}" title="\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C"${_scopeId}>${ssrInterpolate(p.isAvailable ? "\u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438" : "\u043D\u0435\u0442")}</button>`);
                  }
                  _push2(`</div></td><td class="px-4 py-3"${_scopeId}><div class="${ssrRenderClass([unref(changedCells)[cellKey(p.id, "isActive")] ? "bg-emerald-50" : "", "inline-flex items-center gap-2 rounded-lg px-2 py-1"])}"${_scopeId}>`);
                  if (((_e = unref(editingCell)) == null ? void 0 : _e.id) === p.id && unref(editingCell).field === "isActive") {
                    _push2(`<!--[--><select class="px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs"${_scopeId}><option${ssrRenderAttr("value", true)}${ssrIncludeBooleanAttr(Array.isArray(unref(editingValue)) ? ssrLooseContain(unref(editingValue), true) : ssrLooseEqual(unref(editingValue), true)) ? " selected" : ""}${_scopeId}>\u0430\u043A\u0442\u0438\u0432\u0435\u043D</option><option${ssrRenderAttr("value", false)}${ssrIncludeBooleanAttr(Array.isArray(unref(editingValue)) ? ssrLooseContain(unref(editingValue), false) : ssrLooseEqual(unref(editingValue), false)) ? " selected" : ""}${_scopeId}>\u0441\u043A\u0440\u044B\u0442</option></select><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2714</button><button class="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]"${_scopeId}>\u2716</button><!--]-->`);
                  } else {
                    _push2(`<button class="${ssrRenderClass([p.isActive !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border hover:opacity-90"])}" title="\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C"${_scopeId}>${ssrInterpolate(p.isActive !== false ? "\u0430\u043A\u0442\u0438\u0432\u0435\u043D" : "\u0441\u043A\u0440\u044B\u0442")}</button>`);
                  }
                  _push2(`</div></td><td class="px-4 py-3 text-right tabular-nums"${_scopeId}>`);
                  if (p.kind === "finished") {
                    _push2(`<span${_scopeId}>${ssrInterpolate((_a3 = p.stockQty) != null ? _a3 : 0)}</span>`);
                  } else {
                    _push2(`<span class="text-gray-400"${_scopeId}>\u2014</span>`);
                  }
                  _push2(`</td><td class="px-4 py-3 text-right"${_scopeId}><div class="inline-flex items-center gap-2"${_scopeId}><button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"${_scopeId}> \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C </button><button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"${_scopeId}> \u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C </button>`);
                  if (p.isActive !== false) {
                    _push2(`<button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"${_scopeId}> \u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C </button>`);
                  } else {
                    _push2(`<button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"${_scopeId}> \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C </button>`);
                  }
                  if (!p.archived) {
                    _push2(`<button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"${_scopeId}> \u0412 \u0430\u0440\u0445\u0438\u0432 </button>`);
                  } else {
                    _push2(`<button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"${_scopeId}> \u0418\u0437 \u0430\u0440\u0445\u0438\u0432\u0430 </button>`);
                  }
                  _push2(`</div></td></tr>`);
                });
                _push2(`<!--]-->`);
                if (unref(products).length === 0) {
                  _push2(`<tr class="border-t border-slate-100"${_scopeId}><td colspan="10" class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F4E6}</div><div${_scopeId}>\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</div></td></tr>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</tbody></table></div>`);
              } else {
                return [
                  createVNode("div", { class: "overflow-x-auto" }, [
                    createVNode("table", { class: "w-full text-sm" }, [
                      createVNode("thead", { class: "bg-slate-50 text-xs text-slate-600 uppercase tracking-wide" }, [
                        createVNode("tr", null, [
                          createVNode("th", { class: "text-left font-semibold px-5 py-3.5" }, "SKU/\u0430\u0440\u0442\u0438\u043A\u0443\u043B"),
                          createVNode("th", { class: "text-left font-semibold px-5 py-3.5" }, "\u0424\u043E\u0442\u043E"),
                          createVNode("th", { class: "text-left font-semibold px-5 py-3.5" }, "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"),
                          createVNode("th", { class: "text-left font-semibold px-5 py-3.5" }, "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F"),
                          createVNode("th", { class: "text-right font-semibold px-5 py-3.5" }, "\u0426\u0435\u043D\u0430"),
                          createVNode("th", { class: "text-left font-semibold px-5 py-3.5" }, "\u0412\u0438\u0434"),
                          createVNode("th", { class: "text-left font-semibold px-5 py-3.5" }, "\u0414\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),
                          createVNode("th", { class: "text-left font-semibold px-5 py-3.5" }, "\u0410\u043A\u0442\u0438\u0432\u0435\u043D"),
                          createVNode("th", { class: "text-right font-semibold px-5 py-3.5" }, "\u041E\u0441\u0442\u0430\u0442\u043E\u043A"),
                          createVNode("th", { class: "text-right font-semibold px-5 py-3.5" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F")
                        ])
                      ]),
                      createVNode("tbody", null, [
                        (openBlock(true), createBlock(Fragment, null, renderList(unref(products), (p) => {
                          var _a3;
                          var _a2, _b2, _c2, _d, _e;
                          return openBlock(), createBlock("tr", {
                            key: p.id,
                            class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                          }, [
                            createVNode("td", { class: "px-5 py-4 font-mono text-xs text-slate-600" }, toDisplayString(p.article), 1),
                            createVNode("td", { class: "px-5 py-4" }, [
                              createVNode("div", { class: "h-10 w-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden" }, [
                                productThumb(p) ? (openBlock(), createBlock("img", {
                                  key: 0,
                                  src: productThumb(p),
                                  alt: "",
                                  class: "h-full w-full object-cover",
                                  loading: "lazy"
                                }, null, 8, ["src"])) : createCommentVNode("", true)
                              ])
                            ]),
                            createVNode("td", { class: "px-5 py-4" }, [
                              createVNode("div", { class: "font-semibold text-slate-900" }, toDisplayString(p.name), 1),
                              createVNode("div", { class: "text-[11px] text-slate-500" }, toDisplayString(p.slug), 1),
                              Array.isArray(p.issues) && p.issues.length ? (openBlock(), createBlock("div", {
                                key: 0,
                                class: "mt-1 flex flex-wrap gap-1"
                              }, [
                                p.issues.includes("no_price") ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-red-200 bg-red-50 text-red-800"
                                }, "\u{1F534} \u043D\u0435\u0442 \u0446\u0435\u043D\u044B")) : createCommentVNode("", true),
                                p.issues.includes("no_image") ? (openBlock(), createBlock("span", {
                                  key: 1,
                                  class: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-amber-200 bg-amber-50 text-amber-800"
                                }, "\u{1F7E1} \u043D\u0435\u0442 \u0444\u043E\u0442\u043E")) : createCommentVNode("", true),
                                p.issues.includes("no_category") ? (openBlock(), createBlock("span", {
                                  key: 2,
                                  class: "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] border border-sky-200 bg-sky-50 text-sky-800"
                                }, "\u{1F535} \u043D\u0435\u0442 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438")) : createCommentVNode("", true)
                              ])) : createCommentVNode("", true)
                            ]),
                            createVNode("td", { class: "px-4 py-3" }, [
                              createVNode("div", {
                                class: ["inline-flex items-center gap-2 rounded-lg px-2 py-1", unref(changedCells)[cellKey(p.id, "categoryId")] ? "bg-emerald-50" : ""]
                              }, [
                                ((_a2 = unref(editingCell)) == null ? void 0 : _a2.id) === p.id && unref(editingCell).field === "categoryId" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => isRef(editingValue) ? editingValue.value = $event : null,
                                    class: "px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs",
                                    onChange: onEditBlur,
                                    onBlur: onEditBlur,
                                    onKeydown: onEditKeydown
                                  }, [
                                    createVNode("option", { value: "" }, "\u2014"),
                                    (openBlock(true), createBlock(Fragment, null, renderList(unref(categoryOptions), (c) => {
                                      return openBlock(), createBlock("option", {
                                        key: c.id,
                                        value: c.id,
                                        disabled: c.isRoot
                                      }, toDisplayString(c.level === 1 ? "\u2014 " : "") + toDisplayString(c.name), 9, ["value", "disabled"]);
                                    }), 128))
                                  ], 40, ["onUpdate:modelValue"]), [
                                    [vModelSelect, unref(editingValue)]
                                  ]),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: saveEditClick
                                  }, "\u2714", 40, ["onMousedown"]),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: cancelEditClick
                                  }, "\u2716", 40, ["onMousedown"])
                                ], 64)) : (openBlock(), createBlock("button", {
                                  key: 1,
                                  class: "text-left hover:underline underline-offset-4 text-sm",
                                  title: "\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
                                  onClick: ($event) => startEdit(p, "categoryId")
                                }, toDisplayString(((_b2 = p.category) == null ? void 0 : _b2.name) || "\u2014"), 9, ["onClick"]))
                              ], 2)
                            ]),
                            createVNode("td", { class: "px-4 py-3 text-right tabular-nums" }, [
                              createVNode("div", {
                                class: ["inline-flex items-center justify-end gap-2 rounded-lg px-2 py-1", unref(changedCells)[cellKey(p.id, "price")] ? "bg-emerald-50" : ""]
                              }, [
                                ((_c2 = unref(editingCell)) == null ? void 0 : _c2.id) === p.id && unref(editingCell).field === "price" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  withDirectives(createVNode("input", {
                                    "onUpdate:modelValue": ($event) => isRef(editingValue) ? editingValue.value = $event : null,
                                    class: "w-24 px-2 py-1 rounded-lg border border-gray-200 text-xs text-right",
                                    inputmode: "decimal",
                                    onBlur: onEditBlur,
                                    onKeydown: onEditKeydown
                                  }, null, 40, ["onUpdate:modelValue"]), [
                                    [vModelText, unref(editingValue)]
                                  ]),
                                  createVNode("span", { class: "text-xs text-gray-500" }, "\u20BD"),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: saveEditClick
                                  }, "\u2714", 40, ["onMousedown"]),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: cancelEditClick
                                  }, "\u2716", 40, ["onMousedown"])
                                ], 64)) : (openBlock(), createBlock("button", {
                                  key: 1,
                                  class: "hover:underline underline-offset-4",
                                  title: "\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
                                  onClick: ($event) => startEdit(p, "price")
                                }, toDisplayString(p.price) + " \u20BD ", 9, ["onClick"]))
                              ], 2)
                            ]),
                            createVNode("td", { class: "px-4 py-3" }, [
                              createVNode("span", {
                                class: ["inline-flex items-center px-2 py-1 rounded-lg text-xs border", p.kind === "blank" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200"]
                              }, toDisplayString(p.kind === "blank" ? "\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430" : "\u0433\u043E\u0442\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440"), 3)
                            ]),
                            createVNode("td", { class: "px-4 py-3" }, [
                              createVNode("div", {
                                class: ["inline-flex items-center gap-2 rounded-lg px-2 py-1", unref(changedCells)[cellKey(p.id, "isAvailable")] ? "bg-emerald-50" : ""]
                              }, [
                                ((_d = unref(editingCell)) == null ? void 0 : _d.id) === p.id && unref(editingCell).field === "isAvailable" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => isRef(editingValue) ? editingValue.value = $event : null,
                                    class: "px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs",
                                    onChange: onEditBlur,
                                    onBlur: onEditBlur,
                                    onKeydown: onEditKeydown
                                  }, [
                                    createVNode("option", { value: true }, "\u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438"),
                                    createVNode("option", { value: false }, "\u043D\u0435\u0442")
                                  ], 40, ["onUpdate:modelValue"]), [
                                    [vModelSelect, unref(editingValue)]
                                  ]),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: saveEditClick
                                  }, "\u2714", 40, ["onMousedown"]),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: cancelEditClick
                                  }, "\u2716", 40, ["onMousedown"])
                                ], 64)) : (openBlock(), createBlock("button", {
                                  key: 1,
                                  class: ["inline-flex items-center px-2 py-1 rounded-lg text-xs border hover:opacity-90", p.isAvailable ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-gray-100 text-gray-600 border-gray-200"],
                                  title: "\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
                                  onClick: ($event) => startEdit(p, "isAvailable")
                                }, toDisplayString(p.isAvailable ? "\u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438" : "\u043D\u0435\u0442"), 11, ["onClick"]))
                              ], 2)
                            ]),
                            createVNode("td", { class: "px-4 py-3" }, [
                              createVNode("div", {
                                class: ["inline-flex items-center gap-2 rounded-lg px-2 py-1", unref(changedCells)[cellKey(p.id, "isActive")] ? "bg-emerald-50" : ""]
                              }, [
                                ((_e = unref(editingCell)) == null ? void 0 : _e.id) === p.id && unref(editingCell).field === "isActive" ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                                  withDirectives(createVNode("select", {
                                    "onUpdate:modelValue": ($event) => isRef(editingValue) ? editingValue.value = $event : null,
                                    class: "px-2 py-1 rounded-lg border border-gray-200 bg-white text-xs",
                                    onChange: onEditBlur,
                                    onBlur: onEditBlur,
                                    onKeydown: onEditKeydown
                                  }, [
                                    createVNode("option", { value: true }, "\u0430\u043A\u0442\u0438\u0432\u0435\u043D"),
                                    createVNode("option", { value: false }, "\u0441\u043A\u0440\u044B\u0442")
                                  ], 40, ["onUpdate:modelValue"]), [
                                    [vModelSelect, unref(editingValue)]
                                  ]),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: saveEditClick
                                  }, "\u2714", 40, ["onMousedown"]),
                                  createVNode("button", {
                                    class: "px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-100 text-[11px]",
                                    onMousedown: withModifiers(() => {
                                    }, ["prevent"]),
                                    onClick: cancelEditClick
                                  }, "\u2716", 40, ["onMousedown"])
                                ], 64)) : (openBlock(), createBlock("button", {
                                  key: 1,
                                  class: ["inline-flex items-center px-2 py-1 rounded-lg text-xs border hover:opacity-90", p.isActive !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200"],
                                  title: "\u041D\u0430\u0436\u043C\u0438, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C",
                                  onClick: ($event) => startEdit(p, "isActive")
                                }, toDisplayString(p.isActive !== false ? "\u0430\u043A\u0442\u0438\u0432\u0435\u043D" : "\u0441\u043A\u0440\u044B\u0442"), 11, ["onClick"]))
                              ], 2)
                            ]),
                            createVNode("td", { class: "px-4 py-3 text-right tabular-nums" }, [
                              p.kind === "finished" ? (openBlock(), createBlock("span", { key: 0 }, toDisplayString((_a3 = p.stockQty) != null ? _a3 : 0), 1)) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "text-gray-400"
                              }, "\u2014"))
                            ]),
                            createVNode("td", { class: "px-4 py-3 text-right" }, [
                              createVNode("div", { class: "inline-flex items-center gap-2" }, [
                                createVNode("button", {
                                  class: "px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs",
                                  onClick: ($event) => editProduct(p)
                                }, " \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C ", 8, ["onClick"]),
                                createVNode("button", {
                                  class: "px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs",
                                  onClick: ($event) => cloneProduct(p)
                                }, " \u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C ", 8, ["onClick"]),
                                p.isActive !== false ? (openBlock(), createBlock("button", {
                                  key: 0,
                                  class: "px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs",
                                  onClick: ($event) => setProductActive(p, false)
                                }, " \u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C ", 8, ["onClick"])) : (openBlock(), createBlock("button", {
                                  key: 1,
                                  class: "px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs",
                                  onClick: ($event) => setProductActive(p, true)
                                }, " \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C ", 8, ["onClick"])),
                                !p.archived ? (openBlock(), createBlock("button", {
                                  key: 2,
                                  class: "px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs",
                                  onClick: ($event) => archiveProduct(p.id)
                                }, " \u0412 \u0430\u0440\u0445\u0438\u0432 ", 8, ["onClick"])) : (openBlock(), createBlock("button", {
                                  key: 3,
                                  class: "px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs",
                                  onClick: ($event) => unarchiveProduct(p.id)
                                }, " \u0418\u0437 \u0430\u0440\u0445\u0438\u0432\u0430 ", 8, ["onClick"]))
                              ])
                            ])
                          ]);
                        }), 128)),
                        unref(products).length === 0 ? (openBlock(), createBlock("tr", {
                          key: 0,
                          class: "border-t border-slate-100"
                        }, [
                          createVNode("td", {
                            colspan: "10",
                            class: "px-5 py-12 text-center text-slate-500"
                          }, [
                            createVNode("div", { class: "text-4xl mb-2" }, "\u{1F4E6}"),
                            createVNode("div", null, "\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B")
                          ])
                        ])) : createCommentVNode("", true)
                      ])
                    ])
                  ])
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showCloneModal)) {
        _push(`<div class="fixed inset-0 z-[1100] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/30"></div><div class="relative w-full max-w-2xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"><div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100"><div><div class="text-sm font-semibold">\u041A\u043B\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u043E\u0432\u0430\u0440</div><div class="text-xs text-gray-500"> \u0421\u043E\u0437\u0434\u0430\u0441\u0442\u0441\u044F \u043D\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440-\u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A (\u0441\u043A\u0440\u044B\u0442). Slug \u0438 \u0430\u0440\u0442\u0438\u043A\u0443\u043B \u0433\u0435\u043D\u0435\u0440\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u0437\u0430\u043D\u043E\u0432\u043E. </div>`);
        if (unref(cloneSourceProduct)) {
          _push(`<div class="text-xs text-gray-600 mt-1"> \u0418\u0441\u0442\u043E\u0447\u043D\u0438\u043A: <span class="font-medium">${ssrInterpolate(unref(cloneSourceProduct).name)}</span> (${ssrInterpolate(unref(cloneSourceProduct).article)}) </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button></div><div class="p-4 space-y-4"><div class="rounded-2xl border border-gray-200 p-4"><div class="text-sm font-semibold">\u041A\u0430\u043A\u0438\u0435 \u043F\u043E\u043B\u044F \u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C</div><div class="text-xs text-gray-500 mt-1">\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F \u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u0430 \u2014 \u0431\u0443\u0434\u0435\u0442 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u0432 \u043B\u044E\u0431\u043E\u043C \u0441\u043B\u0443\u0447\u0430\u0435.</div><div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm"><!--[-->`);
        ssrRenderList(["name", "price", "weight", "city", "isAvailable", "kind", "description", "specs"], (k) => {
          _push(`<label class="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(cloneFields)[k]) ? ssrLooseContain(unref(cloneFields)[k], null) : unref(cloneFields)[k]) ? " checked" : ""}><span>${ssrInterpolate(FIELD_LABELS[k] || k)}</span></label>`);
        });
        _push(`<!--]--><label class="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 opacity-80"><input type="checkbox" checked disabled><span>${ssrInterpolate(FIELD_LABELS.categoryId)}</span></label></div></div><div class="rounded-2xl border border-gray-200 p-4"><label class="flex items-center gap-2 text-sm"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(cloneIncludeImages)) ? ssrLooseContain(unref(cloneIncludeImages), null) : unref(cloneIncludeImages)) ? " checked" : ""}><span>\u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0444\u043E\u0442\u043E (\u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u043F\u043E\u0440\u044F\u0434\u043E\u043A)</span></label><div class="text-xs text-gray-500 mt-1">\u0424\u043E\u0442\u043E \u043A\u043E\u043F\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u043A\u0430\u043A \u0437\u0430\u043F\u0438\u0441\u0438 (URL \u0442\u043E\u0442 \u0436\u0435), \u0447\u0442\u043E\u0431\u044B \u0431\u044B\u043B\u043E \u0431\u044B\u0441\u0442\u0440\u043E.</div></div><div class="flex items-center justify-end gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm" type="button">\u041E\u0442\u043C\u0435\u043D\u0430</button><button class="px-3 py-2 rounded-xl bg-black text-white hover:opacity-90 text-sm" type="button">\u041A\u043B\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u0442\u044C</button></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showProductModal)) {
        _push(`<div class="fixed inset-0 z-[1100] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/30"></div><div class="relative w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"><div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100"><div><div class="text-sm font-semibold">${ssrInterpolate(unref(productForm).id ? "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u043E\u0432\u0430\u0440" : "\u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440")}</div><div class="text-xs text-gray-500">\u0412\u0441\u0435 \u043F\u043E\u043B\u044F \u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0440\u0442\u0438\u043D\u043E\u043A \u2014 \u0437\u0434\u0435\u0441\u044C \u0436\u0435. UI \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430 \u0442\u0435\u043F\u0435\u0440\u044C \u0431\u0435\u0437 \u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0444\u043E\u0440\u043C\u044B.</div></div><div class="flex items-center gap-2"><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" type="button"> \u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 </button><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">\u0421\u0431\u0440\u043E\u0441</button><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button></div></div><div class="px-4 pt-3 border-b border-gray-100"><div class="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50 p-1 text-xs"><button type="button" class="${ssrRenderClass([unref(productModalTab) === "edit" ? "bg-white border border-gray-200 shadow-sm" : "hover:bg-gray-100", "px-3 py-1.5 rounded-lg"])}"> \u0414\u0430\u043D\u043D\u044B\u0435 </button><button type="button" class="${ssrRenderClass([unref(productModalTab) === "history" ? "bg-white border border-gray-200 shadow-sm" : "hover:bg-gray-100", "px-3 py-1.5 rounded-lg"])}"> \u0418\u0441\u0442\u043E\u0440\u0438\u044F </button></div></div>`);
        if (unref(productModalTab) === "edit") {
          _push(`<div class="max-h-[75vh] overflow-y-auto p-4 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><div class="grid grid-cols-2 gap-2"><input${ssrRenderAttr("value", unref(productForm).slug)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="slug"><input${ssrRenderAttr("value", unref(productForm).article)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0430\u0440\u0442\u0438\u043A\u0443\u043B"></div><input${ssrRenderAttr("value", unref(productForm).name)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"><div class="grid grid-cols-2 gap-2"><input${ssrRenderAttr("value", unref(productForm).price)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0446\u0435\u043D\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 590.00)"><input${ssrRenderAttr("value", unref(productForm).weight)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0432\u0435\u0441 (\u043A\u0433), \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 0.5"></div><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).categoryId) ? ssrLooseContain(unref(productForm).categoryId, "") : ssrLooseEqual(unref(productForm).categoryId, "")) ? " selected" : ""}>\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F</option><!--[-->`);
          ssrRenderList(unref(categoryOptions), (c) => {
            _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(c.isRoot) ? " disabled" : ""}${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).categoryId) ? ssrLooseContain(unref(productForm).categoryId, c.id) : ssrLooseEqual(unref(productForm).categoryId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.level === 1 ? "\u2014 " : "")}${ssrInterpolate(c.name)}</option>`);
          });
          _push(`<!--]--></select><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).city) ? ssrLooseContain(unref(productForm).city, "") : ssrLooseEqual(unref(productForm).city, "")) ? " selected" : ""}>\u0433\u043E\u0440\u043E\u0434 (\u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D)</option><!--[-->`);
          ssrRenderList(unref(cities), (c) => {
            _push(`<option${ssrRenderAttr("value", c.code)}${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).city) ? ssrLooseContain(unref(productForm).city, c.code) : ssrLooseEqual(unref(productForm).city, c.code)) ? " selected" : ""}>${ssrInterpolate(c.name || c.code)} (${ssrInterpolate(c.code)})</option>`);
          });
          _push(`<!--]--></select><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="finished"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).kind) ? ssrLooseContain(unref(productForm).kind, "finished") : ssrLooseEqual(unref(productForm).kind, "finished")) ? " selected" : ""}>\u0433\u043E\u0442\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440</option><option value="blank"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).kind) ? ssrLooseContain(unref(productForm).kind, "blank") : ssrLooseEqual(unref(productForm).kind, "blank")) ? " selected" : ""}>\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430</option></select><label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).isActive) ? ssrLooseContain(unref(productForm).isActive, null) : unref(productForm).isActive) ? " checked" : ""}><span>\u0410\u043A\u0442\u0438\u0432\u0435\u043D</span></label><label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).isAvailable) ? ssrLooseContain(unref(productForm).isAvailable, null) : unref(productForm).isAvailable) ? " checked" : ""}><span>\u0414\u043E\u0441\u0442\u0443\u043F\u0435\u043D (\u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438)</span></label><label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(createMoreInModal)) ? ssrLooseContain(unref(createMoreInModal), null) : unref(createMoreInModal)) ? " checked" : ""}${ssrIncludeBooleanAttr(!!unref(productForm).id) ? " disabled" : ""}><span>\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0435\u0449\u0451 (\u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0444\u043E\u0440\u043C\u0443)</span></label></div><textarea class="px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[110px] w-full" placeholder="\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435">${ssrInterpolate(unref(productForm).description)}</textarea><div class="rounded-2xl border border-gray-200 p-4"><div class="flex items-start justify-between gap-2"><div><div class="text-sm font-semibold">\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E / \u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438</div><div class="text-xs text-gray-500">\u0420\u0435\u0446\u0435\u043F\u0442 (BOM): \u043A\u0430\u043A\u0438\u0435 \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438 \u043D\u0443\u0436\u043D\u044B \u043D\u0430 1 \u0435\u0434\u0438\u043D\u0438\u0446\u0443 \u0433\u043E\u0442\u043E\u0432\u043E\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u0430.</div></div><div class="${ssrRenderClass([unref(productForm).kind === "finished" ? unref(bomItems).length ? "text-emerald-700" : "text-amber-700" : "text-gray-500", "text-xs"])}">`);
          if (unref(productForm).kind !== "finished") {
            _push(`<!--[-->\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \u0433\u043E\u0442\u043E\u0432\u043E\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u0430<!--]-->`);
          } else {
            _push(`<!--[-->\u0440\u0435\u0446\u0435\u043F\u0442: ${ssrInterpolate(unref(bomItems).length ? "\u0435\u0441\u0442\u044C" : "\u043D\u0435\u0442")}<!--]-->`);
          }
          _push(`</div></div>`);
          if (!unref(productForm).id) {
            _push(`<div class="mt-3 text-xs text-gray-500">\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0438 \u0442\u043E\u0432\u0430\u0440, \u043F\u043E\u0442\u043E\u043C \u043C\u043E\u0436\u043D\u043E \u043F\u0440\u0438\u0432\u044F\u0437\u0430\u0442\u044C \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438.</div>`);
          } else {
            _push(`<div class="mt-3 space-y-3"><div class="flex flex-col sm:flex-row sm:items-center gap-2"><input${ssrRenderAttr("value", unref(blanksQ))} class="px-3 py-2 rounded-xl border border-gray-200 text-sm w-full sm:max-w-[320px]" placeholder="\u043F\u043E\u0438\u0441\u043A \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043E\u043A...">`);
            if (unref(blanksLoading)) {
              _push(`<div class="text-xs text-gray-500">\u0437\u0430\u0433\u0440\u0443\u0436\u0430\u044E...</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
            if (unref(bomError)) {
              _push(`<div class="text-xs text-red-600">${ssrInterpolate(unref(bomError))}</div>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(bomLoading)) {
              _push(`<div class="text-xs text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0440\u0435\u0446\u0435\u043F\u0442\u0430...</div>`);
            } else {
              _push(`<!---->`);
            }
            if (unref(productForm).kind !== "finished") {
              _push(`<div class="text-xs text-gray-500"> \u042D\u0442\u043E\u0442 \u0442\u043E\u0432\u0430\u0440 \u043F\u043E\u043C\u0435\u0447\u0435\u043D \u043A\u0430\u043A \xAB\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430\xBB. \u0420\u0435\u0446\u0435\u043F\u0442 \u0437\u0430\u0434\u0430\u0451\u0442\u0441\u044F \u0442\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F \xAB\u0433\u043E\u0442\u043E\u0432\u043E\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u0430\xBB. </div>`);
            } else {
              _push(`<div class="space-y-2">`);
              if (!unref(bomItems).length) {
                _push(`<div class="text-xs text-gray-500">\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u043F\u043E\u0437\u0438\u0446\u0438\u0439. \u0414\u043E\u0431\u0430\u0432\u044C \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0443 \u043D\u0438\u0436\u0435.</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--[-->`);
              ssrRenderList(unref(bomItems), (row, idx) => {
                _push(`<div class="grid grid-cols-1 md:grid-cols-[1fr_120px_auto] gap-2"><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option${ssrRenderAttr("value", 0)} disabled${ssrIncludeBooleanAttr(Array.isArray(row.componentProductId) ? ssrLooseContain(row.componentProductId, 0) : ssrLooseEqual(row.componentProductId, 0)) ? " selected" : ""}>\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430...</option><!--[-->`);
                ssrRenderList(unref(blankProducts), (bp) => {
                  _push(`<option${ssrRenderAttr("value", bp.id)}${ssrIncludeBooleanAttr(Array.isArray(row.componentProductId) ? ssrLooseContain(row.componentProductId, bp.id) : ssrLooseEqual(row.componentProductId, bp.id)) ? " selected" : ""}>${ssrInterpolate(bp.name)} (${ssrInterpolate(bp.article)}) </option>`);
                });
                _push(`<!--]--></select><input${ssrRenderAttr("value", row.qty)} type="number" min="0.0001" step="0.1" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="qty"><button type="button" class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button></div>`);
              });
              _push(`<!--]--><div class="flex items-center justify-between gap-2 pt-1"><button type="button" class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> + \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0443 </button><div class="text-xs text-gray-500">\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u0435\u0442\u0441\u044F \u0432\u043C\u0435\u0441\u0442\u0435 \u0441 \u0442\u043E\u0432\u0430\u0440\u043E\u043C</div></div></div>`);
            }
            _push(`</div>`);
          }
          _push(`</div><div class="rounded-2xl border border-gray-200 p-4"><div class="flex items-start justify-between gap-2"><div><div class="text-sm font-semibold">\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F</div><div class="text-xs text-gray-500">\u041C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E. \u041F\u0435\u0440\u0432\u0430\u044F \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u043F\u0440\u0435\u0432\u044C\u044E.</div></div>`);
          if (!unref(productForm).id) {
            _push(`<div class="text-xs text-gray-500">\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0441\u043E\u0445\u0440\u0430\u043D\u0438 \u0442\u043E\u0432\u0430\u0440</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="mt-3 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3"><div class="${ssrRenderClass([!unref(productForm).id ? "opacity-60" : "hover:bg-gray-100", "rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-600"])}"><div class="font-medium text-gray-700">Drag &amp; Drop \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0438 \u0441\u044E\u0434\u0430</div><div class="text-xs text-gray-500 mt-1">\u0438\u043B\u0438 \u0432\u044B\u0431\u0435\u0440\u0438 \u0444\u0430\u0439\u043B\u044B \u043A\u043D\u043E\u043F\u043A\u043E\u0439 \u0441\u043F\u0440\u0430\u0432\u0430. \u041F\u0435\u0440\u0432\u0430\u044F \u043A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u2014 \u043F\u0440\u0435\u0432\u044C\u044E.</div></div><div class="flex items-center gap-2"><input type="file" accept="image/*" multiple class="text-xs"${ssrIncludeBooleanAttr(!unref(productForm).id) ? " disabled" : ""}></div></div>`);
          if (unref(orderedProductImages).length) {
            _push(`<div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"><!--[-->`);
            ssrRenderList(unref(orderedProductImages), (img, idx) => {
              _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden" draggable="true"><div class="aspect-square bg-gray-50"><img${ssrRenderAttr("src", imageUrl(img.url))} class="h-full w-full object-cover" loading="lazy"></div><div class="p-2 space-y-2"><div class="flex items-center justify-between gap-2"><span class="text-[11px] text-gray-500">#${ssrInterpolate(idx + 1)}</span>`);
              if (idx === 0) {
                _push(`<span class="text-[11px] px-2 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">\u043F\u0440\u0435\u0432\u044C\u044E</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div><div class="grid grid-cols-2 gap-2"><button class="px-2 py-1 rounded-xl border border-gray-200 hover:bg-gray-100 text-[11px]" type="button"${ssrIncludeBooleanAttr(!unref(productForm).id) ? " disabled" : ""}> \u0417\u0430\u043C\u0435\u043D\u0438\u0442\u044C </button><button class="px-2 py-1 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-[11px]" type="button"${ssrIncludeBooleanAttr(!unref(productForm).id) ? " disabled" : ""}> \u0423\u0434\u0430\u043B\u0438\u0442\u044C </button></div><input${ssrRenderAttr("id", "replace-img-" + img.id)} type="file" accept="image/*" class="hidden"></div></div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3"><div class="text-sm font-semibold">\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 \u0442\u043E\u0432\u0430\u0440\u0430</div><div class="text-xs text-gray-500">\u041F\u0443\u0441\u0442\u044B\u0435 \u043F\u043E\u043B\u044F \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \u0442\u043E\u0432\u0430\u0440\u0430 \u043D\u0435 \u043F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u044E\u0442\u0441\u044F.</div><!--[-->`);
          ssrRenderList(Array.from(new Set(SPEC_FIELDS.map((x) => x.group))), (group) => {
            _push(`<div class="rounded-xl bg-white border border-gray-200 p-3"><div class="text-sm font-medium mb-2">${ssrInterpolate(group)}</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-2"><!--[-->`);
            ssrRenderList(SPEC_FIELDS.filter((x) => x.group === group), (f) => {
              _push(`<div class="space-y-1"><div class="text-[11px] text-gray-600">${ssrInterpolate(f.label)}</div>`);
              if (f.type === "select") {
                _push(`<select class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(specForm)[f.key]) ? ssrLooseContain(unref(specForm)[f.key], "") : ssrLooseEqual(unref(specForm)[f.key], "")) ? " selected" : ""}>\u2014</option><!--[-->`);
                ssrRenderList(f.options || [], (opt) => {
                  _push(`<option${ssrRenderAttr("value", opt)}${ssrIncludeBooleanAttr(Array.isArray(unref(specForm)[f.key]) ? ssrLooseContain(unref(specForm)[f.key], opt) : ssrLooseEqual(unref(specForm)[f.key], opt)) ? " selected" : ""}>${ssrInterpolate(opt)}</option>`);
                });
                _push(`<!--]--></select>`);
              } else {
                _push(`<input${ssrRenderAttr("value", unref(specForm)[f.key])} class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"${ssrRenderAttr("placeholder", f.placeholder || "")}>`);
              }
              _push(`</div>`);
            });
            _push(`<!--]--></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<div class="max-h-[75vh] overflow-y-auto p-4">`);
          if (unref(historyError)) {
            _push(`<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">${ssrInterpolate(unref(historyError))}</div>`);
          } else if (unref(historyLoading)) {
            _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0438\u0441\u0442\u043E\u0440\u0438\u0438\u2026</div>`);
          } else {
            _push(`<div>`);
            if (!unref(productHistory).length) {
              _push(`<div class="text-sm text-gray-500">\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439.</div>`);
            } else {
              _push(`<div class="space-y-2"><!--[-->`);
              ssrRenderList(unref(productHistory), (ev) => {
                var _a2;
                _push(`<div class="rounded-2xl border border-gray-200 bg-white p-3"><div class="flex flex-wrap items-center justify-between gap-2"><div class="text-xs text-gray-500">${ssrInterpolate(new Date(ev.createdAt).toLocaleString())} `);
                if (ev.user) {
                  _push(`<span class="text-gray-600">\xB7 ${ssrInterpolate(ev.user.name)}</span>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div><div class="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">${ssrInterpolate(ev.action)}</div></div>`);
                if ((_a2 = ev == null ? void 0 : ev.meta) == null ? void 0 : _a2.field) {
                  _push(`<div class="mt-2 text-sm"><div class="font-medium text-gray-800">${ssrInterpolate(FIELD_LABELS[ev.meta.field] || ev.meta.field)}</div><div class="mt-1 text-xs text-gray-600 break-all"><span class="text-gray-500">${ssrInterpolate(formatHistoryValue(ev.meta.from))}</span><span class="mx-1">\u2192</span><span class="text-gray-900">${ssrInterpolate(formatHistoryValue(ev.meta.to))}</span></div></div>`);
                } else {
                  _push(`<div class="mt-2 text-sm"><div class="text-xs text-gray-600 break-all">${ssrInterpolate(JSON.stringify(ev.meta || {}))}</div></div>`);
                }
                _push(`</div>`);
              });
              _push(`<!--]--></div>`);
            }
            _push(`</div>`);
          }
          _push(`</div>`);
        }
        if (unref(productModalTab) === "edit") {
          _push(`<div class="p-4 border-t border-gray-100"><button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90"> \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C </button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showPreviewModal)) {
        _push(`<div class="fixed inset-0 z-[1200] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/40"></div><div class="relative w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"><div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100"><div><div class="text-sm font-semibold flex items-center gap-2"> \u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 <span class="text-[11px] px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-600">\u0447\u0435\u0440\u043D\u043E\u0432\u0438\u043A</span></div><div class="text-xs text-gray-500">\u0420\u0435\u043D\u0434\u0435\u0440 \u0438\u0437 \u0442\u0435\u043A\u0443\u0449\u0438\u0445 \u0434\u0430\u043D\u043D\u044B\u0445 \u0444\u043E\u0440\u043C\u044B (\u0434\u0430\u0436\u0435 \u043D\u0435\u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0445).</div></div><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs" type="button">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button></div>`);
        if (unref(previewDraft)) {
          _push(`<div class="max-h-[75vh] overflow-y-auto p-4"><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div>`);
          _push(ssrRenderComponent(_component_ProductGallery, {
            images: unref(previewDraft).images || [],
            alt: unref(previewDraft).name
          }, null, _parent));
          _push(`</div><div class="space-y-4"><h2 class="text-2xl font-semibold">${ssrInterpolate(unref(previewDraft).name)}</h2><div class="text-sm text-gray-500">\u0410\u0440\u0442\u0438\u043A\u0443\u043B: ${ssrInterpolate(unref(previewDraft).article || "\u2014")}</div><div class="flex items-center gap-3">`);
          _push(ssrRenderComponent(_component_ProductAvailabilityBadge, {
            isAvailable: !!unref(previewDraft).isAvailable
          }, null, _parent));
          if (!unref(previewDraft).isActive) {
            _push(`<span class="text-[11px] px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-800">\u043D\u0435 \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          _push(ssrRenderComponent(_component_ProductPriceBlock, {
            retailPrice: (_b = (_a = unref(previewDraft).retailPrice) != null ? _a : unref(previewDraft).price) != null ? _b : 0,
            wholesalePrice: (_c = unref(previewDraft).wholesalePrice) != null ? _c : null
          }, null, _parent));
          if (unref(previewDraft).description) {
            _push(`<div class="prose prose-sm max-w-none"><p class="whitespace-pre-wrap">${ssrInterpolate(unref(previewDraft).description)}</p></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div>`);
        } else {
          _push(`<div class="p-4 text-sm text-gray-500">\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430.</div>`);
        }
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "categories") {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="flex items-start justify-between gap-3"><div><div class="text-sm font-semibold">${ssrInterpolate(unref(catForm).id ? "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044E" : "\u041D\u043E\u0432\u0430\u044F \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F")}</div><div class="text-xs text-gray-500">\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0431\u043B\u043E\u043A\u0438\u0440\u0443\u0435\u0442\u0441\u044F, \u0435\u0441\u043B\u0438 \u0432\u043D\u0443\u0442\u0440\u0438 \u0435\u0441\u0442\u044C \u0442\u043E\u0432\u0430\u0440\u044B.</div></div><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u0421\u0431\u0440\u043E\u0441 </button></div><div class="mt-4 space-y-3"><input${ssrRenderAttr("value", unref(catForm).slug)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="slug"><input${ssrRenderAttr("value", unref(catForm).name)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"><div class="rounded-xl border border-gray-200 p-3"><div class="flex items-center justify-between gap-3"><div><div class="text-xs font-semibold text-gray-700">\u041A\u0430\u0440\u0442\u0438\u043D\u043A\u0430 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438</div><div class="text-[11px] text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0436\u0430\u0435\u0442\u0441\u044F \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E \u0432 backend/uploads/static/categories</div></div><input type="file" accept="image/*" class="text-xs"></div><div class="mt-2 flex items-center gap-3"><div class="h-12 w-20 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">`);
        if (unref(catForm).imageUrl) {
          _push(`<img${ssrRenderAttr("src", imageUrl(unref(catForm).imageUrl))} class="h-full w-full object-cover">`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><input${ssrRenderAttr("value", unref(catForm).imageUrl)} class="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs" placeholder="/uploads/static/categories/..."></div></div><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(catForm).parentId) ? ssrLooseContain(unref(catForm).parentId, null) : ssrLooseEqual(unref(catForm).parentId, null)) ? " selected" : ""}>\u0420\u043E\u0434\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0430\u044F \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F: \u043D\u0435\u0442 (\u043A\u043E\u0440\u043D\u0435\u0432\u0430\u044F)</option><!--[-->`);
        ssrRenderList(unref(roots), (r) => {
          _push(`<option${ssrRenderAttr("value", r.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(catForm).parentId) ? ssrLooseContain(unref(catForm).parentId, r.id) : ssrLooseEqual(unref(catForm).parentId, r.id)) ? " selected" : ""}>\u0420\u043E\u0434\u0438\u0442\u0435\u043B\u044C: ${ssrInterpolate(r.name)}</option>`);
        });
        _push(`<!--]--></select><div class="grid grid-cols-2 gap-2"><input${ssrRenderAttr("value", unref(catForm).sortOrder)} type="number" class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u043F\u043E\u0440\u044F\u0434\u043E\u043A"><label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(catForm).isActive) ? ssrLooseContain(unref(catForm).isActive, null) : unref(catForm).isActive) ? " checked" : ""}><span>\u0410\u043A\u0442\u0438\u0432\u043D\u0430</span></label></div><textarea class="px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[90px]" placeholder="\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435">${ssrInterpolate(unref(catForm).description)}</textarea><button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90"> \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C </button></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F</th><th class="text-left px-4 py-3">Slug</th><th class="text-right px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(categoryOptions), (opt) => {
          var _a2, _b2, _c2, _d, _e, _f, _g, _h;
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3"><div class="${ssrRenderClass([opt.level === 1 ? "pl-4 text-gray-900" : "", "font-medium"])}">${ssrInterpolate(opt.level === 1 ? "\u21B3" : "")} ${ssrInterpolate((_a2 = unref(categoryById)[opt.id]) == null ? void 0 : _a2.name)}</div>`);
          if ((_b2 = unref(categoryById)[opt.id]) == null ? void 0 : _b2.parent) {
            _push(`<div class="text-xs text-gray-500"> \u041F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F: ${ssrInterpolate((_d = (_c2 = unref(categoryById)[opt.id]) == null ? void 0 : _c2.parent) == null ? void 0 : _d.name)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_e = unref(categoryById)[opt.id]) == null ? void 0 : _e.description) {
            _push(`<div class="text-xs text-gray-500">${ssrInterpolate((_f = unref(categoryById)[opt.id]) == null ? void 0 : _f.description)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (((_g = unref(categoryById)[opt.id]) == null ? void 0 : _g.isActive) === false) {
            _push(`<div class="text-[11px] text-gray-400">\u043D\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u0430</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 font-mono text-xs text-gray-600">${ssrInterpolate((_h = unref(categoryById)[opt.id]) == null ? void 0 : _h.slug)}</td><td class="px-4 py-3 text-right"><div class="inline-flex gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C </button><button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C </button></div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(categories).length === 0) {
          _push(`<tr class="border-t border-gray-100"><td colspan="3" class="px-4 py-8 text-center text-gray-500">\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0439 \u043D\u0435\u0442</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "cities") {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="flex items-start justify-between gap-3"><div><div class="text-sm font-semibold">\u0413\u043E\u0440\u043E\u0434\u0430</div><div class="text-xs text-gray-500">\u042D\u0442\u0438 \u0433\u043E\u0440\u043E\u0434\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0432 \u0432\u044B\u0431\u043E\u0440\u0435 \u0433\u043E\u0440\u043E\u0434\u0430 \u0438 \u0432 \u043F\u043E\u043B\u0435 \xAB\u0433\u043E\u0440\u043E\u0434\xBB \u0443 \u0442\u043E\u0432\u0430\u0440\u0430.</div></div></div><div class="mt-4 space-y-2"><div class="grid grid-cols-3 gap-2"><input${ssrRenderAttr("value", unref(cityForm).code)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="BIR"><input${ssrRenderAttr("value", unref(cityForm).regionCode)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="79"><input${ssrRenderAttr("value", unref(cityForm).name)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0411\u0438\u0440\u043E\u0431\u0438\u0434\u0436\u0430\u043D"></div><button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90"> \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C / \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button><div class="text-[11px] text-gray-500">\u0412\u0438\u0442\u0440\u0438\u043D\u0435 \u043D\u0443\u0436\u0435\u043D \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u043E\u0434\u0438\u043D \u0433\u043E\u0440\u043E\u0434 (\u0435\u0441\u043B\u0438 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0432\u0441\u0435 \u2014 \u0431\u0443\u0434\u0435\u0442 \u0441\u043E\u0437\u0434\u0430\u043D \u0434\u0435\u0444\u043E\u043B\u0442\u043D\u044B\u0439).</div></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u041A\u043E\u0434</th><th class="text-left px-4 py-3">\u0420\u0435\u0433\u0438\u043E\u043D</th><th class="text-left px-4 py-3">\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435</th><th class="text-right px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(cities), (c) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3 font-mono text-xs text-gray-600">${ssrInterpolate(c.code)}</td><td class="px-4 py-3 font-mono text-xs text-gray-600">${ssrInterpolate(c.regionCode || "")}</td><td class="px-4 py-3"><div class="font-medium">${ssrInterpolate(c.name || c.code)}</div></td><td class="px-4 py-3 text-right"><button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C </button></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(cities).length === 0) {
          _push(`<tr class="border-t border-gray-100"><td colspan="4" class="px-4 py-8 text-center text-gray-500">\u0413\u043E\u0440\u043E\u0434\u043E\u0432 \u043D\u0435\u0442</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/catalog.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=catalog-CK8Oj0za.mjs.map
