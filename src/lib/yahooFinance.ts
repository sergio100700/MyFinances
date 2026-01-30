// Yahoo Finance integration for real-time stock prices
// Uses Yahoo Finance v8 API endpoints with CORS proxy

import { fetchStockPrice as fetchPriceFromService } from './stockPriceService';

interface YahooQuoteResponse {
  chart: {
    result: Array<{
      meta: {
        regularMarketPrice: number;
        symbol: string;
        currency: string;
      };
    }>;
    error: null | { code: string; description: string };
  };
}

/**
 * Converts ISIN to Yahoo Finance ticker symbol
 * This is a simplified version - in production you'd use a proper ISIN to ticker lookup service
 */
export const isinToTicker = (isin: string): string => {
  // Remove any whitespace
  const cleanIsin = isin.trim().toUpperCase();
  
  // Common patterns for US stocks (ISIN starts with US)
  if (cleanIsin.startsWith('US')) {
    // For US stocks, Yahoo often uses the base ticker
    // Example: US0378331005 (Apple) -> AAPL
    // This is a placeholder - you'd need a proper mapping service
    return cleanIsin; // Will try to use as-is
  }
  
  // For other markets, append exchange suffix
  // Example: IE00B4L5Y983 (iShares Core MSCI World) -> IWDA.AS or SWDA.L
  
  return cleanIsin;
};

/**
 * Fetches current price for a security from Yahoo Finance
 * @param isin - ISIN code or ticker symbol
 * @returns Current price or null if not found
 */
export const fetchCurrentPrice = async (isin: string): Promise<number | null> => {
  try {
    // Convert ISIN to ticker if needed
    const ticker = getTickerFromISIN(isin);
    
    // Use the new service with multiple fallbacks
    const price = await fetchPriceFromService(ticker);
    
    return price;
  } catch (error) {
    console.error(`Error fetching price for ${isin}:`, error);
    return null;
  }
};

/**
 * Fetches prices for multiple securities in parallel
 * @param isins - Array of ISIN codes or ticker symbols
 * @returns Map of ISIN to current price
 */
export const fetchMultiplePrices = async (
  isins: string[]
): Promise<Map<string, number | null>> => {
  const priceMap = new Map<string, number | null>();
  
  // Fetch all prices in parallel using the service
  const promises = isins.map(async (isin) => {
    const price = await fetchCurrentPrice(isin);
    priceMap.set(isin, price);
  });

  await Promise.all(promises);
  
  return priceMap;
};

/**
 * Common ISIN to ticker mappings for popular securities
 * This helps avoid API calls for well-known securities
 */
export const ISIN_TICKER_MAP: Record<string, string> = {
  // US Stocks
  'US0378331005': 'AAPL',   // Apple
  'US5949181045': 'MSFT',   // Microsoft
  'US02079K3059': 'GOOGL',  // Alphabet
  'US0231351067': 'AMZN',   // Amazon
  'US88160R1014': 'TSLA',   // Tesla
  'US30303M1027': 'META',   // Meta
  'US67066G1040': 'NVDA',   // NVIDIA
  
  // Popular ETFs
  'US78462F1030': 'SPY',    // SPDR S&P 500
  'US4642872349': 'IVV',    // iShares Core S&P 500
  'US9229083632': 'VOO',    // Vanguard S&P 500
  'US4642874329': 'IWDA',   // iShares Core MSCI World (use ticker)
  'IE00B4L5Y983': 'IWDA.AS',// iShares Core MSCI World (Amsterdam)
  'IE00B3RBWM25': 'VWCE.DE',// Vanguard FTSE All-World
};

/**
 * Gets Yahoo Finance ticker from ISIN using the mapping or conversion
 */
export const getTickerFromISIN = (isin: string): string => {
  const cleanIsin = isin.trim().toUpperCase();
  return ISIN_TICKER_MAP[cleanIsin] || cleanIsin;
};

/**
 * Alternative API using YH Finance (free, CORS-friendly)
 * This is a fallback when Yahoo Finance direct access fails
 */
export const fetchPriceFromYHFinance = async (symbol: string): Promise<number | null> => {
  try {
    const url = `https://yfapi.net/v6/finance/quote?symbols=${symbol}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.quoteResponse?.result?.[0]?.regularMarketPrice) {
      return data.quoteResponse.result[0].regularMarketPrice;
    }
    
    return null;
  } catch (error) {
    console.error('YH Finance API error:', error);
    return null;
  }
};
