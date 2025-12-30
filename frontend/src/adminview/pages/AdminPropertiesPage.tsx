import React, { useEffect, useState, useRef } from "react";
import { AdminSearchIcon, AdminPlusIcon, AdminCloseIcon } from "../components/UI/AdminIcons";
import { Card } from "../components/UI";
import { supabase } from "../../lib/supabase";

// Admin Property type - matching database schema
interface AdminProperty {
  id: string;
  title: string;
  description?: string;
  price: number;
  deposit?: number;
  address: string;
  area?: string;
  category?: string;
  beds: number;
  bathrooms: number;
  size_sqm?: number;
  kitchen?: boolean;
  furnished?: string;
  amenities?: string[];
  rules?: string[];
  available_from?: string;
  status: 'active' | 'rented' | 'delisted';
  owner_id?: string;
  owner_name?: string;
  created_at: string;
}

// Admin Property Form Data
interface AdminPropertyFormData {
  title: string;
  description: string;
  price: number;
  deposit: number;
  address: string;
  area: string;
  category: string;
  beds: number;
  bathrooms: number;
  size_sqm: number;
  kitchen: boolean;
  status: 'active' | 'rented' | 'delisted';
  furnished: string;
  available_from: string;
  amenities: string[];
}

// Session cache key for property images
const PROPERTY_IMAGES_CACHE_KEY = 'admin_property_images_cache';

// Available amenities
const AVAILABLE_AMENITIES = ["Wi-Fi", "Parking", "AirCon", "Pool", "Gym", "Security", "Washing machine", "Hot water"];

// Property categories
const PROPERTY_CATEGORIES = ["Studio", "Apartment", "Condo", "Terrace", "Bungalow", "Room"];

// Default placeholder image
const DEFAULT_PROPERTY_IMAGE = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=400';

export const PropertiesView = () => {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);

  // Image cache - loaded once per session
  const [imageCache, setImageCache] = useState<Record<string, string[]>>({});
  const imageCacheLoaded = useRef(false);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<AdminProperty | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Image management for edit modal
  const [editingImages, setEditingImages] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AdminPropertyFormData>({
    title: '',
    description: '',
    price: 0,
    deposit: 0,
    address: '',
    area: '',
    category: 'Apartment',
    beds: 1,
    bathrooms: 1,
    size_sqm: 0,
    kitchen: false,
    status: 'active',
    furnished: 'none',
    available_from: '',
    amenities: []
  });

  const getStatusStyle = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-emerald-500/90 text-white';
      case 'rented':
        return 'bg-blue-500/90 text-white';
      case 'delisted':
        return 'bg-slate-500/90 text-white';
      default:
        return 'bg-slate-500/90 text-white';
    }
  };

  // Load image cache from sessionStorage on mount
  useEffect(() => {
    if (!imageCacheLoaded.current) {
      try {
        const cached = sessionStorage.getItem(PROPERTY_IMAGES_CACHE_KEY);
        if (cached) {
          setImageCache(JSON.parse(cached));
        }
      } catch (e) {
        console.warn('Failed to load image cache from session:', e);
      }
      imageCacheLoaded.current = true;
    }
  }, []);

  // Save image cache to sessionStorage when it changes
  useEffect(() => {
    if (Object.keys(imageCache).length > 0) {
      try {
        sessionStorage.setItem(PROPERTY_IMAGES_CACHE_KEY, JSON.stringify(imageCache));
      } catch (e) {
        console.warn('Failed to save image cache to session:', e);
      }
    }
  }, [imageCache]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('properties')
        .select(`
                    id,
                    title,
                    description,
                    price,
                    deposit,
                    address,
                    area,
                    category,
                    beds,
                    bathrooms,
                    size_sqm,
                    kitchen,
                    furnished,
                    amenities,
                    rules,
                    available_from,
                    status,
                    owner_id,
                    created_at
                `)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching properties:', fetchError);
        setError(`Failed to load properties: ${fetchError.message}`);
        setProperties([]);
        return;
      }

      if (!data || data.length === 0) {
        setProperties([]);
        setLoading(false);
        return;
      }

      // Fetch owner names
      const ownerIds = [...new Set(data.map(p => p.owner_id).filter(Boolean))];
      let ownersData: any[] = [];
      if (ownerIds.length > 0) {
        const { data: owners } = await supabase
          .from('users')
          .select('id, full_name')
          .in('id', ownerIds);
        ownersData = owners || [];
      }

      // Merge owner names
      const enrichedProperties = data.map(property => {
        const owner = ownersData.find(o => o.id === property.owner_id);
        return {
          ...property,
          owner_name: owner?.full_name || 'Unknown'
        };
      });

      setProperties(enrichedProperties);

      // Fetch images for properties not in cache
      fetchPropertyImages(data.map(p => p.id));
    } catch (err: any) {
      console.error('Error fetching properties:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch images from storage bucket - only for properties not in cache
  const fetchPropertyImages = async (propertyIds: string[]) => {
    const idsToFetch = propertyIds.filter(id => !imageCache[id]);

    if (idsToFetch.length === 0) return;

    const newCache: Record<string, string[]> = {};

    for (const propertyId of idsToFetch) {
      try {
        const { data: files, error } = await supabase.storage
          .from('property-images')
          .list(propertyId, { limit: 10 });

        if (error) {
          console.warn(`Error fetching images for property ${propertyId}:`, error);
          newCache[propertyId] = [];
          continue;
        }

        if (files && files.length > 0) {
          const imageUrls = files
            .filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i))
            .map(file => {
              const { data } = supabase.storage
                .from('property-images')
                .getPublicUrl(`${propertyId}/${file.name}`);
              return data.publicUrl;
            });
          newCache[propertyId] = imageUrls;
        } else {
          newCache[propertyId] = [];
        }
      } catch (e) {
        console.warn(`Failed to fetch images for ${propertyId}:`, e);
        newCache[propertyId] = [];
      }
    }

    if (Object.keys(newCache).length > 0) {
      setImageCache(prev => ({ ...prev, ...newCache }));
    }
  };

  // Get property image (from cache or default)
  const getPropertyImage = (propertyId: string): string => {
    const images = imageCache[propertyId];
    if (images && images.length > 0) {
      return images[0];
    }
    return DEFAULT_PROPERTY_IMAGE;
  };

  const handleEdit = (property: AdminProperty) => {
    setEditingProperty(property);
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price || 0,
      deposit: property.deposit || 0,
      address: property.address || '',
      area: property.area || '',
      category: property.category || 'Apartment',
      beds: property.beds || 1,
      bathrooms: property.bathrooms || 1,
      size_sqm: property.size_sqm || 0,
      kitchen: property.kitchen || false,
      status: property.status || 'active',
      furnished: property.furnished || 'none',
      available_from: property.available_from || '',
      amenities: property.amenities || []
    });
    // Load existing images for editing
    setEditingImages(imageCache[property.id] || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowModal(true);
  };

  // Handle adding new images
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...files]);

      // Create previews
      const previews = files.map(f => URL.createObjectURL(f));
      setNewImagePreviews(prev => [...prev, ...previews]);
    }
  };

  // Remove existing image
  const removeExistingImage = async (imageUrl: string, propertyId: string) => {
    if (!window.confirm('Delete this image?')) return;

    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${propertyId}/${fileName}`;

      const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

      if (error) throw error;

      // Update local state
      setEditingImages(prev => prev.filter(img => img !== imageUrl));

      // Update cache
      setImageCache(prev => ({
        ...prev,
        [propertyId]: (prev[propertyId] || []).filter(img => img !== imageUrl)
      }));
    } catch (err: any) {
      console.error('Error deleting image:', err);
      alert(`Failed to delete image: ${err.message}`);
    }
  };

  // Remove new image preview
  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // Upload new images
  const uploadNewImages = async (propertyId: string): Promise<string[]> => {
    if (newImageFiles.length === 0) return [];

    const uploadedUrls: string[] = [];
    setUploadingImages(true);

    try {
      for (const file of newImageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${propertyId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      // Update cache with new images
      if (uploadedUrls.length > 0) {
        setImageCache(prev => ({
          ...prev,
          [propertyId]: [...(prev[propertyId] || []), ...uploadedUrls]
        }));
      }
    } finally {
      setUploadingImages(false);
    }

    return uploadedUrls;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    if (!formData.title.trim()) {
      alert('Title is required.');
      return;
    }

    if (!formData.address.trim()) {
      alert('Address is required.');
      return;
    }

    if (formData.beds < 1) {
      alert('Bedrooms must be at least 1.');
      return;
    }

    if (!window.confirm('Save changes to this property?')) return;

    setIsSaving(true);
    try {
      // Upload any new images first
      if (newImageFiles.length > 0) {
        await uploadNewImages(editingProperty.id);
      }

      const { error } = await supabase
        .from('properties')
        .update({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: Number(formData.price),
          deposit: formData.deposit ? Number(formData.deposit) : null,
          address: formData.address.trim(),
          area: formData.area.trim() || null,
          category: formData.category,
          beds: Number(formData.beds),
          bathrooms: Number(formData.bathrooms),
          size_sqm: formData.size_sqm ? Number(formData.size_sqm) : null,
          kitchen: formData.kitchen,
          status: formData.status,
          furnished: formData.furnished,
          available_from: formData.available_from || null,
          amenities: formData.amenities.length > 0 ? formData.amenities : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProperty.id);

      if (error) throw error;

      // Clean up previews
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      setNewImageFiles([]);
      setNewImagePreviews([]);

      fetchProperties();
      setShowModal(false);
      setEditingProperty(null);
      alert('Property updated successfully!');
    } catch (err: any) {
      console.error('Error updating property:', err);
      alert(`Failed to update property: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This action cannot be undone.')) return;

    try {
      // Delete images from storage first
      try {
        const { data: files } = await supabase.storage
          .from('property-images')
          .list(propertyId);

        if (files && files.length > 0) {
          const filePaths = files.map(f => `${propertyId}/${f.name}`);
          await supabase.storage.from('property-images').remove(filePaths);
        }
      } catch (e) {
        console.warn('Could not delete property images:', e);
      }

      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) throw error;

      // Remove from cache
      setImageCache(prev => {
        const newCache = { ...prev };
        delete newCache[propertyId];
        return newCache;
      });

      setProperties(prev => prev.filter(p => p.id !== propertyId));
      if (showModal) {
        setShowModal(false);
        setEditingProperty(null);
      }
      alert('Property deleted successfully.');
    } catch (err: any) {
      console.error('Error deleting property:', err);
      alert(`Failed to delete property: ${err.message}`);
    }
  };

  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      deposit: 0,
      address: '',
      area: '',
      category: 'Apartment',
      beds: 1,
      bathrooms: 1,
      size_sqm: 0,
      kitchen: false,
      status: 'active',
      furnished: 'none',
      available_from: '',
      amenities: []
    });
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setShowAddModal(true);
  };

  const handleAddProperty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('Title is required.');
      return;
    }

    if (!formData.address.trim()) {
      alert('Address is required.');
      return;
    }

    if (formData.beds < 1) {
      alert('Bedrooms must be at least 1.');
      return;
    }

    if (!window.confirm('Create this new property listing?')) return;

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('You must be logged in to create a property.');
        return;
      }

      const { data: newProperty, error } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          price: Number(formData.price),
          deposit: formData.deposit ? Number(formData.deposit) : null,
          address: formData.address.trim(),
          area: formData.area.trim() || null,
          category: formData.category,
          beds: Number(formData.beds),
          bathrooms: Number(formData.bathrooms),
          size_sqm: formData.size_sqm ? Number(formData.size_sqm) : null,
          kitchen: formData.kitchen,
          status: formData.status,
          furnished: formData.furnished,
          available_from: formData.available_from || null,
          amenities: formData.amenities.length > 0 ? formData.amenities : null
        })
        .select()
        .single();

      if (error) throw error;

      // Upload images if any
      if (newProperty && newImageFiles.length > 0) {
        await uploadNewImages(newProperty.id);
      }

      // Clean up previews
      newImagePreviews.forEach(url => URL.revokeObjectURL(url));
      setNewImageFiles([]);
      setNewImagePreviews([]);

      fetchProperties();
      setShowAddModal(false);
      alert('Property created successfully!');
    } catch (err: any) {
      console.error('Error creating property:', err);
      alert(`Failed to create property: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  // Filter properties
  const filteredProperties = properties.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query) ||
        p.area?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.owner_name?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Render image management section
  const renderImageManagement = () => (
    <div className="space-y-4">
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Property Images</label>

      {/* Existing Images */}
      {editingImages.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">Current Images (click × to remove)</p>
          <div className="flex flex-wrap gap-3">
            {editingImages.map((url, idx) => (
              <div key={idx} className="relative w-24 h-20 rounded-lg overflow-hidden group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => editingProperty && removeExistingImage(url, editingProperty.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Image Previews */}
      {newImagePreviews.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">New Images to Upload</p>
          <div className="flex flex-wrap gap-3">
            {newImagePreviews.map((url, idx) => (
              <div key={idx} className="relative w-24 h-20 rounded-lg overflow-hidden group border-2 border-emerald-300">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Images Button */}
      <label className="flex items-center justify-center w-full h-20 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-all">
        <div className="text-center">
          <span className="text-2xl text-slate-400">+</span>
          <p className="text-xs text-slate-400">Add Images</p>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageAdd}
          className="hidden"
        />
      </label>

      {uploadingImages && (
        <p className="text-xs text-blue-500">Uploading images...</p>
      )}
    </div>
  );

  // Render property form
  const renderPropertyForm = () => (
    <div className="p-6 space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Property Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          placeholder="e.g. Sunny Studio near UKM"
        />
      </div>

      {/* Price & Deposit Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Price (RM/month) *</label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            min="0"
            required
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Deposit (RM)</label>
          <input
            type="number"
            value={formData.deposit || ''}
            onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Bedrooms & Bathrooms Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Bedrooms *</label>
          <select
            value={formData.beds}
            onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          >
            <option value="1">1 Bedroom / Studio</option>
            <option value="2">2 Bedrooms</option>
            <option value="3">3 Bedrooms</option>
            <option value="4">4+ Bedrooms</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Bathrooms</label>
          <input
            type="number"
            value={formData.bathrooms}
            onChange={(e) => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Size & Category Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Size (sqm)</label>
          <input
            type="number"
            value={formData.size_sqm || ''}
            onChange={(e) => setFormData({ ...formData, size_sqm: Number(e.target.value) })}
            min="0"
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Property Type *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          >
            {PROPERTY_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Furnished & Status Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Furnishing</label>
          <select
            value={formData.furnished}
            onChange={(e) => setFormData({ ...formData, furnished: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          >
            <option value="none">Unfurnished</option>
            <option value="half">Partially Furnished</option>
            <option value="full">Fully Furnished</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Status *</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          >
            <option value="active">Active</option>
            <option value="rented">Rented</option>
            <option value="delisted">Delisted</option>
          </select>
        </div>
      </div>

      {/* Available From & Kitchen Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Available From</label>
          <input
            type="date"
            value={formData.available_from}
            onChange={(e) => setFormData({ ...formData, available_from: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          />
        </div>
        <div className="flex items-center pt-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.kitchen}
              onChange={(e) => setFormData({ ...formData, kitchen: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-slate-700">Has Kitchen</span>
          </label>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Amenities</label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_AMENITIES.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${formData.amenities.includes(amenity)
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                }`}
            >
              {formData.amenities.includes(amenity) && '✓ '}{amenity}
            </button>
          ))}
        </div>
      </div>

      {/* Area (Region) */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Area (Region)</label>
        <input
          type="text"
          value={formData.area}
          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          placeholder="e.g. Bangi Avenue"
        />
      </div>

      {/* Full Address */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Full Address *</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all"
          placeholder="e.g. No 123, Jalan 1..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all resize-none"
          placeholder="Describe the property..."
        />
      </div>

      {/* Image Management */}
      {renderImageManagement()}
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Property <span className="text-blue-500">Listings</span></h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Manage all rental properties in the system</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20 font-semibold text-sm transition-all"
        >
          <AdminPlusIcon width={18} height={18} />
          <span>Add Property</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm">
          {error}
          <button onClick={fetchProperties} className="ml-4 underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white/60 p-4 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
        <div className="relative w-full max-w-md group">
          <AdminSearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search properties by title, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'active', 'rented', 'delisted'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${statusFilter === status
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="text-center p-10 text-slate-400">Loading properties...</div>
      ) : filteredProperties.length === 0 ? (
        <div className="text-center p-10 text-slate-400">
          {properties.length === 0 ? 'No properties in the database' : 'No properties match your filter'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map(property => (
            <Card key={property.id} className="p-0 overflow-hidden group border-0 ring-1 ring-slate-200/50 hover:ring-blue-300 transition-all">
              <div className="h-52 overflow-hidden relative">
                <img
                  src={getPropertyImage(property.id)}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = DEFAULT_PROPERTY_IMAGE;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-80"></div>

                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border border-white/20 capitalize ${getStatusStyle(property.status)}`}>
                    {property.status}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="font-bold text-lg text-white leading-tight mb-1 line-clamp-1">{property.title}</h3>
                  <p className="text-sm text-slate-200 font-medium line-clamp-1">{property.address}</p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-slate-800">
                    RM{property.price.toLocaleString()}
                    <span className="text-sm text-slate-400 font-medium ml-1">/mo</span>
                  </span>
                  <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md uppercase tracking-wide">
                    {property.category || 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm text-slate-500 mb-4">
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{property.beds} Bedrooms</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">{property.bathrooms} Bathrooms</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 mb-4">
                  Owner: <span className="text-slate-600 font-medium">{property.owner_name}</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(property)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-all font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 bg-white rounded-lg hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 transition-all font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Edit Property</h3>
                <p className="text-blue-100 text-xs mt-0.5">#{editingProperty.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => { setShowModal(false); setEditingProperty(null); }}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <AdminCloseIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleSave}>
              {renderPropertyForm()}

              <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => handleDelete(editingProperty.id)}
                  className="px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold transition-all"
                >
                  Delete Property
                </button>
                <div className="flex-1" />
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingProperty(null); }}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || uploadingImages}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Add New Property</h3>
                <p className="text-emerald-100 text-xs mt-0.5">Create a new property listing</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <AdminCloseIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <form onSubmit={handleAddProperty}>
              {renderPropertyForm()}

              <div className="flex gap-3 px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
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
                  disabled={isSaving || uploadingImages}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Creating...' : 'Create Property'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
