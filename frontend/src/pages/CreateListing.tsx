import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Navbar } from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import type { ListingDraft } from '../types';
import { ListingService } from '../services/listing.service';
import { LocationInput } from '../components/Map/LocationInput';

/** 顶部弹窗状态类型 */
type TopBannerState = {
    visible: boolean;
    message: string;
};

export const CreateListing: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const existingProperty = location.state?.property;
    const editMode = location.state?.mode === 'edit';

    // =========================
    // ✅ 1) 未登录/学生：3秒后跳转首页（原逻辑保留）
    // =========================
    useEffect(() => {
        if (!user || user.role === 'student') {
            const timer = setTimeout(() => {
                navigate('/');
            }, 2000);

            // 清理定时器，避免内存泄漏
            return () => clearTimeout(timer);
        }
    }, [user, navigate]);

    // =========================
    // ✅ 2) 表单状态（原逻辑保留）
    // =========================
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
        amenities: existingProperty?.amenities || existingProperty?.features || [],
        lat: existingProperty?.lat || 0,
        lon: existingProperty?.lon || 0
    });

    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>(
        existingProperty?.images || (existingProperty?.img ? [existingProperty.img] : [])
    );
    const [submitting, setSubmitting] = useState(false);
    const [roleFiles, setRoleFiles] = useState<{ proof?: File | null; license?: File | null }>({});

    // =========================
    // ✅ 3) 顶部弹窗（固定在浏览器可视窗口顶部）
    //    - 通过 createPortal 挂到 document.body，确保不受页面布局影响
    // =========================
    const [topBanner, setTopBanner] = useState<TopBannerState>({
        visible: false,
        message: ''
    });

    // 用 ref 存储跳转定时器，避免重复触发
    const redirectTimerRef = useRef<number | null>(null);

    // 防止组件卸载后 setState
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (redirectTimerRef.current) {
                window.clearTimeout(redirectTimerRef.current);
                redirectTimerRef.current = null;
            }
        };
    }, []);

    /**
     * ✅ 统一的“顶部弹窗 + 1.5秒自动跳转”
     * - message: 弹窗文字
     * - to: 1.5秒后跳转的路由
     */
    const showTopBannerAndRedirect = (message: string, to: string) => {
        // 如果之前有定时器，先清掉，避免重复跳转
        if (redirectTimerRef.current) {
            window.clearTimeout(redirectTimerRef.current);
            redirectTimerRef.current = null;
        }

        // 显示顶部弹窗
        setTopBanner({ visible: true, message });

        // 1.5 秒后自动跳转
        redirectTimerRef.current = window.setTimeout(() => {
            navigate(to);
        }, 1500);
    };

    // =========================
    // ✅ 4) 图片上传/预览（原逻辑保留）
    // =========================
    const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFiles([...files, ...newFiles]);

            // 生成本地预览 URL
            const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
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

    // =========================
    // ✅ 5) 提交逻辑（修改点：成功后显示“浏览器窗口顶部弹窗”，1.5秒自动跳转）
    // =========================
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

                // ✅ 顶部弹窗 + 1.5 秒后跳转到详情页
                showTopBannerAndRedirect('🎉 Property listing updated successfully! Redirecting to the homepage...', `/property/${existingProperty.id}`);

                if (mountedRef.current) setSubmitting(false);
            } else {
                await ListingService.publishFromFiles(form, files, user.id);

                // ✅ 顶部弹窗 + 1.5 秒后跳转到首页（你也可以换成“我的房源”页）
                showTopBannerAndRedirect('🎉 Property listing published successfully! Redirecting to the homepage...', `/`);

                if (mountedRef.current) setSubmitting(false);
            }
        } catch (err) {
            alert((err as any)?.message || 'Error processing listing');
            if (mountedRef.current) setSubmitting(false);
        }
    };

    // =========================
    // ✅ 6) 顶部弹窗组件（Portal 到 body）
    //    关键点：
    //    - position: fixed + top: 0 确保在浏览器可视窗口顶部，不随滚动
    //    - 置顶最高层 z-index，确保“很容易看到”
    // =========================
    const TopBanner = () => {
        if (!topBanner.visible) return null;
        if (typeof document === 'undefined') return null;

        return createPortal(
            <>
                {/* 顶部固定容器：覆盖在浏览器可视窗口顶部 */}
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        zIndex: 2147483647, // 尽量给极高层级，确保最上层
                        display: 'flex',
                        justifyContent: 'center',
                        paddingTop: 'max(env(safe-area-inset-top), 0px)', // 兼容 iOS 刘海/安全区
                        pointerEvents: 'none' // 让容器不阻挡页面点击
                    }}
                    aria-live="polite"
                    role="status"
                >
                    {/* 弹窗主体：可点击/可交互 */}
                    <div
                        style={{
                            pointerEvents: 'auto',
                            width: 'min(960px, calc(100vw - 24px))',
                            margin: '10px 12px',
                            padding: '14px 16px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            boxShadow: '0 15px 50px rgba(16, 185, 129, 0.45)',
                            border: '2px solid rgba(255,255,255,0.18)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            animation: 'bannerDrop 0.25s ease-out'
                        }}
                    >
                        {/* 成功图标 */}
                        <div
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: '999px',
                                background: 'rgba(255,255,255,0.22)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flex: '0 0 auto'
                            }}
                        >
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>

                        {/* 提示内容 */}
                        <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>
                            {topBanner.message}
                            <div style={{ fontWeight: 500, opacity: 0.9, fontSize: 12, marginTop: 2 }}>
                                Automatically redirect after 1.5 seconds…
                            </div>
                        </div>

                        {/* 关闭按钮（可选）：关闭仅隐藏提示，不取消跳转；如需“关闭=取消跳转”，我也可以改 */}
                        <button
                            type="button"
                            onClick={() => setTopBanner({ visible: false, message: '' })}
                            style={{
                                width: 34,
                                height: 34,
                                borderRadius: '999px',
                                border: '1px solid rgba(255,255,255,0.35)',
                                background: 'rgba(255,255,255,0.12)',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'grid',
                                placeItems: 'center',
                                flex: '0 0 auto'
                            }}
                            aria-label="关闭提示"
                            title="关闭提示"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* 弹出动画（中文注释：从顶部轻微下滑出现） */}
                <style>{`
                    @keyframes bannerDrop {
                        0% { opacity: 0; transform: translateY(-16px); }
                        100% { opacity: 1; transform: translateY(0); }
                    }
                `}</style>
            </>,
            document.body
        );
    };

    // =========================
    // ✅ 7) 未登录 / 学生拦截（原逻辑保留）
    // =========================
    if (!user) {
        return (
            <div
                className="page"
                style={{
                    paddingTop: 80,
                    paddingBottom: 40,
                    background: '#f6f8fb',
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h2>Sign in required</h2>
                    <p>Please log in as a Landlord or Agent to create a listing.</p>
                </div>
            </div>
        );
    }

    if (user.role === 'student') {
        return (
            <div
                className="page"
                style={{
                    paddingTop: 80,
                    paddingBottom: 40,
                    background: 'linear-gradient(135deg, #f6f8fb 0%, #e9ecef 100%)',
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center'
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        maxWidth: '500px',
                        padding: '40px',
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        border: '3px solid #212529'
                    }}
                >
                    <div style={{ fontSize: '64px', marginBottom: '20px' }}>🚫</div>
                    <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '16px', color: '#212529' }}>
                        Access Denied
                    </h2>
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

    // =========================
    // ✅ 8) 正常页面渲染
    // =========================
    return (
        <div className="page" style={{ paddingTop: 80, paddingBottom: 40, background: '#f6f8fb', minHeight: '100vh' }}>
            <Navbar />

            {/* ✅ 顶部弹窗（固定在浏览器可视窗口顶部） */}
            <TopBanner />

            <main
                className="container"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) 300px',
                    gap: '24px',
                    maxWidth: '1000px',
                    margin: '0 auto',
                    padding: '0 16px'
                }}
            >
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
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
                                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Beds *</label>
                                <select
                                    className="input-field w-full p-2 border rounded-lg"
                                    value={form.beds}
                                    onChange={(e) => setForm({ ...form, beds: Number(e.target.value) })}
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
                                    onChange={(e) => setForm({ ...form, bathroom: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Size (sqm)</label>
                                <input
                                    type="number"
                                    className="input-field w-full p-2 border rounded-lg"
                                    min="0"
                                    value={form.propertySize || ''}
                                    onChange={(e) => setForm({ ...form, propertySize: Number(e.target.value) })}
                                />
                            </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Property Type</label>
                                <select className="input-field w-full p-2 border rounded-lg" value={form.propertyType} onChange={(e) => setForm({ ...form, propertyType: e.target.value })}>
                                    {['Studio', 'Apartment', 'Condo', 'Terrace', 'Bungalow', 'Room'].map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Furnishing</label>
                                <select className="input-field w-full p-2 border rounded-lg" value={form.furnished} onChange={(e) => setForm({ ...form, furnished: e.target.value as any })}>
                                    <option value="none">Unfurnished</option>
                                    <option value="half">Partially Furnished</option>
                                    <option value="full">Fully Furnished</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                            <div>
                                <label className="block mb-2 text-sm text-gray-600">Available From</label>
                                <input type="date" className="input-field w-full p-2 border rounded-lg" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 24 }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input type="checkbox" checked={form.kitchen || false} onChange={(e) => setForm({ ...form, kitchen: e.target.checked })} />
                                    Has Kitchen
                                </label>
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Amenities</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                {['Wi-Fi', 'Parking', 'AirCon', 'Pool', 'Gym', 'Security', 'Washing machine', 'Hot water'].map((a) => (
                                    <label
                                        key={a}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            fontSize: '13px',
                                            background: form.amenities?.includes(a) ? '#e3f2fd' : '#f0f0f0',
                                            padding: '5px 10px',
                                            borderRadius: 20,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.amenities?.includes(a)}
                                            onChange={() => {
                                                const current = form.amenities || [];
                                                setForm({
                                                    ...form,
                                                    amenities: current.includes(a) ? current.filter((x) => x !== a) : [...current, a]
                                                });
                                            }}
                                            style={{ display: 'none' }}
                                        />
                                        {form.amenities?.includes(a) ? '✓ ' : ''}
                                        {a}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Area (Region) *</label>
                            <input required type="text" className="input-field w-full p-2 border rounded-lg" placeholder="e.g. Bangi Avenue" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Full Address</label>
                            <input type="text" className="input-field w-full p-2 border rounded-lg" placeholder="e.g. No 123, Jalan 1..." value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        </div>

                        {/* ✅ 地图定位输入（原逻辑保留） */}
                        <LocationInput
                            latitude={form.lat || 0}
                            longitude={form.lon || 0}
                            address={form.address}
                            onLocationChange={(lat, lon) => setForm({ ...form, lat, lon })}
                        />

                        <div style={{ marginBottom: 20 }}>
                            <label className="block mb-2 text-sm text-gray-600">Description</label>
                            <textarea className="input-field w-full p-2 border rounded-lg" rows={4} placeholder="Describe the property..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}></textarea>
                        </div>

                        {/* Role Specifics */}
                        {user.role === 'agent' && (
                            <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8, marginBottom: 20 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 10 }}>Agent Verification</div>
                                <div style={{ marginBottom: 10 }}>
                                    <label className="block text-xs mb-1">Agency Name</label>
                                    <input type="text" className="w-full p-2 border rounded" value={''} onChange={() => { }} required />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">License Upload</label>
                                    <input type="file" onChange={(e) => setRoleFiles({ ...roleFiles, license: e.target.files?.[0] })} />
                                </div>
                            </div>
                        )}

                        {user.role === 'landlord' && (
                            <div style={{ padding: 16, background: '#f9f9f9', borderRadius: 8, marginBottom: 20 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: 10 }}>Landlord Verification</div>
                                <div>
                                    <label className="block text-xs mb-1">Property Proof Upload</label>
                                    <input type="file" onChange={(e) => setRoleFiles({ ...roleFiles, proof: e.target.files?.[0] })} />
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
                                        <button
                                            type="button"
                                            onClick={() => removePhoto(i)}
                                            style={{
                                                position: 'absolute',
                                                top: 2,
                                                right: 2,
                                                background: 'rgba(0,0,0,0.5)',
                                                color: '#fff',
                                                border: 0,
                                                borderRadius: '50%',
                                                width: 20,
                                                height: 20,
                                                cursor: 'pointer',
                                                fontSize: 12
                                            }}
                                        >
                                            ×
                                        </button>
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

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 12, opacity: submitting ? 0.7 : 1 }} disabled={submitting}>
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
