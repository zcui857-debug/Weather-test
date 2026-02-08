import { GoogleGenAI } from "@google/genai";
import { ViewMode, WeatherResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to extract JSON from markdown code blocks
const extractJson = (text: string): any => {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("JSON parse error:", e);
      return null;
    }
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
};

export const fetchWeather = async (
  location: string, 
  mode: ViewMode, 
  coords?: { lat: number; lon: number }
): Promise<WeatherResponse> => {
  const modelId = 'gemini-3-flash-preview';
  
  let prompt = "";
  const currentDate = new Date().toLocaleDateString('zh-CN');
  
  const locationContext = coords 
    ? `Latitude: ${coords.lat}, Longitude: ${coords.lon} (Identify the city name automatically)` 
    : `Location: ${location}`;

  const commonJsonStructure = `
    Return a VALID JSON object in the following format inside a markdown code block:
    {
      "location": "City Name (e.g. Beijing)",
      "summary": "A brief summary in Chinese.",
      "alerts": [
        {
          "title": "Alert Title (e.g. Typhoon Warning)",
          "level": "Red/Orange/Yellow/Unknown",
          "description": "Short impact description in Chinese"
        }
      ] (Optional, only if active alerts exist),
      "data": [
        {
          "date": "YYYY-MM-DD",
          "label": "Display Label",
          "tempHigh": number (Celsius),
          "tempLow": number (Celsius),
          "precipitation": number (Precipitation in mm, estimate if needed),
          "condition": "Short condition in Chinese",
          "description": "Short tip in Chinese"
        }
      ]
    }
  `;

  if (mode === ViewMode.WEEK) {
    prompt = `
      Current Date: ${currentDate}.
      I need the weather forecast for: ${locationContext}.
      Target: Next 7 days.
      Please use Google Search to find the most accurate up-to-date forecast.
      IMPORTANT: Check for any active SEVERE WEATHER ALERTS (Typhoon, Heatwave, Blizzard, Heavy Rain, etc.) and include them in the 'alerts' field.
      Include precipitation amounts (mm).
      
      ${commonJsonStructure}
    `;
  } else if (mode === ViewMode.MONTH) {
    prompt = `
      Current Date: ${currentDate}.
      I need weather data for: ${locationContext}.
      Target: Current Month (Forecast + Historical for passed days).
      If daily data is sparse, provide a representative sample (at least 15-20 days).
      Please use Google Search.
      Include precipitation amounts (mm).
      
      ${commonJsonStructure}
    `;
  } else if (mode === ViewMode.YEAR) {
    prompt = `
      I need typical yearly climate data (monthly averages) for: ${locationContext}.
      Target: 12 Months.
      Use Google Search to ensure accuracy.
      Include average precipitation (mm) for each month.
      
      ${commonJsonStructure}
    `;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const jsonData = extractJson(text);
    
    // Extract grounding sources
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web ? { uri: c.web.uri, title: c.web.title } : null)
      .filter((c: any) => c !== null);

    if (!jsonData) {
      throw new Error("Failed to parse weather data from AI response.");
    }

    return {
      ...jsonData,
      groundingSources: sources,
    };

  } catch (error) {
    console.error("Weather fetch failed:", error);
    throw error;
  }
};
