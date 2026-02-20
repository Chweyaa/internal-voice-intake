'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, getEntries } from '@/lib/supabase';
import IntakeButton from '@/components/IntakeButton';
import StatusSelect from '@/components/StatusSelect';
import type { IntakeEntry } from '@/types';

export default function DashboardPage() {
  const [entries, setEntries] = useState<IntakeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getEntries();
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (data.user) setUserEmail(data.user.email ?? '');
      });
    load();
  }, []);

  const signOut = async () => {
    await createClient().auth.signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Voice Intake Log</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{userEmail}</span>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-black"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <IntakeButton onSessionEnd={load} />
        <button
          onClick={load}
          className="text-sm text-gray-500 hover:text-black border border-gray-200 px-3 py-1.5 rounded"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-gray-400">
          No entries yet. Start an intake above.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Caller</th>
                <th className="pb-2 pr-4 font-medium">Topic</th>
                <th className="pb-2 pr-4 font-medium">Summary</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100">
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 pr-4">{entry.caller_name ?? '—'}</td>
                  <td className="py-3 pr-4">{entry.topic ?? '—'}</td>
                  <td className="py-3 pr-4 max-w-md text-gray-600">
                    {entry.summary ?? '—'}
                  </td>
                  <td className="py-3">
                    <StatusSelect entry={entry} onUpdate={load} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
