import __React$$Loadable__ from 'react-loadable';
import React from 'react';
import { Switch, Route, Redirect } from 'dva/router';
import AppLayout from '@aliwind/rc-app-layout';
import Nav from '../../components/Nav';

import Monitor from '../Monitor';

const App = () => <AppLayout nav={<Nav />}>
    <Switch>
      <Route path="/instance" component={__React$$Loadable__({
      loader: () => import('../Instance'),
      loading: () => <div>loading</div>
    })} />
      <Route path="/monitor" component={Monitor} />
      <Redirect to="/instance" />
    </Switch>
  </AppLayout>;

export default App;