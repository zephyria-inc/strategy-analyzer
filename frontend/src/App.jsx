import React, { useState, useRef } from 'react';
import { Upload, Play, AlertCircle, CheckCircle, TrendingUp, BarChart3, Zap } from 'lucide-react';

const StrategyAnalyzer = () => {
  const [csv, setCsv] = useState(null);
  const [strategy, setStrategy] = useState('def strategy(df):\n    """Your strategy logic here"""\n    pnls = df["close"].pct_change().dropna() * 100  # Example: daily returns\n    return pnls\n');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [strategyValid, setStrategyValid] = useState(true);
  const csvInputRef = useRef(null);

  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsv(file);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-500');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-500');
    const file = e.dataTransfer.files?.[0];
    if (file?.name.endsWith('.csv')) {
      setCsv(file);
      setError(null);
    }
  };

  const validateStrategy = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/validate-strategy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy })
      });
      const data = await response.json();
      setStrategyValid(data.valid);
      if (!data.valid) {
        setError(`Strategy validation failed: ${data.error}`);
      }
      return data.valid;
    } catch {
      setStrategyValid(false);
      return false;
    }
  };

  const runAnalysis = async () => {
    if (!csv || !strategy) {
      setError('Please upload CSV and provide strategy code');
      return;
    }

    if (!(await validateStrategy())) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('csv', csv);
      formData.append('strategy', strategy);

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Analysis failed');
        return;
      }

      setResults(data);
    } catch (err) {
      setError(`Connection error: ${err.message}. Make sure backend is running on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Trading Strategy Analyzer
            </h1>
          </div>
          <p className="text-slate-400 text-sm">Calculate Sharpe, Profit Factor, Max DD, Expectancy + Walk-Forward & Monte Carlo validation</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Input Section */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* CSV Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-blue-300">Market Data (CSV)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => csvInputRef.current?.click()}
              className="relative border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-all duration-300 bg-slate-800/30 group"
            >
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvUpload}
                className="hidden"
              />
              <Upload className="w-8 h-8 mx-auto mb-2 text-slate-400 group-hover:text-blue-400 transition" />
              {csv ? (
                <div className="space-y-1">
                  <p className="font-medium text-blue-300">{csv.name}</p>
                  <p className="text-xs text-slate-400">Click to replace</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="font-medium text-slate-300">Drop CSV or click to upload</p>
                  <p className="text-xs text-slate-500">Required: open, high, low, close, volume</p>
                </div>
              )}
            </div>
          </div>

          {/* Strategy Info */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-blue-300">Strategy Validation</label>
            <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-6 space-y-3 h-full flex flex-col justify-center">
              <div className="space-y-2">
                <p className="text-sm text-slate-300">Function must be named <code className="bg-slate-900 px-2 py-1 rounded text-cyan-300 font-mono">strategy(df)</code></p>
                <p className="text-sm text-slate-400">Returns: pandas Series of P&L values</p>
                <div className="flex items-center gap-2 mt-4">
                  {strategyValid && <CheckCircle className="w-5 h-5 text-green-400" />}
                  {!strategyValid && <AlertCircle className="w-5 h-5 text-orange-400" />}
                  <span className={strategyValid ? 'text-green-400 text-sm' : 'text-orange-400 text-sm'}>
                    {strategyValid ? 'Strategy structure valid' : 'Check syntax'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Editor */}
        <div className="mb-8 space-y-3">
          <label className="block text-sm font-semibold text-blue-300">Strategy Code</label>
          <textarea
            value={strategy}
            onChange={(e) => setStrategy(e.target.value)}
            className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-4 font-mono text-sm text-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none resize-none"
            placeholder="def strategy(df):&#10;    # Your trading logic here&#10;    return pnls"
          />
          <p className="text-xs text-slate-500">Python code. Access DataFrame as `df` with columns: open, high, low, close, volume</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-8 bg-red-950/30 border border-red-900/50 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-300">{error}</div>
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={runAnalysis}
          disabled={loading || !csv}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group"
        >
          <Play className="w-5 h-5 group-hover:scale-110 transition" />
          {loading ? 'Analyzing...' : 'Run Analysis'}
        </button>

        {/* Results */}
        {results && (
          <div className="mt-12 space-y-8 animate-in fade-in duration-500">
            {/* Summary */}
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Analysis Summary
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Date Range</p>
                  <p className="text-slate-200 font-mono">{results.data_summary.date_range}</p>
                </div>
                <div>
                  <p className="text-slate-400">Rows</p>
                  <p className="text-slate-200">{results.data_summary.num_rows}</p>
                </div>
                <div>
                  <p className="text-slate-400">Trades</p>
                  <p className="text-slate-200">{results.data_summary.num_trades}</p>
                </div>
                <div>
                  <p className="text-slate-400">Win Rate</p>
                  <p className="text-slate-200">{(results.base_metrics.win_rate * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div>
              <h2 className="text-xl font-bold text-blue-300 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                Performance Metrics
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Sharpe Ratio', value: results.base_metrics.sharpe.toFixed(3), desc: '(mean ret - rf) / std(ret) × √252', benchmark: '> 1.0 Good', color: 'blue' },
                  { label: 'Profit Factor', value: results.base_metrics.profit_factor.toFixed(2), desc: 'gross profit / gross loss', benchmark: '> 2.0 Excellent', color: 'green' },
                  { label: 'Max Drawdown', value: (results.base_metrics.max_dd * 100).toFixed(2) + '%', desc: 'largest peak-to-trough drop', benchmark: '< -20% Acceptable', color: 'red' },
                  { label: 'Expectancy', value: results.base_metrics.expectancy.toFixed(2), desc: '(wr × avg_win) - (lr × avg_loss)', benchmark: '> 0 Profitable', color: 'cyan' }
                ].map((m, i) => (
                  <div key={i} className={`bg-slate-800/60 border border-slate-700/50 rounded-lg p-5 space-y-2 hover:border-${m.color}-500/30 transition`}>
                    <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">{m.label}</p>
                    <p className={`text-2xl font-bold text-${m.color}-300`}>{m.value}</p>
                    <p className="text-xs text-slate-500">{m.desc}</p>
                    <p className="text-xs text-slate-600 pt-2 border-t border-slate-700/30">{m.benchmark}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Walk-Forward */}
            {results.walk_forward.num_periods > 0 && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-cyan-300">Walk-Forward Validation ({results.walk_forward.num_periods} periods)</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="bg-slate-900/30 rounded p-3">
                    <p className="text-slate-400">Avg Sharpe</p>
                    <p className="text-lg font-bold text-blue-300">{results.walk_forward.aggregate.sharpe?.toFixed(3) || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-900/30 rounded p-3">
                    <p className="text-slate-400">Avg Profit Factor</p>
                    <p className="text-lg font-bold text-green-300">{results.walk_forward.aggregate.profit_factor?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-900/30 rounded p-3">
                    <p className="text-slate-400">Avg Max DD</p>
                    <p className="text-lg font-bold text-red-300">{(results.walk_forward.aggregate.max_dd * 100)?.toFixed(2) || 'N/A'}%</p>
                  </div>
                  <div className="bg-slate-900/30 rounded p-3">
                    <p className="text-slate-400">Avg Expectancy</p>
                    <p className="text-lg font-bold text-cyan-300">{results.walk_forward.aggregate.expectancy?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Monte Carlo */}
            {results.monte_carlo.simulations && (
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-bold text-purple-300">Monte Carlo Validation ({results.monte_carlo.simulations} simulations)</h3>
                <div className="space-y-3 text-sm">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="bg-slate-900/30 rounded p-3 space-y-1">
                      <p className="text-slate-400">Sharpe > 1.0</p>
                      <p className="text-lg font-bold text-blue-300">{results.monte_carlo.pass_rates.sharpe_above_1?.toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-900/30 rounded p-3 space-y-1">
                      <p className="text-slate-400">Profit Factor > 2.0</p>
                      <p className="text-lg font-bold text-green-300">{results.monte_carlo.pass_rates.pf_above_2?.toFixed(1)}%</p>
                    </div>
                    <div className="bg-slate-900/30 rounded p-3 space-y-1">
                      <p className="text-slate-400">Max DD > -30%</p>
                      <p className="text-lg font-bold text-red-300">{results.monte_carlo.pass_rates.dd_below_30?.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="bg-slate-900/20 rounded p-4 space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between"><span>Sharpe Mean ± Std:</span> <span className="text-slate-300">{results.monte_carlo.mean_sharpe?.toFixed(3)} ± {results.monte_carlo.sharpe_std?.toFixed(3)}</span></div>
                    <div className="flex justify-between"><span>PF Mean ± Std:</span> <span className="text-slate-300">{results.monte_carlo.mean_pf?.toFixed(2)} ± {results.monte_carlo.pf_std?.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Max DD Mean ± Std:</span> <span className="text-slate-300">{(results.monte_carlo.mean_dd * 100)?.toFixed(2)}% ± {(results.monte_carlo.dd_std * 100)?.toFixed(2)}%</span></div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="bg-slate-800/20 border border-slate-700/30 rounded-lg p-4 text-center text-xs text-slate-400 space-y-1">
              <p>Results calculated on {new Date().toLocaleString()}</p>
              <p className="text-slate-500">Ensure backtesting with realistic slippage & commission assumptions</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyAnalyzer;
