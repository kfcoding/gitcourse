import {flow, getRoot, types} from 'mobx-state-tree';
import {Step} from "./Step";
import {Terminal} from "./Terminal";
import {message} from "antd";
import install from "../../public/install.sh"
import start from "../../public/start.sh"

const vscodeInstallForced=window.location.search.search("code=true") !== -1;
const vscodePort=window._env_.VSCODE_PORT;
const urlVscodeAlpine=window._env_.URL_CODE_SERVER_ALPINE;
const urlVscode=window._env_.URL_CODE_SERVER;

export const Scenario = types
  .model('Scenario', {
    title: '',
    description: '',
    environment: '',
    shell:'/bin/sh',
    vscode_enabled:false,
    docker_endpoint:'',
    binds: types.array(types.string),
    privileged: false,
    steps: types.array(Step),
    terminals: types.array(Terminal)
  }).volatile(self => ({
    vscodeUrl:null,
    step_index: 0,
    container_id: '',
    ws_addr: '',
    creating: false,
  })).views(self => ({
    get store() {
      return getRoot(self);
    },
    get needTime() {
      let wc = 0;
      self.steps.map(step => wc += step.content.length);
      return Math.ceil(wc / 360);
    }
  })).actions(self => {

    const createContainer =flow(function* () {
      try {
        self.setCreated(true);
        const edit=window.location.search.search("edit=true") !== -1;
        const container_mode=edit? {"kfcoding-maker":"true"}: {"kfcoding-auto-delete":"true"};
        const docker_endpoint=self.docker_endpoint===''?self.store.docker_endpoint:self.docker_endpoint;
        let exposed_ports={};
        exposed_ports[`${vscodePort}/tcp`]={};
        const steps=self.steps;
        for(var  i=0;i<steps.length;i++){
          const {extraTab}=steps[i];
          var matches = extraTab.match(/(\[:).+?(?=])/mg);
          if (matches && matches.length > 0){
            matches[0]=matches[0].replace('[:','');
            exposed_ports[`${matches[0]}/tcp`]={}
          }
        }
        let url=`${docker_endpoint}/containers/create`;
        let response=yield fetch(url, {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            Image: self.environment,
            Entrypoint: self.shell,
            Labels:container_mode,
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            OpenStdin: true,
            ExposedPorts: exposed_ports,
            HostConfig: {
              Privileged: self.privileged || false,
              PublishAllPorts: true,
              Binds: self.binds
            }
          })
        });
        let status=response.status;
        if(status===201){
          let data=yield response.json();
          const containerId=data.Id;
          console.log("container created:",containerId);
          self.setContainerId(containerId);
          self.terminals[0].setContainerId(containerId);
          url=`${docker_endpoint}/containers/${containerId}/start`;
          yield fetch( url, {method: 'POST',mode: 'cors'});
          self.steps[self.step_index].beforeStep();
          url=`ws${docker_endpoint.substr(4)}/containers/${containerId}/attach/ws?logs=1&stream=1&stdin=1&stdout=1&stderr=1`;
          let socket = new WebSocket(url);
          self.terminals[0].terminal.attach(socket, true, true);
          socket.onopen = () => socket.send("\n");

          let scriptExec="";
          console.log("vscodeInstallForced",vscodeInstallForced);
          if(vscodeInstallForced===true){
            console.log("installing vscode");
            scriptExec=install.replace("URL_CODE_SERVER_ALPINE",urlVscodeAlpine);
            scriptExec=scriptExec.replace("URL_CODE_SERVER",urlVscode);
            scriptExec=`${scriptExec} ${vscodePort}`;
          }
          else{
            if(self.vscode_enabled){
              console.log("launching vscode");
              scriptExec=`${start} ${vscodePort}`;
            }
          }
          if(scriptExec!==""){
            url=`${docker_endpoint}/containers/${containerId}/exec`;
            response=yield fetch( url, {
              headers: {
                'Content-Type': 'application/json'
              },
              method: 'POST',
              mode: 'cors',
              body: JSON.stringify({
                "AttachStdin": true,
                "AttachStdout": true,
                "AttachStderr": true,
                "Cmd": ["sh", "-c",scriptExec],
                "DetachKeys": "ctrl-p,ctrl-q",
                "Privileged": true,
                "Tty": true,
              })
            });
            data =yield response.json();
            const execId=data.Id;
            url=`${self.store.docker_endpoint}/exec/${execId}/start`;
            yield fetch(url, {
              method: 'POST',
              mode: 'cors',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                Detach: false,
                Tty: true
              })
            });

            url=`${docker_endpoint}/containers/${containerId}/json`;
            response=yield fetch( url, {method: 'GET',mode:'cors'});
            data=yield response.json();
            const host = docker_endpoint.match(/(http:\/\/).+?(?=:)/)[0];
            const vscodeUrlPort=data.NetworkSettings.Ports[`${vscodePort}/tcp`][0].HostPort;
            const vscodeUrl = `${host}:${vscodeUrlPort}`;
            let count=0;
            let that=self;
            const event=setInterval(async function() {
              try {
                url=`${docker_endpoint}/containers/${containerId}/top?ps_args=-a`;
                response=await fetch(url, {method: 'GET',mode:'cors'});
                const data=await response.json();
                const processes=data["Processes"];
                for(const process of processes){
                  const command=process[3];
                  if("code-server"===command){
                    console.log("vscode url:",vscodeUrl);
                    that.setCodeUrl(vscodeUrl);
                    clearInterval(event);
                    break;
                  }
                }
                console.log("waitting for vscode setup ......");
                count+=1;
              }
              catch (e) {
                console.log(e);
                count+=1;
              }
              if(count>15){
                clearInterval(event);
              }
            }, 2000);
          }
        }
        else{
          const hide = message.error("镜像不存在，下载中...",0);
          let data=yield response.json();
          let information=data["message"];
          if(information.indexOf("No such image")!==-1) {
            const group = self.environment.split(":");
            const image = group[0];
            const tag = group[1];
            url = `${docker_endpoint}/images/create?fromImage=${image}&tag=${tag}`;
            response = yield fetch(url, {method: 'POST', mode: 'cors'});
            status = response.status;
            setTimeout(hide, 100);
            if (status === 200) {
              message.success("镜像下载完毕，请刷新!",0);
            }
            else {
              const information = yield response.json();
              message.error(`镜像下载失败:${information["message"]}`,10);
            }
          }
        }

      } catch (e) {
        console.log(e)
      }
    });

    const removeContainer =flow(function* () {
      try {
        const docker_endpoint=self.docker_endpoint===''?self.store.docker_endpoint:self.docker_endpoint;
        let url=`${docker_endpoint}/containers/${self.container_id}?v=true&force=true`;
        yield fetch(url, {method: 'DELETE',mode: 'cors'});
      } catch (e) {
        console.log(e)
      }
    });

    return {
      createContainer,
      removeContainer,
      setCodeUrl(url) {
        self.vscodeUrl = url;
      },
      afterCreate() {
        self.terminals.push({})
      },
      clearContainer() {
        self.terminals = [{}]
      },
      setTitle(title) {
        self.title = title;
      },
      setDescription(desc) {
        self.description = desc;
      },
      setContainerId(id) {
        self.container_id = id;
      },
      addTerminal() {
        self.terminals.push({})
      },
      setCreated(flag) {
        self.creating = flag
      },
      setWsAddr(addr) {
        self.ws_addr = addr;
      },
      setImage(image) {
        self.environment = image;
      },
      setStepIndex(idx) {
        self.step_index = idx;
        self.steps[self.step_index].beforeStep();
      }
    }
  });

