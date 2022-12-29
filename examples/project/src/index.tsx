import React from 'react';
import { createRoot } from 'react-dom/client';

const Component = () => {
  return <div>hello world.</div>;
};

const root = createRoot(document.getElementById('app'));

root.render(<Component />);
