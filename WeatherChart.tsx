import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { WeatherDataPoint } from '../types';

interface Props {
  data: WeatherDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 p-3 border border-slate-700 rounded-lg shadow-xl text-sm z-50">
        <p className="font-bold text-slate-200 mb-1">{label}</p>
        <p className="text-red-400">最高温: {payload.find((p: any) => p.dataKey === 'tempHigh')?.value}°C</p>
        <p className="text-blue-400">最低温: {payload.find((p: any) => p.dataKey === 'tempLow')?.value}°C</p>
        {payload.find((p: any) => p.dataKey === 'precipitation') && (
          <p className="text-blue-200">降水量: {payload.find((p: any) => p.dataKey === 'precipitation')?.value} mm</p>
        )}
        <p className="text-slate-400 mt-1 text-xs">{payload[0].payload.condition}</p>
      </div>
    );
  }
  return null;
};

export const WeatherChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full h-[320px] mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis 
            dataKey="label" 
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            scale="point"
            padding={{ left: 10, right: 10 }}
          />
          {/* Left Axis for Temperature */}
          <YAxis 
            yAxisId="left"
            stroke="#94a3b8" 
            tick={{ fontSize: 12 }}
            unit="°"
            label={{ value: '温度 (°C)', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#94a3b8', fontSize: 10 } }}
          />
          {/* Right Axis for Precipitation */}
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#60a5fa" 
            tick={{ fontSize: 12 }}
            unit="mm"
            label={{ value: '降水 (mm)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#60a5fa', fontSize: 10 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          
          <Bar 
            yAxisId="right"
            dataKey="precipitation" 
            name="降水量" 
            fill="#3b82f6" 
            barSize={20}
            fillOpacity={0.6}
            radius={[4, 4, 0, 0]}
          />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tempHigh"
            name="最高温"
            stroke="#f87171"
            strokeWidth={3}
            dot={{ r: 4, fill: '#f87171', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="tempLow"
            name="最低温"
            stroke="#60a5fa"
            strokeWidth={3}
            dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
