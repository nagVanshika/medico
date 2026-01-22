import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Package, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Predictions = () => {
    const [salesTrend, setSalesTrend] = useState([]);
    const [topSelling, setTopSelling] = useState([]);
    const [reorderSuggestions, setReorderSuggestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPredictions();
    }, []);

    const fetchPredictions = async () => {
        try {
            const [salesRes, topSellingRes, reorderRes] = await Promise.all([
                axios.get('http://localhost:5001/api/predictions/sales-trend?days=30'),
                axios.get('http://localhost:5001/api/predictions/top-selling?limit=10'),
                axios.get('http://localhost:5001/api/predictions/reorder-suggestions')
            ]);

            setSalesTrend(salesRes.data.data);
            setTopSelling(topSellingRes.data.data);
            setReorderSuggestions(reorderRes.data.data);
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="spinner"></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>Analytics & Predictions</h1>
                <p>Sales trends and inventory insights</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <TrendingUp size={20} />
                    Sales Trend (Last 30 Days)
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={salesTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="bills" fill="#2563eb" name="Bills Count" />
                        <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Revenue (₹)" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1.5rem' }}>
                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} />
                        Top Selling Products
                    </h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Product</th>
                                    <th>Quantity Sold</th>
                                    <th>Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topSelling.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No sales data available
                                        </td>
                                    </tr>
                                ) : (
                                    topSelling.map((product, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: 600 }}>#{index + 1}</td>
                                            <td style={{ fontWeight: 500 }}>{product.name}</td>
                                            <td>{product.totalQuantity}</td>
                                            <td>₹{product.totalRevenue.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package size={20} />
                        Reorder Suggestions
                    </h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Current Stock</th>
                                    <th>Avg Daily Sales</th>
                                    <th>Suggested Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reorderSuggestions.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                                            No reorder suggestions
                                        </td>
                                    </tr>
                                ) : (
                                    reorderSuggestions.map((suggestion, index) => (
                                        <tr key={index}>
                                            <td style={{ fontWeight: 500 }}>{suggestion.item.name}</td>
                                            <td>
                                                <span className={`badge ${suggestion.item.status === 'Out of Stock' ? 'badge-danger' : 'badge-warning'
                                                    }`}>
                                                    {suggestion.item.currentStock}
                                                </span>
                                            </td>
                                            <td>{suggestion.analytics.avgDailySales}</td>
                                            <td style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
                                                {suggestion.analytics.suggestedReorderQty}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {reorderSuggestions.length > 0 && (
                <div className="card" style={{ marginTop: '1.5rem', backgroundColor: '#dbeafe', border: '1px solid #93c5fd' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '1rem' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '0.5rem',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Package size={24} />
                        </div>
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#1e40af' }}>
                                Reorder Recommendations
                            </h4>
                            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
                                Based on sales velocity analysis, we recommend reordering {reorderSuggestions.length} items to maintain optimal stock levels.
                                The suggested quantities are calculated for a 30-day supply.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Predictions;
