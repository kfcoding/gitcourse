import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import SplitPane from "react-split-pane";
import MonacoEditor from 'react-monaco-editor';
import {Button,message,Icon, notification, Modal,Form,Spin,Input,Row, Tooltip,Tree} from "antd";
import {visitDir,endWith} from "../utils/FileUtils"
const {DirectoryTree} = Tree;

class Project extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      path:'',
      language:"json",
      treeData:[]
    }
  }

  onChange= newValue =>{
    this.setState({
      code:newValue
    })
  };

  onSelect = (keys, event) => {
    const node=event.node.props;
    const store = this.props.store;
    if(node["type"]==="file"){
      const {language,path}=node;
      const file=store.pfs.readFileSync(path);
      const code = file.toString();
      this.setState({
        code,path,language
      })
    }
  };

  componentDidMount() {
    const edit = window.location.search.search("edit=true") !== -1;
    const store = this.props.store;
    if (Object.keys(store.pfs).length === 0) {
      this.props.history.push(`/?edit=${edit}` + window.location.hash);
    } else {
      const data =visitDir(store.pfs, store.dir);
      let config=null;
      for(let i=0;i<data.length;i+=1){
        const node=data[i];
        const path=node["path"];
        if(endWith(path,"course.json")){
          config=node;
          break
        }
      }
      if(config){
        const path=config["path"];
        const file=store.pfs.readFileSync(path);
        const code = file.toString();
        this.setState({
          treeData:data,
          code,path
        })
      }
      else{
        this.setState({
          treeData:data
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
      <SplitPane
        split="vertical"
        size={'15%'}
        style={{position: 'relative'}}
      >
        {
          treeData.length &&
          <DirectoryTree defaultExpandAll onSelect={this.onSelect} treeData={treeData}>
          </DirectoryTree>
        }
        <MonacoEditor
          width="100%"
          height="100%"
          language={language}
          theme="vs-light"
          value={code}
          options={options}
          onChange={this.onChange}
          editorDidMount={this.editorDidMount}
        />
      </SplitPane>
      );
    }
}
export default inject('store')(observer(Project));