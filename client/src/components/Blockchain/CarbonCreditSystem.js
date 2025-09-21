import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Award, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Globe, 
  TreePine, 
  Droplets,
  Zap,
  Recycle,
  Wind,
  Sun,
  Factory,
  Truck
} from 'lucide-react';
import toast from 'react-hot-toast';

const CarbonCreditSystem = () => {
  const [carbonData, setCarbonData] = useState(null);
  const [sustainabilityScore, setSustainabilityScore] = useState(0);
  const [carbonCredits, setCarbonCredits] = useState(0);
  const [offsetProjects, setOffsetProjects] = useState([]);
  const [carbonFootprint, setCarbonFootprint] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchCarbonData();
  }, []);

  const fetchCarbonData = () => {
    // Mock carbon tracking data
    setCarbonData({
      totalEmissions: 450.2, // kg CO2
      offsetCredits: 125.8,
      netEmissions: 324.4,
      reductionTarget: 500.0,
      progress: 68.5
    });

    setSustainabilityScore(78.5);
    setCarbonCredits(1250);

    setOffsetProjects([
      {
        id: 'solar_farm',
        name: 'Solar Farm Initiative',
        type: 'Renewable Energy',
        location: 'Rajasthan',
        creditsGenerated: 45.2,
        costPerCredit: 12.50,
        status: 'active',
        impact: 'Reducing grid dependency by 15%',
        icon: Sun,
        color: 'text-yellow-600 bg-yellow-100'
      },
      {
        id: 'reforestation',
        name: 'Herb Garden Reforestation',
        type: 'Carbon Sequestration',
        location: 'Kerala',
        creditsGenerated: 32.8,
        costPerCredit: 8.75,
        status: 'active',
        impact: '500 native trees planted',
        icon: TreePine,
        color: 'text-green-600 bg-green-100'
      },
      {
        id: 'biogas_plant',
        name: 'Organic Waste Biogas',
        type: 'Waste Management',
        location: 'Punjab',
        creditsGenerated: 28.5,
        costPerCredit: 10.20,
        status: 'pending',
        impact: 'Processing 2 tons of organic waste daily',
        icon: Recycle,
        color: 'text-blue-600 bg-blue-100'
      },
      {
        id: 'wind_power',
        name: 'Wind Energy Co-op',
        type: 'Renewable Energy',
        location: 'Gujarat',
        creditsGenerated: 19.3,
        costPerCredit: 15.80,
        status: 'active',
        impact: 'Powering 3 processing facilities',
        icon: Wind,
        color: 'text-indigo-600 bg-indigo-100'
      }
    ]);

    setCarbonFootprint([
      {
        category: 'Transportation',
        emissions: 185.4,
        percentage: 41,
        trend: -5.2,
        initiatives: ['Electric vehicle adoption', 'Route optimization', 'Local sourcing'],
        icon: Truck,
        color: 'text-red-600'
      },
      {
        category: 'Energy Usage',
        emissions: 142.8,
        percentage: 32,
        trend: -8.1,
        initiatives: ['Solar panels', 'LED lighting', 'Energy-efficient equipment'],
        icon: Zap,
        color: 'text-orange-600'
      },
      {
        category: 'Processing',
        emissions: 89.5,
        percentage: 20,
        trend: -2.8,
        initiatives: ['Process optimization', 'Heat recovery', 'Efficient machinery'],
        icon: Factory,
        color: 'text-blue-600'
      },
      {
        category: 'Water Usage',
        emissions: 32.5,
        percentage: 7,
        trend: -12.5,
        initiatives: ['Rainwater harvesting', 'Water recycling', 'Drip irrigation'],
        icon: Droplets,
        color: 'text-cyan-600'
      }
    ]);

    setAchievements([
      {
        id: 'carbon_neutral',
        title: 'Carbon Neutral Pioneer',
        description: 'Achieve net-zero carbon emissions',
        progress: 72,
        target: 100,
        reward: '500 GREEN tokens',
        icon: '🌍',
        unlocked: false
      },
      {
        id: 'renewable_champion',
        title: 'Renewable Energy Champion',
        description: 'Power 80% operations with renewable energy',
        progress: 100,
        target: 100,
        reward: '300 GREEN tokens',
        icon: '⚡',
        unlocked: true
      },
      {
        id: 'waste_wizard',
        title: 'Zero Waste Wizard',
        description: 'Achieve 95% waste recycling rate',
        progress: 87,
        target: 100,
        reward: '400 GREEN tokens',
        icon: '♻️',
        unlocked: false
      },
      {
        id: 'forest_guardian',
        title: 'Forest Guardian',
        description: 'Plant 1000 trees through offset programs',
        progress: 100,
        target: 100,
        reward: '600 GREEN tokens',
        icon: '🌳',
        unlocked: true
      }
    ]);
  };

  const purchaseCredits = (projectId, amount) => {
    const project = offsetProjects.find(p => p.id === projectId);
    const cost = amount * project.costPerCredit;
    
    setCarbonCredits(prev => prev - cost);
    setCarbonData(prev => ({
      ...prev,
      offsetCredits: prev.offsetCredits + amount,
      netEmissions: prev.totalEmissions - (prev.offsetCredits + amount)
    }));
    
    toast.success(`✅ Purchased ${amount} carbon credits from ${project.name}!`);
  };

  const claimAchievement = (achievementId) => {
    setAchievements(prev => prev.map(achievement => 
      achievement.id === achievementId 
        ? { ...achievement, claimed: true }
        : achievement
    ));
    
    const achievement = achievements.find(a => a.id === achievementId);
    toast.success(`🏆 Achievement unlocked: ${achievement.title}!`);
  };

  const generateCarbonReport = () => {
    toast.loading('Generating blockchain-verified carbon report...');
    
    setTimeout(() => {
      toast.success('📄 Carbon report generated and stored on blockchain!');
    }, 2000);
  };

  const getEmissionTrendIcon = (trend) => {
    return trend < 0 ? (
      <TrendingDown className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingUp className="w-4 h-4 text-red-600" />
    );
  };

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-green-600';
    if (progress >= 70) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🌱 Carbon Credit & Sustainability System
        </h2>
        <p className="text-gray-600">
          Blockchain-verified carbon tracking, offset credits, and sustainability metrics
        </p>
      </div>

      {/* Carbon Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Total Emissions</p>
              <p className="text-2xl font-bold">{carbonData?.totalEmissions} kg CO₂</p>
            </div>
            <Factory className="w-8 h-8 text-red-100" />
          </div>
          <div className="mt-2 text-red-100 text-sm">
            Monthly footprint
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Carbon Credits</p>
              <p className="text-2xl font-bold">{carbonData?.offsetCredits} kg CO₂</p>
            </div>
            <Leaf className="w-8 h-8 text-green-100" />
          </div>
          <div className="mt-2 text-green-100 text-sm">
            Offset achieved
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Net Emissions</p>
              <p className="text-2xl font-bold">{carbonData?.netEmissions} kg CO₂</p>
            </div>
            <Globe className="w-8 h-8 text-blue-100" />
          </div>
          <div className="mt-2 text-blue-100 text-sm">
            After offsets
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-green-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Sustainability Score</p>
              <p className="text-2xl font-bold">{sustainabilityScore}%</p>
            </div>
            <Award className="w-8 h-8 text-yellow-100" />
          </div>
          <div className="mt-2 text-yellow-100 text-sm">
            Industry ranking: Top 15%
          </div>
        </div>
      </div>

      {/* Carbon Reduction Progress */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Carbon Reduction Target</h3>
          <div className="text-sm text-gray-600">
            Target: {carbonData?.reductionTarget} kg CO₂ reduction
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progress: {carbonData?.progress}%</span>
            <span>{carbonData?.totalEmissions} / {carbonData?.reductionTarget} kg CO₂</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(carbonData?.progress)}`}
              style={{ width: `${carbonData?.progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-red-600 font-bold text-lg">{carbonData?.totalEmissions}</p>
            <p className="text-red-600 text-sm">Current Emissions</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-green-600 font-bold text-lg">{carbonData?.offsetCredits}</p>
            <p className="text-green-600 text-sm">Credits Purchased</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-blue-600 font-bold text-lg">{(carbonData?.reductionTarget - carbonData?.netEmissions).toFixed(1)}</p>
            <p className="text-blue-600 text-sm">Reduction Needed</p>
          </div>
        </div>
      </div>

      {/* Carbon Footprint Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Carbon Footprint Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {carbonFootprint.map((item) => {
            const IconComponent = item.icon;
            return (
              <div key={item.category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <IconComponent className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.category}</h4>
                      <p className="text-sm text-gray-600">{item.emissions} kg CO₂</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1">
                      {getEmissionTrendIcon(item.trend)}
                      <span className={`text-sm font-medium ${item.trend < 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Math.abs(item.trend)}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">{item.percentage}% of total</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-600 mb-1">Initiatives:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.initiatives.map((initiative, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {initiative}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Carbon Offset Projects */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Carbon Offset Projects</h3>
          <div className="text-sm text-gray-600">
            Available Credits: {carbonCredits} GREEN tokens
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offsetProjects.map((project) => {
            const IconComponent = project.icon;
            return (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-3 rounded-xl ${project.color}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{project.name}</h4>
                    <p className="text-sm text-gray-600">{project.type} • {project.location}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Credits Generated:</span>
                    <span className="font-medium">{project.creditsGenerated} kg CO₂</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cost per Credit:</span>
                    <span className="font-medium">${project.costPerCredit}</span>
                  </div>
                  <p className="text-sm text-blue-600">{project.impact}</p>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => purchaseCredits(project.id, 10)}
                    disabled={carbonCredits < (project.costPerCredit * 10)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Buy 10 Credits
                  </button>
                  <button
                    onClick={() => purchaseCredits(project.id, 50)}
                    disabled={carbonCredits < (project.costPerCredit * 50)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Buy 50 Credits
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sustainability Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Award className="w-6 h-6 text-yellow-500" />
            <span>Sustainability Achievements</span>
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-yellow-600">
                      {achievement.reward}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(achievement.progress / achievement.target) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {achievement.progress}/{achievement.target} ({((achievement.progress / achievement.target) * 100).toFixed(0)}%)
                    </div>
                  </div>
                  {achievement.unlocked && !achievement.claimed && (
                    <button
                      onClick={() => claimAchievement(achievement.id)}
                      className="ml-4 px-3 py-1 bg-yellow-500 text-white rounded-lg text-sm hover:bg-yellow-600 transition-colors"
                    >
                      Claim
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carbon Report Generation */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Blockchain Carbon Reports</h3>
          
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Verified Transparency</h4>
                  <p className="text-sm text-green-700">All carbon data stored immutably on blockchain</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900">Compliance Ready</h4>
                  <p className="text-sm text-blue-700">Reports meet international carbon accounting standards</p>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-purple-900">Global Recognition</h4>
                  <p className="text-sm text-purple-700">Accepted by major sustainability frameworks</p>
                </div>
              </div>
            </div>
          </div>
          
          <button
            onClick={generateCarbonReport}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all duration-200"
          >
            Generate Blockchain Carbon Report
          </button>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600">
              Last report generated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonCreditSystem;