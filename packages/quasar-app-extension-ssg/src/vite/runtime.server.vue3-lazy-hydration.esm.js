import { useSSRContext, getCurrentInstance } from 'vue';

/**
 * Quasar ssg runtime at server-side.
 * Injects lazily hydrated component id to ssrContext._lazilyHydratedComponents
 *
 * In this way, it is possible to avoid preloading these components in production.
 *
 * @see https://github.com/freddy38510/vue3-lazy-hydration
 * @param { string } id representing the module id
 */
export default (id) => {
  const componentInstance = getCurrentInstance();

  if (!componentInstance || componentInstance.type.__isLazilyHydrated) {
    // only children should be loaded on-hydration
    return;
  }

  const ssrContext = useSSRContext();

  if (
    !ssrContext
    || (ssrContext._lazilyHydratedComponents
      && ssrContext._lazilyHydratedComponents.has(id))
  ) {
    // already added or not at server-side
    return;
  }

  let { parent } = componentInstance;

  while (parent) {
    if (parent.type.__isLazilyHydrated) {
      // is a child of a lazily hydrated component, so treat it as such
      (
        ssrContext._lazilyHydratedComponents
        || (ssrContext._lazilyHydratedComponents = new Set())
      ).add(id);

      return;
    }

    parent = parent.parent;
  }
};
