import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  MapPin,
  Users,
  BarChart3,
  Search,
  Settings,
  Shield,
  QrCode,
  Link as LinkIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { batchesAPI, eventsAPI, complianceAPI } from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import StatsCard from '../../components/UI/StatsCard';
import RecentBatches from '../../components/Dashboard/RecentBatches';
import RecentEvents from '../../components/Dashboard/RecentEvents';
import ComplianceAlerts from '../../components/Dashboard/ComplianceAlerts';
import ActivityChart from '../../components/Dashboard/ActivityChart';

const Dashboard = () => {
  const { user } = useAuthStore();

  // Fetch dashboard data with reduced frequency to prevent rate limiting
  const { data: batchStats, isLoading: batchStatsLoading } = useQuery(
    'batchStats',
    () => batchesAPI.getBatchStats(),
    { 
      refetchInterval: 5 * 60 * 1000, // 5 minutes
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
      cacheTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
    }
  );

  const { data: eventStats, isLoading: eventStatsLoading } = useQuery(
    'eventStats',
    () => eventsAPI.getEventStats(),
    { 
      refetchInterval: 5 * 60 * 1000, // 5 minutes
      staleTime: 2 * 60 * 1000, // Cache for 2 minutes
      cacheTime: 10 * 60 * 1000 // Keep in cache for 10 minutes
    }
  );

  const { data: complianceStats, isLoading: complianceStatsLoading } = useQuery(
    'complianceStats',
    () => complianceAPI.getComplianceStats(),
    { 
      refetchInterval: 10 * 60 * 1000, // 10 minutes for compliance data
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      cacheTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
      enabled: ['admin', 'regulator'].includes(user?.role)
    }
  );

  const { data: recentBatches, isLoading: batchesLoading } = useQuery(
    'recentBatches',
    () => batchesAPI.getBatches({ limit: 5, page: 1 }),
    { 
      refetchInterval: 3 * 60 * 1000, // 3 minutes for recent data
      staleTime: 90 * 1000, // Cache for 90 seconds
      cacheTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
    }
  );

  const { data: recentEvents, isLoading: eventsLoading } = useQuery(
    'recentEvents',
    () => eventsAPI.getEvents({ limit: 5, page: 1 }),
    { 
      refetchInterval: 3 * 60 * 1000, // 3 minutes for recent data
      staleTime: 90 * 1000, // Cache for 90 seconds
      cacheTime: 5 * 60 * 1000 // Keep in cache for 5 minutes
    }
  );

  const isLoading = batchStatsLoading || eventStatsLoading || complianceStatsLoading;

  const stats = [
    {
      title: 'Total Batches',
      value: batchStats?.data?.overview?.totalBatches || 0,
      icon: Package,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Active Events',
      value: eventStats?.data?.overview?.totalEvents || 0,
      icon: Activity,
      color: 'green',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Compliance Rate',
      value: complianceStats?.data?.overview?.complianceRate || 0,
      icon: CheckCircle,
      color: 'green',
      change: '+5%',
      changeType: 'positive',
      suffix: '%'
    },
    {
      title: 'Violations',
      value: complianceStats?.data?.overview?.totalViolations || 0,
      icon: AlertTriangle,
      color: 'red',
      change: '-2%',
      changeType: 'negative'
    }
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Modern Welcome section - Enhanced for Demo Mode */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome back, {user?.username}! 👋
                </h1>
                <p className="text-blue-100 text-lg">
                  Monitor your herb traceability ecosystem with real-time insights
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Activity className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center space-x-4 text-blue-100">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm">System Online</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="text-sm">Demo Environment</span>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
        </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Activity Overview
            </h3>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <ActivityChart data={eventStats?.data?.dailyActivity || []} />
        </div>

        {/* Compliance Status */}
        {['admin', 'regulator'].includes(user?.role) && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Compliance Status
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Overall Compliance</span>
                <span className="text-lg font-bold text-green-600">
                  {complianceStats?.data?.overview?.complianceRate || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${complianceStats?.data?.overview?.complianceRate || 0}%` 
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <div>
                    <div className="font-semibold text-green-900">{complianceStats?.data?.overview?.compliantBatches || 0}</div>
                    <div className="text-xs text-green-600">Compliant</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-red-50 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <div className="font-semibold text-red-900">{complianceStats?.data?.overview?.totalViolations || 0}</div>
                    <div className="text-xs text-red-600">Violations</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Batches
            </h3>
            <Link 
              to="/batches" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200"
            >
              View all
            </Link>
          </div>
          <RecentBatches 
            batches={recentBatches?.data?.data || []} 
            isLoading={batchesLoading}
          />
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Events
            </h3>
            <Link 
              to="/events" 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors duration-200"
            >
              View all
            </Link>
          </div>
          <RecentEvents 
            events={recentEvents?.data?.data || []} 
            isLoading={eventsLoading}
          />
        </div>
      </div>

      {/* Compliance Alerts */}
      {['admin', 'regulator'].includes(user?.role) && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Compliance Alerts
          </h3>
          <ComplianceAlerts />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
        <h3 className="text-xl font-bold text-gray-900 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {user?.permissions?.includes('create_batch') && (
            <Link
              to="/batches/create"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200 mb-2">Create Batch</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Start tracking a new herb batch</p>
              </div>
            </Link>
          )}
          
          <Link
            to="/events/add"
            className="group relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 hover:shadow-lg hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-200 mb-2">Add Event</h4>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Record a new supply chain event</p>
            </div>
          </Link>
          
          {user?.permissions?.includes('scan_qr') && (
            <Link
              to="/qr/scanner"
              className="group relative overflow-hidden bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 hover:shadow-lg hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors duration-200 mb-2">Scan QR Code</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">View batch traceability information</p>
              </div>
            </Link>
          )}

          <Link
            to="/batches"
            className="group relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-200 mb-2">Browse Batches</h4>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">View and search all herb batches</p>
            </div>
          </Link>

          <Link
            to="/events"
            className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-6 hover:shadow-lg hover:border-indigo-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors duration-200 mb-2">View Events</h4>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Track all supply chain events</p>
            </div>
          </Link>

          {['admin', 'regulator'].includes(user?.role) && (
            <Link
              to="/compliance"
              className="group relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6 hover:shadow-lg hover:border-red-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors duration-200 mb-2">Compliance</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Monitor compliance status</p>
              </div>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/users"
              className="group relative overflow-hidden bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-2xl p-6 hover:shadow-lg hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors duration-200 mb-2">Manage Users</h4>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">User management & permissions</p>
              </div>
            </Link>
          )}

          <Link
            to="/blockchain"
            className="group relative overflow-hidden bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-2xl p-6 hover:shadow-lg hover:border-cyan-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-cyan-700 transition-colors duration-200 mb-2">Blockchain</h4>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">View network & verify transactions</p>
            </div>
          </Link>

          <Link
            to="/settings"
            className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-500/10 to-slate-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors duration-200 mb-2">Settings</h4>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-200">Configure your preferences</p>
            </div>
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;
