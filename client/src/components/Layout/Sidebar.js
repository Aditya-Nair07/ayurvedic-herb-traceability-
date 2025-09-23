import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Activity, 
  QrCode, 
  Shield, 
  Users, 
  Settings,
  X,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      permission: null
    },
    {
      name: 'Batches',
      href: '/batches',
      icon: Package,
      permission: null
    },
    {
      name: 'Events',
      href: '/events',
      icon: Activity,
      permission: null
    },
    {
      name: 'Blockchain',
      href: '/blockchain',
      icon: LinkIcon,
      permission: null
    },
    {
      name: 'QR Scanner',
      href: '/qr/scanner',
      icon: QrCode,
      permission: 'scan_qr'
    },
    {
      name: 'QR Generator',
      href: '/qr/generator',
      icon: QrCode,
      permission: 'generate_qr'
    },
    {
      name: 'Compliance',
      href: '/compliance',
      icon: Shield,
      permission: 'compliance_check'
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      permission: 'admin'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      permission: null
    }
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true;
    if (item.permission === 'admin') return user?.role === 'admin';
    return user?.permissions?.includes(item.permission);
  });

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AH</span>
              </div>
            </div>
            <div className="ml-3">
              <h1 className="text-lg font-semibold text-gray-900">BioTrace</h1>
              <p className="text-xs text-gray-500">BioTrace System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-2">
          <ul className="space-y-1">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={`
                      group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                    onClick={onClose}
                  >
                    <item.icon 
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `} 
                    />
                    {item.name}
                    {isActive && (
                      <ChevronRight className="ml-auto h-4 w-4 text-blue-500" />
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>BioTrace System</p>
            <p>Version 1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
