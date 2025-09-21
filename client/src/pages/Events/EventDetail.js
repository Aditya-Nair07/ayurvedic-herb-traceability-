import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  // const { user } = useAuthStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await api.get(`/events/${eventId}`);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to fetch event details');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!event) return <div>Event not found</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate('/events')}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to Events
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Event Details</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Event Information</h3>
            <p><strong>Type:</strong> {event.type}</p>
            <p><strong>Description:</strong> {event.description}</p>
            <p><strong>Timestamp:</strong> {new Date(event.timestamp).toLocaleString()}</p>
            <p><strong>Created By:</strong> {event.createdBy}</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Related Information</h3>
            <p><strong>Batch ID:</strong> {event.batchId}</p>
            <p><strong>Location:</strong> {event.location || 'N/A'}</p>
            <p><strong>Status:</strong> {event.status}</p>
          </div>
        </div>

        {event.data && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Additional Data</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
              {JSON.stringify(event.data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
