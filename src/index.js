import React from 'react';
import ReactDOM from 'react-dom';
import GitCourse from './pages/GitCourse';
import * as serviceWorker from './serviceWorker';
import {Store} from "./store";
import {Provider} from "mobx-react";
import './index.css';

const store = Store.create();

ReactDOM.render(<Provider store={store}><GitCourse/></Provider>, document.getElementById('root'));

serviceWorker.unregister();