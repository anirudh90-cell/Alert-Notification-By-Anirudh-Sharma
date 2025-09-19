import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Settings, 
  Users, 
  AlertTriangle, 
  Info, 
  X, 
  Clock, 
  Eye, 
  EyeOff,
  BarChart3,
  Filter
} from 'lucide-react';

import ApiService from './services/ApiService.js';

// Severity badge component
const SeverityBadge = ({ severity }) => {
  const configs = {
    info: { color: 'bg-blue-100 text-blue-800', icon: Info },
    warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
    critical: { color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  };
  
  const config = configs[severity] || configs.info;
  const Icon = config.icon;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
};

// Alert card component
const AlertCard = ({ alert, onSnooze, onMarkRead, onMarkUnread }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className={`border rounded-lg p-4 mb-4 ${
      alert.isSnoozed ? 'bg-gray-50 opacity-75' : 'bg-white'
    } ${!alert.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900">{alert.title}</h3>
            <SeverityBadge severity={alert.severity} />
            {alert.isSnoozed && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                Snoozed
              </span>
            )}
          </div>
          
          <p className="text-gray-600 text-sm mb-3">{alert.message}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>
              {alert.visibility.type.charAt(0).toUpperCase() + alert.visibility.type.slice(1)} Alert
            </span>
            <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => alert.isRead ? onMarkUnread(alert._id) : onMarkRead(alert._id)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={alert.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {alert.isRead ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          
          {!alert.isSnoozed && (
            <button
              onClick={() => onSnooze(alert._id)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="Snooze for today"
            >
              <Clock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Create alert modal
const CreateAlertModal = ({ isOpen, onClose, onSubmit, teams, users }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    severity: 'info',
    deliveryType: 'in-app',
    visibility: {
      type: 'organization',
      targetIds: []
    },
    startTime: '',
    expiryTime: '',
    reminderEnabled: true
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: '',
      message: '',
      severity: 'info',
      deliveryType: 'in-app',
      visibility: {
        type: 'organization',
        targetIds: []
      },
      startTime: '',
      expiryTime: '',
      reminderEnabled: true
    });
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Create New Alert</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Severity</label>
            <select
              value={formData.severity}
              onChange={(e) => setFormData({...formData, severity: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Delivery Type</label>
            <select
              value={formData.deliveryType}
              onChange={(e) => setFormData({...formData, deliveryType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="in-app">In-App</option>
              <option value="email">Email (future)</option>
              <option value="sms">SMS (future)</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <select
              value={formData.visibility.type}
              onChange={(e) => setFormData({
                ...formData, 
                visibility: { ...formData.visibility, type: e.target.value }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="organization">Entire Organization</option>
              <option value="team">Specific Teams</option>
              <option value="user">Specific Users</option>
            </select>
          </div>

          {formData.visibility.type === 'team' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Teams</label>
              <div className="max-h-40 overflow-auto border rounded p-2 space-y-2">
                {teams?.map((team) => (
                  <label key={team._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.visibility.targetIds.includes(team._id)}
                      onChange={(e) => {
                        const selected = new Set(formData.visibility.targetIds);
                        if (e.target.checked) selected.add(team._id); else selected.delete(team._id);
                        setFormData({ ...formData, visibility: { ...formData.visibility, targetIds: Array.from(selected) } });
                      }}
                    />
                    <span>{team.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {formData.visibility.type === 'user' && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Select Users</label>
              <div className="max-h-40 overflow-auto border rounded p-2 space-y-2">
                {users?.map((user) => (
                  <label key={user._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.visibility.targetIds.includes(user._id)}
                      onChange={(e) => {
                        const selected = new Set(formData.visibility.targetIds);
                        if (e.target.checked) selected.add(user._id); else selected.delete(user._id);
                        setFormData({ ...formData, visibility: { ...formData.visibility, targetIds: Array.from(selected) } });
                      }}
                    />
                    <span>{user.name} ({user.email})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4 flex items-center gap-2">
            <input
              id="reminderEnabled"
              type="checkbox"
              checked={formData.reminderEnabled}
              onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
            />
            <label htmlFor="reminderEnabled" className="text-sm">Enable reminders (every 2 hours)</label>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Start Date (Optional)</label>
            <input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({...formData, startTime: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Expiry Date (Optional)</label>
            <input
              type="datetime-local"
              value={formData.expiryTime}
              onChange={(e) => setFormData({...formData, expiryTime: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Alert
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Analytics dashboard
const AnalyticsDashboard = ({ analytics }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Analytics Dashboard
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-1">Total Alerts</h3>
          <p className="text-2xl font-bold text-blue-600">{analytics.totalAlerts}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-900 mb-1">Active Alerts</h3>
          <p className="text-2xl font-bold text-green-600">{analytics.activeAlerts}</p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-yellow-900 mb-1">Total Snoozed</h3>
          <p className="text-2xl font-bold text-yellow-600">{analytics.totalSnoozed}</p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-900 mb-1">Critical Alerts</h3>
          <p className="text-2xl font-bold text-red-600">
            {analytics.severityBreakdown.find(s => s._id === 'critical')?.count || 0}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium mb-4">Severity Breakdown</h3>
          <div className="space-y-3">
            {analytics.severityBreakdown.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={item._id} />
                </div>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">Delivery Status</h3>
          <div className="space-y-3">
            {analytics.deliveryStats.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <span className="capitalize">{item._id}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main application component
const AlertingPlatform = () => {
  const [currentView, setCurrentView] = useState('alerts');
  const [snoozedAlerts, setSnoozedAlerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterRead, setFilterRead] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState('admin'); // demo role
  const [actingUserId, setActingUserId] = useState('');
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);

  // Manage view state
  const [manageFilters, setManageFilters] = useState({
    severity: 'all',
    status: 'all',
    audience: 'all',
    audienceIds: [],
  });
  const [manageAlerts, setManageAlerts] = useState([]);
  
  useEffect(() => {
    loadData();
  }, [currentView]);

  // Ensure impersonation list matches selected role
  useEffect(() => {
    const filtered = users.filter(u => userRole === 'admin' ? u.role === 'admin' : u.role !== 'admin');
    if (filtered.length === 0) return;
    if (!filtered.find(u => u._id === actingUserId)) {
      const nextId = filtered[0]._id;
      setActingUserId(nextId);
      ApiService.setUserId(nextId);
      loadData();
    }
  }, [userRole, users]);
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      if (!users.length) {
        try {
          const u = await ApiService.get('/api/admin/users');
          setUsers(u);
          if (!actingUserId && !ApiService.currentUserId && u.length) {
            setActingUserId(u[0]._id);
            ApiService.setUserId(u[0]._id);
          }
        } catch {}
      }
      if (currentView === 'alerts') {
        const data = await ApiService.get('/api/user/alerts');
        setAlerts(data);
      } else if (currentView === 'analytics') {
        const data = await ApiService.get('/api/analytics');
        setAnalytics(data);
      } else if (currentView === 'snoozed') {
        const data = await ApiService.get('/api/user/alerts/snoozed');
        setSnoozedAlerts(data);
      } else if (currentView === 'manage') {
        await loadAdminOptions();
        await loadManageAlerts();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAdminOptions = async () => {
    const [t, u] = await Promise.all([
      ApiService.get('/api/admin/teams'),
      ApiService.get('/api/admin/users'),
    ]);
    setTeams(t);
    setUsers(u);
  };

  const loadManageAlerts = async () => {
    const params = new URLSearchParams();
    if (manageFilters.severity !== 'all') params.set('severity', manageFilters.severity);
    if (manageFilters.status !== 'all') params.set('status', manageFilters.status);
    if (manageFilters.audience !== 'all') params.set('audience', manageFilters.audience);
    if (manageFilters.audienceIds.length > 0) params.set('audienceIds', manageFilters.audienceIds.join(','));
    const data = await ApiService.get(`/api/alerts?${params.toString()}`);
    setManageAlerts(data);
  };
  
  const handleCreateAlert = async (alertData) => {
    try {
      const payload = { ...alertData };
      if (!payload.startTime) delete payload.startTime;
      if (!payload.expiryTime) delete payload.expiryTime;
      const created = await ApiService.post('/api/alerts', payload);
      setIsCreateModalOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  };
  
  const handleSnoozeAlert = async (alertId) => {
    try {
      await ApiService.post(`/api/user/alerts/${alertId}/snooze`);
      setAlerts(alerts.map(alert => 
        alert._id === alertId 
          ? { ...alert, isSnoozed: true } 
          : alert
      ));
    } catch (error) {
      console.error('Error snoozing alert:', error);
    }
  };
  
  const handleMarkRead = async (alertId) => {
    try {
      await ApiService.post(`/api/user/alerts/${alertId}/read`);
      setAlerts(alerts.map(alert => 
        alert._id === alertId 
          ? { ...alert, isRead: true } 
          : alert
      ));
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  };
  
  const handleMarkUnread = async (alertId) => {
    try {
      await ApiService.post(`/api/user/alerts/${alertId}/unread`);
      setAlerts(alerts.map(alert => 
        alert._id === alertId 
          ? { ...alert, isRead: false } 
          : alert
      ));
    } catch (error) {
      console.error('Error marking alert as unread:', error);
    }
  };
  
  const filteredAlerts = alerts.filter(alert => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    if (filterRead === 'read' && !alert.isRead) return false;
    if (filterRead === 'unread' && alert.isRead) return false;
    return true;
  });
  
  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Alerting Platform
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <select
                className="border px-2 py-1 rounded text-sm"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <select
                className="border px-2 py-1 rounded text-sm"
                value={actingUserId}
                onChange={(e) => { setActingUserId(e.target.value); ApiService.setUserId(e.target.value); loadData(); }}
                title="Impersonate user"
              >
                {users
                  .filter(u => userRole === 'admin' ? u.role === 'admin' : u.role !== 'admin')
                  .map(u => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
              </select>
              {unreadCount > 0 && (
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-500" />
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                    {unreadCount} unread
                  </span>
                </div>
              )}
              
              {userRole === 'admin' && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Create Alert
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setCurrentView('alerts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Alerts
            </button>
            <button
              onClick={() => setCurrentView('snoozed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentView === 'snoozed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Snoozed
            </button>
            
            {userRole === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('manage')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    currentView === 'manage'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Manage Alerts
                </button>
                
                <button
                  onClick={() => setCurrentView('analytics')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    currentView === 'analytics'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Analytics
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'alerts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Alerts</h2>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="all">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <select
                  value={filterRead}
                  onChange={(e) => setFilterRead(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">All</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading alerts...</p>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No alerts found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map(alert => (
                  <AlertCard
                    key={alert._id}
                    alert={alert}
                    onSnooze={handleSnoozeAlert}
                    onMarkRead={handleMarkRead}
                    onMarkUnread={handleMarkUnread}
                  />
                ))}
              </div>
            )}
          </div>
        )}
        
        {currentView === 'analytics' && analytics && (
          <AnalyticsDashboard analytics={analytics} />
        )}

        {currentView === 'snoozed' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Snoozed Alerts</h2>
            <div className="space-y-3">
              {snoozedAlerts.length === 0 ? (
                <div className="text-gray-500">No snoozed alerts</div>
              ) : (
                snoozedAlerts.map(a => (
                  <div key={a._id} className="bg-white border rounded p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{a.title}</h3>
                      <SeverityBadge severity={a.severity} />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{a.message}</p>
                    <div className="text-xs text-gray-500 flex gap-4">
                      <span>Until: {a.snoozeUntil ? new Date(a.snoozeUntil).toLocaleString() : '-'}</span>
                      <span>Visibility: {a.visibility?.type}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {currentView === 'manage' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Alerts</h2>
            <div className="bg-white border rounded p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <select
                    value={manageFilters.severity}
                    onChange={(e) => setManageFilters({ ...manageFilters, severity: e.target.value })}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="all">All</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={manageFilters.status}
                    onChange={(e) => setManageFilters({ ...manageFilters, status: e.target.value })}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="all">All</option>
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Audience</label>
                  <select
                    value={manageFilters.audience}
                    onChange={(e) => setManageFilters({ ...manageFilters, audience: e.target.value, audienceIds: [] })}
                    className="w-full px-2 py-1 border rounded"
                  >
                    <option value="all">All</option>
                    <option value="organization">Organization</option>
                    <option value="team">Team</option>
                    <option value="user">User</option>
                  </select>
                </div>
                {manageFilters.audience === 'team' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Teams</label>
                    <div className="max-h-24 overflow-auto border rounded p-2 space-y-1">
                      {teams.map((t) => (
                        <label key={t._id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={manageFilters.audienceIds.includes(t._id)}
                            onChange={(e) => {
                              const selected = new Set(manageFilters.audienceIds);
                              if (e.target.checked) selected.add(t._id); else selected.delete(t._id);
                              setManageFilters({ ...manageFilters, audienceIds: Array.from(selected) });
                            }}
                          />
                          <span>{t.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                {manageFilters.audience === 'user' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Users</label>
                    <div className="max-h-24 overflow-auto border rounded p-2 space-y-1">
                      {users.map((u) => (
                        <label key={u._id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={manageFilters.audienceIds.includes(u._id)}
                            onChange={(e) => {
                              const selected = new Set(manageFilters.audienceIds);
                              if (e.target.checked) selected.add(u._id); else selected.delete(u._id);
                              setManageFilters({ ...manageFilters, audienceIds: Array.from(selected) });
                            }}
                          />
                          <span>{u.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={loadManageAlerts}>Apply Filters</button>
              </div>
            </div>

            <div className="bg-white border rounded">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2">Title</th>
                      <th className="text-left px-4 py-2">Severity</th>
                      <th className="text-left px-4 py-2">Audience</th>
                      <th className="text-left px-4 py-2">Start</th>
                      <th className="text-left px-4 py-2">Active</th>
                      <th className="text-left px-4 py-2">Reminders</th>
                      <th className="text-left px-4 py-2">Expiry</th>
                      <th className="text-left px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manageAlerts.map((a) => (
                      <tr key={a._id} className="border-t">
                        <td className="px-4 py-2 font-medium">{a.title}</td>
                        <td className="px-4 py-2"><SeverityBadge severity={a.severity} /></td>
                        <td className="px-4 py-2 capitalize">{a.visibility?.type}</td>
                        <td className="px-4 py-2">
                          <input
                            type="datetime-local"
                            className="border rounded px-2 py-1"
                            value={a.startTime ? new Date(a.startTime).toISOString().slice(0,16) : ''}
                            onChange={(e) => {
                              setManageAlerts(manageAlerts.map(m => m._id === a._id ? { ...m, startTime: e.target.value ? new Date(e.target.value).toISOString() : null } : m));
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">{a.isActive ? 'Yes' : 'No'}</td>
                        <td className="px-4 py-2">{a.reminderEnabled ? 'On' : 'Off'}</td>
                        <td className="px-4 py-2">
                          <input
                            type="datetime-local"
                            className="border rounded px-2 py-1"
                            value={a.expiryTime ? new Date(a.expiryTime).toISOString().slice(0,16) : ''}
                            onChange={(e) => {
                              setManageAlerts(manageAlerts.map(m => m._id === a._id ? { ...m, expiryTime: e.target.value ? new Date(e.target.value).toISOString() : null } : m));
                            }}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <button
                              title="Save schedule"
                              className="px-3 py-1.5 text-white rounded-md text-sm bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              onClick={async () => { await ApiService.put(`/api/alerts/${a._id}`, { startTime: a.startTime || null, expiryTime: a.expiryTime || null }); await loadManageAlerts(); }}
                            >Save</button>
                            <button
                              title={a.isActive ? 'Archive alert' : 'Activate alert'}
                              className={`px-3 py-1.5 text-white rounded-md text-sm focus:outline-none focus:ring-2 ${a.isActive ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'}`}
                              onClick={async () => { await ApiService.put(`/api/alerts/${a._id}`, { isActive: !a.isActive }); await loadManageAlerts(); }}
                            >{a.isActive ? 'Archive' : 'Activate'}</button>
                            <button
                              title={a.reminderEnabled ? 'Disable reminders' : 'Enable reminders'}
                              className={`px-3 py-1.5 text-white rounded-md text-sm focus:outline-none focus:ring-2 ${a.reminderEnabled ? 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                              onClick={async () => { await ApiService.put(`/api/alerts/${a._id}`, { reminderEnabled: !a.reminderEnabled }); await loadManageAlerts(); }}
                            >{a.reminderEnabled ? 'Disable Reminders' : 'Enable Reminders'}</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Create Alert Modal */}
      {userRole === 'admin' && (
        <CreateAlertModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateAlert}
          teams={teams}
          users={users}
        />
      )}
    </div>
  );
};

export default AlertingPlatform;