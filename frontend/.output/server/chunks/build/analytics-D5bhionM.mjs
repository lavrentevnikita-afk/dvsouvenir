import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminInput-CTfEX194.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, ref, mergeProps, withCtx, createTextVNode, createVNode, createBlock, openBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
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
  __name: "analytics",
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
    const loading = ref(false);
    const err = ref("");
    const dateFrom = ref("");
    const dateTo = ref("");
    const city = ref("");
    const sortTop = ref("revenue");
    const overview = ref(null);
    function fmtDate(d) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    function setPreset(preset) {
      const now = /* @__PURE__ */ new Date();
      const start = new Date(now);
      if (preset === "week") start.setDate(start.getDate() - 6);
      if (preset === "month") start.setDate(start.getDate() - 29);
      if (preset === "quarter") start.setDate(start.getDate() - 89);
      dateFrom.value = fmtDate(start);
      dateTo.value = fmtDate(now);
    }
    function money(v) {
      const n = Number(v || 0);
      try {
        return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(n) + " \u20BD";
      } catch {
        return `${Math.round(n)} \u20BD`;
      }
    }
    function percent(v) {
      const n = Number(v || 0);
      return `${Math.round(n * 1e3) / 10}%`;
    }
    async function api(path, opts) {
      if (!auth.accessToken) throw new Error("\u041D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u0430");
      return await $fetch(path, {
        baseURL: apiBaseUrl.value,
        headers: { Authorization: `Bearer ${auth.accessToken}` },
        ...opts || {}
      });
    }
    async function load() {
      var _a;
      if (!isAdmin.value) return;
      loading.value = true;
      err.value = "";
      try {
        overview.value = await api("/api/admin/analytics/overview", {
          query: {
            dateFrom: dateFrom.value || void 0,
            dateTo: dateTo.value || void 0,
            city: city.value || void 0
          }
        });
      } catch (e) {
        err.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || (e == null ? void 0 : e.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0443";
      } finally {
        loading.value = false;
      }
    }
    const topProductsSorted = computed(() => {
      var _a;
      const arr = ((_a = overview.value) == null ? void 0 : _a.topProducts) || [];
      const key = sortTop.value === "qty" ? "qty" : "revenue";
      return [...arr].sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0));
    });
    const topCategoriesSorted = computed(() => {
      var _a;
      const arr = ((_a = overview.value) == null ? void 0 : _a.topCategories) || [];
      const key = sortTop.value === "qty" ? "qty" : "revenue";
      return [...arr].sort((a, b) => Number(b[key] || 0) - Number(a[key] || 0));
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a2, _b2, _c2, _d2, _e2;
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s, _t, _u, _v;
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminInput = _sfc_main$4;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u0410\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430",
        description: "\u041F\u0440\u043E\u0434\u0430\u0436\u0438, \u0437\u0430\u043A\u0430\u0437\u044B, \u0442\u043E\u043F, \u0434\u0435\u0444\u0438\u0446\u0438\u0442, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438",
        icon: "\u{1F4CA}"
      }, {
        actions: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_AdminButton, {
              onClick: ($event) => {
                setPreset("week");
                load();
              }
            }, {
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
            _push2(ssrRenderComponent(_component_AdminButton, {
              onClick: ($event) => {
                setPreset("month");
                load();
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u041C\u0435\u0441\u044F\u0446`);
                } else {
                  return [
                    createTextVNode("\u041C\u0435\u0441\u044F\u0446")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminButton, {
              onClick: ($event) => {
                setPreset("quarter");
                load();
              }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u041A\u0432\u0430\u0440\u0442\u0430\u043B`);
                } else {
                  return [
                    createTextVNode("\u041A\u0432\u0430\u0440\u0442\u0430\u043B")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_AdminButton, {
                onClick: ($event) => {
                  setPreset("week");
                  load();
                }
              }, {
                default: withCtx(() => [
                  createTextVNode("\u041D\u0435\u0434\u0435\u043B\u044F")
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_AdminButton, {
                onClick: ($event) => {
                  setPreset("month");
                  load();
                }
              }, {
                default: withCtx(() => [
                  createTextVNode("\u041C\u0435\u0441\u044F\u0446")
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_AdminButton, {
                onClick: ($event) => {
                  setPreset("quarter");
                  load();
                }
              }, {
                default: withCtx(() => [
                  createTextVNode("\u041A\u0432\u0430\u0440\u0442\u0430\u043B")
                ]),
                _: 1
              }, 8, ["onClick"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_AdminCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-wrap items-center gap-3"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: dateFrom.value,
              "onUpdate:modelValue": ($event) => dateFrom.value = $event,
              type: "date",
              icon: "calendar",
              class: "w-[180px]"
            }, null, _parent2, _scopeId));
            _push2(`<span class="text-slate-400"${_scopeId}>\u2014</span>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: dateTo.value,
              "onUpdate:modelValue": ($event) => dateTo.value = $event,
              type: "date",
              icon: "calendar",
              class: "w-[180px]"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: city.value,
              "onUpdate:modelValue": ($event) => city.value = $event,
              placeholder: "\u0413\u043E\u0440\u043E\u0434 (\u043E\u043F\u0446.)",
              class: "w-[200px]"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminButton, {
              variant: "primary",
              onClick: load
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
                createVNode(_component_AdminInput, {
                  modelValue: dateFrom.value,
                  "onUpdate:modelValue": ($event) => dateFrom.value = $event,
                  type: "date",
                  icon: "calendar",
                  class: "w-[180px]"
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode("span", { class: "text-slate-400" }, "\u2014"),
                createVNode(_component_AdminInput, {
                  modelValue: dateTo.value,
                  "onUpdate:modelValue": ($event) => dateTo.value = $event,
                  type: "date",
                  icon: "calendar",
                  class: "w-[180px]"
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode(_component_AdminInput, {
                  modelValue: city.value,
                  "onUpdate:modelValue": ($event) => city.value = $event,
                  placeholder: "\u0413\u043E\u0440\u043E\u0434 (\u043E\u043F\u0446.)",
                  class: "w-[200px]"
                }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                createVNode(_component_AdminButton, {
                  variant: "primary",
                  onClick: load
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
      if (!isAdmin.value) {
        _push(`<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 flex items-center gap-2"><span>\u26A0\uFE0F</span> \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0442\u043E\u043B\u044C\u043A\u043E \u0430\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440\u0443. </div>`);
      } else if (err.value) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(err.value)}</div>`);
      } else if (loading.value) {
        _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0438\u2026</span></div></div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-lg">\u{1F4B0}</div><div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">\u0412\u044B\u0440\u0443\u0447\u043A\u0430</div></div><div class="text-2xl font-bold text-slate-900 tabular-nums">${ssrInterpolate(money((_a = overview.value) == null ? void 0 : _a.revenue))}</div><div class="text-xs text-slate-500 mt-2">\u041F\u0435\u0440\u0438\u043E\u0434: ${ssrInterpolate((_c = (_b = overview.value) == null ? void 0 : _b.range) == null ? void 0 : _c.dateFrom)} \u2014 ${ssrInterpolate((_e = (_d = overview.value) == null ? void 0 : _d.range) == null ? void 0 : _e.dateTo)}</div></div><div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-lg">\u{1F4E6}</div><div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">\u0417\u0430\u043A\u0430\u0437\u044B</div></div><div class="text-2xl font-bold text-slate-900 tabular-nums">${ssrInterpolate((_a2 = (_f = overview.value) == null ? void 0 : _f.ordersCount) != null ? _a2 : 0)}</div><div class="text-xs text-slate-500 mt-2">\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0447\u0435\u043A: <span class="font-medium text-slate-700">${ssrInterpolate(money((_g = overview.value) == null ? void 0 : _g.avgCheck))}</span></div></div><div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm hover:shadow-md transition-shadow"><div class="flex items-center gap-3 mb-3"><div class="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-lg">\u23F1\uFE0F</div><div class="text-xs text-slate-500 uppercase tracking-wide font-semibold">\u041F\u043E\u0434 \u0437\u0430\u043A\u0430\u0437</div></div><div class="text-2xl font-bold text-slate-900 tabular-nums">${ssrInterpolate(percent((_h = overview.value) == null ? void 0 : _h.preorderShare))}</div><div class="text-xs text-slate-500 mt-2"> \u0414\u043E \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438: <span class="font-medium text-slate-700">${ssrInterpolate(Math.round((((_j = (_i = overview.value) == null ? void 0 : _i.productionLeadTime) == null ? void 0 : _j.hours) || 0) * 10) / 10)} \u0447</span></div></div></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm"><div class="flex items-start justify-between gap-3 mb-4"><div><div class="text-sm font-bold text-slate-800">\u{1F9F1} \u0414\u0435\u0444\u0438\u0446\u0438\u0442 \u2014 \u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438</div><div class="text-xs text-slate-500 mt-1">\u041F\u043E\u0440\u043E\u0433 minQty, \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u044F \u0440\u0435\u0437\u0435\u0440\u0432\u044B</div></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/admin/warehouse" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_AdminButton, { size: "sm" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043A\u043B\u0430\u0434`);
                  } else {
                    return [
                      createTextVNode("\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043A\u043B\u0430\u0434")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_AdminButton, { size: "sm" }, {
                  default: withCtx(() => [
                    createTextVNode("\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043A\u043B\u0430\u0434")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="grid grid-cols-2 gap-3"><div class="rounded-xl bg-slate-50 border border-slate-100 p-4"><div class="text-xs text-slate-500 uppercase tracking-wide mb-1">\u041F\u043E\u0437\u0438\u0446\u0438\u0439</div><div class="text-xl font-bold text-slate-900 tabular-nums">${ssrInterpolate((_b2 = (_m = (_l = (_k = overview.value) == null ? void 0 : _k.stockDeficit) == null ? void 0 : _l.blanks) == null ? void 0 : _m.positions) != null ? _b2 : 0)}</div></div><div class="rounded-xl bg-red-50 border border-red-100 p-4"><div class="text-xs text-red-600 uppercase tracking-wide mb-1">\u0414\u0435\u0444\u0438\u0446\u0438\u0442 (\u0448\u0442.)</div><div class="text-xl font-bold text-red-700 tabular-nums">${ssrInterpolate((_c2 = (_p = (_o = (_n = overview.value) == null ? void 0 : _n.stockDeficit) == null ? void 0 : _o.blanks) == null ? void 0 : _p.deficitUnits) != null ? _c2 : 0)}</div></div></div></div><div class="rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-5 shadow-sm"><div class="flex items-start justify-between gap-3 mb-4"><div><div class="text-sm font-bold text-slate-800">\u{1F4E6} \u0414\u0435\u0444\u0438\u0446\u0438\u0442 \u2014 \u0433\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F</div><div class="text-xs text-slate-500 mt-1">\u041F\u043E\u0440\u043E\u0433 minQty, \u0443\u0447\u0438\u0442\u044B\u0432\u0430\u044F \u0440\u0435\u0437\u0435\u0440\u0432\u044B</div></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, { to: "/admin/warehouse" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(ssrRenderComponent(_component_AdminButton, { size: "sm" }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(`\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043A\u043B\u0430\u0434`);
                  } else {
                    return [
                      createTextVNode("\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043A\u043B\u0430\u0434")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
            } else {
              return [
                createVNode(_component_AdminButton, { size: "sm" }, {
                  default: withCtx(() => [
                    createTextVNode("\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0441\u043A\u043B\u0430\u0434")
                  ]),
                  _: 1
                })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="grid grid-cols-2 gap-3"><div class="rounded-xl bg-slate-50 border border-slate-100 p-4"><div class="text-xs text-slate-500 uppercase tracking-wide mb-1">\u041F\u043E\u0437\u0438\u0446\u0438\u0439</div><div class="text-xl font-bold text-slate-900 tabular-nums">${ssrInterpolate((_d2 = (_s = (_r = (_q = overview.value) == null ? void 0 : _q.stockDeficit) == null ? void 0 : _r.finished) == null ? void 0 : _s.positions) != null ? _d2 : 0)}</div></div><div class="rounded-xl bg-red-50 border border-red-100 p-4"><div class="text-xs text-red-600 uppercase tracking-wide mb-1">\u0414\u0435\u0444\u0438\u0446\u0438\u0442 (\u0448\u0442.)</div><div class="text-xl font-bold text-red-700 tabular-nums">${ssrInterpolate((_e2 = (_v = (_u = (_t = overview.value) == null ? void 0 : _t.stockDeficit) == null ? void 0 : _u.finished) == null ? void 0 : _v.deficitUnits) != null ? _e2 : 0)}</div></div></div></div></div>`);
        _push(ssrRenderComponent(_component_AdminCard, {
          padding: false,
          title: "\u{1F3C6} \u0422\u043E\u043F \u043F\u0440\u043E\u0434\u0430\u0436"
        }, {
          "header-actions": withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center gap-2"${_scopeId}><span class="text-xs text-slate-500"${_scopeId}>\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430:</span>`);
              _push2(ssrRenderComponent(_component_AdminButton, {
                size: "sm",
                variant: sortTop.value === "revenue" ? "primary" : "secondary",
                onClick: ($event) => sortTop.value = "revenue"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` \u{1F4B0} \u0412\u044B\u0440\u0443\u0447\u043A\u0430 `);
                  } else {
                    return [
                      createTextVNode(" \u{1F4B0} \u0412\u044B\u0440\u0443\u0447\u043A\u0430 ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(ssrRenderComponent(_component_AdminButton, {
                size: "sm",
                variant: sortTop.value === "qty" ? "primary" : "secondary",
                onClick: ($event) => sortTop.value = "qty"
              }, {
                default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                  if (_push3) {
                    _push3(` \u{1F4CA} \u041A\u043E\u043B-\u0432\u043E `);
                  } else {
                    return [
                      createTextVNode(" \u{1F4CA} \u041A\u043E\u043B-\u0432\u043E ")
                    ];
                  }
                }),
                _: 1
              }, _parent2, _scopeId));
              _push2(`</div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-2" }, [
                  createVNode("span", { class: "text-xs text-slate-500" }, "\u0421\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043A\u0430:"),
                  createVNode(_component_AdminButton, {
                    size: "sm",
                    variant: sortTop.value === "revenue" ? "primary" : "secondary",
                    onClick: ($event) => sortTop.value = "revenue"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u{1F4B0} \u0412\u044B\u0440\u0443\u0447\u043A\u0430 ")
                    ]),
                    _: 1
                  }, 8, ["variant", "onClick"]),
                  createVNode(_component_AdminButton, {
                    size: "sm",
                    variant: sortTop.value === "qty" ? "primary" : "secondary",
                    onClick: ($event) => sortTop.value = "qty"
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u{1F4CA} \u041A\u043E\u043B-\u0432\u043E ")
                    ]),
                    _: 1
                  }, 8, ["variant", "onClick"])
                ])
              ];
            }
          }),
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100"${_scopeId}><div class="p-5"${_scopeId}><div class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4"${_scopeId}>\u0422\u043E\u0432\u0430\u0440\u044B</div>`);
              if (!topProductsSorted.value.length) {
                _push2(`<div class="text-sm text-slate-500 py-4 text-center"${_scopeId}>\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445</div>`);
              } else {
                _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
                ssrRenderList(topProductsSorted.value, (p, idx) => {
                  _push2(`<div class="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors"${_scopeId}><div class="min-w-0"${_scopeId}><div class="text-sm font-semibold text-slate-900 truncate"${_scopeId}><span class="text-slate-400 mr-1"${_scopeId}>${ssrInterpolate(idx + 1)}.</span> ${ssrInterpolate(p.name)}</div><div class="text-xs text-slate-500 mt-1 truncate"${_scopeId}>${ssrInterpolate(p.article)} \xB7 ${ssrInterpolate(p.categoryName || "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438")}</div></div><div class="text-right shrink-0"${_scopeId}><div class="text-sm font-bold text-emerald-600 tabular-nums"${_scopeId}>${ssrInterpolate(money(p.revenue))}</div><div class="text-xs text-slate-500 tabular-nums mt-1"${_scopeId}>${ssrInterpolate(p.qty)} \u0448\u0442.</div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              }
              _push2(`</div><div class="p-5"${_scopeId}><div class="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4"${_scopeId}>\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438</div>`);
              if (!topCategoriesSorted.value.length) {
                _push2(`<div class="text-sm text-slate-500 py-4 text-center"${_scopeId}>\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445</div>`);
              } else {
                _push2(`<div class="space-y-2"${_scopeId}><!--[-->`);
                ssrRenderList(topCategoriesSorted.value, (c, idx) => {
                  _push2(`<div class="flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors"${_scopeId}><div class="min-w-0"${_scopeId}><div class="text-sm font-semibold text-slate-900 truncate"${_scopeId}><span class="text-slate-400 mr-1"${_scopeId}>${ssrInterpolate(idx + 1)}.</span> ${ssrInterpolate(c.categoryName)}</div></div><div class="text-right shrink-0"${_scopeId}><div class="text-sm font-bold text-emerald-600 tabular-nums"${_scopeId}>${ssrInterpolate(money(c.revenue))}</div><div class="text-xs text-slate-500 tabular-nums mt-1"${_scopeId}>${ssrInterpolate(c.qty)} \u0448\u0442.</div></div></div>`);
                });
                _push2(`<!--]--></div>`);
              }
              _push2(`</div></div>`);
            } else {
              return [
                createVNode("div", { class: "grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-100" }, [
                  createVNode("div", { class: "p-5" }, [
                    createVNode("div", { class: "text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4" }, "\u0422\u043E\u0432\u0430\u0440\u044B"),
                    !topProductsSorted.value.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-sm text-slate-500 py-4 text-center"
                    }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445")) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "space-y-2"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(topProductsSorted.value, (p, idx) => {
                        return openBlock(), createBlock("div", {
                          key: p.productId,
                          class: "flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors"
                        }, [
                          createVNode("div", { class: "min-w-0" }, [
                            createVNode("div", { class: "text-sm font-semibold text-slate-900 truncate" }, [
                              createVNode("span", { class: "text-slate-400 mr-1" }, toDisplayString(idx + 1) + ".", 1),
                              createTextVNode(" " + toDisplayString(p.name), 1)
                            ]),
                            createVNode("div", { class: "text-xs text-slate-500 mt-1 truncate" }, toDisplayString(p.article) + " \xB7 " + toDisplayString(p.categoryName || "\u0411\u0435\u0437 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438"), 1)
                          ]),
                          createVNode("div", { class: "text-right shrink-0" }, [
                            createVNode("div", { class: "text-sm font-bold text-emerald-600 tabular-nums" }, toDisplayString(money(p.revenue)), 1),
                            createVNode("div", { class: "text-xs text-slate-500 tabular-nums mt-1" }, toDisplayString(p.qty) + " \u0448\u0442.", 1)
                          ])
                        ]);
                      }), 128))
                    ]))
                  ]),
                  createVNode("div", { class: "p-5" }, [
                    createVNode("div", { class: "text-xs text-slate-500 uppercase tracking-wide font-semibold mb-4" }, "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438"),
                    !topCategoriesSorted.value.length ? (openBlock(), createBlock("div", {
                      key: 0,
                      class: "text-sm text-slate-500 py-4 text-center"
                    }, "\u041D\u0435\u0442 \u0434\u0430\u043D\u043D\u044B\u0445")) : (openBlock(), createBlock("div", {
                      key: 1,
                      class: "space-y-2"
                    }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(topCategoriesSorted.value, (c, idx) => {
                        return openBlock(), createBlock("div", {
                          key: String(c.categoryId) + "-" + idx,
                          class: "flex items-start justify-between gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50/50 transition-colors"
                        }, [
                          createVNode("div", { class: "min-w-0" }, [
                            createVNode("div", { class: "text-sm font-semibold text-slate-900 truncate" }, [
                              createVNode("span", { class: "text-slate-400 mr-1" }, toDisplayString(idx + 1) + ".", 1),
                              createTextVNode(" " + toDisplayString(c.categoryName), 1)
                            ])
                          ]),
                          createVNode("div", { class: "text-right shrink-0" }, [
                            createVNode("div", { class: "text-sm font-bold text-emerald-600 tabular-nums" }, toDisplayString(money(c.revenue)), 1),
                            createVNode("div", { class: "text-xs text-slate-500 tabular-nums mt-1" }, toDisplayString(c.qty) + " \u0448\u0442.", 1)
                          ])
                        ]);
                      }), 128))
                    ]))
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<!--]-->`);
      }
      _push(`</section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/analytics.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=analytics-D5bhionM.mjs.map
