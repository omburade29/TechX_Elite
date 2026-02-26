import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CloudSun, 
  ShoppingCart, 
  AlertTriangle, 
  ChevronRight, 
  ArrowLeft, 
  Languages, 
  Share2, 
  TrendingUp, 
  MapPin, 
  Calendar,
  CheckCircle2,
  Info,
  Thermometer,
  CloudRain,
  Sun,
  Wind
} from 'lucide-react';
import { Language, LocationData, MandiPrice, HarvestPrediction, Crop } from './types';
import { LANGUAGES, CROPS, STATES_DISTRICTS, PRESERVATION_ACTIONS, TRANSLATIONS } from './constants';
import { getFarmInsights, getDistrictInfo } from './services/geminiService';

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const [step, setStep] = useState<'home' | 'loading' | 'dashboard'>('home');
  const [location, setLocation] = useState<LocationData>({ village: '', district: '', state: '' });
  const [crop, setCrop] = useState<string>('');
  const [insights, setInsights] = useState<any>(null);
  const [marketWatch, setMarketWatch] = useState<any[]>([]);
  const [districtInfo, setDistrictInfo] = useState<{ villages: string[], famousCrops: string[] }>({ villages: [], famousCrops: [] });
  const [mandiSort, setMandiSort] = useState<'nearest' | 'price'>('price');

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (location.state && location.district) {
      const fetchDistrictData = async () => {
        const info = await getDistrictInfo(location.state, location.district, lang);
        setDistrictInfo(info);
      };
      fetchDistrictData();
    }
  }, [location.state, location.district, lang]);

  useEffect(() => {
    // Initial fetch for market watch on home page
    const fetchInitialData = async () => {
      try {
        const data = await getFarmInsights(
          { 
            village: location.village || 'Default', 
            district: location.district || 'Nagpur', 
            state: location.state || 'Maharashtra' 
          }, 
          'Wheat', 
          lang
        );
        setMarketWatch(data.marketWatch || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchInitialData();
  }, [lang, location.state, location.district]);

  const handleGetInfo = async () => {
    if (!location.state || !location.district || !crop) {
      alert("Please fill all details / कृपया सभी विवरण भरें");
      return;
    }
    setStep('loading');
    const data = await getFarmInsights(location, crop, lang);
    setInsights(data);
    setStep('dashboard');
  };

  const shareOnWhatsApp = () => {
    const text = `FarmLink AI Recommendations for ${crop}:\n- Harvest Window: ${insights.harvestPrediction.window}\n- Best Market: ${insights.marketRecommendations[0].mandi} (₹${insights.marketRecommendations[0].price}/quintal)\n- Storage Risk: ${insights.storageRisk}%`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };



  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 px-4 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <TrendingUp size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-emerald-800">FarmLink AI</h1>
        </div>
        <div className="flex gap-2">
          {LANGUAGES.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                lang === l.code 
                ? 'bg-emerald-600 text-white shadow-md scale-105' 
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero */}
              <div className="text-center space-y-3 py-6">
                <h2 className="text-4xl font-black text-emerald-900 leading-tight">
                  {t.heroTitle}
                </h2>
                <p className="text-stone-500 text-lg font-medium">
                  {t.heroSub}
                </p>
              </div>

              {/* Form */}
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-stone-100 space-y-6">
                <div className="space-y-4">
                  {/* State Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} /> {t.state}
                    </label>
                    <select
                      value={location.state}
                      onChange={(e) => setLocation({ ...location, state: e.target.value, district: '' })}
                      className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-xl font-semibold focus:border-emerald-500 focus:ring-0 transition-colors appearance-none"
                    >
                      <option value="">-- {t.state} --</option>
                      {Object.keys(STATES_DISTRICTS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* District Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} /> {t.district}
                    </label>
                    <select
                      value={location.district}
                      disabled={!location.state}
                      onChange={(e) => setLocation({ ...location, district: e.target.value })}
                      className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-xl font-semibold focus:border-emerald-500 focus:ring-0 transition-colors appearance-none disabled:opacity-50"
                    >
                      <option value="">-- {t.district} --</option>
                      {location.state && STATES_DISTRICTS[location.state].map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* Village Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} /> {t.village}
                    </label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder={t.village}
                        value={location.village}
                        onChange={(e) => setLocation({ ...location, village: e.target.value })}
                        className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-xl font-semibold focus:border-emerald-500 focus:ring-0 transition-colors"
                      />
                      {districtInfo.villages.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {districtInfo.villages.map((v, i) => (
                            <button
                              key={i}
                              onClick={() => setLocation({ ...location, village: v })}
                              className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Crop Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-400 uppercase tracking-wider flex items-center gap-2">
                      <ShoppingCart size={16} /> {t.cropName}
                    </label>
                    <div className="space-y-2">
                      <select
                        value={crop}
                        onChange={(e) => setCrop(e.target.value)}
                        className="w-full p-4 bg-stone-50 border-2 border-stone-100 rounded-2xl text-xl font-semibold focus:border-emerald-500 focus:ring-0 transition-colors appearance-none"
                      >
                        <option value="">-- {t.cropName} --</option>
                        {CROPS.map(c => <option key={c.id} value={c.name[lang]}>{c.name[lang]}</option>)}
                      </select>
                      {districtInfo.famousCrops.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          <span className="text-[10px] font-bold text-stone-400 uppercase w-full">District Famous:</span>
                          {districtInfo.famousCrops.map((c, i) => (
                            <button
                              key={i}
                              onClick={() => setCrop(c)}
                              className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold border border-orange-100 hover:bg-orange-100 transition-colors"
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleGetInfo}
                    className="flex-1 bg-emerald-600 text-white p-5 rounded-2xl text-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    {t.getInfo}
                  </button>
                </div>
              </div>

              {/* Market Watch (Live Prices) */}
              <div className="space-y-4">
                <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2 px-2">
                  <TrendingUp className="text-emerald-600" size={24} /> {t.marketWatch}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {(marketWatch.length > 0 ? marketWatch : [
                    { name: 'Wheat', price: 2450, trend: '+2.4%', mandi: 'Khanna' },
                    { name: 'Rice', price: 1980, trend: '-1.2%', mandi: 'Karnal' },
                    { name: 'Potato', price: 1540, trend: '+5.1%', mandi: 'Agra' },
                    { name: 'Cotton', price: 2100, trend: '+0.8%', mandi: 'Rajkot' },
                  ]).map((m, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex justify-between items-center">
                      <div>
                        <div className="text-xs font-bold text-stone-400 uppercase">{m.name}</div>
                        <div className="text-lg font-black text-stone-800">₹{m.price}</div>
                        {m.mandi && <div className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">📍 {m.mandi}</div>}
                      </div>
                      <div className={`text-xs font-bold px-2 py-1 rounded-lg ${m.trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {m.trend}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6"
            >
              <div className="relative">
                <div className="w-24 h-24 border-8 border-emerald-100 border-t-emerald-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CloudSun className="text-emerald-600 animate-bounce" size={32} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-emerald-900">AI Analysis in Progress...</h3>
                <p className="text-stone-500 font-medium">Fetching live Mandi prices & IMD Weather data</p>
              </div>
            </motion.div>
          )}

          {step === 'dashboard' && insights && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Back Button */}
              <button
                onClick={() => setStep('home')}
                className="flex items-center gap-2 text-stone-500 font-bold hover:text-emerald-600 transition-colors"
              >
                <ArrowLeft size={20} /> {t.back}
              </button>

              {/* Top Suggestions Section */}
              <section className="bg-emerald-900 rounded-3xl p-6 shadow-xl text-white space-y-4">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-400" size={24} /> {t.topSuggestions}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {[...insights.marketRecommendations]
                    .sort((a, b) => {
                      // Simple score: higher price is better, lower distance is better
                      // We can use profit as a proxy if it's already calculated, 
                      // but let's do a custom balance
                      const scoreA = a.price / (a.distance + 10);
                      const scoreB = b.price / (b.distance + 10);
                      return scoreB - scoreA;
                    })
                    .slice(0, 3)
                    .map((m: MandiPrice, idx: number) => (
                      <div key={idx} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-black text-sm">
                            {idx + 1}
                          </div>
                          <div>
                            <div className="font-black text-lg">{m.mandi}</div>
                            <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">{m.distance} km away</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-black text-emerald-400">₹{m.price}</div>
                          <div className="text-[10px] font-bold uppercase opacity-60">Best Value</div>
                        </div>
                      </div>
                    ))}
                </div>
              </section>

              {/* Harvest Prediction */}
              <section className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <Calendar className="text-emerald-600" size={24} /> {t.harvestWindow}
                  </h3>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold">
                    AI Predicted
                  </span>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100">
                  <div className="text-3xl font-black text-emerald-700 mb-2">
                    {insights.harvestPrediction.window}
                  </div>
                  <div className="flex items-start gap-2 text-emerald-800 font-medium">
                    <Info size={18} className="mt-1 flex-shrink-0" />
                    <p>{insights.harvestPrediction.reason}</p>
                  </div>
                </div>
              </section>

              {/* Weather Forecast */}
              <section className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-4">
                <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2">
                  <CloudSun className="text-blue-500" size={24} /> {t.weatherForecast}
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {insights.weatherForecast.map((w: any, idx: number) => (
                    <div key={idx} className="flex flex-col items-center p-2 bg-stone-50 rounded-xl border border-stone-100 text-center">
                      <span className="text-xs font-bold text-stone-400 uppercase">{w.day}</span>
                      <div className="my-1">
                        {w.condition.toLowerCase().includes('rain') ? <CloudRain size={20} className="text-blue-400" /> : 
                         w.condition.toLowerCase().includes('cloud') ? <CloudSun size={20} className="text-stone-400" /> : 
                         <Sun size={20} className="text-orange-400" />}
                      </div>
                      <span className="text-sm font-black text-stone-700">{w.temp}°</span>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-start gap-2 text-blue-800 text-sm font-medium">
                    <Info size={16} className="mt-0.5 flex-shrink-0" />
                    <p><span className="font-bold">{t.advice}:</span> {insights.weatherForecast[0].advice}</p>
                  </div>
                </div>
              </section>

              {/* Market Recommendations */}
              <section className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <ShoppingCart className="text-orange-500" size={24} /> {t.bestMarkets}
                  </h3>
                  <div className="flex gap-1 bg-stone-100 p-1 rounded-xl">
                    <button 
                      onClick={() => setMandiSort('price')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${mandiSort === 'price' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}
                    >
                      Price
                    </button>
                    <button 
                      onClick={() => setMandiSort('nearest')}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${mandiSort === 'nearest' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}
                    >
                      Nearest
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {[...insights.marketRecommendations]
                    .sort((a, b) => mandiSort === 'price' ? b.price - a.price : a.distance - b.distance)
                    .map((m: MandiPrice, idx: number) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-2xl border-2 transition-all ${idx === 0 ? 'border-orange-200 bg-orange-50' : 'border-stone-50 bg-stone-50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-2xl mr-2">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '📍'}</span>
                          <span className="text-xl font-black text-stone-800">{m.mandi}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-emerald-700">₹{m.price}</div>
                          <div className="text-xs font-bold text-stone-400 uppercase tracking-tighter">per quintal</div>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-stone-200/50">
                        <div className="text-sm font-bold text-stone-500">{m.distance} km {t.distance}</div>
                        <div className="text-lg font-black text-orange-600">+{t.profit}: ₹{m.profit.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Storage Risk */}
              <section className="bg-white rounded-3xl p-6 shadow-lg border border-stone-100 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black text-emerald-900 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={24} /> {t.storageRisk}
                  </h3>
                  <div className={`text-2xl font-black ${insights.storageRisk > 50 ? 'text-red-600' : insights.storageRisk > 20 ? 'text-orange-500' : 'text-emerald-600'}`}>
                    {insights.storageRisk}%
                  </div>
                </div>

                {/* Risk Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-stone-400 uppercase">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <div className="h-4 w-full bg-stone-100 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000" 
                      style={{ width: `${Math.min(insights.storageRisk, 20)}%` }}
                    />
                    <div 
                      className="h-full bg-orange-500 transition-all duration-1000" 
                      style={{ width: `${Math.max(0, Math.min(insights.storageRisk - 20, 30))}%` }}
                    />
                    <div 
                      className="h-full bg-red-500 transition-all duration-1000" 
                      style={{ width: `${Math.max(0, insights.storageRisk - 50)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider">{t.preservation}</h4>
                  {PRESERVATION_ACTIONS.map((action, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                      <div>
                        <div className="font-bold text-stone-800">{action.name[lang]}</div>
                        <div className="text-xs font-bold text-emerald-600">{action.effectiveness}% {t.effective}</div>
                      </div>
                      <div className="text-lg font-black text-stone-700">₹{action.cost}</div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Share Button */}
              <button
                onClick={shareOnWhatsApp}
                className="w-full bg-emerald-600 text-white p-5 rounded-2xl text-xl font-black shadow-lg flex items-center justify-center gap-3 hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <Share2 size={24} /> {t.share}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-around items-center z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <button onClick={() => setStep('home')} className={`flex flex-col items-center gap-1 ${step === 'home' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <MapPin size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">{t.village}</span>
        </button>
        <button onClick={() => step === 'dashboard' && setStep('dashboard')} className={`flex flex-col items-center gap-1 ${step === 'dashboard' ? 'text-emerald-600' : 'text-stone-400'}`}>
          <TrendingUp size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Profit</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-stone-400">
          <Info size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Help</span>
        </button>
      </nav>
    </div>
  );
}
