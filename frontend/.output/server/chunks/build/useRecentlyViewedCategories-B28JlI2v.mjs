import { ref } from 'vue';

function useRecentlyViewedCategories() {
  const items = ref([]);
  const load = () => {
    return;
  };
  const add = (slug, name) => {
    return;
  };
  return { items, add, load };
}

export { useRecentlyViewedCategories as u };
//# sourceMappingURL=useRecentlyViewedCategories-B28JlI2v.mjs.map
