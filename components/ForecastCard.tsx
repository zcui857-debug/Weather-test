import React from 'react';
import { WeatherDataPoint } from '../types';
import { WeatherIcon } from './Icons';

interface Props {
  item: WeatherDataPoint;
}

export const ForecastCard: React.FC<Props> = ({ item }) => {
  return (
    <div className="bg-slate-800/50 hover:bg-slate-800 transition-colors border border-slate-700/50 rounded-xl p-4 flex flex-col items-center justify-between gap-3 group">
      <div className="text-slate-400 text-sm font-medium">{item.label}</div>
      <div className="p-3 bg-slate-700/30 rounded-full group-hover:scale-110 transition-transform">
        <WeatherIcon condition={item.condition} className="w-8 h-8 text-sky-400" />
      </div>
      <div className="text-center">
        <div className="text-lg font-bold text-slate-100">{item.tempHigh}°</div>
        <div className="text-sm text-slate-500">{item.tempLow}°</div>
      </div>
      <div className="text-xs text-center text-slate-400 truncate w-full px-1">
        {item.condition}
      </div>
    </div>
  );
};
