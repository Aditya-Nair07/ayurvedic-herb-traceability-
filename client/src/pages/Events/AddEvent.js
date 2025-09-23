import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, FileText, Tag, Save, X } from 'lucide-react';
import BlockchainVerification from '../../components/Blockchain/BlockchainVerification';
import BlockchainNotification from '../../components/Blockchain/BlockchainNotification';
// import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AddEvent = () => {
  const navigate = useNavigate();
  // const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    batchId: '',
    location: '',
    data: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdEvent, setCreatedEvent] = useState(null);
  const [showBlockchainVerification, setShowBlockchainVerification] = useState(false);
  const [showBlockchainNotification, setShowBlockchainNotification] = useState(false);
  const [blockchainData, setBlockchainData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // In demo mode, we'll simulate event creation
      const newEvent = {
        eventId: `EVENT-${Date.now()}`,
        batchId: formData.batchId,
        eventType: formData.type,
        eventName: getEventTypeName(formData.type),
        timestamp: new Date().toISOString(),
        location: {
          address: formData.location
        },
        actorId: getActorName(formData.type),
        actorLogo: getActorLogo(formData.type),
        description: formData.description,
        data: {}
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Event created successfully!');
      setCreatedEvent(newEvent);
      setBlockchainData({
        transactionId: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 100000,
        gasUsed: Math.floor(Math.random() * 50000) + 30000,
        status: 'success'
      });
      setShowBlockchainNotification(true);
      setShowBlockchainVerification(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowBlockchainNotification(false);
      }, 5000);
      
      // Navigate after showing blockchain verification
      setTimeout(() => {
        navigate('/events', { state: { refresh: true } });
      }, 8000);
    } catch (err) {
      let errorMessage = 'Failed to create event';
      
      if (err.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (err.response?.status === 400) {
        if (err.response.data?.errors && Array.isArray(err.response.data.errors)) {
          errorMessage = err.response.data.errors.map(e => e.msg).join(', ');
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || 'Invalid request data';
        }
      } else if (err.response?.data) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Event creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeName = (type) => {
    const types = {
      'harvest': 'Harvest',
      'processing': 'Processing',
      'testing': 'Quality Test',
      'packaging': 'Packaging',
      'transport': 'Transport',
      'retail': 'Retail'
    };
    return types[type] || type;
  };

  const getActorName = (type) => {
    const actors = {
      'harvest': 'Farmer Rajesh',
      'processing': 'Processor Ltd',
      'testing': 'Lab Services',
      'packaging': 'Packers Inc',
      'transport': 'Logistics Co',
      'retail': 'Retail Store'
    };
    return actors[type] || 'Unknown Actor';
  };

  const getActorLogo = (type) => {
    const logos = {
      'harvest': '🌾',
      'processing': '⚙️',
      'testing': '🔬',
      'packaging': '📦',
      'transport': '🚚',
      'retail': '🏪'
    };
    return logos[type] || '📋';
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Event</h1>
            <p className="text-gray-600">Record a new supply chain event for herb traceability</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-8 py-6">
            <h2 className="text-xl font-bold text-white flex items-center">
              <Calendar className="w-6 h-6 mr-3" />
              Event Details
            </h2>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  <X className="w-5 h-5 text-red-500 mr-2" />
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <Tag className="w-4 h-4 inline mr-2" />
                    Event Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    required
                  >
                    <option value="">Select Event Type</option>
                    <option value="harvest">🌾 Harvest</option>
                    <option value="processing">⚙️ Processing</option>
                    <option value="testing">🔬 Testing</option>
                    <option value="packaging">📦 Packaging</option>
                    <option value="transport">🚛 Transport</option>
                    <option value="retail">🏪 Retail</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Batch ID
                  </label>
                  <input
                    type="text"
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    placeholder="e.g., BATCH001"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  rows="4"
                  placeholder="Describe the event details..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate('/events')}
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Event
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Blockchain Verification Section */}
        {showBlockchainVerification && createdEvent && (
          <div className="mt-8">
            <BlockchainVerification 
              eventData={createdEvent}
              batchData={{ batchId: formData.batchId }}
            />
          </div>
        )}
      </div>
      
      {/* Blockchain Notification */}
      <BlockchainNotification 
        show={showBlockchainNotification}
        onClose={() => setShowBlockchainNotification(false)}
        transactionData={blockchainData}
      />
    </div>
  );
};

export default AddEvent;
