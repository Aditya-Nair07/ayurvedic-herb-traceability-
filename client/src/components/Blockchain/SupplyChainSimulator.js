import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Truck, 
  Factory, 
  FlaskConical, 
  Store,
  Coins,
  Timer,
  Target,
  Award,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const SupplyChainSimulator = () => {
  const [gameState, setGameState] = useState('stopped'); // stopped, running, paused
  const [currentBatch, setCurrentBatch] = useState(null);
  const [simulation, setSimulation] = useState(null);
  const [gameStats, setGameStats] = useState({
    batchesProcessed: 0,
    totalRevenue: 0,
    qualityScore: 0,
    efficiencyRating: 0,
    sustainabilityPoints: 0
  });
  const [challenges, setChallenges] = useState([]);
  const [decisions, setDecisions] = useState([]);

  useEffect(() => {
    initializeGame();
  }, []);

  const generateNewBatch = useCallback(() => ({
    id: `GAME${Date.now()}`,
    herb: ['Turmeric', 'Ashwagandha', 'Brahmi', 'Neem'][Math.floor(Math.random() * 4)],
    quantity: Math.floor(Math.random() * 500) + 100,
    farmLocation: ['Punjab', 'Kerala', 'Gujarat', 'Karnataka'][Math.floor(Math.random() * 4)],
    targetQuality: Math.floor(Math.random() * 20) + 80,
    estimatedValue: Math.floor(Math.random() * 50000) + 25000,
    complexity: Math.floor(Math.random() * 3) + 1 // 1-3
  }), []);

  const completeBatch = useCallback(() => {
    try {
      if (!currentBatch) {
        toast.error('❌ No active batch to complete');
        return;
      }
      
      const revenue = currentBatch.estimatedValue * (1 + (gameStats.qualityScore - 50) / 100);
      
      setGameStats(prev => ({
        ...prev,
        batchesProcessed: prev.batchesProcessed + 1,
        totalRevenue: prev.totalRevenue + revenue,
        qualityScore: Math.min(100, prev.qualityScore + Math.random() * 5),
        efficiencyRating: Math.min(100, prev.efficiencyRating + Math.random() * 3),
        sustainabilityPoints: Math.min(100, prev.sustainabilityPoints + Math.random() * 2)
      }));
      
      toast.success(`✅ Batch ${currentBatch.id} completed! Revenue: $${revenue.toFixed(0)}`);
      
      // Generate new batch and restart simulation
      setTimeout(() => {
        try {
          const newBatch = generateNewBatch();
          setCurrentBatch(newBatch);
          
          // Create fresh simulation state
          const newSimulation = {
            currentStage: 0,
            stages: [
              { name: 'Cultivation', duration: 5, icon: '🌱', status: 'active' },
              { name: 'Harvesting', duration: 3, icon: '🚜', status: 'pending' },
              { name: 'Processing', duration: 4, icon: '🏭', status: 'pending' },
              { name: 'Quality Testing', duration: 2, icon: '🔬', status: 'pending' },
              { name: 'Packaging', duration: 2, icon: '📦', status: 'pending' },
              { name: 'Distribution', duration: 3, icon: '🚛', status: 'pending' }
            ],
            timeRemaining: 5,
            blocksGenerated: 0
          };
          
          setSimulation(newSimulation);
          
        } catch (error) {
          console.error('Error generating new batch:', error);
          toast.error('❌ Failed to generate new batch');
          setGameState('stopped');
        }
      }, 1000);
    } catch (error) {
      console.error('Error completing batch:', error);
      toast.error('❌ Error completing batch');
      setGameState('stopped');
    }
  }, [currentBatch, gameStats.qualityScore, generateNewBatch]);

  const triggerRandomChallenge = useCallback(() => {
    try {
      const availableChallenges = challenges.filter(c => !c.active && Math.random() * 100 < c.probability);
      
      if (availableChallenges.length > 0) {
        const challenge = availableChallenges[0];
        setChallenges(prev => prev.map(c => 
          c.id === challenge.id ? { ...c, active: true } : c
        ));
        
        setDecisions(prev => [...prev, {
          id: Date.now(),
          challenge: challenge.id,
          title: challenge.title,
          description: challenge.description,
          options: [
            { id: 'accept', label: 'Accept Impact', cost: 0, benefit: 'Maintain timeline' },
            { id: 'mitigate', label: 'Mitigate Risk', cost: 5000, benefit: 'Reduce impact by 50%' },
            { id: 'innovate', label: 'Blockchain Solution', cost: 15000, benefit: 'Turn challenge into opportunity' }
          ]
        }]);
        
        toast(`⚠️ Challenge: ${challenge.title}`, { icon: '🎯' });
      }
    } catch (error) {
      console.error('Error triggering challenge:', error);
      toast.error('❌ Error generating challenge');
    }
  }, [challenges]);

  const updateSimulation = useCallback(() => {
    setSimulation(prev => {
      // Comprehensive null safety check
      if (!prev || !prev.stages || !Array.isArray(prev.stages) || prev.stages.length === 0) {
        console.warn('Simulation state is invalid:', prev);
        toast.error('⚠️ Simulation error detected, please restart the game');
        return null;
      }
      
      // Validate current stage index
      if (prev.currentStage < 0 || prev.currentStage >= prev.stages.length) {
        console.warn('Invalid current stage:', prev.currentStage);
        return null;
      }
      
      const newTimeRemaining = prev.timeRemaining - 1;
      
      if (newTimeRemaining <= 0) {
        // Move to next stage
        const nextStage = prev.currentStage + 1;
        
        if (nextStage >= prev.stages.length) {
          // Batch completed - return null to stop simulation
          return null;
        }
        
        // Validate next stage exists
        if (!prev.stages[nextStage] || typeof prev.stages[nextStage].duration !== 'number') {
          console.warn('Invalid next stage:', prev.stages[nextStage]);
          return null;
        }
        
        return {
          ...prev,
          currentStage: nextStage,
          timeRemaining: prev.stages[nextStage].duration,
          stages: prev.stages.map((stage, index) => ({
            ...stage,
            status: index < nextStage ? 'completed' : 
                   index === nextStage ? 'active' : 'pending'
          })),
          blocksGenerated: prev.blocksGenerated + 1
        };
      }
      
      return {
        ...prev,
        timeRemaining: newTimeRemaining
      };
    });
  }, []);

  useEffect(() => {
    let interval;
    if (gameState === 'running' && simulation) {
      interval = setInterval(() => {
        updateSimulation();
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [gameState, simulation, updateSimulation]);

  // Separate effect to handle batch completion
  useEffect(() => {
    // Only trigger completion if simulation becomes null while game is running and we have a current batch
    if (simulation === null && gameState === 'running' && currentBatch) {
      // Add a small delay to prevent rapid state changes
      const completionTimer = setTimeout(() => {
        completeBatch();
      }, 100);
      
      return () => clearTimeout(completionTimer);
    }
  }, [simulation, gameState, currentBatch, completeBatch]);

  // Separate effect to handle random challenges
  useEffect(() => {
    let challengeInterval;
    if (gameState === 'running' && simulation) {
      challengeInterval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance per interval
          triggerRandomChallenge();
        }
      }, 5000); // Check every 5 seconds
    }
    return () => clearInterval(challengeInterval);
  }, [gameState, simulation, triggerRandomChallenge]);

  const initializeGame = () => {
    setGameStats({
      batchesProcessed: 0,
      totalRevenue: 0,
      qualityScore: 85,
      efficiencyRating: 75,
      sustainabilityPoints: 60
    });
    
    setChallenges([
      {
        id: 'weather_delay',
        title: 'Monsoon Delays',
        description: 'Heavy rains are affecting herb cultivation',
        impact: 'Quality -5%, Delivery +2 days',
        probability: 30,
        active: false
      },
      {
        id: 'quality_issue',
        title: 'Quality Control Alert',
        description: 'Lab detected contamination in latest batch',
        impact: 'Quality -15%, Revenue -20%',
        probability: 15,
        active: false
      },
      {
        id: 'demand_surge',
        title: 'Market Demand Surge',
        description: 'Export orders increased by 40%',
        impact: 'Revenue +30%, Pressure +20%',
        probability: 25,
        active: false
      },
      {
        id: 'transport_strike',
        title: 'Transportation Strike',
        description: 'Truck drivers on strike affecting deliveries',
        impact: 'Delivery +3 days, Cost +15%',
        probability: 20,
        active: false
      }
    ]);
  };

  const startSimulation = () => {
    try {
      // Clear any existing state first
      setGameState('stopped');
      setCurrentBatch(null);
      setSimulation(null);
      setDecisions([]);
      
      // Generate new batch
      const newBatch = generateNewBatch();
      setCurrentBatch(newBatch);
      setGameState('running');
      
      // Create fresh simulation state with validation
      const sim = {
        currentStage: 0,
        stages: [
          { name: 'Cultivation', duration: 5, icon: '🌱', status: 'active' },
          { name: 'Harvesting', duration: 3, icon: '🚜', status: 'pending' },
          { name: 'Processing', duration: 4, icon: '🏭', status: 'pending' },
          { name: 'Quality Testing', duration: 2, icon: '🔬', status: 'pending' },
          { name: 'Packaging', duration: 2, icon: '📦', status: 'pending' },
          { name: 'Distribution', duration: 3, icon: '🚛', status: 'pending' }
        ],
        timeRemaining: 5,
        blocksGenerated: 0
      };
      
      // Validate simulation state before setting
      if (!sim.stages || sim.stages.length === 0) {
        throw new Error('Invalid simulation stages');
      }
      
      setSimulation(sim);
      toast('🎮 Supply chain simulation started!', { icon: '🚀' });
    } catch (error) {
      console.error('Error starting simulation:', error);
      toast.error('❌ Failed to start simulation. Please try again.');
      setGameState('stopped');
      setCurrentBatch(null);
      setSimulation(null);
    }
  };

  const pauseSimulation = () => {
    setGameState('paused');
    toast('⏸️ Simulation paused');
  };

  const resetSimulation = () => {
    try {
      setGameState('stopped');
      setCurrentBatch(null);
      setSimulation(null);
      setDecisions([]);
      setChallenges(prev => prev.map(c => ({ ...c, active: false })));
      initializeGame();
      toast('🔄 Simulation reset successfully');
    } catch (error) {
      console.error('Error resetting simulation:', error);
      toast.error('❌ Error resetting simulation');
      // Force reset state even if error occurs
      setGameState('stopped');
      setCurrentBatch(null);
      setSimulation(null);
      setDecisions([]);
    }
  };

  const makeDecision = (decisionId, optionId) => {
    try {
      const decision = decisions.find(d => d.id === decisionId);
      if (!decision) {
        toast.error('❌ Decision not found');
        return;
      }
      
      const option = decision.options.find(o => o.id === optionId);
      if (!option) {
        toast.error('❌ Invalid decision option');
        return;
      }
      
      // Apply decision effects
      if (optionId === 'innovate') {
        setGameStats(prev => ({
          ...prev,
          totalRevenue: prev.totalRevenue - option.cost,
          qualityScore: Math.min(100, prev.qualityScore + 10),
          sustainabilityPoints: Math.min(100, prev.sustainabilityPoints + 15)
        }));
      } else if (optionId === 'mitigate') {
        setGameStats(prev => ({
          ...prev,
          totalRevenue: prev.totalRevenue - option.cost,
          efficiencyRating: Math.min(100, prev.efficiencyRating + 5)
        }));
      }
      
      // Remove decision and challenge
      setDecisions(prev => prev.filter(d => d.id !== decisionId));
      setChallenges(prev => prev.map(c => 
        c.id === decision.challenge ? { ...c, active: false } : c
      ));
      
      toast.success(`✅ Decision made: ${option.label}`);
    } catch (error) {
      console.error('Error making decision:', error);
      toast.error('❌ Error processing decision');
    }
  };

  const getStageIcon = (stage) => {
    const icons = {
      'Cultivation': '🌱',
      'Harvesting': '🚜', 
      'Processing': '🏭',
      'Quality Testing': '🔬',
      'Packaging': '📦',
      'Distribution': '🚛'
    };
    return icons[stage.name] || '⚪';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎮 Supply Chain Simulation Game
        </h2>
        <p className="text-gray-600">
          Interactive blockchain-powered supply chain management simulation
        </p>
      </div>

      {/* Game Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={startSimulation}
                disabled={gameState === 'running'}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Start</span>
              </button>
              <button
                onClick={pauseSimulation}
                disabled={gameState !== 'running'}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
              <button
                onClick={resetSimulation}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              gameState === 'running' ? 'bg-green-100 text-green-800' :
              gameState === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-600'
            }`}>
              {gameState.charAt(0).toUpperCase() + gameState.slice(1)}
            </div>
          </div>

          {/* Game Stats */}
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-600">Batches</p>
              <p className="text-lg font-bold text-gray-900">{gameStats.batchesProcessed}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenue</p>
              <p className="text-lg font-bold text-green-600">${gameStats.totalRevenue.toFixed(0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quality</p>
              <p className="text-lg font-bold text-blue-600">{gameStats.qualityScore.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Efficiency</p>
              <p className="text-lg font-bold text-purple-600">{gameStats.efficiencyRating.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Sustainability</p>
              <p className="text-lg font-bold text-emerald-600">{gameStats.sustainabilityPoints.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Batch & Simulation */}
      {currentBatch && simulation && simulation.stages && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Batch Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Current Batch</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Batch ID:</span>
                <code className="text-blue-600 font-mono">{currentBatch.id}</code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Herb Type:</span>
                <span className="font-medium">{currentBatch.herb}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{currentBatch.quantity} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Farm Location:</span>
                <span className="font-medium">{currentBatch.farmLocation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Target Quality:</span>
                <span className="font-medium">{currentBatch.targetQuality}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Value:</span>
                <span className="font-medium text-green-600">${currentBatch.estimatedValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Complexity:</span>
                <div className="flex space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-full ${
                        i < currentBatch.complexity ? 'bg-orange-400' : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Supply Chain Progress */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Supply Chain Progress</h3>
              <div className="flex items-center space-x-2">
                <Timer className="w-4 h-4 text-gray-600" />
                <span className="font-medium">{simulation?.timeRemaining || 0}s remaining</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {simulation.stages && simulation.stages.map((stage, index) => (
                <div key={index} className={`border rounded-lg p-3 ${getStatusColor(stage.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getStageIcon(stage)}</span>
                      <div>
                        <h4 className="font-medium">{stage.name}</h4>
                        <p className="text-xs opacity-75">Duration: {stage.duration}s</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {stage.status === 'active' && (
                        <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      )}
                      {stage.status === 'completed' && (
                        <div className="text-green-600">✓</div>
                      )}
                    </div>
                  </div>
                  
                  {stage.status === 'active' && simulation && simulation.timeRemaining !== undefined && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${((stage.duration - simulation.timeRemaining) / stage.duration) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Blockchain blocks generated: {simulation?.blocksGenerated || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decision Making */}
      {decisions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-6 h-6 text-orange-500" />
            <span>Decision Required</span>
          </h3>
          {decisions.map((decision) => (
            <div key={decision.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50">
              <h4 className="font-bold text-gray-900 mb-2">{decision.title}</h4>
              <p className="text-gray-700 mb-4">{decision.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {decision.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => makeDecision(decision.id, option.id)}
                    className="p-3 border border-gray-300 rounded-lg hover:bg-white transition-colors text-left"
                  >
                    <h5 className="font-medium text-gray-900">{option.label}</h5>
                    <p className="text-sm text-gray-600 mt-1">{option.benefit}</p>
                    {option.cost > 0 && (
                      <p className="text-sm text-red-600 mt-1">Cost: ${option.cost.toLocaleString()}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Performance Dashboard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-4 bg-green-100 rounded-xl inline-block mb-3">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold text-gray-900">
              {gameStats.batchesProcessed > 0 ? '100%' : '0%'}
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-blue-100 rounded-xl inline-block mb-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-gray-600">Avg Revenue/Batch</p>
            <p className="text-2xl font-bold text-gray-900">
              ${gameStats.batchesProcessed > 0 ? (gameStats.totalRevenue / gameStats.batchesProcessed).toFixed(0) : '0'}
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-purple-100 rounded-xl inline-block mb-3">
              <Award className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-gray-600">Quality Rating</p>
            <p className="text-2xl font-bold text-gray-900">
              {gameStats.qualityScore >= 90 ? 'A+' : gameStats.qualityScore >= 80 ? 'A' : 'B'}
            </p>
          </div>
          <div className="text-center">
            <div className="p-4 bg-emerald-100 rounded-xl inline-block mb-3">
              <Coins className="w-8 h-8 text-emerald-600" />
            </div>
            <p className="text-sm text-gray-600">HERB Tokens Earned</p>
            <p className="text-2xl font-bold text-gray-900">
              {Math.floor(gameStats.totalRevenue / 100)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplyChainSimulator;