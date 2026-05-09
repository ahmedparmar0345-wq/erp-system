import React, { useState, useEffect } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const DashboardCharts = () => {
    const [monthlyData, setMonthlyData] = useState({ months: [], revenue: [], expenses: [] });
    const [topProducts, setTopProducts] = useState([]);
    const [expenseCategories, setExpenseCategories] = useState([]);
    const [quickStats, setQuickStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchChartData();
    }, []);

    const fetchChartData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Fetch all chart data in parallel
            const [monthlyRes, productsRes, expensesRes, statsRes] = await Promise.all([
                fetch('/api/accounting-reports/charts/monthly-trend?months=6', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/accounting-reports/charts/top-products?limit=5', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/accounting-reports/charts/expense-categories', {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch('/api/accounting-reports/charts/quick-stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            const monthly = await monthlyRes.json();
            const products = await productsRes.json();
            const expenses = await expensesRes.json();
            const stats = await statsRes.json();

            setMonthlyData({
                months: monthly.map(m => m.month),
                revenue: monthly.map(m => parseFloat(m.revenue) || 0),
                expenses: monthly.map(m => parseFloat(m.expenses) || 0)
            });
            setTopProducts(products);
            setExpenseCategories(expenses);
            setQuickStats(stats);
        } catch (err) {
            console.error('Error fetching chart data:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return `$${(value || 0).toFixed(2)}`;
    };

    // Revenue vs Expenses Line Chart
    const revenueExpenseData = {
        labels: monthlyData.months,
        datasets: [
            {
                label: 'Revenue',
                data: monthlyData.revenue,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Expenses',
                data: monthlyData.expenses,
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ef4444',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    // Top Products Bar Chart
    const topProductsData = {
        labels: topProducts.map(p => p.product_name?.length > 20 ? p.product_name.substring(0, 20) + '...' : p.product_name),
        datasets: [
            {
                label: 'Sales Amount ($)',
                data: topProducts.map(p => parseFloat(p.total_amount) || 0),
                backgroundColor: '#3b82f6',
                borderRadius: 8,
                barPercentage: 0.7,
            }
        ]
    };

    // Expense Categories Pie Chart
    const expenseCategoriesData = {
        labels: expenseCategories.map(c => c.category),
        datasets: [
            {
                label: 'Expenses',
                data: expenseCategories.map(c => parseFloat(c.total) || 0),
                backgroundColor: [
                    '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
                ],
                borderWidth: 0,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        label += formatCurrency(context.raw);
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return formatCurrency(context.raw);
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return '$' + value.toLocaleString();
                    }
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                    }
                }
            }
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <div>Loading dashboard charts...</div>
            </div>
        );
    }

    return (
        <div>
            <style>{`@media (min-width: 768px) { .dashboard-charts-grid { grid-template-columns: repeat(2, 1fr) !important; } }`}</style>
            {/* Quick Stats Cards */}
            {quickStats && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>Today's Sales</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(quickStats.today_sales)}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>This Month</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{formatCurrency(quickStats.month_sales)}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>Total Customers</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{quickStats.total_customers}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
                        <div style={{ fontSize: '12px', color: '#666' }}>Low Stock Alerts</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: quickStats.low_stock_count > 0 ? '#ef4444' : '#333' }}>
                            {quickStats.low_stock_count}
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: '25px',
                marginBottom: '25px'
            }} className="dashboard-charts-grid">
                {/* Revenue vs Expenses Trend */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Revenue vs Expenses Trend</h3>
                    <div style={{ height: '300px' }}>
                        <Line data={revenueExpenseData} options={chartOptions} />
                    </div>
                </div>

                {/* Top Selling Products */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Top Selling Products</h3>
                    <div style={{ height: '300px' }}>
                        <Bar data={topProductsData} options={barOptions} />
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Expense Breakdown by Category</h3>
                    <div style={{ height: '300px' }}>
                        {expenseCategories.length > 0 ? (
                            <Doughnut data={expenseCategoriesData} options={pieOptions} />
                        ) : (
                            <p style={{ textAlign: 'center', paddingTop: '100px', color: '#999' }}>No expense data available</p>
                        )}
                    </div>
                </div>

                {/* Profit Summary */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Summary</h3>
                    {monthlyData.revenue.length > 0 && (
                        <div>
                            <div style={{
                                backgroundColor: '#f0fdf4',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Total Revenue (Last 6 months)</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>
                                    {formatCurrency(monthlyData.revenue.reduce((a, b) => a + b, 0))}
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: '#fef2f2',
                                borderRadius: '8px',
                                padding: '15px',
                                marginBottom: '15px'
                            }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Total Expenses (Last 6 months)</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>
                                    {formatCurrency(monthlyData.expenses.reduce((a, b) => a + b, 0))}
                                </div>
                            </div>
                            <div style={{
                                backgroundColor: '#e0e7ff',
                                borderRadius: '8px',
                                padding: '15px'
                            }}>
                                <div style={{ fontSize: '12px', color: '#666' }}>Net Profit (Last 6 months)</div>
                                <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>
                                    {formatCurrency(
                                        monthlyData.revenue.reduce((a, b) => a + b, 0) -
                                        monthlyData.expenses.reduce((a, b) => a + b, 0)
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;