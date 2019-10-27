import {types, flow, getRoot, getSnapshot} from 'mobx-state-tree';
import {Scenario} from "./Scenario";

export const Course = types
  .model('Course', {
    title: '',
    description: '',
    author: '',
    preload: '',
    scenarios: types.array(Scenario)
  }).views(self => ({
    get needTime() {
      let time = 0;
      self.scenarios.map(scenario => time += scenario.needTime);
      return time
    }
  })).actions(self => {

    const preloadData = flow(function* () {
      if (self.preload === '') {
        return
      }
      let file = yield getRoot(self).pfs.readFile(`${getRoot(self).dir}/${self.preload}`);
      let script = file.toString();
      eval(script);
    });

    return {
      afterCreate() {
      },
      setTitle(title) {
        self.title = title;
      },
      setDescription(desc) {
        self.description = desc;
      },
      setAuthor(author) {
        self.author = author;
      },
      preloadData: preloadData
    }
  });
