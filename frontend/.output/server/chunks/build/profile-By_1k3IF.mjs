import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$1 } from './BaseInput-FgAN8o_L.mjs';
import { _ as _sfc_main$2 } from './server.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, unref, toDisplayString, useSSRContext } from 'vue';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
import { u as useToast } from './useToast-BeE5NKHL.mjs';
import { u as useHead } from './index-CCqbQxu4.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
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
  __name: "profile",
  __ssrInlineRender: true,
  setup(__props) {
    var _a, _b, _c, _d, _e;
    const authStore = useAuthStore();
    useToast();
    const profileForm = ref({
      name: ((_a = authStore.user) == null ? void 0 : _a.name) || "",
      email: ((_b = authStore.user) == null ? void 0 : _b.email) || "",
      phone: ((_c = authStore.user) == null ? void 0 : _c.phone) || "",
      city: ((_d = authStore.user) == null ? void 0 : _d.city) || "",
      address: ((_e = authStore.user) == null ? void 0 : _e.address) || ""
    });
    const passwordForm = ref({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    const updatingProfile = ref(false);
    const changingPassword = ref(false);
    useHead({
      title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_BaseInput = _sfc_main$1;
      const _component_BaseButton = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "container mx-auto px-4 py-8" }, _attrs))}><nav class="flex items-center gap-2 text-sm text-slate-500 mb-4">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/account",
        class: "hover:text-slate-900 transition"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442`);
          } else {
            return [
              createTextVNode("\u041B\u0438\u0447\u043D\u044B\u0439 \u043A\u0430\u0431\u0438\u043D\u0435\u0442")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<span>\u2192</span><span class="text-slate-900">\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F</span></nav><h1 class="text-3xl font-bold mb-6">\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0440\u043E\u0444\u0438\u043B\u044F</h1><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="bg-white rounded-lg shadow-sm p-6"><h2 class="text-xl font-semibold mb-4">\u041E\u0441\u043D\u043E\u0432\u043D\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F</h2><form class="space-y-4">`);
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(profileForm).name,
        "onUpdate:modelValue": ($event) => unref(profileForm).name = $event,
        type: "text",
        label: "\u0418\u043C\u044F",
        placeholder: "\u0412\u0430\u0448\u0435 \u0438\u043C\u044F"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(profileForm).email,
        "onUpdate:modelValue": ($event) => unref(profileForm).email = $event,
        type: "email",
        label: "Email",
        placeholder: "your@email.com"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(profileForm).phone,
        "onUpdate:modelValue": ($event) => unref(profileForm).phone = $event,
        type: "tel",
        label: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D",
        placeholder: "+7 (999) 123-45-67"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(profileForm).city,
        "onUpdate:modelValue": ($event) => unref(profileForm).city = $event,
        type: "text",
        label: "\u0413\u043E\u0440\u043E\u0434",
        placeholder: "\u041C\u043E\u0441\u043A\u0432\u0430"
      }, null, _parent));
      _push(`<div><label class="block text-sm font-medium text-gray-700 mb-1">\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438</label><textarea rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" placeholder="\u0423\u043B\u0438\u0446\u0430, \u0434\u043E\u043C, \u043A\u0432\u0430\u0440\u0442\u0438\u0440\u0430">${ssrInterpolate(unref(profileForm).address)}</textarea></div>`);
      _push(ssrRenderComponent(_component_BaseButton, {
        type: "submit",
        variant: "primary",
        size: "lg",
        loading: unref(updatingProfile),
        disabled: unref(updatingProfile),
        "full-width": ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(updatingProfile) ? "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435..." : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F")}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(updatingProfile) ? "\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435..." : "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u044F"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form></div><div class="bg-white rounded-lg shadow-sm p-6"><h2 class="text-xl font-semibold mb-4">\u0421\u043C\u0435\u043D\u0430 \u043F\u0430\u0440\u043E\u043B\u044F</h2><form class="space-y-4">`);
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(passwordForm).currentPassword,
        "onUpdate:modelValue": ($event) => unref(passwordForm).currentPassword = $event,
        type: "password",
        label: "\u0422\u0435\u043A\u0443\u0449\u0438\u0439 \u043F\u0430\u0440\u043E\u043B\u044C",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(passwordForm).newPassword,
        "onUpdate:modelValue": ($event) => unref(passwordForm).newPassword = $event,
        type: "password",
        label: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
        hint: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C 8 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432, \u0437\u0430\u0433\u043B\u0430\u0432\u043D\u044B\u0435 \u0438 \u0441\u0442\u0440\u043E\u0447\u043D\u044B\u0435 \u0431\u0443\u043A\u0432\u044B, \u0446\u0438\u0444\u0440\u044B"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(passwordForm).confirmPassword,
        "onUpdate:modelValue": ($event) => unref(passwordForm).confirmPassword = $event,
        type: "password",
        label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C",
        placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseButton, {
        type: "submit",
        variant: "primary",
        size: "lg",
        loading: unref(changingPassword),
        disabled: unref(changingPassword) || !unref(passwordForm).currentPassword || !unref(passwordForm).newPassword || unref(passwordForm).newPassword !== unref(passwordForm).confirmPassword,
        "full-width": ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(changingPassword) ? "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435..." : "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C")}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(changingPassword) ? "\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435..." : "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form></div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/account/profile.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=profile-By_1k3IF.mjs.map
