import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {Store} from "./store";
import {onSnapshot} from "mobx-state-tree";
import {Provider} from "mobx-react";

const store = Store.create();

onSnapshot(store, (snapshot) => {
  // console.dir(JSON.stringify(snapshot))
})
ReactDOM.render(<Provider store={store}><App/></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
