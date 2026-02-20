'use client';
import { useState } from 'react';
import { updateStatus } from '@/lib/supabase';
import type { IntakeEntry } from '@/types';

const statusClass: Record<IntakeEntry['status'], string> = {
  new: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-yellow-100 text-yellow-700',
  resolved: 'bg-green-100 text-green-700',
};

interface Props {
  entry: IntakeEntry;
  onUpdate: () => void;
}

export default function StatusSelect({ entry, onUpdate }: Props) {
  const [saving, setSaving] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSaving(true);
    await updateStatus(entry.id, e.target.value as IntakeEntry['status']);
    setSaving(false);
    onUpdate();
  };

  return (
    <select
      value={entry.status}
      onChange={handleChange}
      disabled={saving}
      className={`text-xs px-2 py-1 rounded font-medium cursor-pointer border-0 focus:outline-none ${statusClass[entry.status]}`}
    >
      <option value="new">New</option>
      <option value="in_progress">In Progress</option>
      <option value="resolved">Resolved</option>
    </select>
  );
}
