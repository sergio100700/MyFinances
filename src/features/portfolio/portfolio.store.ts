import { makeAutoObservable } from "mobx";

class PortfolioStore {
    portfolios = [];
    loading = false;

    constructor() {
        makeAutoObservable(this);
    }

    setLoading(loading) {
        this.loading = loading;
    }

    setPortfolios(portfolios) {
        this.portfolios = portfolios;
    }

    addPortfolio(portfolio) {
        this.portfolios.push(portfolio);
    }

    removePortfolio(portfolioId) {
        this.portfolios = this.portfolios.filter(portfolio => portfolio.id !== portfolioId);
    }

    get totalValue() {
        return this.portfolios.reduce((total, portfolio) => total + portfolio.value, 0);
    }

    get portfolioCount() {
        return this.portfolios.length;
    }
}

const portfolioStore = new PortfolioStore();
export default portfolioStore;