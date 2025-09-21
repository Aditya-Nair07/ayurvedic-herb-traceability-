import React, { useState } from 'react';
import api from '../../utils/api';

const QRGenerator = () => {
  // const { user } = useAuthStore();
  const [batchId, setBatchId] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQR = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/qr/generate', { batchId });
      setQrCode(response.data.qrCode);
    } catch (err) {
      setError('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrCode) {
      const link = document.createElement('a');
      link.href = qrCode;
      link.download = `qr-code-${batchId}.png`;
      link.click();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">QR Code Generator</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={generateQR} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Batch ID
            </label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter Batch ID"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </form>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {qrCode && (
          <div className="mt-6 text-center">
            <h3 className="text-lg font-semibold mb-4">Generated QR Code</h3>
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="QR Code" className="border border-gray-300" />
            </div>
            <button
              onClick={downloadQR}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Download QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRGenerator;
