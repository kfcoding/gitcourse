import React from 'react';
import {inject, observer} from "mobx-react";
import {Icon, Tabs} from "antd";
import Term from "./Term";

class TrainPanel extends React.Component {
  state={
    defaultActiveKey:'term',
    trigger:false
  };

  tabClickHandler = (params) => {
    const scenario = this.props.scenario;
    if("fullscreen"===params){
      scenario.setIsFull(true);
    }
    else if("fullscreen-exit"===params){
      scenario.setIsFull(false);
    }
    else if("menu-unfold"===params){
      scenario.setShowGuide(true);
    }
    else if("menu-fold"===params){
      scenario.setShowGuide(false);
    }
    else{
      this.setState({
        defaultActiveKey:params
      })
    }
  };

  componentWillUpdate() {
    let scenario = this.props.scenario;
    let current = this.props.step;
    const step=scenario.steps[current];
    const {trigger}=this.state;
    if(!trigger) {
      if (scenario.vscodeUrl) {
        this.setState({
          defaultActiveKey: 'code',
          trigger: true
        })
      }
      if(step.extraTabUrl){
        this.setState({
          defaultActiveKey:'desktop',
          trigger:true
        })
      }
    }
  }

  render() {
    let scenario = this.props.scenario;
    const isFull=scenario.isFull;
    const showGuide=scenario.showGuide;
    let current = this.props.step;
    const step=scenario.steps[current];
    const {defaultActiveKey}=this.state;
    return (
      <Tabs
        activeKey={defaultActiveKey}
        onTabClick={(params)=>this.tabClickHandler(params)}
        style={{height:isFull?'100vh':'calc(100vh - 64px)'}}
      >
        <Tabs.TabPane
          tab={
            <span>
              <Icon type="code"  theme="twoTone"/>
              Terminal
            </span>
          }
          key={'term'}
          closable='false'
          forceRender={true}
        >
          <Term secnario={scenario}/>
        </Tabs.TabPane>
        {
          step.extraTabUrl &&
          <Tabs.TabPane
            tab={
              <span>
                <Icon type="desktop" theme="twoTone" />
                Panel
              </span>
            }
            key={'desktop'}
            closable='false'
          >
            <iframe
              src={step.extraTabUrl}
              style={{width: '100%',height:isFull?'calc(100vh - 60px)':'calc(100vh - 124px)', border: '0'}}
            />
          </Tabs.TabPane>
        }
        {
          scenario.vscodeUrl &&
          <Tabs.TabPane
            tab={
              <span>
                <Icon type="edit" />
                Code
              </span>
            }
            key={'code'}
            closable='false'
          >
            <iframe
              src={scenario.vscodeUrl}
              style={{width: '100%',height:isFull?'calc(100vh - 60px)':'calc(100vh - 124px)', border: '0'}}
            />
          </Tabs.TabPane>
        }
        {
          step.oj &&
          <Tabs.TabPane
            tab={
              <span>
                <Icon type="trophy" />
                Online Judge
              </span>
            }
            key={'oj'}
            closable='false'
          >
            <iframe
              src={step.oj}
              style={{width: '100%',height:isFull?'calc(100vh - 60px)':'calc(100vh - 124px)', border: '0'}}
            />
          </Tabs.TabPane>
        }
        {
          isFull?(
            <Tabs.TabPane
              tab={
                <span>
              <Icon type="fullscreen-exit" />
              Exit
            </span>
              }
              key={'fullscreen-exit'}
              closable='false'
            />
            ) : (
            <Tabs.TabPane
              tab={
                <span>
                <Icon type="fullscreen" />
                Full Screen
              </span>
              }
              key={'fullscreen'}
              closable='false'
            />
            )
        }
        {
          showGuide?(
            <Tabs.TabPane
              tab={
                <span>
              <Icon type="menu-fold" />
              Hide Guide
            </span>
              }
              key={'menu-fold'}
              closable='false'
            />
          ) : (
            <Tabs.TabPane
              tab={
                <span>
                <Icon type="menu-unfold" />
                Show Guide
              </span>
              }
              key={'menu-unfold'}
              closable='false'
            />
          )
        }
      </Tabs>
    )
  }
}

export default inject('store')(observer(TrainPanel));
