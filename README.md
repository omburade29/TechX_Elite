# KisanMitra – Farm-to-Market Intelligence Platform
### फसल से मंडी तक

---

## 📁 Folder Structure

```
kisanmitra/
│
├── index.html          ← Open this in browser to run the app
│
├── css/
│   ├── base.css        ← Layout, header, variables, reset
│   ├── components.css  ← Cards, forms, buttons, chip toggles
│   └── results.css     ← Score rings, tables, bars, preservation cards
│
├── js/
│   ├── data.js         ← All static data (crops, markets, prices, actions)
│   ├── chips.js        ← Chip toggle button logic
│   ├── engine.js       ← Scoring and analysis calculations
│   ├── render.js       ← Updates the DOM with results
│   └── main.js         ← Entry point (called by Analyse button)
│
└── README.md           ← This file
```

---

## 🚀 How to Run in VS Code

### Option A – Just Open the File (Easiest)
1. Open VS Code
2. Go to `File → Open Folder` → select the `kisanmitra` folder
3. Right-click `index.html` in the sidebar
4. Choose **"Open with Live Server"** (install Live Server extension first — see below)

### Option B – No Extension Needed
1. Open File Explorer / Finder
2. Double-click `index.html`
3. It opens directly in Chrome or Edge — works perfectly

---

## 🔌 Recommended VS Code Extension

Install **Live Server** by Ritwick Dey:
- Press `Ctrl+Shift+X` (Extensions panel)
- Search: `Live Server`
- Click Install
- Then right-click `index.html` → **Open with Live Server**

This gives you auto-refresh when you edit any file.

---

## 📖 How to Explain This Project (Simple Version)

### What problem does it solve?
Indian farmers lose **40% of produce** not because of bad farming, but because of:
- Harvesting at the wrong time
- Selling at the wrong market
- Not knowing how to store crops properly

### What does this app do?
1. **Farmer fills in 7 inputs** — state, crop, soil condition, weather, storage, etc.
2. **AI engine calculates** a score based on all inputs
3. **Shows 6 result cards:**
   - Overall Opportunity Score (0–100)
   - Best harvest dates with reasons
   - Top 3 mandis ranked by price
   - Price trend for next 4 months
   - Spoilage risk percentage
   - Preservation steps ranked by cost (free first)

### Why is it different?
- Every recommendation shows **WHY** — not just what to do
- Has a **Hindi summary** so farmers can understand without English
- Designed for **basic Android phone** — simple, no login, no app install

---

## 🛠 How to Extend / Modify

| Want to...                          | Edit this file     |
|-------------------------------------|--------------------|
| Add a new crop                      | `js/data.js`       |
| Add a new state/mandi               | `js/data.js`       |
| Change scoring rules                | `js/engine.js`     |
| Change colours or fonts             | `css/base.css`     |
| Change how results look             | `css/results.css`  |
| Add a new result card               | `js/render.js` + `index.html` |

---

## 📊 Data Sources (for real deployment)

| Data                  | Source                                   |
|-----------------------|------------------------------------------|
| Mandi prices          | AGMARKNET (agmarknet.gov.in)             |
| MSP values            | CACP (cacp.dacnet.nic.in)                |
| Weather               | IMD API (mausam.imd.gov.in)              |
| Soil health           | ICAR Soil Health Card data               |
| Market arrivals       | eNAM portal (enam.gov.in)                |

---

## 📱 Mobile / Android Notes

The app is fully responsive and works on:
- Chrome for Android
- Any Android browser (no app needed)
- Can be added to home screen as a PWA

---

*Built as a demonstration of AI-powered agri-intelligence for India's smallholder farmers.*
