import { u as useRuntimeConfig } from './server.mjs';
import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderList, ssrRenderClass, ssrRenderTeleport, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ProductGallery",
  __ssrInlineRender: true,
  props: {
    images: {},
    alt: {}
  },
  setup(__props) {
    const props = __props;
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    function normalize(url) {
      if (!url) return "";
      if (url.startsWith("http")) return url;
      const normalized = url.startsWith("/") ? url : `/${url}`;
      return `${apiBaseUrl}${normalized}`;
    }
    const active = ref(0);
    const isOpen = ref(false);
    const zoomed = ref(false);
    const list = computed(() => (Array.isArray(props.images) ? props.images : []).map((i) => ({ ...i, url: normalize(String(i.url || "")) })));
    const mainUrl = computed(() => {
      var _a2, _b2;
      var _a, _b;
      if (!list.value.length) return null;
      return (_b2 = (_a2 = (_a = list.value[active.value]) == null ? void 0 : _a.url) != null ? _a2 : (_b = list.value[0]) == null ? void 0 : _b.url) != null ? _b2 : null;
    });
    const hoverSegs = computed(() => {
      var _a2;
      var _a;
      const len = (_a2 = (_a = list.value) == null ? void 0 : _a.length) != null ? _a2 : 0;
      return Math.min(len, 5);
    });
    const activeSeg = computed(() => {
      var _a2;
      var _a;
      const len = (_a2 = (_a = list.value) == null ? void 0 : _a.length) != null ? _a2 : 0;
      const segs = hoverSegs.value;
      if (len <= 1 || segs <= 1) return 0;
      return Math.min(segs - 1, Math.floor(active.value / (len - 1) * segs));
    });
    watch(isOpen, (v) => {
      return;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-4" }, _attrs))}><button type="button" class="group relative aspect-square w-full overflow-hidden rounded-lg border border-gray-200 bg-white flex items-center justify-center">`);
      if (unref(mainUrl)) {
        _push(`<!--[--><img${ssrRenderAttr("src", unref(mainUrl))}${ssrRenderAttr("alt", __props.alt)} class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.04]" loading="lazy"><span class="pointer-events-none absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-1 text-[10px] text-gray-600 shadow"> \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F zoom </span>`);
        if (unref(list).length > 1) {
          _push(`<div class="pointer-events-none absolute left-2 right-2 top-2 flex gap-1"><!--[-->`);
          ssrRenderList(unref(hoverSegs), (n) => {
            _push(`<span class="${ssrRenderClass([n - 1 === unref(activeSeg) ? "bg-slate-900/80" : "bg-white/70", "h-1 flex-1 rounded-full"])}"></span>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<div class="text-xs text-gray-400">\u041D\u0435\u0442 \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044F</div>`);
      }
      _push(`</button>`);
      if (unref(list).length > 1) {
        _push(`<div class="flex gap-2 overflow-x-auto pb-1"><!--[-->`);
        ssrRenderList(unref(list), (image, index) => {
          _push(`<button type="button" class="${ssrRenderClass([index === unref(active) ? "border-slate-900" : "border-gray-200 hover:border-gray-300", "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border"])}"><img${ssrRenderAttr("src", image.url)}${ssrRenderAttr("alt", __props.alt)} class="h-full w-full object-cover" loading="lazy"></button>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(isOpen)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"><div class="relative w-full max-w-4xl"><button type="button" class="absolute -top-10 right-0 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800"> \u0417\u0430\u043A\u0440\u044B\u0442\u044C </button><div class="overflow-hidden rounded-2xl bg-white shadow-xl"><button type="button" class="block w-full bg-white"${ssrRenderAttr("title", unref(zoomed) ? "\u0423\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u044C" : "\u0423\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C")}>`);
          if (unref(mainUrl)) {
            _push2(`<img${ssrRenderAttr("src", unref(mainUrl))}${ssrRenderAttr("alt", __props.alt)} class="${ssrRenderClass([unref(zoomed) ? "scale-[1.7] cursor-zoom-out" : "scale-100 cursor-zoom-in", "h-[70vh] w-full object-contain transition-transform duration-200"])}">`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</button><div class="flex items-center justify-between px-4 py-3 text-xs text-gray-600"><span>\u041A\u043B\u0438\u043A \u043F\u043E \u0438\u0437\u043E\u0431\u0440\u0430\u0436\u0435\u043D\u0438\u044E: ${ssrInterpolate(unref(zoomed) ? "\u0443\u043C\u0435\u043D\u044C\u0448\u0438\u0442\u044C" : "\u0443\u0432\u0435\u043B\u0438\u0447\u0438\u0442\u044C")}</span>`);
          if (unref(list).length) {
            _push2(`<span>${ssrInterpolate(unref(active) + 1)} / ${ssrInterpolate(unref(list).length)}</span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductGallery.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProductAvailabilityBadge",
  __ssrInlineRender: true,
  props: {
    status: {},
    canOrder: { type: [Boolean, null] },
    isAvailable: { type: Boolean },
    hint: {}
  },
  setup(__props) {
    const props = __props;
    const level = computed(() => {
      var _a;
      if (props.status) return props.status;
      const raw = ((_a = props.hint) != null ? _a : "").toLowerCase().trim();
      if (raw.includes("\u043E\u0436\u0438\u0434\u0430\u0435\u043C")) return "expected";
      if (raw.includes("\u043F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437") || raw.includes("\u0437\u0430\u043A\u0430\u0437")) return "preorder";
      if (raw.includes("\u043C\u0430\u043B\u043E") || raw.includes("few")) return "low";
      if (raw.includes("\u043C\u043D\u043E\u0433\u043E") || raw.includes("many")) return "many";
      return props.isAvailable ? "many" : "preorder";
    });
    const text = computed(() => {
      if (level.value === "expected") return "\u041E\u0436\u0438\u0434\u0430\u0435\u043C \u043F\u043E\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u0435";
      if (level.value === "preorder") return "\u041F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437";
      if (level.value === "in_stock") return "\u0412 \u043D\u0430\u043B\u0438\u0447\u0438\u0438";
      if (level.value === "low") return "\u041C\u0430\u043B\u043E";
      return "\u041C\u043D\u043E\u0433\u043E";
    });
    const klass = computed(() => {
      if (level.value === "expected") return "bg-gray-100 text-gray-600";
      if (level.value === "preorder") return "bg-gray-100 text-gray-600";
      if (level.value === "in_stock") return "bg-emerald-100 text-emerald-800";
      if (level.value === "low") return "bg-amber-100 text-amber-800";
      return "bg-emerald-100 text-emerald-800";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<span${ssrRenderAttrs(mergeProps({
        class: ["inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", unref(klass)]
      }, _attrs))}><span class="mr-1">${ssrInterpolate(unref(level) === "preorder" || unref(level) === "expected" ? "\u25CB" : "\u25CF")}</span> ${ssrInterpolate(unref(text))}</span>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductAvailabilityBadge.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main$1 as _, _sfc_main as a };
//# sourceMappingURL=ProductAvailabilityBadge-Dp6_CtFm.mjs.map
