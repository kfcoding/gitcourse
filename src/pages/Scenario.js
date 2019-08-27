import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import SplitPane from "react-split-pane";
import Step from "./Step";
import Term from "./Term";
import {Button, Icon, notification, Modal,Form, Input,Select,Row,Col} from "antd";
import {Link} from "react-router-dom";
// import Desktop from "./Desktop";
import {Tabs} from "antd/lib/tabs";
import TrainPanel from "./TrainPanel";
const { Option } = Select;

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
    const edit=store.course.edit;
    let scenario = store.course.scenarios[index];
    if (!scenario) {
      return <div/>
    }
    const stepIndex=scenario.stepIndex;
    const step=scenario.steps[stepIndex];
    return (
      <SplitPane
          split="vertical"
          minSize={0}
          size={edit ? '70%' : '100%'}
          style={{position: 'relative'}}
      >
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
                    <Icon type="book"/>
                    返回目录
                  </Button>
                </div>
              }
              {
                stepIndex !== 0 &&
                <Button type="default" onClick={() => {
                  scenario.setStepIndex(stepIndex - 1)
                }}>
                  <Icon type="left"/>
                  上一步
                </Button>
              }
              {
                stepIndex !== scenario.steps.length - 1 &&
                <Button type="primary" style={{float: 'right'}} onClick={() => {
                  if(edit){
                    scenario.setStepIndex(stepIndex + 1);
                    return
                  }
                  step.checkStep().then(data => {
                    if (data === true){
                      scenario.setStepIndex(stepIndex + 1)
                    }
                    else{
                      this.openNotification();
                    }
                  });
                }}>
                  <Icon type="right"/>
                  下一步
                </Button>
              }
              {
                stepIndex === scenario.steps.length - 1 &&
                <Button type="primary" style={{float: 'right'}} onClick={() => {
                  if(edit){
                    this.setComplete();
                    setTimeout(() => {
                      this.props.history.push('/' + window.location.hash);
                    }, 500);
                    return
                  }
                  step.checkStep().then(data => {
                    if (data === true) {
                      this.setComplete();
                      setTimeout(() => {
                        this.props.history.push('/' + window.location.hash);
                      }, 500);
                    }
                    else {
                      this.openNotification();
                    }
                  });
                }}>
                  <Icon type="book"/>
                  完成
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
        {
          edit&&
          <div
              style={{
                height: '100%',
                overflow: 'auto'
              }}>
            <Form layout="inline" onSubmit={this.handleSubmit}>
              <div style={{
                height: 40,
                fontSize:24,
                textAlign: 'center',
                background: '#3095d2',
                color: '#fff'
              }}>
                基础镜像
              </div>
              <Row type="flex" justify="center" align="middle">
                <Form.Item>
                  <Select placeholder="基础镜像" style={{ width: 360 }}>
                    <Option value="Python">Python</Option>
                    <Option value="Java">Java</Option>
                    <Option value="PHP">PHP</Option>
                  </Select>
                </Form.Item>
              </Row>
              <Row type="flex" justify="center" align="middle">
                <Form.Item>
                  <Select placeholder="私有镜像" style={{ width: 360 }}>
                    <Option value="Python">Python_2019-8-11</Option>
                    <Option value="Java">Java_2019-7-15</Option>
                    <Option value="PHP">PHP_2019-9-1</Option>
                  </Select>
                </Form.Item>
              </Row>
              <Row type="flex" justify="center" align="middle">
                <Form.Item>
                  <Input addonBefore={"自定义镜像"} style={{ width: 360 }}/>
                </Form.Item>
              </Row>
              <div style={{
                height: 40,
                fontSize:24,
                textAlign: 'center',
                background: '#3095d2',
                color: '#fff'
              }}>
                环境变量
              </div>
              <Form.Item>
                <Button type="dashed" style={{ width: '60%' }}>
                  <Icon type="plus" />
                  添加
                </Button>
              </Form.Item>
              <div style={{
                height: 40,
                fontSize:24,
                textAlign: 'center',
                background: '#3095d2',
                color: '#fff'
              }}>
                启动命令
              </div>
              <Button>
                保存
              </Button>
            </Form>
          </div>
        }
      </SplitPane>
    )
  }
}

export default inject('store')(observer(Scenario));
