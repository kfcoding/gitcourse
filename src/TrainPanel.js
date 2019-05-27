import React from 'react';
import {Icon, Tabs} from "antd";
import Term from "./Term";
import {inject, observer} from "mobx-react";

class TrainPanel extends React.Component {
  render() {
    let scenario = this.props.scenario;
    console.log(scenario)
    return (
      <Tabs
        style={{height: '100%'}}
        defaultActiveKey="term"
      >
        <Tabs.TabPane tab={
          <span>
          <Icon type="code"/>
          Terminal
        </span>
        } key={'term'} closable='false'
                      style={{height: '100%'}} forceRender={true}>
          <Term secnario={scenario}/>
        </Tabs.TabPane>

        {(scenario.enableDesktop && scenario.ws_addr) &&
        <Tabs.TabPane tab={
          <span>
          <Icon type="desktop" />
          Desktop
        </span>
        } key={'desktop'} closable='false'
                      style={{height: '100%'}}>
          <iframe src={'/desktop.html#' + scenario.ws_addr} style={{width: '100%', height: '100%', border: '0'}}/>
        </Tabs.TabPane>
        }

      </Tabs>
    )
  }
}

export default inject('store')(observer(TrainPanel));
