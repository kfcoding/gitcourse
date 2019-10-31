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
    container_id: '',
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
    function afterCreate() {
      terminal = new Xterm({fontSize: 16});
      self.terminal = terminal;
    }

    return {
      afterCreate,
      setContainerId: id => self.container_id = id,
      resize: (w, h) => {
        const url=`${getRoot(self).docker_endpoint}/containers/${self.container_id}/resize?h=${h}&w=${w}`;
        return fetch(url, {
          method: 'POST',mode: 'cors'
        })
      }
    }
  });
