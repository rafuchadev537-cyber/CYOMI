import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  TrendingUp, 
  RefreshCcw, 
  AlertCircle, 
  Loader2,
  ChevronDown,
  Info
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceArea
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { currencyService } from '../services/currencyService';
import { SUPPORTED_CURRENCIES, HistoricalRate } from '../types/currency';
import { cn } from '../lib/utils';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>('1000');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [rates, setRates] = useState<{ [key: string]: number }>({});
  const [historicalData, setHistoricalData] = useState<HistoricalRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial rates
  useEffect(() => {
    fetchRates();
  }, [fromCurrency]);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await currencyService.getLatestRates(fromCurrency);
      setRates(data.conversion_rates);
      setIsDemoMode(!!data.is_demo);
      if (data.conversion_rates[toCurrency]) {
        setResult(Number(amount.replace(/[^0-9.]/g, '')) * data.conversion_rates[toCurrency]);
      }
    } catch (err) {
      setError('Unable to reach market services.');
      setIsDemoMode(true); // Fallback to demo mode visually
    } finally {
      setLoading(false);
    }
  };

  const handleReverse = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleCompare = async () => {
    setIsComparing(!isComparing);
    if (!isComparing) {
      setChartLoading(true);
      try {
        const data = await currencyService.getHistoricalRates(fromCurrency, toCurrency, 7);
        setHistoricalData(data);
      } catch (err) {
        setError('Historical data unavailable');
      } finally {
        setChartLoading(false);
      }
    }
  };

  useEffect(() => {
    const cleanAmount = amount.replace(/[^0-9.]/g, '');
    if (rates[toCurrency] && !isNaN(Number(cleanAmount))) {
      setResult(Number(cleanAmount) * rates[toCurrency]);
    }
  }, [amount, toCurrency, rates]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* XE-STYLE HEADER */}
      <header className="bg-xe-navy text-white py-4 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <div className="bg-xe-blue text-white p-1 rounded font-bold text-xl px-3 italic">XE</div>
            <span className="font-semibold tracking-tight text-lg hidden sm:inline">Global Currency</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-sm font-medium opacity-80">
            <a href="#" className="hover:opacity-100 transition-opacity">Convert</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Send Money</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Charts</a>
            <a href="#" className="hover:opacity-100 transition-opacity">Tools</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:flex">
             <div className={cn("w-2 h-2 rounded-full", isDemoMode ? "bg-amber-400" : "bg-green-500")} />
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
               {isDemoMode ? "Limited Mode" : "Live Market"}
             </span>
          </div>
        </div>
      </header>

      {/* SUB-HEADER / HERO AREA */}
      <div className="bg-xe-navy h-48 w-full absolute top-16 left-0 -z-10" />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pt-12 pb-24">
        <h2 className="text-white text-3xl font-bold text-center mb-8">
          The World's Trusted Currency Authority
        </h2>

        {/* CONVERTER CARD */}
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="grid lg:grid-cols-[1fr,auto,1fr] gap-8 items-end">
              {/* FROM SECTION */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Amount</label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-lg p-4 text-xl font-semibold focus:border-xe-blue outline-none transition-colors"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-300">
                    {fromCurrency}
                  </div>
                </div>
              </div>

              {/* SWAP BUTTON */}
              <div className="flex justify-center pb-2">
                <button 
                  onClick={handleReverse}
                  className="p-3 bg-white border border-gray-200 rounded-full text-xe-blue hover:shadow-lg transition-all transform active:scale-95"
                >
                  <ArrowLeftRight size={24} />
                </button>
              </div>

              {/* CURRENCY SELECTORS */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">From</label>
                  <select 
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-lg p-4 font-bold appearance-none bg-white cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">To</label>
                  <select 
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-lg p-4 font-bold appearance-none bg-white cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* RESULTS AREA */}
            <div className="mt-12 flex flex-col md:flex-row md:items-center justify-between gap-8 pt-8 border-t border-gray-50">
              <div className="space-y-1">
                <div className="text-gray-500 font-medium">
                  {Number(amount).toLocaleString()} {fromCurrency} =
                </div>
                <div className="text-4xl md:text-5xl font-bold text-xe-navy tracking-tight">
                  {loading ? (
                    <span className="opacity-30">Converting...</span>
                  ) : (
                    <>
                      {result?.toFixed(2)} <span className="text-2xl font-semibold opacity-60">{toCurrency}</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-400 font-medium pt-2">
                  1 {fromCurrency} = {rates[toCurrency]?.toFixed(6)} {toCurrency}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={handleCompare}
                  className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-8 py-4 rounded-lg font-bold transition-colors"
                >
                  <TrendingUp size={18} />
                  View Historical Chart
                </button>
                <button className="flex items-center justify-center gap-2 bg-xe-blue text-white hover:bg-blue-600 px-8 py-4 rounded-lg font-bold shadow-lg shadow-xe-blue/20 transition-all">
                  Send Money
                </button>
              </div>
            </div>
          </div>

          {/* HISTORICAL CHART DRAWER */}
          <AnimatePresence>
            {isComparing && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-gray-50 border-t border-gray-100 overflow-hidden"
              >
                <div className="p-8 md:p-12">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="text-xe-blue" />
                      7-Day Trend: {fromCurrency} to {toCurrency}
                    </h3>
                    {chartLoading && <Loader2 className="animate-spin text-xe-blue" size={20} />}
                  </div>

                  <div className="h-[300px] w-full">
                    {historicalData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historicalData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ccc" />
                          <XAxis dataKey="date" hide />
                          <YAxis domain={['auto', 'auto']} hide />
                          <Tooltip />
                          <Line type="monotone" dataKey="rate" stroke="#1a8dff" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-400 italic">
                        {chartLoading ? 'Fetching market data...' : 'No historical data available for this pair.'}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FEEDBACK / INFO */}
        <div className="mt-8 flex items-start gap-3 text-sm text-gray-500 bg-white/50 p-4 rounded-lg">
          <Info size={20} className="shrink-0 text-xe-blue" />
          <p>
            We use mid-market rates for our Converter. This is for informational purposes only. You won’t receive this rate when sending money. 
            <a href="#" className="text-xe-blue underline ml-2">Check send rates</a>
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between gap-12">
          <div className="space-y-4">
            <div className="font-bold text-xl italic text-xe-navy">XE</div>
            <div className="text-sm text-gray-400">© 1995-2024 XE.com Inc.</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="font-bold text-gray-700 uppercase text-xs tracking-widest">Products</div>
              <ul className="text-sm space-y-2 text-gray-500 font-medium">
                <li>Currency Charts</li>
                <li>Rate Alerts</li>
                <li>Currency API</li>
              </ul>
            </div>
            {/* Additional columns omitted for brevity */}
          </div>
        </div>
      </footer>
    </div>
  );
}
