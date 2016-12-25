import React from 'react';
import ReactDOM from 'react-dom';
import {hashHistory, Router, Route} from 'react-router'
import App from './App';
import './index.css';

function FooApp() {
  return <div>Routing successful!</div>
}

ReactDOM.render(
  <Router history={hashHistory}>
    <Route path="/" component={App}/>
    <Route path="/blah" component={FooApp}/>
  </Router>,
  document.getElementById('root')
);
