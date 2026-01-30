# My Finance Web

My Finance Web is a personal finance management application designed to help users track their financial data, including investment portfolios, annual budgets, and real estate performance. This application is built using React and TypeScript, and it leverages modern web technologies for a seamless user experience.

## Features

- **Dashboard**: Provides an overview of your financial data, including key metrics and visualizations.
- **Portfolio Management**: 
  - Track investment portfolios with real-time price updates from Yahoo Finance
  - Add investments using ISIN codes or ticker symbols
  - Automatic calculation of gains/losses based on current market prices
  - Support for stocks, ETFs, crypto trusts, bonds, and more
  - One-click price refresh to get latest market data
- **Budgeting**: Users can create and manage their annual budgets, helping them to stay on track with their financial goals.
- **Real Estate Tracking**: Offers insights into real estate investments, including performance metrics and returns.

### 🆕 Real-Time Stock Prices

The application now integrates with **Yahoo Finance** to provide real-time stock and ETF prices:

- Enter just the **ISIN** (e.g., `US0378331005`) or **ticker** (e.g., `AAPL`)
- Specify the **number of shares** and **purchase price**
- The app automatically fetches the **current market price**
- View real-time gains/losses and portfolio performance
- Prices update on page load (F5) or via the "Refresh Prices" button

📖 See [QUICK_START.md](./QUICK_START.md) and [YAHOO_FINANCE_GUIDE.md](./YAHOO_FINANCE_GUIDE.md) for detailed guides.

## Technologies Used

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: A superset of JavaScript that adds static types, enhancing code quality and maintainability.
- **Vite**: A modern build tool that provides a fast development environment.
- **CSS**: For styling the application.

## Getting Started

To get started with the project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd my-finance-web
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.