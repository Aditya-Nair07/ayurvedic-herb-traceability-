import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const BatchDetail = () => {
  const { batchId } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuthStore();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const response = await api.get(`/batches/${batchId}`);
        setBatch(response.data);
      } catch (err) {
        setError('Failed to fetch batch details');
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      fetchBatch();
    }
  }, [batchId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!batch) return <div>Batch not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/batches')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Batches
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Batch Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
            <p><strong>Batch ID:</strong> {batch.batchId}</p>
            <p><strong>Herb Type:</strong> {batch.herbType}</p>
            <p><strong>Status:</strong> {batch.status}</p>
            <p><strong>Created:</strong> {new Date(batch.createdAt).toLocaleDateString()}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Location</h3>
            <p><strong>Harvest Location:</strong> {batch.harvestLocation}</p>
            <p><strong>GPS Coordinates:</strong> {batch.gpsCoordinates}</p>
          </div>
        </div>

        {batch.events && batch.events.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Events Timeline</h3>
            <div className="space-y-4">
              {batch.events.map((event, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p><strong>{event.type}:</strong> {event.description}</p>
                  <p className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchDetail;
