import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminSelect-4bn3Tbjh.mjs';
import { defineComponent, computed, ref, watch, mergeProps, withCtx, createTextVNode, createVNode, toDisplayString, createBlock, createCommentVNode, openBlock, Fragment, renderList, withDirectives, vModelText, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrRenderAttr, ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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
  __name: "db",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const apiBaseUrl = computed(() => {
      const config = useRuntimeConfig();
      return config.apiBaseUrl;
    });
    const tables = ref([]);
    const table = ref("");
    const rows = ref([]);
    const columns = ref([]);
    const limit = ref(50);
    const offset = ref(0);
    const count = ref(0);
    const loading = ref(false);
    const error = ref("");
    const dangerUnlocked = ref(false);
    const dangerPhrase = ref("");
    const confirmEnabled = computed(() => dangerPhrase.value.trim() === "\u042F \u041F\u041E\u041D\u0418\u041C\u0410\u042E");
    const editRowId = ref(null);
    const editDraft = ref({});
    const saveConfirm = ref("");
    const deleteConfirm = ref("");
    const totalPages = computed(() => Math.max(1, Math.ceil((count.value || 0) / limit.value)));
    const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1);
    async function api(path, opts = {}) {
      if (!auth.accessToken) throw new Error("\u041D\u0435\u0442 \u0442\u043E\u043A\u0435\u043D\u0430");
      return await $fetch(path, {
        baseURL: apiBaseUrl.value,
        ...opts,
        headers: {
          ...opts.headers || {},
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
    }
    async function loadTable() {
      var _a;
      if (!table.value) return;
      loading.value = true;
      error.value = "";
      editRowId.value = null;
      editDraft.value = {};
      saveConfirm.value = "";
      try {
        const res = await api(
          `/api/admin/db/table/${table.value}?limit=${limit.value}&offset=${offset.value}`
        );
        columns.value = res.columns;
        rows.value = res.rows;
        count.value = res.count;
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || (e == null ? void 0 : e.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0442\u0430\u0431\u043B\u0438\u0446\u0443";
      } finally {
        loading.value = false;
      }
    }
    function startEdit(r) {
      editRowId.value = r.id;
      editDraft.value = { ...r };
      saveConfirm.value = "";
      deleteConfirm.value = "";
    }
    function cancelEdit() {
      editRowId.value = null;
      editDraft.value = {};
      saveConfirm.value = "";
      deleteConfirm.value = "";
    }
    async function deleteRow() {
      var _a;
      if (!dangerUnlocked.value) return;
      if (!editRowId.value) return;
      if (deleteConfirm.value.trim() !== "YES_DELETE") {
        error.value = "\u0414\u043B\u044F \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F \u0432\u0432\u0435\u0434\u0438 YES_DELETE";
        return;
      }
      const ok = (void 0).confirm("\u0422\u043E\u0447\u043D\u043E \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443? \u042D\u0442\u043E \u043D\u0435\u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E.");
      if (!ok) return;
      loading.value = true;
      error.value = "";
      try {
        await api(`/api/admin/db/table/${table.value}/${editRowId.value}`, {
          method: "DELETE",
          body: { confirm: "YES_DELETE" }
        });
        await loadTable();
        cancelEdit();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || (e == null ? void 0 : e.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0443\u0434\u0430\u043B\u0438\u0442\u044C";
      } finally {
        loading.value = false;
      }
    }
    async function saveEdit() {
      var _a;
      if (!dangerUnlocked.value) return;
      if (!editRowId.value) return;
      if (saveConfirm.value.trim() !== "YES_I_AM_SURE") {
        error.value = "\u0414\u043B\u044F \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F \u0432\u0432\u0435\u0434\u0438 YES_I_AM_SURE";
        return;
      }
      loading.value = true;
      error.value = "";
      try {
        await api(`/api/admin/db/table/${table.value}/${editRowId.value}`, {
          method: "PATCH",
          body: {
            confirm: "YES_I_AM_SURE",
            data: editDraft.value
          }
        });
        await loadTable();
        cancelEdit();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || (e == null ? void 0 : e.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C";
      } finally {
        loading.value = false;
      }
    }
    function prevPage() {
      offset.value = Math.max(0, offset.value - limit.value);
    }
    function nextPage() {
      const maxOffset = Math.max(0, (totalPages.value - 1) * limit.value);
      offset.value = Math.min(maxOffset, offset.value + limit.value);
    }
    watch(table, () => {
      offset.value = 0;
      loadTable();
    });
    watch([limit, offset], () => {
      loadTable();
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminSelect = _sfc_main$4;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "DB Viewer",
        description: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440 \u0438 (\u043E\u043F\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E) \u043E\u043F\u0430\u0441\u043D\u043E\u0435 \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u0430\u0431\u043B\u0438\u0446. \u0422\u043E\u043B\u044C\u043A\u043E \u0434\u043B\u044F admin.",
        icon: "\u{1F5C4}\uFE0F"
      }, null, _parent));
      _push(`<div class="rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm p-5"><div class="flex items-start gap-4"><div class="w-12 h-12 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0"><span class="text-2xl">\u26A0\uFE0F</span></div><div class="min-w-0"><div class="font-bold text-red-700 text-lg">\u041E\u041F\u0410\u0421\u041D\u041E</div><div class="text-sm text-red-700/80 mt-1"> \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0431\u0430\u0437\u044B \u043C\u043E\u0436\u0435\u0442 \u0441\u043B\u043E\u043C\u0430\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D, \u0437\u0430\u043A\u0430\u0437\u044B \u0438 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u0430\u0446\u0438\u044E. \u041F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u043F\u0440\u043E\u0441\u043C\u043E\u0442\u0440. </div><div class="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center"><input${ssrRenderAttr("value", dangerPhrase.value)} class="w-full sm:w-64 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all" placeholder="\u041D\u0430\u043F\u0438\u0448\u0438: \u042F \u041F\u041E\u041D\u0418\u041C\u0410\u042E">`);
      _push(ssrRenderComponent(_component_AdminButton, {
        class: confirmEnabled.value ? "" : "opacity-60",
        disabled: !confirmEnabled.value,
        variant: "danger",
        onClick: ($event) => dangerUnlocked.value = true
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u{1F513} \u0420\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 `);
          } else {
            return [
              createTextVNode(" \u{1F513} \u0420\u0430\u0437\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (dangerUnlocked.value) {
        _push(ssrRenderComponent(_component_AdminButton, {
          onClick: ($event) => {
            dangerUnlocked.value = false;
            cancelEdit();
          }
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u{1F512} \u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0431\u0440\u0430\u0442\u043D\u043E `);
            } else {
              return [
                createTextVNode(" \u{1F512} \u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043E\u0431\u0440\u0430\u0442\u043D\u043E ")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></div>`);
      _push(ssrRenderComponent(_component_AdminCard, null, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-col md:flex-row gap-4 md:items-end"${_scopeId}><div class="w-full md:w-72"${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u0422\u0430\u0431\u043B\u0438\u0446\u0430</label>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: table.value,
              "onUpdate:modelValue": ($event) => table.value = $event,
              options: tables.value.map((t) => ({ value: t, label: t }))
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="w-full md:w-40"${_scopeId}><label class="block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide"${_scopeId}>\u041B\u0438\u043C\u0438\u0442</label>`);
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: limit.value,
              "onUpdate:modelValue": ($event) => limit.value = $event,
              options: [
                { value: 25, label: "25 \u0441\u0442\u0440\u043E\u043A" },
                { value: 50, label: "50 \u0441\u0442\u0440\u043E\u043A" },
                { value: 100, label: "100 \u0441\u0442\u0440\u043E\u043A" },
                { value: 200, label: "200 \u0441\u0442\u0440\u043E\u043A" }
              ]
            }, null, _parent2, _scopeId));
            _push2(`</div><div class="ml-auto flex items-center gap-2"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminButton, {
              size: "sm",
              disabled: currentPage.value <= 1,
              onClick: prevPage
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u2190 \u041D\u0430\u0437\u0430\u0434`);
                } else {
                  return [
                    createTextVNode("\u2190 \u041D\u0430\u0437\u0430\u0434")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="text-sm text-slate-600 font-medium tabular-nums"${_scopeId}>${ssrInterpolate(currentPage.value)} / ${ssrInterpolate(totalPages.value)}</div>`);
            _push2(ssrRenderComponent(_component_AdminButton, {
              size: "sm",
              disabled: currentPage.value >= totalPages.value,
              onClick: nextPage
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`\u0412\u043F\u0435\u0440\u0451\u0434 \u2192`);
                } else {
                  return [
                    createTextVNode("\u0412\u043F\u0435\u0440\u0451\u0434 \u2192")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col md:flex-row gap-4 md:items-end" }, [
                createVNode("div", { class: "w-full md:w-72" }, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u0422\u0430\u0431\u043B\u0438\u0446\u0430"),
                  createVNode(_component_AdminSelect, {
                    modelValue: table.value,
                    "onUpdate:modelValue": ($event) => table.value = $event,
                    options: tables.value.map((t) => ({ value: t, label: t }))
                  }, null, 8, ["modelValue", "onUpdate:modelValue", "options"])
                ]),
                createVNode("div", { class: "w-full md:w-40" }, [
                  createVNode("label", { class: "block text-xs text-slate-500 mb-1.5 font-medium uppercase tracking-wide" }, "\u041B\u0438\u043C\u0438\u0442"),
                  createVNode(_component_AdminSelect, {
                    modelValue: limit.value,
                    "onUpdate:modelValue": ($event) => limit.value = $event,
                    options: [
                      { value: 25, label: "25 \u0441\u0442\u0440\u043E\u043A" },
                      { value: 50, label: "50 \u0441\u0442\u0440\u043E\u043A" },
                      { value: 100, label: "100 \u0441\u0442\u0440\u043E\u043A" },
                      { value: 200, label: "200 \u0441\u0442\u0440\u043E\u043A" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                ]),
                createVNode("div", { class: "ml-auto flex items-center gap-2" }, [
                  createVNode(_component_AdminButton, {
                    size: "sm",
                    disabled: currentPage.value <= 1,
                    onClick: prevPage
                  }, {
                    default: withCtx(() => [
                      createTextVNode("\u2190 \u041D\u0430\u0437\u0430\u0434")
                    ]),
                    _: 1
                  }, 8, ["disabled"]),
                  createVNode("div", { class: "text-sm text-slate-600 font-medium tabular-nums" }, toDisplayString(currentPage.value) + " / " + toDisplayString(totalPages.value), 1),
                  createVNode(_component_AdminButton, {
                    size: "sm",
                    disabled: currentPage.value >= totalPages.value,
                    onClick: nextPage
                  }, {
                    default: withCtx(() => [
                      createTextVNode("\u0412\u043F\u0435\u0440\u0451\u0434 \u2192")
                    ]),
                    _: 1
                  }, 8, ["disabled"])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      if (error.value) {
        _push(`<div class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center gap-2"><span>\u274C</span> ${ssrInterpolate(error.value)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (loading.value) {
        _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026</span></div></div>`);
      } else {
        _push(ssrRenderComponent(_component_AdminCard, { padding: false }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="overflow-auto"${_scopeId}><table class="min-w-full text-xs"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="px-4 py-3 text-left whitespace-nowrap font-semibold"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th><!--[-->`);
              ssrRenderList(columns.value, (c) => {
                _push2(`<th class="px-4 py-3 text-left whitespace-nowrap font-semibold"${_scopeId}>${ssrInterpolate(c)}</th>`);
              });
              _push2(`<!--]--></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(rows.value, (r) => {
                _push2(`<tr class="border-t border-slate-100 align-top hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-4 py-3 whitespace-nowrap"${_scopeId}>`);
                if (editRowId.value === r.id) {
                  _push2(`<!--[-->`);
                  _push2(ssrRenderComponent(_component_AdminButton, {
                    size: "sm",
                    onClick: cancelEdit
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` \u041E\u0442\u043C\u0435\u043D\u0430 `);
                      } else {
                        return [
                          createTextVNode(" \u041E\u0442\u043C\u0435\u043D\u0430 ")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  _push2(ssrRenderComponent(_component_AdminButton, {
                    size: "sm",
                    class: ["ml-2", dangerUnlocked.value ? "" : "opacity-50"],
                    variant: "danger",
                    disabled: !dangerUnlocked.value,
                    onClick: saveEdit
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` \u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C `);
                      } else {
                        return [
                          createTextVNode(" \u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C ")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                  _push2(`<!--]-->`);
                } else {
                  _push2(ssrRenderComponent(_component_AdminButton, {
                    size: "sm",
                    disabled: !dangerUnlocked.value,
                    class: dangerUnlocked.value ? "" : "opacity-50 cursor-not-allowed",
                    onClick: ($event) => startEdit(r)
                  }, {
                    default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                      if (_push3) {
                        _push3(` \u270F\uFE0F \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C `);
                      } else {
                        return [
                          createTextVNode(" \u270F\uFE0F \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C ")
                        ];
                      }
                    }),
                    _: 2
                  }, _parent2, _scopeId));
                }
                _push2(`</td><!--[-->`);
                ssrRenderList(columns.value, (c) => {
                  _push2(`<td class="px-4 py-3 whitespace-nowrap"${_scopeId}>`);
                  if (editRowId.value === r.id && dangerUnlocked.value) {
                    _push2(`<input${ssrRenderAttr("value", editDraft.value[c])} class="w-full min-w-[140px] rounded-lg border border-slate-200 px-2 py-1 text-sm shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"${_scopeId}>`);
                  } else {
                    _push2(`<span class="text-slate-800"${_scopeId}>${ssrInterpolate(r[c])}</span>`);
                  }
                  _push2(`</td>`);
                });
                _push2(`<!--]--></tr>`);
              });
              _push2(`<!--]-->`);
              if (rows.value.length === 0) {
                _push2(`<tr${_scopeId}><td${ssrRenderAttr("colspan", columns.value.length + 1)} class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F5C4}\uFE0F</div><div${_scopeId}>\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043F\u0443\u0441\u0442\u0430</div></td></tr>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</tbody></table></div>`);
              if (editRowId.value && dangerUnlocked.value) {
                _push2(`<div class="p-5 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-transparent"${_scopeId}><div class="flex flex-col lg:flex-row gap-6 lg:items-end"${_scopeId}><div${_scopeId}><div class="text-xs text-slate-600"${_scopeId}> \u0427\u0442\u043E\u0431\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F, \u0432\u0432\u0435\u0434\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435: <b class="text-red-600"${_scopeId}>YES_I_AM_SURE</b></div><input${ssrRenderAttr("value", saveConfirm.value)} class="mt-2 w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all" placeholder="YES_I_AM_SURE"${_scopeId}></div><div${_scopeId}><div class="text-xs text-slate-600"${_scopeId}> \u0427\u0442\u043E\u0431\u044B \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443, \u0432\u0432\u0435\u0434\u0438: <b class="text-red-600"${_scopeId}>YES_DELETE</b></div><div class="mt-2 flex flex-col sm:flex-row gap-2 sm:items-center"${_scopeId}><input${ssrRenderAttr("value", deleteConfirm.value)} class="w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all" placeholder="YES_DELETE"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminButton, {
                  variant: "danger",
                  onClick: deleteRow
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u{1F5D1}\uFE0F \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443 `);
                    } else {
                      return [
                        createTextVNode(" \u{1F5D1}\uFE0F \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443 ")
                      ];
                    }
                  }),
                  _: 1
                }, _parent2, _scopeId));
                _push2(`</div></div></div></div>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("div", { class: "overflow-auto" }, [
                  createVNode("table", { class: "min-w-full text-xs" }, [
                    createVNode("thead", { class: "bg-slate-50 text-xs text-slate-600 uppercase tracking-wide" }, [
                      createVNode("tr", null, [
                        createVNode("th", { class: "px-4 py-3 text-left whitespace-nowrap font-semibold" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F"),
                        (openBlock(true), createBlock(Fragment, null, renderList(columns.value, (c) => {
                          return openBlock(), createBlock("th", {
                            key: c,
                            class: "px-4 py-3 text-left whitespace-nowrap font-semibold"
                          }, toDisplayString(c), 1);
                        }), 128))
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(rows.value, (r) => {
                        return openBlock(), createBlock("tr", {
                          key: r.id,
                          class: "border-t border-slate-100 align-top hover:bg-slate-50/70 transition-colors"
                        }, [
                          createVNode("td", { class: "px-4 py-3 whitespace-nowrap" }, [
                            editRowId.value === r.id ? (openBlock(), createBlock(Fragment, { key: 0 }, [
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                onClick: cancelEdit
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u041E\u0442\u043C\u0435\u043D\u0430 ")
                                ]),
                                _: 1
                              }),
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                class: ["ml-2", dangerUnlocked.value ? "" : "opacity-50"],
                                variant: "danger",
                                disabled: !dangerUnlocked.value,
                                onClick: saveEdit
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C ")
                                ]),
                                _: 1
                              }, 8, ["class", "disabled"])
                            ], 64)) : (openBlock(), createBlock(_component_AdminButton, {
                              key: 1,
                              size: "sm",
                              disabled: !dangerUnlocked.value,
                              class: dangerUnlocked.value ? "" : "opacity-50 cursor-not-allowed",
                              onClick: ($event) => startEdit(r)
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" \u270F\uFE0F \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C ")
                              ]),
                              _: 1
                            }, 8, ["disabled", "class", "onClick"]))
                          ]),
                          (openBlock(true), createBlock(Fragment, null, renderList(columns.value, (c) => {
                            return openBlock(), createBlock("td", {
                              key: c,
                              class: "px-4 py-3 whitespace-nowrap"
                            }, [
                              editRowId.value === r.id && dangerUnlocked.value ? withDirectives((openBlock(), createBlock("input", {
                                key: 0,
                                "onUpdate:modelValue": ($event) => editDraft.value[c] = $event,
                                class: "w-full min-w-[140px] rounded-lg border border-slate-200 px-2 py-1 text-sm shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all"
                              }, null, 8, ["onUpdate:modelValue"])), [
                                [vModelText, editDraft.value[c]]
                              ]) : (openBlock(), createBlock("span", {
                                key: 1,
                                class: "text-slate-800"
                              }, toDisplayString(r[c]), 1))
                            ]);
                          }), 128))
                        ]);
                      }), 128)),
                      rows.value.length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: columns.value.length + 1,
                          class: "px-5 py-12 text-center text-slate-500"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F5C4}\uFE0F"),
                          createVNode("div", null, "\u0422\u0430\u0431\u043B\u0438\u0446\u0430 \u043F\u0443\u0441\u0442\u0430")
                        ], 8, ["colspan"])
                      ])) : createCommentVNode("", true)
                    ])
                  ])
                ]),
                editRowId.value && dangerUnlocked.value ? (openBlock(), createBlock("div", {
                  key: 0,
                  class: "p-5 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-transparent"
                }, [
                  createVNode("div", { class: "flex flex-col lg:flex-row gap-6 lg:items-end" }, [
                    createVNode("div", null, [
                      createVNode("div", { class: "text-xs text-slate-600" }, [
                        createTextVNode(" \u0427\u0442\u043E\u0431\u044B \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F, \u0432\u0432\u0435\u0434\u0438 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435: "),
                        createVNode("b", { class: "text-red-600" }, "YES_I_AM_SURE")
                      ]),
                      withDirectives(createVNode("input", {
                        "onUpdate:modelValue": ($event) => saveConfirm.value = $event,
                        class: "mt-2 w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all",
                        placeholder: "YES_I_AM_SURE"
                      }, null, 8, ["onUpdate:modelValue"]), [
                        [vModelText, saveConfirm.value]
                      ])
                    ]),
                    createVNode("div", null, [
                      createVNode("div", { class: "text-xs text-slate-600" }, [
                        createTextVNode(" \u0427\u0442\u043E\u0431\u044B \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443, \u0432\u0432\u0435\u0434\u0438: "),
                        createVNode("b", { class: "text-red-600" }, "YES_DELETE")
                      ]),
                      createVNode("div", { class: "mt-2 flex flex-col sm:flex-row gap-2 sm:items-center" }, [
                        withDirectives(createVNode("input", {
                          "onUpdate:modelValue": ($event) => deleteConfirm.value = $event,
                          class: "w-full sm:w-64 rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-400 transition-all",
                          placeholder: "YES_DELETE"
                        }, null, 8, ["onUpdate:modelValue"]), [
                          [vModelText, deleteConfirm.value]
                        ]),
                        createVNode(_component_AdminButton, {
                          variant: "danger",
                          onClick: deleteRow
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" \u{1F5D1}\uFE0F \u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0441\u0442\u0440\u043E\u043A\u0443 ")
                          ]),
                          _: 1
                        })
                      ])
                    ])
                  ])
                ])) : createCommentVNode("", true)
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/db.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=db-Cm1fr-Qi.mjs.map
