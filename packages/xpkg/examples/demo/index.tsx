import React from 'react';
import { createRoot } from 'react-dom/client';

import App from '../src/index';

const root = createRoot(document.getElementById('app')!);
root.render(<App title="demo" />);
