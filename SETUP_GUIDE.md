# Trading Strategy Analyzer - Setup & Usage Guide

A professional-grade backtesting framework that calculates **Sharpe, Profit Factor, Max Drawdown, Expectancy** with **Walk-Forward** and **Monte Carlo** validation.

---

## 📋 Requirements

- **Python 3.8+** (with pip)
- **Node.js 16+** (with npm)

---

## 🚀 Installation

### Step 1: Install Python Dependencies

```bash
pip install flask flask-cors pandas numpy
```

### Step 2: Install Node.js Dependencies

```bash
npm install
```

Or use a React template:
```bash
npx create-react-app strategy-analyzer
cd strategy-analyzer
npm install lucide-react
```

---

## ▶️ Running the Application

### Backend (Terminal 1)

```bash
python strategy_analyzer_backend.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
```

### Frontend (Terminal 2)

If using `create-react-app`:
```bash
npm start
```

If running as standalone HTML (see Alternative Setup):
- Open the generated `index.html` in a modern browser

---

## 💻 Usage

### 1. **Prepare Your Data**

Create a CSV with OHLCV data (any timeframe):

```csv
date,open,high,low,close,volume
2024-01-01,100.5,101.2,100.1,100.8,1000000
2024-01-02,100.8,102.1,100.5,101.5,1200000
...
```

**Required columns:** `open`, `high`, `low`, `close` (any case, spaces trimmed)
**Optional:** `date`, `volume`

### 2. **Write Your Strategy**

Your strategy function receives the DataFrame and must return a pandas Series of P&L values (in dollars or points).

#### Simple Example: Buy & Hold

```python
def strategy(df):
    """Buy on day 1, sell on day N"""
    pnl = (df['close'].iloc[-1] - df['close'].iloc[0]) * 100  # 100 shares
    return pd.Series([pnl])
```

#### Intermediate Example: Moving Average Crossover

```python
def strategy(df):
    """SMA(20) > SMA(50) = Long, else Flat"""
    df['sma20'] = df['close'].rolling(20).mean()
    df['sma50'] = df['close'].rolling(50).mean()
    
    pnls = []
    position = 0
    entry_price = 0
    
    for i, row in df.iterrows():
        if row['sma20'] > row['sma50'] and position == 0:
            position = 1
            entry_price = row['close']
        elif row['sma20'] <= row['sma50'] and position == 1:
            pnl = (row['close'] - entry_price) * 100
            pnls.append(pnl)
            position = 0
    
    return pd.Series(pnls) if pnls else pd.Series([])
```

#### Advanced Example: RSI with Position Sizing

```python
def strategy(df):
    """RSI < 30 = Buy, RSI > 70 = Sell"""
    df['rsi'] = calculate_rsi(df['close'], period=14)
    
    pnls = []
    for i in range(14, len(df)):
        rsi = df['rsi'].iloc[i]
        
        if rsi < 30:  # Oversold
            entry = df['close'].iloc[i]
            exit = df['close'].iloc[i+1] if i+1 < len(df) else entry
            size = 100 if rsi < 20 else 50  # More size if very oversold
            pnls.append((exit - entry) * size)
        elif rsi > 70:  # Overbought
            entry = df['close'].iloc[i]
            exit = df['close'].iloc[i+1] if i+1 < len(df) else entry
            pnls.append((entry - exit) * 50)  # Short
    
    return pd.Series(pnls) if pnls else pd.Series([])

def calculate_rsi(prices, period=14):
    deltas = prices.diff()
    seed = deltas[:period+1]
    up = seed[seed >= 0].sum() / period
    down = -seed[seed < 0].sum() / period
    rs = up / down if down else 0
    rsi = 100 - 100 / (1 + rs)
    return rsi
```

#### Tips for Your Strategy

✅ **Good:**
- Return P&L as pandas Series or list
- Use vectorized operations (`.rolling()`, `.apply()`)
- Assume 100-unit account if P&L is in dollars

❌ **Avoid:**
- Undefined loops (too slow)
- Using future data (lookahead bias)
- Hardcoded dates/values

---

## 📊 Understanding the Metrics

### **1. Sharpe Ratio** → Risk-Adjusted Returns

```
(mean_return - risk_free_rate) / std(returns) × √252
```

**Interpretation:**
- `> 1.0` = Good risk/reward
- `> 2.0` = Excellent
- `< 0.5` = Poor

### **2. Profit Factor** → Win Size vs Loss Size

```
gross_profit / abs(gross_loss)
```

**Interpretation:**
- `> 2.0` = Excellent (wins 2x losses)
- `> 1.5` = Good
- `< 1.0` = Negative expectancy
- `∞` = No losses (rare!)

### **3. Max Drawdown** → Worst Trough

```
largest (peak_equity - trough_equity) / peak_equity
```

**Interpretation:**
- `-10%` to `-20%` = Acceptable
- `-30%+` = Risky
- Psychological limit for many traders is -20%

### **4. Expectancy** → Average Win per Trade

```
(win_rate × avg_win) - (loss_rate × avg_loss)
```

**Interpretation:**
- `> 0` = Profitable in expectation
- `> 1.0` = Strong (avg win > $1)
- `< 0` = Unprofitable

---

## ✔️ Validation Methods

### **Walk-Forward Testing** (Realistic Out-of-Sample)

1. Split data: In-sample (3 mo) + Out-sample (1 mo)
2. Optimize strategy on in-sample
3. Test on out-sample (fresh data)
4. Slide window forward, repeat
5. Aggregate results

**Why it matters:** Prevents overfitting by testing on data the strategy never "saw"

### **Monte Carlo Validation** (1000+ Shuffles)

1. Randomly shuffle trade sequence (assumes order doesn't matter)
2. Recalculate metrics
3. Check % passing thresholds:
   - Sharpe > 1.0
   - Profit Factor > 2.0
   - Max DD > -30%
4. If >80% of sims pass → robust strategy

**Why it matters:** Confirms edge isn't due to lucky order of trades

---

## 🎯 Example Workflow

### Step 1: Get Data
Download historical OHLCV for Bitcoin:
```python
import pandas as pd
# Download from Yahoo Finance, Binance, Alpaca, etc.
df = pd.read_csv('btc_daily.csv')  # OHLCV
```

### Step 2: Design Strategy
```python
def strategy(df):
    # Price > 50-day MA = Long
    ma50 = df['close'].rolling(50).mean()
    pnls = []
    
    for i in range(50, len(df)):
        if df['close'].iloc[i-1] <= ma50.iloc[i-1] and df['close'].iloc[i] > ma50.iloc[i]:
            # Breakout signal
            entry = df['close'].iloc[i]
            exit = df['close'].iloc[min(i+5, len(df)-1)]  # 5-bar hold
            pnl = (exit - entry) * 10  # 10 contracts
            pnls.append(pnl)
    
    return pd.Series(pnls)
```

### Step 3: Upload & Analyze
1. Paste your CSV in "Market Data" upload
2. Paste your strategy in code editor
3. Click "Run Analysis"
4. Check results:
   - **Sharpe > 1.5?** ✓ Good risk-reward
   - **Profit Factor > 2?** ✓ Wins > losses
   - **Max DD < -20%?** ✓ Acceptable drawdown
   - **Walk-Forward stable?** ✓ Not overfit
   - **Monte Carlo >80% passing?** ✓ Robust

---

## 🔧 Troubleshooting

### "Connection error: Make sure backend is running on port 5000"
- Start backend: `python strategy_analyzer_backend.py`
- Check port isn't blocked

### "Strategy code must define a function named 'strategy(df)'"
- Function must be named exactly `strategy`
- Must accept DataFrame `df` as input

### "CSV must contain: open, high, low, close"
- Check column names (case-insensitive)
- Remove extra whitespace in headers

### "Strategy produced no trades"
- Your strategy returned empty P&L list
- Add debug prints to verify signals

### "Analysis failed: Division by zero"
- Usually max_dd calculation with flat equity
- Ensure strategy has winning trades

---

## 📈 Real-World Tips

1. **Use Realistic Assumptions**
   - Add 0.1% commission per trade
   - 1-2 tick slippage on entry/exit
   - Account size affects position sizing

2. **Avoid Overfitting**
   - Keep strategy logic simple
   - Use walk-forward validation
   - Test on out-of-sample periods

3. **Monitor These Metrics**
   - Win rate 40-60% is typical
   - Sharpe > 1.0 is rare in live trading
   - Max DD is key risk metric

4. **Data Quality**
   - Use adjusted close (if splits exist)
   - Check for gaps/holidays
   - Ensure sufficient history (3+ years ideal)

---

## 📚 Additional Resources

- **Walk-Forward Analysis:** https://en.wikipedia.org/wiki/Walk_forward_optimization
- **Monte Carlo:** https://en.wikipedia.org/wiki/Monte_Carlo_method
- **Sharpe Ratio:** https://en.wikipedia.org/wiki/Sharpe_ratio
- **Trading Systems:** "Market Wizards" by Jack D. Schwager

---

## 📄 License

Open source. Use freely for personal & educational purposes.

---

**Questions or improvements?** The analyzer is extensible—add your own metrics or validation methods!
