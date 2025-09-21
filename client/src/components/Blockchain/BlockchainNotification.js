import React from 'react';
import { Shield, Check, ExternalLink } from 'lucide-react';

const BlockchainNotification = ({ show, onClose, transactionData }) => {
  if (!show || !transactionData) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 px-4 py-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold">Blockchain Verified ✓</h3>
            <button
              onClick={onClose}
              className="ml-auto text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-800">
              Transaction recorded on Hyperledger Fabric
            </span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Transaction ID:</span>
              <code className="text-blue-600 font-mono">
                {transactionData.transactionId?.substring(0, 12)}...
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Block:</span>
              <span className="font-medium">#{transactionData.blockNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Network:</span>
              <span className="text-blue-600">{transactionData.networkId}</span>
            </div>
          </div>
          
          <button className="mt-3 w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-2 px-3 rounded-md hover:bg-blue-100 transition-colors">
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm font-medium">View on Blockchain Explorer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockchainNotification;