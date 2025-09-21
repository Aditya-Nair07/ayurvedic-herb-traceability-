import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { useQuery } from 'react-query';
import { complianceAPI } from '../../utils/api';
import LoadingSpinner from '../UI/LoadingSpinner';

const ComplianceAlerts = () => {
  const { data: violations, isLoading } = useQuery(
    'complianceViolations',
    () => complianceAPI.getViolations({ limit: 5 }),
    { 
      refetchInterval: 10 * 60 * 1000, // 10 minutes
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      cacheTime: 15 * 60 * 1000 // Keep in cache for 15 minutes
    }
  );

  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (!violations?.data?.data || violations.data.data.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500">No compliance violations found</p>
        <p className="text-sm text-gray-400 mt-1">All batches are compliant</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'text-yellow-600 bg-yellow-100',
      medium: 'text-orange-600 bg-orange-100',
      high: 'text-red-600 bg-red-100',
      critical: 'text-red-800 bg-red-200'
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical' || severity === 'high') {
      return <AlertTriangle className="w-4 h-4" />;
    }
    return <Clock className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      {violations.data.data.map((violation, index) => (
        <div key={index} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getSeverityColor(violation.severity)}`}>
            {getSeverityIcon(violation.severity)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Batch {violation.batchId}
              </h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(violation.severity)}`}>
                {violation.severity}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {violation.violation}
            </p>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">
                Species: {violation.species} • Farmer: {violation.farmer?.username}
              </div>
              <Link
                to={`/batches/${violation.batchId}`}
                className="inline-flex items-center text-xs text-blue-600 hover:text-blue-500"
              >
                View details
                <ExternalLink className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      ))}
      
      {violations.data.data.length >= 5 && (
        <div className="text-center pt-4">
          <Link
            to="/compliance"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            View all violations
          </Link>
        </div>
      )}
    </div>
  );
};

export default ComplianceAlerts;
