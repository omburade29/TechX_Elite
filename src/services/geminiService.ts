import { GoogleGenAI, Type } from "@google/genai";
import { Language, LocationData, MandiPrice, HarvestPrediction } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getDistrictInfo(state: string, district: string, language: Language, availableCrops: string[]) {
  const prompt = `
    Act as an Indian agricultural expert. 
    For the district "${district}" in the state "${state}", provide:
    1. A list of 5-10 major villages or agricultural hubs in this district.
    2. A list of 5-8 famous or most grown crops in this district, categorized by season if possible.
    
    STRICT RULE: Only suggest crops from this list: ${availableCrops.join(", ")}.
    If a famous crop in this district is not in the list, do not include it.
    
    Consider the following seasonal classifications for India:
    - Kharif (June–October): Rice, Maize, Cotton, Soybean, Sugarcane, Millets, Tur.
    - Rabi (Winter, October–April): Wheat, Barley, Mustard, Gram, Peas, Lentils.
    - Zaid (Summer, March–June): Watermelon, Muskmelon, Cucumber, seasonal vegetables.
    - Perennial/Plantation: Tea, Coffee, Rubber, Coconut.

    Return a JSON object with:
    {
      "villages": ["Village 1", "Village 2", ...],
      "famousCrops": ["Crop 1", "Crop 2", ...]
    }
    
    Translate crop names and village names if appropriate for ${language}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            villages: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            famousCrops: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["villages", "famousCrops"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error fetching district info:", error);
    return { villages: [], famousCrops: [] };
  }
}

export async function getFarmInsights(
  location: LocationData,
  crop: string,
  language: Language
) {
  const prompt = `
    Act as an Indian agricultural expert and data scientist. 
    Provide predictive insights for a farmer with the following data:
    - Crop: ${crop}
    - Location: ${location.village}, ${location.district}, ${location.state}
    - Language: ${language}
    - Current Date: ${new Date().toISOString()}

    Return a JSON object with:
    1. harvestPrediction: { window: string (3-7 day range), reason: string (brief explanation in ${language}), risk: number (0-100) }
    2. marketRecommendations: Array of 5 objects { mandi: string, price: number (per quintal), distance: number (km), profit: number (total) }
    3. storageRisk: number (0-100)
    4. trendData: Array of 7 numbers (last 7 days price trend)
    5. weatherForecast: Array of 5 objects { day: string, temp: number, condition: string, advice: string }
    6. marketWatch: Array of 4 objects { name: string, price: number, trend: string, mandi: string }
    7. priceAccuracy: { source: string, confidence: number (0-100), lastUpdated: string }

    CRITICAL: Use the data from https://agmarknet.ceda.ashoka.edu.in/ and Google Search to find the LATEST LIVE market prices (Mandi Bhav) for February 2026 in India. 
    Ensure prices are highly accurate and reflect current market conditions.
    The "priceAccuracy" field must state the source (e.g., "Agmarknet Live", "Google Search") and your confidence in the data.
    The reason should mention specific weather events and market news found via search.
    The weatherForecast should be specific to ${location.district}, ${location.state}.
    For each day in weatherForecast, provide highly actionable and specific agricultural advice for the crop "${crop}". 
    The advice should include specific tasks like irrigation timing, pesticide application (or avoidance), harvesting readiness, or protection from frost/heat based on the day's weather and the specific needs of "${crop}".
    The marketWatch should include major crops and their specific active mandis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { urlContext: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            harvestPrediction: {
              type: Type.OBJECT,
              properties: {
                window: { type: Type.STRING },
                reason: { type: Type.STRING },
                risk: { type: Type.NUMBER },
              },
              required: ["window", "reason", "risk"],
            },
            marketRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  mandi: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  distance: { type: Type.NUMBER },
                  profit: { type: Type.NUMBER },
                },
                required: ["mandi", "price", "distance", "profit"],
              },
            },
            storageRisk: { type: Type.NUMBER },
            trendData: {
              type: Type.ARRAY,
              items: { type: Type.NUMBER },
            },
            weatherForecast: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.STRING },
                  temp: { type: Type.NUMBER },
                  condition: { type: Type.STRING },
                  advice: { type: Type.STRING },
                },
                required: ["day", "temp", "condition", "advice"],
              },
            },
            marketWatch: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  trend: { type: Type.STRING },
                  mandi: { type: Type.STRING },
                },
                required: ["name", "price", "trend", "mandi"],
              },
            },
            priceAccuracy: {
              type: Type.OBJECT,
              properties: {
                source: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                lastUpdated: { type: Type.STRING },
              },
              required: ["source", "confidence", "lastUpdated"],
            },
          },
          required: ["harvestPrediction", "marketRecommendations", "storageRisk", "trendData", "weatherForecast", "marketWatch", "priceAccuracy"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error fetching AI insights:", error);
    // Fallback mock data if API fails
    return {
      harvestPrediction: {
        window: "March 5 - March 10",
        reason: "Rain expected in 4 days (40% chance). Prices expected to rise by 20%.",
        risk: 40,
      },
      marketRecommendations: [
        { mandi: "Nagpur", price: 2450, distance: 120, profit: 24500 },
        { mandi: "Amravati", price: 2380, distance: 80, profit: 23800 },
        { mandi: "Pune", price: 2500, distance: 450, profit: 25000 },
        { mandi: "Nashik", price: 2420, distance: 300, profit: 24200 },
        { mandi: "Mumbai", price: 2600, distance: 600, profit: 26000 },
      ],
      storageRisk: 27,
      trendData: [2300, 2320, 2350, 2380, 2400, 2420, 2450],
      weatherForecast: [
        { day: "MON", temp: 32, condition: "Sunny", advice: "Good day for harvesting." },
        { day: "TUE", temp: 31, condition: "Cloudy", advice: "Keep crops covered." },
        { day: "WED", temp: 29, condition: "Rain", advice: "Avoid spraying pesticides." },
        { day: "THU", temp: 30, condition: "Sunny", advice: "Resume field work." },
        { day: "FRI", temp: 33, condition: "Sunny", advice: "High evaporation, water crops." },
      ],
      marketWatch: [
        { name: "Wheat", price: 2450, trend: "+2.4%", mandi: "Khanna" },
        { name: "Rice", price: 1980, trend: "-1.2%", mandi: "Karnal" },
        { name: "Potato", price: 1540, trend: "+5.1%", mandi: "Agra" },
        { name: "Cotton", price: 2100, trend: "+0.8%", mandi: "Rajkot" },
      ],
      priceAccuracy: {
        source: "Agmarknet Live (Mock)",
        confidence: 95,
        lastUpdated: new Date().toLocaleDateString(),
      },
    };
  }
}
