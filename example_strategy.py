# Example Strategy: Simple Moving Average Crossover
# This is a template - paste this into the strategy code editor

def strategy(df):
    """
    Simple SMA Crossover Strategy
    - Buy when SMA(10) > SMA(20)
    - Sell when SMA(10) < SMA(20)
    """
    import pandas as pd
    
    # Calculate moving averages
    df['sma10'] = df['close'].rolling(window=10).mean()
    df['sma20'] = df['close'].rolling(window=20).mean()
    
    pnls = []
    position = None  # None = no position, 0 = long
    entry_price = 0
    
    for i in range(20, len(df)):  # Start after SMA20 is available
        current_price = df['close'].iloc[i]
        sma10 = df['sma10'].iloc[i]
        sma20 = df['sma20'].iloc[i]
        prev_sma10 = df['sma10'].iloc[i-1]
        prev_sma20 = df['sma20'].iloc[i-1]
        
        # ENTRY: SMA10 crosses above SMA20
        if prev_sma10 <= prev_sma20 and sma10 > sma20 and position is None:
            position = 0
            entry_price = current_price
        
        # EXIT: SMA10 crosses below SMA20
        elif prev_sma10 >= prev_sma20 and sma10 < sma20 and position == 0:
            exit_price = current_price
            pnl = (exit_price - entry_price) * 100  # 100 shares
            pnls.append(pnl)
            position = None
    
    # Close any open position at end
    if position == 0:
        exit_price = df['close'].iloc[-1]
        pnl = (exit_price - entry_price) * 100
        pnls.append(pnl)
    
    return pd.Series(pnls) if pnls else pd.Series([])

# ============================================================
# TEMPLATE FOR YOUR OWN STRATEGY
# ============================================================
# 
# def strategy(df):
#     """
#     Your strategy description
#     
#     Signals:
#     - Entry condition
#     - Exit condition
#     """
#     import pandas as pd
#     
#     pnls = []
#     
#     # Your logic here
#     for i in range(some_offset, len(df)):
#         # Your entry/exit logic
#         pass
#     
#     return pd.Series(pnls) if pnls else pd.Series([])
#
# KEY TIPS:
# 1. Access data via df['column_name'] (open, high, low, close, volume)
# 2. Return pandas Series of P&L values
# 3. Each value = profit/loss from one trade
# 4. Can be in dollars, points, or percentages (just be consistent)
# 5. Use df.iloc[i] for row access by index
# 6. Use df.loc['date'] for row access by date (if date is index)
# 7. Vectorized operations (rolling, apply) are faster than loops
#
# EXAMPLE INDICATORS:
#
# # RSI
# delta = df['close'].diff()
# gain = (delta.where(delta > 0, 0)).rolling(14).mean()
# loss = (-delta.where(delta < 0, 0)).rolling(14).mean()
# rs = gain / loss
# rsi = 100 - (100 / (1 + rs))
#
# # MACD
# exp1 = df['close'].ewm(span=12, adjust=False).mean()
# exp2 = df['close'].ewm(span=26, adjust=False).mean()
# macd = exp1 - exp2
# signal = macd.ewm(span=9, adjust=False).mean()
#
# # Bollinger Bands
# sma = df['close'].rolling(20).mean()
# std = df['close'].rolling(20).std()
# upper = sma + (std * 2)
# lower = sma - (std * 2)
#
# # ATR
# tr1 = df['high'] - df['low']
# tr2 = abs(df['high'] - df['close'].shift(1))
# tr3 = abs(df['low'] - df['close'].shift(1))
# tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
# atr = tr.rolling(14).mean()
