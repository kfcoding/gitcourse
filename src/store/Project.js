import {types, flow, getRoot} from 'mobx-state-tree';

export const Project = types
  .model('Project', {

  }).volatile(self => ({

  })).views(self => ({
    get store() {
      return getRoot(self);
    }
  })).actions(self => {

    const init = flow(function* () {
    });

    return {
      afterCreate: flow(function* () {
      }),
    }
  });