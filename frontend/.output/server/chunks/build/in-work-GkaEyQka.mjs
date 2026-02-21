import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "in-work",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    config.apiBaseUrl;
    const priority = ref("all");
    const deadline = ref("all");
    const assignee = ref("");
    const loading = ref(false);
    const error = ref(null);
    const orders = ref([]);
    const openRow = ref({});
    const busy = ref({});
    function humanDateShort(dt) {
      if (!dt) return "\u2014";
      const d = new Date(dt);
      if (Number.isNaN(d.getTime())) return "\u2014";
      return d.toLocaleDateString() + " " + d.toLocaleTimeString().slice(0, 5);
    }
    function deadlineBadge(dt) {
      if (!dt) return { text: "\u2014", cls: "bg-gray-100 text-gray-700 border-gray-200" };
      const d = new Date(dt);
      const now = /* @__PURE__ */ new Date();
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (d < startToday) return { text: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E", cls: "bg-red-50 text-red-700 border-red-200" };
      const endToday = new Date(startToday.getTime() + 24 * 60 * 60 * 1e3 - 1);
      if (d <= endToday) return { text: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F", cls: "bg-amber-50 text-amber-800 border-amber-200" };
      return { text: "\u0412 \u0441\u0440\u043E\u043A", cls: "bg-green-50 text-green-700 border-green-200" };
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex items-end justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</h1><p class="text-sm text-gray-600 mt-1">\u0421\u0431\u043E\u0440\u043A\u0430/\u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0430\u0446\u0438\u044F: \u0447\u0442\u043E \u0441\u0435\u0439\u0447\u0430\u0441 \u0441\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u0438 \u0447\u0442\u043E \u0443\u0436\u0435 \u043C\u043E\u0436\u043D\u043E \u043E\u0442\u0434\u0430\u0432\u0430\u0442\u044C \u0432 \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0443</p></div><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="grid grid-cols-1 lg:grid-cols-4 gap-3"><div><div class="text-xs font-semibold text-gray-700 mb-1">\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</div><select class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(priority)) ? ssrLooseContain(unref(priority), "all") : ssrLooseEqual(unref(priority), "all")) ? " selected" : ""}>\u041B\u044E\u0431\u043E\u0439</option><option value="1"${ssrIncludeBooleanAttr(Array.isArray(unref(priority)) ? ssrLooseContain(unref(priority), "1") : ssrLooseEqual(unref(priority), "1")) ? " selected" : ""}>1 \u2014 \u0432\u044B\u0441\u043E\u043A\u0438\u0439</option><option value="2"${ssrIncludeBooleanAttr(Array.isArray(unref(priority)) ? ssrLooseContain(unref(priority), "2") : ssrLooseEqual(unref(priority), "2")) ? " selected" : ""}>2 \u2014 \u0441\u0440\u0435\u0434\u043D\u0438\u0439</option><option value="3"${ssrIncludeBooleanAttr(Array.isArray(unref(priority)) ? ssrLooseContain(unref(priority), "3") : ssrLooseEqual(unref(priority), "3")) ? " selected" : ""}>3 \u2014 \u043E\u0431\u044B\u0447\u043D\u044B\u0439</option></select></div><div><div class="text-xs font-semibold text-gray-700 mb-1">\u0414\u0435\u0434\u043B\u0430\u0439\u043D</div><select class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "all") : ssrLooseEqual(unref(deadline), "all")) ? " selected" : ""}>\u041B\u044E\u0431\u043E\u0439</option><option value="overdue"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "overdue") : ssrLooseEqual(unref(deadline), "overdue")) ? " selected" : ""}>\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435</option><option value="today"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "today") : ssrLooseEqual(unref(deadline), "today")) ? " selected" : ""}>\u0421\u0435\u0433\u043E\u0434\u043D\u044F</option><option value="week"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "week") : ssrLooseEqual(unref(deadline), "week")) ? " selected" : ""}>\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 7 \u0434\u043D\u0435\u0439</option><option value="none"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "none") : ssrLooseEqual(unref(deadline), "none")) ? " selected" : ""}>\u0411\u0435\u0437 \u0434\u0435\u0434\u043B\u0430\u0439\u043D\u0430</option></select></div><div><div class="text-xs font-semibold text-gray-700 mb-1">\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439</div><input${ssrRenderAttr("value", unref(assignee))} placeholder="\u0418\u043C\u044F/\u043B\u043E\u0433\u0438\u043D" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"></div><div class="flex items-end gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u0421\u0431\u0440\u043E\u0441 </button></div></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-auto"><table class="min-w-[1100px] w-full text-sm"><thead class="bg-gray-50 text-gray-700"><tr class="text-left"><th class="px-4 py-3 font-semibold">\u0417\u0430\u043A\u0430\u0437</th><th class="px-4 py-3 font-semibold">\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0431\u0440\u0430\u0442\u044C</th><th class="px-4 py-3 font-semibold">\u041D\u0430\u043B\u0438\u0447\u0438\u0435 \u043F\u043E \u0441\u043A\u043B\u0430\u0434\u0443</th><th class="px-4 py-3 font-semibold">\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0441\u0431\u043E\u0440\u043A\u0438</th><th class="px-4 py-3 font-semibold text-right">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(orders), (o) => {
          _push(`<!--[--><tr class="border-t border-gray-100 hover:bg-gray-50"><td class="px-4 py-3 align-top"><div class="flex items-start gap-3"><button class="mt-0.5 w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"${ssrRenderAttr("aria-label", unref(openRow)[o.id] ? "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C" : "\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C")}>${ssrInterpolate(unref(openRow)[o.id] ? "\u2013" : "+")}</button><div><div class="font-semibold">#${ssrInterpolate(o.id)}</div><div class="text-xs text-gray-500">${ssrInterpolate(o.customerName)} \xB7 ${ssrInterpolate(o.totalPrice)} \u20BD</div><div class="text-xs text-gray-500 mt-1">\u0421\u043E\u0437\u0434\u0430\u043D: ${ssrInterpolate(humanDateShort(o.createdAt))}</div><div class="flex flex-wrap items-center gap-2 mt-2"><span class="${ssrRenderClass([deadlineBadge(o.deadlineAt).cls, "text-[11px] px-2 py-1 rounded-full border"])}">${ssrInterpolate(deadlineBadge(o.deadlineAt).text)}</span>`);
          if (o.priority) {
            _push(`<span class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700"> \u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442: ${ssrInterpolate(o.priority)}</span>`);
          } else {
            _push(`<!---->`);
          }
          if (o.assignee) {
            _push(`<span class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700">${ssrInterpolate(o.assignee)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div></td><td class="px-4 py-3 align-top"><div class="space-y-1"><!--[-->`);
          ssrRenderList((o.lines || []).slice(0, 3), (l) => {
            _push(`<div class="text-xs"><span class="font-medium">${ssrInterpolate(l.name || "#" + l.productId)}</span><span class="text-gray-500"> \u2014 ${ssrInterpolate(l.quantity)} \u0448\u0442.</span></div>`);
          });
          _push(`<!--]-->`);
          if ((o.lines || []).length > 3) {
            _push(`<div class="text-xs text-gray-500">\u0438 \u0435\u0449\u0451 ${ssrInterpolate((o.lines || []).length - 3)}\u2026</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((o.lines || []).length === 0) {
            _push(`<div class="text-xs text-gray-500">\u2014</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td><td class="px-4 py-3 align-top"><div class="space-y-1"><!--[-->`);
          ssrRenderList((o.lines || []).slice(0, 3), (l) => {
            _push(`<div class="text-xs"><span class="text-gray-700">${ssrInterpolate(l.stock.available)} / ${ssrInterpolate(l.quantity)}</span><span class="${ssrRenderClass([l.stockOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200", "ml-2 text-[11px] px-2 py-0.5 rounded-full border"])}">${ssrInterpolate(l.stockOk ? "OK" : "\u0414\u0435\u0444\u0438\u0446\u0438\u0442")}</span></div>`);
          });
          _push(`<!--]-->`);
          if ((o.lines || []).length > 3) {
            _push(`<div class="text-xs text-gray-500">\u2026</div>`);
          } else {
            _push(`<!---->`);
          }
          if ((o.lines || []).length === 0) {
            _push(`<div class="text-xs text-gray-500">\u2014</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td><td class="px-4 py-3 align-top"><div class="text-xs"><span class="font-semibold tabular-nums">${ssrInterpolate((o.lines || []).filter((l) => l.checked).length)}</span><span class="text-gray-500"> / ${ssrInterpolate((o.lines || []).length)} \u0441\u043E\u0431\u0440.</span></div><div class="${ssrRenderClass([o.allChecked ? "text-green-700" : "text-gray-500", "text-[11px] mt-1"])}">${ssrInterpolate(o.allChecked ? "\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0437\u0430\u043A\u0440\u044B\u0442" : "\u041D\u0443\u0436\u043D\u043E \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438")}</div></td><td class="px-4 py-3 align-top"><div class="flex justify-end gap-2">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/b2b/admin/orders?q=${o.id}`,
            class: "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u041E\u0442\u043A\u0440\u044B\u0442\u044C `);
              } else {
                return [
                  createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C ")
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button class="${ssrRenderClass([o.allChecked && o.allStockOk ? "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed", "px-3 py-2 rounded-xl text-xs"])}"${ssrIncludeBooleanAttr(!(o.allChecked && o.allStockOk) || unref(busy)[`ready:${o.id}`]) ? " disabled" : ""}> \u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435 </button></div></td></tr>`);
          if (unref(openRow)[o.id]) {
            _push(`<tr class="border-t border-gray-100 bg-white"><td class="px-4 py-4" colspan="5"><div class="grid grid-cols-1 lg:grid-cols-3 gap-4"><div class="lg:col-span-2"><div class="text-xs font-semibold text-gray-700 mb-2">\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0441\u0431\u043E\u0440\u043A\u0438</div><div class="rounded-2xl border border-gray-200 overflow-hidden"><!--[-->`);
            ssrRenderList(o.lines || [], (l) => {
              _push(`<div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 first:border-t-0"><label class="flex items-start gap-3 min-w-0"><input type="checkbox" class="mt-1"${ssrIncludeBooleanAttr(l.checked) ? " checked" : ""}${ssrIncludeBooleanAttr(unref(busy)[`${o.id}:${l.productId}`]) ? " disabled" : ""}><div class="min-w-0"><div class="text-sm font-medium truncate">${ssrInterpolate(l.name || "#" + l.productId)}</div><div class="text-xs text-gray-500">ID: ${ssrInterpolate(l.productId)} \xB7 \u041D\u0443\u0436\u043D\u043E: ${ssrInterpolate(l.quantity)} \u0448\u0442.</div></div></label><div class="text-right"><div class="text-sm tabular-nums">${ssrInterpolate(l.stock.available)} / ${ssrInterpolate(l.quantity)}</div><div class="text-[11px] mt-1"><span class="${ssrRenderClass([l.stockOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200", "px-2 py-0.5 rounded-full border"])}">${ssrInterpolate(l.stockOk ? "\u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 OK" : "\u0414\u0435\u0444\u0438\u0446\u0438\u0442")}</span></div></div></div>`);
            });
            _push(`<!--]-->`);
            if ((o.lines || []).length === 0) {
              _push(`<div class="px-4 py-3 text-sm text-gray-500">\u041F\u043E\u0437\u0438\u0446\u0438\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><div><div class="text-xs font-semibold text-gray-700 mb-2">\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0437\u0430\u0434\u0430\u0447\u0438</div><div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3"><div><div class="text-[11px] font-semibold text-gray-700 mb-1">\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</div><select class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"${ssrRenderAttr("value", o.priority || "")}><option value="">\u2014</option><option value="1">1 \u2014 \u0432\u044B\u0441\u043E\u043A\u0438\u0439</option><option value="2">2 \u2014 \u0441\u0440\u0435\u0434\u043D\u0438\u0439</option><option value="3">3 \u2014 \u043E\u0431\u044B\u0447\u043D\u044B\u0439</option></select></div><div><div class="text-[11px] font-semibold text-gray-700 mb-1">\u0414\u0435\u0434\u043B\u0430\u0439\u043D</div><input type="datetime-local" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"${ssrRenderAttr("value", o.deadlineAt ? new Date(o.deadlineAt).toISOString().slice(0, 16) : "")}></div><div><div class="text-[11px] font-semibold text-gray-700 mb-1">\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439</div><input class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"${ssrRenderAttr("value", o.assignee || "")} placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0438\u043A\u0438\u0442\u0430"></div><div class="pt-1"><button class="${ssrRenderClass([o.allChecked && o.allStockOk ? "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed", "w-full px-3 py-2 rounded-xl text-sm"])}"${ssrIncludeBooleanAttr(!(o.allChecked && o.allStockOk) || unref(busy)[`ready:${o.id}`]) ? " disabled" : ""}> \u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435 </button><p class="text-[11px] text-gray-500 mt-2"> \u041A\u043D\u043E\u043F\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430, \u043A\u043E\u0433\u0434\u0430 \u0432\u0441\u0451 \u0441\u043E\u0431\u0440\u0430\u043D\u043E \u0438 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u0430. </p></div></div></div></div></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]-->`);
        if (unref(orders).length === 0) {
          _push(`<tr><td colspan="5" class="px-4 py-10 text-center text-gray-500"> \u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \xAB\u0412 \u0440\u0430\u0431\u043E\u0442\u0435\xBB </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/in-work.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=in-work-GkaEyQka.mjs.map
