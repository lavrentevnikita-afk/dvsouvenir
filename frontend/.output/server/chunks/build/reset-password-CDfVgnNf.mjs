import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { _ as _sfc_main$1 } from './BaseInput-FgAN8o_L.mjs';
import { _ as _sfc_main$2 } from './server.mjs';
import { defineComponent, computed, ref, mergeProps, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
import { useRoute } from 'vue-router';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "reset-password",
  __ssrInlineRender: true,
  setup(__props) {
    const route = useRoute();
    computed(() => route.query.token);
    const password = ref("");
    const confirmPassword = ref("");
    const loading = ref(false);
    const verifying = ref(true);
    const tokenError = ref("");
    const error = ref("");
    const resetSuccess = ref(false);
    const isPasswordValid = computed(() => {
      return password.value.length >= 8 && /[A-Z]/.test(password.value) && /[a-z]/.test(password.value) && /\d/.test(password.value) && password.value === confirmPassword.value;
    });
    useHead({
      title: "\u0421\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F"
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_BaseInput = _sfc_main$1;
      const _component_BaseButton = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" }, _attrs))}><div class="max-w-md w-full space-y-8"><div><h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900"> \u0421\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F </h2><p class="mt-2 text-center text-sm text-gray-600"> \u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C \u0434\u043B\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 </p></div>`);
      if (verifying.value) {
        _push(`<div class="text-center py-12"><div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div><p class="mt-4 text-gray-600">\u041F\u0440\u043E\u0432\u0435\u0440\u043A\u0430 \u0441\u0441\u044B\u043B\u043A\u0438...</p></div>`);
      } else if (tokenError.value) {
        _push(`<div class="rounded-md bg-red-50 p-4"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg></div><div class="ml-3"><h3 class="text-sm font-medium text-red-800"> \u041D\u0435\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0441\u0441\u044B\u043B\u043A\u0430 </h3><div class="mt-2 text-sm text-red-700"><p>${ssrInterpolate(tokenError.value)}</p></div><div class="mt-4">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/forgot-password",
          class: "text-sm font-medium text-red-800 hover:text-red-700"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u043E\u0432\u0443\u044E \u0441\u0441\u044B\u043B\u043A\u0443 \u2192 `);
            } else {
              return [
                createTextVNode(" \u0417\u0430\u043F\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u043E\u0432\u0443\u044E \u0441\u0441\u044B\u043B\u043A\u0443 \u2192 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div></div>`);
      } else if (!resetSuccess.value) {
        _push(`<form class="mt-8 space-y-6"><div class="space-y-4">`);
        _push(ssrRenderComponent(_component_BaseInput, {
          modelValue: password.value,
          "onUpdate:modelValue": ($event) => password.value = $event,
          type: "password",
          label: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C",
          placeholder: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C 8 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
          required: true
        }, null, _parent));
        _push(ssrRenderComponent(_component_BaseInput, {
          modelValue: confirmPassword.value,
          "onUpdate:modelValue": ($event) => confirmPassword.value = $event,
          type: "password",
          label: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C",
          placeholder: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C",
          required: true
        }, null, _parent));
        _push(`</div><div class="bg-primary-light/20 border border-primary-light rounded-card p-4"><p class="text-sm font-medium text-primary mb-2">\u0422\u0440\u0435\u0431\u043E\u0432\u0430\u043D\u0438\u044F \u043A \u043F\u0430\u0440\u043E\u043B\u044E:</p><ul class="text-sm text-primary space-y-1"><li class="${ssrRenderClass(password.value.length >= 8 ? "text-green-600" : "")}">\u2713 \u041C\u0438\u043D\u0438\u043C\u0443\u043C 8 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432</li><li class="${ssrRenderClass(/[A-Z]/.test(password.value) ? "text-green-600" : "")}">\u2713 \u0417\u0430\u0433\u043B\u0430\u0432\u043D\u0430\u044F \u0431\u0443\u043A\u0432\u0430</li><li class="${ssrRenderClass(/[a-z]/.test(password.value) ? "text-green-600" : "")}">\u2713 \u0421\u0442\u0440\u043E\u0447\u043D\u0430\u044F \u0431\u0443\u043A\u0432\u0430</li><li class="${ssrRenderClass(/\d/.test(password.value) ? "text-green-600" : "")}">\u2713 \u0426\u0438\u0444\u0440\u0430</li></ul></div>`);
        if (error.value) {
          _push(`<div class="rounded-card bg-red-50 p-4"><p class="text-sm text-red-700">${ssrInterpolate(error.value)}</p></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_BaseButton, {
          type: "submit",
          variant: "primary",
          size: "lg",
          loading: loading.value,
          disabled: loading.value || !isPasswordValid.value,
          "full-width": ""
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`${ssrInterpolate(loading.value ? "\u0421\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F..." : "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C")}`);
            } else {
              return [
                createTextVNode(toDisplayString(loading.value ? "\u0421\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F..." : "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C"), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</form>`);
      } else {
        _push(`<div class="rounded-md bg-green-50 p-4"><div class="flex"><div class="flex-shrink-0"><svg class="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg></div><div class="ml-3"><h3 class="text-sm font-medium text-green-800"> \u041F\u0430\u0440\u043E\u043B\u044C \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0438\u0437\u043C\u0435\u043D\u0435\u043D! </h3><div class="mt-2 text-sm text-green-700"><p> \u0422\u0435\u043F\u0435\u0440\u044C \u0432\u044B \u043C\u043E\u0436\u0435\u0442\u0435 \u0432\u043E\u0439\u0442\u0438 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0443 \u0441 \u043D\u043E\u0432\u044B\u043C \u043F\u0430\u0440\u043E\u043B\u0435\u043C. </p></div><div class="mt-4">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/login",
          class: "text-sm font-medium text-green-800 hover:text-green-700"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0432\u0445\u043E\u0434\u0443 \u2192 `);
            } else {
              return [
                createTextVNode(" \u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u043A \u0432\u0445\u043E\u0434\u0443 \u2192 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div></div>`);
      }
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/reset-password.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=reset-password-CDfVgnNf.mjs.map
