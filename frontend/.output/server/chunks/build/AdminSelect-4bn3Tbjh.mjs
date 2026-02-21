import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminSelect",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    options: {},
    placeholder: {}
  },
  emits: ["update:modelValue"],
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<select${ssrRenderAttrs(mergeProps({
        value: __props.modelValue,
        class: "px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all cursor-pointer"
      }, _attrs))}>`);
      if (__props.placeholder) {
        _push(`<option value="">${ssrInterpolate(__props.placeholder)}</option>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(__props.options, (opt) => {
        _push(`<option${ssrRenderAttr("value", opt.value)}>${ssrInterpolate(opt.icon ? opt.icon + " " : "")}${ssrInterpolate(opt.label)}</option>`);
      });
      _push(`<!--]--></select>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AdminSelect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=AdminSelect-4bn3Tbjh.mjs.map
