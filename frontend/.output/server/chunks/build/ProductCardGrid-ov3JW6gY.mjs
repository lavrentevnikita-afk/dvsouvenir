import { a as _sfc_main$1 } from './ProductCard-C9CGbHDp.mjs';
import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProductCardGrid",
  __ssrInlineRender: true,
  props: {
    products: {},
    view: {},
    mode: {},
    prefetch: { type: Boolean }
  },
  setup(__props) {
    const props = __props;
    const v = computed(() => {
      var _a;
      return (_a = props.view) != null ? _a : "medium";
    });
    const gridClass = computed(() => {
      if (v.value === "large") return "grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
      return "grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-5";
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProductCard = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: unref(gridClass) }, _attrs))}><!--[-->`);
      ssrRenderList(__props.products, (p) => {
        _push(ssrRenderComponent(_component_ProductCard, {
          key: p.id,
          product: p,
          mode: __props.mode,
          prefetch: __props.prefetch,
          view: unref(v)
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductCardGrid.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ProductCardGrid-ov3JW6gY.mjs.map
