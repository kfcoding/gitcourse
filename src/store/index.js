import {flow,types} from 'mobx-state-tree';
import * as browserfs from "browserfs";
import * as pify from "pify";
import * as git from "isomorphic-git";
import {message} from 'antd';
import {Course} from "./Course";
import {Project} from "./Project";

let docker_eps = window._env_.DOCKER_ENDPOINT.split(',');

export const Store = types.model('Store', {
  repo: window.location.hash.substr(1),
  docker_endpoint: docker_eps[Math.floor(Math.random()*docker_eps.length)],
  course: types.optional(Course, {}),
  project:types.optional(Project, {}),
}).volatile(self => ({
  bfs: {},
  pfs: {},
  loading: true,
  completeIndex: localStorage.getItem( `${encodeURIComponent(self.repo)}/completeIndex`) || 0
})).views(self => ({
  get dir() {
    return encodeURIComponent(self.repo)
  }
})).actions(self => {

  const fetchCourse = flow(function* () {
    try {
      yield self.pfs.readFile(`${self.dir}/course.json`);
    } catch (e) {
      yield git.clone({
        dir: self.dir,
        corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
        url: self.repo,
        singleBranch: true,
        depth: 1
      });
    }
    let data = yield self.pfs.readFile(`${self.dir}/course.json`);
    self.course = JSON.parse(data.toString());
    self.course.preloadData();
    self.loading = false;
  });

  const updateCourse= flow(function* () {
    try {
      yield git.listFiles({dir: self.dir, ref: 'master'})
    } catch (e) {
      return
    }
    let files = yield git.listFiles({dir: self.dir, ref: 'master'});
    let modified = false;
    if (files) {
      for (let i = 0; i < files.length; i += 1) {
        const file = files[i];
        const status = yield git.status({dir: self.dir, filepath: file});
        if (status !== "unmodified") {
          modified = true;
          break;
        }
      }
    }
    if (!modified) {
      yield git.pull({
        dir: self.dir,
        ref: 'master',
        fastForwardOnly: true,
        singleBranch: true
      });
      try {
        // let data = yield self.pfs.readFile(`${self.dir}/course.json`);
        // self.course = JSON.parse(data.toString());
        // self.course.preloadData();
        message.info("课程已同步");
      } catch (e) {
        message.error("配置文件不合法!",3);
      }
    }
    else{
      message.info("因未提交修改，暂停同步",6);
    }
  });

  const getCourse= flow(function* () {
    try {
      let data = yield self.pfs.readFile(`${self.dir}/course.json`);
      self.course = JSON.parse(data.toString());
      self.course.preloadData();
    } catch (e) {
      message.error("配置文件不合法!",3);
    }
  });

  const initFs= flow(function* () {
    yield pify(browserfs.configure)({fs: "IndexedDB", options: {}});
    const fs=browserfs.BFSRequire('fs');
    self.bfs = fs;
    self.pfs = pify(fs);
    git.plugins.set('fs',fs);
  });

  return ({
    afterCreate: flow(function* () {
      yield initFs();
      yield fetchCourse();
    }),
    setCompleteIndex: index => {
      self.completeIndex = index;
      localStorage.setItem(`${self.dir}/completeIndex`, index)
    },
    getCourse,
    updateCourse,
    initFs
  })
});
