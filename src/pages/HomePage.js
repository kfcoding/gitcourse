import React, {Component} from 'react';
import {Icon, Layout, Menu} from "antd";
import {inject, observer} from "mobx-react";
import CourseMenu from "./CourseMenu";
import Scenario from "./Scenario";
import LoadingPage from "./LoadingPage";
const { Header } = Layout;

class HomePage extends Component {

  componentDidMount() {
    const {compact,dockerEndpoint,corsProxy,repo,currentIndex,showGuide}=this.props;
    const store=this.props.store;
    store.setDockerEndpoint(dockerEndpoint);
    store.setCorsProxy(corsProxy);
    store.setRepo(repo);
    store.course.setCompact(compact);
    store.setCurrentIndex(currentIndex);
    store.setShowGuide(showGuide);
    setTimeout(store.updateCourse,1000);//necessary pause
  }



  render() {
    const {store}=this.props;
    const compact=store.course.compact;
    const {currentIndex,loading}=store;
    return (
      <div>
        {
          !compact&&
          <Header style={{padding: 0}}>
            <div style={{fontSize: 24, color: '#fff', float: 'left'}}>
              <img src='https://kfcoding-static.oss-cn-hangzhou.aliyuncs.com/logo-min.png' style={{height: 48}} alt=""/>
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
                <a href='https://github.com/kfcoding/gitcourse' target='_blank' rel="noopener noreferrer" >
                  <Icon type="github" />
                  GITHUB
                </a>
              </Menu.Item>
            </Menu>
          </Header>
        }
        {
          loading &&
          <LoadingPage/>
        }
        {
          currentIndex===-1&&
          <CourseMenu {...this.props}/>
        }
        {
          currentIndex!==-1&&
          <Scenario {...this.props}/>
        }
      </div>
    );
  }
}

export default inject('store')(observer(HomePage));