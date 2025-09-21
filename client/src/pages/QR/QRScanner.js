import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { qrAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const QRScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const handleQRCodeDetected = useCallback(async (qrData) => {
    setIsScanning(false);
    setIsProcessing(true);
    setError(null);

    try {
      const response = await qrAPI.scanQR(qrData);
      setScannedData(response.data);
      toast.success('QR code scanned successfully!');
    } catch (error) {
      setError('Failed to process QR code');
      toast.error('Failed to process QR code');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const detectQRCode = useCallback(() => {
    // Simple QR code detection simulation
    // In a real implementation, you would use a library like QuaggaJS or ZXing
    const interval = setInterval(() => {
      if (!isScanning) {
        clearInterval(interval);
        return;
      }

      // Simulate QR code detection
      if (Math.random() < 0.1) { // 10% chance per check
        const mockQRData = {
          batchId: 'ASHWAGANDHA_2024_001',
          species: 'Ashwagandha',
          status: 'packaged',
          harvestDate: new Date().toISOString(),
          farmerId: 'farmer001',
          url: 'http://localhost:3000/batch/ASHWAGANDHA_2024_001',
          blockchainTxId: 'tx_123456789',
          generatedAt: new Date().toISOString(),
          generatedBy: 'processor001'
        };
        
        handleQRCodeDetected(mockQRData);
        clearInterval(interval);
      }
    }, 1000);
  }, [isScanning, handleQRCodeDetected]);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      
      // Start QR code detection
      detectQRCode();
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera permissions.');
      setIsScanning(false);
    }
  }, [detectQRCode]);

  // QR Code detection using QuaggaJS or similar library
  useEffect(() => {
    if (isScanning && videoRef.current) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanning, startCamera]);


  const handleManualInput = () => {
    const batchId = prompt('Enter Batch ID manually:');
    if (batchId) {
      const mockQRData = {
        batchId,
        species: 'Unknown',
        status: 'unknown',
        harvestDate: new Date().toISOString(),
        farmerId: 'unknown',
        url: `http://localhost:3000/batch/${batchId}`,
        blockchainTxId: 'manual_input',
        generatedAt: new Date().toISOString(),
        generatedBy: 'manual'
      };
      
      handleQRCodeDetected(mockQRData);
    }
  };

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
    setIsProcessing(false);
  };

  const goToBatch = (batchId) => {
    navigate(`/batches/${batchId}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
        <p className="text-gray-600">
          Scan QR codes to view herb batch traceability information
        </p>
      </div>

      {/* Scanner Interface */}
      {!scannedData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {!isScanning ? (
            <div className="text-center py-12">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Ready to Scan
              </h3>
              <p className="text-gray-500 mb-6">
                Click the button below to start scanning QR codes
              </p>
              <button
                onClick={() => setIsScanning(true)}
                className="btn btn-primary"
              >
                <Camera className="w-4 h-4 mr-2" />
                Start Camera
              </button>
              <button
                onClick={handleManualInput}
                className="btn btn-outline ml-4"
              >
                Enter Manually
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute top-0 left-0 w-full h-full pointer-events-none"
                />
                <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg m-4 pointer-events-none">
                  <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-blue-500"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-blue-500"></div>
                  <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-blue-500"></div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-blue-500"></div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Position the QR code within the frame above
                </p>
                <button
                  onClick={() => setIsScanning(false)}
                  className="btn btn-outline"
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop Scanning
                </button>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Processing QR code...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700">{error}</p>
              </div>
              <button
                onClick={resetScanner}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      )}

      {/* Scanned Data Display */}
      {scannedData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Batch Information
            </h3>
            <button
              onClick={resetScanner}
              className="btn btn-outline btn-sm"
            >
              Scan Another
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Basic Information</h4>
              
              <div>
                <label className="text-sm text-gray-500">Batch ID</label>
                <p className="text-sm font-medium text-gray-900">
                  {scannedData.batch.batchId}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Species</label>
                <p className="text-sm font-medium text-gray-900 capitalize">
                  {scannedData.batch.species}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Status</label>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    scannedData.batch.status === 'packaged' ? 'bg-purple-100 text-purple-800' :
                    scannedData.batch.status === 'retailed' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {scannedData.batch.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-500">Quantity</label>
                <p className="text-sm font-medium text-gray-900">
                  {scannedData.batch.quantity} {scannedData.batch.unit}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-500">Harvest Date</label>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(scannedData.batch.harvestDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Compliance & Quality */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Compliance & Quality</h4>
              
              <div>
                <label className="text-sm text-gray-500">Compliance Status</label>
                <div className="flex items-center">
                  {scannedData.batch.complianceStatus.overall ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
                    scannedData.batch.complianceStatus.overall ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {scannedData.batch.complianceStatus.overall ? 'Compliant' : 'Non-compliant'}
                  </span>
                </div>
              </div>

              {scannedData.batch.qualityMetrics && (
                <div>
                  <label className="text-sm text-gray-500">Quality Metrics</label>
                  <div className="space-y-2">
                    {scannedData.batch.qualityMetrics.purity && (
                      <div className="flex justify-between text-sm">
                        <span>Purity:</span>
                        <span className="font-medium">{scannedData.batch.qualityMetrics.purity}%</span>
                      </div>
                    )}
                    {scannedData.batch.qualityMetrics.moisture && (
                      <div className="flex justify-between text-sm">
                        <span>Moisture:</span>
                        <span className="font-medium">{scannedData.batch.qualityMetrics.moisture}%</span>
                      </div>
                    )}
                    {scannedData.batch.qualityMetrics.labTested && (
                      <div className="flex justify-between text-sm">
                        <span>Lab Tested:</span>
                        <span className="font-medium text-green-600">Yes</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-gray-500">Farmer</label>
                <p className="text-sm font-medium text-gray-900">
                  {scannedData.batch.farmer?.username || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {scannedData.batch.farmer?.organization || 'Unknown Organization'}
                </p>
              </div>
            </div>
          </div>

          {/* Events Timeline */}
          {scannedData.batch.events && scannedData.batch.events.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-4">Supply Chain Timeline</h4>
              <div className="space-y-3">
                {scannedData.batch.events.map((event, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {event.eventType.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(event.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        By: {event.actorId} ({event.actorRole})
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex space-x-4">
            <button
              onClick={() => goToBatch(scannedData.batch.batchId)}
              className="btn btn-primary"
            >
              View Full Details
            </button>
            <button
              onClick={() => window.print()}
              className="btn btn-outline"
            >
              Print Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner;
