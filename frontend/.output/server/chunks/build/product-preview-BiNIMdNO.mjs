import { _ as _sfc_main$1, a as _sfc_main$3 } from './ProductAvailabilityBadge-Dp6_CtFm.mjs';
import { _ as _sfc_main$2 } from './ProductPriceBlock-DEFQ0tZW.mjs';
import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from 'vue';
import { b as useRoute, u as useRuntimeConfig } from './server.mjs';
import { u as useHead } from './index-CCqbQxu4.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
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
  __name: "product-preview",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    useHead({
      title: "\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u0432\u0430\u0440\u0430",
      meta: [
        { name: "robots", content: "noindex, nofollow, noarchive" }
      ]
    });
    const draft = ref(null);
    const loadError = ref(null);
    function imageUrl(url) {
      const u = String(url || "");
      if (!u) return "";
      if (u.startsWith("http://") || u.startsWith("https://")) return u;
      return `${apiBaseUrl}${u}`;
    }
    const images = computed(() => {
      var _a;
      const list = ((_a = draft.value) == null ? void 0 : _a.images) || [];
      const sorted = [...list].sort((a, b) => {
        var _a2, _b;
        return Number((_a2 = a.sortOrder) != null ? _a2 : 0) - Number((_b = b.sortOrder) != null ? _b : 0);
      });
      return sorted.map((x) => ({ ...x, url: imageUrl(x.url) }));
    });
    const retailPrice = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = draft.value) == null ? void 0 : _a.retailPrice) != null ? _a2 : null;
    });
    const wholesalePrice = computed(() => {
      var _a2;
      var _a;
      return (_a2 = (_a = draft.value) == null ? void 0 : _a.wholesalePrice) != null ? _a2 : null;
    });
    const isAvailable = computed(() => {
      var _a;
      return !!((_a = draft.value) == null ? void 0 : _a.isAvailable);
    });
    const specsRows = computed(() => {
      var _a;
      const s = ((_a = draft.value) == null ? void 0 : _a.specs) || null;
      const entries = s ? Object.entries(s) : [];
      return entries.filter(([_, v]) => String(v || "").trim()).map(([k, v]) => ({ key: k, label: k, value: String(v) }));
    });
    const quickSpecs = computed(() => specsRows.value.slice(0, 6));
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProductGallery = _sfc_main$1;
      const _component_ProductPriceBlock = _sfc_main$2;
      const _component_ProductAvailabilityBadge = _sfc_main$3;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><div class="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><div class="font-semibold">\u041F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 (\u043D\u0435 \u043F\u0443\u0431\u043B\u0438\u0447\u043D\u043E)</div><div class="text-xs text-amber-800/80">\u0420\u0435\u043D\u0434\u0435\u0440\u0438\u0442\u0441\u044F \u0438\u0437 \u0442\u0435\u043A\u0443\u0449\u0438\u0445 \u0434\u0430\u043D\u043D\u044B\u0445 \u0444\u043E\u0440\u043C\u044B, \u0434\u0430\u0436\u0435 \u0435\u0441\u043B\u0438 \u0442\u044B \u0438\u0445 \u0435\u0449\u0451 \u043D\u0435 \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u043B.</div></div>`);
      if (unref(loadError)) {
        _push(`<section class="text-sm text-gray-600">${ssrInterpolate(unref(loadError))}</section>`);
      } else if (!unref(draft)) {
        _push(`<section class="text-sm text-gray-600"> \u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0430... </section>`);
      } else {
        _push(`<section class="space-y-4"><div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_340px] items-start">`);
        _push(ssrRenderComponent(_component_ProductGallery, {
          images: unref(images),
          alt: unref(draft).name
        }, null, _parent));
        _push(`<div class="space-y-4"><header class="space-y-2"><h1 class="text-xl font-semibold leading-snug">${ssrInterpolate(unref(draft).name)}</h1><div class="flex flex-wrap items-center gap-2 text-xs text-gray-500">`);
        if (unref(draft).article) {
          _push(`<span>\u0410\u0440\u0442: ${ssrInterpolate(unref(draft).article)}</span>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(draft).category) {
          _push(`<span>\xB7 ${ssrInterpolate(unref(draft).category.name)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></header>`);
        if (unref(quickSpecs).length) {
          _push(`<div class="rounded-2xl border border-gray-200 bg-white"><div class="px-4 py-3 border-b border-gray-100 flex items-center justify-between"><div class="text-sm font-semibold">\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438</div></div><div class="px-4 py-2"><!--[-->`);
          ssrRenderList(unref(quickSpecs), (row) => {
            _push(`<div class="grid grid-cols-2 gap-3 py-2 text-sm border-b border-gray-100 last:border-b-0"><div class="text-gray-500">${ssrInterpolate(row.label)}</div><div class="text-right font-medium text-gray-900">${ssrInterpolate(row.value)}</div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><aside class="lg:sticky lg:top-4"><div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3"><div class="flex items-center justify-between gap-3">`);
        _push(ssrRenderComponent(_component_ProductPriceBlock, {
          "retail-price": unref(retailPrice),
          "wholesale-price": unref(wholesalePrice),
          mode: "retail"
        }, null, _parent));
        _push(ssrRenderComponent(_component_ProductAvailabilityBadge, { "is-available": unref(isAvailable) }, null, _parent));
        _push(`</div><div class="text-xs text-gray-500"> \u0412 \u043F\u0440\u0435\u0434\u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435 \u043A\u043D\u043E\u043F\u043A\u0438 \u043F\u043E\u043A\u0443\u043F\u043A\u0438 \u0441\u043A\u0440\u044B\u0442\u044B. </div></div></aside></div><section class="rounded-2xl border border-gray-200 bg-white"><div class="px-4 pt-4 pb-3 border-b border-gray-100 text-sm font-semibold">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435</div><div class="p-4"><div class="text-sm text-gray-800 whitespace-pre-line leading-relaxed">`);
        if (unref(draft).description) {
          _push(`<span>${ssrInterpolate(unref(draft).description)}</span>`);
        } else {
          _push(`<span class="text-gray-500">\u041E\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442</span>`);
        }
        _push(`</div></div></section>`);
        if (unref(specsRows).length) {
          _push(`<section class="rounded-2xl border border-gray-200 bg-white"><div class="px-4 pt-4 pb-3 border-b border-gray-100 text-sm font-semibold">\u0425\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438</div><div class="p-4"><dl class="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white"><!--[-->`);
          ssrRenderList(unref(specsRows), (row) => {
            _push(`<div class="grid grid-cols-2 gap-3 px-3 py-2 text-sm"><dt class="text-gray-500">${ssrInterpolate(row.label)}</dt><dd class="font-medium text-gray-900 text-right">${ssrInterpolate(row.value)}</dd></div>`);
          });
          _push(`<!--]--></dl></div></section>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</section>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/product-preview.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=product-preview-BiNIMdNO.mjs.map
