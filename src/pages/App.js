import React, {Component} from 'react';
import Course from "./Course";
import Project from "./Project";
import {inject, observer} from "mobx-react";
import {Route, BrowserRouter as Router} from "react-router-dom";
import Scenario from "./Scenario";
import LoadingPage from "./LoadingPage";

import {Icon, Layout, Menu} from "antd";
const { Header } = Layout;
class App extends Component {

  componentDidMount() {
    const store=this.props.store;
    setTimeout(store.updateCourse,1000);//necessary pause
  }

  render() {
    const compact=window.location.search.search("compact=true") !== -1;
    return (
      <Router>
        {
          !compact&&
          <Header style={{padding: 0}}>
            <div style={{fontSize: 24, color: '#fff', float: 'left'}}>
              <img src='https://kfcoding-static.oss-cn-hangzhou.aliyuncs.com/logo-min.png' style={{height: 48}}/>
              GitCourse
            </div>
            <Menu
                theme="dark"
                mode="horizontal"
                style={{lineHeight: '64px', float: 'right', cursor: 'pointer'}}
                selectable={false}
            >
              <Menu.Item key="1">
                <a href='http://kfcoding.com'>
                  <Icon type="bank" />
                  KFCODING
                </a>
              </Menu.Item>
              <Menu.Item key="2">
                <a href='https://github.com/kfcoding/gitcourse' target='_blank'>
                  <Icon type="github" />
                  GITHUB
                </a>
              </Menu.Item>
            </Menu>
          </Header>
        }
        {
          this.props.store.loading &&
          <LoadingPage/>
        }
        <Route exact path="/" component={Course}/>
        <Route path="/scenarios/:index" component={Scenario}/>
        <Route path="/project" component={Project}/>
      </Router>
    );
  }
}

export default inject('store')(observer(App));
