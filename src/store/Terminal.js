import {types, flow, getRoot, getParent} from 'mobx-state-tree';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import * as attach from 'xterm/lib/addons/attach/attach';

Xterm.applyAddon(fit);
Xterm.applyAddon(attach);

export const Terminal = types
  .model('Terminal', {
    id: types.optional(types.identifier, new Date().getTime() + ''),
    name: 'tt',
  }).volatile(self => ({
    terminal: {}
  })).views(self => ({
    get store() {
      return getRoot(self)
    },
    get scenario() {
      return getParent(self, 2);
    }
  })).actions(self => {
    let terminal = null;
    let socket = () => getParent(self, 2).socket;

    function afterCreate() {
      terminal = new Xterm({
        fontSize: 16
      });
      self.terminal = terminal;
      // terminal.on('data', d=>console.log(d));
      // terminal.on('key', (key, ev) => {
      //   self.scenario.socket.emit('term.input', {id: '123', input: key});
      // });
      // terminal.on('resize', ({cols, rows}) => {
      //   // socket && socket.emit('terminal-resize', {cols: cols, rows: rows})
      // })
    }

    function beforeDestroy() {
      // if (socket != null) socket.emit('term.close', {id: self.id})
    }

    function exc(path) {
      // var excInput = 'g++ main.cpp -o main && ./main\n'
      var excInput;
      var array = path.split('.');
      if (array[array.length - 1] === 'cpp') {
        excInput = 'g++ ' + path + ' -o /tmp/out.o && /tmp/out.o\n';
      } else if (array[array.length - 1] === 'py') {
        excInput = 'python ' + path + '\n';
      } else {
        alert("不是合法文件");
      }
      socket.emit('term.input', {id: self.id, input: excInput})
    }

    return {
      exc,
      afterCreate,
      beforeDestroy
    }
  });
