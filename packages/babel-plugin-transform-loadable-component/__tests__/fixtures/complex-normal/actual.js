import __React$$Loadable__ from 'react-loadable';
import React from 'react';
import { Switch, Route, Redirect } from 'dva/router';
import AppLayout from '@aliwind/rc-app-layout';
import Nav from '../../components/Nav';
import Instance from '../Instance'
import Monitor from '../Monitor';

const App = () => <AppLayout nav={<Nav />}>
    <Switch>
      <Route path="/instance" component={Instance} __loading={() => (<div>loading</div>)} __async />
      <Route path="/monitor" component={Monitor} />
      <Redirect to="/instance" />
    </Switch>
  </AppLayout>;

export default App;