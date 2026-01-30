export type Budget = {
    id: string;
    name: string;
    amount: number;
    startDate: Date;
    endDate: Date;
    category: string;
};

export type BudgetState = {
    budgets: Budget[];
    totalBudget: number;
};

export type AddBudgetAction = {
    type: 'ADD_BUDGET';
    payload: Budget;
};

export type RemoveBudgetAction = {
    type: 'REMOVE_BUDGET';
    payload: string; // budget id
};

export type UpdateBudgetAction = {
    type: 'UPDATE_BUDGET';
    payload: Budget;
};

export type BudgetAction = AddBudgetAction | RemoveBudgetAction | UpdateBudgetAction;