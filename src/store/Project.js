import {types, flow, getRoot} from 'mobx-state-tree';

export const Project = types
  .model('Project', {

  }).volatile(self => ({

  })).views(self => ({
    get store() {
      return getRoot(self);
    }
  })).actions(self => {

    const fetchFileTree = flow(function* () {
      self.store.pfs.readdir(`${self.store.dir}`,{withFileTypes:true},function(err,files){
        if(err){
          return [];
        }
        return (files);
      });
    });

    return {
      fetchFileTree,
    }
  });