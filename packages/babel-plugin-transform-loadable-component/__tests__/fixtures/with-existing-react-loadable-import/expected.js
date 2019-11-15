import React from 'react';

import Loadable from 'react-loadable';
import { Button } from '@aliwind';

const MyComponent = () => <Button component={Loadable({
  loader: () => import('react-component'),
  loading: () => <div>123</div>
})} />;

export default MyComponent;