import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useEditProperty } from '../hooks/useEditProperty';
import { PropertyService } from '../services/property.service';
import type { Property } from '../types';
import { Navbar } from '../components/Layout/Navbar';

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const hook = useEditProperty(property);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!id) return;
      const p = await PropertyService.getById(id);
      if (mounted) {
        setProperty(p || null);
        if (p?.id) await hook.load(p.id);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  if (!property) return null;

  return (
    <div className="page" style={{ paddingTop: 80, paddingBottom: 40, minHeight: '100vh' }}>
      <Navbar />
      <main className="container" style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>编辑房源</h1>
        <div style={{ display: 'grid', gap: 12 }}>
          <label>
            标题
            <input value={hook.form.title} onChange={e => hook.setForm(s => ({ ...s, title: e.target.value }))} />
          </label>
          <label>
            描述
            <textarea value={hook.form.description} onChange={e => hook.setForm(s => ({ ...s, description: e.target.value }))} />
          </label>
          <label>
            价格
            <input type="number" value={hook.form.price} onChange={e => hook.setForm(s => ({ ...s, price: Number(e.target.value) }))} />
          </label>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>现有图片</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
              {hook.originalImages.map(url => (
                <div key={url} style={{ border: '1px solid #eee', borderRadius: 8, padding: 8 }}>
                  <img src={url} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6 }} />
                  <button onClick={() => hook.toggleDelete(url)} className="btn btn-ghost" style={{ marginTop: 8, width: '100%' }}>
                    {hook.deletedUrls.includes(url) ? '撤销删除' : '删除'}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>上传新图片</div>
            <input type="file" multiple onChange={e => e.target.files && hook.addFiles(e.target.files)} />
            <ul style={{ marginTop: 8 }}>
              {hook.newFiles.map((f, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{f.name}</span>
                  <button onClick={() => hook.removeNewFile(i)} className="btn btn-ghost">移除</button>
                </li>
              ))}
            </ul>
          </div>
          <button disabled={!hook.canSubmit || hook.saving} onClick={hook.submit} className="btn btn-primary">保存</button>
        </div>
      </main>
    </div>
  );
}
