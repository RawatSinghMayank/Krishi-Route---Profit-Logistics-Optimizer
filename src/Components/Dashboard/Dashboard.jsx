import React, { useState, useEffect } from 'react';
import InputForm from '../InputForm/InputForm';
import ProfitCards from '../ProfitCards/ProfitCards';
import CostBreakdown from '../CostBreakdown/CostBreakdown';
import ImpactMetrics from '../ImpactMetrics/ImpactMetrics';
import { calculateProfitability } from '../../services/profitCalculator';
import './Dashboard.css';

const Dashboard = () => {
  const [tripData, setTripData] = useState(null);
  const [profitResults, setProfitResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTripSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate slight delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Calculate profit using local service
      const results = calculateProfitability(formData);
      
      setTripData(formData);
      setProfitResults(results);
    } catch (err) {
      setError(err.message || 'Failed to calculate profit. Please try again.');
      console.error('Error calculating profit:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTripData(null);
    setProfitResults(null);
    setError(null);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🌾 Krishi-Route</h1>
          <p className="tagline">Smart Market Selection for Maximum Profit</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Left Panel - Input Form */}
        <aside className="input-panel">
          <InputForm 
            onSubmit={handleTripSubmit} 
            loading={loading}
            onReset={handleReset}
            hasResults={!!profitResults}
          />
        </aside>

        {/* Right Panel - Results */}
        <main className="results-panel">
          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Analyzing markets and calculating optimal routes...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Something went wrong</h3>
              <p>{error}</p>
              <button onClick={handleReset} className="btn-secondary">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && !profitResults && (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3>Ready to Find Your Best Market</h3>
              <p>Select your crop, quantity, vehicle, and location to compare mandi prices and maximize your profit</p>
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <span>Real-time price comparison</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🚛</span>
                  <span>Transport cost calculation</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📈</span>
                  <span>Profit optimization</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📍</span>
                  <span>Distance-based analysis</span>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && profitResults && (
            <div className="results-container">
              {/* Impact Metrics at Top */}
              <ImpactMetrics 
                results={profitResults}
                tripData={tripData}
              />

              {/* Profit Comparison Cards */}
              <section className="section">
                <h2 className="section-title">Market Comparison</h2>
                <ProfitCards 
                  results={profitResults.mandis}
                  selectedCrop={tripData.crop}
                />
              </section>

              {/* Cost Breakdown Chart */}
              <section className="section">
                <h2 className="section-title">Cost Analysis</h2>
                <CostBreakdown 
                  mandis={profitResults.mandis}
                />
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
