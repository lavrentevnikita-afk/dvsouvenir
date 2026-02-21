import { defineComponent, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrInterpolate, ssrRenderDynamicModel, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "BaseInput",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    type: { default: "text" },
    label: {},
    placeholder: {},
    error: {},
    hint: {},
    disabled: { type: Boolean, default: false },
    required: { type: Boolean, default: false }
  },
  emits: ["update:modelValue", "blur"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    let idCounter = 0;
    const inputId = `input-${++idCounter}`;
    const localValue = computed({
      get: () => props.modelValue,
      set: (value) => emit("update:modelValue", value)
    });
    const inputClasses = computed(() => {
      const classes = [
        "block w-full px-4 py-2.5 text-base",
        "border rounded-lg",
        // 12px согласно DESIGN_SYSTEM.md
        "transition-colors duration-200",
        "focus:outline-none focus:ring-2 focus:ring-[#3659fa] focus:ring-offset-2",
        "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
      ];
      if (props.error) {
        classes.push("border-red-500 text-red-900 placeholder-red-300");
      } else {
        classes.push("border-gray-300 focus:border-[#3659fa]");
      }
      return classes.join(" ");
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full" }, _attrs))}>`);
      if (__props.label) {
        _push(`<label${ssrRenderAttr("for", inputId)} class="block text-sm font-medium text-gray-700 mb-1">${ssrInterpolate(__props.label)} `);
        if (__props.required) {
          _push(`<span class="text-red-500">*</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</label>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="relative"><input${ssrRenderAttr("id", inputId)}${ssrRenderDynamicModel(__props.type, unref(localValue), null)}${ssrRenderAttr("type", __props.type)}${ssrRenderAttr("placeholder", __props.placeholder)}${ssrIncludeBooleanAttr(__props.disabled) ? " disabled" : ""}${ssrIncludeBooleanAttr(__props.required) ? " required" : ""} class="${ssrRenderClass(unref(inputClasses))}">`);
      if (__props.error) {
        _push(`<div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none"><svg class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (__props.error) {
        _push(`<p class="mt-1 text-sm text-red-600">${ssrInterpolate(__props.error)}</p>`);
      } else if (__props.hint) {
        _push(`<p class="mt-1 text-sm text-gray-500">${ssrInterpolate(__props.hint)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/BaseInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=BaseInput-FgAN8o_L.mjs.map
