'use client';
import Vapi from '@vapi-ai/web';
import { useCallback, useEffect, useRef, useState } from 'react';

type Status = 'idle' | 'connecting' | 'active' | 'submitting';

interface Props {
  onSessionEnd: () => void;
}

export default function IntakeButton({ onSessionEnd }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const userStarted = useRef(false);
  const vapiRef = useRef<Vapi | null>(null);
  const onSessionEndRef = useRef(onSessionEnd);
  useEffect(() => {
    onSessionEndRef.current = onSessionEnd;
  }, [onSessionEnd]);

  useEffect(() => {
    if (vapiRef.current) return;
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);
    vapi.on('call-start', () => setStatus('active'));
    vapi.on('call-end', () => {
      if (!userStarted.current) return;
      setStatus('submitting');
      setTimeout(() => {
        onSessionEndRef.current();
        setStatus('idle');
        userStarted.current = false;
      }, 5000);
    });
    vapi.on('error', (e) => {
      if (!userStarted.current) return;
      setError(e?.message ?? 'Voice session failed');
      setStatus('idle');
      userStarted.current = false;
    });
    vapiRef.current = vapi;
  }, []);

  const start = useCallback(async () => {
    setError('');
    setStatus('connecting');
    userStarted.current = true;
    try {
      await vapiRef.current?.start(process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to start session');
      setStatus('idle');
      userStarted.current = false;
    }
  }, []);

  const stop = useCallback(() => {
    vapiRef.current?.stop();
    setStatus('submitting');
    setTimeout(() => {
      onSessionEndRef.current();
      setStatus('idle');
      userStarted.current = false;
    }, 5000);
  }, []);

  return (
    <div className="flex items-center gap-3">
      {error && <span className="text-sm text-red-600">{error}</span>}

      {status === 'connecting' && (
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Connecting...
        </span>
      )}

      {status === 'active' && (
        <span className="flex items-center gap-2 text-sm text-red-600">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Session active...
        </span>
      )}

      {status === 'submitting' && (
        <span className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          Submitting...
        </span>
      )}

      <button
        onClick={status === 'active' ? stop : start}
        disabled={status === 'connecting' || status === 'submitting'}
        className={
          status === 'active'
            ? 'bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded'
            : 'bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded disabled:opacity-50'
        }
      >
        {status === 'active' ? 'End Session' : 'Start New Intake'}
      </button>
    </div>
  );
}
