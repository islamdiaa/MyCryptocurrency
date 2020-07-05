import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import Blocks from './components/Blocks';
import TransactionPool from './components/TransactionPool';
import ConductTransaction from './components/ConductTransaction';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import './index.css';

render(
  <Router history={history}>
    <Switch>
      <Route exact={true} path='/' component={App}/>
      <Route path='/blocks' component={Blocks}/>
      <Route path='/conduct' component={ConductTransaction}/>
      <Route path='/transactions' component={TransactionPool}/>
    </Switch>
  </Router>,
  document.getElementById('root')
);
