import React from 'react';
import { Activity, MapPin, Clock, User } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const RecentEvents = ({ events, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Activity className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No events found</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">Create your first event to start tracking the supply chain.</p>
        <button className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Add Your First Event
        </button>
      </div>
    );
  }

  const getEventIcon = (eventType) => {
    const iconMap = {
      harvest: { icon: '🌾', color: 'from-green-500 to-green-600', bgColor: 'bg-green-500/25' },
      processing: { icon: '⚙️', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-500/25' },
      quality_test: { icon: '🔬', color: 'from-yellow-500 to-yellow-600', bgColor: 'bg-yellow-500/25' },
      packaging: { icon: '📦', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-500/25' },
      transport: { icon: '🚚', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-500/25' },
      certification: { icon: '📜', color: 'from-teal-500 to-teal-600', bgColor: 'bg-teal-500/25' },
      shipment: { icon: '🚢', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-500/25' },
      retail: { icon: '🏪', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-500/25' }
    };

    const eventConfig = iconMap[eventType] || { icon: '📋', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-500/25' };

    return (
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${eventConfig.color} text-white shadow-lg transform transition-all duration-300 group-hover:scale-110`}>
        <span className="text-xl">{eventConfig.icon}</span>
      </div>
    );
  };

  const getEventTypeLabel = (eventType) => {
    const labels = {
      harvest: 'Harvest',
      processing: 'Processing',
      quality_test: 'Quality Test',
      packaging: 'Packaging',
      transport: 'Transport',
      certification: 'Certification',
      shipment: 'Shipment',
      retail: 'Retail'
    };
    return labels[eventType] || eventType;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.eventId} className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-gray-50">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-start space-x-4">
            <div className="flex-shrink-0">
              {getEventIcon(event.eventType)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                  {event.eventName || getEventTypeLabel(event.eventType)}
                </h4>
                <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                  <Clock className="w-4 h-4 mr-1.5" />
                  {formatTimestamp(event.timestamp)}
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                {event.description}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                  <User className="w-4 h-4 mr-1.5 flex-shrink-0" />
                  <span className="font-medium flex items-center">
                    <span className="mr-1 text-lg">{event.actorLogo || '👤'}</span>
                    {event.actorId}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{event.location.address || 'Unknown location'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentEvents;