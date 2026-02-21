import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminButton",
  __ssrInlineRender: true,
  props: {
    variant: {},
    size: {},
    loading: { type: Boolean },
    disabled: { type: Boolean },
    icon: {}
  },
  setup(__props) {
    const props = __props;
    const classes = computed(() => {
      const base = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
      const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2.5 text-sm",
        lg: "px-5 py-3 text-base"
      };
      const variants = {
        primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 shadow-sm",
        secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-slate-300 shadow-sm",
        danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
        ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-300"
      };
      const disabled = props.disabled || props.loading ? "opacity-50 cursor-not-allowed" : "";
      return [base, sizes[props.size || "md"], variants[props.variant || "secondary"], disabled].join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<button${ssrRenderAttrs(mergeProps({
        class: classes.value,
        disabled: __props.disabled || __props.loading
      }, _attrs))}>`);
      if (__props.loading) {
        _push(`<svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>`);
      } else if (__props.icon) {
        _push(`<span class="text-base">${ssrInterpolate(__props.icon)}</span>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</button>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AdminButton.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=AdminButton-CPhKfHoR.mjs.map
