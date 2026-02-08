export interface WeatherDataPoint {
  date: string;       // "2023-10-27" or "January"
  label: string;      // Display label e.g., "周一", "1月"
  tempHigh: number;
  tempLow: number;
  precipitation?: number; // mm
  condition: string;  // e.g., "Sunny", "Rainy"
  humidity?: number;
  description?: string;
}

export interface WeatherAlert {
  title: string;
  level: 'Yellow' | 'Orange' | 'Red' | 'Unknown';
  description: string;
}

export interface WeatherResponse {
  location: string;
  summary: string;
  alerts?: WeatherAlert[];
  data: WeatherDataPoint[];
  groundingSources?: { uri: string; title: string }[];
}

export enum ViewMode {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  YEAR = 'YEAR',
}

export interface SearchParams {
  location: string;
  mode: ViewMode;
}
