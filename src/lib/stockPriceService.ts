// Stock Price Service with multiple data sources
// This service attempts to fetch stock prices from various sources with fallbacks

interface PriceSource {
  name: string;
  fetch: (symbol: string) => Promise<number | null>;
}

/**
 * Fetch price using AllOrigins proxy + Yahoo Finance
 */
const fetchFromYahooViaProxy = async (symbol: string): Promise<number | null> => {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;
    
    const response = await fetch(proxyUrl, { method: 'GET' });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return data.chart.result[0].meta.regularMarketPrice;
    }
    
    return null;
  } catch (error) {
    console.warn('Yahoo via proxy failed:', error);
    return null;
  }
};

/**
 * Fetch price using CORS proxy alternative
 */
const fetchFromYahooViaCorsAnywhere = async (symbol: string): Promise<number | null> => {
  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(yahooUrl)}`;
    
    const response = await fetch(proxyUrl, { method: 'GET' });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data?.chart?.result?.[0]?.meta?.regularMarketPrice) {
      return data.chart.result[0].meta.regularMarketPrice;
    }
    
    return null;
  } catch (error) {
    console.warn('Yahoo via CORS anywhere failed:', error);
    return null;
  }
};

/**
 * Fetch price from Finnhub (requires free API key)
 * Sign up at https://finnhub.io/ for free tier
 */
const fetchFromFinnhub = async (symbol: string): Promise<number | null> => {
  try {
    // Get API key from localStorage or environment
    const apiKey = localStorage.getItem('finnhub_api_key');
    if (!apiKey) return null;
    
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data?.c && data.c > 0) {
      return data.c; // current price
    }
    
    return null;
  } catch (error) {
    console.warn('Finnhub failed:', error);
    return null;
  }
};

/**
 * Fetch price from Twelve Data (free tier available)
 */
const fetchFromTwelveData = async (symbol: string): Promise<number | null> => {
  try {
    const apiKey = localStorage.getItem('twelvedata_api_key');
    if (!apiKey) return null;
    
    const url = `https://api.twelvedata.com/price?symbol=${symbol}&apikey=${apiKey}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    if (data?.price) {
      return parseFloat(data.price);
    }
    
    return null;
  } catch (error) {
    console.warn('Twelve Data failed:', error);
    return null;
  }
};

// Priority order of data sources
const PRICE_SOURCES: PriceSource[] = [
  { name: 'Yahoo Finance (AllOrigins)', fetch: fetchFromYahooViaProxy },
  { name: 'Yahoo Finance (CorsProxy)', fetch: fetchFromYahooViaCorsAnywhere },
  { name: 'Finnhub', fetch: fetchFromFinnhub },
  { name: 'Twelve Data', fetch: fetchFromTwelveData },
];

/**
 * Fetch stock price with automatic fallback to multiple sources
 * @param symbol - Stock ticker symbol
 * @returns Current price or null if all sources fail
 */
export const fetchStockPrice = async (symbol: string): Promise<number | null> => {
  const cleanSymbol = symbol.trim().toUpperCase();
  
  // Try each source in order until one succeeds
  for (const source of PRICE_SOURCES) {
    try {
      console.log(`Trying ${source.name} for ${cleanSymbol}...`);
      const price = await source.fetch(cleanSymbol);
      
      if (price !== null && price > 0) {
        console.log(`✓ Got price from ${source.name}: $${price}`);
        return price;
      }
    } catch (error) {
      console.warn(`${source.name} error:`, error);
      continue;
    }
  }
  
  console.error(`Failed to fetch price for ${cleanSymbol} from all sources`);
  return null;
};

/**
 * Fetch multiple stock prices in parallel
 * @param symbols - Array of stock ticker symbols
 * @returns Map of symbol to price
 */
export const fetchMultipleStockPrices = async (
  symbols: string[]
): Promise<Map<string, number | null>> => {
  const priceMap = new Map<string, number | null>();
  
  // Fetch all prices in parallel
  const promises = symbols.map(async (symbol) => {
    const price = await fetchStockPrice(symbol);
    priceMap.set(symbol, price);
  });

  await Promise.all(promises);
  
  return priceMap;
};

/**
 * Save API keys to localStorage
 */
export const saveApiKeys = (keys: { finnhub?: string; twelvedata?: string }) => {
  if (keys.finnhub) {
    localStorage.setItem('finnhub_api_key', keys.finnhub);
  }
  if (keys.twelvedata) {
    localStorage.setItem('twelvedata_api_key', keys.twelvedata);
  }
};

/**
 * Check if any API keys are configured
 */
export const hasApiKeys = (): boolean => {
  return !!(
    localStorage.getItem('finnhub_api_key') ||
    localStorage.getItem('twelvedata_api_key')
  );
};
