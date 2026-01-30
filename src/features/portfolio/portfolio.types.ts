export interface Investment {
    id: string;
    name: string;
    amountInvested: number;
    currentValue: number;
    dateAcquired: Date;
}

export interface Portfolio {
    investments: Investment[];
    totalInvested: number;
    totalCurrentValue: number;
    totalReturn: number;
}

export interface PortfolioState {
    portfolio: Portfolio;
    loading: boolean;
    error: string | null;
}