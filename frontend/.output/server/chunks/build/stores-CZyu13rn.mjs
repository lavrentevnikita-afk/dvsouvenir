import { _ as _sfc_main$1, a as _sfc_main$3 } from './AdminCard-BugrRmHM.mjs';
import { _ as _sfc_main$2 } from './AdminButton-CPhKfHoR.mjs';
import { _ as _sfc_main$4 } from './AdminInput-CTfEX194.mjs';
import { _ as _sfc_main$5 } from './AdminSelect-4bn3Tbjh.mjs';
import { _ as _sfc_main$6 } from './AdminStatusBadge-BRoIy5Uv.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, watch, mergeProps, withCtx, createTextVNode, createVNode, unref, isRef, withKeys, createBlock, createCommentVNode, openBlock, Fragment, renderList, toDisplayString, useSSRContext } from 'vue';
import { u as useRuntimeConfig, c as useRouter } from './server.mjs';
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
  __name: "stores",
  __ssrInlineRender: true,
  setup(__props) {
    const auth = useAuthStore();
    auth.initFromStorage();
    const config = useRuntimeConfig();
    const apiBaseUrl = config.apiBaseUrl;
    useRouter();
    const status = ref("");
    const city = ref("");
    const q = ref("");
    const loading = ref(false);
    const error = ref(null);
    const shops = ref([]);
    function buildQuery() {
      const out = {};
      if (status.value) out.status = status.value;
      if (city.value.trim()) out.city = city.value.trim();
      if (q.value.trim()) out.q = q.value.trim();
      return out;
    }
    async function load() {
      var _a;
      if (!auth.accessToken) return;
      loading.value = true;
      error.value = null;
      try {
        const res = await $fetch("/api/admin/shops", {
          baseURL: apiBaseUrl,
          headers: { Authorization: `Bearer ${auth.accessToken}` },
          query: buildQuery()
        });
        shops.value = Array.isArray(res == null ? void 0 : res.shops) ? res.shops : [];
      } catch (e) {
        error.value = ((_a = e == null ? void 0 : e.data) == null ? void 0 : _a.message) || "\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u044B";
      } finally {
        loading.value = false;
      }
    }
    watch([status, city], load);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AdminPageHeader = _sfc_main$1;
      const _component_AdminButton = _sfc_main$2;
      const _component_AdminCard = _sfc_main$3;
      const _component_AdminInput = _sfc_main$4;
      const _component_AdminSelect = _sfc_main$5;
      const _component_AdminStatusBadge = _sfc_main$6;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "space-y-6" }, _attrs))}>`);
      _push(ssrRenderComponent(_component_AdminPageHeader, {
        title: "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B",
        description: "\u0415\u0434\u0438\u043D\u0430\u044F CRM: \u0437\u0430\u044F\u0432\u043A\u0438, \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0438 \u0437\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435",
        icon: "\u{1F3EA}"
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
            _push2(`<div class="flex flex-col lg:flex-row lg:items-end gap-4"${_scopeId}><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1"${_scopeId}>`);
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(q),
              "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
              placeholder: "\u041F\u043E\u0438\u0441\u043A: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435, email, \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u2026",
              icon: "search",
              onKeydown: load
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminSelect, {
              modelValue: unref(status),
              "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null,
              placeholder: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B",
              options: [
                { value: "lead", label: "\u0417\u0430\u044F\u0432\u043A\u0438" },
                { value: "active", label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435" },
                { value: "blocked", label: "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435" }
              ]
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminInput, {
              modelValue: unref(city),
              "onUpdate:modelValue": ($event) => isRef(city) ? city.value = $event : null,
              placeholder: "\u0413\u043E\u0440\u043E\u0434"
            }, null, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_AdminButton, {
              variant: "primary",
              onClick: load
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(` \u041D\u0430\u0439\u0442\u0438 `);
                } else {
                  return [
                    createTextVNode(" \u041D\u0430\u0439\u0442\u0438 ")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`</div></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-col lg:flex-row lg:items-end gap-4" }, [
                createVNode("div", { class: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1" }, [
                  createVNode(_component_AdminInput, {
                    modelValue: unref(q),
                    "onUpdate:modelValue": ($event) => isRef(q) ? q.value = $event : null,
                    placeholder: "\u041F\u043E\u0438\u0441\u043A: \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435, email, \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u2026",
                    icon: "search",
                    onKeydown: withKeys(load, ["enter"])
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminSelect, {
                    modelValue: unref(status),
                    "onUpdate:modelValue": ($event) => isRef(status) ? status.value = $event : null,
                    placeholder: "\u0412\u0441\u0435 \u0441\u0442\u0430\u0442\u0443\u0441\u044B",
                    options: [
                      { value: "lead", label: "\u0417\u0430\u044F\u0432\u043A\u0438" },
                      { value: "active", label: "\u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435" },
                      { value: "blocked", label: "\u0417\u0430\u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435" }
                    ]
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminInput, {
                    modelValue: unref(city),
                    "onUpdate:modelValue": ($event) => isRef(city) ? city.value = $event : null,
                    placeholder: "\u0413\u043E\u0440\u043E\u0434"
                  }, null, 8, ["modelValue", "onUpdate:modelValue"]),
                  createVNode(_component_AdminButton, {
                    variant: "primary",
                    onClick: load
                  }, {
                    default: withCtx(() => [
                      createTextVNode(" \u041D\u0430\u0439\u0442\u0438 ")
                    ]),
                    _: 1
                  })
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
        _push(`<div class="flex items-center justify-center py-12"><div class="flex items-center gap-3 text-slate-500"><svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg><span>\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u043E\u0432\u2026</span></div></div>`);
      } else {
        _push(ssrRenderComponent(_component_AdminCard, { padding: false }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="overflow-x-auto"${_scopeId}><table class="w-full text-sm"${_scopeId}><thead class="bg-slate-50 text-xs text-slate-600 uppercase tracking-wide"${_scopeId}><tr${_scopeId}><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u041C\u0430\u0433\u0430\u0437\u0438\u043D</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0413\u043E\u0440\u043E\u0434</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0421\u0442\u0430\u0442\u0443\u0441</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u0421\u043A\u0438\u0434\u043A\u0430</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u041A\u043E\u043D\u0442\u0430\u043A\u0442</th><th class="text-left px-5 py-3.5 font-semibold"${_scopeId}>\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0437\u0430\u043A\u0430\u0437</th><th class="text-right px-5 py-3.5 font-semibold"${_scopeId}>\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F</th></tr></thead><tbody${_scopeId}><!--[-->`);
              ssrRenderList(unref(shops), (s) => {
                var _a2;
                var _a, _b;
                _push2(`<tr class="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"${_scopeId}><td class="px-5 py-4"${_scopeId}><div class="font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(s.displayName || s.companyName)}</div>`);
                if (s.address) {
                  _push2(`<div class="text-xs text-slate-500 mt-0.5"${_scopeId}>${ssrInterpolate(s.address)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                if (s.notes) {
                  _push2(`<div class="text-xs text-slate-500 flex items-center gap-1 mt-0.5"${_scopeId}><span${_scopeId}>\u{1F4DD}</span> ${ssrInterpolate(s.notes)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td class="px-5 py-4"${_scopeId}><div class="text-slate-700"${_scopeId}>${ssrInterpolate(s.city || "\u2014")}</div></td><td class="px-5 py-4"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_AdminStatusBadge, {
                  status: s.status
                }, null, _parent2, _scopeId));
                _push2(`</td><td class="px-5 py-4"${_scopeId}><div class="font-medium text-slate-900"${_scopeId}>${ssrInterpolate(Number((_a2 = s.discountPercent) != null ? _a2 : 0))}%</div></td><td class="px-5 py-4"${_scopeId}><div class="font-medium text-slate-800"${_scopeId}>${ssrInterpolate(((_a = s.user) == null ? void 0 : _a.name) || "\u2014")}</div><div class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate((_b = s.user) == null ? void 0 : _b.email)}</div>`);
                if (s.phone) {
                  _push2(`<div class="text-xs text-slate-500"${_scopeId}>${ssrInterpolate(s.phone)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td class="px-5 py-4"${_scopeId}>`);
                if (s.lastOrderAt) {
                  _push2(`<div class="text-slate-700"${_scopeId}>${ssrInterpolate(new Date(s.lastOrderAt).toLocaleDateString())}</div>`);
                } else {
                  _push2(`<div class="text-slate-400"${_scopeId}>\u2014</div>`);
                }
                if (s.ordersCount) {
                  _push2(`<div class="text-xs text-slate-500"${_scopeId}>\u0417\u0430\u043A\u0430\u0437\u043E\u0432: ${ssrInterpolate(s.ordersCount)}</div>`);
                } else {
                  _push2(`<!---->`);
                }
                _push2(`</td><td class="px-5 py-4 text-right"${_scopeId}>`);
                _push2(ssrRenderComponent(_component_NuxtLink, {
                  to: `/admin/stores/${s.id}`,
                  class: "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 px-3 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 shadow-sm"
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
                _push2(`</td></tr>`);
              });
              _push2(`<!--]-->`);
              if (unref(shops).length === 0) {
                _push2(`<tr${_scopeId}><td colspan="7" class="px-5 py-12 text-center text-slate-500"${_scopeId}><div class="text-4xl mb-2"${_scopeId}>\u{1F3EA}</div><div${_scopeId}>\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B</div></td></tr>`);
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
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u041C\u0430\u0433\u0430\u0437\u0438\u043D"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0413\u043E\u0440\u043E\u0434"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0421\u0442\u0430\u0442\u0443\u0441"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u0421\u043A\u0438\u0434\u043A\u0430"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u041A\u043E\u043D\u0442\u0430\u043A\u0442"),
                        createVNode("th", { class: "text-left px-5 py-3.5 font-semibold" }, "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0437\u0430\u043A\u0430\u0437"),
                        createVNode("th", { class: "text-right px-5 py-3.5 font-semibold" }, "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F")
                      ])
                    ]),
                    createVNode("tbody", null, [
                      (openBlock(true), createBlock(Fragment, null, renderList(unref(shops), (s) => {
                        var _a2;
                        var _a, _b;
                        return openBlock(), createBlock("tr", {
                          key: s.id,
                          class: "border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                        }, [
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-semibold text-slate-900" }, toDisplayString(s.displayName || s.companyName), 1),
                            s.address ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-xs text-slate-500 mt-0.5"
                            }, toDisplayString(s.address), 1)) : createCommentVNode("", true),
                            s.notes ? (openBlock(), createBlock("div", {
                              key: 1,
                              class: "text-xs text-slate-500 flex items-center gap-1 mt-0.5"
                            }, [
                              createVNode("span", null, "\u{1F4DD}"),
                              createTextVNode(" " + toDisplayString(s.notes), 1)
                            ])) : createCommentVNode("", true)
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "text-slate-700" }, toDisplayString(s.city || "\u2014"), 1)
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode(_component_AdminStatusBadge, {
                              status: s.status
                            }, null, 8, ["status"])
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-medium text-slate-900" }, toDisplayString(Number((_a2 = s.discountPercent) != null ? _a2 : 0)) + "%", 1)
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            createVNode("div", { class: "font-medium text-slate-800" }, toDisplayString(((_a = s.user) == null ? void 0 : _a.name) || "\u2014"), 1),
                            createVNode("div", { class: "text-xs text-slate-500" }, toDisplayString((_b = s.user) == null ? void 0 : _b.email), 1),
                            s.phone ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-xs text-slate-500"
                            }, toDisplayString(s.phone), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("td", { class: "px-5 py-4" }, [
                            s.lastOrderAt ? (openBlock(), createBlock("div", {
                              key: 0,
                              class: "text-slate-700"
                            }, toDisplayString(new Date(s.lastOrderAt).toLocaleDateString()), 1)) : (openBlock(), createBlock("div", {
                              key: 1,
                              class: "text-slate-400"
                            }, "\u2014")),
                            s.ordersCount ? (openBlock(), createBlock("div", {
                              key: 2,
                              class: "text-xs text-slate-500"
                            }, "\u0417\u0430\u043A\u0430\u0437\u043E\u0432: " + toDisplayString(s.ordersCount), 1)) : createCommentVNode("", true)
                          ]),
                          createVNode("td", { class: "px-5 py-4 text-right" }, [
                            createVNode(_component_NuxtLink, {
                              to: `/admin/stores/${s.id}`,
                              class: "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 px-3 py-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500 shadow-sm"
                            }, {
                              default: withCtx(() => [
                                createTextVNode(" \u041E\u0442\u043A\u0440\u044B\u0442\u044C ")
                              ]),
                              _: 1
                            }, 8, ["to"])
                          ])
                        ]);
                      }), 128)),
                      unref(shops).length === 0 ? (openBlock(), createBlock("tr", { key: 0 }, [
                        createVNode("td", {
                          colspan: "7",
                          class: "px-5 py-12 text-center text-slate-500"
                        }, [
                          createVNode("div", { class: "text-4xl mb-2" }, "\u{1F3EA}"),
                          createVNode("div", null, "\u041C\u0430\u0433\u0430\u0437\u0438\u043D\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B")
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/stores.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=stores-CZyu13rn.mjs.map
