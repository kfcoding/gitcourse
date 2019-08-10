import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import SplitPane from "react-split-pane";
import Step from "./Step";
import Term from "./Term";
import {Button, Icon, notification, Modal, Switch} from "antd";
import {Link} from "react-router-dom";
// import Desktop from "./Desktop";
import {Tabs} from "antd/lib/tabs";
import TrainPanel from "./TrainPanel";

function showModal() {
  Modal.success({
    title: 'Congratulations!',
    content: '恭喜你！你已完成全部实训课程！',
  });
}

class Scenario extends Component {
  state = {
    stepIndex: 0,
    showDesktop: false
  };

  componentWillUpdate() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const current=store.course.scenarios[index];
    if (current) {
      if (current.created ===false)
        current.createContainer();
    }
  }

  componentDidMount() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const current=store.course.scenarios[index];
    if (current) {
      // if (store.course.scenarios[this.props.match.params.index].created == false)
      current.createContainer();
    }
  }

  componentWillUnmount() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const current=store.course.scenarios[index];
    current.clearContainer();
  }

  setComplete() {
    const store=this.props.store;
    if (this.props.match.params.index * 1 === store.completeIndex * 1) {
      store.setCompleteIndex(this.props.match.params.index * 1 + 1);
    }
  }

  openNotification() {
    notification['info']({
      message: '提示',
      description: '您还未完成本步骤的内容！',
    });
  }

  render() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    let scenario = store.course.scenarios[index];
    if (!scenario) {
      return <div/>
    }
    const step=scenario.steps[this.state.stepIndex];
    const stepIndex=scenario.stepIndex;
    return (
      <SplitPane
          split="vertical"
          minSize={50}
          defaultSize={step.hideTerminal ? '100%' : 450}
          style={{position: 'relative'}}
      >
        <div style={{height: '100%', overflow: 'auto'}}>
          <div style={{
            height: 40,
            lineHeight: '40px',
            textAlign: 'center',
            fontSize: 24,
            background: '#3095d2',
            color: '#fff'
          }}>
            {scenario.title}
          </div>
          <Step step={step} scenario={scenario}/>
          <div style={{padding: 20, position: 'relative', width: '100%'}}>
            {
              stepIndex !== scenario.steps.length - 1 &&
              <div style={{textAlign: 'center', position: 'absolute', width: '100%'}}>
                <Button type="primary" onClick={() => {
                  scenario.setStepIndex(0);
                  this.props.history.push('/' + window.location.hash);
                }}>
                  <Icon type="book"/> 返回目录
                </Button>
              </div>
            }
            {
              stepIndex !== 0 &&
              <Button type="default" onClick={() => {
                scenario.setStepIndex(stepIndex - 1)
              }}>
                <Icon type="left"/>上一步
              </Button>
            }
            {
              stepIndex !== scenario.steps.length - 1 &&
              <Button type="primary" style={{float: 'right'}} onClick={() => {
                step.checkStep().then(data => {
                  if (data === true) {
                    scenario.setStepIndex(stepIndex + 1)
                  } else {
                    this.openNotification();
                  }
                });
              }}>
                下一步<Icon type="right"/>
              </Button>
            }
            {
              stepIndex === scenario.steps.length - 1 &&
              <Button type="primary" style={{float: 'right'}} onClick={() => {
                step.checkStep().then(data => {
                  if (data === true) {
                    this.setComplete();
                    setTimeout(() => {
                      this.props.history.push('/' + window.location.hash);
                    }, 500)
                  } else {
                    this.openNotification();
                  }
                });
              }}>
                完成<Icon type="book"/>
              </Button>
            }
            {
              stepIndex === scenario.steps.length - 1 &&
              this.props.match.params.index === store.course.scenarios.length - 1 &&
              showModal()
            }
          </div>
        </div>
        <div style={{height: '100%', background: '#000', overflow: 'hidden'}}>
          <TrainPanel scenario={scenario} step={stepIndex}/>
        </div>
      </SplitPane>
    )
  }
}

export default inject('store')(observer(Scenario));
