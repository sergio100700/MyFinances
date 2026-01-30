export type SavingsRateMode = 'manual' | 'euribor' | 'ecbDeposit';

export interface RateResult {
  value: number;
  date?: string;
  source: SavingsRateMode;
}

const ECB_SERIES_KEYS: Record<Exclude<SavingsRateMode, 'manual'>, string> = {
  euribor: 'D.U2.EUR.RT.MM.EURIBOR3MD_.HSTA',
  ecbDeposit: 'D.U2.EUR.4F.KR.DFR.LEV',
};

const fetchJson = async (url: string): Promise<any> => {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const parseMaybeWrappedJson = async (response: Response): Promise<any> => {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const fetchJsonWithFallback = async (url: string): Promise<any> => {
  try {
    return await fetchJson(url);
  } catch {
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl, { method: 'GET' });
      if (!response.ok) throw new Error('allorigins get failed');
      const wrapped = await parseMaybeWrappedJson(response);
      if (wrapped?.contents) {
        return JSON.parse(wrapped.contents);
      }
      if (typeof wrapped === 'string') {
        return JSON.parse(wrapped);
      }
      return wrapped;
    } catch {
      try {
        const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
        return await fetchJson(proxyUrl);
      } catch {
        const proxyUrl = `https://r.jina.ai/http://sdw-wsrest.ecb.europa.eu/service/data/FM/`;
        const path = url.replace('https://sdw-wsrest.ecb.europa.eu/service/data/FM/', '');
        const response = await fetch(`${proxyUrl}${path}`);
        if (!response.ok) {
          throw new Error('jina fallback failed');
        }
        const text = await response.text();
        return JSON.parse(text);
      }
    }
  }
};

const parseLatestObservation = (data: any): { value: number; date?: string } | null => {
  const series = data?.dataSets?.[0]?.series;
  if (!series) return null;

  const seriesKey = Object.keys(series)[0];
  const observations = series?.[seriesKey]?.observations;
  if (!observations) return null;

  const obsKeys = Object.keys(observations)
    .map((k) => Number(k))
    .filter((k) => !Number.isNaN(k))
    .sort((a, b) => a - b);

  if (obsKeys.length === 0) return null;

  const lastKey = obsKeys[obsKeys.length - 1];
  const value = observations?.[lastKey]?.[0];
  if (typeof value !== 'number') return null;

  const date = data?.structure?.dimensions?.observation?.[0]?.values?.[lastKey]?.id;

  return { value, date };
};

const fetchEcbSeriesRate = async (
  seriesKey: string,
  source: SavingsRateMode
): Promise<RateResult | null> => {
  const url = `https://sdw-wsrest.ecb.europa.eu/service/data/FM/${seriesKey}?format=jsondata&lastNObservations=1`;
  try {
    const json = await fetchJsonWithFallback(url);
    const parsed = parseLatestObservation(json);
    if (!parsed) return null;
    return { value: parsed.value, date: parsed.date, source };
  } catch (error) {
    console.warn('ECB rate fetch failed:', error);
    return null;
  }
};

export const fetchSavingsRate = async (
  mode: SavingsRateMode
): Promise<RateResult | null> => {
  if (mode === 'manual') return null;

  const seriesKey = ECB_SERIES_KEYS[mode];
  if (!seriesKey) return null;

  return fetchEcbSeriesRate(seriesKey, mode);
};
