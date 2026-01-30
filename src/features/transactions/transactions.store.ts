import { makeAutoObservable } from 'mobx';

class TransactionsStore {
    transactions = [];

    constructor() {
        makeAutoObservable(this);
    }

    addTransaction(transaction) {
        this.transactions.push(transaction);
    }

    removeTransaction(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
    }

    get totalAmount() {
        return this.transactions.reduce((total, transaction) => total + transaction.amount, 0);
    }
}

const transactionsStore = new TransactionsStore();
export default transactionsStore;