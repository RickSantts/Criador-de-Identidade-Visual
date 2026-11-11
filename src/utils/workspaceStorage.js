export const budgetStorageKey = userId => userId == null ? 'budget_data' : `${userId}_budget_data`;

export function readBudget(userId) {
  try {
    const scoped = localStorage.getItem(budgetStorageKey(userId));
    if (scoped) return JSON.parse(scoped);
    // Claim a legacy draft once, so another account never inherits it.
    const legacy = localStorage.getItem('budget_data');
    const owner = localStorage.getItem('budget_data_owner');
    if (legacy && (userId == null || owner === String(userId) || owner === null)) {
      const parsed = JSON.parse(legacy);
      if (userId != null) {
        localStorage.setItem(budgetStorageKey(userId), legacy);
        localStorage.setItem('budget_data_owner', String(userId));
      }
      return parsed;
    }
  } catch { /* Keep the editor usable when a draft cannot be read. */ }
  return null;
}
