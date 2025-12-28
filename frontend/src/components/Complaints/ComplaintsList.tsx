import { useEffect, useState } from 'react';
import { ComplaintService } from '../../services/complaint.service';
import { supabase } from '../../lib/supabase';

type Complaint = { id: string; target_id: string; category: string; description: string };

export default function ComplaintsList() {
  const [items, setItems] = useState<Complaint[]>([]);
  const [titles, setTitles] = useState<Record<string, string>>({});
  useEffect(() => {
    let mounted = true;
    async function load() {
      const cs = await ComplaintService.listHostComplaints();
      if (!mounted) return;
      setItems(cs);
      const ids = Array.from(new Set(cs.map(x => x.target_id)));
      if (ids.length) {
        const { data } = await supabase.from('properties').select('id,title').in('id', ids);
        const map = Object.fromEntries((data || []).map((p: any) => [p.id, p.title]));
        setTitles(map);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.map(c => (
        <div key={c.id} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <div style={{ fontWeight: 600 }}>{titles[c.target_id] || c.target_id}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{c.category}</div>
          <div style={{ marginTop: 6 }}>{c.description}</div>
        </div>
      ))}
      {items.length === 0 && <div style={{ color: 'var(--muted)', fontSize: 13 }}>暂无投诉</div>}
    </div>
  );
}
