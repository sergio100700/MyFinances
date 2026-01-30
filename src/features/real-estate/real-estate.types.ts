export interface RealEstateInvestment {
    id: string;
    propertyName: string;
    purchasePrice: number;
    currentValue: number;
    rentalIncome: number;
    expenses: number;
    location: string;
    purchaseDate: Date;
}

export interface RealEstatePortfolio {
    investments: RealEstateInvestment[];
    totalInvestmentValue: number;
    totalRentalIncome: number;
    totalExpenses: number;
    netIncome: number;
}