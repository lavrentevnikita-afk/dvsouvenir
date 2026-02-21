import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProductPriceBlock",
  __ssrInlineRender: true,
  props: {
    retailPrice: {},
    wholesalePrice: {},
    compact: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const retail = computed(() => Number(props.retailPrice));
    const wholesale = computed(() => props.wholesalePrice == null ? null : Number(props.wholesalePrice));
    const nf = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });
    const format = (v) => {
      if (v == null || !Number.isFinite(v)) return null;
      return `${nf.format(Math.round(v))}\u202F\u20BD`;
    };
    const wholesaleText = computed(() => format(wholesale.value));
    const retailText = computed(() => format(retail.value));
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["space-y-0.5", __props.compact ? "text-xs" : ""]
      }, _attrs))}>`);
      if (unref(wholesaleText)) {
        _push(`<!--[--><div class="flex items-center gap-2"><p class="${ssrRenderClass([__props.compact ? "text-base" : "text-lg", "font-semibold text-gray-900"])}">${ssrInterpolate(unref(wholesaleText))}</p><span class="text-xs font-semibold text-gray-600">\u041E\u043F\u0442</span><span class="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-200 text-[10px] text-gray-500" title="\u041E\u043F\u0442\u043E\u0432\u0430\u044F \u0446\u0435\u043D\u0430"> i </span></div><div class="flex items-baseline gap-2"><span class="text-xs text-gray-500">\u0420\u043E\u0437\u043D\u0438\u0447\u043D\u0430\u044F \u0446\u0435\u043D\u0430</span><span class="text-xs text-gray-700">${ssrInterpolate((_a = unref(retailText)) != null ? _a : "\u2014")}</span></div><!--]-->`);
      } else {
        _push(`<div class="flex items-center gap-2"><p class="${ssrRenderClass([__props.compact ? "text-base" : "text-lg", "font-semibold text-gray-900"])}">${ssrInterpolate((_b = unref(retailText)) != null ? _b : "\u2014")}</p></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductPriceBlock.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ProductPriceBlock-DEFQ0tZW.mjs.map
