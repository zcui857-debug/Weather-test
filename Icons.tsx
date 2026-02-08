import React from 'react';
import { Cloud, CloudRain, Sun, CloudSnow, CloudLightning, Wind, Thermometer, Calendar } from 'lucide-react';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = "w-6 h-6" }) => {
  const c = condition.toLowerCase();
  
  if (c.includes('雨') || c.includes('rain')) return <CloudRain className={className} />;
  if (c.includes('雪') || c.includes('snow')) return <CloudSnow className={className} />;
  if (c.includes('雷') || c.includes('storm')) return <CloudLightning className={className} />;
  if (c.includes('云') || c.includes('阴') || c.includes('cloud') || c.includes('overcast')) return <Cloud className={className} />;
  if (c.includes('风') || c.includes('wind')) return <Wind className={className} />;
  if (c.includes('晴') || c.includes('sun') || c.includes('clear')) return <Sun className={className} />;
  
  return <Sun className={className} />;
};
