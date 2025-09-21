import { create } from 'zustand';
import { io } from 'socket.io-client';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  socket: null,
  isConnected: false,
  unreadCount: 0,

  // Actions
  addNotification: (notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true
      })),
      unreadCount: 0
    }));
  },

  removeNotification: (notificationId) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === notificationId);
      const wasUnread = notification && !notification.read;
      
      return {
        notifications: state.notifications.filter(n => n.id !== notificationId),
        unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
      };
    });
  },

  clearAllNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0
    });
  },

  // Socket.IO connection
  initializeNotifications: () => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      autoConnect: false
    });

    socket.on('connect', () => {
      set({ isConnected: true });
      console.log('Notification socket connected');
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
      console.log('Notification socket disconnected');
    });

    socket.on('compliance_alert', (data) => {
      get().addNotification({
        type: 'compliance_alert',
        title: 'Compliance Alert',
        message: `Compliance violations detected for batch ${data.batchId}`,
        severity: 'high',
        data
      });
    });

    socket.on('batch_update', (data) => {
      get().addNotification({
        type: 'batch_update',
        title: 'Batch Update',
        message: `Batch ${data.batchId} status updated to ${data.updateType}`,
        severity: 'medium',
        data
      });
    });

    socket.on('quality_test_result', (data) => {
      get().addNotification({
        type: 'quality_test_result',
        title: 'Quality Test Results',
        message: `Quality test results available for batch ${data.batchId}`,
        severity: 'medium',
        data
      });
    });

    socket.on('qr_code_generated', (data) => {
      get().addNotification({
        type: 'qr_code_generated',
        title: 'QR Code Generated',
        message: `QR code generated for batch ${data.batchId}`,
        severity: 'low',
        data
      });
    });

    socket.on('system_maintenance', (data) => {
      get().addNotification({
        type: 'system_maintenance',
        title: 'System Maintenance',
        message: data.message,
        severity: 'high',
        data
      });
    });

    set({ socket });
  },

  connect: () => {
    const { socket } = get();
    if (socket && !socket.connected) {
      socket.connect();
    }
  },

  disconnect: () => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.disconnect();
    }
  },

  // Join rooms for real-time updates
  joinRoom: (room) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('join-room', room);
    }
  },

  leaveRoom: (room) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit('leave-room', room);
    }
  },

  // Get notifications by type
  getNotificationsByType: (type) => {
    const { notifications } = get();
    return notifications.filter(notification => notification.type === type);
  },

  // Get unread notifications
  getUnreadNotifications: () => {
    const { notifications } = get();
    return notifications.filter(notification => !notification.read);
  },

  // Get notifications by severity
  getNotificationsBySeverity: (severity) => {
    const { notifications } = get();
    return notifications.filter(notification => notification.severity === severity);
  },

  // Get recent notifications (last 24 hours)
  getRecentNotifications: () => {
    const { notifications } = get();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return notifications.filter(notification => 
      new Date(notification.timestamp) > oneDayAgo
    );
  },

  // Get notification statistics
  getNotificationStats: () => {
    const { notifications, unreadCount } = get();
    
    const stats = {
      total: notifications.length,
      unread: unreadCount,
      byType: {},
      bySeverity: {}
    };

    notifications.forEach(notification => {
      // Count by type
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
      
      // Count by severity
      stats.bySeverity[notification.severity] = (stats.bySeverity[notification.severity] || 0) + 1;
    });

    return stats;
  }
}));

export { useNotificationStore };
export default useNotificationStore;
