
const CROP_DATA = {
  Wheat:     { shelf: 180, perishable: false, ideal_temp: '< 25°C',  moisture: '< 12%', msp: 2275, unit: 'quintal' },
  Rice:      { shelf: 120, perishable: false, ideal_temp: '< 30°C',  moisture: '< 14%', msp: 2183, unit: 'quintal' },
  Tomato:    { shelf: 7,   perishable: true,  ideal_temp: '10–15°C', moisture: 'N/A',   msp: 0,    unit: 'quintal' },
  Onion:     { shelf: 60,  perishable: false, ideal_temp: '< 30°C',  moisture: '< 70%', msp: 0,    unit: 'quintal' },
  Potato:    { shelf: 45,  perishable: false, ideal_temp: '4–10°C',  moisture: 'Low',   msp: 0,    unit: 'quintal' },
  Soybean:   { shelf: 90,  perishable: false, ideal_temp: '< 25°C',  moisture: '< 13%', msp: 4600, unit: 'quintal' },
  Cotton:    { shelf: 180, perishable: false, ideal_temp: 'Dry',     moisture: '< 8%',  msp: 6620, unit: 'quintal' },
  Sugarcane: { shelf: 2,   perishable: true,  ideal_temp: 'N/A',    moisture: 'High',   msp: 315,  unit: 'tonne'  },
  Maize:     { shelf: 60,  perishable: false, ideal_temp: '< 25°C',  moisture: '< 14%', msp: 2090, unit: 'quintal' },
};

/* ── MARKET DATABASE ─────────────────────────────────────────── */
/*
  Format per state: [ ['Mandi Name', 'Price Premium vs MSP', Base Distance km], ... ]
  List mandis best-first.
  Distance is added to farmer's actual mandi distance slider value in engine.
*/
const MARKET_DB = {
  Punjab:      [ ['Khanna Mandi', '+18%', 40],  ['Ludhiana APMC', '+14%', 65],   ['Amritsar Mandi', '+9%', 90]   ],
  Haryana:     [ ['Karnal Mandi', '+20%', 35],  ['Sirsa APMC', '+15%', 55],      ['Hisar Grain Mkt', '+10%', 80] ],
  Maharashtra: [ ['Pune Market Yard', '+22%', 50], ['Nashik APMC', '+17%', 70],  ['Mumbai APMC', '+25%', 130]    ],
  UP:          [ ['Agra Mandi', '+16%', 45],    ['Kanpur APMC', '+12%', 70],     ['Varanasi Grain', '+8%', 95]   ],
  MP:          [ ['Bhopal APMC', '+14%', 40],   ['Indore Mandi', '+19%', 60],    ['Jabalpur Market', '+10%', 85] ],
  Rajasthan:   [ ['Jaipur APMC', '+17%', 55],   ['Kota Mandi', '+13%', 75],      ['Jodhpur Market', '+9%', 100]  ],
  Bihar:       [ ['Patna Mandi', '+15%', 40],   ['Muzaffarpur APMC', '+11%', 65],['Gaya Market', '+8%', 90]      ],
  Karnataka:   [ ['KIADB Bengaluru', '+24%', 60],['Hubli APMC', '+16%', 80],     ['Mysore Mandi', '+12%', 70]    ],
  AP:          [ ['Kurnool APMC', '+18%', 50],  ['Guntur Market', '+20%', 65],   ['Vijayawada Mandi', '+15%', 80] ],
  Gujarat:     [ ['Ahmedabad APMC', '+21%', 45],['Rajkot Mandi', '+16%', 65],    ['Surat Market', '+13%', 90]    ],
};

/* ── PRICE SEASONALITY ───────────────────────────────────────── */
/*
  Adjustments added to the base monthly price index (0-100 scale).
  Index: 0 = This Month, 1 = Next Month, 2 = +2 Months, 3 = +3 Months
  Positive = prices usually go up in that month for this crop.
*/
const PRICE_SEASONALITY = {
  Wheat:     [-5,  5,  15,  25],   // rises after harvest season ends
  Rice:      [-3,  4,  10,  18],
  Tomato:    [ 0, 15, -10, -20],   // volatile — glut after peak season
  Onion:     [ 5, 10,  20,  -5],   // rises sharply before monsoon
  Potato:    [ 2,  6,  12,   8],
  Soybean:   [-4,  3,  10,  20],
  Cotton:    [ 0,  5,  12,  18],
  Sugarcane: [ 0,  0,   0,   0],   // fixed rate, MSP driven
  Maize:     [-2,  4,  10,  15],
};

/* ── PRESERVATION ACTION DATABASE ───────────────────────────── */
/*
  Provide crop-specific actions where relevant.
  Falls back to 'Default' if crop not listed here.

  Each action object:
    rank      = display order (1 = best)
    title     = short action name
    eff       = effectiveness claim
    cost      = cost range in plain language
    costClass = CSS class for colour (cost-free / cost-low / cost-medium / cost-high)
    detail    = plain-language explanation for farmer
*/
const PRESERVE_ACTIONS = {

  Tomato: [
    {
      rank: 1,
      title: 'Shade Netting / Chhaya Jaal',
      eff: 'Reduces heat damage by 35%',
      cost: 'Free',
      costClass: 'cost-free',
      detail: 'Use dhoti/sari cloth as cover over crates in field itself. Keeps temp 4–6°C lower.',
    },
    {
      rank: 2,
      title: 'Sell within 2 days to nearest buyer',
      eff: 'Prevents 80% spoilage',
      cost: 'Free',
      costClass: 'cost-free',
      detail: 'Contact local hotel or vegetable reseller directly. Avoid mandi travel if more than 30 km.',
    },
    {
      rank: 3,
      title: 'Evaporative Cooling (Matka / Wet Sack)',
      eff: 'Extends shelf by 3–5 days',
      cost: '₹50–200',
      costClass: 'cost-low',
      detail: 'Wrap crates in wet gunny bags. Keep in shade. Rewet every 6 hours.',
    },
    {
      rank: 4,
      title: 'Zero Energy Cool Chamber',
      eff: 'Extends shelf by 7–10 days',
      cost: '₹2,000–5,000',
      costClass: 'cost-medium',
      detail: 'Brick chamber with sand insulation. Built once, used every season.',
    },
  ],

  Sugarcane: [
    {
      rank: 1,
      title: 'Sell within 24 hours of cutting',
      eff: 'Prevents 90% sugar loss',
      cost: 'Free',
      costClass: 'cost-free',
      detail: 'Sucrose degrades rapidly after cutting. Arrange transport/crushing before cutting.',
    },
    {
      rank: 2,
      title: 'Keep stalks bundled and moist',
      eff: 'Buys 12–18 extra hours',
      cost: 'Free',
      costClass: 'cost-free',
      detail: 'Bundle and sprinkle water on stalks. Keep in shade. Do not expose to direct sun.',
    },
    {
      rank: 3,
      title: 'Contract with nearby sugar mill',
      eff: 'Eliminates spoilage risk entirely',
      cost: '₹500 admin',
      costClass: 'cost-low',
      detail: 'Pre-book a crushing slot at local mill before harvest day.',
    },
    {
      rank: 4,
      title: 'Jaggery making on-farm',
      eff: 'Converts perishable to 6-month shelf product',
      cost: '₹8,000–15,000',
      costClass: 'cost-high',
      detail: 'Value-added option. Jaggery fetches 2–3× better margins than raw cane.',
    },
  ],

  /* Used for Wheat, Rice, Soybean, Cotton, Maize, Onion, Potato */
  Default: [
    {
      rank: 1,
      title: 'Dry properly before storage',
      eff: 'Prevents 60–70% fungal loss',
      cost: 'Free',
      costClass: 'cost-free',
      detail: 'Spread on tarpaulin in full sun for 2–3 days. Moisture is enemy #1 for grain storage.',
    },
    {
      rank: 2,
      title: 'Use clean jute/poly bags',
      eff: 'Reduces pest damage by 40%',
      cost: '₹30–60 per bag',
      costClass: 'cost-low',
      detail: 'Old torn bags invite insects. Replace at least every 2 seasons.',
    },
    {
      rank: 3,
      title: 'Neem leaf / Phosphine tablet treatment',
      eff: 'Controls pest attack for 3–6 months',
      cost: '₹100–300',
      costClass: 'cost-low',
      detail: 'For grain crops: 5 kg neem leaves per 100 kg grain. Or 1 phosphine tablet per 2 quintal.',
    },
    {
      rank: 4,
      title: 'Warehouse Receipt Scheme (WRS)',
      eff: 'Get bank loan against stored crop',
      cost: '₹200–500 fee',
      costClass: 'cost-medium',
      detail: 'Store at NAFED/NWRG warehouse. Get 75% value as Kisan Credit. Sell when price peaks.',
    },
  ],
};
