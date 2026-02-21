import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
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
    const categories = ref([]);
    const products = ref([]);
    const productImages = ref([]);
    const warehouses = ref([]);
    const cityForm = ref({ code: "", regionCode: "", name: "" });
    const q = ref("");
    const categoryId = ref("");
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
    const createMoreInModal = ref(false);
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
          query: cityCode ? { city: cityCode } : void 0
        });
        if (res == null ? void 0 : res.article) {
          productForm.value.article = String(res.article);
          lastAutoArticle.value = String(res.article);
        }
      } catch {
      }
    }
    watch(() => productForm.value.city, (city) => fetchAutoArticle(city));
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
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u0410\u0434\u043C\u0438\u043D\u043A\u0430 \u2014 \u043A\u0430\u0442\u0430\u043B\u043E\u0433</h1><p class="text-sm text-gray-600 mt-1">\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438, \u0442\u043E\u0432\u0430\u0440\u044B, \u0446\u0435\u043D\u044B \u0438 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F (\u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u0435 \u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435)</p></div><div class="flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center gap-2"><button class="${ssrRenderClass([unref(tab) === "products" ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50 hover:bg-gray-100", "px-3 py-2 rounded-xl border text-sm"])}"> \u0422\u043E\u0432\u0430\u0440\u044B </button><button class="${ssrRenderClass([unref(tab) === "categories" ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50 hover:bg-gray-100", "px-3 py-2 rounded-xl border text-sm"])}"> \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 </button><button class="${ssrRenderClass([unref(tab) === "cities" ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50 hover:bg-gray-100", "px-3 py-2 rounded-xl border text-sm"])}"> \u0413\u043E\u0440\u043E\u0434\u0430 </button></div>`);
      if (unref(tab) === "products") {
        _push(`<div class="space-y-4"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="flex flex-col sm:flex-row sm:items-center gap-2"><input${ssrRenderAttr("value", unref(q))} class="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u043F\u043E\u0438\u0441\u043A: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 / \u0430\u0440\u0442\u0438\u043A\u0443\u043B / slug"><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(categoryId)) ? ssrLooseContain(unref(categoryId), "") : ssrLooseEqual(unref(categoryId), "")) ? " selected" : ""}>\u0432\u0441\u0435 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438</option><!--[-->`);
        ssrRenderList(unref(categoryOptions), (c) => {
          _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(categoryId)) ? ssrLooseContain(unref(categoryId), c.id) : ssrLooseEqual(unref(categoryId), c.id)) ? " selected" : ""}>${ssrInterpolate(c.level === 1 ? "\u2014 " : "")}${ssrInterpolate(c.name)}</option>`);
        });
        _push(`<!--]--></select><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041D\u0430\u0439\u0442\u0438 </button><button class="px-3 py-2 rounded-xl bg-sky-600 text-white hover:opacity-90 text-sm"> \u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440 </button></div></div>`);
        if (unref(loading)) {
          _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
        } else {
          _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-gray-600"><tr><th class="text-left font-semibold px-4 py-3">SKU/\u0430\u0440\u0442\u0438\u043A\u0443\u043B</th><th class="text-left font-semibold px-4 py-3">\u0424\u043E\u0442\u043E</th><th class="text-left font-semibold px-4 py-3">\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435</th><th class="text-left font-semibold px-4 py-3">\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F</th><th class="text-right font-semibold px-4 py-3">\u0426\u0435\u043D\u0430</th><th class="text-left font-semibold px-4 py-3">\u0412\u0438\u0434</th><th class="text-left font-semibold px-4 py-3">\u0410\u043A\u0442\u0438\u0432\u0435\u043D</th><th class="text-right font-semibold px-4 py-3">\u041E\u0441\u0442\u0430\u0442\u043E\u043A</th><th class="text-right font-semibold px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(products), (p) => {
            var _a2;
            var _a;
            _push(`<tr class="border-t border-gray-100 hover:bg-gray-50"><td class="px-4 py-3 font-mono text-xs">${ssrInterpolate(p.article)}</td><td class="px-4 py-3"><div class="h-10 w-10 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden">`);
            if (productThumb(p)) {
              _push(`<img${ssrRenderAttr("src", productThumb(p))} alt="" class="h-full w-full object-cover" loading="lazy">`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></td><td class="px-4 py-3"><div class="font-semibold">${ssrInterpolate(p.name)}</div><div class="text-[11px] text-gray-500">${ssrInterpolate(p.slug)}</div></td><td class="px-4 py-3">${ssrInterpolate(((_a = p.category) == null ? void 0 : _a.name) || "\u2014")}</td><td class="px-4 py-3 text-right tabular-nums">${ssrInterpolate(p.price)} \u20BD</td><td class="px-4 py-3"><span class="${ssrRenderClass([p.kind === "blank" ? "bg-amber-50 text-amber-800 border-amber-200" : "bg-emerald-50 text-emerald-800 border-emerald-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(p.kind === "blank" ? "\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430" : "\u0433\u043E\u0442\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440")}</span></td><td class="px-4 py-3"><span class="${ssrRenderClass([p.isActive !== false ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-600 border-gray-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(p.isActive !== false ? "\u0430\u043A\u0442\u0438\u0432\u0435\u043D" : "\u0441\u043A\u0440\u044B\u0442")}</span></td><td class="px-4 py-3 text-right tabular-nums">`);
            if (p.kind === "finished") {
              _push(`<span>${ssrInterpolate((_a2 = p.stockQty) != null ? _a2 : 0)}</span>`);
            } else {
              _push(`<span class="text-gray-400">\u2014</span>`);
            }
            _push(`</td><td class="px-4 py-3 text-right"><div class="inline-flex items-center gap-2"><button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C </button><button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C </button>`);
            if (p.isActive !== false) {
              _push(`<button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C </button>`);
            } else {
              _push(`<button class="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"> \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C </button>`);
            }
            _push(`</div></td></tr>`);
          });
          _push(`<!--]-->`);
          if (unref(products).length === 0) {
            _push(`<tr class="border-t border-gray-100"><td colspan="9" class="px-4 py-10 text-center text-gray-500">\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</tbody></table></div></div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showProductModal)) {
        _push(`<div class="fixed inset-0 z-[1100] flex items-center justify-center p-4"><div class="absolute inset-0 bg-black/30"></div><div class="relative w-full max-w-5xl rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"><div class="flex items-start justify-between gap-3 p-4 border-b border-gray-100"><div><div class="text-sm font-semibold">${ssrInterpolate(unref(productForm).id ? "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u043E\u0432\u0430\u0440" : "\u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440")}</div><div class="text-xs text-gray-500">\u0412\u0441\u0435 \u043F\u043E\u043B\u044F \u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u0430\u0440\u0442\u0438\u043D\u043E\u043A \u2014 \u0437\u0434\u0435\u0441\u044C \u0436\u0435. UI \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430 \u0442\u0435\u043F\u0435\u0440\u044C \u0431\u0435\u0437 \u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0444\u043E\u0440\u043C\u044B.</div></div><div class="flex items-center gap-2"><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">\u0421\u0431\u0440\u043E\u0441</button><button class="px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button></div></div><div class="max-h-[75vh] overflow-y-auto p-4 space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><div class="grid grid-cols-2 gap-2"><input${ssrRenderAttr("value", unref(productForm).slug)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="slug"><input${ssrRenderAttr("value", unref(productForm).article)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0430\u0440\u0442\u0438\u043A\u0443\u043B"></div><input${ssrRenderAttr("value", unref(productForm).name)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435"><div class="grid grid-cols-2 gap-2"><input${ssrRenderAttr("value", unref(productForm).price)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0446\u0435\u043D\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 590.00)"><input${ssrRenderAttr("value", unref(productForm).weight)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0432\u0435\u0441 (\u043A\u0433), \u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 0.5"></div><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="" disabled${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).categoryId) ? ssrLooseContain(unref(productForm).categoryId, "") : ssrLooseEqual(unref(productForm).categoryId, "")) ? " selected" : ""}>\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F</option><!--[-->`);
        ssrRenderList(unref(categoryOptions), (c) => {
          _push(`<option${ssrRenderAttr("value", c.id)}${ssrIncludeBooleanAttr(c.isRoot) ? " disabled" : ""}${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).categoryId) ? ssrLooseContain(unref(productForm).categoryId, c.id) : ssrLooseEqual(unref(productForm).categoryId, c.id)) ? " selected" : ""}>${ssrInterpolate(c.level === 1 ? "\u2014 " : "")}${ssrInterpolate(c.name)}</option>`);
        });
        _push(`<!--]--></select><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).city) ? ssrLooseContain(unref(productForm).city, "") : ssrLooseEqual(unref(productForm).city, "")) ? " selected" : ""}>\u0433\u043E\u0440\u043E\u0434 (\u043D\u0435 \u0443\u043A\u0430\u0437\u0430\u043D)</option><!--[-->`);
        ssrRenderList(unref(warehouses), (w) => {
          _push(`<option${ssrRenderAttr("value", w.code)}${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).city) ? ssrLooseContain(unref(productForm).city, w.code) : ssrLooseEqual(unref(productForm).city, w.code)) ? " selected" : ""}>${ssrInterpolate(w.name || w.code)} (${ssrInterpolate(w.code)})</option>`);
        });
        _push(`<!--]--></select><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="finished"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).kind) ? ssrLooseContain(unref(productForm).kind, "finished") : ssrLooseEqual(unref(productForm).kind, "finished")) ? " selected" : ""}>\u0433\u043E\u0442\u043E\u0432\u044B\u0439 \u0442\u043E\u0432\u0430\u0440</option><option value="blank"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).kind) ? ssrLooseContain(unref(productForm).kind, "blank") : ssrLooseEqual(unref(productForm).kind, "blank")) ? " selected" : ""}>\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0430</option></select><label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).isActive) ? ssrLooseContain(unref(productForm).isActive, null) : unref(productForm).isActive) ? " checked" : ""}><span>\u0410\u043A\u0442\u0438\u0432\u0435\u043D</span></label><label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(productForm).isAvailable) ? ssrLooseContain(unref(productForm).isAvailable, null) : unref(productForm).isAvailable) ? " checked" : ""}><span>\u0414\u043E\u0441\u0442\u0443\u043F\u0435\u043D (\u0432 \u043D\u0430\u043B\u0438\u0447\u0438\u0438)</span></label><label class="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(createMoreInModal)) ? ssrLooseContain(unref(createMoreInModal), null) : unref(createMoreInModal)) ? " checked" : ""}${ssrIncludeBooleanAttr(!!unref(productForm).id) ? " disabled" : ""}><span>\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0435\u0449\u0451 (\u043F\u043E\u0441\u043B\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u043E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0444\u043E\u0440\u043C\u0443)</span></label></div><textarea class="px-3 py-2 rounded-xl border border-gray-200 text-sm min-h-[110px] w-full" placeholder="\u043E\u043F\u0438\u0441\u0430\u043D\u0438\u0435">${ssrInterpolate(unref(productForm).description)}</textarea><div class="rounded-2xl border border-gray-200 p-4"><div class="flex items-start justify-between gap-2"><div><div class="text-sm font-semibold">\u0418\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F</div><div class="text-xs text-gray-500">\u041C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E. \u041F\u0435\u0440\u0432\u0430\u044F \u2014 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0435\u0442\u0441\u044F \u043A\u0430\u043A \u043F\u0440\u0435\u0432\u044C\u044E.</div></div>`);
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
        _push(`<!--]--></div></div><div class="p-4 border-t border-gray-100"><button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90"> \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C </button></div></div></div>`);
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
          var _a, _b, _c, _d, _e, _f, _g, _h;
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3"><div class="${ssrRenderClass([opt.level === 1 ? "pl-4 text-gray-900" : "", "font-medium"])}">${ssrInterpolate(opt.level === 1 ? "\u21B3" : "")} ${ssrInterpolate((_a = unref(categoryById)[opt.id]) == null ? void 0 : _a.name)}</div>`);
          if ((_b = unref(categoryById)[opt.id]) == null ? void 0 : _b.parent) {
            _push(`<div class="text-xs text-gray-500"> \u041F\u043E\u0434\u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F: ${ssrInterpolate((_d = (_c = unref(categoryById)[opt.id]) == null ? void 0 : _c.parent) == null ? void 0 : _d.name)}</div>`);
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
        _push(`<div class="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="flex items-start justify-between gap-3"><div><div class="text-sm font-semibold">\u0413\u043E\u0440\u043E\u0434\u0430 (\u0441\u043A\u043B\u0430\u0434\u044B)</div><div class="text-xs text-gray-500">\u042D\u0442\u0438 \u0433\u043E\u0440\u043E\u0434\u0430 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0432 \u0432\u044B\u0431\u043E\u0440\u0435 \u0433\u043E\u0440\u043E\u0434\u0430 \u0438 \u0432 \u043F\u043E\u043B\u0435 \xAB\u0433\u043E\u0440\u043E\u0434\xBB \u0443 \u0442\u043E\u0432\u0430\u0440\u0430.</div></div></div><div class="mt-4 space-y-2"><div class="grid grid-cols-3 gap-2"><input${ssrRenderAttr("value", unref(cityForm).code)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="BIR"><input${ssrRenderAttr("value", unref(cityForm).regionCode)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="79"><input${ssrRenderAttr("value", unref(cityForm).name)} class="px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="\u0411\u0438\u0440\u043E\u0431\u0438\u0434\u0436\u0430\u043D"></div><button class="w-full px-3 py-2 rounded-xl bg-sky-600 text-white text-sm hover:opacity-90"> \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C / \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button><div class="text-[11px] text-gray-500">\u0411\u0430\u0437\u043E\u0432\u044B\u0439 \u0441\u043A\u043B\u0430\u0434 (MAIN) \u043B\u0443\u0447\u0448\u0435 \u043D\u0435 \u0443\u0434\u0430\u043B\u044F\u0442\u044C \u2014 \u0432\u0438\u0442\u0440\u0438\u043D\u0435 \u043D\u0443\u0436\u0435\u043D \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u043E\u0434\u0438\u043D.</div></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u041A\u043E\u0434</th><th class="text-left px-4 py-3">\u0420\u0435\u0433\u0438\u043E\u043D</th><th class="text-left px-4 py-3">\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435</th><th class="text-right px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(warehouses), (w) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3 font-mono text-xs text-gray-600">${ssrInterpolate(w.code)}</td><td class="px-4 py-3 font-mono text-xs text-gray-600">${ssrInterpolate(w.regionCode || "")}</td><td class="px-4 py-3"><div class="font-medium">${ssrInterpolate(w.name || w.code)}</div></td><td class="px-4 py-3 text-right"><button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs"> \u0423\u0434\u0430\u043B\u0438\u0442\u044C </button></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(warehouses).length === 0) {
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/catalog.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=catalog-DfXFvUfj.mjs.map
