import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Calendar, Loader2, Info, AlertTriangle, CloudRain } from 'lucide-react';
import { fetchWeather } from './services/weatherService';
import { ViewMode, WeatherResponse } from './types';
import { WeatherChart } from './components/WeatherChart';
import { ForecastCard } from './components/ForecastCard';

const App: React.FC = () => {
  const [location, setLocation] = useState<string>('正在定位...');
  const [inputLocation, setInputLocation] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.WEEK);
  const [weatherData, setWeatherData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchWeather = useCallback(async (loc: string, mode: ViewMode, coords?: { lat: number; lon: number }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(loc, mode, coords);
      setWeatherData(data);
      if (data.location) {
        setLocation(data.location);
        if (!loc && coords) {
             // If we searched by coords, update the input/display with the found name
             setInputLocation(data.location);
        }
      }
    } catch (err) {
      setError("无法获取天气数据，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load with Geolocation
  useEffect(() => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleFetchWeather('', ViewMode.WEEK, { lat: latitude, lon: longitude });
        },
        (err) => {
          console.warn("Geolocation permission denied or failed, defaulting to Beijing", err);
          setLocation('北京');
          setInputLocation('北京');
          handleFetchWeather('北京', ViewMode.WEEK);
        }
      );
    } else {
      setLocation('北京');
      setInputLocation('北京');
      handleFetchWeather('北京', ViewMode.WEEK);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLocation.trim()) {
      setLocation(inputLocation);
      handleFetchWeather(inputLocation, viewMode);
    }
  };

  const handleModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    handleFetchWeather(location, mode);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 p-4 md:p-8 flex flex-col items-center">
      
      {/* Header / Search */}
      <div className="w-full max-w-5xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
            <CloudRain className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
            智能天气助手
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="relative w-full md:w-96 group">
          <input
            type="text"
            value={inputLocation}
            onChange={(e) => setInputLocation(e.target.value)}
            placeholder="输入城市 (例如: 上海, 纽约)"
            className="w-full bg-slate-800/50 border border-slate-700 text-slate-100 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all group-hover:bg-slate-800"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-full hover:bg-blue-500 transition-colors"
          >
            <Search className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-5xl space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex justify-center md:justify-start">
          <div className="bg-slate-800/50 p-1 rounded-xl inline-flex gap-1 border border-slate-700/50">
            {[
              { id: ViewMode.WEEK, label: '本周预报' },
              { id: ViewMode.MONTH, label: '当月趋势' },
              { id: ViewMode.YEAR, label: '年度气候' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleModeChange(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  viewMode === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
              <p className="animate-pulse">正在查询 Gemini 实时数据...</p>
              {location === '正在定位...' && <p className="text-xs text-slate-500">正在尝试获取您的位置...</p>}
            </div>
          ) : error ? (
            <div className="h-[400px] flex flex-col items-center justify-center text-red-400 bg-red-900/10 rounded-2xl border border-red-900/30">
              <Info className="w-10 h-10 mb-2" />
              <p>{error}</p>
            </div>
          ) : weatherData ? (
            <div className="space-y-6 animate-fade-in">
              
              {/* Alert Banner */}
              {weatherData.alerts && weatherData.alerts.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/50 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                  <div className="p-2 bg-orange-500/20 rounded-full shrink-0">
                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-400 mb-1">
                      灾害预警: {weatherData.alerts.map(a => a.title).join(', ')}
                    </h3>
                    {weatherData.alerts.map((alert, idx) => (
                      <p key={idx} className="text-orange-200/80 text-sm mb-1">
                        <span className="font-semibold px-1.5 py-0.5 bg-orange-900/50 rounded text-xs mr-2 border border-orange-500/30">{alert.level || '警告'}</span>
                        {alert.description}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary Section */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl">
                    <MapPin className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100 mb-2">
                      {weatherData.location}
                      <span className="text-slate-500 font-normal text-base ml-2">
                        {viewMode === ViewMode.WEEK ? '近期预报' : viewMode === ViewMode.MONTH ? '本月趋势' : '年度气候'}
                      </span>
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                      {weatherData.summary}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chart Section - Climograph */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 md:p-6 shadow-lg backdrop-blur-sm">
                 <h3 className="text-slate-300 font-medium mb-4 pl-2 border-l-4 border-blue-500">
                   气温与降水趋势
                 </h3>
                 <WeatherChart data={weatherData.data} />
              </div>

              {/* Cards Grid */}
              <div>
                <h3 className="text-slate-300 font-medium mb-4 pl-2 border-l-4 border-teal-500">
                  详细数据
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {weatherData.data.map((item, idx) => (
                    <ForecastCard key={idx} item={item} />
                  ))}
                </div>
              </div>

              {/* Sources / Grounding */}
              {weatherData.groundingSources && weatherData.groundingSources.length > 0 && (
                <div className="mt-8 pt-4 border-t border-slate-800">
                  <p className="text-xs text-slate-500 mb-2 font-semibold uppercase tracking-wider">数据来源</p>
                  <ul className="space-y-1">
                    {weatherData.groundingSources.map((source, idx) => (
                      <li key={idx}>
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 hover:underline truncate block max-w-full"
                        >
                          {source.title || source.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default App;
