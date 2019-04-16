import {types, flow, getRoot, getSnapshot} from 'mobx-state-tree';
import {Step} from "./Step";
import {Terminal} from "./Terminal";

export const Scenario = types
  .model('Scenario', {
    title: '',
    description: '',
    environment: '',
    steps: types.array(Step),
    terminals: types.array(Terminal),
  }).volatile(self => ({
    socket: {},
    visited: false,
    complete: false,
    container_id: ''
  })).views(self => ({
    get store() {
      return getRoot(self);
    }
  })).actions(self => {

    function setSocket(socket) {
      self.socket = socket;
    }

    const createContainer = flow(function* () {
      try {
        fetch(self.store.docker_endpoint + '/containers/create', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            Image: self.environment,
            Cmd: ["bash"],
            AttachStdin: true,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            OpenStdin: true
          })
        }).then(resp => resp.json())
          .then(data => {
            self.setContainerId(data.Id);
            fetch(self.store.docker_endpoint + '/containers/' + data.Id + '/start', {
              method: 'POST'
            }).then(() => {
              let socket = new WebSocket('ws' + self.store.docker_endpoint.substr(4) + '/containers/' + data.Id + '/attach/ws?logs=1&stream=1&stdin=1&stdout=1&stderr=1');
              self.terminals[0].terminal.attach(socket, true, true);
              socket.onopen = () => socket.send("\n")
            })
          });


      } catch (e) {
        console.log(e)
      }
    })

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
      setVisited(flag) {
        self.visited = flag;
      }
    }
  });

