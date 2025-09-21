import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let response;
        if (userId) {
          // Viewing another user's profile
          response = await api.get(`/users/${userId}`);
          setIsOwnProfile(false);
        } else {
          // Viewing own profile - use current user data or fetch fresh data
          if (currentUser) {
            setUser(currentUser);
            setIsOwnProfile(true);
            setLoading(false);
            return;
          } else {
            // Fallback: fetch current user profile
            response = await api.get('/auth/me');
            setIsOwnProfile(true);
          }
        }
        setUser(response.data.user || response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, currentUser]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        {isOwnProfile ? 'My Profile' : `${user.name}'s Profile`}
      </h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              <p><strong>Name:</strong> {user.name}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> 
                <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </p>
              <p><strong>Status:</strong> 
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.status === 'active' ? 'bg-green-100 text-green-800' :
                  user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {user.status}
                </span>
              </p>
              <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              <p><strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Permissions</h3>
            <div className="space-y-2">
              {user.permissions?.map((permission, index) => (
                <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2">
                  {permission}
                </span>
              ))}
            </div>
          </div>
        </div>

        {user.activity && user.activity.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {user.activity.map((activity, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4">
                  <p><strong>{activity.action}:</strong> {activity.description}</p>
                  <p className="text-sm text-gray-600">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
