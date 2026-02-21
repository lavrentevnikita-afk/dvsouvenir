import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminSelect-4bn3Tbjh.mjs';
import { _ as _sfc_main$5 } from './AdminInput-CTfEX194.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, isRef, createBlock, createCommentVNode, openBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrRenderClass, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
    const apiBaseUrl = config.apiBaseUrl;
    const priority = ref("all");
    const deadline = ref("all");
    const assignee = ref("");
    const loading = ref(false);
    const error = ref(null);
    const orders = ref([]);
    const openRow = ref({});
    const busy = ref({});
    function toggleRow(id) {
      openRow.value = { ...openRow.value, [id]: !openRow.value[id] };
    }
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
    async function load() {
      var _a, _b;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/ops/in-work", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: {
            priority: priority.value === "all" ? void 0 : priority.value,
            deadline: deadline.value === "all" ? void 0 : deadline.value,
            assignee: ((_a = assignee.value) == null ? void 0 : _a.trim()) ? assignee.value.trim() : void 0,
            warehouse: "FINISHED"
          }
        });
        orders.value = Array.isArray(res == null ? void 0 : res.orders) ? res.orders : [];
      } catch (e) {
        error.value = ((_b = e == null ? void 0 : e.data) == null ? void 0 : _b.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A";
      } finally {
        loading.value = false;
      }
    }
    async function setMeta(id, patch) {
      if (!auth.accessToken) return;
      const key = `meta:${id}`;
      if (busy.value[key]) return;
      busy.value = { ...busy.value, [key]: true };
      try {
        await $fetch(`/api/ops/in-work/${id}/meta`, {
          baseURL: apiBaseUrl,
          method: "PATCH",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: patch
        });
        await load();
      } finally {
        const next = { ...busy.value };
        delete next[key];
        busy.value = next;
      }
    }
    async function toggleItem(orderId, productId, checked) {
      var _a;
      if (!auth.accessToken) return;
      const key = `${orderId}:${productId}`;
      if (busy.value[key]) return;
      busy.value = { ...busy.value, [key]: true };
      try {
        await $fetch(`/api/ops/in-work/${orderId}/check`, {
          baseURL: apiBaseUrl,
          method: "PATCH",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { productId, checked }
        });
        const idx = orders.value.findIndex((o) => o.id === orderId);
        if (idx >= 0) {
          const o = { ...orders.value[idx] };
          const lines = (o.lines || []).map((l) => l.productId === productId ? { ...l, checked } : l);
          o.lines = lines;
          o.allChecked = lines.length ? lines.every((l) => l.checked) : false;
          o.allStockOk = lines.length ? lines.every((l) => l.stockOk) : false;
          orders.value.splice(idx, 1, o);
        }
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C \u0447\u0435\u043A-\u043B\u0438\u0441\u0442";
      } finally {
        const next = { ...busy.value };
        delete next[key];
        busy.value = next;
      }
    }
    async function readyToShip(orderId) {
      var _a;
      if (!auth.accessToken) return;
      const key = `ready:${orderId}`;
      if (busy.value[key]) return;
      busy.value = { ...busy.value, [key]: true };
      try {
        await $fetch(`/api/ops/in-work/${orderId}/ready`, {
          baseURL: apiBaseUrl,
          method: "POST",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { warehouse: "FINISHED" }
        });
        await load();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C \u0433\u043E\u0442\u043E\u0432\u043D\u043E\u0441\u0442\u044C \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435";
      } finally {
        const next = { ...busy.value };
        delete next[key];
        busy.value = next;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminSelect = _sfc_main$4;
      const _component_AdminInput = _sfc_main$5;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",
        description: "\u0421\u0431\u043E\u0440\u043A\u0430/\u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442\u0430\u0446\u0438\u044F: \u0447\u0442\u043E \u0441\u0435\u0439\u0447\u0430\u0441 \u0441\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u0438 \u0447\u0442\u043E \u0443\u0436\u0435 \u043C\u043E\u0436\u043D\u043E \u043E\u0442\u0434\u0430\u0432\u0430\u0442\u044C \u0432 \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0443",
        icon: "\u{1F4E6}"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminButton, { onClick: load }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C`);
                } else {
                  return [
                    createTextVNode("\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminButton, { onClick: load }, {
                default: withCtx(() => [
                  createTextVNode("\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C")
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AdminCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="grid grid-cols-1 lg:grid-cols-4 gap-4"${_scopeId}><div${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</label>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(priority),
              "onUpdate:modelValue": ($event) => isRef(priority) ? priority.value = $event : null,
              options: [
                { value: "all", label: "\u041B\u044E\u0431\u043E\u0439" },
                { value: "1", label: "1 \u2014 \u0432\u044B\u0441\u043E\u043A\u0438\u0439" },
                { value: "2", label: "2 \u2014 \u0441\u0440\u0435\u0434\u043D\u0438\u0439" },
                { value: "3", label: "3 \u2014 \u043E\u0431\u044B\u0447\u043D\u044B\u0439" }
              ]
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u0414\u0435\u0434\u043B\u0430\u0439\u043D</label>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(deadline),
              "onUpdate:modelValue": ($event) => isRef(deadline) ? deadline.value = $event : null,
              options: [
                { value: "all", label: "\u041B\u044E\u0431\u043E\u0439" },
                { value: "overdue", label: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435" },
                { value: "today", label: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F" },
                { value: "week", label: "\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 7 \u0434\u043D\u0435\u0439" },
                { value: "none", label: "\u0411\u0435\u0437 \u0434\u0435\u0434\u043B\u0430\u0439\u043D\u0430" }
              ]
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439</label>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(assignee),
              "onUpdate:modelValue": ($event) => isRef(assignee) ? assignee.value = $event : null,
              placeholder: "\u0418\u043C\u044F/\u043B\u043E\u0433\u0438\u043D",
              icon: "search"
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="flex items-end gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminButton, { onClick: load }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C`);
                } else {
                  return [
                    createTextVNode("\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminButton, {
              variant: "ghost",
              onClick: ($event) => {
                priority.value = "all";
                deadline.value = "all";
                assignee.value = "";
                load();
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` \u0421\u0431\u0440\u043E\u0441 `);
                } else {
                  return [
                    createTextVNode(" \u0421\u0431\u0440\u043E\u0441 ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "grid grid-cols-1 lg:grid-cols-4 gap-4" }, [
                createVNode("div", null, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442"),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(priority),
                    "onUpdate:modelValue": ($event) => isRef(priority) ? priority.value = $event : null,
                    options: [
                      { value: "all", label: "\u041B\u044E\u0431\u043E\u0439" },
                      { value: "1", label: "1 \u2014 \u0432\u044B\u0441\u043E\u043A\u0438\u0439" },
                      { value: "2", label: "2 \u2014 \u0441\u0440\u0435\u0434\u043D\u0438\u0439" },
                      { value: "3", label: "3 \u2014 \u043E\u0431\u044B\u0447\u043D\u044B\u0439" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u0414\u0435\u0434\u043B\u0430\u0439\u043D"),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(deadline),
                    "onUpdate:modelValue": ($event) => isRef(deadline) ? deadline.value = $event : null,
                    options: [
                      { value: "all", label: "\u041B\u044E\u0431\u043E\u0439" },
                      { value: "overdue", label: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435" },
                      { value: "today", label: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F" },
                      { value: "week", label: "\u0411\u043B\u0438\u0436\u0430\u0439\u0448\u0438\u0435 7 \u0434\u043D\u0435\u0439" },
                      { value: "none", label: "\u0411\u0435\u0437 \u0434\u0435\u0434\u043B\u0430\u0439\u043D\u0430" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439"),
                  createVNode(_component_AdminInput, {
                    modelValue: unref(assignee),
                    "onUpdate:modelValue": ($event) => isRef(assignee) ? assignee.value = $event : null,
                    placeholder: "\u0418\u043C\u044F/\u043B\u043E\u0433\u0438\u043D",
                    icon: "search"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", { class: "flex items-end gap-2" }, [
                  createVNode(_component_AdminButton, { onClick: load }, {
                    default: withCtx(() => [
                      createTextVNode("\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C")
                    ]),
                    _: 1
                  }),
                  createVNode(_component_AdminButton, {
                    variant: "ghost",
                    onClick: ($event) => {
                      priority.value = "all";
                      deadline.value = "all";
                      assignee.value = "";
                      load();
                    }
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u0421\u0431\u0440\u043E\u0441 ")
                    ]),
                    _: 1
                  }, 8, ["onClick"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></div>`);
      } else {
        _push(ssrRenderComponent(_component_AdminCard, { padding: false }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="overflow-auto"${_scopeId}><table class="min-w-[1100px] w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr class="text-left"${_scopeId}><th class="px-5 py-3.5 font-semibold"${_scopeId}>\u0417\u0430\u043A\u0430\u0437</th><th class="px-5 py-3.5 font-semibold"${_scopeId}>\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0431\u0440\u0430\u0442\u044C</th><th class="px-5 py-3.5 font-semibold"${_scopeId}>\u041D\u0430\u043B\u0438\u0447\u0438\u0435 \u043F\u043E \u0441\u043A\u043B\u0430\u0434\u0443</th><th class="px-5 py-3.5 font-semibold"${_scopeId}>\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0441\u0431\u043E\u0440\u043A\u0438</th><th class="px-5 py-3.5 font-semibold text-right"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(orders), (o) => {
                _push2(`<!--[--><tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-4 py-3 align-top"${_scopeId}><div class="flex items-start gap-3"${_scopeId}><button class="mt-0.5 w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"${ssrRenderAttr("aria-label", unref(openRow)[o.id] ? "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C" : "\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C")}${_scopeId}>${ssrInterpolate(unref(openRow)[o.id] ? "\u2013" : "+")}</button><div${_scopeId}><div class="font-semibold"${_scopeId}>#${ssrInterpolate(o.id)}</div><div class="text-xs text-gray-500"${_scopeId}>${ssrInterpolate(o.customerName)} \xB7 ${ssrInterpolate(o.totalPrice)} \u20BD</div><div class="text-xs text-gray-500 mt-1"${_scopeId}>\u0421\u043E\u0437\u0434\u0430\u043D: ${ssrInterpolate(humanDateShort(o.createdAt))}</div><div class="flex flex-wrap items-center gap-2 mt-2"${_scopeId}><span class="${ssrRenderClass([deadlineBadge(o.deadlineAt).cls, "text-[11px] px-2 py-1 rounded-full border"])}"${_scopeId}>${ssrInterpolate(deadlineBadge(o.deadlineAt).text)}</span>`);
                if (o.priority) {
                  _push2(`<span class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700"${_scopeId}> \u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442: ${ssrInterpolate(o.priority)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                if (o.assignee) {
                  _push2(`<span class="text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700"${_scopeId}>${ssrInterpolate(o.assignee)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div></div></td><td class="px-4 py-3 align-top"${_scopeId}><div class="space-y-1"${_scopeId}><!--[-->`);
                ssrRenderList((o.lines || []).slice(0, 3), (l) => {
                  _push2(`<div class="text-xs"${_scopeId}><span class="font-medium"${_scopeId}>${ssrInterpolate(l.name || "#" + l.productId)}</span><span class="text-gray-500"${_scopeId}> \u2014 ${ssrInterpolate(l.quantity)} \u0448\u0442.</span></div>`);
                });
                _push2(`<!--]-->`);
                if ((o.lines || []).length > 3) {
                  _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u0438 \u0435\u0449\u0451 ${ssrInterpolate((o.lines || []).length - 3)}\u2026</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if ((o.lines || []).length === 0) {
                  _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u2014</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></td><td class="px-4 py-3 align-top"${_scopeId}><div class="space-y-1"${_scopeId}><!--[-->`);
                ssrRenderList((o.lines || []).slice(0, 3), (l) => {
                  _push2(`<div class="text-xs"${_scopeId}><span class="text-gray-700"${_scopeId}>${ssrInterpolate(l.stock.available)} / ${ssrInterpolate(l.quantity)}</span><span class="${ssrRenderClass([l.stockOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200", "ml-2 text-[11px] px-2 py-0.5 rounded-full border"])}"${_scopeId}>${ssrInterpolate(l.stockOk ? "OK" : "\u0414\u0435\u0444\u0438\u0446\u0438\u0442")}</span></div>`);
                });
                _push2(`<!--]-->`);
                if ((o.lines || []).length > 3) {
                  _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u2026</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if ((o.lines || []).length === 0) {
                  _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u2014</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></td><td class="px-4 py-3 align-top"${_scopeId}><div class="text-xs"${_scopeId}><span class="font-semibold tabular-nums"${_scopeId}>${ssrInterpolate((o.lines || []).filter((l) => l.checked).length)}</span><span class="text-gray-500"${_scopeId}> / ${ssrInterpolate((o.lines || []).length)} \u0441\u043E\u0431\u0440.</span></div><div class="${ssrRenderClass([o.allChecked ? "text-green-700" : "text-gray-500", "text-[11px] mt-1"])}"${_scopeId}>${ssrInterpolate(o.allChecked ? "\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0437\u0430\u043A\u0440\u044B\u0442" : "\u041D\u0443\u0436\u043D\u043E \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438")}</div></td><td class="px-4 py-3 align-top"${_scopeId}><div class="flex justify-end gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/admin/orders?q=${o.id}`,
                  class: "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u041E\u0442\u043A\u0440\u044B\u0442\u044C `);
                    } else {
                      return [
                        createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`<button class="${ssrRenderClass([o.allChecked && o.allStockOk ? "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed", "px-3 py-2 rounded-xl text-xs"])}"${ssrIncludeBooleanAttr(!(o.allChecked && o.allStockOk) || unref(busy)[`ready:${o.id}`]) ? " disabled" : ""}${_scopeId}> \u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435 </button></div></td></tr>`);
                if (unref(openRow)[o.id]) {
                  _push2(`<tr class="border-t border-gray-100 bg-white"${_scopeId}><td class="px-4 py-4" colspan="5"${_scopeId}><div class="grid grid-cols-1 lg:grid-cols-3 gap-4"${_scopeId}><div class="lg:col-span-2"${_scopeId}><div class="text-xs font-semibold text-gray-700 mb-2"${_scopeId}>\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0441\u0431\u043E\u0440\u043A\u0438</div><div class="rounded-2xl border border-gray-200 overflow-hidden"${_scopeId}><!--[-->`);
                  ssrRenderList(o.lines || [], (l) => {
                    _push2(`<div class="flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 first:border-t-0"${_scopeId}><label class="flex items-start gap-3 min-w-0"${_scopeId}><input type="checkbox" class="mt-1"${ssrIncludeBooleanAttr(l.checked) ? " checked" : ""}${ssrIncludeBooleanAttr(unref(busy)[`${o.id}:${l.productId}`]) ? " disabled" : ""}${_scopeId}><div class="min-w-0"${_scopeId}><div class="text-sm font-medium truncate"${_scopeId}>${ssrInterpolate(l.name || "#" + l.productId)}</div><div class="text-xs text-gray-500"${_scopeId}>ID: ${ssrInterpolate(l.productId)} \xB7 \u041D\u0443\u0436\u043D\u043E: ${ssrInterpolate(l.quantity)} \u0448\u0442.</div></div></label><div class="text-right"${_scopeId}><div class="text-sm tabular-nums"${_scopeId}>${ssrInterpolate(l.stock.available)} / ${ssrInterpolate(l.quantity)}</div><div class="text-[11px] mt-1"${_scopeId}><span class="${ssrRenderClass([l.stockOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200", "px-2 py-0.5 rounded-full border"])}"${_scopeId}>${ssrInterpolate(l.stockOk ? "\u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 OK" : "\u0414\u0435\u0444\u0438\u0446\u0438\u0442")}</span></div></div></div>`);
                  });
                  _push2(`<!--]-->`);
                  if ((o.lines || []).length === 0) {
                    _push2(`<div class="px-4 py-3 text-sm text-gray-500"${_scopeId}>\u041F\u043E\u0437\u0438\u0446\u0438\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</div>`);
                  } else {
                    _push2(`<!---->`);
                  }
                  _push2(`</div></div><div${_scopeId}><div class="text-xs font-semibold text-gray-700 mb-2"${_scopeId}>\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0437\u0430\u0434\u0430\u0447\u0438</div><div class="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3"${_scopeId}><div${_scopeId}><div class="text-[11px] font-semibold text-gray-700 mb-1"${_scopeId}>\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</div><select class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"${ssrRenderAttr("value", o.priority || "")}${_scopeId}><option value=""${_scopeId}>\u2014</option><option value="1"${_scopeId}>1 \u2014 \u0432\u044B\u0441\u043E\u043A\u0438\u0439</option><option value="2"${_scopeId}>2 \u2014 \u0441\u0440\u0435\u0434\u043D\u0438\u0439</option><option value="3"${_scopeId}>3 \u2014 \u043E\u0431\u044B\u0447\u043D\u044B\u0439</option></select></div><div${_scopeId}><div class="text-[11px] font-semibold text-gray-700 mb-1"${_scopeId}>\u0414\u0435\u0434\u043B\u0430\u0439\u043D</div><input type="datetime-local" class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"${ssrRenderAttr("value", o.deadlineAt ? new Date(o.deadlineAt).toISOString().slice(0, 16) : "")}${_scopeId}></div><div${_scopeId}><div class="text-[11px] font-semibold text-gray-700 mb-1"${_scopeId}>\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439</div><input class="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white"${ssrRenderAttr("value", o.assignee || "")} placeholder="\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0438\u043A\u0438\u0442\u0430"${_scopeId}></div><div class="pt-1"${_scopeId}><button class="${ssrRenderClass([o.allChecked && o.allStockOk ? "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed", "w-full px-3 py-2 rounded-xl text-sm"])}"${ssrIncludeBooleanAttr(!(o.allChecked && o.allStockOk) || unref(busy)[`ready:${o.id}`]) ? " disabled" : ""}${_scopeId}> \u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435 </button><p class="text-[11px] text-gray-500 mt-2"${_scopeId}> \u041A\u043D\u043E\u043F\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430, \u043A\u043E\u0433\u0434\u0430 \u0432\u0441\u0451 \u0441\u043E\u0431\u0440\u0430\u043D\u043E \u0438 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u0430. </p></div></div></div></div></td></tr>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`<!--]-->`);
              });
              _push2(`<!--]-->`);
              if (unref(orders).length === 0) {
                _push2(`<tr${_scopeId}><td colspan="5" class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F4E6}</div><div${_scopeId}>\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \xAB\u0412 \u0440\u0430\u0431\u043E\u0442\u0435\xBB</div></td></tr>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</tbody></table></div>`);
            } else {
              return [
                createVNode("div", { class: "overflow-auto" }, [
                  createVNode("table", { class: "min-w-[1100px] w-full text-sm" }, [
                    createVNode("thead", { class: "bg-slate-50 text-xs text-slate-600 uppercase tracking-wide" }, [
                      createVNode("tr", { class: "text-left" }, [
                        createVNode("th", { class: "px-5 py-3.5 font-semibold" }, "\u0417\u0430\u043A\u0430\u0437"),
                        createVNode("th", { class: "px-5 py-3.5 font-semibold" }, "\u0427\u0442\u043E \u043D\u0443\u0436\u043D\u043E \u0441\u043E\u0431\u0440\u0430\u0442\u044C"),
                        createVNode("th", { class: "px-5 py-3.5 font-semibold" }, "\u041D\u0430\u043B\u0438\u0447\u0438\u0435 \u043F\u043E \u0441\u043A\u043B\u0430\u0434\u0443"),
                        createVNode("th", { class: "px-5 py-3.5 font-semibold" }, "\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0441\u0431\u043E\u0440\u043A\u0438"),
                        createVNode("th", { class: "px-5 py-3.5 font-semibold text-right" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(orders), (o) => {
                        return openBlock(), createBlock(Fragment, {
                          key: o.id
                        }, [
                          createVNode("tr", { class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors" }, [
                            createVNode("td", { class: "px-4 py-3 align-top" }, [
                              createVNode("div", { class: "flex items-start gap-3" }, [
                                createVNode("button", {
                                  class: "mt-0.5 w-7 h-7 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs",
                                  onClick: ($event) => toggleRow(o.id),
                                  "aria-label": unref(openRow)[o.id] ? "\u0421\u0432\u0435\u0440\u043D\u0443\u0442\u044C" : "\u0420\u0430\u0437\u0432\u0435\u0440\u043D\u0443\u0442\u044C"
                                }, toDisplayString(unref(openRow)[o.id] ? "\u2013" : "+"), 9, ["onClick", "aria-label"]),
                                createVNode("div", null, [
                                  createVNode("div", { class: "font-semibold" }, "#" + toDisplayString(o.id), 1),
                                  createVNode("div", { class: "text-xs text-gray-500" }, toDisplayString(o.customerName) + " \xB7 " + toDisplayString(o.totalPrice) + " \u20BD", 1),
                                  createVNode("div", { class: "text-xs text-gray-500 mt-1" }, "\u0421\u043E\u0437\u0434\u0430\u043D: " + toDisplayString(humanDateShort(o.createdAt)), 1),
                                  createVNode("div", { class: "flex flex-wrap items-center gap-2 mt-2" }, [
                                    createVNode("span", {
                                      class: ["text-[11px] px-2 py-1 rounded-full border", deadlineBadge(o.deadlineAt).cls]
                                    }, toDisplayString(deadlineBadge(o.deadlineAt).text), 3),
                                    o.priority ? (openBlock(), createBlock("span", {
                                      key: 0,
                                      class: "text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700"
                                    }, " \u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442: " + toDisplayString(o.priority), 1)) : createCommentVNode("", true),
                                    o.assignee ? (openBlock(), createBlock("span", {
                                      key: 1,
                                      class: "text-[11px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-700"
                                    }, toDisplayString(o.assignee), 1)) : createCommentVNode("", true)
                                  ])
                                ])
                              ])
                            ]),
                            createVNode("td", { class: "px-4 py-3 align-top" }, [
                              createVNode("div", { class: "space-y-1" }, [
                                (openBlock(true), createBlock(Fragment, null, renderList((o.lines || []).slice(0, 3), (l) => {
                                  return openBlock(), createBlock("div", {
                                    key: l.productId,
                                    class: "text-xs"
                                  }, [
                                    createVNode("span", { class: "font-medium" }, toDisplayString(l.name || "#" + l.productId), 1),
                                    createVNode("span", { class: "text-gray-500" }, " \u2014 " + toDisplayString(l.quantity) + " \u0448\u0442.", 1)
                                  ]);
                                }), 128)),
                                (o.lines || []).length > 3 ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "text-xs text-gray-500"
                                }, "\u0438 \u0435\u0449\u0451 " + toDisplayString((o.lines || []).length - 3) + "\u2026", 1)) : createCommentVNode("", true),
                                (o.lines || []).length === 0 ? (openBlock(), createBlock("div", {
                                  key: 1,
                                  class: "text-xs text-gray-500"
                                }, "\u2014")) : createCommentVNode("", true)
                              ])
                            ]),
                            createVNode("td", { class: "px-4 py-3 align-top" }, [
                              createVNode("div", { class: "space-y-1" }, [
                                (openBlock(true), createBlock(Fragment, null, renderList((o.lines || []).slice(0, 3), (l) => {
                                  return openBlock(), createBlock("div", {
                                    key: l.productId,
                                    class: "text-xs"
                                  }, [
                                    createVNode("span", { class: "text-gray-700" }, toDisplayString(l.stock.available) + " / " + toDisplayString(l.quantity), 1),
                                    createVNode("span", {
                                      class: ["ml-2 text-[11px] px-2 py-0.5 rounded-full border", l.stockOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"]
                                    }, toDisplayString(l.stockOk ? "OK" : "\u0414\u0435\u0444\u0438\u0446\u0438\u0442"), 3)
                                  ]);
                                }), 128)),
                                (o.lines || []).length > 3 ? (openBlock(), createBlock("div", {
                                  key: 0,
                                  class: "text-xs text-gray-500"
                                }, "\u2026")) : createCommentVNode("", true),
                                (o.lines || []).length === 0 ? (openBlock(), createBlock("div", {
                                  key: 1,
                                  class: "text-xs text-gray-500"
                                }, "\u2014")) : createCommentVNode("", true)
                              ])
                            ]),
                            createVNode("td", { class: "px-4 py-3 align-top" }, [
                              createVNode("div", { class: "text-xs" }, [
                                createVNode("span", { class: "font-semibold tabular-nums" }, toDisplayString((o.lines || []).filter((l) => l.checked).length), 1),
                                createVNode("span", { class: "text-gray-500" }, " / " + toDisplayString((o.lines || []).length) + " \u0441\u043E\u0431\u0440.", 1)
                              ]),
                              createVNode("div", {
                                class: ["text-[11px] mt-1", o.allChecked ? "text-green-700" : "text-gray-500"]
                              }, toDisplayString(o.allChecked ? "\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0437\u0430\u043A\u0440\u044B\u0442" : "\u041D\u0443\u0436\u043D\u043E \u043E\u0442\u043C\u0435\u0442\u0438\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438"), 3)
                            ]),
                            createVNode("td", { class: "px-4 py-3 align-top" }, [
                              createVNode("div", { class: "flex justify-end gap-2" }, [
                                createVNode(_component_NuxtLink, {
                                  to: `/admin/orders?q=${o.id}`,
                                  class: "px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-xs"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C ")
                                  ]),
                                  _: 1
                                }, 8, ["to"]),
                                createVNode("button", {
                                  class: ["px-3 py-2 rounded-xl text-xs", o.allChecked && o.allStockOk ? "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"],
                                  disabled: !(o.allChecked && o.allStockOk) || unref(busy)[`ready:${o.id}`],
                                  onClick: ($event) => readyToShip(o.id)
                                }, " \u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435 ", 10, ["disabled", "onClick"])
                              ])
                            ])
                          ]),
                          unref(openRow)[o.id] ? (openBlock(), createBlock("tr", {
                            key: 0,
                            class: "border-t border-gray-100 bg-white"
                          }, [
                            createVNode("td", {
                              class: "px-4 py-4",
                              colspan: "5"
                            }, [
                              createVNode("div", { class: "grid grid-cols-1 lg:grid-cols-3 gap-4" }, [
                                createVNode("div", { class: "lg:col-span-2" }, [
                                  createVNode("div", { class: "text-xs font-semibold text-gray-700 mb-2" }, "\u0427\u0435\u043A-\u043B\u0438\u0441\u0442 \u0441\u0431\u043E\u0440\u043A\u0438"),
                                  createVNode("div", { class: "rounded-2xl border border-gray-200 overflow-hidden" }, [
                                    (openBlock(true), createBlock(Fragment, null, renderList(o.lines || [], (l) => {
                                      return openBlock(), createBlock("div", {
                                        key: l.productId,
                                        class: "flex items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 first:border-t-0"
                                      }, [
                                        createVNode("label", { class: "flex items-start gap-3 min-w-0" }, [
                                          createVNode("input", {
                                            type: "checkbox",
                                            class: "mt-1",
                                            checked: l.checked,
                                            disabled: unref(busy)[`${o.id}:${l.productId}`],
                                            onChange: ($event) => toggleItem(o.id, l.productId, $event.target.checked)
                                          }, null, 40, ["checked", "disabled", "onChange"]),
                                          createVNode("div", { class: "min-w-0" }, [
                                            createVNode("div", { class: "text-sm font-medium truncate" }, toDisplayString(l.name || "#" + l.productId), 1),
                                            createVNode("div", { class: "text-xs text-gray-500" }, "ID: " + toDisplayString(l.productId) + " \xB7 \u041D\u0443\u0436\u043D\u043E: " + toDisplayString(l.quantity) + " \u0448\u0442.", 1)
                                          ])
                                        ]),
                                        createVNode("div", { class: "text-right" }, [
                                          createVNode("div", { class: "text-sm tabular-nums" }, toDisplayString(l.stock.available) + " / " + toDisplayString(l.quantity), 1),
                                          createVNode("div", { class: "text-[11px] mt-1" }, [
                                            createVNode("span", {
                                              class: ["px-2 py-0.5 rounded-full border", l.stockOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"]
                                            }, toDisplayString(l.stockOk ? "\u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 OK" : "\u0414\u0435\u0444\u0438\u0446\u0438\u0442"), 3)
                                          ])
                                        ])
                                      ]);
                                    }), 128)),
                                    (o.lines || []).length === 0 ? (openBlock(), createBlock("div", {
                                      key: 0,
                                      class: "px-4 py-3 text-sm text-gray-500"
                                    }, "\u041F\u043E\u0437\u0438\u0446\u0438\u0438 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B")) : createCommentVNode("", true)
                                  ])
                                ]),
                                createVNode("div", null, [
                                  createVNode("div", { class: "text-xs font-semibold text-gray-700 mb-2" }, "\u041F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0437\u0430\u0434\u0430\u0447\u0438"),
                                  createVNode("div", { class: "rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-3" }, [
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-[11px] font-semibold text-gray-700 mb-1" }, "\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442"),
                                      createVNode("select", {
                                        class: "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white",
                                        value: o.priority || "",
                                        onChange: ($event) => setMeta(o.id, { priority: $event.target.value ? Number($event.target.value) : null })
                                      }, [
                                        createVNode("option", { value: "" }, "\u2014"),
                                        createVNode("option", { value: "1" }, "1 \u2014 \u0432\u044B\u0441\u043E\u043A\u0438\u0439"),
                                        createVNode("option", { value: "2" }, "2 \u2014 \u0441\u0440\u0435\u0434\u043D\u0438\u0439"),
                                        createVNode("option", { value: "3" }, "3 \u2014 \u043E\u0431\u044B\u0447\u043D\u044B\u0439")
                                      ], 40, ["value", "onChange"])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-[11px] font-semibold text-gray-700 mb-1" }, "\u0414\u0435\u0434\u043B\u0430\u0439\u043D"),
                                      createVNode("input", {
                                        type: "datetime-local",
                                        class: "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white",
                                        value: o.deadlineAt ? new Date(o.deadlineAt).toISOString().slice(0, 16) : "",
                                        onChange: ($event) => setMeta(o.id, { deadlineAt: $event.target.value ? new Date($event.target.value).toISOString() : null })
                                      }, null, 40, ["value", "onChange"])
                                    ]),
                                    createVNode("div", null, [
                                      createVNode("div", { class: "text-[11px] font-semibold text-gray-700 mb-1" }, "\u041E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439"),
                                      createVNode("input", {
                                        class: "w-full rounded-xl border border-gray-200 px-3 py-2 text-sm bg-white",
                                        value: o.assignee || "",
                                        placeholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u041D\u0438\u043A\u0438\u0442\u0430",
                                        onChange: ($event) => setMeta(o.id, { assignee: $event.target.value || null })
                                      }, null, 40, ["value", "onChange"])
                                    ]),
                                    createVNode("div", { class: "pt-1" }, [
                                      createVNode("button", {
                                        class: ["w-full px-3 py-2 rounded-xl text-sm", o.allChecked && o.allStockOk ? "border border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"],
                                        disabled: !(o.allChecked && o.allStockOk) || unref(busy)[`ready:${o.id}`],
                                        onClick: ($event) => readyToShip(o.id)
                                      }, " \u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435 ", 10, ["disabled", "onClick"]),
                                      createVNode("p", { class: "text-[11px] text-gray-500 mt-2" }, " \u041A\u043D\u043E\u043F\u043A\u0430 \u0430\u043A\u0442\u0438\u0432\u043D\u0430, \u043A\u043E\u0433\u0434\u0430 \u0432\u0441\u0451 \u0441\u043E\u0431\u0440\u0430\u043D\u043E \u0438 \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u0430. ")
                                    ])
                                  ])
                                ])
                              ])
                            ])
                          ])) : createCommentVNode("", true)
                        ], 64);
                      }), 128)),
                      unref(orders).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "5",
                          class: "px-5 py-12 text-center text-slate-500"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F4E6}"),
                          createVNode("div", null, "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \xAB\u0412 \u0440\u0430\u0431\u043E\u0442\u0435\xBB")
                        ])
                      ])) : createCommentVNode("", true)
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/in-work.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=in-work-nPbCoN1x.mjs.map
