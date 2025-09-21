import React, { useState, useEffect } from 'react';
import { Shield, Hash, Clock, CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockchainVerification = ({ eventData, batchData }) => {
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [blockchainData, setBlockchainData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Simulate blockchain verification
    const verifyOnBlockchain = async () => {
      setVerificationStatus('verifying');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate realistic blockchain transaction data
      const mockBlockchainData = {
        transactionId: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        blockHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        blockNumber: Math.floor(Math.random() * 10000) + 150000,
        timestamp: new Date().toISOString(),
        networkId: 'herb-channel',
        chaincodeName: 'herb-traceability',
        status: 'VALID',
        endorsements: [
          { mspId: 'Org1MSP', signature: `0x${Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` },
          { mspId: 'OrdererMSP', signature: `0x${Array.from({length: 128}, () => Math.floor(Math.random() * 16).toString(16)).join('')}` }
        ],
        gasUsed: Math.floor(Math.random() * 50000) + 21000,
        dataHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        consensusAlgorithm: 'PBFT',
        immutabilityScore: 99.9
      };
      
      setBlockchainData(mockBlockchainData);
      setVerificationStatus('verified');
    };

    if (eventData || batchData) {
      verifyOnBlockchain();
    }
  }, [eventData, batchData]);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'verifying': return 'text-blue-600 bg-blue-50';
      case 'verified': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'verifying': return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'verified': return <CheckCircle className="w-5 h-5" />;
      case 'failed': return <AlertCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-4">
        <div className="flex items-center space-x-3">
          <Shield className="w-6 h-6 text-white" />
          <h3 className="text-lg font-bold text-white">Blockchain Verification</h3>
          <div className="flex-1" />
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="text-sm font-medium capitalize">{verificationStatus}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {verificationStatus === 'pending' && (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Waiting for blockchain verification...</p>
          </div>
        )}

        {verificationStatus === 'verifying' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-blue-600 font-medium">Verifying on Hyperledger Fabric...</p>
            <p className="text-gray-500 text-sm mt-2">Checking transaction integrity and consensus</p>
          </div>
        )}

        {verificationStatus === 'verified' && blockchainData && (
          <div className="space-y-6">
            {/* Verification Success */}
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">Blockchain Verified ✓</h4>
                <p className="text-green-600 text-sm">Transaction is immutable and tamper-proof</p>
              </div>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <code className="text-xs font-mono text-gray-800 flex-1 truncate">{blockchainData.transactionId}</code>
                    <button
                      onClick={() => copyToClipboard(blockchainData.transactionId, 'Transaction ID')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block Hash</label>
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <code className="text-xs font-mono text-gray-800 flex-1 truncate">{blockchainData.blockHash}</code>
                    <button
                      onClick={() => copyToClipboard(blockchainData.blockHash, 'Block Hash')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Block Number</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-mono text-sm">{blockchainData.blockNumber.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Network Channel</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-blue-600">{blockchainData.networkId}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Smart Contract</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-purple-600">{blockchainData.chaincodeName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Consensus</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-indigo-600">{blockchainData.consensusAlgorithm}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Endorsements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Network Endorsements</label>
              <div className="space-y-2">
                {blockchainData.endorsements.map((endorsement, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <span className="font-medium text-gray-800">{endorsement.mspId}</span>
                      <p className="text-xs text-gray-500 font-mono truncate">{endorsement.signature}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Immutability Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{blockchainData.immutabilityScore}%</div>
                <div className="text-sm text-blue-700">Immutability Score</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{blockchainData.gasUsed.toLocaleString()}</div>
                <div className="text-sm text-purple-700">Gas Used</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">{blockchainData.endorsements.length}</div>
                <div className="text-sm text-indigo-700">Peer Endorsements</div>
              </div>
            </div>

            {/* Blockchain Explorer Link */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">View on Blockchain Explorer</h4>
                <p className="text-sm text-gray-600">Explore transaction details on the network</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <ExternalLink className="w-4 h-4" />
                <span>Open Explorer</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlockchainVerification;