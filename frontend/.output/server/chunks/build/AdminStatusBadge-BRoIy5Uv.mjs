import { defineComponent, computed, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AdminStatusBadge",
  __ssrInlineRender: true,
  props: {
    status: {},
    map: {}
  },
  setup(__props) {
    const props = __props;
    const config = computed(() => {
      const defaultMap = {
        active: { label: "\u0410\u043A\u0442\u0438\u0432\u0435\u043D", color: "green" },
        blocked: { label: "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D", color: "red" },
        lead: { label: "\u0417\u0430\u044F\u0432\u043A\u0430", color: "amber" },
        new: { label: "\u041D\u043E\u0432\u044B\u0439", color: "blue" },
        confirmed: { label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043D", color: "green" },
        in_work: { label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435", color: "amber" },
        shipped: { label: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D", color: "purple" },
        closed: { label: "\u0417\u0430\u043A\u0440\u044B\u0442", color: "slate" },
        ok: { label: "OK", color: "green" },
        partial: { label: "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E", color: "amber" },
        deficit: { label: "\u0414\u0435\u0444\u0438\u0446\u0438\u0442", color: "red" }
      };
      const map = props.map || defaultMap;
      return map[props.status] || { label: props.status, color: "slate" };
    });
    const colorClasses = computed(() => {
      const colors = {
        green: "bg-emerald-50 text-emerald-700 border-emerald-200",
        red: "bg-red-50 text-red-700 border-red-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        slate: "bg-slate-50 text-slate-700 border-slate-200",
        purple: "bg-purple-50 text-purple-700 border-purple-200"
      };
      return colors[config.value.color];
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border", colorClasses.value]
      }, _attrs))}>${ssrInterpolate(config.value.label)}</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ui/AdminStatusBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=AdminStatusBadge-BRoIy5Uv.mjs.map
