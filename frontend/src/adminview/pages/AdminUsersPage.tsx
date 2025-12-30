import React, { useEffect, useState } from "react";
import { AdminChevronRightIcon, AdminCloseIcon } from "../components/UI/AdminIcons";
import { Card } from "../components/UI";
import { supabase } from "../../lib/supabase";
import type { AdminUser } from "../types/AdminTypes";

export const UsersView = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        role: 'tenant',
        full_name: '',
        phone: '',
        is_verified: false,
        email: '',
        password: '',
        // Role specific
        student_id: '',
        agency_name: '',
        agency_license: '',
        landlord_licenceid: ''
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Step 1: Fetch all users (basic query without joins that might fail)
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select(`
                    id,
                    full_name,
                    email,
                    phone,
                    role,
                    is_verified,
                    student_id,
                    agency_name,
                    agency_license,
                    landlord_licenceid,
                    created_at
                `)
                .order('created_at', { ascending: false });

            if (usersError) {
                console.error("Error fetching users:", usersError);
                throw usersError;
            }

            // Step 2: Fetch applications with property titles separately
            const { data: applicationsData, error: appError } = await supabase
                .from('applications')
                .select(`
                    applicant_id,
                    status,
                    stage,
                    contract_status,
                    updated_at,
                    properties ( title )
                `);

            if (appError) {
                console.warn("Could not fetch applications:", appError);
                // Continue without applications data
            }

            // Step 3: Merge applications into users
            const usersWithApps = (usersData || []).map(user => {
                const userApplications = (applicationsData || [])
                    .filter(app => app.applicant_id === user.id)
                    .map(app => ({
                        status: app.status,
                        stage: app.stage,
                        contract_status: app.contract_status,
                        updated_at: app.updated_at,
                        properties: app.properties
                    }));

                return {
                    ...user,
                    applications: userApplications
                };
            });

            setUsers(usersWithApps as unknown as AdminUser[]);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

        try {
            // Delete from public.users - Trigger should ideally handle auth.users deletion if set up
            const { error } = await supabase.from('users').delete().eq('id', userId);
            if (error) throw error;

            setUsers(prev => prev.filter(u => u.id !== userId));
            alert("User deleted successfully.");
        } catch (err) {
            console.error("Error deleting user:", err);
            alert("Failed to delete user.");
        }
    };

    const handleEdit = (user: AdminUser) => {
        setEditingUser(user);
        setFormData({
            role: user.role || 'tenant',
            full_name: user.full_name || '',
            phone: user.phone || '',
            is_verified: user.is_verified || false,
            email: user.email || '',
            password: '', // Always empty initially
            student_id: user.student_id || '',
            agency_name: user.agency_name || '',
            agency_license: user.agency_license || '',
            landlord_licenceid: user.landlord_licenceid || ''
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        // Show confirmation dialog
        const confirmMessage = formData.password && formData.password.trim().length > 0
            ? "Are you sure you want to save these changes? This will also update the user's password."
            : "Are you sure you want to save these changes?";

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            // Trim all string fields to avoid uploading whitespace-only values
            const trimmedEmail = formData.email?.trim() || '';
            const trimmedFullName = formData.full_name?.trim() || '';
            const trimmedPhone = formData.phone?.trim() || '';
            const trimmedStudentId = formData.student_id?.trim() || '';
            const trimmedAgencyName = formData.agency_name?.trim() || '';
            const trimmedAgencyLicense = formData.agency_license?.trim() || '';
            const trimmedLandlordLicence = formData.landlord_licenceid?.trim() || '';
            const trimmedPassword = formData.password?.trim() || '';

            // Validate required fields
            if (!trimmedFullName) {
                alert("Full name is required.");
                return;
            }

            // 1. Build update object - only include non-empty values for optional fields
            const updates: Record<string, any> = {
                role: formData.role,
                full_name: trimmedFullName,
                is_verified: formData.is_verified,
                email: trimmedEmail || null // Keep email even if empty, or set to null
            };

            // Only update phone if provided
            if (trimmedPhone) {
                updates.phone = trimmedPhone;
            }

            // Add role-specific fields only if they have values
            if (formData.role === 'student' || formData.role === 'tenant') {
                updates.student_id = trimmedStudentId || null;
                // Clear other role-specific fields
                updates.agency_name = null;
                updates.agency_license = null;
                updates.landlord_licenceid = null;
            }
            if (formData.role === 'agent') {
                updates.agency_name = trimmedAgencyName || null;
                updates.agency_license = trimmedAgencyLicense || null;
                // Clear other role-specific fields
                updates.student_id = null;
                updates.landlord_licenceid = null;
            }
            if (formData.role === 'landlord') {
                updates.landlord_licenceid = trimmedLandlordLicence || null;
                // Clear other role-specific fields
                updates.student_id = null;
                updates.agency_name = null;
                updates.agency_license = null;
            }
            if (formData.role === 'admin') {
                // Clear all role-specific fields for admin
                updates.student_id = null;
                updates.agency_name = null;
                updates.agency_license = null;
                updates.landlord_licenceid = null;
            }

            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', editingUser.id);

            if (error) throw error;

            // 2. Handle Password Update ONLY if a new password is actually provided
            // Check: not empty, not just whitespace, and has minimum length
            if (trimmedPassword && trimmedPassword.length >= 6) {
                const { error: pwdError } = await supabase.rpc('admin_update_user_password', {
                    user_id: editingUser.id,
                    new_password: trimmedPassword
                });

                if (pwdError) {
                    console.error("Password update failed:", pwdError);
                    alert("Profile saved, but password update failed. Make sure 'admin_update_user_password' RPC function is created in Supabase.");
                } else {
                    console.log("Password updated via RPC");
                }
            } else if (trimmedPassword && trimmedPassword.length > 0 && trimmedPassword.length < 6) {
                // Password was entered but too short
                alert("Profile saved, but password was not updated. Password must be at least 6 characters.");
            }
            // If password field is empty, we simply don't update it - keeping the existing password

            // Refresh list and close modal
            fetchUsers();
            setShowModal(false);
            setEditingUser(null);
            alert("User updated successfully!");
        } catch (err) {
            console.error("Error updating user:", err);
            alert("Failed to update user. Please try again.");
        }
    };

    // Open Add User Modal
    const openAddUserModal = () => {
        setFormData({
            role: 'student',  // Default to student (not tenant)
            full_name: '',
            phone: '',
            is_verified: false,
            email: '',
            password: '',
            student_id: '',
            agency_name: '',
            agency_license: '',
            landlord_licenceid: ''
        });
        setShowAddModal(true);
    };

    // Handle Add User
    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        const trimmedEmail = formData.email?.trim() || '';
        const trimmedFullName = formData.full_name?.trim() || '';
        const trimmedPassword = formData.password?.trim() || '';
        const trimmedPhone = formData.phone?.trim() || '';

        if (!trimmedEmail) {
            alert("Email is required.");
            return;
        }
        if (!trimmedFullName) {
            alert("Full name is required.");
            return;
        }
        if (!trimmedPassword || trimmedPassword.length < 6) {
            alert("Password is required and must be at least 6 characters.");
            return;
        }

        // Confirm creation
        if (!window.confirm(`Create new user with email: ${trimmedEmail}?`)) {
            return;
        }

        setIsCreating(true);

        // IMPORTANT: Save current admin session before creating new user
        // signUp() can switch the session to the new user even with email confirmation disabled
        const { data: currentSession } = await supabase.auth.getSession();
        const adminAccessToken = currentSession.session?.access_token;
        const adminRefreshToken = currentSession.session?.refresh_token;

        try {
            // Build metadata for the new user
            const metadata: Record<string, any> = {
                full_name: trimmedFullName,
                role: formData.role,
                phone: trimmedPhone || undefined
            };

            // Add role-specific metadata
            if (formData.role === 'student' || formData.role === 'tenant') {
                metadata.student_id = formData.student_id?.trim() || undefined;
            }
            if (formData.role === 'agent') {
                metadata.agency_name = formData.agency_name?.trim() || undefined;
                metadata.agency_license = formData.agency_license?.trim() || undefined;
            }
            if (formData.role === 'landlord') {
                metadata.landlord_licenceID = formData.landlord_licenceid?.trim() || undefined;
            }

            // Use Supabase signUp to create the user
            // Note: The handle_new_user trigger will automatically create the public.users entry
            const { data, error } = await supabase.auth.signUp({
                email: trimmedEmail,
                password: trimmedPassword,
                options: {
                    data: metadata,
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) {
                throw error;
            }

            if (data.user) {
                // If is_verified is checked, update the user in public.users
                if (formData.is_verified) {
                    // Wait a moment for the trigger to create the user
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    await supabase
                        .from('users')
                        .update({ is_verified: true })
                        .eq('id', data.user.id);
                }

                alert(`User created successfully!\n\nEmail: ${trimmedEmail}`);

                // IMPORTANT: Restore admin session after creating the new user
                // This ensures the admin stays logged in as admin, not as the new user
                if (adminAccessToken && adminRefreshToken) {
                    await supabase.auth.setSession({
                        access_token: adminAccessToken,
                        refresh_token: adminRefreshToken
                    });
                }

                // Refresh user list
                fetchUsers();
                setShowAddModal(false);
            }
        } catch (err: any) {
            console.error("Error creating user:", err);
            if (err.message?.includes('already registered')) {
                alert("A user with this email already exists.");
            } else {
                alert(`Failed to create user: ${err.message || 'Unknown error'}`);
            }

            // Restore admin session on error too
            if (adminAccessToken && adminRefreshToken) {
                await supabase.auth.setSession({
                    access_token: adminAccessToken,
                    refresh_token: adminRefreshToken
                });
            }
        } finally {
            setIsCreating(false);
        }
    };

    // Helper to get primary application info
    const getUserAppInfo = (user: AdminUser) => {
        if (!user.applications || user.applications.length === 0) return null;
        return user.applications[0];
    };

    return (
        <>
            <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border-0 shadow-lg">
                <div className="flex justify-between items-center mb-8 px-2">
                    <div>
                        <h2 className="font-bold text-xl text-slate-800">User Management</h2>
                        <p className="text-sm text-slate-500 mt-1">Manage platform users and roles</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-ghost text-xs border border-slate-200 bg-white"
                            onClick={fetchUsers}
                        >
                            Refresh List
                        </button>
                        <button
                            className="btn text-xs bg-blue-600 text-white hover:bg-blue-700 border-0 shadow-lg shadow-blue-500/30"
                            onClick={openAddUserModal}
                        >
                            + Add User
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-100 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Identity</th>
                                <th className="px-6 py-4">Name / Email</th>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Lease End / Updated</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading users...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map(user => {
                                    const app = getUserAppInfo(user);
                                    const propertyTitle = app?.properties?.title || <span className="text-slate-400 italic">No property</span>;
                                    const leaseEnd = app?.updated_at ? new Date(app.updated_at).toLocaleDateString() : '-';
                                    const status = app?.status || (user.is_verified ? 'Verified' : 'Unverified');

                                    // Status Badge Color
                                    let badgeClass = 'bg-slate-50 text-slate-600 border-slate-100';
                                    if (status.toLowerCase().includes('active') || status.toLowerCase().includes('verified')) {
                                        badgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                                    } else if (status.toLowerCase().includes('pending')) {
                                        badgeClass = 'bg-amber-50 text-amber-700 border-amber-100';
                                    }

                                    return (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 uppercase">
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
                                                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800">{user.full_name || 'Unnamed'}</div>
                                                        <div className="text-xs text-slate-500">{user.email || 'No Email'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                {propertyTitle}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                                {leaseEnd}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                                                    {status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all group-hover:bg-white group-hover:shadow-sm mr-1"
                                                    title="Edit User"
                                                >
                                                    <AdminChevronRightIcon width={16} height={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Edit Modal */}
            {showModal && editingUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-lg text-slate-800">Edit User</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                            >
                                <AdminCloseIcon width={20} height={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            {/* Read Only Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">User ID</label>
                                    <input
                                        type="text"
                                        value={editingUser.id}
                                        disabled
                                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Created At</label>
                                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-500">
                                        -
                                    </div>
                                </div>
                            </div>

                            {/* Credentials */}
                            <div className="space-y-3 pt-2 pb-2 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Credentials</h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Enter to change password"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Leave blank to keep current password</p>
                                </div>
                            </div>

                            {/* Basic Info */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Info</h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        >
                                            <option value="tenant">Tenant</option>
                                            <option value="student">Student</option>
                                            <option value="landlord">Landlord</option>
                                            <option value="agent">Agent</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Specific Fields */}
                            {(formData.role === 'student' || formData.role === 'tenant') && (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Student ID</label>
                                    <input
                                        type="text"
                                        value={formData.student_id}
                                        onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g. S12345678"
                                    />
                                </div>
                            )}

                            {formData.role === 'agent' && (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agency Name</label>
                                        <input
                                            type="text"
                                            value={formData.agency_name}
                                            onChange={e => setFormData({ ...formData, agency_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                            placeholder="Real Estate Agency Ltd"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Agency License</label>
                                        <input
                                            type="text"
                                            value={formData.agency_license}
                                            onChange={e => setFormData({ ...formData, agency_license: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                            placeholder="License No."
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.role === 'landlord' && (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Landlord License ID</label>
                                    <input
                                        type="text"
                                        value={formData.landlord_licenceid}
                                        onChange={e => setFormData({ ...formData, landlord_licenceid: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="Optional License ID"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <input
                                    type="checkbox"
                                    id="isVerified"
                                    checked={formData.is_verified}
                                    onChange={e => setFormData({ ...formData, is_verified: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                                />
                                <label htmlFor="isVerified" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                                    Verified User
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleDelete(editingUser.id)}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                                >
                                    Delete User
                                </button>
                                <div className="flex-1"></div>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 sticky top-0 bg-white z-10">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Create New User</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Add a new user to the platform</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 transition-colors"
                            >
                                <AdminCloseIcon width={20} height={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            {/* Credentials - Required */}
                            <div className="space-y-3 pb-2 border-b border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Credentials <span className="text-rose-500">*</span></h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Email <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="user@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Password <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        required
                                        minLength={6}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="Minimum 6 characters"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">Must be at least 6 characters</p>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Info</h4>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">
                                        Full Name <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                                        <select
                                            value={formData.role}
                                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                        >
                                            <option value="student">Student</option>
                                            <option value="landlord">Landlord</option>
                                            <option value="agent">Agent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-1">Phone</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                            placeholder="+60 12-345 6789"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Specific Fields */}
                            {formData.role === 'student' && (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-blue-600 uppercase mb-1">Student ID</label>
                                    <input
                                        type="text"
                                        value={formData.student_id}
                                        onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="e.g. A199958"
                                    />
                                </div>
                            )}

                            {formData.role === 'agent' && (
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100 space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-bold text-purple-600 uppercase mb-1">Agency Name</label>
                                        <input
                                            type="text"
                                            value={formData.agency_name}
                                            onChange={e => setFormData({ ...formData, agency_name: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                                            placeholder="Real Estate Agency Ltd"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-purple-600 uppercase mb-1">Agency License</label>
                                        <input
                                            type="text"
                                            value={formData.agency_license}
                                            onChange={e => setFormData({ ...formData, agency_license: e.target.value })}
                                            className="w-full px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:border-purple-500 focus:outline-none"
                                            placeholder="License Number"
                                        />
                                    </div>
                                </div>
                            )}

                            {formData.role === 'landlord' && (
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-bold text-amber-600 uppercase mb-1">Landlord License ID</label>
                                    <input
                                        type="text"
                                        value={formData.landlord_licenceid}
                                        onChange={e => setFormData({ ...formData, landlord_licenceid: e.target.value })}
                                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
                                        placeholder="Optional License ID"
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                                <input
                                    type="checkbox"
                                    id="newUserVerified"
                                    checked={formData.is_verified}
                                    onChange={e => setFormData({ ...formData, is_verified: e.target.checked })}
                                    className="w-4 h-4 text-green-600 rounded border-green-300 focus:ring-green-500"
                                />
                                <label htmlFor="newUserVerified" className="text-sm font-medium text-green-700 cursor-pointer select-none">
                                    Mark as Verified User
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02]"
                                >
                                    {isCreating ? 'Creating...' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};
