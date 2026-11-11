/**
 * Intelligent Multi-page Pagination Engine
 */
export default function paginateBudget(budgetData, itemsPerPageSetting = 'auto') {
  const items = budgetData.items || [];

  if (items.length === 0) {
    return [{
      pageNumber: 1,
      totalPages: 1,
      items: [],
      isFirstPage: true,
      isLastPage: true
    }];
  }

  if (itemsPerPageSetting !== 'auto') {
    const limit = parseInt(itemsPerPageSetting, 10);
    if (!isNaN(limit) && limit > 0) {
      const chunks = [];
      for (let i = 0; i < items.length; i += limit) {
        chunks.push(items.slice(i, i + limit));
      }
      const total = chunks.length;
      return chunks.map((chunk, idx) => ({
        pageNumber: idx + 1,
        totalPages: total,
        items: chunk,
        isFirstPage: idx === 0,
        isLastPage: idx === total - 1
      }));
    }
  }

  const getItemWeight = (item) => {
    if (!item.description || item.description.trim().length === 0) return 1.0;
    if (item.description.length <= 40) return 1.2;
    if (item.description.length <= 90) return 1.5;
    return 2.0;
  };

  const totalWeight = items.reduce((acc, it) => acc + getItemWeight(it), 0);
  const hasExtraNotes = Boolean(budgetData.additionalNotes && budgetData.additionalNotes.trim());
  const hasPix = Boolean(budgetData.showPixBox && budgetData.pixKey && budgetData.pixKey.trim());
  const singlePageCapacity = hasExtraNotes && hasPix ? 4.2 : 5.2;

  if (totalWeight <= singlePageCapacity) {
    return [{
      pageNumber: 1,
      totalPages: 1,
      items: items,
      isFirstPage: true,
      isLastPage: true
    }];
  }

  const pages = [];
  const itemsPool = [...items];

  const takeChunk = (maxCapacity) => {
    const chunk = [];
    let currentWeight = 0;
    while (itemsPool.length > 0) {
      const nextItem = itemsPool[0];
      const nextWeight = getItemWeight(nextItem);
      if (chunk.length > 0 && (currentWeight + nextWeight > maxCapacity)) break;
      chunk.push(itemsPool.shift());
      currentWeight += nextWeight;
    }
    return chunk;
  };

  const page1Items = takeChunk(5.5);
  // If the single-page layout did not fit, reserve a final page for totals.
  // Otherwise the first page can consume every item and omit the closing blocks.
  if (itemsPool.length === 0) itemsPool.push(page1Items.pop());
  pages.push({
    isFirstPage: true,
    isLastPage: false,
    items: page1Items
  });

  while (itemsPool.length > 0) {
    const remainingWeight = itemsPool.reduce((acc, it) => acc + getItemWeight(it), 0);
    const finalPageCapacity = hasExtraNotes && hasPix ? 3.5 : 4.5;

    if (remainingWeight <= finalPageCapacity) {
      pages.push({
        isFirstPage: false,
        isLastPage: true,
        items: [...itemsPool]
      });
      itemsPool.length = 0;
      break;
    }

    const interChunk = takeChunk(8.5);
    pages.push({
      isFirstPage: false,
      isLastPage: itemsPool.length === 0,
      items: interChunk
    });
  }

  const totalPages = pages.length;
  return pages.map((page, index) => ({
    ...page,
    pageNumber: index + 1,
    totalPages: totalPages
  }));
}

