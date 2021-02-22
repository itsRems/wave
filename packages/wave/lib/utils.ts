export function identifyAction (action: string): {
  type: 'call';
  extracted: string;
} {
  if (action.startsWith('wave-call-incoming-')) return {
    type: 'call',
    extracted: action.replace('wave-call-incoming-', '')
  };
}

export function makeQueueName (actionName: string): string {
  return `wave-q-${actionName}`;
}

export type TimeUnits = 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks';

export function toMS (time: number, unit: TimeUnits): number {
  let final = 0;
  let [s, m, h, d, w] = [1000, 60, 60, 24, 7];
  switch (unit) {
    case 'seconds':
      final = time * s;
      break;

    case 'minutes':
      final = time * s * m;
      break;

    case 'hours':
      final = time * s * m * h;
      break;

    case 'days':
      final = time * s * m * h * d;
      break;

    case 'weeks':
      final = time * s * m * h * d * w;
      break;
    
    default:
      final = time;
      break;
  }

  return final;
}