import __React$$Loadable__ from 'react-loadable';
import React from 'react';

import { Button } from '@aliwind';

const MyComponent = () => <Button type="primary" component={__React$$Loadable__({
  loader: () => import('react-component'),
  loading: () => <div>123</div>
})} />;

export default MyComponent;