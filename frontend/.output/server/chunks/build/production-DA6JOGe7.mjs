import { defineComponent, ref, computed, watch, mergeProps, unref, useSSRContext } from 'vue';
import { u as useRuntimeConfig, b as useRoute } from './server.mjs';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
  __name: "production",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const viewMode = ref("table");
    const loading = ref(false);
    const error = ref(null);
    const status = ref("all");
    const q = ref("");
    const deadline = ref("all");
    const assignee = ref("");
    const tasks = ref([]);
    const drawerOpen = ref(false);
    const active = ref(null);
    const deadlineLocal = ref("");
    const metaSaving = ref(false);
    const actionLoading = ref({});
    const route = useRoute();
    function fmtDate(dt) {
      if (!dt) return "\u2014";
      const d = typeof dt === "string" ? new Date(dt) : dt;
      if (Number.isNaN(d.getTime())) return "\u2014";
      return d.toLocaleString();
    }
    function fmtShortDate(dt) {
      if (!dt) return "\u2014";
      const d = typeof dt === "string" ? new Date(dt) : dt;
      if (Number.isNaN(d.getTime())) return "\u2014";
      return d.toLocaleDateString();
    }
    function statusLabel(s) {
      if (s === "planned") return "planned";
      if (s === "in_work") return "in-progress";
      if (s === "ready") return "done";
      if (s === "canceled") return "canceled";
      return s;
    }
    function isOverdue(t) {
      if (!(t == null ? void 0 : t.deadlineAt)) return false;
      const d = new Date(t.deadlineAt);
      if (Number.isNaN(d.getTime())) return false;
      const now = /* @__PURE__ */ new Date();
      return d.getTime() < now.getTime() && t.status !== "ready" && t.status !== "canceled";
    }
    const filteredTasks = computed(() => {
      const list = Array.isArray(tasks.value) ? tasks.value : [];
      const a = String(assignee.value || "").trim().toLowerCase();
      const now = /* @__PURE__ */ new Date();
      const startOfToday = new Date(now);
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date(startOfToday);
      endOfToday.setDate(endOfToday.getDate() + 1);
      const endOfWeek = new Date(startOfToday);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      return list.filter((t) => {
        if (a && !String((t == null ? void 0 : t.assignee) || "").toLowerCase().includes(a)) return false;
        if (deadline.value === "all") return true;
        if (!(t == null ? void 0 : t.deadlineAt)) return false;
        const d = new Date(t.deadlineAt);
        if (Number.isNaN(d.getTime())) return false;
        if (deadline.value === "overdue") return d.getTime() < now.getTime();
        if (deadline.value === "today") return d.getTime() >= startOfToday.getTime() && d.getTime() < endOfToday.getTime();
        if (deadline.value === "week") return d.getTime() >= startOfToday.getTime() && d.getTime() < endOfWeek.getTime();
        return true;
      });
    });
    const kanban = computed(() => {
      const cols = { planned: [], in_work: [], ready: [], canceled: [] };
      for (const t of filteredTasks.value) {
        const key = String((t == null ? void 0 : t.status) || "planned");
        if (!cols[key]) cols[key] = [];
        cols[key].push(t);
      }
      return cols;
    });
    async function load() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/ops/production", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: {
            ...status.value === "all" ? {} : { status: status.value },
            ...q.value ? { q: q.value } : {}
          }
        });
        tasks.value = Array.isArray(res == null ? void 0 : res.tasks) ? res.tasks : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E";
      } finally {
        loading.value = false;
      }
    }
    watch([status, q], () => load());
    watch(
      () => route.query,
      (qry) => {
        const oid = String((qry == null ? void 0 : qry.orderId) || "").trim();
        if (oid) {
          q.value = oid;
        }
      },
      { immediate: true }
    );
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}><div class="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</h1><p class="text-sm text-gray-600 mt-1">\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u0430\u044F \u043E\u0447\u0435\u0440\u0435\u0434\u044C \u0437\u0430\u0434\u0430\u0447</p></div><div class="flex items-center gap-2 flex-wrap justify-end"><div class="inline-flex rounded-xl border border-gray-200 bg-white overflow-hidden"><button class="${ssrRenderClass([unref(viewMode) === "table" ? "bg-gray-50 font-medium" : "hover:bg-gray-50", "px-3 py-2 text-sm"])}"> \u0422\u0430\u0431\u043B\u0438\u0446\u0430 </button><button class="${ssrRenderClass([unref(viewMode) === "kanban" ? "bg-gray-50 font-medium" : "hover:bg-gray-50", "px-3 py-2 text-sm border-l border-gray-200"])}"> \u041A\u0430\u043D\u0431\u0430\u043D </button></div><input${ssrRenderAttr("value", unref(q))} placeholder="\u043F\u043E\u0438\u0441\u043A: \u0437\u0430\u043A\u0430\u0437 / \u0430\u0440\u0442\u0438\u043A\u0443\u043B / \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm w-[260px]"><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "all") : ssrLooseEqual(unref(status), "all")) ? " selected" : ""}>\u0412\u0441\u0435</option><option value="planned"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "planned") : ssrLooseEqual(unref(status), "planned")) ? " selected" : ""}>planned</option><option value="in_work"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "in_work") : ssrLooseEqual(unref(status), "in_work")) ? " selected" : ""}>in-progress</option><option value="ready"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "ready") : ssrLooseEqual(unref(status), "ready")) ? " selected" : ""}>done</option><option value="canceled"${ssrIncludeBooleanAttr(Array.isArray(unref(status)) ? ssrLooseContain(unref(status), "canceled") : ssrLooseEqual(unref(status), "canceled")) ? " selected" : ""}>canceled</option></select><select class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option value="all"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "all") : ssrLooseEqual(unref(deadline), "all")) ? " selected" : ""}>\u0414\u0435\u0434\u043B\u0430\u0439\u043D: \u0432\u0441\u0435</option><option value="overdue"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "overdue") : ssrLooseEqual(unref(deadline), "overdue")) ? " selected" : ""}>\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E</option><option value="today"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "today") : ssrLooseEqual(unref(deadline), "today")) ? " selected" : ""}>\u0421\u0435\u0433\u043E\u0434\u043D\u044F</option><option value="week"${ssrIncludeBooleanAttr(Array.isArray(unref(deadline)) ? ssrLooseContain(unref(deadline), "week") : ssrLooseEqual(unref(deadline), "week")) ? " selected" : ""}>\u041D\u0435\u0434\u0435\u043B\u044F</option></select><input${ssrRenderAttr("value", unref(assignee))} placeholder="\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439" class="px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm w-[180px]"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"> \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button></div></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
      } else if (unref(viewMode) === "table") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u0417\u0430\u0434\u0430\u0447\u0430</th><th class="text-left px-4 py-3">\u0417\u0430\u043A\u0430\u0437</th><th class="text-left px-4 py-3">\u0427\u0442\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u0435\u0441\u0442\u0438</th><th class="text-right px-4 py-3">\u041A\u043E\u043B-\u0432\u043E</th><th class="text-left px-4 py-3">\u0414\u0435\u0434\u043B\u0430\u0439\u043D</th><th class="text-left px-4 py-3">\u0417\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438</th><th class="text-left px-4 py-3">\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-4 py-3">\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439</th><th class="text-left px-4 py-3">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(filteredTasks), (t) => {
          var _a2, _b2;
          _push(`<tr class="border-t border-gray-100 hover:bg-gray-50"><td class="px-4 py-3 cursor-pointer"><div class="font-medium">#${ssrInterpolate(t.id)}</div><div class="text-xs text-gray-500">\u0441\u043E\u0437\u0434\u0430\u043D\u043E: ${ssrInterpolate(fmtShortDate(t.createdAt))}</div></td><td class="px-4 py-3 tabular-nums">#${ssrInterpolate(t.orderId)}</td><td class="px-4 py-3"><div class="font-medium">${ssrInterpolate(((_a2 = t.product) == null ? void 0 : _a2.name) || "Product #" + t.productId)}</div><div class="text-xs text-gray-500">${ssrInterpolate(((_b2 = t.product) == null ? void 0 : _b2.article) || "\u2014")}</div></td><td class="px-4 py-3 text-right tabular-nums">${ssrInterpolate(t.qty)}</td><td class="px-4 py-3"><div class="${ssrRenderClass(isOverdue(t) ? "text-rose-700 font-medium" : "")}">${ssrInterpolate(fmtShortDate(t.deadlineAt))}</div></td><td class="px-4 py-3"><span class="${ssrRenderClass([t.blanksStatus === "OK" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200", "inline-flex items-center px-2 py-1 rounded-lg text-xs border"])}">${ssrInterpolate(t.blanksStatus || "\u2014")}</span></td><td class="px-4 py-3"><span class="inline-flex items-center px-2 py-1 rounded-lg text-xs border bg-gray-50 text-gray-700 border-gray-200">${ssrInterpolate(statusLabel(t.status))}</span></td><td class="px-4 py-3">${ssrInterpolate(t.assignee || "\u2014")}</td><td class="px-4 py-3"><div class="flex flex-wrap gap-2"><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"${ssrIncludeBooleanAttr(unref(actionLoading)["status:" + t.id]) ? " disabled" : ""}> \u0421\u0442\u0430\u0440\u0442 </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"${ssrIncludeBooleanAttr(unref(actionLoading)["finish:" + t.id]) ? " disabled" : ""}> \u0413\u043E\u0442\u043E\u0432\u043E </button><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"${ssrIncludeBooleanAttr(unref(actionLoading)["status:" + t.id]) ? " disabled" : ""}> \u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C </button></div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(filteredTasks).length === 0) {
          _push(`<tr><td colspan="9" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      } else {
        _push(`<div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 bg-gray-50 text-sm font-medium">planned</div><div class="p-3 space-y-2"><!--[-->`);
        ssrRenderList(unref(kanban).planned, (t) => {
          var _a2;
          _push(`<button class="w-full text-left rounded-xl border border-gray-200 hover:bg-gray-50 px-3 py-2"><div class="flex items-center justify-between"><div class="font-medium">#${ssrInterpolate(t.id)} \xB7 #${ssrInterpolate(t.orderId)}</div><span class="${ssrRenderClass([t.blanksStatus === "OK" ? "text-emerald-700" : "text-rose-700", "text-xs"])}">${ssrInterpolate(t.blanksStatus)}</span></div><div class="text-xs text-gray-500 mt-1">${ssrInterpolate(((_a2 = t.product) == null ? void 0 : _a2.name) || "Product #" + t.productId)} \xB7 ${ssrInterpolate(t.qty)} \u0448\u0442</div><div class="${ssrRenderClass([isOverdue(t) ? "text-rose-700" : "text-gray-500", "text-xs mt-1"])}">\u0414\u0435\u0434\u043B\u0430\u0439\u043D: ${ssrInterpolate(fmtShortDate(t.deadlineAt))}</div></button>`);
        });
        _push(`<!--]-->`);
        if (unref(kanban).planned.length === 0) {
          _push(`<div class="text-center text-sm text-gray-500 py-6">\u2014</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 bg-gray-50 text-sm font-medium">in-progress</div><div class="p-3 space-y-2"><!--[-->`);
        ssrRenderList(unref(kanban).in_work, (t) => {
          var _a2;
          _push(`<button class="w-full text-left rounded-xl border border-gray-200 hover:bg-gray-50 px-3 py-2"><div class="flex items-center justify-between"><div class="font-medium">#${ssrInterpolate(t.id)} \xB7 #${ssrInterpolate(t.orderId)}</div><span class="${ssrRenderClass([t.blanksStatus === "OK" ? "text-emerald-700" : "text-rose-700", "text-xs"])}">${ssrInterpolate(t.blanksStatus)}</span></div><div class="text-xs text-gray-500 mt-1">${ssrInterpolate(((_a2 = t.product) == null ? void 0 : _a2.name) || "Product #" + t.productId)} \xB7 ${ssrInterpolate(t.qty)} \u0448\u0442</div><div class="${ssrRenderClass([isOverdue(t) ? "text-rose-700" : "text-gray-500", "text-xs mt-1"])}">\u0414\u0435\u0434\u043B\u0430\u0439\u043D: ${ssrInterpolate(fmtShortDate(t.deadlineAt))}</div></button>`);
        });
        _push(`<!--]-->`);
        if (unref(kanban).in_work.length === 0) {
          _push(`<div class="text-center text-sm text-gray-500 py-6">\u2014</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 bg-gray-50 text-sm font-medium">done</div><div class="p-3 space-y-2"><!--[-->`);
        ssrRenderList(unref(kanban).ready, (t) => {
          var _a2;
          _push(`<button class="w-full text-left rounded-xl border border-gray-200 hover:bg-gray-50 px-3 py-2"><div class="font-medium">#${ssrInterpolate(t.id)} \xB7 #${ssrInterpolate(t.orderId)}</div><div class="text-xs text-gray-500 mt-1">${ssrInterpolate(((_a2 = t.product) == null ? void 0 : _a2.name) || "Product #" + t.productId)} \xB7 ${ssrInterpolate(t.qty)} \u0448\u0442</div><div class="text-xs text-emerald-700 mt-1">\u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435: ${ssrInterpolate(fmtShortDate(t.movedToStockAt))}</div></button>`);
        });
        _push(`<!--]-->`);
        if (unref(kanban).ready.length === 0) {
          _push(`<div class="text-center text-sm text-gray-500 py-6">\u2014</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
      }
      if (unref(drawerOpen)) {
        _push(`<div class="fixed inset-0 z-[1100]"><div class="absolute inset-0 bg-black/20"></div><div class="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white shadow-xl border-l border-gray-200 flex flex-col"><div class="px-5 py-4 border-b border-gray-200 flex items-start justify-between gap-3"><div><div class="text-xs text-gray-500">\u0417\u0430\u0434\u0430\u043D\u0438\u0435</div><div class="text-lg font-semibold">#${ssrInterpolate((_a = unref(active)) == null ? void 0 : _a.id)} \xB7 \u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate((_b = unref(active)) == null ? void 0 : _b.orderId)}</div><div class="text-sm text-gray-600 mt-1">${ssrInterpolate(((_d = (_c = unref(active)) == null ? void 0 : _c.product) == null ? void 0 : _d.name) || "Product #" + ((_e = unref(active)) == null ? void 0 : _e.productId))} \xB7 ${ssrInterpolate((_f = unref(active)) == null ? void 0 : _f.qty)} \u0448\u0442</div></div><button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-sm">\u2715</button></div><div class="p-5 space-y-6 overflow-auto"><div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><div><div class="text-xs text-gray-500">\u0414\u0435\u0434\u043B\u0430\u0439\u043D</div><input${ssrRenderAttr("value", unref(deadlineLocal))} type="datetime-local" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"></div><div><div class="text-xs text-gray-500">\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439</div><input${ssrRenderAttr("value", unref(active).assignee)} placeholder="\u0424\u0418\u041E/\u043D\u0438\u043A" class="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"></div></div><div class="flex gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(metaSaving)) ? " disabled" : ""}> \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C </button><span class="text-xs text-gray-500 self-center">\u0421\u0442\u0430\u0442\u0443\u0441: ${ssrInterpolate(statusLabel((_g = unref(active)) == null ? void 0 : _g.status))}</span></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 bg-gray-50 text-sm font-medium">\u041D\u0443\u0436\u043D\u044B\u0435 \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438</div><div class="p-4"><!--[-->`);
        ssrRenderList(((_h = unref(active)) == null ? void 0 : _h.blanks) || [], (b) => {
          _push(`<div class="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"><div><div class="font-medium text-sm">${ssrInterpolate(b.name || "Product #" + b.productId)}</div><div class="text-xs text-gray-500">${ssrInterpolate(b.article || "\u2014")}</div></div><div class="text-right text-sm"><div class="tabular-nums">\u041D\u0430\u0434\u043E: ${ssrInterpolate(b.needQty)}</div><div class="text-xs text-gray-500 tabular-nums">\u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E: ${ssrInterpolate(b.availableQty)}</div></div></div>`);
        });
        _push(`<!--]--><div class="mt-3 flex flex-wrap gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(actionLoading)["reserve:" + ((_i = unref(active)) == null ? void 0 : _i.id)]) ? " disabled" : ""}> \u0417\u0430\u0440\u0435\u0437\u0435\u0440\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438 </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(actionLoading)["start:" + ((_j = unref(active)) == null ? void 0 : _j.id)]) ? " disabled" : ""}> \u0421\u0442\u0430\u0440\u0442 (\u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0442\u0430\u0442\u0443\u0441) </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(actionLoading)["start:" + ((_k = unref(active)) == null ? void 0 : _k.id)]) ? " disabled" : ""}> \u0421\u043F\u0438\u0441\u0430\u0442\u044C \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438 \u043F\u0440\u0438 \u0441\u0442\u0430\u0440\u0442\u0435 </button></div></div></div><div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="px-4 py-3 bg-gray-50 text-sm font-medium">\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0435</div><div class="p-4 space-y-3"><div class="text-sm text-gray-600">\u041F\u0440\u0438 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0438 \u043E\u043F\u0440\u0438\u0445\u043E\u0434\u0443\u0435\u043C \u0433\u043E\u0442\u043E\u0432\u043E\u0435 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u0441\u043A\u043B\u0430\u0434 (\u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E).</div><div class="flex flex-wrap gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(actionLoading)["finish:" + ((_l = unref(active)) == null ? void 0 : _l.id)]) ? " disabled" : ""}> \u041E\u043F\u0440\u0438\u0445\u043E\u0434\u043E\u0432\u0430\u0442\u044C \u0433\u043E\u0442\u043E\u0432\u043E\u0435 </button><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"${ssrIncludeBooleanAttr(unref(actionLoading)["status:" + ((_m = unref(active)) == null ? void 0 : _m.id)]) ? " disabled" : ""}> \u041E\u0442\u043C\u0435\u043D\u0438\u0442\u044C \u0437\u0430\u0434\u0430\u0447\u0443 </button></div><div class="text-xs text-gray-500"> \u0421\u0442\u0430\u0440\u0442: ${ssrInterpolate(fmtDate((_n = unref(active)) == null ? void 0 : _n.startedAt))} \xB7 \u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043E: ${ssrInterpolate(fmtDate((_o = unref(active)) == null ? void 0 : _o.finishedAt))} \xB7 \u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435: ${ssrInterpolate(fmtDate((_p = unref(active)) == null ? void 0 : _p.movedToStockAt))}</div></div></div></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/b2b/admin/production.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=production-DA6JOGe7.mjs.map
