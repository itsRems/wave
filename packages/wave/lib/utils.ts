export function identifyAction (action: string): {
  type: 'call';
  extracted: string;
} {
  if (action.startsWith('wave-call-incoming-')) return {
    type: 'call',
    extracted: action.replace('wave-call-incoming-', '')
  };
}