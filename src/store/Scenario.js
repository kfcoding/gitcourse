import {types, flow, getRoot, getSnapshot, getParent} from 'mobx-state-tree';
import {Step} from "./Step";
import {Terminal} from "./Terminal";

export const Scenario = types
    .model('Scenario', {
        title: '',
        description: '',
        environment: '',
        shell:'/bin/sh',
        docker_endpoint:'',
        hidden_ports:types.array(types.string),
        binds: types.array(types.string),
        privileged: false,
        steps: types.array(Step),
        terminals: types.array(Terminal),
    }).volatile(self => ({
        container_id: '',
        ws_addr: '',
        created: false,
        stepIndex: 0
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
                const docker_endpoint=self.docker_endpoint===''?self.store.docker_endpoint:self.docker_endpoint;
                const exposed_ports=self.hidden_ports.includes("5678/tcp")? {
                    "8888/tcp": {}
                }: {
                    "5678/tcp": {},
                    "8888/tcp": {}
                };
                let url=`${docker_endpoint}/containers/create`;
                let response=yield fetch(url, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        Image: self.environment,
                        Entrypoint: self.shell,
                        // Cmd: [""],
                        Labels:{
                          "kfcoding-auto-delete": "true"
                        },
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
                const data=yield  response.json();
                self.setContainerId(data.Id);
                self.terminals[0].setContainerId(data.Id);
                url=`${docker_endpoint}/containers/${data.Id}/start`;
                yield fetch( url, {method: 'POST'});
                self.steps[self.stepIndex].beforeStep();
                url=`ws${docker_endpoint.substr(4)}/containers/${data.Id}/attach/ws?logs=1&stream=1&stdin=1&stdout=1&stderr=1`;
                let socket = new WebSocket(url);
                self.terminals[0].terminal.attach(socket, true, true);
                socket.onopen = () => socket.send("\n");
                self.setCreated(true);
            } catch (e) {
                console.log(e)
            }
        });

        return {
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
            createContainer,
            setContainerId(id) {
                self.container_id = id;
            },
            addTerminal() {
                self.terminals.push({})
            },
            setCreated(flag) {
                self.created = flag
            },
            setWsAddr(addr) {
                self.ws_addr = addr;
            },
            setStepIndex(idx) {
                self.stepIndex = idx;
                self.steps[self.stepIndex].beforeStep()
            }
        }
    });

