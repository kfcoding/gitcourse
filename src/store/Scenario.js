import {types, flow, getRoot, getSnapshot, getParent} from 'mobx-state-tree';
import {Step} from "./Step";
import {Terminal} from "./Terminal";

export const Scenario = types
  .model('Scenario', {
    title: '',
    description: '',
    environment: '',
    enableDesktop: false,
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
      self.steps.map(s => wc += s.content.length);
      return Math.ceil(wc / 360);
    }
  })).actions(self => {

    const createContainer = flow(function* () {
      try {
        fetch(self.store.docker_endpoint + '/containers/create', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            Image: self.environment,
            Entrypoint: "/bin/sh",
            // Cmd: [""],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            OpenStdin: true,
            ExposedPorts: {
              "5678/tcp": {},
              "8888/tcp": {}
            },
            HostConfig: {
              Privileged: self.privileged || false,
              PublishAllPorts: true,
              Binds: self.binds
            }
          })
        }).then(resp => resp.json())
          .then(data => {
            self.setContainerId(data.Id);
            self.terminals[0].setContainerId(data.Id);
            fetch(self.store.docker_endpoint + '/containers/' + data.Id + '/start', {
              method: 'POST'
            }).then(() => {
              self.steps[self.stepIndex].beforestep()
              let socket = new WebSocket('ws' + self.store.docker_endpoint.substr(4) + '/containers/' + data.Id + '/attach/ws?logs=1&stream=1&stdin=1&stdout=1&stderr=1');
              self.terminals[0].terminal.attach(socket, true, true);
              socket.onopen = () => socket.send("\n");
              self.setCreated(true);

            })

          });
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
        self.steps[self.stepIndex].beforestep()
      }
    }
  });

