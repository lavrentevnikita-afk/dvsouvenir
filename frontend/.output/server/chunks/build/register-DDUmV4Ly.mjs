import { _ as _sfc_main$1 } from './BaseInput-FgAN8o_L.mjs';
import { c as useRouter, _ as _sfc_main$2 } from './server.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-NtsZvriX.mjs';
import { defineComponent, ref, mergeProps, unref, isRef, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { u as useAuthStore } from './auth-DjLfHSSP.mjs';
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
  __name: "register",
  __ssrInlineRender: true,
  setup(__props) {
    const name = ref("");
    const email = ref("");
    const password = ref("");
    const loading = ref(false);
    const errorMessage = ref("");
    useRouter();
    useAuthStore();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_BaseInput = _sfc_main$1;
      const _component_BaseButton = _sfc_main$2;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<section${ssrRenderAttrs(mergeProps({ class: "max-w-md mx-auto mt-8 bg-white rounded-card shadow-sm p-6" }, _attrs))}><h1 class="text-xl font-semibold mb-4">\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0446\u0438\u044F \u043F\u043E\u043A\u0443\u043F\u0430\u0442\u0435\u043B\u044F</h1><p class="text-sm text-slate-500 mb-4"> \u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442, \u0447\u0442\u043E\u0431\u044B \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u0442\u044C \u0437\u0430\u043A\u0430\u0437\u044B \u0438 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u043E\u0444\u043E\u0440\u043C\u043B\u044F\u0442\u044C \u043F\u043E\u043A\u0443\u043F\u043A\u0438. </p><form class="space-y-4">`);
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(name),
        "onUpdate:modelValue": ($event) => isRef(name) ? name.value = $event : null,
        type: "text",
        label: "\u0418\u043C\u044F",
        required: true
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(email),
        "onUpdate:modelValue": ($event) => isRef(email) ? email.value = $event : null,
        type: "email",
        label: "Email",
        required: true
      }, null, _parent));
      _push(ssrRenderComponent(_component_BaseInput, {
        modelValue: unref(password),
        "onUpdate:modelValue": ($event) => isRef(password) ? password.value = $event : null,
        type: "password",
        label: "\u041F\u0430\u0440\u043E\u043B\u044C",
        hint: "\u041C\u0438\u043D\u0438\u043C\u0443\u043C 6 \u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
        required: true
      }, null, _parent));
      if (unref(errorMessage)) {
        _push(`<p class="text-sm text-red-600">${ssrInterpolate(unref(errorMessage))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_BaseButton, {
        type: "submit",
        variant: "primary",
        size: "lg",
        loading: unref(loading),
        disabled: unref(loading),
        "full-width": ""
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`${ssrInterpolate(unref(loading) ? "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0435\u043C..." : "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F")}`);
          } else {
            return [
              createTextVNode(toDisplayString(unref(loading) ? "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u0443\u0435\u043C..." : "\u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F"), 1)
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</form><div class="mt-4 text-sm">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/b2b/register",
        class: "text-primary hover:text-primary-dark transition-colors underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(` \u0423 \u0432\u0430\u0441 \u043C\u0430\u0433\u0430\u0437\u0438\u043D? \u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u043A\u0430\u043A \u043C\u0430\u0433\u0430\u0437\u0438\u043D `);
          } else {
            return [
              createTextVNode(" \u0423 \u0432\u0430\u0441 \u043C\u0430\u0433\u0430\u0437\u0438\u043D? \u0417\u0430\u0440\u0435\u0433\u0438\u0441\u0442\u0440\u0438\u0440\u043E\u0432\u0430\u0442\u044C\u0441\u044F \u043A\u0430\u043A \u043C\u0430\u0433\u0430\u0437\u0438\u043D ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="text-sm text-slate-500 mt-4"> \u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u043A\u0430\u0443\u043D\u0442? `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/login",
        class: "text-primary font-medium hover:text-primary-dark transition-colors"
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
      _push(`</p></section>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/register.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=register-DDUmV4Ly.mjs.map
