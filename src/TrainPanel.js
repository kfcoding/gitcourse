import React from 'react';
import {Icon, Tabs} from "antd";
import Term from "./Term";
import {inject, observer} from "mobx-react";

class TrainPanel extends React.Component {
  render() {
    let scenario = this.props.scenario;
    let step = this.props.step;
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
        {
        <Tabs.TabPane tab={
          <span>
          <Icon type="desktop" />
          Panel
        </span>
        } key={'desktop'} closable='false' style={{height: '100%'}}>
          <iframe src={scenario.steps[step].extraTabUrl} style={{width: '100%', height: '100%', border: '0'}}/>
        </Tabs.TabPane>
        }

      </Tabs>
    )
  }
}

export default inject('store')(observer(TrainPanel));
