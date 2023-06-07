/**
 * @typedef { import('vue').ComponentOptions & {
 *   __vccOpts: import('vue').ComponentOptions;
 *}} Component
 */

/**
 * Quasar runtime for server-side injecting module id.
 *
 * Warning! This file does NOT get transpiled by Babel
 * but is included into the UI code.
 *
 * @param { Component } component Component object
 * @param { string }    id the module id
 */
module.exports = function injectModuleId(component, id) {
  const targetComponent = component.__vccOpts || component;

  const mixin = {
    created() {
      this.ssrContext._modules.add(`${id}`);

      if (targetComponent.__isLazilyHydrated) {
        return;
      }

      let parent = this.$parent;

      while (parent) {
        if (parent.$.type.__isLazilyHydrated) {
          // is a child of a lazily hydrated component, so treat it as such
          this.ssrContext._lazilyHydratedComponents.add(`${id}`);

          return;
        }

        parent = parent.$parent;
      }
    },
  };

  if (Array.isArray(targetComponent.mixins)) {
    targetComponent.mixins.push(mixin);
  } else {
    targetComponent.mixins = [mixin];
  }
};
