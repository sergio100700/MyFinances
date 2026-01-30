import { writable } from 'svelte/store';

export const budgetsStore = writable({
    budgets: [],
    totalBudget: 0,
    addBudget: (budget) => {
        budgetsStore.update(state => {
            const updatedBudgets = [...state.budgets, budget];
            const updatedTotal = updatedBudgets.reduce((acc, b) => acc + b.amount, 0);
            return { budgets: updatedBudgets, totalBudget: updatedTotal };
        });
    },
    removeBudget: (id) => {
        budgetsStore.update(state => {
            const updatedBudgets = state.budgets.filter(b => b.id !== id);
            const updatedTotal = updatedBudgets.reduce((acc, b) => acc + b.amount, 0);
            return { budgets: updatedBudgets, totalBudget: updatedTotal };
        });
    },
    clearBudgets: () => {
        budgetsStore.set({ budgets: [], totalBudget: 0 });
    }
});