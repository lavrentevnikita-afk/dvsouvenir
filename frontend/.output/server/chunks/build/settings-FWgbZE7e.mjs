import { _ as _sfc_main$1, a as _sfc_main$2 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$3 } from './AdminSelect-4bn3Tbjh.mjs';
import { defineComponent, ref, watch, mergeProps, unref, withCtx, createVNode, createBlock, createCommentVNode, openBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
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
  __name: "settings",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const tab = ref("users");
    const loading = ref(false);
    const error = ref(null);
    const users = ref([]);
    const reasons = ref([]);
    const logs = ref([]);
    const systemLoading = ref(false);
    const systemWarehouses = ref([]);
    const mainWarehouses = ref({
      blanksWarehouseId: null,
      finishedWarehouseId: null,
      defectWarehouseId: null
    });
    async function loadMainWarehouses() {
      var _a;
      if (!auth.accessToken) return;
      systemLoading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/settings/main-warehouses", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        const mw = (res == null ? void 0 : res.mainWarehouses) || res || {};
        mainWarehouses.value = {
          blanksWarehouseId: (mw == null ? void 0 : mw.blanksWarehouseId) ? Number(mw.blanksWarehouseId) : null,
          finishedWarehouseId: (mw == null ? void 0 : mw.finishedWarehouseId) ? Number(mw.finishedWarehouseId) : null,
          defectWarehouseId: (mw == null ? void 0 : mw.defectWarehouseId) ? Number(mw.defectWarehouseId) : null
        };
        systemWarehouses.value = Array.isArray(res == null ? void 0 : res.warehouses) ? res.warehouses : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u0438\u0441\u0442\u0435\u043C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438";
      } finally {
        systemLoading.value = false;
      }
    }
    ref(null);
    async function loadUsers() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/settings/users", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        users.value = Array.isArray(res == null ? void 0 : res.users) ? res.users : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439";
      } finally {
        loading.value = false;
      }
    }
    async function setRole(u, role) {
      var _a;
      if (!auth.accessToken) return;
      try {
        await $fetch(`/api/admin/settings/users/${u.id}/role`, {
          method: "PATCH",
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { role }
        });
        await loadUsers();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0440\u043E\u043B\u044C";
      }
    }
    async function loadReasons() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/settings/dicts/issue-reasons", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        reasons.value = Array.isArray(res == null ? void 0 : res.reasons) ? res.reasons : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A";
      } finally {
        loading.value = false;
      }
    }
    async function loadLogs() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/settings/audit", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: { limit: 200 }
        });
        logs.value = Array.isArray(res == null ? void 0 : res.logs) ? res.logs : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043B\u043E\u0433\u0438";
      } finally {
        loading.value = false;
      }
    }
    watch(tab, async () => {
      if (tab.value === "users") return loadUsers();
      if (tab.value === "dicts") return loadReasons();
      if (tab.value === "system") return loadMainWarehouses();
      if (tab.value === "logs") return loadLogs();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminCard = _sfc_main$2;
      const _component_AdminSelect = _sfc_main$3;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
        description: "\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438, \u0440\u043E\u043B\u0438, \u0441\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438, \u0441\u0438\u0441\u0442\u0435\u043C\u043D\u044B\u0435 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
        icon: "\u2699\uFE0F"
      }, null, _parent));
      _push(`<div class="bg-slate-100 p-1 rounded-xl inline-flex gap-1"><button class="${ssrRenderClass([unref(tab) === "users" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438 </button><button class="${ssrRenderClass([unref(tab) === "dicts" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u0421\u043F\u0440\u0430\u0432\u043E\u0447\u043D\u0438\u043A\u0438 </button><button class="${ssrRenderClass([unref(tab) === "system" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u0421\u0438\u0441\u0442\u0435\u043C\u0430 </button><button class="${ssrRenderClass([unref(tab) === "logs" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u041B\u043E\u0433\u0438 </button><button class="${ssrRenderClass([unref(tab) === "integrations" ? "bg-white shadow-sm text-slate-900" : "text-slate-600 hover:text-slate-900", "px-4 py-2.5 rounded-lg text-sm font-medium transition-all"])}"> \u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438 </button></div>`);
      if (unref(error)) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(unref(error))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "users" && !unref(loading)) {
        _push(ssrRenderComponent(_component_AdminCard, {
          padding: false,
          title: "\u{1F465} \u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0438 \u0438 \u0440\u043E\u043B\u0438"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="overflow-x-auto"${_scopeId}><table class="w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>ID</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0418\u043C\u044F</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>Email</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0420\u043E\u043B\u044C</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(users), (u) => {
                _push2(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-5 py-4 font-medium text-slate-700"${_scopeId}>${ssrInterpolate(u.id)}</td><td class="px-5 py-4 font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(u.name)}</td><td class="px-5 py-4 text-slate-600"${_scopeId}>${ssrInterpolate(u.email)}</td><td class="px-5 py-4"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminSelect, {
                  class: "w-[180px]",
                  modelValue: u.role,
                  options: [
                    { value: "admin", label: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", icon: "\u{1F451}" },
                    { value: "manager", label: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440", icon: "\u{1F4BC}" },
                    { value: "warehouse", label: "\u0421\u043A\u043B\u0430\u0434", icon: "\u{1F4E6}" },
                    { value: "production", label: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E", icon: "\u{1F3ED}" },
                    { value: "store", label: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D", icon: "\u{1F3EA}" },
                    { value: "customer", label: "\u041A\u043B\u0438\u0435\u043D\u0442", icon: "\u{1F6D2}" }
                  ],
                  "onUpdate:modelValue": (val) => setRole(u, val)
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="px-5 py-4 text-right text-xs text-slate-400"${_scopeId}>\u2014</td></tr>`);
              });
              _push2(`<!--]-->`);
              if (unref(users).length === 0) {
                _push2(`<tr${_scopeId}><td colspan="5" class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F465}</div><div${_scopeId}>\u041D\u0435\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439</div></td></tr>`);
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
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "ID"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0418\u043C\u044F"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "Email"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0420\u043E\u043B\u044C"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(users), (u) => {
                        return openBlock(), createBlock("tr", {
                          key: u.id,
                          class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                        }, [
                          createVNode("td", { class: "px-5 py-4 font-medium text-slate-700" }, toDisplayString(u.id), 1),
                          createVNode("td", { class: "px-5 py-4 font-semibold text-slate-900" }, toDisplayString(u.name), 1),
                          createVNode("td", { class: "px-5 py-4 text-slate-600" }, toDisplayString(u.email), 1),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode(_component_AdminSelect, {
                              class: "w-[180px]",
                              modelValue: u.role,
                              options: [
                                { value: "admin", label: "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440", icon: "\u{1F451}" },
                                { value: "manager", label: "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440", icon: "\u{1F4BC}" },
                                { value: "warehouse", label: "\u0421\u043A\u043B\u0430\u0434", icon: "\u{1F4E6}" },
                                { value: "production", label: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E", icon: "\u{1F3ED}" },
                                { value: "store", label: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D", icon: "\u{1F3EA}" },
                                { value: "customer", label: "\u041A\u043B\u0438\u0435\u043D\u0442", icon: "\u{1F6D2}" }
                              ],
                              "onUpdate:modelValue": (val) => setRole(u, val)
                            }, null, 8, ["modelValue", "onUpdate:modelValue"])
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-right text-xs text-slate-400" }, "\u2014")
                        ]);
                      }), 128)),
                      unref(users).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "5",
                          class: "px-5 py-12 text-center text-slate-500"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F465}"),
                          createVNode("div", null, "\u041D\u0435\u0442 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u0435\u0439")
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
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "dicts") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-3"><div class="flex items-center justify-between gap-2"><div><div class="text-sm font-medium">\u041F\u0440\u0438\u0447\u0438\u043D\u044B \u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0439</div><div class="text-xs text-gray-500">\u0418\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u044E\u0442\u0441\u044F \u0432 \u201C-\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435\u201D \u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435</div></div><div class="flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">+ \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C</button><button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</button></div></div><div class="rounded-xl border border-gray-200 overflow-hidden"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">code</th><th class="text-left px-4 py-3">label</th><th class="text-right px-4 py-3">\u2014</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(reasons), (r, i) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3"><input${ssrRenderAttr("value", r.code)} class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></td><td class="px-4 py-3"><input${ssrRenderAttr("value", r.label)} class="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"></td><td class="px-4 py-3 text-right"><button class="px-3 py-2 rounded-xl border border-red-200 text-red-700 hover:bg-red-50 text-xs">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button></td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(reasons).length === 0) {
          _push(`<tr><td colspan="3" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "system") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-4"><div class="flex items-center justify-between gap-2"><div><div class="text-sm font-medium">\u041E\u0441\u043D\u043E\u0432\u043D\u044B\u0435 \u0441\u043A\u043B\u0430\u0434\u044B</div><div class="text-xs text-gray-500">\u0424\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442: BLANKS (\u0437\u0430\u0433\u043E\u0442\u043E\u0432\u043A\u0438), FINISHED (\u0433\u043E\u0442\u043E\u0432\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F), \u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E DEFECT</div></div><div class="flex items-center gap-2"><button class="px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 text-sm">\u041E\u0431\u043D\u043E\u0432\u0438\u0442\u044C</button><button class="px-3 py-2 rounded-xl bg-slate-900 text-white text-sm hover:opacity-90">\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</button></div></div>`);
        if (unref(systemLoading)) {
          _push(`<div class="text-sm text-gray-500">\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 md:grid-cols-3 gap-3"><div class="space-y-1"><div class="text-xs text-gray-500">BLANKS</div><select class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(mainWarehouses).blanksWarehouseId) ? ssrLooseContain(unref(mainWarehouses).blanksWarehouseId, null) : ssrLooseEqual(unref(mainWarehouses).blanksWarehouseId, null)) ? " selected" : ""}>\u2014</option><!--[-->`);
        ssrRenderList(unref(systemWarehouses), (w) => {
          _push(`<option${ssrRenderAttr("value", Number(w.id))}${ssrIncludeBooleanAttr(Array.isArray(unref(mainWarehouses).blanksWarehouseId) ? ssrLooseContain(unref(mainWarehouses).blanksWarehouseId, Number(w.id)) : ssrLooseEqual(unref(mainWarehouses).blanksWarehouseId, Number(w.id))) ? " selected" : ""}>${ssrInterpolate(w.code)} \u2014 ${ssrInterpolate(w.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1"><div class="text-xs text-gray-500">FINISHED</div><select class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(mainWarehouses).finishedWarehouseId) ? ssrLooseContain(unref(mainWarehouses).finishedWarehouseId, null) : ssrLooseEqual(unref(mainWarehouses).finishedWarehouseId, null)) ? " selected" : ""}>\u2014</option><!--[-->`);
        ssrRenderList(unref(systemWarehouses), (w) => {
          _push(`<option${ssrRenderAttr("value", Number(w.id))}${ssrIncludeBooleanAttr(Array.isArray(unref(mainWarehouses).finishedWarehouseId) ? ssrLooseContain(unref(mainWarehouses).finishedWarehouseId, Number(w.id)) : ssrLooseEqual(unref(mainWarehouses).finishedWarehouseId, Number(w.id))) ? " selected" : ""}>${ssrInterpolate(w.code)} \u2014 ${ssrInterpolate(w.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="space-y-1"><div class="text-xs text-gray-500">DEFECT (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E)</div><select class="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(mainWarehouses).defectWarehouseId) ? ssrLooseContain(unref(mainWarehouses).defectWarehouseId, null) : ssrLooseEqual(unref(mainWarehouses).defectWarehouseId, null)) ? " selected" : ""}>\u2014</option><!--[-->`);
        ssrRenderList(unref(systemWarehouses), (w) => {
          _push(`<option${ssrRenderAttr("value", Number(w.id))}${ssrIncludeBooleanAttr(Array.isArray(unref(mainWarehouses).defectWarehouseId) ? ssrLooseContain(unref(mainWarehouses).defectWarehouseId, Number(w.id)) : ssrLooseEqual(unref(mainWarehouses).defectWarehouseId, Number(w.id))) ? " selected" : ""}>${ssrInterpolate(w.code)} \u2014 ${ssrInterpolate(w.name)}</option>`);
        });
        _push(`<!--]--></select></div></div><div class="text-xs text-gray-500"> \u042D\u0442\u0438 id \u0431\u0443\u0434\u0443\u0442 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u0434\u0430\u043B\u044C\u0448\u0435 \u0434\u043B\u044F \u043F\u0440\u0430\u0432\u0438\u043B: \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0430 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0437 FINISHED, \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u043E \u043F\u043E \u0440\u0435\u0446\u0435\u043F\u0442\u0443 (BOM), \u0440\u0435\u0437\u0435\u0440\u0432\u044B \u0442\u043E\u043B\u044C\u043A\u043E \u0441 \u043F\u0440\u0438\u0432\u044F\u0437\u043A\u043E\u0439 \u043A \u0437\u0430\u043A\u0430\u0437\u0443. </div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "logs") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white overflow-hidden"><div class="overflow-x-auto"><table class="w-full text-sm"><thead class="bg-gray-50 text-xs text-gray-600"><tr><th class="text-left px-4 py-3">\u0414\u0430\u0442\u0430/\u0432\u0440\u0435\u043C\u044F</th><th class="text-left px-4 py-3">Action</th><th class="text-left px-4 py-3">Entity</th><th class="text-left px-4 py-3">UserId</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(logs), (l) => {
          _push(`<tr class="border-t border-gray-100"><td class="px-4 py-3 text-xs text-gray-600">${ssrInterpolate(new Date(l.createdAt).toLocaleString())}</td><td class="px-4 py-3">${ssrInterpolate(l.action)}</td><td class="px-4 py-3 text-xs text-gray-600">${ssrInterpolate(l.entity || "\u2014")}</td><td class="px-4 py-3 text-xs text-gray-600">${ssrInterpolate(l.userId || "\u2014")}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (unref(logs).length === 0) {
          _push(`<tr><td colspan="4" class="px-4 py-8 text-center text-gray-500">\u041F\u0443\u0441\u0442\u043E</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(tab) === "integrations") {
        _push(`<div class="rounded-2xl border border-gray-200 bg-white p-4 space-y-2"><div class="text-sm font-medium">\u0418\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438</div><div class="text-sm text-gray-600">\u041F\u043E\u043A\u0430 \u0437\u0430\u0433\u043B\u0443\u0448\u043A\u0430: \u0441\u044E\u0434\u0430 \u043C\u043E\u0436\u043D\u043E \u0434\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u0442\u0430\u0442\u0443\u0441\u044B \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0439 (CRM/\u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0430/\u043E\u043F\u043B\u0430\u0442\u0430).</div><div class="text-xs text-gray-500">\u0415\u0441\u043B\u0438 \u043D\u0443\u0436\u043D\u043E \u2014 \u044F \u0441\u0434\u0435\u043B\u0430\u044E UI \u043F\u043E\u0434 \u043A\u043E\u043D\u043A\u0440\u0435\u0442\u043D\u044B\u0435 \u0438\u043D\u0442\u0435\u0433\u0440\u0430\u0446\u0438\u0438 \u0438 health-check \u044D\u043D\u0434\u043F\u043E\u0438\u043D\u0442\u044B.</div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=settings-FWgbZE7e.mjs.map
