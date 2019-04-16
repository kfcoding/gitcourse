import React, {Component} from 'react';
import './App.css';
import Course from "./Course";
import {inject, observer} from "mobx-react";
import {Route, BrowserRouter as Router} from "react-router-dom";
import Scenario from "./Scenario";
import LoadingPage from "./LoadingPage";

class App extends Component {
  render() {
    return (
      <Router>
        <div className="wrapper">
          <div style={{background: '#345d86'}}>
            <div style={{fontSize: 24, color: '#fff', float: 'left'}}><img
              src='http://kfcoding.com/static/logo-min.d61eb61d.png' style={{height: 64}}/> GitCourse
            </div>
          </div>
          <Route exact path="/" component={Course}/>
          <Route path="/scenarios/:index" component={Scenario}/>
          {this.props.store.loading && <LoadingPage/>}
        </div>
      </Router>
    );
  }
}

export default inject('store')(observer(App));
