import {getParent, getRoot, types} from 'mobx-state-tree';
import {Terminal as Xterm} from 'xterm';
import * as fit from "xterm/lib/addons/fit/fit";
import * as attach from 'xterm/lib/addons/attach/attach';

Xterm.applyAddon(fit);
Xterm.applyAddon(attach);

export const Terminal = types
  .model('Terminal', {
    id: types.optional(types.identifier, new Date().getTime() + ''),
    name: 'tt',
    containerId: '',
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

    function afterCreate() {
      self.terminal = new Xterm({
        fontSize: 16,
        // theme:{
        //   foreground:'#000',
        //   background: '#fff',
        //   cursor:'#000',
        //   cursorAccent:'#fff',
        //   selection:'rgba(128,128,128,0.3)'
        // }
      });
    }

    return {
      afterCreate,
      setContainerId: id => {
        self.containerId = id
      },
      resize: (w, h) => {
        const url=`${getRoot(self).dockerEndpoint}/containers/${self.containerId}/resize?h=${h}&w=${w}`;
        return fetch(url, {method: 'POST',mode: 'cors'})
      }
    }
  });
