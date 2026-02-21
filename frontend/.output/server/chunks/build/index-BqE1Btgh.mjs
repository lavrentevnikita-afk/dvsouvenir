import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminInput-CTfEX194.mjs';
import { defineComponent, computed, ref, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const apiBaseUrl = computed(() => {
      const config = useRuntimeConfig();
      return config.apiBaseUrl;
    });
    const isAdmin = computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "admin";
    });
    const isManager = computed(() => {
      var _a;
      return ((_a = auth.user) == null ? void 0 : _a.role) === "manager";
    });
    const loading = ref(false);
    const err = ref("");
    const dashboard = ref(null);
    const dateFrom = ref("");
    const dateTo = ref("");
    const attentionNow = computed(() => {
      var _a;
      return ((_a = dashboard.value) == null ? void 0 : _a.attentionNow) || { counts: {}, top5: [] };
    });
    const attentionRows = computed(() => {
      var _a, _b, _c;
      const rows = [];
      const d = dashboard.value;
      for (const o of ((_a = d == null ? void 0 : d.attention) == null ? void 0 : _a.deficitOrders) || []) {
        rows.push({
          kind: "deficit_order",
          id: o.id,
          title: `\u0417\u0430\u043A\u0430\u0437 #${o.id}`,
          subtitle: "\u0414\u0435\u0444\u0438\u0446\u0438\u0442 / \u0436\u0434\u0451\u0442 \u0441\u043A\u043B\u0430\u0434",
          createdAt: o.createdAt,
          payload: o
        });
      }
      for (const t of ((_b = d == null ? void 0 : d.attention) == null ? void 0 : _b.overdueTasks) || []) {
        rows.push({
          kind: "overdue_task",
          id: t.id,
          title: `\u0417\u0430\u0434\u0430\u0447\u0430 #${t.id} \xB7 \u0417\u0430\u043A\u0430\u0437 #${t.orderId}`,
          subtitle: "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E",
          createdAt: t.updatedAt || t.createdAt,
          payload: t
        });
      }
      for (const o of ((_c = d == null ? void 0 : d.attention) == null ? void 0 : _c.lateShipOrders) || []) {
        rows.push({
          kind: "late_ship",
          id: o.id,
          title: `\u0417\u0430\u043A\u0430\u0437 #${o.id}`,
          subtitle: "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u0430",
          createdAt: o.createdAt,
          payload: o
        });
      }
      return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 30);
    });
    function fmtDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    function setPreset(preset) {
      const now = /* @__PURE__ */ new Date();
      const start = new Date(now);
      const end = new Date(now);
      if (preset === "today") ;
      else if (preset === "week") {
        start.setDate(start.getDate() - 6);
      } else {
        start.setDate(start.getDate() - 29);
      }
      dateFrom.value = fmtDate(start);
      dateTo.value = fmtDate(end);
    }
    async function loadDashboard() {
      var _a;
      if (!isAdmin.value && !isManager.value) return;
      loading.value = true;
      err.value = "";
      try {
        dashboard.value = await api("/api/ops/dashboard", {
          query: {
            dateFrom: dateFrom.value || void 0,
            dateTo: dateTo.value || void 0,
            warehouse: "FINISHED"
          }
        });
      } catch (e) {
        err.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || (e == null ? void 0 : e.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0432\u043E\u0434\u043A\u0443";
      } finally {
        loading.value = false;
      }
    }
    async function api(path, opts) {
      if (!auth.accessToken) throw new Error("\u041D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u0430");
      return await $fetch(path, {
        baseURL: apiBaseUrl.value,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        ...opts || {}
      });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminInput = _sfc_main$4;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      if (isAdmin.value) {
        _push(`<!--[-->`);
        _push(ssrRenderComponent(_component_AdminPageHeader, {
          title: "\u0414\u044D\u0448\u0431\u043E\u0440\u0434",
          description: "\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0441\u0432\u043E\u0434\u043A\u0430: \u0447\u0442\u043E \u0433\u043E\u0440\u0438\u0442 \u0438 \u043A\u0443\u0434\u0430 \u0438\u0434\u0442\u0438",
          icon: "\u{1F3E0}"
        }, {
          actions: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_NuxtLink, { to: "/admin/db" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(ssrRenderComponent(_component_AdminButton, null, {
                      default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                        if (_push4) {
                          _push4(`\u{1F9E8} DB Viewer`);
                        } else {
                          return [
                            createTextVNode("\u{1F9E8} DB Viewer")
                          ];
                        }
                      }),
                      _: 1
                    }, _parent3, _scopeId2));
                  } else {
                    return [
                      createVNode(_component_AdminButton, null, {
                        default: withCtx(() => [
                          createTextVNode("\u{1F9E8} DB Viewer")
                        ]),
                        _: 1
                      })
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_NuxtLink, { to: "/admin/db" }, {
                  default: withCtx(() => [
                    createVNode(_component_AdminButton, null, {
                      default: withCtx(() => [
                        createTextVNode("\u{1F9E8} DB Viewer")
                      ]),
                      _: 1
                    })
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
              _push2(`<div class="flex flex-wrap items-center gap-3"${_scopeId}><div class="inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm"${_scopeId}><button class="px-4 py-2 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors"${_scopeId}>\u0421\u0435\u0433\u043E\u0434\u043D\u044F</button><button class="px-4 py-2 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors"${_scopeId}>\u041D\u0435\u0434\u0435\u043B\u044F</button><button class="px-4 py-2 hover:bg-slate-50 text-sm font-medium transition-colors"${_scopeId}>\u041C\u0435\u0441\u044F\u0446</button></div>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: dateFrom.value,
                "onUpdate:modelValue": ($event) => dateFrom.value = $event,
                type: "date",
                icon: "calendar"
              }, null, _parent2, _scopeId));
              _push2(`<span class="text-slate-400"${_scopeId}>\u2014</span>`);
              _push2(ssrRenderComponent(_component_AdminInput, {
                modelValue: dateTo.value,
                "onUpdate:modelValue": ($event) => dateTo.value = $event,
                type: "date",
                icon: "calendar"
              }, null, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_AdminButton, {
                variant: "primary",
                onClick: loadDashboard
              }, {
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
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex flex-wrap items-center gap-3" }, [
                  createVNode("div", { class: "inline-flex rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm" }, [
                    createVNode("button", {
                      class: "px-4 py-2 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors",
                      onClick: ($event) => {
                        setPreset("today");
                        loadDashboard();
                      }
                    }, "\u0421\u0435\u0433\u043E\u0434\u043D\u044F", 8, ["onClick"]),
                    createVNode("button", {
                      class: "px-4 py-2 hover:bg-slate-50 text-sm font-medium border-r border-slate-200 transition-colors",
                      onClick: ($event) => {
                        setPreset("week");
                        loadDashboard();
                      }
                    }, "\u041D\u0435\u0434\u0435\u043B\u044F", 8, ["onClick"]),
                    createVNode("button", {
                      class: "px-4 py-2 hover:bg-slate-50 text-sm font-medium transition-colors",
                      onClick: ($event) => {
                        setPreset("month");
                        loadDashboard();
                      }
                    }, "\u041C\u0435\u0441\u044F\u0446", 8, ["onClick"])
                  ]),
                  createVNode(_component_AdminInput, {
                    modelValue: dateFrom.value,
                    "onUpdate:modelValue": ($event) => dateFrom.value = $event,
                    type: "date",
                    icon: "calendar"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode("span", { class: "text-slate-400" }, "\u2014"),
                  createVNode(_component_AdminInput, {
                    modelValue: dateTo.value,
                    "onUpdate:modelValue": ($event) => dateTo.value = $event,
                    type: "date",
                    icon: "calendar"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminButton, {
                    variant: "primary",
                    onClick: loadDashboard
                  }, {
                    default: withCtx(() => [
                      createTextVNode("\u041F\u0440\u0438\u043C\u0435\u043D\u0438\u0442\u044C")
                    ]),
                    _: 1
                  })
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        if (err.value) {
          _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(err.value)}</div>`);
        } else if (loading.value) {
          _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm"><div class="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent"><div><div class="text-base font-semibold text-slate-800">\u{1F525} \u0427\u0442\u043E \u0442\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F \u0441\u0435\u0439\u0447\u0430\u0441</div><div class="text-xs text-slate-500 mt-1">3 \u043A\u043B\u044E\u0447\u0435\u0432\u044B\u0445 \u0441\u0447\u0451\u0442\u0447\u0438\u043A\u0430 + \u0442\u043E\u043F-5 \u0441\u0430\u043C\u044B\u0445 \u0441\u0440\u043E\u0447\u043D\u044B\u0445.</div></div><button class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors"> \u{1F504} \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C </button></div><div class="p-5 space-y-5"><div class="grid grid-cols-1 md:grid-cols-3 gap-4">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/orders", query: { status: "in_work", overdue: "1" } },
          class: "group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-red-200 hover:from-red-50 hover:to-white transition-all"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            var _a, _b;
            if (_push2) {
              _push2(`<div class="flex items-center gap-3"${_scopeId}><div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"${_scopeId}>\u23F0</div><div${_scopeId}><div class="text-xs text-slate-500 uppercase tracking-wide font-medium"${_scopeId}>\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B</div><div class="mt-1 text-3xl font-bold tabular-nums text-slate-900"${_scopeId}>${ssrInterpolate((_a2 = (_a = attentionNow.value.counts) == null ? void 0 : _a.overdueOrders) != null ? _a2 : 0)}</div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform" }, "\u23F0"),
                  createVNode("div", null, [
                    createVNode("div", { class: "text-xs text-slate-500 uppercase tracking-wide font-medium" }, "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043D\u044B\u0435 \u0437\u0430\u043A\u0430\u0437\u044B"),
                    createVNode("div", { class: "mt-1 text-3xl font-bold tabular-nums text-slate-900" }, toDisplayString((_b2 = (_b = attentionNow.value.counts) == null ? void 0 : _b.overdueOrders) != null ? _b2 : 0), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/warehouse", query: { tab: "blanks", belowMin: "1" } },
          class: "group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-amber-200 hover:from-amber-50 hover:to-white transition-all"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            var _a, _b;
            if (_push2) {
              _push2(`<div class="flex items-center gap-3"${_scopeId}><div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"${_scopeId}>\u{1F4E6}</div><div${_scopeId}><div class="text-xs text-slate-500 uppercase tracking-wide font-medium"${_scopeId}>\u0414\u0435\u0444\u0438\u0446\u0438\u0442 \u0441\u043A\u043B\u0430\u0434\u0430</div><div class="mt-1 text-3xl font-bold tabular-nums text-slate-900"${_scopeId}>${ssrInterpolate((_a2 = (_a = attentionNow.value.counts) == null ? void 0 : _a.belowMinPositions) != null ? _a2 : 0)}</div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform" }, "\u{1F4E6}"),
                  createVNode("div", null, [
                    createVNode("div", { class: "text-xs text-slate-500 uppercase tracking-wide font-medium" }, "\u0414\u0435\u0444\u0438\u0446\u0438\u0442 \u0441\u043A\u043B\u0430\u0434\u0430"),
                    createVNode("div", { class: "mt-1 text-3xl font-bold tabular-nums text-slate-900" }, toDisplayString((_b2 = (_b = attentionNow.value.counts) == null ? void 0 : _b.belowMinPositions) != null ? _b2 : 0), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/settings", query: { tab: "system" } },
          class: "group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 hover:shadow-lg hover:border-blue-200 hover:from-blue-50 hover:to-white transition-all"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2;
            var _a, _b;
            if (_push2) {
              _push2(`<div class="flex items-center gap-3"${_scopeId}><div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"${_scopeId}>\u26A0\uFE0F</div><div${_scopeId}><div class="text-xs text-slate-500 uppercase tracking-wide font-medium"${_scopeId}>\u041E\u0448\u0438\u0431\u043A\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B</div><div class="mt-1 text-3xl font-bold tabular-nums text-slate-900"${_scopeId}>${ssrInterpolate((_a2 = (_a = attentionNow.value.counts) == null ? void 0 : _a.systemErrorsNew) != null ? _a2 : 0)}</div></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl group-hover:scale-110 transition-transform" }, "\u26A0\uFE0F"),
                  createVNode("div", null, [
                    createVNode("div", { class: "text-xs text-slate-500 uppercase tracking-wide font-medium" }, "\u041E\u0448\u0438\u0431\u043A\u0438 \u0441\u0438\u0441\u0442\u0435\u043C\u044B"),
                    createVNode("div", { class: "mt-1 text-3xl font-bold tabular-nums text-slate-900" }, toDisplayString((_b2 = (_b = attentionNow.value.counts) == null ? void 0 : _b.systemErrorsNew) != null ? _b2 : 0), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="rounded-2xl border border-slate-200 overflow-hidden"><div class="px-4 py-3 bg-gradient-to-r from-slate-50 to-transparent text-xs text-slate-600 font-semibold uppercase tracking-wide">\u0422\u043E\u043F 5 \u0441\u0440\u043E\u0447\u043D\u044B\u0445</div>`);
        if ((attentionNow.value.top5 || []).length) {
          _push(`<div class="divide-y divide-slate-100"><!--[-->`);
          ssrRenderList(attentionNow.value.top5, (it, idx) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: idx,
              to: it.href,
              class: "block px-4 py-3 hover:bg-slate-50 transition-colors"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="text-sm font-medium text-slate-800"${_scopeId}>${ssrInterpolate(it.title)}</div><div class="text-xs text-slate-500 mt-0.5"${_scopeId}>${ssrInterpolate(it.subtitle)}</div>`);
                } else {
                  return [
                    createVNode("div", { class: "text-sm font-medium text-slate-800" }, toDisplayString(it.title), 1),
                    createVNode("div", { class: "text-xs text-slate-500 mt-0.5" }, toDisplayString(it.subtitle), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="px-4 py-8 text-center text-sm text-slate-500">\u041F\u043E\u043A\u0430 \u0432\u0441\u0451 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E \u{1F389}</div>`);
        }
        _push(`</div></div></div><div class="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-sm"><div class="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-transparent"><div><div class="text-base font-semibold text-slate-800">\u{1F4CB} \u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0432\u043D\u0438\u043C\u0430\u043D\u0438\u044F</div><div class="text-xs text-slate-500 mt-1">\u0414\u0435\u0444\u0438\u0446\u0438\u0442\u044B, \u043F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0438 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430, \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438.</div></div><button class="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-medium shadow-sm transition-colors">\u{1F504} \u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C</button></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"><tr><th class="text-left px-4 py-3 font-semibold">\u0422\u0438\u043F</th><th class="text-left px-4 py-3 font-semibold">\u041E\u0431\u044A\u0435\u043A\u0442</th><th class="text-left px-4 py-3 font-semibold">\u0414\u0430\u0442\u0430</th><th class="text-left px-4 py-3 font-semibold">\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(attentionRows.value, (r) => {
          var _a, _b, _c, _d, _e;
          _push(`<tr class="border-t border-slate-100 hover:bg-slate-50/50 transition-colors"><td class="px-4 py-3"><span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border bg-slate-50 text-slate-700 border-slate-200">${ssrInterpolate(r.subtitle)}</span></td><td class="px-4 py-3"><div class="font-semibold text-slate-800">${ssrInterpolate(r.title)}</div>`);
          if (r.kind === "deficit_order") {
            _push(`<div class="text-xs text-slate-500">\u0421\u0442\u0430\u0442\u0443\u0441: ${ssrInterpolate((_a = r.payload) == null ? void 0 : _a.status)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "overdue_task") {
            _push(`<div class="text-xs text-slate-500">\u0422\u043E\u0432\u0430\u0440 ID: ${ssrInterpolate((_b = r.payload) == null ? void 0 : _b.productId)} \xB7 \u041A\u043E\u043B-\u0432\u043E: ${ssrInterpolate((_c = r.payload) == null ? void 0 : _c.qty)}</div>`);
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "late_ship") {
            _push(`<div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441: ${ssrInterpolate((_d = r.payload) == null ? void 0 : _d.status)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 text-xs text-gray-500 tabular-nums">${ssrInterpolate(new Date(r.createdAt).toLocaleString("ru-RU"))}</td><td class="px-4 py-3"><div class="flex flex-wrap gap-2">`);
          if (r.kind === "deficit_order" || r.kind === "late_ship") {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: { path: "/admin/orders", query: { q: String(r.id) } },
              class: "px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u041A \u0437\u0430\u043A\u0430\u0437\u0443`);
                } else {
                  return [
                    createTextVNode("\u041A \u0437\u0430\u043A\u0430\u0437\u0443")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "deficit_order" || r.kind === "overdue_task") {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: { path: "/admin/production", query: { orderId: String(((_e = r.payload) == null ? void 0 : _e.orderId) || r.id) } },
              class: "px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`\u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E`);
                } else {
                  return [
                    createTextVNode("\u0412 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E")
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<!---->`);
          }
          if (r.kind === "late_ship") {
            _push(`<button class="px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-100 text-xs">\u041F\u043E\u043C\u0435\u0442\u0438\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E</button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (attentionRows.value.length === 0) {
          _push(`<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">\u041F\u043E\u043A\u0430 \u0432\u0441\u0451 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E \u{1F389}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/orders" },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2, _e2, _f2, _g2, _h2;
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u0417\u0430\u043A\u0430\u0437\u044B</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0412\u0441\u0435\u0433\u043E</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a2 = (_c = (_b = (_a = dashboard.value) == null ? void 0 : _a.kpi) == null ? void 0 : _b.orders) == null ? void 0 : _c.total) != null ? _a2 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041D\u043E\u0432\u044B\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b2 = (_f = (_e = (_d = dashboard.value) == null ? void 0 : _d.kpi) == null ? void 0 : _e.orders) == null ? void 0 : _f.new) != null ? _b2 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_c2 = (_i = (_h = (_g = dashboard.value) == null ? void 0 : _g.kpi) == null ? void 0 : _h.orders) == null ? void 0 : _i.inWork) != null ? _c2 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0416\u0434\u0443\u0442 \u0441\u043A\u043B\u0430\u0434</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_d2 = (_l = (_k = (_j = dashboard.value) == null ? void 0 : _j.kpi) == null ? void 0 : _k.orders) == null ? void 0 : _l.waitingWarehouse) != null ? _d2 : "\u2014")}</span></div></div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u0417\u0430\u043A\u0430\u0437\u044B"),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0412\u0441\u0435\u0433\u043E"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_e2 = (_o = (_n = (_m = dashboard.value) == null ? void 0 : _m.kpi) == null ? void 0 : _n.orders) == null ? void 0 : _o.total) != null ? _e2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041D\u043E\u0432\u044B\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_f2 = (_r = (_q = (_p = dashboard.value) == null ? void 0 : _p.kpi) == null ? void 0 : _q.orders) == null ? void 0 : _r.new) != null ? _f2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_g2 = (_u = (_t = (_s = dashboard.value) == null ? void 0 : _s.kpi) == null ? void 0 : _t.orders) == null ? void 0 : _u.inWork) != null ? _g2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0416\u0434\u0443\u0442 \u0441\u043A\u043B\u0430\u0434"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_h2 = (_x = (_w = (_v = dashboard.value) == null ? void 0 : _v.kpi) == null ? void 0 : _w.orders) == null ? void 0 : _x.waitingWarehouse) != null ? _h2 : "\u2014"), 1)
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/orders", query: { status: "in_work" } },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2;
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a2 = (_c = (_b = (_a = dashboard.value) == null ? void 0 : _a.kpi) == null ? void 0 : _b.shipments) == null ? void 0 : _c.readyToShip) != null ? _a2 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0441\u0435\u0433\u043E\u0434\u043D\u044F</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b2 = (_f = (_e = (_d = dashboard.value) == null ? void 0 : _d.kpi) == null ? void 0 : _e.shipments) == null ? void 0 : _f.shippedToday) != null ? _b2 : "\u2014")}</span></div></div><div class="text-xs text-gray-500 mt-3"${_scopeId}>\u041A\u043B\u0438\u043A \u2192 \u0437\u0430\u043A\u0430\u0437\u044B</div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438"),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0413\u043E\u0442\u043E\u0432\u043E \u043A \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_c2 = (_i = (_h = (_g = dashboard.value) == null ? void 0 : _g.kpi) == null ? void 0 : _h.shipments) == null ? void 0 : _i.readyToShip) != null ? _c2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u043E \u0441\u0435\u0433\u043E\u0434\u043D\u044F"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_d2 = (_l = (_k = (_j = dashboard.value) == null ? void 0 : _j.kpi) == null ? void 0 : _k.shipments) == null ? void 0 : _l.shippedToday) != null ? _d2 : "\u2014"), 1)
                  ])
                ]),
                createVNode("div", { class: "text-xs text-gray-500 mt-3" }, "\u041A\u043B\u0438\u043A \u2192 \u0437\u0430\u043A\u0430\u0437\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/warehouse" },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2;
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u0421\u043A\u043B\u0430\u0434 (${ssrInterpolate(((_b = (_a = dashboard.value) == null ? void 0 : _a.range) == null ? void 0 : _b.warehouse) || "FINISHED")})</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041F\u043E\u0437\u0438\u0446\u0438\u0439 \u0432 \u0434\u0435\u0444\u0438\u0446\u0438\u0442\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a2 = (_e = (_d = (_c = dashboard.value) == null ? void 0 : _c.kpi) == null ? void 0 : _d.stocks) == null ? void 0 : _e.deficitPositions) != null ? _a2 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041A\u0440\u0438\u0442\u0438\u0447\u043D\u043E</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b2 = (_h = (_g = (_f = dashboard.value) == null ? void 0 : _f.kpi) == null ? void 0 : _g.stocks) == null ? void 0 : _h.criticalPositions) != null ? _b2 : "\u2014")}</span></div></div><div class="text-xs text-gray-500 mt-3"${_scopeId}>\u041A\u043B\u0438\u043A \u2192 \u0441\u043A\u043B\u0430\u0434</div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u0421\u043A\u043B\u0430\u0434 (" + toDisplayString(((_j = (_i = dashboard.value) == null ? void 0 : _i.range) == null ? void 0 : _j.warehouse) || "FINISHED") + ")", 1),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041F\u043E\u0437\u0438\u0446\u0438\u0439 \u0432 \u0434\u0435\u0444\u0438\u0446\u0438\u0442\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_c2 = (_m = (_l = (_k = dashboard.value) == null ? void 0 : _k.kpi) == null ? void 0 : _l.stocks) == null ? void 0 : _m.deficitPositions) != null ? _c2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041A\u0440\u0438\u0442\u0438\u0447\u043D\u043E"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_d2 = (_p = (_o = (_n = dashboard.value) == null ? void 0 : _n.kpi) == null ? void 0 : _o.stocks) == null ? void 0 : _p.criticalPositions) != null ? _d2 : "\u2014"), 1)
                  ])
                ]),
                createVNode("div", { class: "text-xs text-gray-500 mt-3" }, "\u041A\u043B\u0438\u043A \u2192 \u0441\u043A\u043B\u0430\u0434")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: { path: "/admin/production" },
          class: "rounded-2xl border border-gray-200 bg-white p-4 hover:bg-gray-50"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            var _a2, _b2, _c2, _d2;
            var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
            if (_push2) {
              _push2(`<div class="text-xs text-gray-500"${_scopeId}>\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</div><div class="mt-3 space-y-2"${_scopeId}><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_a2 = (_c = (_b = (_a = dashboard.value) == null ? void 0 : _a.kpi) == null ? void 0 : _b.production) == null ? void 0 : _c.inWork) != null ? _a2 : "\u2014")}</span></div><div class="flex items-center justify-between text-sm"${_scopeId}><span class="text-gray-700"${_scopeId}>\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E</span><span class="tabular-nums font-semibold"${_scopeId}>${ssrInterpolate((_b2 = (_f = (_e = (_d = dashboard.value) == null ? void 0 : _d.kpi) == null ? void 0 : _e.production) == null ? void 0 : _f.overdue) != null ? _b2 : "\u2014")}</span></div></div><div class="text-xs text-gray-500 mt-3"${_scopeId}>\u041A\u043B\u0438\u043A \u2192 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E</div>`);
            } else {
              return [
                createVNode("div", { class: "text-xs text-gray-500" }, "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E"),
                createVNode("div", { class: "mt-3 space-y-2" }, [
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_c2 = (_i = (_h = (_g = dashboard.value) == null ? void 0 : _g.kpi) == null ? void 0 : _h.production) == null ? void 0 : _i.inWork) != null ? _c2 : "\u2014"), 1)
                  ]),
                  createVNode("div", { class: "flex items-center justify-between text-sm" }, [
                    createVNode("span", { class: "text-gray-700" }, "\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u0435\u043D\u043E"),
                    createVNode("span", { class: "tabular-nums font-semibold" }, toDisplayString((_d2 = (_l = (_k = (_j = dashboard.value) == null ? void 0 : _j.kpi) == null ? void 0 : _k.production) == null ? void 0 : _l.overdue) != null ? _d2 : "\u2014"), 1)
                  ])
                ]),
                createVNode("div", { class: "text-xs text-gray-500 mt-3" }, "\u041A\u043B\u0438\u043A \u2192 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><!--]-->`);
      } else if (isManager.value) {
        _push(`<!--[--><div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440</h1><p class="text-sm text-gray-600 mt-1">\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u043C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u0438 \u0438 \u0437\u0430\u043A\u0430\u0437\u0430\u043C.</p></div><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/stores",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F3EA} \u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B`);
            } else {
              return [
                createTextVNode("\u{1F3EA} \u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/orders",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F9FE} \u0417\u0430\u043A\u0430\u0437\u044B`);
            } else {
              return [
                createTextVNode("\u{1F9FE} \u0417\u0430\u043A\u0430\u0437\u044B")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/in-work",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F6E0}\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0435`);
            } else {
              return [
                createTextVNode("\u{1F6E0}\uFE0F \u0412 \u0440\u0430\u0431\u043E\u0442\u0435")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/admin/shipments",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F69A} \u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438`);
            } else {
              return [
                createTextVNode("\u{1F69A} \u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0438")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u041C\u043E\u0434\u0435\u0440\u0430\u0446\u0438\u044F</div><div class="mt-1 text-lg font-semibold">\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B</div><div class="text-sm text-gray-600 mt-2">\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C, \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0430\u0442\u044C, \u043E\u0442\u043A\u043B\u043E\u043D\u044F\u0442\u044C.</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u041E\u043F\u0435\u0440\u0430\u0446\u0438\u0438</div><div class="mt-1 text-lg font-semibold">\u0417\u0430\u043A\u0430\u0437\u044B</div><div class="text-sm text-gray-600 mt-2">\u0421\u0442\u0430\u0442\u0443\u0441\u044B, \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430, \u043A\u043E\u043C\u043C\u0443\u043D\u0438\u043A\u0430\u0446\u0438\u044F.</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u0421\u0431\u043E\u0440\u043A\u0430</div><div class="mt-1 text-lg font-semibold">\u0412 \u0440\u0430\u0431\u043E\u0442\u0435</div><div class="text-sm text-gray-600 mt-2">\u0421\u0431\u043E\u0440\u043A\u0430 \u0438 \u0437\u0430\u043A\u0440\u044B\u0442\u0438\u0435 \u0437\u0430\u043A\u0430\u0437\u043E\u0432.</div></div></div><!--]-->`);
      } else {
        _push(`<!--[--><div class="flex flex-col md:flex-row md:items-end md:justify-between gap-3"><div><h1 class="text-2xl font-semibold">\u0414\u044D\u0448\u0431\u043E\u0440\u0434</h1><p class="text-sm text-gray-600 mt-1"> \u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F \u043A \u0437\u0430\u043A\u0430\u0437\u0430\u043C \u0438 \u043D\u0430\u0431\u043E\u0440\u0443 \u043F\u043E\u0437\u0438\u0446\u0438\u0439. \u0417\u0434\u0435\u0441\u044C \u043F\u043E\u0437\u0436\u0435 \u043F\u043E\u044F\u0432\u0438\u0442\u0441\u044F \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430 \u0438 \u0443\u0432\u0435\u0434\u043E\u043C\u043B\u0435\u043D\u0438\u044F. </p></div><div class="flex items-center gap-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/quick-order",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-300 text-slate-900 text-sm font-semibold hover:brightness-95"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u26A1 \u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 `);
            } else {
              return [
                createTextVNode(" \u26A1 \u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0437\u0430\u043A\u0430\u0437 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/orders",
          class: "inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u{1F9FE} \u0417\u0430\u043A\u0430\u0437\u044B `);
            } else {
              return [
                createTextVNode(" \u{1F9FE} \u0417\u0430\u043A\u0430\u0437\u044B ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-3"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u0421\u0442\u0430\u0442\u0443\u0441</div><div class="mt-1 text-lg font-semibold">\u0410\u043A\u043A\u0430\u0443\u043D\u0442 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430</div><div class="text-sm text-gray-600 mt-2"> \u041E\u043F\u0442\u043E\u0432\u044B\u0435 \u0446\u0435\u043D\u044B \u0430\u043A\u0442\u0438\u0432\u043D\u044B. \u0415\u0441\u043B\u0438 \u043D\u0435 \u0432\u0438\u0434\u0438\u0442\u0435 \u043E\u043F\u0442 \u2014 \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044C \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0435. </div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u0417\u0430\u043A\u0430\u0437\u044B</div><div class="mt-1 text-lg font-semibold">\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0438 \u043F\u043E\u0432\u0442\u043E\u0440</div><div class="text-sm text-gray-600 mt-2"> \u0421\u043F\u0438\u0441\u043E\u043A \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430, \u0441\u0442\u0430\u0442\u0443\u0441\u044B, \u043F\u043E\u0432\u0442\u043E\u0440 \u0437\u0430\u043A\u0430\u0437\u0430 \u043E\u0434\u043D\u043E\u0439 \u043A\u043D\u043E\u043F\u043A\u043E\u0439. </div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-xs text-gray-500">\u041D\u0430\u0431\u043E\u0440</div><div class="mt-1 text-lg font-semibold">\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0432\u0432\u043E\u0434</div><div class="text-sm text-gray-600 mt-2"> \u0422\u0430\u0431\u043B\u0438\u0447\u043D\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441: \u0430\u0440\u0442\u0438\u043A\u0443\u043B \u2192 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E, \u043F\u043B\u044E\u0441 \u0438\u043C\u043F\u043E\u0440\u0442 \u0441\u043F\u0438\u0441\u043A\u043E\u043C. </div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-3"><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="flex items-center justify-between gap-3"><div><div class="text-sm font-semibold">\u0411\u044B\u0441\u0442\u0440\u044B\u0439 \u0441\u0442\u0430\u0440\u0442</div><div class="text-xs text-gray-500 mt-1">\u0422\u043E, \u0447\u0442\u043E \u043E\u0431\u044B\u0447\u043D\u043E \u043D\u0443\u0436\u043D\u043E \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0443 \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C</div></div></div><div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/quick-order",
          class: "rounded-xl border border-gray-200 hover:bg-gray-100 p-3"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-sm font-medium"${_scopeId}>\u26A1 \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u043A\u0430\u0437</div><div class="text-xs text-gray-500 mt-1"${_scopeId}>\u041D\u0430\u0431\u0440\u0430\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u043F\u043E \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0430\u043C</div>`);
            } else {
              return [
                createVNode("div", { class: "text-sm font-medium" }, "\u26A1 \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u043A\u0430\u0437"),
                createVNode("div", { class: "text-xs text-gray-500 mt-1" }, "\u041D\u0430\u0431\u0440\u0430\u0442\u044C \u043F\u043E\u0437\u0438\u0446\u0438\u0438 \u043F\u043E \u0430\u0440\u0442\u0438\u043A\u0443\u043B\u0430\u043C")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/b2b/orders",
          class: "rounded-xl border border-gray-200 hover:bg-gray-100 p-3"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="text-sm font-medium"${_scopeId}>\u{1F9FE} \u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0437\u0430\u043A\u0430\u0437\u044B</div><div class="text-xs text-gray-500 mt-1"${_scopeId}>\u0421\u0442\u0430\u0442\u0443\u0441\u044B, \u043F\u043E\u0432\u0442\u043E\u0440, \u0432\u044B\u0433\u0440\u0443\u0437\u043A\u0438</div>`);
            } else {
              return [
                createVNode("div", { class: "text-sm font-medium" }, "\u{1F9FE} \u041F\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0437\u0430\u043A\u0430\u0437\u044B"),
                createVNode("div", { class: "text-xs text-gray-500 mt-1" }, "\u0421\u0442\u0430\u0442\u0443\u0441\u044B, \u043F\u043E\u0432\u0442\u043E\u0440, \u0432\u044B\u0433\u0440\u0443\u0437\u043A\u0438")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="rounded-2xl border border-gray-200 bg-white p-4"><div class="text-sm font-semibold">\u0427\u0442\u043E \u0434\u0430\u043B\u044C\u0448\u0435 (v0.2.x)</div><ul class="mt-3 space-y-2 text-sm text-gray-600"><li class="flex items-start gap-2"><span class="mt-1">\u2022</span><span>\u041E\u0441\u0442\u0430\u0442\u043A\u0438 \u043F\u043E \u0441\u043A\u043B\u0430\u0434\u0430\u043C / \u0433\u0440\u0443\u043F\u043F\u0430\u043C \u0441\u043A\u043B\u0430\u0434\u043E\u0432</span></li><li class="flex items-start gap-2"><span class="mt-1">\u2022</span><span>\u0428\u0430\u0431\u043B\u043E\u043D\u044B \u0437\u0430\u043A\u0430\u0437\u043E\u0432 \u0438 \u0438\u043C\u043F\u043E\u0440\u0442 \xAB\u0430\u0440\u0442\u0438\u043A\u0443\u043B;\u043A\u043E\u043B-\u0432\u043E\xBB</span></li><li class="flex items-start gap-2"><span class="mt-1">\u2022</span><span>\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u044B\u0435 \u0446\u0435\u043D\u044B \u0438 \u0432\u044B\u0431\u043E\u0440 \u0446\u0435\u043D\u043E\u0432\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u044B</span></li></ul></div></div><!--]-->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BqE1Btgh.mjs.map
