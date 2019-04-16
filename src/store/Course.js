import {types, flow, getRoot, getSnapshot} from 'mobx-state-tree';
import {Scenario} from "./Scenario";

export const Course = types
  .model('Course', {
    title: '',
    description: '',
    author: '',
    scenarios: types.array(Scenario)
  }).volatile(self => ({
    scenarioDirs: []
  })).actions(self => {
    // const fetchScenarios = flow(function* () {
    //   self.scenarios = [];
    //   for (let i in self.scenarioDirs) {
    //     try {
    //       let dir = self.scenarioDirs[i];
    //       let data = yield getRoot(self).pfs.readFile(dir + '/config.json');
    //       let config = JSON.parse(data.toString());
    //       let scenario = Scenario.create({
    //         dir: dir,
    //         title: config.title,
    //         description: config.description,
    //       });
    //       scenario.setStepDirs(config.steps);
    //       self.scenarios.push(scenario);
    //     } catch (e) {
    //       console.error(e);
    //     }
    //   }
    //
    //   Promise.all(self.scenarios.map(async s => {
    //     await s.fetchSteps();
    //   }))
    // })
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
      addScenario(scenario) {
        self.scenarios.push(scenario);
      },
      setScenarioDirs(dirs) {
        self.scenarioDirs = dirs;
      },
      // fetchScenarios,
      getProgress() {
        let vss = localStorage.getItem('visitedScenarios');
        if (!vss) {
          return 0;
        }
        return Math.floor(vss.length / self.scenarios.length)
      },
      setGroups(groups) {
        self.groups = groups;
      }
    }
  });
