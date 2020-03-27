import React, {Component} from 'react';
import {Button,Icon, notification,Form,Spin,Input,Row, Tooltip} from "antd";
import {inject, observer} from "mobx-react";
class ImageMaker extends Component {
  state = {
    loading:false
  };

  handleSubmit = e => {
    e.preventDefault();
    const store=this.props.store;
    const index=store.course.index;
    const scenario=store.course.scenarios[index];
    const {containerId}=scenario;
    this.props.form.validateFields( async (error, values) => {
      if (!error) {
        this.setState({
          loading:true
        });
        values["containerId"]=containerId;
        values["imageFullName"]=`registry.cn-hangzhou.aliyuncs.com/envs/${values["imageFullName"]}`;
        let url=`http://envmaker.kfcoding.com/api/image/commit`;
        let response=await fetch(url, {
          headers: {'Content-Type': 'application/json'},
          method: 'POST',
          body: JSON.stringify(values),
          mode:'cors'
        });
        const data=await response.json();
        this.setState({
          loading:false
        });
        if("error" in data){
          notification['error']({
            message: '创建镜像失败',
            description: data["error"],
          });
        }
        else{
          const btn = (
            <Button type="primary" size="small" onClick={() => {
              this.reloadImage(data["data"]["image"]);
            }}>
              重载镜像
            </Button>
          );
          notification['success']({
            message: '创建镜像成功',
            description: `请保存您的镜像名:${data["data"]["image"]}`,
          });
        }
      }
    });
  };

  render() {
    const {loading}=this.state;
    const {getFieldDecorator} = this.props.form;
    const store=this.props.store;
    const index=store.course.index;
    const scenario = store.course.scenarios[index];
    if (!scenario) {
      return <div/>
    }
    const environment=scenario.environment;
    const group=environment.split('/');
    const image=group[group.length-1];
    let dockerEndpoint=scenario.docker_endpoint===''?scenario.store.dockerEndpoint:scenario.docker_endpoint;
    let dockerServerVersion="1.24";
    var matches = dockerEndpoint.match(/http:\/\/.+?(?=\/)/mg);
    if (matches && matches.length > 0){
      dockerEndpoint=matches[0]
    }
    return (
      <div
        style={{
          height: '100%',
          overflow: 'auto'
        }}
      >
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
                  initialValue: 'registry.cn-hangzhou.aliyuncs.com',
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
                getFieldDecorator('dockerServerHost',{initialValue: dockerEndpoint})(
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
                getFieldDecorator('dockerServerVersion',{initialValue: dockerServerVersion})(
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
                <Tooltip title="将当前容器提交为新镜像">
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
            }>
              {
                getFieldDecorator('imageFullName', {
                  rules: [{
                    required: true,
                    message: '请输入简称!'
                  }],
                  initialValue:image
                })
                (<Input style={{minWidth:"240px"}} placeholder={""}/>)
              }
            </Form.Item>
          </Row>
          <Row type="flex" justify="center" align="middle">
            <Form.Item>
              {
                loading?
                  (<Spin tip="提交中"/>):
                  (
                    <Button type="primary" htmlType="submit">
                      提交
                    </Button>
                  )
              }
            </Form.Item>
          </Row>
        </Form>
      </div>
    )
  }
}
const ImageMakerWithForm=Form.create()(ImageMaker);
export default inject('store')(observer(ImageMakerWithForm));