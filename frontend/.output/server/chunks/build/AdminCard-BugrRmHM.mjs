import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderSlot, ssrRenderClass } from 'vue/server-renderer';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "AdminPageHeader",
  __ssrInlineRender: true,
  props: {
    title: {},
    description: {},
    icon: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4" }, _attrs))}><div><div class="flex items-center gap-3">`);
      if (__props.icon) {
        _push(`<div class="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-xl shadow-sm">${ssrInterpolate(__props.icon)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div><h1 class="text-2xl font-bold text-slate-900">${ssrInterpolate(__props.title)}</h1>`);
      if (__props.description) {
        _push(`<p class="text-sm text-slate-500 mt-0.5">${ssrInterpolate(__props.description)}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div><div class="flex items-center gap-2">`);
      ssrRenderSlot(_ctx.$slots, "actions", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AdminPageHeader.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminCard",
  __ssrInlineRender: true,
  props: {
    title: {},
    padding: { type: Boolean, default: true }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-sm" }, _attrs))}>`);
      if (__props.title) {
        _push(`<div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent rounded-t-2xl"><div class="flex items-center justify-between"><div class="text-base font-semibold text-slate-800">${ssrInterpolate(__props.title)}</div>`);
        ssrRenderSlot(_ctx.$slots, "header-actions", {}, null, _push, _parent);
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="${ssrRenderClass([__props.padding ? "p-5" : "", !__props.title ? "rounded-2xl" : "rounded-b-2xl"])}">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AdminCard.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main$1 as _, _sfc_main as a };
//# sourceMappingURL=AdminCard-BugrRmHM.mjs.map
