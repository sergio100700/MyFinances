export type Transaction = {
    id: string;
    date: Date;
    amount: number;
    category: string;
    description?: string;
};

export type TransactionCategory = {
    id: string;
    name: string;
};