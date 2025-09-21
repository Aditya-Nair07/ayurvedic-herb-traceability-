import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package, 
  Award,
  Activity,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';

const BlockchainAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('transactions');

  useEffect(() => {
    const fetchAnalytics = () => {
      // Generate comprehensive blockchain analytics
      const mockAnalytics = {
        overview: {
          totalValue: Math.floor(Math.random() * 1000000) + 500000,
          totalTransactions: Math.floor(Math.random() * 50000) + 25000,
          activeUsers: Math.floor(Math.random() * 1000) + 500,
          avgTransactionValue: Math.floor(Math.random() * 500) + 200,
          networkEfficiency: (Math.random() * 10 + 90).toFixed(1),
          carbonFootprint: (Math.random() * 5 + 2).toFixed(2)
        },
        trends: generateTrendData(),
        supplyChainMetrics: {
          farmsOnboarded: Math.floor(Math.random() * 200) + 150,
          processorsActive: Math.floor(Math.random() * 50) + 30,
          laboratoriesCertified: Math.floor(Math.random() * 20) + 15,
          regulatorsConnected: Math.floor(Math.random() * 10) + 5
        },
        qualityMetrics: generateQualityData(),
        geographicDistribution: [
          { region: 'North India', value: 35, transactions: 8500 },
          { region: 'South India', value: 28, transactions: 6800 },
          { region: 'West India', value: 22, transactions: 5200 },
          { region: 'East India', value: 15, transactions: 3500 }
        ],
        herbPopularity: [
          { name: 'Turmeric', transactions: 4500, value: 125000, trend: '+12%' },
          { name: 'Ashwagandha', transactions: 3200, value: 98000, trend: '+8%' },
          { name: 'Brahmi', transactions: 2800, value: 76000, trend: '+15%' },
          { name: 'Neem', transactions: 2100, value: 54000, trend: '+5%' },
          { name: 'Tulsi', transactions: 1900, value: 43000, trend: '+22%' }
        ],
        consensusHealth: {
          validatorNodes: 24,
          averageBlockTime: 3.2,
          networkHashRate: '2.5 TH/s',
          forkEvents: 0,
          uptimePercentage: 99.97
        }
      };

      setAnalytics(mockAnalytics);
    };

    fetchAnalytics();
  }, [timeRange]);

  const generateTrendData = () => {
    const days = timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i - 1) * (timeRange === '24h' ? 3600000 : 86400000)).toISOString().split('T')[0],
      transactions: Math.floor(Math.random() * 1000) + 500,
      value: Math.floor(Math.random() * 50000) + 25000,
      users: Math.floor(Math.random() * 100) + 50,
      quality: Math.floor(Math.random() * 20) + 80
    }));
  };

  const generateQualityData = () => {
    return [
      { grade: 'Premium A+', count: 156, percentage: 45, color: '#10B981' },
      { grade: 'Grade A', count: 112, percentage: 32, color: '#3B82F6' },
      { grade: 'Grade B', count: 58, percentage: 17, color: '#F59E0B' },
      { grade: 'Grade C', count: 21, percentage: 6, color: '#EF4444' }
    ];
  };

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          📊 Advanced Blockchain Analytics
        </h2>
        <p className="text-gray-600">
          Deep insights into blockchain performance, supply chain metrics, and quality analytics
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex justify-center space-x-2">
        {['24h', '7d', '30d', '90d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Network Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.overview.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-600 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalTransactions.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
            <span className="text-blue-600">+8.3%</span>
            <span className="text-gray-600 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.activeUsers.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
            <span className="text-purple-600">+15.7%</span>
            <span className="text-gray-600 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Network Efficiency</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.networkEfficiency}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
            <span className="text-orange-600">+2.1%</span>
            <span className="text-gray-600 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">Performance Trends</h3>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
            >
              <option value="transactions">Transactions</option>
              <option value="value">Value</option>
              <option value="users">Users</option>
              <option value="quality">Quality Score</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Herb Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={analytics.qualityMetrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.qualityMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supply Chain Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Supply Chain Network</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-xl inline-block mb-3">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.supplyChainMetrics.farmsOnboarded}</p>
            <p className="text-sm text-gray-600">Farms Onboarded</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-xl inline-block mb-3">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.supplyChainMetrics.processorsActive}</p>
            <p className="text-sm text-gray-600">Active Processors</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-xl inline-block mb-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.supplyChainMetrics.laboratoriesCertified}</p>
            <p className="text-sm text-gray-600">Certified Labs</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-orange-100 rounded-xl inline-block mb-3">
              <Users className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.supplyChainMetrics.regulatorsConnected}</p>
            <p className="text-sm text-gray-600">Connected Regulators</p>
          </div>
        </div>
      </div>

      {/* Herb Popularity and Geographic Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Herbs */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Most Traded Herbs</h3>
          <div className="space-y-3">
            {analytics.herbPopularity.map((herb, index) => (
              <div key={herb.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-green-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{herb.name}</p>
                    <p className="text-sm text-gray-600">{herb.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${herb.value.toLocaleString()}</p>
                  <p className="text-sm text-green-600">{herb.trend}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Regional Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.geographicDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Consensus and Network Health */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Network Health & Consensus</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.consensusHealth.validatorNodes}</p>
            <p className="text-sm text-gray-600">Validator Nodes</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.consensusHealth.averageBlockTime}s</p>
            <p className="text-sm text-gray-600">Avg Block Time</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.consensusHealth.networkHashRate}</p>
            <p className="text-sm text-gray-600">Hash Rate</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{analytics.consensusHealth.forkEvents}</p>
            <p className="text-sm text-gray-600">Fork Events</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{analytics.consensusHealth.uptimePercentage}%</p>
            <p className="text-sm text-gray-600">Network Uptime</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainAnalytics;