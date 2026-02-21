import { u as useRuntimeConfig } from './server.mjs';
import { defineComponent, mergeProps, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProductLabel",
  __ssrInlineRender: true,
  props: {
    article: {},
    name: {},
    imageUrl: {}
  },
  setup(__props) {
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    function fullUrl(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return `${apiBaseUrl}${normalized}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({ class: "relative inline-flex items-center gap-2 group" }, _attrs))}><span class="font-mono text-xs text-gray-800">${ssrInterpolate(__props.article || "\u2014")}</span>`);
      if (__props.imageUrl) {
        _push(`<span class="pointer-events-none absolute left-0 top-full z-20 hidden w-48 translate-y-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl group-hover:block"><img${ssrRenderAttr("src", fullUrl(__props.imageUrl))}${ssrRenderAttr("alt", __props.name || __props.article || "product")} class="h-32 w-full rounded-lg object-cover"><div class="mt-2 line-clamp-2 text-xs text-gray-700">${ssrInterpolate(__props.name)}</div></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductLabel.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ProductLabel-Cfk69Yin.mjs.map
