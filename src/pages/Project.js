import React, {Component} from 'react';
import {inject, observer} from "mobx-react";
import SplitPane from "react-split-pane";
import MonacoEditor from 'react-monaco-editor';
import {Button,message,Icon, notification, Modal,Form,Spin,Input,Row, Tooltip} from "antd";
import {Tabs} from "antd/lib/tabs";

class Project extends Component {
    constructor(props) {
        super(props);
        this.state = {
            code: 'var i=0;',
        }
    }

    editorDidMount = editor => {
        editor.focus();
    };

    onChange= newValue =>{
        console.log('onChange', newValue);
    };

    componentWillUpdate() {
        const store=this.props.store;
    }

    componentDidMount() {
        const store=this.props.store;
        if(JSON.stringify(store.pfs)==="{}")
        {
            console.log("empty");
        }
        else{
            store.pfs.readdir(`${store.dir}`,function(err,files){
                if(err){
                    console.log([]);
                }
                console.log(files);
            });
        }

    }

    componentWillUnmount() {
        const store=this.props.store;
    }

    render() {
        const edit=window.location.search.search("edit=true") !== -1;
        if (!edit) {
            return <div/>
        }
        const code = this.state.code;
        const options = {
            selectOnLineNumbers: true
        };
        return (
            <MonacoEditor
                width="1280"
                height="720"
                language="javascript"
                theme="vs-light"
                value={code}
                options={options}
                onChange={this.onChange}
                editorDidMount={this.editorDidMount}
            />
        );
    }
}
export default inject('store')(observer(Project));