export type Language = 'en' | 'hi' | 'mr';

export interface LocationData {
  village: string;
  district: string;
  state: string;
}

export interface Crop {
  id: string;
  name: { [key in Language]: string };
}

export interface MandiPrice {
  mandi: string;
  price: number;
  distance: number;
  profit: number;
  rank: number;
}

export interface HarvestPrediction {
  window: string;
  reason: { [key in Language]: string };
  risk: number;
}

export interface PreservationAction {
  name: { [key in Language]: string };
  cost: number;
  effectiveness: number;
}
