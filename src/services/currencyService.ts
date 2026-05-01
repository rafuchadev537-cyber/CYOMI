import { ExchangeRateResponse, HistoricalRate } from '../types/currency';

const API_KEY = (import.meta as any).env.VITE_EXCHANGE_RATE_API_KEY || '';
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}`;

// For historical data, we'll use the Frankfurter API as it's free and public
const FRANKFURTER_URL = 'https://api.frankfurter.app';

// Mock rates for when API is unavailable or key is missing
const MOCK_RATES: { [key: string]: number } = {
  USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 151.62, AUD: 1.52, 
  CAD: 1.35, CHF: 0.90, CNY: 7.23, INR: 83.31, BRL: 5.06,
  ZAR: 18.75, HKD: 7.83, NZD: 1.66
};

export const currencyService = {
  async getLatestRates(baseCode: string): Promise<ExchangeRateResponse> {
    // If no API key, return mock data immediately to avoid 403 errors
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
      console.warn('Using mock data: No API key provided.');
      return this.generateMockResponse(baseCode);
    }

    try {
      const response = await fetch(`${BASE_URL}/latest/${baseCode}`);
      if (!response.ok) {
        throw new Error('API Error');
      }
      return await response.json();
    } catch (error) {
      console.warn('Falling back to mock data due to network error.');
      return this.generateMockResponse(baseCode);
    }
  },

  generateMockResponse(baseCode: string): ExchangeRateResponse {
    const baseRate = MOCK_RATES[baseCode] || 1;
    const adjustedRates: { [key: string]: number } = {};
    
    Object.entries(MOCK_RATES).forEach(([code, rate]) => {
      adjustedRates[code] = rate / baseRate;
    });

    return {
      result: 'success',
      base_code: baseCode,
      conversion_rates: adjustedRates,
      time_last_update_utc: new Date().toUTCString(),
      is_demo: true // Custom flag for UI feedback
    } as any;
  },

  async getHistoricalRates(from: string, to: string, days: number = 7): Promise<HistoricalRate[]> {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const response = await fetch(
        `${FRANKFURTER_URL}/${startStr}..${endStr}?from=${from}&to=${to}`
      );
      
      if (!response.ok) {
        throw new Error('Historical data not available for this currency pair');
      }

      const data = await response.json();
      const rates: HistoricalRate[] = Object.entries(data.rates).map(([date, rateObj]: [string, any]) => ({
        date,
        rate: rateObj[to],
      }));

      return rates;
    } catch (error) {
      console.error('Error fetching historical rates:', error);
      // Return empty if failed so UI can handle it gracefully
      return [];
    }
  }
};
