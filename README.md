# 📊 Trading Strategy Analyzer - Complete Package

A **professional-grade backtesting framework** that automatically calculates trading strategy metrics with scientific validation.

![Version](https://img.shields.io/badge/version-1.0-blue)
![Python](https://img.shields.io/badge/python-3.8+-green)
![License](https://img.shields.io/badge/license-Open-brightgreen)

---

## ⚡ What It Does

Upload historical price data + Python strategy code → Get:

✅ **4 Key Performance Metrics:**
- 📈 **Sharpe Ratio** - Risk-adjusted returns
- 💰 **Profit Factor** - Win size vs loss size  
- 📉 **Max Drawdown** - Largest peak-to-trough drop
- 🎯 **Expectancy** - Average profit per trade

✅ **2 Validation Methods:**
- 🔄 **Walk-Forward Testing** - Out-of-sample robustness
- 🎲 **Monte Carlo Analysis** - 1000+ trade shuffles

✅ **Professional Dashboard:**
- Dark fintech aesthetic
- Real-time metric visualization
- Metric explanations & benchmarks

---

## 📦 Files Included

| File | Purpose |
|------|---------|
| **QUICK_START.md** | 5-minute setup (START HERE) |
| **SETUP_GUIDE.md** | Detailed installation & usage |
| **strategy_analyzer_backend.py** | Flask server (calculations & metrics) |
| **StrategyAnalyzer.jsx** | React frontend (dashboard UI) |
| **requirements.txt** | Python dependencies |
| **example_data.csv** | Sample market data (test) |
| **example_strategy.py** | Sample trading strategy (template) |

---

## 🎯 Get Started in 5 Minutes

### 1️⃣ Install Dependencies
```bash
pip install -r requirements.txt
```

### 2️⃣ Start Backend
```bash
python strategy_analyzer_backend.py
```

### 3️⃣ Open Frontend
- **Option A:** Use `create-react-app` + `StrategyAnalyzer.jsx`
- **Option B:** Generate standalone HTML (see SETUP_GUIDE.md)

### 4️⃣ Upload Data & Strategy
1. Upload `example_data.csv` in "Market Data" box
2. Paste `example_strategy.py` code
3. Click "Run Analysis" → View results 📊

---

## 📈 Understanding Your Results

### Base Metrics

**Sharpe Ratio** `(mean_ret - rf) / std(ret) × √252`
- `> 2.0` = Excellent
- `1.0 - 2.0` = Good  
- `< 0.5` = Poor

**Profit Factor** `gross_profit / gross_loss`
- `> 2.0` = Excellent (wins 2x losses)
- `1.5 - 2.0` = Good
- `< 1.0` = Unprofitable

**Max Drawdown** (worst equity peak-to-trough)
- `-10%` = Excellent
- `-20%` = Acceptable
- `-30%+` = Risky

**Expectancy** `(win_rate × avg_win) - (loss_rate × avg_loss)`
- `> 1.0` = Strong edge ($1+ per trade)
- `0 - 1.0` = Profitable
- `< 0` = Unprofitable

### Validation Results

**Walk-Forward:** Tests strategy on data it never saw
- ✅ Stable metrics = Not overfit
- ⚠️ Degrading = Possible overfitting

**Monte Carlo:** Shuffles trades 1000x
- ✅ >80% pass = Robust strategy
- ⚠️ 50-80% pass = Marginal
- ❌ <50% pass = Likely due to luck

---

## 💻 Writing Your Strategy

### Simple Template

```python
def strategy(df):
    """Your strategy description"""
    import pandas as pd
    
    pnls = []
    
    # Your logic: generate buy/sell signals
    for i in range(start, len(df)):
        # Calculate entry/exit
        pnl = (exit_price - entry_price) * shares
        pnls.append(pnl)
    
    return pd.Series(pnls)
```

### Access Data
```python
df['open']      # Open prices
df['high']      # High prices
df['low']       # Low prices
df['close']     # Close prices (most used)
df['volume']    # Trading volume
```

### Example Strategies

**Moving Average Crossover:**
```python
def strategy(df):
    df['sma10'] = df['close'].rolling(10).mean()
    df['sma20'] = df['close'].rolling(20).mean()
    
    pnls = []
    for i in range(20, len(df)):
        if df['sma10'].iloc[i] > df['sma20'].iloc[i]:
            # Signal to buy
            entry = df['close'].iloc[i]
        else:
            # Signal to sell
            exit = df['close'].iloc[i]
            pnl = (exit - entry) * 100
            pnls.append(pnl)
    
    return pd.Series(pnls)
```

**Mean Reversion (RSI):**
```python
def strategy(df):
    # Calculate RSI
    delta = df['close'].diff()
    gain = delta.where(delta>0, 0).rolling(14).mean()
    loss = -delta.where(delta<0, 0).rolling(14).mean()
    rs = gain / loss
    rsi = 100 - (100/(1+rs))
    
    pnls = []
    for i in range(14, len(df)):
        if rsi.iloc[i] < 30:  # Oversold
            entry = df['close'].iloc[i]
            exit = df['close'].iloc[i+1]
            pnl = (exit - entry) * 100
            pnls.append(pnl)
    
    return pd.Series(pnls)
```

**Trend Following (MACD):**
```python
def strategy(df):
    # Calculate MACD
    exp1 = df['close'].ewm(span=12).mean()
    exp2 = df['close'].ewm(span=26).mean()
    macd = exp1 - exp2
    signal = macd.ewm(span=9).mean()
    
    pnls = []
    for i in range(26, len(df)):
        if macd.iloc[i] > signal.iloc[i]:  # MACD > signal
            entry = df['close'].iloc[i]
            exit = df['close'].iloc[i+5]  # Hold 5 bars
            pnl = (exit - entry) * 100
            pnls.append(pnl)
    
    return pd.Series(pnls)
```

---

## 📊 Real-World Tips

### Data Quality
- ✅ Use adjusted close (handles splits/dividends)
- ✅ Check for gaps and missing data
- ✅ Use 3+ years history for robustness
- ❌ Avoid penny stocks (wide spreads)
- ❌ Avoid low-volume periods (slippage issues)

### Strategy Design
- ✅ Keep logic simple (easier to understand)
- ✅ Test on multiple instruments
- ✅ Use realistic slippage (0.1-0.5%)
- ✅ Include transaction costs
- ❌ Avoid overfitting (too many parameters)
- ❌ Don't use future data (lookahead bias)

### Performance Expectations
- **Win Rate:** 40-60% typical
- **Sharpe:** 1.0+ is rare in live trading
- **Max DD:** Expect -20% to -30%
- **Profit Factor:** 1.5+ is solid

### Common Pitfalls
```python
# ❌ BAD: Lookahead bias (using future data)
if df['close'].iloc[i+1] > df['close'].iloc[i]:
    # Don't use i+1 until you're at i+1!

# ❌ BAD: Overfitting (too specific)
if df['close'].iloc[i] == 103.57 and \
   df['volume'].iloc[i] == 1234567:
    # These won't repeat!

# ✅ GOOD: Robust logic
if df['close'].iloc[i] > df['close'].rolling(20).mean().iloc[i]:
    # Uses general pattern

# ✅ GOOD: No future data
for i in range(lookback, len(df)):
    entry = df['close'].iloc[i]  # Current bar
    exit = df['close'].iloc[i+1]  # Next bar (known on entry)
```

---

## 🛠️ Troubleshooting

### Backend Won't Start
```bash
# Port 5000 in use?
lsof -i :5000
kill -9 <PID>

# Missing flask?
pip install flask flask-cors

# Check Python version
python --version  # Need 3.8+
```

### CSV Upload Fails
```
Required columns: open, high, low, close
Optional: date, volume

Correct format:
date,open,high,low,close,volume
2024-01-01,100.0,101.5,99.8,100.5,1000000
```

### Strategy Has Errors
```
Common issues:
1. Function not named "strategy"
2. Forgot "import pandas as pd"
3. Syntax error in condition
4. Division by zero
5. Lookahead bias (using future data)

Use browser console (F12) for backend errors!
```

### No Trades Generated
```python
# Debug: print to check signals
def strategy(df):
    trades = 0
    for i in range(start, len(df)):
        if signal_condition:
            trades += 1
            pnl = calculate_pnl()
    print(f"Generated {trades} trades")  # Check output
```

---

## 📚 Learning Resources

### Books
- "Algorithmic Trading" by Ernie Chan
- "Python for Finance" by Yves Hilpisch
- "Market Wizards" by Jack D. Schwager

### Online
- QuantInsti (quantinsti.com)
- Investopedia Algorithmic Trading
- r/algotrading (Reddit community)

### Tools & Libraries
- **Backtrader:** Full backtesting framework
- **VectorBT:** Fast vectorized backtesting
- **Zipline:** Professional backtester
- **Pandas:** Data manipulation
- **NumPy:** Numerical computing

### Data Sources
- **Stock/ETF:** Yahoo Finance (`yfinance`)
- **Crypto:** Binance, Kraken APIs
- **Forex:** Oanda, IG Markets
- **Futures:** Data providers (Bloomberg, Reuters)

---

## 🚀 Advanced Features

### Custom Metrics
Edit `strategy_analyzer_backend.py` to add:
- Calmar Ratio
- Sortino Ratio
- Recovery Factor
- Win/Loss Ratio

### Parameter Optimization
Add optimization loop:
```python
best_results = {}
for param in range(5, 50, 5):
    results = analyze(df, strategy, param)
    if results['sharpe'] > best:
        best_results = results
```

### Live Trading Integration
Connect to brokers:
- Alpaca (stocks/crypto)
- Interactive Brokers (futures)
- Binance (crypto)

### Cloud Deployment
- Deploy Flask on Heroku/AWS
- Use Docker for consistency
- Schedule backtests with Celery

---

## 📞 Support

### Common Questions

**Q: Is this real backtesting or just historical testing?**
A: Historical backtesting. It's a good first test but doesn't account for market impact, gaps at open, or black swan events.

**Q: How accurate are the results?**
A: Depends on your data quality and strategy realism. Add slippage (0.1-0.5%) and commissions for accuracy.

**Q: Can I trade this live?**
A: Yes, but test thoroughly first. Paper trade before using real money.

**Q: How far back should I test?**
A: 3-5 years minimum. Longer = better for robustness.

**Q: Should I optimize parameters?**
A: Yes, but use walk-forward validation to avoid overfitting.

---

## 📄 Files Reference

### Python Backend
```
strategy_analyzer_backend.py
├── Flask server
├── Metric calculations (Sharpe, PF, DD, Expectancy)
├── Walk-Forward testing
├── Monte Carlo validation
└── POST /api/analyze endpoint
```

### React Frontend
```
StrategyAnalyzer.jsx
├── CSV upload with drag-drop
├── Strategy code editor
├── Real-time validation
├── Results dashboard
└── Dark fintech aesthetic
```

### Configuration
```
requirements.txt      → Python packages
example_data.csv      → Test data
example_strategy.py   → Strategy template
```

---

## 📜 License

Open source. Use freely for personal and educational purposes.

---

## ⭐ Next Steps

1. ✅ Install and run locally
2. ✅ Test with example data
3. ✅ Write your first strategy
4. ✅ Backtest on your own data
5. ✅ Paper trade before live trading

---

**Built for traders. Tested by quants. Ready for production.**

Questions? Check SETUP_GUIDE.md for detailed instructions.
