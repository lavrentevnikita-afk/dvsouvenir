import { defineComponent, ref, reactive, computed, mergeProps, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
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
  __name: "promo",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    const loading = ref(false);
    const error = ref(null);
    const banners = ref([]);
    const editOpen = ref(false);
    const editing = ref(null);
    const form = reactive({
      title: "",
      type: "banner",
      text: "",
      imageUrl: "",
      linkUrl: "",
      sortOrder: 0,
      isActive: true,
      startAt: "",
      endAt: ""
    });
    const now = computed(() => /* @__PURE__ */ new Date());
    function isActiveNow(b) {
      if (!b.isActive) return false;
      const n = now.value.getTime();
      const s = b.startAt ? new Date(b.startAt).getTime() : null;
      const e = b.endAt ? new Date(b.endAt).getTime() : null;
      if (s && n < s) return false;
      if (e && n > e) return false;
      return true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u041F\u0440\u043E\u043C\u043E</h1><p class="text-sm text-gray-600 mt-1">\u0411\u0430\u043D\u043D\u0435\u0440\u044B \u0438 \u043F\u043B\u0430\u0448\u043A\u0438 \u043F\u043E \u0434\u0430\u0442\u0430\u043C</p></div><div class="flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C</button><button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90">\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C</button></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A</th><th class="text-left px-4 py-3">\u0422\u0438\u043F</th><th class="text-left px-4 py-3">\u041F\u0435\u0440\u0438\u043E\u0434</th><th class="text-center px-4 py-3">\u0410\u043A\u0442\u0438\u0432\u0435\u043D \u0441\u0435\u0439\u0447\u0430\u0441?</th><th class="text-right px-4 py-3">\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</th><th class="text-right px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(banners), (b) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3"><div class="font-medium">${ssrInterpolate(b.title)}</div>`);
          if (b.type === "badge" && b.text) {
            _push(`<div class="text-xs text-gray-500 mt-1 line-clamp-2">${ssrInterpolate(b.text)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (b.type === "banner") {
            _push(`<div class="text-xs text-gray-500 mt-1 truncate">${ssrInterpolate(b.imageUrl)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3">${ssrInterpolate(b.type)}</td><td class="px-4 py-3"><div class="text-xs text-gray-700">${ssrInterpolate(b.startAt ? new Date(b.startAt).toLocaleString() : "\u2014")}</div><div class="text-xs text-gray-700">${ssrInterpolate(b.endAt ? new Date(b.endAt).toLocaleString() : "\u2014")}</div></td><td class="px-4 py-3 text-center"><span class="${ssrRenderClass([isActiveNow(b) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-700 border-gray-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(isActiveNow(b) ? "\u0434\u0430" : "\u043D\u0435\u0442")}</span></td><td class="px-4 py-3 text-right">${ssrInterpolate(b.sortOrder)}</td><td class="px-4 py-3 text-right"><div class="flex items-center justify-end gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">${ssrInterpolate(b.isActive ? "\u0412\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C" : "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C")}</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C</button><button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button></div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(banners).length === 0) {
          _push(`<tr><td colspan="6" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      }
      if (unref(editOpen)) {
        _push(`<div class="fixed inset-0 z-[2000] bg-black/30 flex items-end sm:items-center justify-center p-4"><div class="w-full max-w-xl rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between"><div class="font-semibold">${ssrInterpolate(unref(editing) ? "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u043C\u043E" : "\u041D\u043E\u0432\u043E\u0435 \u043F\u0440\u043E\u043C\u043E")}</div><button class="text-sm text-gray-500 hover:text-gray-900">\u2715</button></div><div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"><div class="sm:col-span-2"><label class="text-xs text-gray-600">\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A</label><input${ssrRenderAttr("value", unref(form).title)} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></div><div><label class="text-xs text-gray-600">\u0422\u0438\u043F</label><select class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="banner"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "banner") : ssrLooseEqual(unref(form).type, "banner")) ? " selected" : ""}>banner</option><option value="badge"${ssrIncludeBooleanAttr(Array.isArray(unref(form).type) ? ssrLooseContain(unref(form).type, "badge") : ssrLooseEqual(unref(form).type, "badge")) ? " selected" : ""}>badge</option></select></div><div><label class="text-xs text-gray-600">\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</label><input type="number"${ssrRenderAttr("value", unref(form).sortOrder)} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></div>`);
        if (unref(form).type === "badge") {
          _push(`<div class="sm:col-span-2"><label class="text-xs text-gray-600">\u0422\u0435\u043A\u0441\u0442 (\u043F\u043B\u0430\u0448\u043A\u0430)</label><textarea rows="3" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm">${ssrInterpolate(unref(form).text)}</textarea></div>`);
        } else {
          _push(`<div class="sm:col-span-2"><label class="text-xs text-gray-600">Image URL</label><input${ssrRenderAttr("value", unref(form).imageUrl)} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm" placeholder="/uploads/..."></div>`);
        }
        _push(`<div class="sm:col-span-2"><label class="text-xs text-gray-600">\u0421\u0441\u044B\u043B\u043A\u0430</label><input${ssrRenderAttr("value", unref(form).linkUrl)} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></div><div><label class="text-xs text-gray-600">StartAt</label><input type="datetime-local"${ssrRenderAttr("value", unref(form).startAt)} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></div><div><label class="text-xs text-gray-600">EndAt</label><input type="datetime-local"${ssrRenderAttr("value", unref(form).endAt)} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></div><div class="sm:col-span-2 flex items-center gap-2"><input id="isActive" type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(form).isActive) ? ssrLooseContain(unref(form).isActive, null) : unref(form).isActive) ? " checked" : ""}><label for="isActive" class="text-sm">\u0412\u043A\u043B\u044E\u0447\u0435\u043D\u043E</label></div></div><div class="p-4 border-t border-gray-200 flex items-center justify-end gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0442\u043C\u0435\u043D\u0430</button><button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/promo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=promo-DlkorySu.mjs.map
