import React from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, CheckCircle, AlertTriangle, Calendar, Scale, User } from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const RecentBatches = ({ batches, isLoading }) => {
  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Package className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">No batches found</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-6">Get started by creating your first batch to track your herb supply chain.</p>
        <Link to="/batches/create" className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
          Create Your First Batch
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusClasses = {
      harvested: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25',
      processed: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25',
      tested: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/25',
      packaged: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/25',
      'in_transit': 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25',
      shipped: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25',
      certified: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/25'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transform transition-all duration-200 hover:scale-105 ${statusClasses[status] || 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/25'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const getComplianceIcon = (compliance) => {
    if (compliance?.overall) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="space-y-4">
      {batches.map((batch) => (
        <div key={batch.batchId} className="group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 transform hover:-translate-y-1 hover:bg-gradient-to-br hover:from-white hover:to-gray-50">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-indigo-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-xl">{batch.farmerLogo || '🌾'}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <Link 
                    to={`/batches/${batch.batchId}`}
                    className="text-lg font-bold text-gray-900 hover:text-blue-600 truncate transition-colors duration-200"
                  >
                    {batch.batchId}
                  </Link>
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {getComplianceIcon(batch.complianceStatus)}
                  </div>
                </div>
                <div className="flex items-center space-x-4 mb-2">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 group-hover:from-green-200 group-hover:to-green-300 transition-colors duration-200">
                    {batch.herbEmoji || '🌿'} {batch.species}
                  </span>
                  <div className="flex items-center text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                    <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{batch.harvestLocation?.address || 'Unknown location'}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span className="font-medium">{batch.farmer}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span>{new Date(batch.harvestDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-3 ml-4">
              {getStatusBadge(batch.status)}
              <div className="text-right">
                <div className="flex items-center text-lg font-bold text-gray-900">
                  <Scale className="w-5 h-5 mr-1.5 text-gray-400" />
                  {batch.quantity}
                  <span className="text-sm font-normal text-gray-500 ml-1">kg</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Quality: {batch.qualityScore}/100
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentBatches;