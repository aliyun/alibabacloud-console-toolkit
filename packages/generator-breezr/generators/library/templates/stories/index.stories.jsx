import * as React from 'react';
import { storiesOf } from '@storybook/react';
import <%= upperCaseName %> from '../src/index'

storiesOf('<%= upperCaseName %>', module)
  .add('<%= upperCaseName %>', () => {
   return (<div id="app-wrapper">
      <div id="app">
       <<%= upperCaseName %> />
      </div>
    </div>);
  })
