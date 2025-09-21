import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  Gift, 
  Crown, 
  Star, 
  Users, 
  Trophy,
  Target,
  Zap,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';

const TokenEconomy = () => {
  const [userTokens, setUserTokens] = useState(0);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [marketplace, setMarketplace] = useState([]);
  const [stakingPools, setStakingPools] = useState([]);
  const [tokenomics, setTokenomics] = useState(null);

  useEffect(() => {
    fetchTokenData();
  }, []);

  const fetchTokenData = () => {
    // Mock token economy data
    setUserTokens(2450);
    
    setRewardHistory([
      { id: 1, action: 'Quality batch certification', amount: 150, timestamp: new Date(Date.now() - 3600000), type: 'quality' },
      { id: 2, action: 'Timely delivery verification', amount: 75, timestamp: new Date(Date.now() - 7200000), type: 'delivery' },
      { id: 3, action: 'Compliance documentation', amount: 100, timestamp: new Date(Date.now() - 10800000), type: 'compliance' },
      { id: 4, action: 'Supply chain transparency', amount: 200, timestamp: new Date(Date.now() - 14400000), type: 'transparency' },
      { id: 5, action: 'Sustainability practices', amount: 125, timestamp: new Date(Date.now() - 18000000), type: 'sustainability' }
    ]);

    setAchievements([
      { 
        id: 'quality_master', 
        name: 'Quality Master', 
        description: 'Maintain 95%+ quality score for 30 days',
        reward: 500,
        progress: 87,
        unlocked: false,
        icon: '🏆'
      },
      { 
        id: 'transparency_champion', 
        name: 'Transparency Champion', 
        description: 'Share complete supply chain data for 50 batches',
        reward: 300,
        progress: 100,
        unlocked: true,
        icon: '🎖️'
      },
      { 
        id: 'eco_warrior', 
        name: 'Eco Warrior', 
        description: 'Implement 5 sustainability practices',
        reward: 400,
        progress: 60,
        unlocked: false,
        icon: '🌱'
      },
      { 
        id: 'compliance_expert', 
        name: 'Compliance Expert', 
        description: 'Zero compliance violations for 90 days',
        reward: 350,
        progress: 100,
        unlocked: true,
        icon: '✅'
      }
    ]);

    setMarketplace([
      { id: 1, name: 'Premium Certification Badge', cost: 500, type: 'certification', description: 'Verified premium quality indicator' },
      { id: 2, name: 'Express Processing', cost: 200, type: 'service', description: 'Priority processing for your batches' },
      { id: 3, name: 'Analytics Dashboard Pro', cost: 800, type: 'feature', description: 'Advanced analytics and insights' },
      { id: 4, name: 'Carbon Offset Credits', cost: 300, type: 'sustainability', description: 'Offset your supply chain carbon footprint' },
      { id: 5, name: 'Quality Assurance Package', cost: 600, type: 'service', description: 'Enhanced quality testing services' }
    ]);

    setStakingPools([
      { 
        id: 'quality_pool', 
        name: 'Quality Assurance Pool', 
        apy: 12.5, 
        totalStaked: 150000, 
        userStaked: 500,
        lockPeriod: '30 days',
        description: 'Stake tokens to participate in quality verification'
      },
      { 
        id: 'governance_pool', 
        name: 'Governance Pool', 
        apy: 8.7, 
        totalStaked: 89000, 
        userStaked: 0,
        lockPeriod: '90 days',
        description: 'Stake to vote on protocol decisions'
      },
      { 
        id: 'sustainability_pool', 
        name: 'Sustainability Pool', 
        apy: 15.2, 
        totalStaked: 67000, 
        userStaked: 750,
        lockPeriod: '60 days',
        description: 'Support eco-friendly initiatives'
      }
    ]);

    setTokenomics({
      totalSupply: 10000000,
      circulatingSupply: 6500000,
      marketCap: 32500000,
      tokenPrice: 5.0,
      holders: 2847,
      distribution: [
        { category: 'Farmers & Producers', percentage: 35, amount: 3500000 },
        { category: 'Processors & Manufacturers', percentage: 25, amount: 2500000 },
        { category: 'Quality Labs', percentage: 15, amount: 1500000 },
        { category: 'Ecosystem Development', percentage: 15, amount: 1500000 },
        { category: 'Governance & Community', percentage: 10, amount: 1000000 }
      ]
    });
  };

  const claimReward = (achievementId) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && achievement.unlocked) {
      setUserTokens(prev => prev + achievement.reward);
      toast.success(`🎉 Claimed ${achievement.reward} HERB tokens!`);
      
      // Mark as claimed
      setAchievements(prev => prev.map(a => 
        a.id === achievementId ? { ...a, claimed: true } : a
      ));
    }
  };

  const purchaseItem = (itemId) => {
    const item = marketplace.find(i => i.id === itemId);
    if (item && userTokens >= item.cost) {
      setUserTokens(prev => prev - item.cost);
      toast.success(`✅ Purchased ${item.name}!`);
    } else {
      toast.error('💰 Insufficient tokens!');
    }
  };

  const stakeTokens = (poolId, amount) => {
    if (userTokens >= amount) {
      setUserTokens(prev => prev - amount);
      setStakingPools(prev => prev.map(pool => 
        pool.id === poolId 
          ? { ...pool, userStaked: pool.userStaked + amount, totalStaked: pool.totalStaked + amount }
          : pool
      ));
      toast.success(`🔒 Staked ${amount} tokens in ${stakingPools.find(p => p.id === poolId)?.name}!`);
    } else {
      toast.error('💰 Insufficient tokens to stake!');
    }
  };

  const getRewardTypeColor = (type) => {
    const colors = {
      quality: 'bg-green-100 text-green-800',
      delivery: 'bg-blue-100 text-blue-800',
      compliance: 'bg-purple-100 text-purple-800',
      transparency: 'bg-orange-100 text-orange-800',
      sustainability: 'bg-emerald-100 text-emerald-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getItemTypeIcon = (type) => {
    const icons = {
      certification: <Award className="w-5 h-5" />,
      service: <Zap className="w-5 h-5" />,
      feature: <Target className="w-5 h-5" />,
      sustainability: <Star className="w-5 h-5" />
    };
    return icons[type] || <Gift className="w-5 h-5" />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🪙 HERB Token Economy
        </h2>
        <p className="text-gray-600">
          Earn, stake, and spend HERB tokens to participate in the ecosystem
        </p>
      </div>

      {/* Token Balance & Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Your HERB Tokens</p>
              <p className="text-3xl font-bold">{userTokens.toLocaleString()}</p>
            </div>
            <Coins className="w-10 h-10 text-yellow-100" />
          </div>
          <div className="mt-2 text-yellow-100 text-sm">
            ≈ ${(userTokens * (tokenomics?.tokenPrice || 5)).toFixed(2)} USD
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Token Price</p>
              <p className="text-2xl font-bold text-gray-900">${tokenomics?.tokenPrice.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">+8.5%</span>
            <span className="text-gray-600 ml-1">24h</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Market Cap</p>
              <p className="text-2xl font-bold text-gray-900">
                ${(tokenomics?.marketCap / 1000000).toFixed(1)}M
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Token Holders</p>
              <p className="text-2xl font-bold text-gray-900">{tokenomics?.holders.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements & Rewards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span>Achievements</span>
          </h3>
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div>
                      <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-yellow-600">
                      +{achievement.reward} HERB
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{achievement.progress}% complete</div>
                  </div>
                  {achievement.unlocked && !achievement.claimed && (
                    <button
                      onClick={() => claimReward(achievement.id)}
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

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Gift className="w-6 h-6 text-blue-500" />
            <span>Recent Rewards</span>
          </h3>
          <div className="space-y-3">
            {rewardHistory.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{reward.action}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(reward.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">+{reward.amount}</div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRewardTypeColor(reward.type)}`}>
                    {reward.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marketplace */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Gift className="w-6 h-6 text-purple-500" />
          <span>Token Marketplace</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {marketplace.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  {getItemTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.name}</h4>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-bold text-purple-600">
                  {item.cost} HERB
                </div>
                <button
                  onClick={() => purchaseItem(item.id)}
                  disabled={userTokens < item.cost}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staking Pools */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
          <Target className="w-6 h-6 text-green-500" />
          <span>Staking Pools</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stakingPools.map((pool) => (
            <div key={pool.id} className="border border-gray-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <h4 className="font-bold text-gray-900 mb-2">{pool.name}</h4>
                <p className="text-sm text-gray-600 mb-3">{pool.description}</p>
                <div className="text-2xl font-bold text-green-600">{pool.apy}% APY</div>
                <div className="text-sm text-gray-600">Lock: {pool.lockPeriod}</div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Staked:</span>
                  <span className="font-medium">{pool.totalStaked.toLocaleString()} HERB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Stake:</span>
                  <span className="font-medium">{pool.userStaked.toLocaleString()} HERB</span>
                </div>
                
                <button
                  onClick={() => {
                    const amount = prompt('Enter amount to stake:');
                    if (amount && !isNaN(amount)) {
                      stakeTokens(pool.id, parseInt(amount));
                    }
                  }}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Stake Tokens
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TokenEconomy;