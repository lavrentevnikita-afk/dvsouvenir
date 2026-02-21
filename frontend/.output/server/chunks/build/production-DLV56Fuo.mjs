import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminSelect-4bn3Tbjh.mjs';
import { _ as _sfc_main$5 } from './AdminInput-CTfEX194.mjs';
import { _ as _sfc_main$6 } from './AdminStatusBadge-BRoIy5Uv.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, createVNode, unref, isRef, withKeys, createBlock, createCommentVNode, openBlock, Fragment, renderList, toDisplayString, withDirectives, vModelText, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrRenderStyle, ssrRenderAttr } from 'vue/server-renderer';
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
    const loading = ref(false);
    const error = ref(null);
    const status = ref("all");
    const q = ref("");
    const workOrders = ref([]);
    const actionLoading = ref({});
    const produceQty = ref({});
    const defectQty = ref({});
    function progress(wo) {
      const planned = Number((wo == null ? void 0 : wo.qtyPlanned) || 0);
      const done = Number((wo == null ? void 0 : wo.qtyDone) || 0);
      const defect = Number((wo == null ? void 0 : wo.qtyDefect) || 0);
      if (!planned) return 0;
      return Math.max(0, Math.min(100, Math.round((done + defect) / planned * 100)));
    }
    async function load() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/production", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: {
            ...status.value === "all" ? {} : { status: status.value },
            ...q.value ? { q: q.value } : {}
          }
        });
        workOrders.value = Array.isArray(res == null ? void 0 : res.workOrders) ? res.workOrders : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E";
      } finally {
        loading.value = false;
      }
    }
    async function start(woId) {
      var _a;
      if (!auth.accessToken) return;
      actionLoading.value[`start:${woId}`] = true;
      error.value = null;
      try {
        await $fetch(`/api/admin/production/${woId}/start`, {
          baseURL: apiBaseUrl,
          method: "POST",
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        await load();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 WO \u0432 \u0440\u0430\u0431\u043E\u0442\u0443";
      } finally {
        actionLoading.value[`start:${woId}`] = false;
      }
    }
    async function complete(woId) {
      var _a;
      if (!auth.accessToken) return;
      const qty = Number(produceQty.value[woId] || 0);
      if (!qty) return;
      actionLoading.value[`complete:${woId}`] = true;
      error.value = null;
      try {
        await $fetch(`/api/admin/production/${woId}/complete`, {
          baseURL: apiBaseUrl,
          method: "POST",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { qty }
        });
        produceQty.value[woId] = 0;
        await load();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C";
      } finally {
        actionLoading.value[`complete:${woId}`] = false;
      }
    }
    async function toDefect(woId) {
      var _a;
      if (!auth.accessToken) return;
      const qty = Number(defectQty.value[woId] || 0);
      if (!qty) return;
      actionLoading.value[`defect:${woId}`] = true;
      error.value = null;
      try {
        await $fetch(`/api/admin/production/${woId}/defect`, {
          baseURL: apiBaseUrl,
          method: "POST",
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { qty }
        });
        defectQty.value[woId] = 0;
        await load();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043F\u0438\u0441\u0430\u0442\u044C \u0432 \u0431\u0440\u0430\u043A";
      } finally {
        actionLoading.value[`defect:${woId}`] = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminSelect = _sfc_main$4;
      const _component_AdminInput = _sfc_main$5;
      const _component_AdminStatusBadge = _sfc_main$6;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E",
        description: "Work Orders \u2192 \u0432\u044B\u043F\u0443\u0441\u043A \u043D\u0430 FINISHED",
        icon: "\u{1F3ED}"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminButton, { onClick: load }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C `);
                } else {
                  return [
                    createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminButton, { onClick: load }, {
                default: withCtx(() => [
                  createTextVNode(" \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C ")
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
            _push2(`<div class="flex flex-wrap items-center gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(status),
              "onUpdate:modelValue": [($event) => isRef(status) ? status.value = $event : null, load],
              options: [
                { value: "all", label: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" },
                { value: "planned", label: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E" },
                { value: "in_progress", label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435" },
                { value: "done", label: "\u0413\u043E\u0442\u043E\u0432\u043E" },
                { value: "blocked", label: "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043E" }
              ]
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(q),
              "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
              icon: "search",
              placeholder: "\u041F\u043E\u0438\u0441\u043A (\u0437\u0430\u043A\u0430\u0437 / \u0442\u043E\u0432\u0430\u0440)",
              class: "w-full sm:w-[280px]",
              onKeyup: load
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap items-center gap-3" }, [
                createVNode(_component_AdminSelect, {
                  modelValue: unref(status),
                  "onUpdate:modelValue": [($event) => isRef(status) ? status.value = $event : null, load],
                  options: [
                    { value: "all", label: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B" },
                    { value: "planned", label: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E" },
                    { value: "in_progress", label: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435" },
                    { value: "done", label: "\u0413\u043E\u0442\u043E\u0432\u043E" },
                    { value: "blocked", label: "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043E" }
                  ]
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode(_component_AdminInput, {
                  modelValue: unref(q),
                  "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                  icon: "search",
                  placeholder: "\u041F\u043E\u0438\u0441\u043A (\u0437\u0430\u043A\u0430\u0437 / \u0442\u043E\u0432\u0430\u0440)",
                  class: "w-full sm:w-[280px]",
                  onKeyup: withKeys(load, ["enter"])
                }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
        _push(ssrRenderComponent(_component_AdminCard, {
          padding: false,
          title: "Work Orders"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="overflow-x-auto"${_scopeId}><table class="w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>WO #</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0417\u0430\u043A\u0430\u0437</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0422\u043E\u0432\u0430\u0440</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0412\u044B\u043F\u0443\u0441\u043A</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0411\u0440\u0430\u043A</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(workOrders), (wo) => {
                var _a;
                _push2(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-5 py-4 font-bold text-slate-900"${_scopeId}>#${ssrInterpolate(wo.id)}</td><td class="px-5 py-4 text-slate-600"${_scopeId}>#${ssrInterpolate(wo.orderId)}</td><td class="px-5 py-4"${_scopeId}><div class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(((_a = wo.product) == null ? void 0 : _a.name) || "\u0422\u043E\u0432\u0430\u0440 #" + wo.productId)}</div></td><td class="px-5 py-4"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminStatusBadge, {
                  status: wo.status,
                  map: {
                    planned: { label: "\u{1F4C5} \u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E", color: "blue" },
                    in_progress: { label: "\u2699\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0435", color: "amber" },
                    done: { label: "\u2705 \u0413\u043E\u0442\u043E\u0432\u043E", color: "green" },
                    blocked: { label: "\u{1F6AB} \u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043E", color: "red" }
                  }
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="px-5 py-4"${_scopeId}><div class="flex items-center gap-3"${_scopeId}><div class="w-[120px] h-2 rounded-full bg-slate-100 overflow-hidden"${_scopeId}><div class="${ssrRenderClass([progress(wo) >= 100 ? "bg-emerald-500" : progress(wo) >= 50 ? "bg-amber-500" : "bg-slate-400", "h-2 rounded-full transition-all duration-300"])}" style="${ssrRenderStyle({ width: progress(wo) + "%" })}"${_scopeId}></div></div><div class="text-xs tabular-nums text-slate-600"${_scopeId}><span class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(wo.qtyDone)}</span> / ${ssrInterpolate(wo.qtyPlanned)} `);
                if (Number(wo.qtyDefect || 0) > 0) {
                  _push2(`<span class="text-red-500 ml-1"${_scopeId}>\xB7 \u0431\u0440\u0430\u043A ${ssrInterpolate(wo.qtyDefect)}</span>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</div></div></td><td class="px-5 py-4"${_scopeId}><input${ssrRenderAttr("value", unref(produceQty)[wo.id])} type="number" min="0" step="1" class="px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm w-[100px] focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all" placeholder="\u043A\u043E\u043B-\u0432\u043E"${_scopeId}></td><td class="px-5 py-4"${_scopeId}><input${ssrRenderAttr("value", unref(defectQty)[wo.id])} type="number" min="0" step="1" class="px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm w-[100px] focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all" placeholder="\u043A\u043E\u043B-\u0432\u043E"${_scopeId}></td><td class="px-5 py-4 text-right"${_scopeId}><div class="flex justify-end gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  loading: unref(actionLoading)["start:" + wo.id],
                  onClick: ($event) => start(wo.id)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u25B6\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0443 `);
                    } else {
                      return [
                        createTextVNode(" \u25B6\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0443 ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  variant: "primary",
                  loading: unref(actionLoading)["complete:" + wo.id],
                  onClick: ($event) => complete(wo.id)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u2705 \u0412\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C `);
                    } else {
                      return [
                        createTextVNode(" \u2705 \u0412\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  variant: "danger",
                  loading: unref(actionLoading)["defect:" + wo.id],
                  onClick: ($event) => toDefect(wo.id)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u274C \u0412 \u0431\u0440\u0430\u043A `);
                    } else {
                      return [
                        createTextVNode(" \u274C \u0412 \u0431\u0440\u0430\u043A ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div></td></tr>`);
              });
              _push2(`<!--]-->`);
              if (unref(workOrders).length === 0) {
                _push2(`<tr${_scopeId}><td colspan="8" class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F3ED}</div><div${_scopeId}>\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 Work Orders</div></td></tr>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</tbody></table></div>`);
            } else {
              return [
                createVNode("div", { class: "overflow-x-auto" }, [
                  createVNode("table", { class: "w-full text-sm" }, [
                    createVNode("thead", { class: "bg-slate-50 text-xs text-slate-600 uppercase tracking-wide" }, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "WO #"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0417\u0430\u043A\u0430\u0437"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0422\u043E\u0432\u0430\u0440"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0421\u0442\u0430\u0442\u0443\u0441"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0412\u044B\u043F\u0443\u0441\u043A"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0411\u0440\u0430\u043A"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(workOrders), (wo) => {
                        var _a;
                        return openBlock(), createBlock("tr", {
                          key: wo.id,
                          class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                        }, [
                          createVNode("td", { class: "px-5 py-4 font-bold text-slate-900" }, "#" + toDisplayString(wo.id), 1),
                          createVNode("td", { class: "px-5 py-4 text-slate-600" }, "#" + toDisplayString(wo.orderId), 1),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-semibold text-slate-900" }, toDisplayString(((_a = wo.product) == null ? void 0 : _a.name) || "\u0422\u043E\u0432\u0430\u0440 #" + wo.productId), 1)
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode(_component_AdminStatusBadge, {
                              status: wo.status,
                              map: {
                                planned: { label: "\u{1F4C5} \u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E", color: "blue" },
                                in_progress: { label: "\u2699\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0435", color: "amber" },
                                done: { label: "\u2705 \u0413\u043E\u0442\u043E\u0432\u043E", color: "green" },
                                blocked: { label: "\u{1F6AB} \u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043E", color: "red" }
                              }
                            }, null, 8, ["status"])
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "flex items-center gap-3" }, [
                              createVNode("div", { class: "w-[120px] h-2 rounded-full bg-slate-100 overflow-hidden" }, [
                                createVNode("div", {
                                  class: ["h-2 rounded-full transition-all duration-300", progress(wo) >= 100 ? "bg-emerald-500" : progress(wo) >= 50 ? "bg-amber-500" : "bg-slate-400"],
                                  style: { width: progress(wo) + "%" }
                                }, null, 6)
                              ]),
                              createVNode("div", { class: "text-xs tabular-nums text-slate-600" }, [
                                createVNode("span", { class: "font-semibold text-slate-900" }, toDisplayString(wo.qtyDone), 1),
                                createTextVNode(" / " + toDisplayString(wo.qtyPlanned) + " ", 1),
                                Number(wo.qtyDefect || 0) > 0 ? (openBlock(), createBlock("span", {
                                  key: 0,
                                  class: "text-red-500 ml-1"
                                }, "\xB7 \u0431\u0440\u0430\u043A " + toDisplayString(wo.qtyDefect), 1)) : createCommentVNode("", true)
                              ])
                            ])
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(produceQty)[wo.id] = $event,
                              type: "number",
                              min: "0",
                              step: "1",
                              class: "px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm w-[100px] focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all",
                              placeholder: "\u043A\u043E\u043B-\u0432\u043E"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(produceQty)[wo.id],
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            withDirectives(createVNode("input", {
                              "onUpdate:modelValue": ($event) => unref(defectQty)[wo.id] = $event,
                              type: "number",
                              min: "0",
                              step: "1",
                              class: "px-3 py-2 rounded-xl border border-slate-200 bg-white shadow-sm text-sm w-[100px] focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all",
                              placeholder: "\u043A\u043E\u043B-\u0432\u043E"
                            }, null, 8, ["onUpdate:modelValue"]), [
                              [
                                vModelText,
                                unref(defectQty)[wo.id],
                                void 0,
                                { number: true }
                              ]
                            ])
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-right" }, [
                            createVNode("div", { class: "flex justify-end gap-2" }, [
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                loading: unref(actionLoading)["start:" + wo.id],
                                onClick: ($event) => start(wo.id)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u25B6\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0443 ")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"]),
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                variant: "primary",
                                loading: unref(actionLoading)["complete:" + wo.id],
                                onClick: ($event) => complete(wo.id)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u2705 \u0412\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C ")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"]),
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                variant: "danger",
                                loading: unref(actionLoading)["defect:" + wo.id],
                                onClick: ($event) => toDefect(wo.id)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u274C \u0412 \u0431\u0440\u0430\u043A ")
                                ]),
                                _: 1
                              }, 8, ["loading", "onClick"])
                            ])
                          ])
                        ]);
                      }), 128)),
                      unref(workOrders).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "8",
                          class: "px-5 py-12 text-center text-slate-500"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F3ED}"),
                          createVNode("div", null, "\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 Work Orders")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/production.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=production-DLV56Fuo.mjs.map
