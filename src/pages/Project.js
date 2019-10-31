import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import MonacoEditor from 'react-monaco-editor';
import {Layout,Tree,Button,Modal,Row,Col} from "antd";
import {visitDir,endWith} from "../utils/FileUtils"
const {DirectoryTree} = Tree;
const {Content, Sider } = Layout;

class Project extends Component {
  constructor(props) {
    super(props);
    this.state = {
      workspace:[],
      code: '',
      path:'',
      language:"json",
      treeData:[]
    };
  }

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
    const {code,treeData,language} = this.state;
    const options = {
      selectOnLineNumbers: true
    };
    return (
      <Layout>
        <Sider width={'15%'}  style={{ background: 'white' }}>
          <DirectoryTree
            onSelect={this.onSelect}
            treeData={treeData}
          >
          </DirectoryTree>
        </Sider>
        <Content style={{ background: 'white' }}>
          <div>
            <Row type="flex" justify="start" align="middle">
              <Button style={{margin:"5px"}}>
                提交
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
export default inject('store')(observer(Project));