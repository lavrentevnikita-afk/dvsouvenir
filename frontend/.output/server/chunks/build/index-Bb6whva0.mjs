import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, computed, ref, mergeProps, unref, withCtx, createTextVNode, createVNode, toDisplayString, createBlock, openBlock, useSSRContext } from 'vue';
import { u as useToast } from './useToast-BeE5NKHL.mjs';
import { u as useRecentlyViewed } from './useRecentlyViewed-C1sjIei9.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderAttr } from 'vue/server-renderer';
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
import './server.mjs';
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
    const authStore = useAuthStore();
    useToast();
    const user = computed(() => authStore.user);
    const roleLabel = computed(() => {
      var _a;
      const role = (_a = user.value) == null ? void 0 : _a.role;
      if (role === "store") return "\u041C\u0430\u0433\u0430\u0437\u0438\u043D";
      if (role === "manager") return "\u041C\u0435\u043D\u0435\u0434\u0436\u0435\u0440";
      if (role === "admin") return "\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440";
      return "\u0420\u043E\u0437\u043D\u0438\u0446\u0430";
    });
    const orders = ref([]);
    ref(false);
    const ordersInTransit = computed(() => {
      return orders.value.filter((o) => ["processing", "ready", "shipped", "in_work"].includes(o.status));
    });
    computed(() => {
      return orders.value.filter((o) => o.status === "delivered");
    });
    const { items: recentlyViewed } = useRecentlyViewed();
    ref({
      open: false,
      order: null,
      item: null,
      rating: 5,
      comment: "",
      loading: false
    });
    function pluralize(n, one, few, many) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod10 === 1 && mod100 !== 11) return one;
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
      return many;
    }
    function formatDate(d) {
      if (!d) return "\u2014";
      return new Date(d).toLocaleDateString("ru-RU");
    }
    function formatMoney(v) {
      return Number(v || 0).toLocaleString("ru-RU");
    }
    function statusLabel(s) {
      const map = {
        new: "\u041D\u043E\u0432\u044B\u0439",
        processing: "\u0412 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0435",
        in_work: "\u0412 \u0440\u0430\u0431\u043E\u0442\u0435",
        ready: "\u0413\u043E\u0442\u043E\u0432",
        shipped: "\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D",
        delivered: "\u0414\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D",
        cancelled: "\u041E\u0442\u043C\u0435\u043D\u0451\u043D"
      };
      return map[s] || s;
    }
    function statusClass(s) {
      if (s === "delivered") return "bg-green-100 text-green-800";
      if (s === "shipped") return "bg-blue-100 text-blue-800";
      if (s === "cancelled") return "bg-red-100 text-red-800";
      return "bg-slate-100 text-slate-700";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl mx-auto py-8 px-4" }, _attrs))}><h1 class="text-2xl font-bold mb-4">\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442</h1>`);
      if (!unref(user)) {
        _push(`<div><p class="mb-4">\u0412\u044B \u043D\u0435 \u0430\u0432\u0442\u043E\u0440\u0438\u0437\u043E\u0432\u0430\u043D\u044B.</p>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "inline-flex items-center px-4 py-2 rounded-md bg-sky-600 text-white hover:bg-sky-700 transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u0412\u043E\u0439\u0442\u0438 `);
            } else {
              return [
                createTextVNode(" \u0412\u043E\u0439\u0442\u0438 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else {
        _push(`<div class="space-y-6"><div class="grid grid-cols-1 md:grid-cols-3 gap-4">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/account/orders",
          class: "block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center gap-3"${_scopeId}><div class="text-2xl"${_scopeId}>\u{1F4E6}</div><div${_scopeId}><h3 class="font-semibold"${_scopeId}>\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B</h3><p class="text-sm text-gray-600"${_scopeId}>\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u043E\u043A\u0443\u043F\u043E\u043A</p></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "text-2xl" }, "\u{1F4E6}"),
                  createVNode("div", null, [
                    createVNode("h3", { class: "font-semibold" }, "\u041C\u043E\u0438 \u0437\u0430\u043A\u0430\u0437\u044B"),
                    createVNode("p", { class: "text-sm text-gray-600" }, "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u043F\u043E\u043A\u0443\u043F\u043E\u043A")
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/account/profile",
          class: "block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center gap-3"${_scopeId}><div class="text-2xl"${_scopeId}>\u{1F464}</div><div${_scopeId}><h3 class="font-semibold"${_scopeId}>\u041F\u0440\u043E\u0444\u0438\u043B\u044C</h3><p class="text-sm text-gray-600"${_scopeId}>\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435</p></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "text-2xl" }, "\u{1F464}"),
                  createVNode("div", null, [
                    createVNode("h3", { class: "font-semibold" }, "\u041F\u0440\u043E\u0444\u0438\u043B\u044C"),
                    createVNode("p", { class: "text-sm text-gray-600" }, "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0434\u0430\u043D\u043D\u044B\u0435")
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/favorites",
          class: "block p-4 bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md transition"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center gap-3"${_scopeId}><div class="text-2xl"${_scopeId}>\u2764\uFE0F</div><div${_scopeId}><h3 class="font-semibold"${_scopeId}>\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435</h3><p class="text-sm text-gray-600"${_scopeId}>\u041B\u044E\u0431\u0438\u043C\u044B\u0435 \u0442\u043E\u0432\u0430\u0440\u044B</p></div></div>`);
            } else {
              return [
                createVNode("div", { class: "flex items-center gap-3" }, [
                  createVNode("div", { class: "text-2xl" }, "\u2764\uFE0F"),
                  createVNode("div", null, [
                    createVNode("h3", { class: "font-semibold" }, "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435"),
                    createVNode("p", { class: "text-sm text-gray-600" }, "\u041B\u044E\u0431\u0438\u043C\u044B\u0435 \u0442\u043E\u0432\u0430\u0440\u044B")
                  ])
                ])
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="rounded-xl border border-slate-200 p-5 bg-white"><h2 class="text-lg font-semibold mb-3">\u0418\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F \u043E \u043F\u0440\u043E\u0444\u0438\u043B\u0435</h2><div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"><div><span class="text-slate-500">\u0418\u043C\u044F:</span> <span class="font-medium">${ssrInterpolate(unref(user).name)}</span></div><div><span class="text-slate-500">Email:</span> <span class="font-medium">${ssrInterpolate(unref(user).email)}</span></div>`);
        if (unref(user).phone) {
          _push(`<div><span class="text-slate-500">\u0422\u0435\u043B\u0435\u0444\u043E\u043D:</span> <span class="font-medium">${ssrInterpolate(unref(user).phone)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(user).city) {
          _push(`<div><span class="text-slate-500">\u0413\u043E\u0440\u043E\u0434:</span> <span class="font-medium">${ssrInterpolate(unref(user).city)}</span></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3"><span class="text-sm text-slate-500">\u0422\u0438\u043F \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430:</span><span class="${ssrRenderClass([
          unref(user).role === "store" ? "border-amber-300 bg-amber-50 text-amber-800" : unref(user).role === "manager" ? "border-sky-300 bg-sky-50 text-sky-800" : "border-slate-200 bg-slate-50 text-slate-700",
          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium"
        ])}">${ssrInterpolate(unref(roleLabel))}</span>`);
        if (unref(user).role === "admin") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/admin",
            class: "ml-auto text-sm text-blue-600 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u0410\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C \u2192 `);
              } else {
                return [
                  createTextVNode(" \u0410\u0434\u043C\u0438\u043D-\u043F\u0430\u043D\u0435\u043B\u044C \u2192 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else if (unref(user).role === "store" || unref(user).role === "manager") {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/b2b",
            class: "ml-auto text-sm text-blue-600 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` B2B-\u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u2192 `);
              } else {
                return [
                  createTextVNode(" B2B-\u043A\u0430\u0431\u0438\u043D\u0435\u0442 \u2192 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        } else {
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/b2b/register",
            class: "ml-auto text-sm text-blue-600 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` \u0421\u0442\u0430\u0442\u044C \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u043C \u2192 `);
              } else {
                return [
                  createTextVNode(" \u0421\u0442\u0430\u0442\u044C \u043F\u0430\u0440\u0442\u043D\u0451\u0440\u043E\u043C \u2192 ")
                ];
              }
            }),
            _: 1
          }, _parent));
        }
        _push(`</div></div>`);
        if (unref(ordersInTransit).length) {
          _push(`<div class="rounded-xl border border-blue-200 bg-blue-50 p-5"><div class="flex items-center gap-2 mb-4"><span class="text-xl">\u{1F69A}</span><h2 class="text-lg font-semibold text-blue-900">\u0417\u0430\u043A\u0430\u0437\u044B \u0432 \u043F\u0443\u0442\u0438</h2><span class="ml-auto text-sm text-blue-700">${ssrInterpolate(unref(ordersInTransit).length)} ${ssrInterpolate(pluralize(unref(ordersInTransit).length, "\u0437\u0430\u043A\u0430\u0437", "\u0437\u0430\u043A\u0430\u0437\u0430", "\u0437\u0430\u043A\u0430\u0437\u043E\u0432"))}</span></div><div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(ordersInTransit), (order) => {
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: order.id,
              to: `/account/orders?id=${order.id}`,
              class: "block bg-white rounded-lg border border-blue-100 p-4 hover:shadow-md transition"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="flex items-center justify-between"${_scopeId}><div${_scopeId}><div class="font-semibold text-slate-900"${_scopeId}>\u0417\u0430\u043A\u0430\u0437 #${ssrInterpolate(order.id)}</div><div class="text-sm text-slate-600"${_scopeId}>${ssrInterpolate(formatDate(order.createdAt))}</div></div><div class="text-right"${_scopeId}><div class="font-bold text-slate-900"${_scopeId}>${ssrInterpolate(formatMoney(order.totalPrice))} \u20BD</div><span class="${ssrRenderClass([statusClass(order.status), "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"])}"${_scopeId}>${ssrInterpolate(statusLabel(order.status))}</span></div></div>`);
                } else {
                  return [
                    createVNode("div", { class: "flex items-center justify-between" }, [
                      createVNode("div", null, [
                        createVNode("div", { class: "font-semibold text-slate-900" }, "\u0417\u0430\u043A\u0430\u0437 #" + toDisplayString(order.id), 1),
                        createVNode("div", { class: "text-sm text-slate-600" }, toDisplayString(formatDate(order.createdAt)), 1)
                      ]),
                      createVNode("div", { class: "text-right" }, [
                        createVNode("div", { class: "font-bold text-slate-900" }, toDisplayString(formatMoney(order.totalPrice)) + " \u20BD", 1),
                        createVNode("span", {
                          class: ["inline-flex items-center px-2 py-1 rounded-full text-xs font-medium", statusClass(order.status)]
                        }, toDisplayString(statusLabel(order.status)), 3)
                      ])
                    ])
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(recentlyViewed).length) {
          _push(`<div class="rounded-xl border border-slate-200 bg-white p-5"><div class="flex items-center gap-2 mb-4"><span class="text-xl">\u{1F441}\uFE0F</span><h2 class="text-lg font-semibold text-slate-900">\u0412\u044B \u0441\u043C\u043E\u0442\u0440\u0435\u043B\u0438</h2>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/catalog",
            class: "ml-auto text-sm text-blue-600 hover:underline"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u2192`);
              } else {
                return [
                  createTextVNode("\u0421\u043C\u043E\u0442\u0440\u0435\u0442\u044C \u0432\u0441\u0435 \u2192")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div><div class="flex gap-3 overflow-x-auto pb-2"><!--[-->`);
          ssrRenderList(unref(recentlyViewed).slice(0, 8), (product) => {
            var _a;
            _push(ssrRenderComponent(_component_NuxtLink, {
              key: product.id,
              to: `/product/${(_a = product.slug) != null ? _a : product.id}`,
              class: "flex-shrink-0 w-28 group"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<div class="w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group-hover:ring-2 group-hover:ring-blue-400 transition"${_scopeId}>`);
                  if (product.imageUrl) {
                    _push2(`<img${ssrRenderAttr("src", product.imageUrl)}${ssrRenderAttr("alt", product.name)} class="w-full h-full object-cover"${_scopeId}>`);
                  } else {
                    _push2(`<span class="flex items-center justify-center text-xs text-slate-400 h-full"${_scopeId}>\u0424\u043E\u0442\u043E</span>`);
                  }
                  _push2(`</div><div class="mt-2 text-sm text-slate-700 truncate"${_scopeId}>${ssrInterpolate(product.name)}</div><div class="text-sm font-semibold text-slate-900"${_scopeId}>${ssrInterpolate(formatMoney(product.retailPrice))} \u20BD</div>`);
                } else {
                  return [
                    createVNode("div", { class: "w-28 h-28 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 group-hover:ring-2 group-hover:ring-blue-400 transition" }, [
                      product.imageUrl ? (openBlock(), createBlock("img", {
                        key: 0,
                        src: product.imageUrl,
                        alt: product.name,
                        class: "w-full h-full object-cover"
                      }, null, 8, ["src", "alt"])) : (openBlock(), createBlock("span", {
                        key: 1,
                        class: "flex items-center justify-center text-xs text-slate-400 h-full"
                      }, "\u0424\u043E\u0442\u043E"))
                    ]),
                    createVNode("div", { class: "mt-2 text-sm text-slate-700 truncate" }, toDisplayString(product.name), 1),
                    createVNode("div", { class: "text-sm font-semibold text-slate-900" }, toDisplayString(formatMoney(product.retailPrice)) + " \u20BD", 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-Bb6whva0.mjs.map
