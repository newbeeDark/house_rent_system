import { useState, useMemo } from 'react';
import { updateProperty, deleteImageByUrl, uploadImageToBucket, insertImageRecord, PropertyService } from '../services/property.service';
import type { Property } from '../types';

type FormState = { title: string; description: string; price: number };

export function useEditProperty(property: Property | null) {
  const [form, setForm] = useState<FormState>({ title: '', description: '', price: 0 });
  const [originalImages, setOriginalImages] = useState<string[]>([]);
  const [deletedUrls, setDeletedUrls] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => !!property, [property]);

  async function load(id: string) {
    const p = await PropertyService.getById(id);
    if (!p) return;
    setForm({ title: p.title, description: p.desc || '', price: p.price });
    setOriginalImages(p.images || []);
    setDeletedUrls([]);
    setNewFiles([]);
  }

  function toggleDelete(url: string) {
    setDeletedUrls(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  }

  function addFiles(files: FileList) {
    setNewFiles(prev => [...prev, ...Array.from(files)]);
  }

  function removeNewFile(index: number) {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  }

  async function submit() {
    if (!property) return false;
    setSaving(true);
    const ok = await updateProperty(property.id, { title: form.title, description: form.description, price: form.price });
    if (!ok) { setSaving(false); return false; }
    for (const url of deletedUrls) {
      await deleteImageByUrl(property.id, url);
    }
    for (const file of newFiles) {
      const up = await uploadImageToBucket(property.id, file);
      if (up?.url) await insertImageRecord(property.id, up.url, false, 0);
    }
    setSaving(false);
    return true;
  }

  return { form, setForm, originalImages, deletedUrls, newFiles, toggleDelete, addFiles, removeNewFile, submit, load, canSubmit, saving };
}
