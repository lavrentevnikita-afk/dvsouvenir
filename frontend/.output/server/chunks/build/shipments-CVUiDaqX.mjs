import { _ as _sfc_main$1 } from './ProductLabel-Cfk69Yin.mjs';
import { defineComponent, ref, watch, mergeProps, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "shipments",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const dateFrom = ref("");
    const dateTo = ref("");
    const status = ref("all");
    const store = ref("all");
    const loading = ref(false);
    const error = ref(null);
    const shipments = ref([]);
    const statusLabel = {
      ready: "\u0413\u043E\u0442\u043E\u0432\u043E",
      partial: "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E",
      shipped: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E",
      delivered: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E",
      created: "\u0413\u043E\u0442\u043E\u0432\u043E"
    };
    function humanDate(dt) {
      if (!dt) return "\u2014";
      const d = new Date(dt);
      return d.toLocaleString();
    }
    async function load() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/ops/shipments", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: {
            status: status.value === "all" ? void 0 : status.value,
            store: store.value === "all" ? void 0 : store.value,
            dateFrom: dateFrom.value ? new Date(dateFrom.value).toISOString() : void 0,
            dateTo: dateTo.value ? (/* @__PURE__ */ new Date(dateTo.value + "T23:59:59.999Z")).toISOString() : void 0
          }
        });
        shipments.value = Array.isArray(res == null ? void 0 : res.shipments) ? res.shipments : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438";
      } finally {
        loading.value = false;
      }
    }
    watch([dateFrom, dateTo, status, store], () => load());
    const modalConfirmOpen = ref(false);
    const modalPartialOpen = ref(false);
    const modalDocsOpen = ref(false);
    const active = ref(null);
    const orderDetail = ref(null);
    const confirmShipped = ref(true);
    const confirmDateTime = ref("");
    const confirmWaybill = ref("");
    const confirmComment = ref("");
    ref(null);
    const confirmUploading = ref(false);
    const partialItems = ref({});
    const partialWaybill = ref("");
    const partialComment = ref("");
    const partialDateTime = ref("");
    ref(null);
    const partialUploading = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_ProductLabel = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full" }, _attrs))}><div class="flex items-end justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438</h1><p class="text-sm text-gray-600 mt-1">\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043E\u043A \u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u043E\u0432.</p></div><div class="flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041D\u0435\u0434\u0435\u043B\u044F</button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C</button></div></div><div class="mt-4 rounded-2xl border border-gray-200 bg-white p-4"><div class="grid grid-cols-1 md:grid-cols-12 gap-3"><div class="md:col-span-3"><div class="text-xs text-gray-500">\u041F\u0435\u0440\u0438\u043E\u0434 (\u0441)</div><input${ssrRenderAttr("value", unref(dateFrom))} type="date" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"></div><div class="md:col-span-3"><div class="text-xs text-gray-500">\u041F\u0435\u0440\u0438\u043E\u0434 (\u043F\u043E)</div><input${ssrRenderAttr("value", unref(dateTo))} type="date" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"></div><div class="md:col-span-3"><div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441</div><select class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "all") : ssrLooseEqual(unref(status), "all")) ? " selected" : ""}>\u0412\u0441\u0435</option><option value="ready"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "ready") : ssrLooseEqual(unref(status), "ready")) ? " selected" : ""}>\u0413\u043E\u0442\u043E\u0432\u043E</option><option value="partial"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "partial") : ssrLooseEqual(unref(status), "partial")) ? " selected" : ""}>\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E</option><option value="shipped"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "shipped") : ssrLooseEqual(unref(status), "shipped")) ? " selected" : ""}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E</option><option value="delivered"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "delivered") : ssrLooseEqual(unref(status), "delivered")) ? " selected" : ""}>\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E</option></select></div><div class="md:col-span-3"><div class="text-xs text-gray-500">\u041C\u0430\u0433\u0430\u0437\u0438\u043D</div><select class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(store)) ? ssrLooseContain(unref(store), "all") : ssrLooseEqual(unref(store), "all")) ? " selected" : ""}>\u0412\u0441\u0435</option><option value="\u0421\u0430\u0439\u0442"${ssrIncludeBooleanAttr(Array.isArray(unref(store)) ? ssrLooseContain(unref(store), "\u0421\u0430\u0439\u0442") : ssrLooseEqual(unref(store), "\u0421\u0430\u0439\u0442")) ? " selected" : ""}>\u0421\u0430\u0439\u0442</option></select></div></div></div>`);
      if (unref(error)) {
        _push(`<div class="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="mt-4 rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between"><div class="text-sm font-medium">\u0421\u043F\u0438\u0441\u043E\u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043E\u043A</div><div class="text-xs text-gray-500">${ssrInterpolate(unref(shipments).length)} \u0448\u0442.</div></div><div class="overflow-x-auto"><table class="min-w-full text-sm"><thead class="text-xs text-gray-500 bg-gray-50 border-b border-gray-200"><tr><th class="text-left p-3">\u0417\u0430\u043A\u0430\u0437 / \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C</th><th class="text-left p-3">\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left p-3">\u041F\u043B\u0430\u043D</th><th class="text-left p-3">\u0424\u0430\u043A\u0442</th><th class="text-left p-3">\u041A\u0442\u043E \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B</th><th class="text-right p-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody>`);
      if (unref(loading)) {
        _push(`<tr><td colspan="6" class="p-4 text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</td></tr>`);
      } else if (!unref(shipments).length) {
        _push(`<tr><td colspan="6" class="p-4 text-gray-500">\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445</td></tr>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(shipments), (sh) => {
        var _a2, _b2;
        _push(`<tr class="border-b border-gray-100 hover:bg-gray-50"><td class="p-3"><div class="font-medium">#${ssrInterpolate(sh.orderId)}</div><div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(((_a2 = sh.recipient) == null ? void 0 : _a2.name) || "\u2014")}`);
        if ((_b2 = sh.recipient) == null ? void 0 : _b2.phone) {
          _push(`<span> \xB7 ${ssrInterpolate(sh.recipient.phone)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></td><td class="p-3"><span class="inline-flex items-center px-2 py-1 rounded-lg border border-gray-200 text-xs">${ssrInterpolate(statusLabel[sh.status] || sh.status)}</span>`);
        if (sh.shippedProgress) {
          _push(`<div class="text-xs text-gray-500 mt-1">${ssrInterpolate(sh.shippedProgress.shippedQty)}/${ssrInterpolate(sh.shippedProgress.totalQty)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</td><td class="p-3">${ssrInterpolate(humanDate(sh.plannedAt))}</td><td class="p-3">${ssrInterpolate(humanDate(sh.shippedAt))}</td><td class="p-3">`);
        if (sh.confirmedBy) {
          _push(`<div class="text-xs"><div class="font-medium">${ssrInterpolate(sh.confirmedBy.name || sh.confirmedBy.email)}</div><div class="text-gray-500">${ssrInterpolate(sh.confirmedBy.email)}</div></div>`);
        } else {
          _push(`<div class="text-xs text-gray-500">\u2014</div>`);
        }
        _push(`</td><td class="p-3 text-right"><div class="inline-flex items-center gap-2"><button class="px-3 py-2 rounded-xl bg-amber-300 text-slate-900 text-xs font-semibold hover:brightness-95 disabled:opacity-50"${ssrIncludeBooleanAttr(sh.status === "shipped" || sh.status === "delivered") ? " disabled" : ""}> \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs disabled:opacity-50"${ssrIncludeBooleanAttr(sh.status === "delivered") ? " disabled" : ""}> \u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs">\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B</button></div></td></tr>`);
      });
      _push(`<!--]--></tbody></table></div></div>`);
      if (unref(modalConfirmOpen)) {
        _push(`<div class="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4"><div class="w-full max-w-xl rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between"><div class="font-semibold">\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438 #${ssrInterpolate((_a = unref(active)) == null ? void 0 : _a.orderId)}</div><button class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100">\u2715</button></div><div class="p-4 space-y-3"><label class="flex items-center gap-2 text-sm"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(confirmShipped)) ? ssrLooseContain(unref(confirmShipped), null) : unref(confirmShipped)) ? " checked" : ""}><span>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E</span></label><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><div><div class="text-xs text-gray-500">\u0414\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F</div><input${ssrRenderAttr("value", unref(confirmDateTime))} type="datetime-local" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"></div><div><div class="text-xs text-gray-500">\u041D\u043E\u043C\u0435\u0440 \u043D\u0430\u043A\u043B\u0430\u0434\u043D\u043E\u0439</div><input${ssrRenderAttr("value", unref(confirmWaybill))} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="\u041D\u0430\u043F\u0440. 123-XYZ"></div></div><div><div class="text-xs text-gray-500">\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439</div><textarea rows="3" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 / \u0434\u0435\u0442\u0430\u043B\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438">${ssrInterpolate(unref(confirmComment))}</textarea></div><div><div class="text-xs text-gray-500">\u0424\u043E\u0442\u043E/\u0441\u043A\u0430\u043D (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)</div><input type="file" accept="image/*" class="mt-1 w-full"${ssrIncludeBooleanAttr(((_b = unref(auth).user) == null ? void 0 : _b.role) !== "admin") ? " disabled" : ""}>`);
        if (((_c = unref(auth).user) == null ? void 0 : _c.role) !== "admin") {
          _push(`<div class="text-xs text-gray-500 mt-1">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0430\u0434\u043C\u0438\u043D\u0443.</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="p-4 border-t border-gray-200 flex items-center justify-end gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0442\u043C\u0435\u043D\u0430</button><button class="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50"${ssrIncludeBooleanAttr(unref(confirmUploading)) ? " disabled" : ""}>${ssrInterpolate(unref(confirmUploading) ? "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u2026" : "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(modalPartialOpen)) {
        _push(`<div class="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4"><div class="w-full max-w-2xl rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between"><div class="font-semibold">\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u0430\u044F \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0430 #${ssrInterpolate((_d = unref(active)) == null ? void 0 : _d.orderId)}</div><button class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100">\u2715</button></div><div class="p-4 space-y-3"><div class="text-xs text-gray-500">\u041E\u0442\u043C\u0435\u0442\u044C \u0442\u043E\u043B\u044C\u043A\u043E \u0442\u043E, \u0447\u0442\u043E \u0440\u0435\u0430\u043B\u044C\u043D\u043E \u043E\u0442\u0433\u0440\u0443\u0436\u0430\u0435\u0448\u044C \u0441\u0435\u0439\u0447\u0430\u0441. \u041E\u0441\u0442\u0430\u0442\u043E\u043A \u043E\u0441\u0442\u0430\u043D\u0435\u0442\u0441\u044F \u201C\u0432 \u0440\u0430\u0431\u043E\u0442\u0435\u201D.</div><div class="rounded-2xl border border-gray-200 overflow-hidden"><table class="min-w-full text-sm"><thead class="text-xs text-gray-500 bg-gray-50 border-b border-gray-200"><tr><th class="text-left p-3">\u041F\u043E\u0437\u0438\u0446\u0438\u044F</th><th class="text-right p-3">\u041E\u0442\u0433\u0440\u0443\u0437\u0438\u0442\u044C</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(partialItems), (qty, pid) => {
          var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
          _push(`<tr class="border-b border-gray-100"><td class="p-3"><div class="font-medium"><div class="flex flex-col gap-1"><div class="text-sm text-gray-900">${ssrInterpolate(((_b2 = (((_a2 = unref(orderDetail)) == null ? void 0 : _a2.lines) || []).find((x) => String(x.productId) === String(pid))) == null ? void 0 : _b2.name) || "\u2014")}</div>`);
          _push(ssrRenderComponent(_component_ProductLabel, {
            article: (_d2 = (((_c2 = unref(orderDetail)) == null ? void 0 : _c2.lines) || []).find((x) => String(x.productId) === String(pid))) == null ? void 0 : _d2.article,
            name: (_f2 = (((_e2 = unref(orderDetail)) == null ? void 0 : _e2.lines) || []).find((x) => String(x.productId) === String(pid))) == null ? void 0 : _f2.name,
            imageUrl: (_h2 = (((_g2 = unref(orderDetail)) == null ? void 0 : _g2.lines) || []).find((x) => String(x.productId) === String(pid))) == null ? void 0 : _h2.previewImageUrl
          }, null, _parent));
          _push(`</div></div></td><td class="p-3 text-right"><input type="number" min="0"${ssrRenderAttr("value", unref(partialItems)[Number(pid)])} class="w-28 px-3 py-2 rounded-xl border border-gray-200 text-right"></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div><div class="grid grid-cols-1 md:grid-cols-2 gap-3"><div><div class="text-xs text-gray-500">\u0414\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F</div><input${ssrRenderAttr("value", unref(partialDateTime))} type="datetime-local" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200"></div><div><div class="text-xs text-gray-500">\u041D\u043E\u043C\u0435\u0440 \u043D\u0430\u043A\u043B\u0430\u0434\u043D\u043E\u0439</div><input${ssrRenderAttr("value", unref(partialWaybill))} class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="\u041D\u0430\u043F\u0440. 123-XYZ"></div></div><div><div class="text-xs text-gray-500">\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439</div><textarea rows="3" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200" placeholder="\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439 / \u0434\u0435\u0442\u0430\u043B\u0438 \u043E\u0442\u043F\u0440\u0430\u0432\u043A\u0438">${ssrInterpolate(unref(partialComment))}</textarea></div><div><div class="text-xs text-gray-500">\u0424\u043E\u0442\u043E/\u0441\u043A\u0430\u043D (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)</div><input type="file" accept="image/*" class="mt-1 w-full"${ssrIncludeBooleanAttr(((_e = unref(auth).user) == null ? void 0 : _e.role) !== "admin") ? " disabled" : ""}>`);
        if (((_f = unref(auth).user) == null ? void 0 : _f.role) !== "admin") {
          _push(`<div class="text-xs text-gray-500 mt-1">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0430\u0434\u043C\u0438\u043D\u0443.</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="p-4 border-t border-gray-200 flex items-center justify-end gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0442\u043C\u0435\u043D\u0430</button><button class="px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95 disabled:opacity-50"${ssrIncludeBooleanAttr(unref(partialUploading)) ? " disabled" : ""}>${ssrInterpolate(unref(partialUploading) ? "\u0421\u043E\u0445\u0440\u0430\u043D\u044F\u044E\u2026" : "\u041E\u0442\u0433\u0440\u0443\u0437\u0438\u0442\u044C")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(modalDocsOpen)) {
        _push(`<div class="fixed inset-0 z-[1100] bg-black/40 flex items-center justify-center p-4"><div class="w-full max-w-xl rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="p-4 border-b border-gray-200 flex items-center justify-between"><div class="font-semibold">\u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B #${ssrInterpolate((_g = unref(active)) == null ? void 0 : _g.orderId)}</div><button class="w-9 h-9 rounded-xl border border-gray-200 hover:bg-gray-100">\u2715</button></div><div class="p-4 space-y-2 text-sm"><div class="flex items-center justify-between"><div class="text-gray-500">\u041D\u0430\u043A\u043B\u0430\u0434\u043D\u0430\u044F</div><div class="font-medium">${ssrInterpolate(((_h = unref(active)) == null ? void 0 : _h.waybillNumber) || "\u2014")}</div></div><div class="flex items-start justify-between gap-3"><div class="text-gray-500">\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439</div><div class="text-right">${ssrInterpolate(((_i = unref(active)) == null ? void 0 : _i.comment) || "\u2014")}</div></div><div class="pt-2"><div class="text-xs text-gray-500">\u0424\u043E\u0442\u043E/\u0441\u043A\u0430\u043D</div>`);
        if ((_j = unref(active)) == null ? void 0 : _j.photoUrl) {
          _push(`<div class="mt-2"><a${ssrRenderAttr("href", unref(active).photoUrl)} target="_blank" class="text-amber-700 hover:underline">\u041E\u0442\u043A\u0440\u044B\u0442\u044C</a><img${ssrRenderAttr("src", unref(active).photoUrl)} class="mt-2 rounded-2xl border border-gray-200 max-h-[320px] object-contain"></div>`);
        } else {
          _push(`<div class="text-sm text-gray-500 mt-1">\u2014</div>`);
        }
        _push(`</div></div><div class="p-4 border-t border-gray-200 flex items-center justify-end"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u0417\u0430\u043A\u0440\u044B\u0442\u044C</button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/shipments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=shipments-CVUiDaqX.mjs.map
