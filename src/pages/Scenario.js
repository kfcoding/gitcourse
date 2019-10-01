import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import SplitPane from "react-split-pane";
import Step from "./Step";
import {Button,message,Icon, notification, Modal,Form, Input,Row, Tooltip} from "antd";
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
    isDragging: false,
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

  handleSubmit = e => {
    e.preventDefault();
    const store=this.props.store;
    const index=this.props.match.params.index;
    const {container_id}=store.course.scenarios[index];
    this.props.form.validateFields( async (error, values) => {
      if (!error) {
        values["containerId"]=container_id;
        let url=`http://envmaker.kfcoding.com/api/image/commit`;
        let response=await fetch(url, {
          headers: {'Content-Type': 'application/json'},
          method: 'POST',
          body: JSON.stringify(values),
          mode:'cors'
        });
        const data=await response.json();
        if("error" in data){
          message.error(data["error"])
        }
        else{
          message.success("镜像保存成功!")
        }
      }
    });
  };

  render() {
    const store=this.props.store;
    const index=this.props.match.params.index;
    const edit=store.course.edit;
    let scenario = store.course.scenarios[index];
    if (!scenario) {
      return <div/>
    }
    let docker_endpoint=scenario.docker_endpoint===''?scenario.store.docker_endpoint:scenario.docker_endpoint;
    let docker_server_version="1.24";
    var matches = docker_endpoint.match(/http:\/\/.+?(?=\/)/mg);
    if (matches && matches.length > 0){
      docker_endpoint=matches[0]
    }
    const stepIndex=scenario.stepIndex;
    const step=scenario.steps[stepIndex];
    const {isDragging}=this.state;
    const compact=window.location.search.search("compact=true") !== -1;
    const {getFieldDecorator} = this.props.form;
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
            onDragStarted={() => {
              this.setState({
                isDragging: true,
              });
            }}
            onDragFinished={() => {
              this.setState({
                isDragging: false,
              });
            }}
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
            <div style={{position: 'relative', width: '100%'}}>
              {
                stepIndex !== scenario.steps.length - 1 &&!compact&&
                <div style={{textAlign: 'center', position: 'absolute', width: '100%'}}>
                  <Button type="primary" style={{margin:20}} onClick={() => {
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
                <Button type="default" style={{margin:20}} onClick={() => {
                  scenario.setStepIndex(stepIndex - 1)
                }}>
                  <Icon type="left"/>
                  上一步
                </Button>
              }
              {
                stepIndex !== scenario.steps.length - 1 &&
                <Button type="primary" style={{margin:20,float: 'right'}} onClick={() => {
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
                stepIndex === scenario.steps.length - 1 &&!compact&&
                <Button type="primary" style={{margin:20,float: 'right'}} onClick={() => {
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
          <div style={{height: '100%', background: '#000', overflow: 'hidden',pointerEvents:isDragging?'none':'auto'}}>
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
                镜像仓库
              </div>
              <Row type="flex" justify="start" align="middle">
                <Form.Item label={
                  <span>镜像仓库服务器&nbsp;
                    <Tooltip title="例如:registry.cn-hangzhou.aliyuncs.com">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }>
                  {
                    getFieldDecorator('registryServer', {
                      rules: [{
                        required: true,
                        message: '请输入服务器地址!'
                      }],
                    })
                    (<Input style={{minWidth:"240px"}}/>)
                  }
                </Form.Item>
              </Row>
              <Row type="flex" justify="start" align="middle">
                <Form.Item label={
                  <span>镜像仓库的账号&nbsp;
                    <Tooltip title="请输入您的镜像仓库账号">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }>
                  {
                    getFieldDecorator('registryAccount', {
                    rules: [{
                      required: true,
                      message: '请输入账号!'
                    }],
                    })
                    (<Input style={{minWidth:"240px"}}/>)
                  }
                </Form.Item>
              </Row>
              <Row type="flex" justify="start" align="middle">
                <Form.Item>
                  <Form.Item label={
                    <span>镜像仓库的密码&nbsp;
                      <Tooltip title="请输入您的镜像仓库密码">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                  }>
                    {
                      getFieldDecorator('registryPassword', {
                        rules: [{
                          required: true,
                          message: '请输入密码!'
                        }],
                      })
                      (<Input.Password style={{minWidth:"240px"}}/>)
                    }
                  </Form.Item>
                </Form.Item>
              </Row>
              <div style={{
                height: 40,
                fontSize:24,
                textAlign: 'center',
                background: '#3095d2',
                color: '#fff'
              }}>
                Docker服务器
              </div>
              <Row type="flex" justify="start" align="middle">
                <Form.Item label={
                  <span>Docker服务器地址&nbsp;
                    <Tooltip title="由当前Docker服务器提供">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }>
                  {
                    getFieldDecorator('dockerServerHost',{initialValue: docker_endpoint})(
                      <Input style={{minWidth:"240px"}} disabled/>
                    )
                  }
                </Form.Item>
              </Row>
              <Row type="flex" justify="start" align="middle">
                <Form.Item label={
                  <span>Docker服务器版本&nbsp;
                    <Tooltip title="由当前Docker服务器提供">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }>
                  {
                    getFieldDecorator('dockerServerVersion',{initialValue: docker_server_version})(
                        <Input style={{minWidth:"240px"}} disabled/>
                    )
                  }
                </Form.Item>
              </Row>
              <div style={{
                height: 40,
                fontSize:24,
                textAlign: 'center',
                background: '#3095d2',
                color: '#fff'
              }}>
                创建新镜像
              </div>
              <Row type="flex" justify="start" align="middle">
                <Form.Item label={
                  <span>新镜像的名称&nbsp;
                    <Tooltip title="将当前容器提交为新镜像的名称">
                      <Icon type="question-circle-o" />
                    </Tooltip>
                  </span>
                }>
                  {
                    getFieldDecorator('imageFullName', {
                      rules: [{
                        required: true,
                        message: '请输入名称!'
                      }],
                    })
                    (<Input style={{minWidth:"240px"}}/>)
                  }
                </Form.Item>
              </Row>
              <Row type="flex" justify="center" align="middle">
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    提交
                  </Button>
                </Form.Item>
              </Row>
            </Form>
          </div>
        }
      </SplitPane>
    )
  }
}
const ScenarioWithForm=Form.create()(Scenario);
export default inject('store')(observer(ScenarioWithForm));
