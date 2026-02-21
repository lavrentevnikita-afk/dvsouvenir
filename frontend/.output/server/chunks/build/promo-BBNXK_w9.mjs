import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminStatusBadge-BRoIy5Uv.mjs';
import { _ as _sfc_main$5 } from './AdminInput-CTfEX194.mjs';
import { _ as _sfc_main$6 } from './AdminSelect-4bn3Tbjh.mjs';
import { defineComponent, ref, reactive, computed, mergeProps, withCtx, createTextVNode, createVNode, unref, toDisplayString, createBlock, createCommentVNode, openBlock, Fragment, renderList, useSSRContext } from 'vue';
import { u as useRuntimeConfig } from './server.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderList, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain } from 'vue/server-renderer';
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
  __name: "promo",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    const loading = ref(false);
    const error = ref(null);
    const banners = ref([]);
    const editOpen = ref(false);
    const editing = ref(null);
    const form = reactive({
      title: "",
      type: "banner",
      text: "",
      imageUrl: "",
      linkUrl: "",
      sortOrder: 0,
      isActive: true,
      startAt: "",
      endAt: ""
    });
    function toInputDate(v) {
      if (!v) return "";
      const d = new Date(v);
      if (isNaN(d.getTime())) return "";
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    async function load() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/content/promo-banners", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        banners.value = Array.isArray(res == null ? void 0 : res.banners) ? res.banners : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043F\u0440\u043E\u043C\u043E";
      } finally {
        loading.value = false;
      }
    }
    function openCreate() {
      editing.value = null;
      Object.assign(form, { title: "", type: "banner", text: "", imageUrl: "", linkUrl: "", sortOrder: 0, isActive: true, startAt: "", endAt: "" });
      editOpen.value = true;
    }
    function openEdit(b) {
      editing.value = b;
      Object.assign(form, {
        title: b.title || "",
        type: b.type || "banner",
        text: b.text || "",
        imageUrl: b.imageUrl || "",
        linkUrl: b.linkUrl || "",
        sortOrder: b.sortOrder || 0,
        isActive: !!b.isActive,
        startAt: toInputDate(b.startAt),
        endAt: toInputDate(b.endAt)
      });
      editOpen.value = true;
    }
    async function save() {
      var _a;
      if (!auth.accessToken) return;
      try {
        const body = {
          title: form.title,
          type: form.type,
          text: form.text || null,
          imageUrl: form.imageUrl,
          linkUrl: form.linkUrl,
          sortOrder: Number(form.sortOrder || 0),
          isActive: !!form.isActive,
          startAt: form.startAt ? new Date(form.startAt).toISOString() : null,
          endAt: form.endAt ? new Date(form.endAt).toISOString() : null
        };
        if (!editing.value) {
          await $fetch("/api/admin/content/promo-banners", {
            method: "POST",
            baseURL: apiBaseUrl,
            headers: { Authorization: `Bearer ${auth.accessToken}` },
            body
          });
        } else {
          await $fetch(`/api/admin/content/promo-banners/${editing.value.id}`, {
            method: "PATCH",
            baseURL: apiBaseUrl,
            headers: { Authorization: `Bearer ${auth.accessToken}` },
            body
          });
        }
        editOpen.value = false;
        await load();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C";
      }
    }
    async function toggle(b) {
      var _a;
      if (!auth.accessToken) return;
      try {
        await $fetch(`/api/admin/content/promo-banners/${b.id}`, {
          method: "PATCH",
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          body: { isActive: !b.isActive }
        });
        await load();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u044C";
      }
    }
    async function remove(b) {
      var _a;
      if (!auth.accessToken) return;
      if (!confirm("\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043F\u0440\u043E\u043C\u043E?")) return;
      try {
        await $fetch(`/api/admin/content/promo-banners/${b.id}`, {
          method: "DELETE",
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` }
        });
        await load();
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0443\u0434\u0430\u043B\u0438\u0442\u044C";
      }
    }
    const now = computed(() => /* @__PURE__ */ new Date());
    function isActiveNow(b) {
      if (!b.isActive) return false;
      const n = now.value.getTime();
      const s = b.startAt ? new Date(b.startAt).getTime() : null;
      const e = b.endAt ? new Date(b.endAt).getTime() : null;
      if (s && n < s) return false;
      if (e && n > e) return false;
      return true;
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminStatusBadge = _sfc_main$4;
      const _component_AdminInput = _sfc_main$5;
      const _component_AdminSelect = _sfc_main$6;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u041F\u0440\u043E\u043C\u043E",
        description: "\u0411\u0430\u043D\u043D\u0435\u0440\u044B \u0438 \u043F\u043B\u0430\u0448\u043A\u0438 \u043F\u043E \u0434\u0430\u0442\u0430\u043C",
        icon: "\u2728"
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
            _push2(ssrRenderComponent(_component_AdminButton, {
              variant: "primary",
              onClick: openCreate
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C `);
                } else {
                  return [
                    createTextVNode(" \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C ")
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
              }),
              createVNode(_component_AdminButton, {
                variant: "primary",
                onClick: openCreate
              }, {
                default: withCtx(() => [
                  createTextVNode(" \u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C ")
                ]),
                _: 1
              })
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
              _push2(`<div class="overflow-x-auto"${_scopeId}><table class="w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0422\u0438\u043F</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u041F\u0435\u0440\u0438\u043E\u0434</th><th class="text-center px-5 py-3.5 font-semibold"${_scopeId}>\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(banners), (b) => {
                _push2(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-5 py-4"${_scopeId}><div class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(b.title)}</div>`);
                if (b.type === "badge" && b.text) {
                  _push2(`<div class="text-xs text-slate-500 mt-1 line-clamp-2"${_scopeId}>${ssrInterpolate(b.text)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (b.type === "banner") {
                  _push2(`<div class="text-xs text-slate-500 mt-1 truncate max-w-[200px]"${_scopeId}>${ssrInterpolate(b.imageUrl)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td class="px-5 py-4"${_scopeId}><span class="${ssrRenderClass([b.type === "banner" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200", "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border"])}"${_scopeId}>${ssrInterpolate(b.type === "banner" ? "\u{1F5BC}\uFE0F \u0411\u0430\u043D\u043D\u0435\u0440" : "\u{1F3F7}\uFE0F \u041F\u043B\u0430\u0448\u043A\u0430")}</span></td><td class="px-5 py-4"${_scopeId}><div class="text-xs text-slate-700"${_scopeId}>\u{1F4C5} ${ssrInterpolate(b.startAt ? new Date(b.startAt).toLocaleString() : "\u2014")}</div><div class="text-xs text-slate-500"${_scopeId}>\u2192 ${ssrInterpolate(b.endAt ? new Date(b.endAt).toLocaleString() : "\u221E")}</div></td><td class="px-5 py-4 text-center"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminStatusBadge, {
                  status: isActiveNow(b) ? "active" : "inactive",
                  map: { active: { label: "\u2705 \u0410\u043A\u0442\u0438\u0432\u0435\u043D", color: "green" }, inactive: { label: "\u041D\u0435\u0430\u043A\u0442\u0438\u0432\u0435\u043D", color: "slate" } }
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="px-5 py-4 text-right font-medium text-slate-700"${_scopeId}>${ssrInterpolate(b.sortOrder)}</td><td class="px-5 py-4 text-right"${_scopeId}><div class="flex items-center justify-end gap-2"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  onClick: ($event) => toggle(b)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(`${ssrInterpolate(b.isActive ? "\u23F8\uFE0F" : "\u25B6\uFE0F")}`);
                    } else {
                      return [
                        createTextVNode(toDisplayString(b.isActive ? "\u23F8\uFE0F" : "\u25B6\uFE0F"), 1)
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  onClick: ($event) => openEdit(b)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u270F\uFE0F `);
                    } else {
                      return [
                        createTextVNode(" \u270F\uFE0F ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(ssrRenderComponent(_component_AdminButton, {
                  size: "sm",
                  variant: "danger",
                  onClick: ($event) => remove(b)
                }, {
                  default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                    if (_push3) {
                      _push3(` \u{1F5D1}\uFE0F `);
                    } else {
                      return [
                        createTextVNode(" \u{1F5D1}\uFE0F ")
                      ];
                    }
                  }),
                  _: 2
                }, _parent2, _scopeId));
                _push2(`</div></td></tr>`);
              });
              _push2(`<!--]-->`);
              if (unref(banners).length === 0) {
                _push2(`<tr${_scopeId}><td colspan="6" class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u2728</div><div${_scopeId}>\u041F\u0440\u043E\u043C\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</div></td></tr>`);
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
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0422\u0438\u043F"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u041F\u0435\u0440\u0438\u043E\u0434"),
                        createVNode("th", { class: "text-center px-5 py-3.5 font-semibold" }, "\u0421\u0442\u0430\u0442\u0443\u0441"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(banners), (b) => {
                        return openBlock(), createBlock("tr", {
                          key: b.id,
                          class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                        }, [
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-semibold text-slate-900" }, toDisplayString(b.title), 1),
                            b.type === "badge" && b.text ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-xs text-slate-500 mt-1 line-clamp-2"
                            }, toDisplayString(b.text), 1)) : createCommentVNode("", true),
                            b.type === "banner" ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: "text-xs text-slate-500 mt-1 truncate max-w-[200px]"
                            }, toDisplayString(b.imageUrl), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("span", {
                              class: ["inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border", b.type === "banner" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"]
                            }, toDisplayString(b.type === "banner" ? "\u{1F5BC}\uFE0F \u0411\u0430\u043D\u043D\u0435\u0440" : "\u{1F3F7}\uFE0F \u041F\u043B\u0430\u0448\u043A\u0430"), 3)
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "text-xs text-slate-700" }, "\u{1F4C5} " + toDisplayString(b.startAt ? new Date(b.startAt).toLocaleString() : "\u2014"), 1),
                            createVNode("div", { class: "text-xs text-slate-500" }, "\u2192 " + toDisplayString(b.endAt ? new Date(b.endAt).toLocaleString() : "\u221E"), 1)
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-center" }, [
                            createVNode(_component_AdminStatusBadge, {
                              status: isActiveNow(b) ? "active" : "inactive",
                              map: { active: { label: "\u2705 \u0410\u043A\u0442\u0438\u0432\u0435\u043D", color: "green" }, inactive: { label: "\u041D\u0435\u0430\u043A\u0442\u0438\u0432\u0435\u043D", color: "slate" } }
                            }, null, 8, ["status"])
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-right font-medium text-slate-700" }, toDisplayString(b.sortOrder), 1),
                          createVNode("td", { class: "px-5 py-4 text-right" }, [
                            createVNode("div", { class: "flex items-center justify-end gap-2" }, [
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                onClick: ($event) => toggle(b)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(b.isActive ? "\u23F8\uFE0F" : "\u25B6\uFE0F"), 1)
                                ]),
                                _: 2
                              }, 1032, ["onClick"]),
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                onClick: ($event) => openEdit(b)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u270F\uFE0F ")
                                ]),
                                _: 1
                              }, 8, ["onClick"]),
                              createVNode(_component_AdminButton, {
                                size: "sm",
                                variant: "danger",
                                onClick: ($event) => remove(b)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode(" \u{1F5D1}\uFE0F ")
                                ]),
                                _: 1
                              }, 8, ["onClick"])
                            ])
                          ])
                        ]);
                      }), 128)),
                      unref(banners).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "6",
                          class: "px-5 py-12 text-center text-slate-500"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u2728"),
                          createVNode("div", null, "\u041F\u0440\u043E\u043C\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B")
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
      if (unref(editOpen)) {
        _push(`<div class="fixed inset-0 z-[2000] bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"><div class="w-full max-w-xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"><div class="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-transparent flex items-center justify-between"><div class="font-bold text-slate-800">${ssrInterpolate(unref(editing) ? "\u270F\uFE0F \u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u043C\u043E" : "\u2795 \u041D\u043E\u0432\u043E\u0435 \u043F\u0440\u043E\u043C\u043E")}</div><button class="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors">\u2715</button></div><div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="sm:col-span-2"><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A</label>`);
        _push(ssrRenderComponent(_component_AdminInput, {
          modelValue: unref(form).title,
          "onUpdate:modelValue": ($event) => unref(form).title = $event,
          placeholder: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u043C\u043E"
        }, null, _parent));
        _push(`</div><div><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">\u0422\u0438\u043F</label>`);
        _push(ssrRenderComponent(_component_AdminSelect, {
          modelValue: unref(form).type,
          "onUpdate:modelValue": ($event) => unref(form).type = $event,
          options: [
            { value: "banner", label: "\u0411\u0430\u043D\u043D\u0435\u0440", icon: "\u{1F5BC}\uFE0F" },
            { value: "badge", label: "\u041F\u043B\u0430\u0448\u043A\u0430", icon: "\u{1F3F7}\uFE0F" }
          ]
        }, null, _parent));
        _push(`</div><div><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">\u041F\u0440\u0438\u043E\u0440\u0438\u0442\u0435\u0442</label>`);
        _push(ssrRenderComponent(_component_AdminInput, {
          type: "number",
          modelValue: unref(form).sortOrder,
          "onUpdate:modelValue": ($event) => unref(form).sortOrder = $event,
          modelModifiers: { number: true }
        }, null, _parent));
        _push(`</div>`);
        if (unref(form).type === "badge") {
          _push(`<div class="sm:col-span-2"><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">\u0422\u0435\u043A\u0441\u0442 (\u043F\u043B\u0430\u0448\u043A\u0430)</label><textarea rows="3" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm shadow-sm focus:ring-2 focus:ring-slate-200 focus:border-slate-400 transition-all">${ssrInterpolate(unref(form).text)}</textarea></div>`);
        } else {
          _push(`<div class="sm:col-span-2"><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">Image URL</label>`);
          _push(ssrRenderComponent(_component_AdminInput, {
            modelValue: unref(form).imageUrl,
            "onUpdate:modelValue": ($event) => unref(form).imageUrl = $event,
            placeholder: "/uploads/..."
          }, null, _parent));
          _push(`</div>`);
        }
        _push(`<div class="sm:col-span-2"><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">\u0421\u0441\u044B\u043B\u043A\u0430</label>`);
        _push(ssrRenderComponent(_component_AdminInput, {
          modelValue: unref(form).linkUrl,
          "onUpdate:modelValue": ($event) => unref(form).linkUrl = $event,
          placeholder: "https://..."
        }, null, _parent));
        _push(`</div><div><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">\u041D\u0430\u0447\u0430\u043B\u043E</label>`);
        _push(ssrRenderComponent(_component_AdminInput, {
          type: "datetime-local",
          modelValue: unref(form).startAt,
          "onUpdate:modelValue": ($event) => unref(form).startAt = $event
        }, null, _parent));
        _push(`</div><div><label class="block text-xs text-slate-500 mb-1 font-medium uppercase tracking-wide">\u041E\u043A\u043E\u043D\u0447\u0430\u043D\u0438\u0435</label>`);
        _push(ssrRenderComponent(_component_AdminInput, {
          type: "datetime-local",
          modelValue: unref(form).endAt,
          "onUpdate:modelValue": ($event) => unref(form).endAt = $event
        }, null, _parent));
        _push(`</div><div class="sm:col-span-2"><label class="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm cursor-pointer hover:bg-slate-50 transition-colors"><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(form).isActive) ? ssrLooseContain(unref(form).isActive, null) : unref(form).isActive) ? " checked" : ""} class="rounded border-slate-300 text-slate-900 focus:ring-slate-500"><span class="text-sm font-medium text-slate-700">\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043F\u0440\u043E\u043C\u043E</span></label></div></div><div class="p-5 border-t border-slate-100 flex items-center justify-end gap-3">`);
        _push(ssrRenderComponent(_component_AdminButton, {
          onClick: ($event) => editOpen.value = false
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u041E\u0442\u043C\u0435\u043D\u0430`);
            } else {
              return [
                createTextVNode("\u041E\u0442\u043C\u0435\u043D\u0430")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_AdminButton, {
          variant: "primary",
          onClick: save
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C`);
            } else {
              return [
                createTextVNode("\u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/promo.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=promo-BBNXK_w9.mjs.map
