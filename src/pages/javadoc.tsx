import React, {useEffect} from 'react';

export default function Javadoc() {
  useEffect(() => {
    // Always redirect to the folder form (works best for Javadoc relative assets)
    window.location.replace('/javadoc/');
  }, []);
  return <p>Opening Javadoc…</p>;
}

