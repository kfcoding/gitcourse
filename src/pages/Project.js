import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import MonacoEditor,{MonacoDiffEditor} from 'react-monaco-editor';
import {Layout, Tree, Button, Modal, Row, List, message, Input, Form, Tooltip, Icon, notification, Spin} from "antd";
import {visitDir,endWith,visitDirModified,timeStamp2Date} from "../utils/utils"
import * as git from "isomorphic-git";
const {DirectoryTree,TreeNode} = Tree;
const {Content, Sider } = Layout;
const dir=encodeURIComponent(window.location.hash.substr(1));

class Project extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reading:false,
      loading:false,
      showModal: false,
      showModalPush: false,
      nodeSeclected:[],
      treeData:[],
      treeDataCommit:[],
      commits:[],
      code: '',
      codeOrigin: '',
      commitMessage:'',
      path:'',
      language:"json"
    };
  }

  showModal = async () => {
    const store = this.props.store;
    this.setState({
      reading:true
    });
    const data = await visitDirModified(store.pfs, store.dir);
    console.log(data);
    if(JSON.stringify(data) !== "[]"){
      let config = data[0];
      while(true){
        if(config["type"]==="folder"){
          config=config["children"][0];
        }
        else{
          break
        }
      }
      const path = config["path"];
      const keys=[path];
      let file = await store.pfs.readFile(path);
      const code = file.toString();
      const language=config["language"];
      file = await store.pfs.readFile(`origin_${path}`);
      const codeOrigin=file.toString();
      console.log(keys);
      this.setState({
        showModal: true,
        reading:false,
        treeDataCommit:data,
        nodeSeclected:keys,
        code,codeOrigin,language
      });
    }
    else{
      this.setState({
        reading:false
      });
      message.info("您并未修改任何文件");
    }
  };

  showModalPush = async () => {
    const depth=100;
    let commits = await git.log({ dir: `origin_${dir}`, depth: depth, ref: 'master' });
    const commitsOrigin=new Set(commits.map(commit=>commit["oid"]));
    commits = await  git.log({ dir: dir, depth: depth, ref: 'master' });
    let commitsNew=[];
    for(const commit of commits){
      if(!commitsOrigin.has(commit["oid"])){
        commitsNew.push(commit);
      }
    }
    if(commitsNew.length>0){
      this.setState({
        showModalPush: true,
        commits:commitsNew
      });
    }
    else{
      message.info("您并未创建任何commit");
    }
  };

  handleOk = async () => {
    const {commitMessage} = this.state;
    if (commitMessage === '') {
      message.info("您未填写commit信息");
      return
    }
    const FILE = 0, HEAD = 1, WORKDIR = 2;
    const filepaths = (await git.statusMatrix({ dir }))
      .filter(row => row[HEAD] !== row[WORKDIR])
      .map(row => row[FILE]);
    for(const filepath of filepaths){
      await git.add({ dir, filepath });
    }
    let sha = await git.commit({
      dir: dir,
      author: {
        name: 'gitcourse',
        email: 'gitcourse@kfcoding.com'
      },
      ref:"master",
      message: commitMessage
    });
    this.setState({
      showModal: false,
      commitMessage:'',
    });
  };

  handleCancel = () => {
    this.setState({
      showModal: false,
      showModalPush: false,
    });
  };

  onChange = async newValue =>{
    const{path}=this.state;
    const store = this.props.store;
    await store.pfs.writeFile(path,newValue);
    store.getCourse();
  };

  onSelect = async (keys, event) => {
    const node=event.node.props;
    const store = this.props.store;
    if(node["type"]==="file"){
      const {language,path}=node;
      const file=await store.pfs.readFile(path);
      const code = file.toString();
      this.setState({
        code,path,language
      })
    }
  };

  onSelectCommit = async (keys, event) => {
    const node=event.node.props;
    const store = this.props.store;
    if(node["type"]==="file"){
      const {language,path}=node;
      let file=await store.pfs.readFile(path);
      const code = file.toString();
      file=await store.pfs.readFile(`origin_${path}`);
      const codeOrigin = file.toString();
      this.setState({
        code,path,language,codeOrigin
      })
    }
  };

  onMessageChange= ({ target: { value } }) => {
    this.setState({
      commitMessage:value
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields( async (error, values) => {
      if (!error) {
        this.setState({
          loading:true
        });
        const account=values["account"];
        const password=values["password"];
        try{
          let pushResponse = await git.push({
            dir: dir,
            remote: 'origin',
            ref: 'master',
            username:account,
            password:password
          });
          if("errors" in pushResponse){
            message.error(pushResponse["errors"][0],10);
          }
          else{
            message.success("推送成功!");
            message.warning("同步中，请勿离开!",6);
            await git.pull({
              corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
              dir: `origin_${dir}`,
              ref: 'master',
              fastForwardOnly: true,
              singleBranch: true
            });
            message.success("同步完成!");
          }
        }
        catch (e) {
          message.error(e.message,10);
        }
        this.setState({
          loading:false,
          showModalPush: false,
        });
      }
    });
  };

  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode title={item.title} key={item.key} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode key={item.key} {...item} />;
    });

  async componentDidMount() {
    const store = this.props.store;
    if (Object.keys(store.pfs).length === 0) {
      this.props.history.push(`/?edit=${edit}` + window.location.hash);
    } else {
      const data = await visitDir(store.pfs, store.dir);
      let config = null;
      for (let i = 0; i < data.length; i += 1) {
        const node = data[i];
        const path = node["path"];
        if (endWith(path, "course.json")) {
          config = node;
          break
        }
      }
      if (config) {
        const path = config["path"];
        const file = await store.pfs.readFile(path);
        const code = file.toString();
        this.setState({
          treeData: data,
          code, path
        })
      } else {
        this.setState({
          treeData: data
        })
      }
    }
  }


  render() {
    const {
      code,codeOrigin,treeData,treeDataCommit, commits,language,
      showModal,showModalPush,loading,reading,nodeSeclected
    } = this.state;
    const options = {
      selectOnLineNumbers: true
    };
    const {getFieldDecorator} = this.props.form;
    return (
      <Layout>
        <Sider
          width={'15%'}
          style={{
           background: 'white'
          }}
        >
          <DirectoryTree
            onSelect={this.onSelect}
            treeData={treeData}
          >
          </DirectoryTree>
        </Sider>
        <Content style={{ background: 'white' }}>
          <div>
            <Modal
              title="创建commit"
              visible={showModal}
              width={"90%"}
              onOk={this.handleOk}
              onCancel={this.handleCancel}
              okText={"提交"}
              cancelText={"取消"}
            >
              <Layout>
                <Sider
                  width={'300'}
                  style={{
                    background: 'white'
                  }}
                >
                  <div>
                    <div style={{
                      height: 30,
                      fontSize:20,
                      textAlign: 'center',
                      background: '#3095d2',
                      color: '#fff'
                    }}>
                      commit信息
                    </div>
                    <Row type="flex" justify="center" align="middle">
                      <Input
                        style={{
                          margin:5,maxWidth:240
                        }}
                        onChange={this.onMessageChange}
                        placeholder="请填写commit信息"
                      />
                    </Row>
                    <div style={{
                      height: 30,
                      fontSize:20,
                      textAlign: 'center',
                      background: '#3095d2',
                      color: '#fff'
                    }}>
                      文件目录
                    </div>
                    {
                      treeDataCommit.length > 0 &&
                        <DirectoryTree
                          defaultExpandAll
                          defaultSelectedKeys={nodeSeclected}
                          defaultExpandedKeys={nodeSeclected}
                          onSelect={this.onSelectCommit}
                        >
                          {this.renderTreeNodes(treeDataCommit)}
                        </DirectoryTree>
                    }
                  </div>
                </Sider>
                <Content style={{ background: 'white' }}>
                  <MonacoDiffEditor
                    width="100%"
                    height="600"
                    language={language}
                    original={codeOrigin}
                    value={code}
                  />
                </Content>
              </Layout>
            </Modal>
            <Modal
              title="推送commit"
              visible={showModalPush}
              width={"60%"}
              closable={false}
              footer={[
                <Button key="submit" type="primary" onClick={this.handleCancel} disabled={loading}>
                  取消
                </Button>
              ]}
            >
              <Layout>
                <Sider
                  width={'15%'}
                  style={{background: 'white'}}
                >
                  <List
                    itemLayout="horizontal"
                    dataSource={commits}
                    renderItem={item => (
                      <List.Item>
                        <div>
                          <h1>{item.message}</h1>
                          <p>{item.oid}</p>
                          <p>{timeStamp2Date(item.author.timestamp)}</p>
                        </div>
                      </List.Item>
                    )}
                  />
                </Sider>
                <Content style={{ background: 'white' }}>
                  <Form layout="inline" onSubmit={this.handleSubmit}>
                    <Row type="flex" justify="end" align="middle">
                      <Form.Item label={
                        <span>托管网站账号&nbsp;
                          <Tooltip title="请输入该网站的账号">
                            <Icon type="question-circle-o" />
                          </Tooltip>
                        </span>
                      }>
                        {
                          getFieldDecorator('account', {
                            rules: [{
                              required: true,
                              message: '请输入账号!'
                            }],
                          })
                          (<Input style={{minWidth:"240px"}}/>)
                        }
                      </Form.Item>
                    </Row>
                    <Row type="flex" justify="end" align="middle">
                      <Form.Item label={
                        <span>托管网站密码&nbsp;
                          <Tooltip title="请输入账号密码">
                            <Icon type="question-circle-o" />
                          </Tooltip>
                        </span>
                      }>
                        {
                          getFieldDecorator('password', {
                            rules: [{
                              required: true,
                              message: '请输入密码!'
                            }],
                          })
                          (<Input.Password style={{minWidth:"240px"}}/>)
                        }
                      </Form.Item>
                    </Row>
                    <Row type="flex" justify="end" align="middle">
                      <Form.Item>
                        {
                          loading?
                            (<Spin tip="推送中"/>):
                            (
                              <Button type="primary" htmlType="submit">
                                推送
                              </Button>
                            )
                        }
                      </Form.Item>
                    </Row>
                  </Form>
                </Content>
              </Layout>
            </Modal>
            <Row type="flex" justify="center" align="middle">
              {
                reading?
                  (<Spin tip="读取中"/>):
                  (
                    <Button
                      style={{margin:"5px",width:"100px"}}
                      onClick={this.showModal}
                    >
                      commit
                    </Button>
                  )
              }
              <Button
                style={{margin:"5px",width:"100px"}}
                onClick={this.showModalPush}
              >
                push
              </Button>
            </Row>
            <Row type="flex" justify="space-around" align="middle">
              <MonacoEditor
                width="100%"
                height="900px"
                language={language}
                theme="vs-light"
                value={code}
                options={options}
                onChange={this.onChange}
                editorDidMount={this.editorDidMount}
              />
            </Row>
          </div>
        </Content>
      </Layout>
    );
  }
}

const ProjectWithForm=Form.create()(Project);
export default inject('store')(observer(ProjectWithForm));