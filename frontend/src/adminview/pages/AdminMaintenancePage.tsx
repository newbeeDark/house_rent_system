import React, { useEffect, useState } from "react";
import { AdminBuildingIcon, AdminCloseIcon, AdminPlusIcon, AdminSearchIcon } from "../components/UI/AdminIcons";
import { Card } from "../components/UI";
import { supabase } from "../../lib/supabase";

// Complaint type definition - matching actual database schema
interface Complaint {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reporter_email?: string;
  target_type: 'property' | 'user';
  target_id: string;
  property_title?: string;
  category: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  created_at: string;
}

export const MaintenanceView = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    target_type: 'property' as 'property' | 'user',
    target_id: '',
    category: 'other',
    description: '',
    status: 'open' as 'open' | 'in_progress' | 'resolved' | 'dismissed',
    reporter_name: ''
  });

  // Priority mapping based on category
  const getPriority = (category: string): { label: string; style: string } => {
    switch (category.toLowerCase()) {
      case 'emergency':
      case 'safety':
        return { label: 'Emergency', style: 'bg-rose-50 text-rose-600 border-rose-100' };
      case 'urgent':
      case 'payment':
        return { label: 'High', style: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'maintenance':
      case 'property':
        return { label: 'Medium', style: 'bg-amber-50 text-amber-600 border-amber-100' };
      default:
        return { label: 'Low', style: 'bg-blue-50 text-blue-600 border-blue-100' };
    }
  };

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'open':
        return 'bg-amber-100 text-amber-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'resolved':
        return 'bg-emerald-100 text-emerald-700';
      case 'dismissed':
        return 'bg-slate-100 text-slate-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch complaints - using correct column names from database
      const { data: complaintsData, error: complaintsError } = await supabase
        .from('complaints')
        .select(`
                    id,
                    reporter_id,
                    target_type,
                    target_id,
                    category,
                    description,
                    status,
                    created_at
                `)
        .order('created_at', { ascending: false });

      if (complaintsError) {
        console.error('Error fetching complaints:', complaintsError);
        setError(`Failed to load complaints: ${complaintsError.message}`);
        setComplaints([]);
        return;
      }

      if (!complaintsData || complaintsData.length === 0) {
        setComplaints([]);
        setLoading(false);
        return;
      }

      // Fetch reporter names
      const reporterIds = [...new Set(complaintsData.map(c => c.reporter_id).filter(Boolean))];
      let usersData: any[] = [];
      if (reporterIds.length > 0) {
        const { data } = await supabase
          .from('users')
          .select('id, full_name, email')
          .in('id', reporterIds);
        usersData = data || [];
      }

      // Fetch property titles for property-type complaints
      const propertyIds = complaintsData
        .filter(c => c.target_type === 'property' && c.target_id)
        .map(c => c.target_id);

      let propertiesData: any[] = [];
      if (propertyIds.length > 0) {
        const { data } = await supabase
          .from('properties')
          .select('id, title')
          .in('id', propertyIds);
        propertiesData = data || [];
      }

      // Merge data
      const enrichedComplaints = complaintsData.map(complaint => {
        const reporter = usersData.find(u => u.id === complaint.reporter_id);
        const property = propertiesData.find(p => p.id === complaint.target_id);
        return {
          ...complaint,
          reporter_name: reporter?.full_name || 'Unknown',
          reporter_email: reporter?.email || '',
          property_title: property?.title || ''
        };
      });

      setComplaints(enrichedComplaints);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (complaint: Complaint) => {
    setEditingComplaint(complaint);
    setFormData({
      target_type: complaint.target_type,
      target_id: complaint.target_id || '',
      category: complaint.category,
      description: complaint.description,
      status: complaint.status,
      reporter_name: complaint.reporter_name || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComplaint) return;

    if (!window.confirm('Are you sure you want to save these changes?')) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          category: formData.category,
          description: formData.description.trim(),
          status: formData.status
        })
        .eq('id', editingComplaint.id);

      if (error) throw error;

      fetchComplaints();
      setShowModal(false);
      setEditingComplaint(null);
      alert('Complaint updated successfully!');
    } catch (err: any) {
      console.error('Error updating complaint:', err);
      alert(`Failed to update complaint: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (complaintId: string) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('complaints')
        .delete()
        .eq('id', complaintId);

      if (error) throw error;

      setComplaints(prev => prev.filter(c => c.id !== complaintId));
      if (showModal) {
        setShowModal(false);
        setEditingComplaint(null);
      }
      alert('Complaint deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting complaint:', err);
      alert(`Failed to delete complaint: ${err.message}`);
    }
  };

  const openAddModal = () => {
    setFormData({
      target_type: 'property',
      target_id: '',
      category: 'other',
      description: '',
      status: 'open',
      reporter_name: ''
    });
    setShowAddModal(true);
  };

  const handleAddComplaint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert('Description is required.');
      return;
    }

    if (!formData.target_id.trim()) {
      alert('Target ID is required.');
      return;
    }

    if (!window.confirm('Create this new complaint?')) return;

    setIsSaving(true);
    try {
      // Get current user as reporter
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to create a complaint.');
        return;
      }

      const { error } = await supabase
        .from('complaints')
        .insert({
          reporter_id: user.id,
          target_type: formData.target_type,
          target_id: formData.target_id.trim(),
          category: formData.category,
          description: formData.description.trim(),
          status: formData.status
        });

      if (error) throw error;

      fetchComplaints();
      setShowAddModal(false);
      alert('Complaint created successfully!');
    } catch (err: any) {
      console.error('Error creating complaint:', err);
      alert(`Failed to create complaint: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter complaints based on tab and search
  const filteredComplaints = complaints.filter(c => {
    // Tab filter
    if (activeTab === 'Open' && c.status !== 'open') return false;
    if (activeTab === 'In Progress' && c.status !== 'in_progress') return false;
    if (activeTab === 'Resolved' && c.status !== 'resolved' && c.status !== 'dismissed') return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        c.description.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.reporter_name?.toLowerCase().includes(query) ||
        c.property_title?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const tabs = ['All Requests', 'Open', 'In Progress', 'Resolved'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Complaints & <span className="text-orange-500">Maintenance</span></h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage all complaints and maintenance requests</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 font-semibold text-sm transition-all"
        >
          <AdminPlusIcon width={18} height={18} />
          <span>New Complaint</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          {error}
          <button onClick={fetchComplaints} className="ml-4 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md group">
          <AdminSearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search complaints..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <Card className="p-0 overflow-hidden border-0 shadow-lg">
        {loading ? (
          <div className="p-10 text-center text-slate-400">Loading complaints...</div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            {complaints.length === 0 ? 'No complaints in the database' : 'No complaints match your filter'}
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredComplaints.map(complaint => {
              const priority = getPriority(complaint.category);
              return (
                <li key={complaint.id} className="p-6 hover:bg-slate-50 transition-colors group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          #{complaint.id.slice(0, 8)}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusStyle(complaint.status)}`}>
                          {complaint.status.replace('_', ' ')}
                        </span>
                        <h3 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                          {complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)} Issue
                        </h3>
                      </div>
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">{complaint.description}</p>
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Reporter:</span> {complaint.reporter_name}
                        </span>
                        {complaint.target_type === 'property' && complaint.property_title && (
                          <span className="flex items-center gap-1">
                            <AdminBuildingIcon width={12} height={12} />
                            {complaint.property_title}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end min-w-[100px]">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${priority.style}`}>
                          {priority.label}
                        </span>
                        <span className="text-xs text-slate-400 mt-1 font-medium">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(complaint)}
                          className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(complaint.id)}
                          className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Edit Modal */}
      {showModal && editingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Complaint</h3>
                <p className="text-orange-100 text-xs mt-0.5">#{editingComplaint.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditingComplaint(null); }}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <AdminCloseIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Reporter Info (Read-only) */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Reporter</label>
                <input
                  type="text"
                  value={formData.reporter_name}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600"
                />
              </div>

              {/* Target Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Target Type</label>
                <select
                  value={formData.target_type}
                  disabled
                  className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-600"
                >
                  <option value="property">Property</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="safety">Safety</option>
                  <option value="payment">Payment</option>
                  <option value="noise">Noise</option>
                  <option value="property">Property</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 focus:border-orange-500 transition-all resize-none"
                  placeholder="Describe the complaint..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDelete(editingComplaint.id)}
                  className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold transition-all"
                >
                  Delete
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingComplaint(null); }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">New Complaint</h3>
                <p className="text-blue-100 text-xs mt-0.5">Create a new complaint or maintenance request</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <AdminCloseIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddComplaint} className="p-6 space-y-4">
              {/* Target Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Target Type *</label>
                <select
                  value={formData.target_type}
                  onChange={(e) => setFormData({ ...formData, target_type: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="property">Property</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Target ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Target ID *</label>
                <input
                  type="text"
                  value={formData.target_id}
                  onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                  placeholder="UUID of the property or user"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="safety">Safety</option>
                  <option value="payment">Payment</option>
                  <option value="noise">Noise</option>
                  <option value="property">Property</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
                  placeholder="Describe the issue in detail..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Creating...' : 'Create Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
