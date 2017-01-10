import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';

import enUS from 'antd/lib/locale-provider/en_US';
import { LocaleProvider } from 'antd';

ReactDOM.render(
  <LocaleProvider locale={enUS}><App /></LocaleProvider>,
  document.getElementById('root')
);
