import React, {Component} from 'react';
import './App.css';
import Course from "./Course";
import {inject, observer} from "mobx-react";
import {Route, BrowserRouter as Router} from "react-router-dom";
import Scenario from "./Scenario";
import LoadingPage from "./LoadingPage";
import {Icon, Layout, Menu, Switch} from "antd";
const { Header, Content, Footer } = Layout;
class App extends Component {
  render() {
    return (
      <Router>
        <div className="wrapper">
          <Header style={{padding: 0}}>
            <div style={{fontSize: 24, color: '#fff', float: 'left'}}><img
              src='https://kfcoding-static.oss-cn-hangzhou.aliyuncs.com/logo-min.png' style={{height: 48}}/> GitCourse
            </div>
            <Menu
              theme="dark"
              mode="horizontal"
              style={{lineHeight: '64px', float: 'right', cursor: 'pointer'}}
              selectable={false}
            >
              <Menu.Item key="1"><a href='http://kfcoding.com'><Icon type="bank" />KFCODING</a></Menu.Item>
              <Menu.Item key="2"><a href='https://github.com/guodong/gitcourse' target='_blank'><Icon type="github" />GITHUB</a></Menu.Item>
            </Menu>
          </Header>
          <Route exact path="/" component={Course}/>
          <Route path="/scenarios/:index" component={Scenario}/>
          {this.props.store.loading && <LoadingPage/>}
        </div>
      </Router>
    );
  }
}

export default inject('store')(observer(App));
