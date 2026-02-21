import { _ as _sfc_main$1 } from './BaseInput-FgAN8o_L.mjs';
import { _ as _sfc_main$2 } from './server.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { u as useHead } from './index-CCqbQxu4.mjs';
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
  __name: "forgot-password",
  __ssrInlineRender: true,
  setup(__props) {
    const email = ref("");
    const loading = ref(false);
    const error = ref("");
    const emailSent = ref(false);
    useHead({
      title: "\u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseInput = _sfc_main$1;
      const _component_BaseButton = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" }, _attrs))}><div class="max-w-md w-full space-y-8"><div><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900"> \u0412\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u043B\u044F </h2><p class="mt-2 text-center text-sm text-gray-600"> \u0412\u0432\u0435\u0434\u0438\u0442\u0435 email, \u043A\u043E\u0442\u043E\u0440\u044B\u0439 \u0432\u044B \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043B\u0438 \u043F\u0440\u0438 \u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u0438 </p></div>`);
      if (!emailSent.value) {
        _push(`<form class="mt-8 space-y-6">`);
        _push(ssrRenderComponent(_component_BaseInput, {
          modelValue: email.value,
          "onUpdate:modelValue": ($event) => email.value = $event,
          type: "email",
          label: "Email",
          placeholder: "Email",
          required: true
        }, null, _parent));
        if (error.value) {
          _push(`<div class="rounded-lg bg-red-50 p-4"><p class="text-sm text-red-700">${ssrInterpolate(error.value)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_BaseButton, {
          type: "submit",
          variant: "primary",
          size: "lg",
          loading: loading.value,
          disabled: loading.value,
          "full-width": ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(loading.value ? "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430..." : "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443")}`);
            } else {
              return [
                createTextVNode(toDisplayString(loading.value ? "\u041E\u0442\u043F\u0440\u0430\u0432\u043A\u0430..." : "\u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0443"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`<div class="text-center">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "text-sm text-primary hover:text-primary-dark transition-colors"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0432\u0445\u043E\u0434\u0443 `);
            } else {
              return [
                createTextVNode(" \u2190 \u0412\u0435\u0440\u043D\u0443\u0442\u044C\u0441\u044F \u043A \u0432\u0445\u043E\u0434\u0443 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></form>`);
      } else {
        _push(`<div class="rounded-card bg-green-50 p-6"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div><div class="ml-3"><h3 class="text-sm font-medium text-green-800"> \u041F\u0438\u0441\u044C\u043C\u043E \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E </h3><div class="mt-2 text-sm text-green-700"><p> \u0415\u0441\u043B\u0438 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0441 \u0442\u0430\u043A\u0438\u043C email \u0441\u0443\u0449\u0435\u0441\u0442\u0432\u0443\u0435\u0442, \u043D\u0430 \u043D\u0435\u0433\u043E \u0431\u0443\u0434\u0435\u0442 \u043E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0430 \u0441\u0441\u044B\u043B\u043A\u0430 \u0434\u043B\u044F \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0430\u0440\u043E\u043B\u044F. \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043F\u043E\u0447\u0442\u0443 \u0438 \u0441\u043B\u0435\u0434\u0443\u0439\u0442\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F\u043C. </p><p class="mt-2"> \u041D\u0435 \u043F\u043E\u043B\u0443\u0447\u0438\u043B\u0438 \u043F\u0438\u0441\u044C\u043C\u043E? \u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043F\u0430\u043F\u043A\u0443 &quot;\u0421\u043F\u0430\u043C&quot;. </p></div><div class="mt-4"><button class="text-sm font-medium text-green-800 hover:text-green-700 transition-colors"> \u041E\u0442\u043F\u0440\u0430\u0432\u0438\u0442\u044C \u0435\u0449\u0435 \u0440\u0430\u0437 </button></div></div></div></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/forgot-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=forgot-password-Bs1tgR-y.mjs.map
