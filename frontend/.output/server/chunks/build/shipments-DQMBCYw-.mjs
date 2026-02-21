import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminInput-CTfEX194.mjs';
import { _ as _sfc_main$5 } from './AdminSelect-4bn3Tbjh.mjs';
import { _ as _sfc_main$6 } from './AdminStatusBadge-BRoIy5Uv.mjs';
import { _ as _sfc_main$7 } from './ProductLabel-Cfk69Yin.mjs';
import { defineComponent, ref, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, isRef, toDisplayString, createBlock, createCommentVNode, openBlock, Fragment, renderList, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
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
    const status = ref("ready");
    const store = ref("all");
    const loading = ref(false);
    const error = ref(null);
    const shipments = ref([]);
    function humanDate(dt) {
      if (!dt) return "\u2014";
      const d = new Date(dt);
      return d.toLocaleString();
    }
    function presetWeek() {
      const now = /* @__PURE__ */ new Date();
      const from = new Date(now);
      from.setDate(now.getDate() - 6);
      dateFrom.value = from.toISOString().slice(0, 10);
      dateTo.value = now.toISOString().slice(0, 10);
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
    const confirmFile = ref(null);
    const confirmUploading = ref(false);
    const partialItems = ref({});
    const partialWaybill = ref("");
    const partialComment = ref("");
    const partialDateTime = ref("");
    ref(null);
    const partialUploading = ref(false);
    function resetConfirm() {
      confirmShipped.value = true;
      confirmDateTime.value = (/* @__PURE__ */ new Date()).toISOString().slice(0, 16);
      confirmWaybill.value = "";
      confirmComment.value = "";
      confirmFile.value = null;
    }
    async function openConfirm(row) {
      active.value = row;
      resetConfirm();
      modalConfirmOpen.value = true;
    }
    async function openDocs(row) {
      active.value = row;
      modalDocsOpen.value = true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminInput = _sfc_main$4;
      const _component_AdminSelect = _sfc_main$5;
      const _component_AdminStatusBadge = _sfc_main$6;
      const _component_ProductLabel = _sfc_main$7;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438",
        description: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u043E\u0442\u043F\u0440\u0430\u0432\u043E\u043A \u0438 \u0441\u0442\u0430\u0442\u0443\u0441\u043E\u0432",
        icon: "\u{1F69A}"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminButton, { onClick: presetWeek }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u041D\u0435\u0434\u0435\u043B\u044F`);
                } else {
                  return [
                    createTextVNode("\u041D\u0435\u0434\u0435\u043B\u044F")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
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
              createVNode(_component_AdminButton, { onClick: presetWeek }, {
                default: withCtx(() => [
                  createTextVNode("\u041D\u0435\u0434\u0435\u043B\u044F")
                ]),
                _: 1
              }),
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
            _push2(`<div class="grid grid-cols-1 md:grid-cols-4 gap-4"${_scopeId}><div${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u041F\u0435\u0440\u0438\u043E\u0434 (\u0441)</label>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(dateFrom),
              "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
              type: "date",
              icon: "calendar"
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u041F\u0435\u0440\u0438\u043E\u0434 (\u043F\u043E)</label>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(dateTo),
              "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
              type: "date",
              icon: "calendar"
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u0421\u0442\u0430\u0442\u0443\u0441</label>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(status),
              "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null,
              options: [
                { value: "all", label: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" },
                { value: "ready", label: "\u0413\u043E\u0442\u043E\u0432\u043E" },
                { value: "partial", label: "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E" },
                { value: "shipped", label: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E" },
                { value: "delivered", label: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E" }
              ]
            }, null, _parent2, _scopeId));
            _push2(`</div><div${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u041C\u0430\u0433\u0430\u0437\u0438\u043D</label>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(store),
              "onUpdate:modelValue": ($event) => isRef(store) ? store.value = $event : null,
              options: [
                { value: "all", label: "\u0412\u0441\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B" },
                { value: "\u0421\u0430\u0439\u0442", label: "\u0421\u0430\u0439\u0442" }
              ]
            }, null, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "grid grid-cols-1 md:grid-cols-4 gap-4" }, [
                createVNode("div", null, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u041F\u0435\u0440\u0438\u043E\u0434 (\u0441)"),
                  createVNode(_component_AdminInput, {
                    modelValue: unref(dateFrom),
                    "onUpdate:modelValue": ($event) => isRef(dateFrom) ? dateFrom.value = $event : null,
                    type: "date",
                    icon: "calendar"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u041F\u0435\u0440\u0438\u043E\u0434 (\u043F\u043E)"),
                  createVNode(_component_AdminInput, {
                    modelValue: unref(dateTo),
                    "onUpdate:modelValue": ($event) => isRef(dateTo) ? dateTo.value = $event : null,
                    type: "date",
                    icon: "calendar"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u0421\u0442\u0430\u0442\u0443\u0441"),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(status),
                    "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null,
                    options: [
                      { value: "all", label: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" },
                      { value: "ready", label: "\u0413\u043E\u0442\u043E\u0432\u043E" },
                      { value: "partial", label: "\u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E" },
                      { value: "shipped", label: "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E" },
                      { value: "delivered", label: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", null, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u041C\u0430\u0433\u0430\u0437\u0438\u043D"),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(store),
                    "onUpdate:modelValue": ($event) => isRef(store) ? store.value = $event : null,
                    options: [
                      { value: "all", label: "\u0412\u0441\u0435 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B" },
                      { value: "\u0421\u0430\u0439\u0442", label: "\u0421\u0430\u0439\u0442" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
              _push2(`<div class="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent flex items-center justify-between"${_scopeId}><div class="font-bold text-slate-800"${_scopeId}>\u0421\u043F\u0438\u0441\u043E\u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043E\u043A</div><div class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(unref(shipments).length)} \u0437\u0430\u043F\u0438\u0441\u0435\u0439</div></div><div class="overflow-x-auto"${_scopeId}><table class="min-w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0417\u0430\u043A\u0430\u0437 / \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u041F\u043B\u0430\u043D</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0424\u0430\u043A\u0442</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u041A\u0442\u043E \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody${_scopeId}>`);
              if (!unref(shipments).length) {
                _push2(`<tr${_scopeId}><td colspan="6" class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F69A}</div><div${_scopeId}>\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445</div></td></tr>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`<!--[-->`);
              ssrRenderList(unref(shipments), (sh) => {
                var _a2, _b2;
                _push2(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-5 py-4"${_scopeId}><div class="font-bold text-slate-900"${_scopeId}>#${ssrInterpolate(sh.orderId)}</div><div class="text-xs text-slate-500 mt-0.5"${_scopeId}>${ssrInterpolate(((_a2 = sh.recipient) == null ? void 0 : _a2.name) || "\u2014")}`);
                if ((_b2 = sh.recipient) == null ? void 0 : _b2.phone) {
                  _push2(`<span${_scopeId}> \xB7 ${ssrInterpolate(sh.recipient.phone)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></td><td class="px-5 py-4"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminStatusBadge, {
                  status: sh.status,
                  map: {
                    ready: { label: "\u2705 \u0413\u043E\u0442\u043E\u0432\u043E", color: "green" },
                    partial: { label: "\u{1F4E6} \u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E", color: "amber" },
                    shipped: { label: "\u{1F69A} \u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E", color: "blue" },
                    delivered: { label: "\u{1F389} \u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E", color: "purple" },
                    created: { label: "\u{1F4CB} \u0421\u043E\u0437\u0434\u0430\u043D\u043E", color: "slate" }
                  }
                }, null, _parent2, _scopeId));
                if (sh.shippedProgress) {
                  _push2(`<div class="text-xs text-slate-500 mt-1"${_scopeId}>${ssrInterpolate(sh.shippedProgress.shippedQty)}/${ssrInterpolate(sh.shippedProgress.totalQty)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td class="px-5 py-4 text-slate-700"${_scopeId}>${ssrInterpolate(humanDate(sh.plannedAt))}</td><td class="px-5 py-4 text-slate-700"${_scopeId}>${ssrInterpolate(humanDate(sh.shippedAt))}</td><td class="px-5 py-4"${_scopeId}>`);
                if (sh.confirmedBy) {
                  _push2(`<div class="text-xs"${_scopeId}><div class="font-medium text-slate-900"${_scopeId}>${ssrInterpolate(sh.confirmedBy.name || sh.confirmedBy.email)}</div><div class="text-slate-500"${_scopeId}>${ssrInterpolate(sh.confirmedBy.email)}</div></div>`);
                } else {
                  _push2(`<div class="text-xs text-slate-400"${_scopeId}>\u2014</div>`);
                }
                _push2(`</td><td class="px-5 py-4 text-right"${_scopeId}><div class="inline-flex items-center gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  variant: "primary",
                  disabled: sh.status === "shipped" || sh.status === "delivered",
                  onClick: ($event) => openConfirm(sh)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u2705 \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C `);
                    } else {
                      return [
                        createTextVNode(" \u2705 \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  onClick: ($event) => openDocs(sh)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`\u{1F4C4} \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B`);
                    } else {
                      return [
                        createTextVNode("\u{1F4C4} \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div></td></tr>`);
              });
              _push2(`<!--]--></tbody></table></div>`);
            } else {
              return [
                createVNode("div", { class: "px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent flex items-center justify-between" }, [
                  createVNode("div", { class: "font-bold text-slate-800" }, "\u0421\u043F\u0438\u0441\u043E\u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043E\u043A"),
                  createVNode("div", { class: "text-xs text-slate-500" }, toDisplayString(unref(shipments).length) + " \u0437\u0430\u043F\u0438\u0441\u0435\u0439", 1)
                ]),
                createVNode("div", { class: "overflow-x-auto" }, [
                  createVNode("table", { class: "min-w-full text-sm" }, [
                    createVNode("thead", { class: "bg-slate-50 text-xs text-slate-600 uppercase tracking-wide" }, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0417\u0430\u043A\u0430\u0437 / \u043F\u043E\u043B\u0443\u0447\u0430\u0442\u0435\u043B\u044C"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0421\u0442\u0430\u0442\u0443\u0441"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u041F\u043B\u0430\u043D"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0424\u0430\u043A\u0442"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u041A\u0442\u043E \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      !unref(shipments).length ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "6",
                          class: "px-5 py-12 text-center text-slate-500"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F69A}"),
                          createVNode("div", null, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445")
                        ])
                      ])) : createCommentVNode("", true),
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(shipments), (sh) => {
                        var _a2, _b2;
                        return openBlock(), createBlock("tr", {
                          key: sh.id,
                          class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                        }, [
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-bold text-slate-900" }, "#" + toDisplayString(sh.orderId), 1),
                            createVNode("div", { class: "text-xs text-slate-500 mt-0.5" }, [
                              createTextVNode(toDisplayString(((_a2 = sh.recipient) == null ? void 0 : _a2.name) || "\u2014"), 1),
                              ((_b2 = sh.recipient) == null ? void 0 : _b2.phone) ? (openBlock(), createBlock("span", { key: 0 }, " \xB7 " + toDisplayString(sh.recipient.phone), 1)) : createCommentVNode("", true)
                            ])
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode(_component_AdminStatusBadge, {
                              status: sh.status,
                              map: {
                                ready: { label: "\u2705 \u0413\u043E\u0442\u043E\u0432\u043E", color: "green" },
                                partial: { label: "\u{1F4E6} \u0427\u0430\u0441\u0442\u0438\u0447\u043D\u043E", color: "amber" },
                                shipped: { label: "\u{1F69A} \u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E", color: "blue" },
                                delivered: { label: "\u{1F389} \u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D\u043E", color: "purple" },
                                created: { label: "\u{1F4CB} \u0421\u043E\u0437\u0434\u0430\u043D\u043E", color: "slate" }
                              }
                            }, null, 8, ["status"]),
                            sh.shippedProgress ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-xs text-slate-500 mt-1"
                            }, toDisplayString(sh.shippedProgress.shippedQty) + "/" + toDisplayString(sh.shippedProgress.totalQty), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-slate-700" }, toDisplayString(humanDate(sh.plannedAt)), 1),
                          createVNode("td", { class: "px-5 py-4 text-slate-700" }, toDisplayString(humanDate(sh.shippedAt)), 1),
                          createVNode("td", { class: "px-5 py-4" }, [
                            sh.confirmedBy ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-xs"
                            }, [
                              createVNode("div", { class: "font-medium text-slate-900" }, toDisplayString(sh.confirmedBy.name || sh.confirmedBy.email), 1),
                              createVNode("div", { class: "text-slate-500" }, toDisplayString(sh.confirmedBy.email), 1)
                            ])) : (openBlock(), createBlock("div", {
                              key: 1,
                              class: "text-xs text-slate-400"
                            }, "\u2014"))
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-right" }, [
                            createVNode("div", { class: "inline-flex items-center gap-2" }, [
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                variant: "primary",
                                disabled: sh.status === "shipped" || sh.status === "delivered",
                                onClick: ($event) => openConfirm(sh)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u2705 \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C ")
                                ]),
                                _: 1
                              }, 8, ["disabled", "onClick"]),
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                onClick: ($event) => openDocs(sh)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("\u{1F4C4} \u0414\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B")
                                ]),
                                _: 1
                              }, 8, ["onClick"])
                            ])
                          ])
                        ]);
                      }), 128))
                    ])
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
      }
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
        _push(`</div></div><div class="p-4 border-t border-gray-200 flex items-center justify-end">`);
        _push(ssrRenderComponent(_component_AdminButton, {
          onClick: ($event) => modalDocsOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u0417\u0430\u043A\u0440\u044B\u0442\u044C`);
            } else {
              return [
                createTextVNode("\u0417\u0430\u043A\u0440\u044B\u0442\u044C")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/shipments.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=shipments-DQMBCYw-.mjs.map
