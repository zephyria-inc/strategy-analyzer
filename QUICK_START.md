# 🚀 QUICK START (5 Minutes)

## Installation

### 1. Install Python Packages
```bash
pip install -r requirements.txt
```

### 2. Start Backend Server
```bash
python strategy_analyzer_backend.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### 3. Open Frontend

**Option A: Using Create-React-App**
```bash
npx create-react-app my-analyzer
cd my-analyzer
npm install lucide-react
# Copy StrategyAnalyzer.jsx content to src/App.jsx
npm start
```

**Option B: Standalone HTML (No setup)**
Open `index.html` in your browser (see next section to generate it)

---

## Generate Standalone HTML

Run this Python script to create a single `index.html` file:

```python
html_content = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trading Strategy Analyzer</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
    <div id="root"></div>
    
    <script type="text/babel">
        // Paste entire StrategyAnalyzer.jsx code here (minus imports)
        // Adjust imports to use window.React, window.ReactDOM
    </script>
</body>
</html>
"""

with open('index.html', 'w') as f:
    f.write(html_content)
```

---

## Test with Example Data

1. **Use provided data:**
   - Upload `example_data.csv`
   - Copy strategy from `example_strategy.py`

2. **Expected Results:**
   - Sharpe: ~0.5-1.0
   - Profit Factor: ~1.2-1.8
   - Max DD: ~-5% to -15%
   - ~15-25 trades

---

## Your First Custom Strategy

### Step 1: Prepare CSV
Format: `date,open,high,low,close,volume`

### Step 2: Write Strategy
```python
def strategy(df):
    import pandas as pd
    
    # Your logic here
    pnls = []
    
    # Example: Buy every Monday, sell Friday
    for i in range(5, len(df)):
        entry = df['close'].iloc[i-4]
        exit = df['close'].iloc[i]
        pnl = (exit - entry) * 100
        pnls.append(pnl)
    
    return pd.Series(pnls)
```

### Step 3: Upload & Run
1. Paste CSV in upload box
2. Paste strategy in code editor
3. Click "Run Analysis"
4. View results in dashboard

---

## Key Metrics Guide

| Metric | Formula | Target | Good | Excellent |
|--------|---------|--------|------|-----------|
| **Sharpe** | (mean_ret - rf) / std(ret) × √252 | > 1.0 | 1.0-1.5 | > 2.0 |
| **Profit Factor** | gross_profit / gross_loss | > 1.5 | 1.5-2.0 | > 2.0 |
| **Max DD** | worst peak-to-trough drop | < -20% | -15% to -30% | > -10% |
| **Expectancy** | (wr × avg_win) - (1-wr × avg_loss) | > 0 | 0.5-1.0 | > 1.0 |

---

## Validation Results

### Walk-Forward (Out-of-Sample Testing)
✅ If aggregate metrics are stable → Not overfit
⚠️ If degrading → Possible overfitting
❌ If poor → Strategy doesn't generalize

### Monte Carlo (1000 Shuffles)
✅ If >80% pass thresholds → Robust
⚠️ If 50-80% pass → Depends on risk tolerance
❌ If <50% pass → Likely due to luck

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 already in use | `lsof -i :5000` then kill process |
| "No module named 'flask'" | `pip install flask flask-cors` |
| CSV upload fails | Check columns: open, high, low, close |
| Strategy validation fails | Ensure function named `strategy(df)` |
| No trades generated | Debug with print statements |

---

## Next Steps

1. Test with real market data (Yahoo Finance, Crypto, Forex)
2. Optimize parameters using Walk-Forward
3. Add risk management (stop-loss, profit-target)
4. Integrate with live broker API (Alpaca, Interactive Brokers)
5. Deploy to cloud (Heroku, AWS, GCP)

---

## Resources

- **Data Sources:** 
  - Yahoo Finance: `yfinance`
  - Crypto: Binance, Kraken APIs
  - Stocks: IB, Alpaca, TD Ameritrade

- **Strategy Libraries:**
  - Backtrader: `pip install backtrader`
  - VectorBT: `pip install vectorbt`
  - Zipline: `pip install zipline-reloaded`

- **Learning:**
  - "Algorithmic Trading" by Ernie Chan
  - QuantInsti courses
  - r/algotrading community

---

**Happy backtesting! 📈**
