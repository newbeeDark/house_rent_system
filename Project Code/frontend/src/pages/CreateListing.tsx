import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ListingDraft } from '../types';
import { ListingService } from '../services/listing.service';



export const CreateListing: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const existingProperty = location.state?.property;
    const editMode = location.state?.mode === 'edit';

    // 如果用户未登录或是学生，3秒后自动跳转到首页
    useEffect(() => {
        if (!user || user.role === 'student') {
            const timer = setTimeout(() => {
                navigate('/');
            }, 3000);

            // 清理定时器，防止组件卸载时内存泄漏
            return () => clearTimeout(timer);
        }
    }, [user, navigate]);
    const [form, setForm] = useState<ListingDraft>({
        title: existingProperty?.title || '',
        price: existingProperty?.price || 0,
        beds: existingProperty?.beds || 1,
        area: existingProperty?.area || '',
        address: existingProperty?.address || '',
        description: existingProperty?.desc || '',
        photos: existingProperty?.images || [],
        bathroom: existingProperty?.bathroom || 1,
        kitchen: existingProperty?.kitchen || false,
        propertySize: existingProperty?.propertySize || 0,
        propertyType: existingProperty?.propertyType || 'Apartment',
        furnished: existingProperty?.furnished || 'none',
        availableFrom: existingProperty?.availableFrom || '',
        amenities: existingProperty?.amenities || existingProperty?.features || []
    });

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>(existingProperty?.images || (existingProperty?.img ? [existingProperty.img] : []));
    const [submitting, setSubmitting] = useState(false);
    const [roleFiles, setRoleFiles] = useState<{ proof?: File | null, license?: File | null }>({});

    // Role specific state
    const [agencyName, setAgencyName] = useState('');

    const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);

            // Create previews
            const newPreviews = newFiles.map(f => URL.createObjectURL(f));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removePhoto = (idx: number) => {
        const newFiles = [...files];
        newFiles.splice(idx, 1);
        setFiles(newFiles);

        const newPreviews = [...previews];
        URL.revokeObjectURL(newPreviews[idx]);
        newPreviews.splice(idx, 1);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || user.role === 'student' || user.role === 'guest') {
            alert('Only landlords and agents can publish listings.');
            return;
        }

        setSubmitting(true);

        try {
            if (editMode && existingProperty?.id) {
                await ListingService.updateFromFiles(existingProperty.id, form, files, user.id);
                navigate(`/property/${existingProperty.id}`);
            } else {
                await ListingService.publishFromFiles(form, files, user.id);
                navigate('/?new=true');
            }
        } catch (err) {
            alert((err as any)?.message || 'Error processing listing');
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <h2>Sign in required</h2>
                    <p>Please log in as a Landlord or Agent to create a listing.</p>
                </div>
            </div>
        );
    }

    // Block students from accessing CreateListing
    if (user.role === 'student') {
        return (
            <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
                <div style={{ textAlign: 'center', maxWidth: '500px', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)', border: '3px solid #212529' }}>
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', color: '#212529' }}>Access Denied</h2>
                    <p style={{ fontSize: '16px', color: '#6c757d', marginBottom: '8px' }}>Tenants cannot post listings.</p>
                    <p style={{ fontSize: '14px', color: '#adb5bd' }}>Redirecting to homepage in 3 seconds...</p>
                    <div style={{ marginTop: '24px', height: '4px', background: '#e9ecef', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', background: 'linear-gradient(90deg, #d4af37, #f4d03f)', width: '100%', animation: 'shrink 3s linear' }}></div>
                    </div>
                </div>
                <style>{`
                    @keyframes shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            <main className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '24px', maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
                <section className="card" style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 8px 26px rgba(8,12,24,0.06)' }}>
                    <div style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>Create new listing</h2>
                        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Fill in details. Your account is authorized to publish.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Property Title *</label>
                            <input
                                required
                                type="text"
                                className="input-field w-full p-2 border rounded-lg"
                                placeholder="e.g. Sunny Studio near UKM"
                                value={form.title}
                                onChange={e => setForm({ ...form, title: e.target.value })}
                            />
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Price (RM/month) *</label>
                                <input
                                    required
                                    type="number"
                                    className="input-field w-full p-2 border rounded-lg"
                                    min="0"
                                    value={form.price || ''}
                                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Beds *</label>
                                <select
                                    className="input-field w-full p-2 border rounded-lg"
                                    value={form.beds}
                                    onChange={e => setForm({ ...form, beds: Number(e.target.value) })}
                                >
                                    <option value="1">1 Bedroom / Studio</option>
                                    <option value="2">2 Bedrooms</option>
                                    <option value="3">3 Bedrooms</option>
                                    <option value="4">4+ Bedrooms</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Bathrooms</label>
                                <input
                                    type="number"
                                    className="input-field w-full p-2 border rounded-lg"
                                    min="0"
                                    value={form.bathroom || 1}
                                    onChange={e => setForm({ ...form, bathroom: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Size (sqm)</label>
                                <input
                                    type="number"
                                    className="input-field w-full p-2 border rounded-lg"
                                    min="0"
                                    value={form.propertySize || ''}
                                    onChange={e => setForm({ ...form, propertySize: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Property Type</label>
                                <select className="input-field w-full p-2 border rounded-lg" value={form.propertyType} onChange={e => setForm({ ...form, propertyType: e.target.value })}>
                                    {["Studio", "Apartment", "Condo", "Terrace", "Bungalow", "Room"].map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Furnishing</label>
                                <select className="input-field w-full p-2 border rounded-lg" value={form.furnished} onChange={e => setForm({ ...form, furnished: e.target.value as any })}>
                                    <option value="none">Unfurnished</option>
                                    <option value="half">Partially Furnished</option>
                                    <option value="full">Fully Furnished</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Available From</label>
                                <input type="date" className="input-field w-full p-2 border rounded-lg" value={form.availableFrom} onChange={e => setForm({ ...form, availableFrom: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 24 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input type="checkbox" checked={form.kitchen || false} onChange={e => setForm({ ...form, kitchen: e.target.checked })} />
                                    Has Kitchen
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Amenities</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {["Wi-Fi", "Parking", "AirCon", "Pool", "Gym", "Security", "Washing machine", "Hot water"].map(a => (
                                    <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '13px', background: form.amenities?.includes(a) ? '#e3f2fd' : '#f0f0f0', padding: '5px 10px', borderRadius: 20, cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={form.amenities?.includes(a)}
                                            onChange={() => {
                                                const current = form.amenities || [];
                                                setForm({
                                                    ...form,
                                                    amenities: current.includes(a) ? current.filter(x => x !== a) : [...current, a]
                                                });
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                        {form.amenities?.includes(a) ? '✓ ' : ''}{a}
                                    </label>
                                ))}
                            </div>
                        </div>


                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Area (Region) *</label>
                            <input
                                required
                                type="text"
                                className="input-field w-full p-2 border rounded-lg"
                                placeholder="e.g. Bangi Avenue"
                                value={form.area}
                                onChange={e => setForm({ ...form, area: e.target.value })}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Full Address</label>
                            <input
                                type="text"
                                className="input-field w-full p-2 border rounded-lg"
                                placeholder="e.g. No 123, Jalan 1..."
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                            />
                        </div>


                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Description</label>
                            <textarea
                                className="input-field w-full p-2 border rounded-lg"
                                rows={4}
                                placeholder="Describe the property..."
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            ></textarea>
                        </div>

                        {/* Role Specifics */}
                        {user.role === 'agent' && (
                            <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8, marginBottom: 20 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 10 }}>Agent Verification</div>
                                <div style={{ marginBottom: 10 }}>
                                    <label className="block text-xs mb-1">Agency Name</label>
                                    <input type="text" className="w-full p-2 border rounded" value={agencyName} onChange={e => setAgencyName(e.target.value)} required />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">License Upload</label>
                                    <input type="file" onChange={e => setRoleFiles({ ...roleFiles, license: e.target.files?.[0] })} />
                                </div>
                            </div>
                        )}
                        {user.role === 'landlord' && (
                            <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8, marginBottom: 20 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 10 }}>Landlord Verification</div>
                                <div>
                                    <label className="block text-xs mb-1">Property Proof Upload</label>
                                    <input type="file" onChange={e => setRoleFiles({ ...roleFiles, proof: e.target.files?.[0] })} />
                                </div>
                            </div>
                        )}

                        {/* Photos */}
                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Photos (Required)</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {previews.map((src, i) => (
                                    <div key={i} style={{ width: 100, height: 80, position: 'relative', borderRadius: 8, overflow: 'hidden' }}>
                                        <img src={src} alt="prev" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button type="button" onClick={() => removePhoto(i)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 0, borderRadius: '50%', width: 20, height: 20, cursor: 'pointer', fontSize: 12 }}>×</button>
                                    </div>
                                ))}
                                <label style={{ width: 100, height: 80, border: '2px dashed #ddd', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#888' }}>
                                    <span style={{ fontSize: 24 }}>+</span>
                                    <span style={{ fontSize: 10 }}>Add Photo</span>
                                    <input type="file" multiple accept="image/*" onChange={handlePhotoAdd} hidden />
                                </label>
                            </div>
                        </div>

                        <div style={{ fontSize: '12px', color: '#666', marginBottom: 20, display: 'flex', gap: 8 }}>
                            <input type="checkbox" required id="agree" />
                            <label htmlFor="agree">I agree to the Terms and Privacy Policy (Mock).</label>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', padding: 12, opacity: submitting ? 0.7 : 1 }}
                            disabled={submitting}
                        >
                            {submitting ? 'Publishing...' : 'Publish Listing'}
                        </button>
                    </form>
                </section>

                <aside>
                    <div className="card" style={{ background: '#fff', borderRadius: 12, padding: 16 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 10px' }}>Tips</h3>
                        <ul style={{ fontSize: '13px', color: '#555', paddingLeft: 16 }}>
                            <li>Upload clear photos.</li>
                            <li>Be accurate with pricing.</li>
                            <li>Include detailed description.</li>
                        </ul>
                    </div>
                </aside>
            </main>
        </div>
    );
};
