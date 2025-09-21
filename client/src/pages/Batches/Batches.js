import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  MapPin, 
  Calendar,
  CheckCircle,
  AlertTriangle,
  MoreVertical
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { batchesAPI } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Batches = () => {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch batches with filters
  const { data: batchesData, isLoading, error } = useQuery(
    ['batches', currentPage, statusFilter, speciesFilter, searchTerm],
    () => batchesAPI.getBatches({
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter || undefined,
      species: speciesFilter || undefined,
      q: searchTerm || undefined
    }),
    { 
      refetchInterval: 2 * 60 * 1000, // 2 minutes
      staleTime: 60 * 1000, // Cache for 1 minute
      cacheTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
    }
  );

  const batches = batchesData?.data?.data || [];
  const totalPages = Math.ceil((batchesData?.data?.total || 0) / itemsPerPage);

  const getStatusBadge = (status) => {
    const statusClasses = {
      harvested: 'bg-green-100 text-green-800',
      processed: 'bg-blue-100 text-blue-800',
      tested: 'bg-yellow-100 text-yellow-800',
      packaged: 'bg-purple-100 text-purple-800',
      'in_transit': 'bg-orange-100 text-orange-800',
      retailed: 'bg-indigo-100 text-indigo-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const getComplianceIcon = (compliance) => {
    if (compliance?.overall) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <AlertTriangle className="w-4 h-4 text-red-500" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <LoadingSpinner className="py-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load batches</p>
        <p className="text-sm text-gray-500 mt-1">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Herb Batches</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your herb batches throughout the supply chain
          </p>
        </div>
        {user?.permissions?.includes('create_batch') && (
          <Link
            to="/batches/create"
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Batch
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Statuses</option>
            <option value="harvested">Harvested</option>
            <option value="processed">Processed</option>
            <option value="tested">Tested</option>
            <option value="packaged">Packaged</option>
            <option value="in_transit">In Transit</option>
            <option value="retailed">Retailed</option>
          </select>

          {/* Species Filter */}
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Species</option>
            <option value="ashwagandha">Ashwagandha</option>
            <option value="tulsi">Tulsi</option>
            <option value="neem">Neem</option>
            <option value="amla">Amla</option>
            <option value="brahmi">Brahmi</option>
            <option value="shankhpushpi">Shankhpushpi</option>
            <option value="guduchi">Guduchi</option>
            <option value="arjuna">Arjuna</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setSpeciesFilter('');
            }}
            className="btn btn-outline"
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Batches List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {batches.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No batches found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || speciesFilter
                ? 'Try adjusting your filters'
                : 'Get started by creating your first batch'
              }
            </p>
            {user?.permissions?.includes('create_batch') && (
              <Link to="/batches/create" className="btn btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Batch
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="col-span-3">Batch ID</div>
                <div className="col-span-2">Species</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Location</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-1">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {batches.map((batch) => (
                <div key={batch.batchId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Batch ID */}
                    <div className="col-span-3">
                      <div className="flex items-center">
                        <Package className="w-4 h-4 text-gray-400 mr-2" />
                        <Link
                          to={`/batches/${batch.batchId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          {batch.batchId}
                        </Link>
                        {getComplianceIcon(batch.complianceStatus)}
                      </div>
                    </div>

                    {/* Species */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-900 capitalize">
                        {batch.species}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      {getStatusBadge(batch.status)}
                    </div>

                    {/* Location */}
                    <div className="col-span-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">
                          {batch.harvestLocation?.address || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    {/* Created Date */}
                    <div className="col-span-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(batch.createdAt)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      <div className="flex items-center justify-end">
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, batchesData?.data?.total || 0)} of {batchesData?.data?.total || 0} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Batches;
