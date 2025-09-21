import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Save, 
  X, 
  MapPin, 
  Loader2
} from 'lucide-react';
// import { useAuthStore } from '../../store/authStore';
import { batchesAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const CreateBatch = () => {
  // const { user } = useAuthStore();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setCurrentLocation] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    // watch
  } = useForm({
    defaultValues: {
      species: 'ashwagandha',
      unit: 'kg',
      harvestMethod: 'organic',
      soilType: 'red_soil'
    }
  });

  // const species = watch('species');

  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ latitude, longitude });
          setValue('latitude', latitude);
          setValue('longitude', longitude);
          toast.success('Location detected successfully');
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('Failed to get location. Please enter manually.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const response = await batchesAPI.createBatch(data);
      
      if (response.data.success) {
        toast.success('Batch created successfully!');
        navigate(`/batches/${data.batchId}`);
      } else {
        toast.error(response.data.error || 'Failed to create batch');
      }
    } catch (error) {
      console.error('Create batch error:', error);
      toast.error('Failed to create batch. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const speciesOptions = [
    { value: 'ashwagandha', label: 'Ashwagandha' },
    { value: 'tulsi', label: 'Tulsi (Holy Basil)' },
    { value: 'neem', label: 'Neem' },
    { value: 'amla', label: 'Amla (Indian Gooseberry)' },
    { value: 'brahmi', label: 'Brahmi' },
    { value: 'shankhpushpi', label: 'Shankhpushpi' },
    { value: 'guduchi', label: 'Guduchi' },
    { value: 'arjuna', label: 'Arjuna' }
  ];

  const unitOptions = [
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'lb', label: 'Pounds (lb)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'tons', label: 'Tons' },
    { value: 'pieces', label: 'Pieces' }
  ];

  const harvestMethodOptions = [
    { value: 'organic', label: 'Organic' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'wild_collected', label: 'Wild Collected' },
    { value: 'cultivated', label: 'Cultivated' }
  ];

  const soilTypeOptions = [
    { value: 'red_soil', label: 'Red Soil' },
    { value: 'black_soil', label: 'Black Soil' },
    { value: 'alluvial', label: 'Alluvial' },
    { value: 'mountain', label: 'Mountain' },
    { value: 'desert', label: 'Desert' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Batch</h1>
          <p className="text-gray-600 mt-1">
            Start tracking a new herb batch through the supply chain
          </p>
        </div>
        <button
          onClick={() => navigate('/batches')}
          className="btn btn-outline"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch ID */}
            <div className="form-group">
              <label className="form-label">Batch ID *</label>
              <input
                {...register('batchId', {
                  required: 'Batch ID is required',
                  pattern: {
                    value: /^[A-Z0-9_]+$/,
                    message: 'Batch ID can only contain uppercase letters, numbers, and underscores'
                  }
                })}
                type="text"
                className={`form-input ${errors.batchId ? 'border-red-300' : ''}`}
                placeholder="e.g., ASHWAGANDHA_2024_001"
              />
              {errors.batchId && (
                <p className="form-error">{errors.batchId.message}</p>
              )}
              <p className="form-help">
                Use a unique identifier for this batch
              </p>
            </div>

            {/* Species */}
            <div className="form-group">
              <label className="form-label">Species *</label>
              <select
                {...register('species', { required: 'Species is required' })}
                className={`form-select ${errors.species ? 'border-red-300' : ''}`}
              >
                {speciesOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.species && (
                <p className="form-error">{errors.species.message}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 0.1, message: 'Quantity must be greater than 0' },
                  max: { value: 10000, message: 'Quantity must be less than 10,000' }
                })}
                type="number"
                step="0.1"
                className={`form-input ${errors.quantity ? 'border-red-300' : ''}`}
                placeholder="100"
              />
              {errors.quantity && (
                <p className="form-error">{errors.quantity.message}</p>
              )}
            </div>

            {/* Unit */}
            <div className="form-group">
              <label className="form-label">Unit *</label>
              <select
                {...register('unit', { required: 'Unit is required' })}
                className={`form-select ${errors.unit ? 'border-red-300' : ''}`}
              >
                {unitOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.unit && (
                <p className="form-error">{errors.unit.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Harvest Location</h3>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn btn-outline btn-sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Use Current Location
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Latitude */}
            <div className="form-group">
              <label className="form-label">Latitude *</label>
              <input
                {...register('latitude', {
                  required: 'Latitude is required',
                  min: { value: -90, message: 'Latitude must be between -90 and 90' },
                  max: { value: 90, message: 'Latitude must be between -90 and 90' }
                })}
                type="number"
                step="any"
                className={`form-input ${errors.latitude ? 'border-red-300' : ''}`}
                placeholder="12.9716"
              />
              {errors.latitude && (
                <p className="form-error">{errors.latitude.message}</p>
              )}
            </div>

            {/* Longitude */}
            <div className="form-group">
              <label className="form-label">Longitude *</label>
              <input
                {...register('longitude', {
                  required: 'Longitude is required',
                  min: { value: -180, message: 'Longitude must be between -180 and 180' },
                  max: { value: 180, message: 'Longitude must be between -180 and 180' }
                })}
                type="number"
                step="any"
                className={`form-input ${errors.longitude ? 'border-red-300' : ''}`}
                placeholder="77.5946"
              />
              {errors.longitude && (
                <p className="form-error">{errors.longitude.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="form-group md:col-span-2">
              <label className="form-label">Address *</label>
              <textarea
                {...register('address', { required: 'Address is required' })}
                rows={3}
                className={`form-textarea ${errors.address ? 'border-red-300' : ''}`}
                placeholder="Enter the complete harvest location address"
              />
              {errors.address && (
                <p className="form-error">{errors.address.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Harvest Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Harvest Method */}
            <div className="form-group">
              <label className="form-label">Harvest Method</label>
              <select
                {...register('harvestMethod')}
                className="form-select"
              >
                {harvestMethodOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Soil Type */}
            <div className="form-group">
              <label className="form-label">Soil Type</label>
              <select
                {...register('soilType')}
                className="form-select"
              >
                {soilTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Climate */}
            <div className="form-group">
              <label className="form-label">Climate</label>
              <input
                {...register('climate')}
                type="text"
                className="form-input"
                placeholder="e.g., Tropical, Subtropical, Temperate"
              />
            </div>

            {/* Harvest Date */}
            <div className="form-group">
              <label className="form-label">Harvest Date</label>
              <input
                {...register('harvestDate')}
                type="date"
                className="form-input"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              {...register('notes')}
              rows={4}
              className="form-textarea"
              placeholder="Any additional notes about this batch..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/batches')}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {isSubmitting ? 'Creating...' : 'Create Batch'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBatch;
