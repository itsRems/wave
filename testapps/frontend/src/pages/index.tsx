import { useEffect } from 'react';
import { call } from '@itsrems/link';
import { useState } from 'react';

export default function Hi () {
  const [data, setData] = useState('Loading...');
  useEffect(() => {
    call('yep', { username: 'nico' }).then(result => setData(result.data));
  }, []);
  return (
    <div>
      { data }
    </div>
  );
}