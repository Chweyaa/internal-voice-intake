const msg = $input.first().json.body?.message;

if (msg?.type !== 'end-of-call-report') {
  return [];
}

const outputsRaw = msg?.structuredOutputs;
const outputKeys = Object.keys(outputsRaw || {});
const firstKey = outputKeys[0];
const firstOutput = firstKey ? outputsRaw[firstKey] : null;
const result = firstOutput?.result || {};

return [{
  json: {
    caller_name:    result?.caller_name ?? 'Unknown',
    topic:          result?.topic ?? null,
    summary:        msg?.summary || null,
    action_items:   result?.action_items || null,
    raw_transcript: msg?.artifact?.transcript ?? msg?.transcript ?? null,
    status:         'new'
  }
}];
