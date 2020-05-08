import React, {Component} from 'react';
import {Provider} from "mobx-react";
import HomePage from './pages/HomePage';
import {Store} from "./store/Store";
import './index.css';

const store = Store.create();

export default class GitCourse extends Component {
  render() {
    return (
      <Provider store={store}><HomePage {...this.props}/></Provider>
    )
  }
}