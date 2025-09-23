import React, { useState, useEffect } from 'react';
import { Shield, Activity, Database, Network, Hash, Clock, TrendingUp, Eye, Cpu, Coins, BarChart3, Code, Gamepad2, Leaf } from 'lucide-react';
import BlockchainVerification from '../../components/Blockchain/BlockchainVerification';
import SmartContractInterface from '../../components/Blockchain/SmartContractInterface';
import BlockchainAnalytics from '../../components/Blockchain/BlockchainAnalytics';
import TokenEconomy from '../../components/Blockchain/TokenEconomy';
import AIBlockchainOracle from '../../components/Blockchain/AIBlockchainOracle';
import SupplyChainSimulator from '../../components/Blockchain/SupplyChainSimulator';
import CarbonCreditSystem from '../../components/Blockchain/CarbonCreditSystem';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const BlockchainDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [networkStatus, setNetworkStatus] = useState('healthy');
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const handleRetry = () => {
    toast('Retrying blockchain data fetch...', {
      icon: '🔄',
      duration: 2000
    });
    fetchBlockchainData();
  };

  const fetchBlockchainData = async () => {
    try {
      setLoading(true);
      
      // Fetch blockchain network status
      const [statusResponse, transactionsResponse] = await Promise.all([
        api.get('/blockchain/status'),
        api.get('/blockchain/transactions?limit=10')
      ]);
      
      if (statusResponse.data.success) {
        setStats(statusResponse.data.data);
        setNetworkStatus(statusResponse.data.data.status);
        toast.success('Blockchain network data loaded successfully!');
      }
      
      if (transactionsResponse.data.success) {
        setRecentTransactions(transactionsResponse.data.data);
      }
      
    } catch (error) {
      console.error('Error fetching blockchain data:', error);
      
      // Enhanced error handling with user-friendly feedback
      let errorMessage = 'Failed to load blockchain data';
      
      if (error.response?.status === 404) {
        errorMessage = 'Blockchain service endpoints not found. Please ensure the server is running with blockchain routes.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Blockchain service temporarily unavailable. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network connection failed. Please check your connection and try again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      setNetworkStatus('error');
      
      // Fallback to mock data if API fails
      const mockStats = {
        totalTransactions: Math.floor(Math.random() * 10000) + 15000,
        totalBlocks: Math.floor(Math.random() * 5000) + 8000,
        activeNodes: 4,
        networkHashRate: '2.5 TH/s',
        avgBlockTime: '3.2s',
        lastBlockTime: new Date(Date.now() - Math.random() * 300000).toISOString(),
        chainHeight: Math.floor(Math.random() * 5000) + 8000,
        consensusAlgorithm: 'PBFT',
        networkId: 'herb-channel',
        chaincodeName: 'herb-traceability'
      };

      const mockTransactions = Array.from({ length: 10 }, (_, i) => ({
        id: `tx-${Date.now()}-${i}`,
        type: ['CreateBatch', 'AddEvent', 'GenerateQR', 'UpdateCompliance'][Math.floor(Math.random() * 4)],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        blockNumber: mockStats.chainHeight - i,
        status: 'VALID',
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        batchId: `BATCH${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        actor: ['farmer001', 'processor001', 'lab001'][Math.floor(Math.random() * 3)]
      }));

      setStats(mockStats);
      setRecentTransactions(mockTransactions);
      setNetworkStatus('demo');
      
      toast('Running in demo mode with simulated blockchain data.', {
        icon: 'ℹ️',
        duration: 4000
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      'CreateBatch': 'bg-blue-100 text-blue-800',
      'AddEvent': 'bg-green-100 text-green-800',
      'GenerateQR': 'bg-purple-100 text-purple-800',
      'UpdateCompliance': 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔗 Advanced Blockchain Ecosystem
          </h1>
          <p className="text-gray-600 text-lg">
            Next-Generation Blockchain Platform for BioTrace
          </p>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full mt-4 ${
            networkStatus === 'healthy' ? 'bg-green-100 text-green-800' : 
            networkStatus === 'demo' ? 'bg-blue-100 text-blue-800' :
            'bg-red-100 text-red-800'
          }`}>
            <Activity className="w-4 h-4" />
            <span className="font-medium">
              Network Status: {networkStatus === 'demo' ? 'DEMO MODE' : networkStatus.toUpperCase()}
            </span>
            {networkStatus === 'error' && (
              <button
                onClick={handleRetry}
                className="ml-2 px-3 py-1 bg-red-600 text-white text-xs rounded-full hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex bg-gray-100 rounded-xl p-1">
            {[
              { id: 'overview', label: 'Network Overview', icon: Database },
              { id: 'analytics', label: 'Advanced Analytics', icon: BarChart3 },
              { id: 'contracts', label: 'Smart Contracts', icon: Code },
              { id: 'tokens', label: 'Token Economy', icon: Coins },
              { id: 'ai', label: 'AI Oracle', icon: Cpu },
              { id: 'simulator', label: 'Supply Chain Game', icon: Gamepad2 },
              { id: 'carbon', label: 'Carbon Credits', icon: Leaf }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Blocks</h3>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalBlocks.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <Hash className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalTransactions.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Network className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Active Nodes</h3>
                <p className="text-2xl font-bold text-gray-900">{stats?.activeNodes}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-orange-100 rounded-xl">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Avg Block Time</h3>
                <p className="text-2xl font-bold text-gray-900">{stats?.avgBlockTime}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span>Network Configuration</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Network ID</span>
                <span className="text-blue-600 font-mono">{stats?.networkId}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Chaincode</span>
                <span className="text-purple-600 font-mono">{stats?.chaincodeName}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Consensus</span>
                <span className="text-green-600 font-medium">{stats?.consensusAlgorithm}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Chain Height</span>
                <span className="text-orange-600 font-mono">{stats?.chainHeight.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              <span>Performance Metrics</span>
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Hash Rate</span>
                <span className="text-blue-600 font-mono">{stats?.networkHashRate}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Last Block</span>
                <span className="text-purple-600 text-sm">
                  {new Date(stats?.lastBlockTime).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">Network Uptime</span>
                <span className="text-green-600 font-medium">99.9%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-gray-700">TPS (Current)</span>
                <span className="text-orange-600 font-mono">12.5</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
              <Activity className="w-6 h-6 text-green-600" />
              <span>Recent Blockchain Transactions</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Block
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {tx.id.substring(0, 20)}...
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTransactionTypeColor(tx.type)}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{tx.blockNumber.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.batchId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTransaction(tx)}
                        className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Verify</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

          </>
        )}

        {activeTab === 'analytics' && <BlockchainAnalytics />}
        {activeTab === 'contracts' && <SmartContractInterface />}
        {activeTab === 'tokens' && <TokenEconomy />}
        {activeTab === 'ai' && <AIBlockchainOracle />}
        {activeTab === 'simulator' && <SupplyChainSimulator />}
        {activeTab === 'carbon' && <CarbonCreditSystem />}

        {/* Blockchain Verification Modal */}
        {selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="bg-white rounded-xl shadow-xl">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-900">Transaction Verification</h3>
                    <button
                      onClick={() => setSelectedTransaction(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <BlockchainVerification 
                    eventData={selectedTransaction}
                    batchData={{ batchId: selectedTransaction.batchId }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainDashboard;