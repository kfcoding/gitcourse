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
    }
    catch (e) {
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
    try {
      yield self.pfs.readFile(`origin_${self.dir}/course.json`);
    }
    catch (e) {
      yield git.clone({
        dir: `origin_${self.dir}`,
        corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
        url: self.repo,
        singleBranch: true,
        depth: 1
      });
    }
  });

  const updateCourse= flow(function* () {
    const dir=self.dir;
    try {
      yield git.listFiles({dir: `origin_${dir}`, ref: 'master'})
    } catch (e) {
      return
    }
    const FILE = 0, HEAD = 1, WORKDIR = 2;
    const filepaths = (yield git.statusMatrix({ dir }))
      .filter(row => row[HEAD] !== row[WORKDIR])
      .map(row => row[FILE]);
    if (filepaths.length===0) {
      const depth=5;
      let commits = yield git.log({ dir: `origin_${dir}`, depth: depth, ref: 'master' });
      const commitsOrigin=new Set(commits.map(commit=>commit["oid"]));
      commits = yield git.log({ dir: dir, depth: depth, ref: 'master' });
      let commitsNew=[];
      for(const commit of commits){
        if(!commitsOrigin.has(commit["oid"])){
          commitsNew.push(commit);
        }
      }
      if(commitsNew.length===0){
        yield git.pull({
          corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
          dir: dir,
          ref: 'master',
          fastForwardOnly: true,
          singleBranch: true
        });
        commits = yield git.log({ dir: dir, depth: depth, ref: 'master' });
        commitsNew=[];
        for(const commit of commits){
          if(!commitsOrigin.has(commit["oid"])){
            commitsNew.push(commit);
          }
        }
        if(commitsNew.length>0){
          yield git.pull({
            corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
            dir: `origin_${dir}`,
            ref: 'master',
            fastForwardOnly: true,
            singleBranch: true
          });
          message.info("课程已同步");
        }
        else{
          message.info("课程已是最新!");
        }
      }
      else{
        message.info("因未提交commits，暂停同步",6);
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
