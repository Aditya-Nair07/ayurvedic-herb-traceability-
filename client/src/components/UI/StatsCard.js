import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  changeType, 
  suffix = '' 
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-600',
      bgLight: 'bg-blue-50',
      ring: 'ring-blue-500/20'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-500 to-green-600',
      text: 'text-green-600',
      bgLight: 'bg-green-50',
      ring: 'ring-green-500/20'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-600',
      bgLight: 'bg-red-50',
      ring: 'ring-red-500/20'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      text: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      ring: 'ring-yellow-500/20'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      text: 'text-purple-600',
      bgLight: 'bg-purple-50',
      ring: 'ring-purple-500/20'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      text: 'text-indigo-600',
      bgLight: 'bg-indigo-50',
      ring: 'ring-indigo-500/20'
    }
  };


  return (
    <div className={`group relative bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${colorClasses[color].bgLight} ${colorClasses[color].ring} ring-1`}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/50 to-transparent rounded-2xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 ${colorClasses[color].bg} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {change && (
            <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              changeType === 'positive' 
                ? 'bg-green-100 text-green-700 ring-1 ring-green-500/20' 
                : 'bg-red-100 text-red-700 ring-1 ring-red-500/20'
            }`}>
              {changeType === 'positive' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {change}
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wider">{title}</p>
          <p className={`text-3xl font-bold ${colorClasses[color].text} group-hover:scale-105 transition-transform duration-300`}>
            {value}{suffix}
          </p>
        </div>
        
        {/* Decorative element */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
      </div>
    </div>
  );
};

export default StatsCard;
