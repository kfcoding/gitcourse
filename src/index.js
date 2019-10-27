import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './pages/App';
import * as serviceWorker from './serviceWorker';
import {Store} from "./store";
import {onSnapshot} from "mobx-state-tree";
import {Provider} from "mobx-react";

const store = Store.create();

onSnapshot(store, (snapshot) => {

});
ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));

serviceWorker.unregister();
