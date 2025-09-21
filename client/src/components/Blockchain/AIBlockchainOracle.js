import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Zap,
  Target,
  BarChart3,
  Eye,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

const AIBlockchainOracle = () => {
  const [predictions, setPredictions] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [oracleData, setOracleData] = useState([]);
  const [processingStatus, setProcessingStatus] = useState('idle');

  useEffect(() => {
    fetchAIData();
    const interval = setInterval(fetchAIData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAIData = () => {
    // Generate AI-powered blockchain insights
    setPredictions([
      {
        id: 'quality_trend',
        type: 'Quality Trend',
        prediction: 'Quality scores will increase by 12% next month',
        confidence: 87,
        impact: 'high',
        timeframe: '30 days',
        factors: ['Improved farming practices', 'Better storage conditions', 'Enhanced quality control'],
        accuracy: 92
      },
      {
        id: 'supply_shortage',
        type: 'Supply Alert',
        prediction: 'Potential Ashwagandha shortage in 2 weeks',
        confidence: 73,
        impact: 'medium',
        timeframe: '14 days',
        factors: ['Weather conditions', 'Increased demand', 'Seasonal patterns'],
        accuracy: 85
      },
      {
        id: 'price_forecast',
        type: 'Price Forecast',
        prediction: 'Turmeric prices expected to rise 8% this quarter',
        confidence: 91,
        impact: 'high',
        timeframe: '90 days',
        factors: ['Export demand', 'Quality improvements', 'Supply chain efficiency'],
        accuracy: 89
      }
    ]);

    setAnomalies([
      {
        id: 'unusual_batch',
        type: 'Quality Anomaly',
        description: 'Batch #HERB001234 shows unusual quality patterns',
        severity: 'medium',
        confidence: 78,
        recommendation: 'Conduct additional quality testing',
        timestamp: new Date(Date.now() - 3600000),
        resolved: false
      },
      {
        id: 'supply_chain_delay',
        type: 'Supply Chain Anomaly',
        description: 'Unexpected delay in transportation route Mumbai-Delhi',
        severity: 'low',
        confidence: 82,
        recommendation: 'Monitor alternative routes',
        timestamp: new Date(Date.now() - 7200000),
        resolved: true
      },
      {
        id: 'fraud_detection',
        type: 'Fraud Alert',
        description: 'Potential documentation fraud detected in Batch #HERB001189',
        severity: 'high',
        confidence: 94,
        recommendation: 'Immediate investigation required',
        timestamp: new Date(Date.now() - 10800000),
        resolved: false
      }
    ]);

    setAiInsights([
      {
        category: 'Optimization',
        insight: 'Implementing blockchain automation could reduce verification time by 45%',
        impact: 'high',
        actionable: true
      },
      {
        category: 'Risk Management',
        insight: 'Diversifying supplier base can reduce supply chain risk by 30%',
        impact: 'medium',
        actionable: true
      },
      {
        category: 'Quality Enhancement',
        insight: 'AI-powered quality scoring improves accuracy by 23% over manual methods',
        impact: 'high',
        actionable: false
      },
      {
        category: 'Sustainability',
        insight: 'Carbon footprint can be reduced by 18% through route optimization',
        impact: 'medium',
        actionable: true
      }
    ]);

    setOracleData([
      {
        source: 'Weather API',
        data: 'Monsoon forecast: 12% above normal rainfall',
        reliability: 94,
        lastUpdate: new Date(Date.now() - 1800000),
        impact: 'Positive for herb cultivation'
      },
      {
        source: 'Market Data Feed',
        data: 'Global herb market growing at 8.2% CAGR',
        reliability: 89,
        lastUpdate: new Date(Date.now() - 3600000),
        impact: 'Bullish trend for prices'
      },
      {
        source: 'Regulatory Updates',
        data: 'New AYUSH quality standards effective Q2 2024',
        reliability: 98,
        lastUpdate: new Date(Date.now() - 7200000),
        impact: 'Compliance requirements updated'
      },
      {
        source: 'IoT Sensors',
        data: 'Average storage temperature: 22.5°C (Optimal)',
        reliability: 96,
        lastUpdate: new Date(Date.now() - 300000),
        impact: 'Quality preservation maintained'
      }
    ]);
  };

  const runAIAnalysis = async () => {
    setProcessingStatus('processing');
    toast.loading('Running AI analysis on blockchain data...');

    // Simulate AI processing
    setTimeout(() => {
      setProcessingStatus('completed');
      toast.success('🤖 AI analysis completed! New insights generated.');
      
      // Add a new insight
      const newInsight = {
        category: 'AI Analysis',
        insight: `Blockchain pattern analysis reveals ${Math.floor(Math.random() * 20 + 5)}% efficiency improvement opportunity`,
        impact: 'high',
        actionable: true,
        timestamp: new Date()
      };
      
      setAiInsights(prev => [newInsight, ...prev.slice(0, 3)]);
    }, 4000);
  };

  const resolveAnomaly = (anomalyId) => {
    setAnomalies(prev => prev.map(anomaly => 
      anomaly.id === anomalyId ? { ...anomaly, resolved: true } : anomaly
    ));
    toast.success('✅ Anomaly marked as resolved');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🤖 AI-Powered Blockchain Oracle
        </h2>
        <p className="text-gray-600">
          Advanced AI analytics, predictions, and real-time insights for blockchain data
        </p>
      </div>

      {/* AI Control Panel */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white bg-opacity-20 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI Neural Network Status</h3>
              <p className="text-purple-100">Processing blockchain data in real-time</p>
            </div>
          </div>
          <button
            onClick={runAIAnalysis}
            disabled={processingStatus === 'processing'}
            className="px-6 py-3 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            {processingStatus === 'processing' ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              'Run Deep Analysis'
            )}
          </button>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-500" />
          <span>AI Predictions</span>
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {predictions.map((prediction) => (
            <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {prediction.type}
                </span>
                <span className={`font-bold ${getConfidenceColor(prediction.confidence)}`}>
                  {prediction.confidence}% confidence
                </span>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-2">{prediction.prediction}</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Impact:</span>
                  <span className={`font-medium ${
                    prediction.impact === 'high' ? 'text-red-600' : 
                    prediction.impact === 'medium' ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {prediction.impact}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Timeframe:</span>
                  <span className="font-medium">{prediction.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accuracy:</span>
                  <span className="font-medium text-green-600">{prediction.accuracy}%</span>
                </div>
              </div>
              
              <div className="mt-3">
                <p className="text-xs text-gray-600 mb-1">Key Factors:</p>
                <div className="flex flex-wrap gap-1">
                  {prediction.factors.map((factor, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Anomaly Detection */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-orange-500" />
          <span>Anomaly Detection</span>
        </h3>
        <div className="space-y-4">
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className={`border rounded-lg p-4 ${
              anomaly.resolved ? 'border-green-200 bg-green-50' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {anomaly.resolved ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(anomaly.severity)}`}>
                    {anomaly.severity} severity
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(anomaly.timestamp).toLocaleString()}
                  </span>
                </div>
                <span className={`font-medium ${getConfidenceColor(anomaly.confidence)}`}>
                  {anomaly.confidence}% confidence
                </span>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1">{anomaly.type}</h4>
              <p className="text-gray-700 mb-2">{anomaly.description}</p>
              <p className="text-sm text-blue-600 mb-3">💡 {anomaly.recommendation}</p>
              
              {!anomaly.resolved && (
                <button
                  onClick={() => resolveAnomaly(anomaly.id)}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights & Oracle Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Insights */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Eye className="w-6 h-6 text-purple-500" />
            <span>AI Insights</span>
          </h3>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {insight.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${
                      insight.impact === 'high' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {insight.impact} impact
                    </span>
                    {insight.actionable && (
                      <Target className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                </div>
                <p className="text-gray-700">{insight.insight}</p>
                {insight.actionable && (
                  <button className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Take Action
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Oracle Data Sources */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Shield className="w-6 h-6 text-green-500" />
            <span>Oracle Data Sources</span>
          </h3>
          <div className="space-y-4">
            {oracleData.map((oracle, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{oracle.source}</h4>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      oracle.reliability >= 95 ? 'bg-green-600' : 
                      oracle.reliability >= 80 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}></div>
                    <span className="text-sm font-medium">{oracle.reliability}%</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-2">{oracle.data}</p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-600">{oracle.impact}</span>
                  <span className="text-gray-600">
                    Updated: {new Date(oracle.lastUpdate).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-6 h-6 text-indigo-500" />
          <span>AI Performance Metrics</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-xl inline-block mb-3">
              <Cpu className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">94.7%</p>
            <p className="text-sm text-gray-600">Prediction Accuracy</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-xl inline-block mb-3">
              <Zap className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">2.3s</p>
            <p className="text-sm text-gray-600">Processing Time</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-xl inline-block mb-3">
              <Brain className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">847</p>
            <p className="text-sm text-gray-600">Patterns Detected</p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-orange-100 rounded-xl inline-block mb-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">0.2%</p>
            <p className="text-sm text-gray-600">False Positive Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIBlockchainOracle;