import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { useState, useRef } from 'react';

export default function TermsAgreement() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [canAgree, setCanAgree] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);

  async function confirm() {
    if (!user || !agreed) return;
    setSubmitting(true);
    const { error } = await supabase.from('users').update({ terms_accepted_at: new Date().toISOString() }).eq('id', user.id);
    if (!error) {
      await refreshProfile();
      navigate((location.state as any)?.from || '/', { replace: true });
    }
    setSubmitting(false);
  }

  function onScroll() {
    const el = contentRef.current;
    if (!el) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 5) setCanAgree(true);
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '90%', maxWidth: 640, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}>
        <div style={{ padding: 20, backgroundColor: '#fff3cd', borderBottom: '1px solid #ffeeba' }}>
          <h2 style={{ margin: 0, fontSize: 18, color: '#856404' }}>请阅读并同意最新服务条款</h2>
          <p style={{ margin: '10px 0 0', fontSize: 13, color: '#856404' }}>滚动到页面底部以启用确认</p>
        </div>
        <div ref={contentRef} onScroll={onScroll} style={{ padding: 24, overflowY: 'auto', flex: 1, lineHeight: 1.6, backgroundColor: '#fafafa' }}>
          <h3>条款摘要</h3>
          <p>本平台提供校外租房相关的浏览、发布、申请、支付记录与投诉反馈功能。使用平台即表示您同意遵守平台规则与隐私政策。</p>
          <div style={{ height: 600 }} />
          <h3>最终确认</h3>
          <p>勾选并确认即表示您已阅读并同意所有条款内容。</p>
        </div>
        <div style={{ padding: 20, borderTop: '1px solid #eee', backgroundColor: '#fff', opacity: canAgree ? 1 : 0.5, pointerEvents: canAgree ? 'auto' : 'none' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginBottom: 12 }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span>我已阅读并同意《服务条款与隐私政策》</span>
          </label>
          <button onClick={confirm} disabled={!agreed || submitting} className="btn btn-primary" style={{ width: '100%', padding: 12 }}>
            {submitting ? '处理中...' : '确认并继续'}
          </button>
          {!canAgree && <div style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 10 }}>请滚动到末尾以启用确认</div>}
        </div>
      </div>
    </div>
  );
}
