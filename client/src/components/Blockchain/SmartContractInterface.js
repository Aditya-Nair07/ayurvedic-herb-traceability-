import React, { useState, useEffect } from 'react';
import { Code, Play, CheckCircle, XCircle, Zap, Database, Shield, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const SmartContractInterface = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [contractCode, setContractCode] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState('idle');
  const [executionResults, setExecutionResults] = useState([]);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = () => {
    // Mock smart contracts for Ayurvedic herb traceability
    const mockContracts = [
      {
        id: 'quality-assurance',
        name: 'Quality Assurance Contract',
        description: 'Automatically validates herb quality based on lab results',
        address: '0x742d35Cc6634C0532925a3b8D5c0E55Cf4A6',
        status: 'deployed',
        gasUsed: 245678,
        functions: ['validateQuality', 'setQualityThreshold', 'getQualityScore'],
        lastExecution: new Date(Date.now() - 3600000).toISOString(),
        executions: 156
      },
      {
        id: 'supply-chain-rules',
        name: 'Supply Chain Rules Engine',
        description: 'Enforces compliance rules and regulatory requirements',
        address: '0x8ba1f109551bD432803012645Hac189B739',
        status: 'deployed',
        gasUsed: 198432,
        functions: ['checkCompliance', 'updateRegulations', 'flagViolations'],
        lastExecution: new Date(Date.now() - 7200000).toISOString(),
        executions: 89
      },
      {
        id: 'auto-pricing',
        name: 'Dynamic Pricing Contract',
        description: 'Automatically adjusts herb prices based on quality and market demand',
        address: '0x123abc789def456ghi012jkl345mno678pqr',
        status: 'deployed',
        gasUsed: 312567,
        functions: ['calculatePrice', 'updateMarketData', 'setPriceMultiplier'],
        lastExecution: new Date(Date.now() - 1800000).toISOString(),
        executions: 234
      },
      {
        id: 'authenticity-validator',
        name: 'Authenticity Validator',
        description: 'Validates herb authenticity using DNA fingerprinting data',
        address: '0xdef456ghi789jkl012mno345pqr678stu901',
        status: 'pending',
        gasUsed: 0,
        functions: ['validateDNA', 'storeDNAFingerprint', 'compareGenetics'],
        lastExecution: null,
        executions: 0
      }
    ];
    setContracts(mockContracts);
  };

  const deployContract = async (contractId) => {
    setDeploymentStatus('deploying');
    toast.loading('Deploying smart contract to blockchain...');

    // Simulate deployment
    setTimeout(() => {
      setContracts(prev => prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, status: 'deployed', address: `0x${Math.random().toString(16).substr(2, 40)}` }
          : contract
      ));
      setDeploymentStatus('success');
      toast.success('Smart contract deployed successfully!');
    }, 3000);
  };

  const executeFunction = async (contractId, functionName) => {
    const contract = contracts.find(c => c.id === contractId);
    toast.loading(`Executing ${functionName} on ${contract.name}...`);

    // Simulate smart contract execution
    setTimeout(() => {
      const result = {
        id: Date.now(),
        contractId,
        functionName,
        result: generateMockResult(functionName),
        gasUsed: Math.floor(Math.random() * 50000) + 10000,
        timestamp: new Date().toISOString(),
        txHash: `0x${Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
      };

      setExecutionResults(prev => [result, ...prev.slice(0, 4)]);
      
      // Update contract execution count
      setContracts(prev => prev.map(contract => 
        contract.id === contractId 
          ? { ...contract, executions: contract.executions + 1, lastExecution: new Date().toISOString() }
          : contract
      ));

      toast.success(`${functionName} executed successfully!`);
    }, 2000);
  };

  const generateMockResult = (functionName) => {
    switch (functionName) {
      case 'validateQuality':
        return { score: Math.floor(Math.random() * 40) + 60, passed: true, issues: [] };
      case 'checkCompliance':
        return { compliant: Math.random() > 0.2, violations: Math.random() > 0.7 ? ['Missing certification'] : [] };
      case 'calculatePrice':
        return { price: (Math.random() * 100 + 50).toFixed(2), currency: 'USD', factors: ['quality', 'demand'] };
      case 'validateDNA':
        return { authentic: Math.random() > 0.1, confidence: (Math.random() * 20 + 80).toFixed(1) + '%' };
      default:
        return { success: true, data: 'Function executed successfully' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'deployed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🤖 Smart Contract Management
        </h2>
        <p className="text-gray-600">
          Deploy and execute smart contracts for automated herb traceability processes
        </p>
      </div>

      {/* Contract Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Code className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{contract.name}</h3>
                  <p className="text-sm text-gray-600">{contract.description}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                {contract.status}
              </span>
            </div>

            {contract.status === 'deployed' && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Contract Address:</div>
                <code className="text-xs font-mono text-blue-600">{contract.address}</code>
                <div className="grid grid-cols-2 gap-4 mt-2 text-xs">
                  <div>
                    <span className="text-gray-600">Executions:</span>
                    <span className="ml-1 font-medium">{contract.executions}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Gas Used:</span>
                    <span className="ml-1 font-medium">{contract.gasUsed.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 mb-2">Available Functions:</div>
              <div className="flex flex-wrap gap-2">
                {contract.functions.map((func) => (
                  <button
                    key={func}
                    onClick={() => executeFunction(contract.id, func)}
                    disabled={contract.status !== 'deployed'}
                    className="flex items-center space-x-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>{func}</span>
                  </button>
                ))}
              </div>
            </div>

            {contract.status === 'pending' && (
              <button
                onClick={() => deployContract(contract.id)}
                disabled={deploymentStatus === 'deploying'}
                className="mt-4 w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>{deploymentStatus === 'deploying' ? 'Deploying...' : 'Deploy Contract'}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Execution Results */}
      {executionResults.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <Database className="w-6 h-6 text-green-600" />
            <span>Recent Executions</span>
          </h3>
          <div className="space-y-3">
            {executionResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{result.functionName}</span>
                    <span className="text-sm text-gray-600">
                      on {contracts.find(c => c.id === result.contractId)?.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Result:</span>
                    <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                  <div className="space-y-1">
                    <div>
                      <span className="text-gray-600">Transaction Hash:</span>
                      <code className="ml-1 text-xs text-blue-600">{result.txHash.substring(0, 20)}...</code>
                    </div>
                    <div>
                      <span className="text-gray-600">Gas Used:</span>
                      <span className="ml-1 font-medium">{result.gasUsed.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartContractInterface;