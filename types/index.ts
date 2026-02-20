export type IntakeEntry = {
  id: string;
  created_at: string;
  caller_name: string | null;
  topic: string | null;
  summary: string | null;
  action_items: string | null;
  raw_transcript: string | null;
  status: 'new' | 'in_progress' | 'resolved';
};
