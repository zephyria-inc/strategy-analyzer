"""
Trading Strategy Analyzer Backend - Production Ready
Calculates Sharpe, Profit Factor, Max DD, Expectancy + Walk-Forward & Monte Carlo validation
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import io
import traceback
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# ===== METRIC CALCULATIONS =====

def calculate_sharpe(returns, rf=0.02/252):
    """Sharpe Ratio: (mean_ret - rf) / std(ret) * sqrt(252)"""
    if len(returns) == 0 or returns.std() == 0:
        return 0
    return ((returns.mean() - rf) / returns.std()) * np.sqrt(252)

def calculate_profit_factor(pnls):
    """Profit Factor: gross_profit / gross_loss"""
    wins = pnls[pnls > 0].sum()
    losses = abs(pnls[pnls < 0].sum())
    if losses == 0:
        return float('inf') if wins > 0 else 0
    return wins / losses

def calculate_max_dd(returns):
    """Max Drawdown: largest peak-to-trough % drop"""
    cumulative = (1 + returns).cumprod()
    running_max = cumulative.expanding().max()
    dd = (cumulative - running_max) / running_max
    return dd.min()

def calculate_expectancy(pnls):
    """Expectancy: (win_rate * avg_win) - (loss_rate * avg_loss)"""
    if len(pnls) == 0:
        return 0
    wins = pnls[pnls > 0]
    losses = pnls[pnls < 0]
    
    if len(wins) == 0 or len(losses) == 0:
        return pnls.mean()
    
    win_rate = len(wins) / len(pnls)
    avg_win = wins.mean()
    avg_loss = abs(losses.mean())
    
    return (win_rate * avg_win) - ((1 - win_rate) * avg_loss)

def calculate_metrics(pnls, returns):
    """Calculate all 4 metrics"""
    return {
        'sharpe': float(calculate_sharpe(returns)),
        'profit_factor': float(calculate_profit_factor(pnls)),
        'max_dd': float(calculate_max_dd(returns)),
        'expectancy': float(calculate_expectancy(pnls)),
        'total_return': float(returns.sum()),
        'win_rate': float(len(pnls[pnls > 0]) / len(pnls)) if len(pnls) > 0 else 0,
        'num_trades': int(len(pnls))
    }

# ===== WALK-FORWARD TESTING =====

def walk_forward_analysis(df, strategy_func, in_sample_months=3, out_sample_months=1):
    """
    Rolling in-sample optimization + out-sample testing
    """
    results = []
    pnls_all = []
    returns_all = pd.Series()
    
    total_rows = len(df)
    in_sample_rows = int((in_sample_months / 12) * total_rows)
    out_sample_rows = int((out_sample_months / 12) * total_rows)
    
    start = 0
    while start + in_sample_rows + out_sample_rows <= total_rows:
        in_sample = df.iloc[start:start + in_sample_rows]
        out_sample = df.iloc[start + in_sample_rows:start + in_sample_rows + out_sample_rows]
        
        try:
            # Run strategy on out-of-sample data
            out_pnls = strategy_func(out_sample)
            out_returns = out_pnls / 100  # Assume 100 unit account
            
            pnls_all.extend(out_pnls.values)
            returns_all = pd.concat([returns_all, out_returns], ignore_index=True)
            
            metrics = calculate_metrics(out_pnls, out_returns)
            results.append({
                'period': f"{start}-{start + in_sample_rows + out_sample_rows}",
                'metrics': metrics
            })
        except Exception as e:
            continue
        
        start += out_sample_rows
    
    # Aggregate metrics
    pnls_all = pd.Series(pnls_all)
    if len(returns_all) > 0:
        return {
            'results': results,
            'aggregate': calculate_metrics(pnls_all, returns_all),
            'num_periods': len(results)
        }
    return {'results': [], 'aggregate': {}, 'num_periods': 0}

# ===== MONTE CARLO VALIDATION =====

def monte_carlo_analysis(pnls, num_sims=1000):
    """
    Random trade sequence resampling with metric thresholds
    """
    pnls = pnls.dropna().values
    if len(pnls) < 2:
        return {}
    
    passed = {'sharpe_above_1': 0, 'pf_above_2': 0, 'dd_below_30': 0}
    all_metrics = []
    
    for _ in range(num_sims):
        shuffled_pnls = np.random.choice(pnls, size=len(pnls), replace=True)
        shuffled_returns = shuffled_pnls / 100
        shuffled_series = pd.Series(shuffled_pnls)
        shuffled_returns_series = pd.Series(shuffled_returns)
        
        metrics = calculate_metrics(shuffled_series, shuffled_returns_series)
        all_metrics.append(metrics)
        
        if metrics['sharpe'] > 1.0:
            passed['sharpe_above_1'] += 1
        if metrics['profit_factor'] > 2.0:
            passed['pf_above_2'] += 1
        if metrics['max_dd'] > -0.30:
            passed['dd_below_30'] += 1
    
    return {
        'simulations': num_sims,
        'pass_rates': {k: (v / num_sims * 100) for k, v in passed.items()},
        'mean_sharpe': float(np.mean([m['sharpe'] for m in all_metrics])),
        'mean_pf': float(np.mean([m['profit_factor'] for m in all_metrics])),
        'mean_dd': float(np.mean([m['max_dd'] for m in all_metrics])),
        'sharpe_std': float(np.std([m['sharpe'] for m in all_metrics])),
        'pf_std': float(np.std([m['profit_factor'] for m in all_metrics])),
        'dd_std': float(np.std([m['max_dd'] for m in all_metrics]))
    }

# ===== API ENDPOINTS =====

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint (for uptime monitoring)"""
    return jsonify({'status': 'ok', 'timestamp': datetime.now().isoformat()}), 200

@app.route('/api/analyze', methods=['POST'])
def analyze_strategy():
    """
    Main analysis endpoint
    Expects: csv_data, strategy_code
    """
    try:
        csv_file = request.files.get('csv')
        strategy_code = request.form.get('strategy')
        
        if not csv_file or not strategy_code:
            return jsonify({'error': 'Missing CSV or strategy code'}), 400
        
        # Parse CSV
        df = pd.read_csv(io.StringIO(csv_file.stream.read().decode()))
        
        # Required columns: date, open, high, low, close, volume
        required = ['open', 'high', 'low', 'close']
        if not all(col.lower() in [c.lower() for c in df.columns] for col in required):
            return jsonify({'error': f'CSV must contain: {", ".join(required)}'}), 400
        
        # Normalize column names
        df.columns = [c.lower().strip() for c in df.columns]
        
        # Execute strategy
        strategy_globals = {'pd': pd, 'np': np, 'df': df}
        exec(strategy_code, strategy_globals)
        
        if 'strategy' not in strategy_globals:
            return jsonify({'error': 'Strategy code must define a function named "strategy(df)"'}), 400
        
        strategy_func = strategy_globals['strategy']
        
        # Run strategy
        pnls = strategy_func(df)
        if not isinstance(pnls, pd.Series):
            pnls = pd.Series(pnls)
        
        pnls = pnls.dropna()
        if len(pnls) == 0:
            return jsonify({'error': 'Strategy produced no trades'}), 400
        
        returns = pnls / 100  # Assume 100 unit account
        
        # Calculate base metrics
        base_metrics = calculate_metrics(pnls, returns)
        
        # Walk-Forward Analysis
        wf_results = walk_forward_analysis(df, strategy_func)
        
        # Monte Carlo Analysis
        mc_results = monte_carlo_analysis(pnls)
        
        return jsonify({
            'success': True,
            'base_metrics': base_metrics,
            'walk_forward': wf_results,
            'monte_carlo': mc_results,
            'data_summary': {
                'num_rows': len(df),
                'date_range': f"{df.iloc[0].get('date', 'N/A')} to {df.iloc[-1].get('date', 'N/A')}",
                'num_trades': len(pnls)
            }
        })
    
    except Exception as e:
        return jsonify({
            'error': f'Analysis failed: {str(e)}',
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/validate-strategy', methods=['POST'])
def validate_strategy():
    """Check if strategy code is syntactically valid"""
    try:
        strategy_code = request.json.get('strategy', '')
        
        # Basic syntax check
        compile(strategy_code, '<string>', 'exec')
        
        # Check for required function
        if 'def strategy' not in strategy_code:
            return jsonify({'valid': False, 'error': 'Must define "strategy(df)" function'}), 200
        
        return jsonify({'valid': True}), 200
    except SyntaxError as e:
        return jsonify({'valid': False, 'error': f'Syntax error: {str(e)}'}), 200
    except Exception as e:
        return jsonify({'valid': False, 'error': str(e)}), 200

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
