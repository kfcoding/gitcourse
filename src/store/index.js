import {flow,types} from 'mobx-state-tree';
import * as browserfs from "browserfs";
import * as pify from "pify";
import * as git from "isomorphic-git";
import {message} from 'antd';
import {Course} from "./Course";
import {Project} from "./Project";

let dockerEndpoints = window._env_.DOCKER_ENDPOINT.split(',');

export const Store = types.model('Store', {
  repo: window.location.hash.substr(1),
  dockerEndpoint: dockerEndpoints[Math.floor(Math.random()*dockerEndpoints.length)],
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
    let isMainRepoExists= localStorage.getItem( `${encodeURIComponent(self.repo)}/isMainRepoExists`);
    if(isMainRepoExists===null){
      localStorage.setItem( `${encodeURIComponent(self.repo)}/isMainRepoExists`,false);
      isMainRepoExists=false;
    }
    else{
      isMainRepoExists=isMainRepoExists==="true";
    }
    if(!isMainRepoExists) {
      try{
        try{
          yield self.pfs.rmdir(self.dir);
        }
        catch (e) {
        }
        yield git.clone({
          dir: self.dir,
          corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
          url: self.repo,
          singleBranch: true,
          depth: 1
        });
        localStorage.setItem( `${encodeURIComponent(self.repo)}/isMainRepoExists`,true);
      }
      catch (e) {
        yield self.pfs.rmdir(self.dir);
        message.error("课程拉取失败，请刷新后重试!");
      }
    }
    let data = yield self.pfs.readFile(`${self.dir}/course.json`);
    self.course = JSON.parse(data.toString());
    self.course.preloadData();
    self.loading = false;
    let isOriginRepoExists=localStorage.getItem( `${encodeURIComponent(self.repo)}/isOriginRepoExists`);
    if(isOriginRepoExists===null){
      localStorage.setItem(`${encodeURIComponent(self.repo)}/isOriginRepoExists`,false);
      isOriginRepoExists=false;
    }
    else{
      isOriginRepoExists=isOriginRepoExists==="true";
    }
    if(!isOriginRepoExists) {
      try{
        try{
          yield self.pfs.rmdir(`origin_${self.dir}`);
        }
        catch (e) {
        }
        yield git.clone({
          dir: `origin_${self.dir}`,
          corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
          url: self.repo,
          singleBranch: true,
          depth: 1
        });
        localStorage.setItem( `${encodeURIComponent(self.repo)}/isOriginRepoExists`,true);
        console.log("origin cloned");
      }
      catch (e) {
        yield self.pfs.rmdir(`origin_${self.dir}`);
        message.error("课程更新失败，请刷新后重试!",-1);
      }
    }
  });

  const updateCourse= flow(function* () {
    const dir=self.dir;
    let isOriginRepoExists= localStorage.getItem( `${encodeURIComponent(self.repo)}/isOriginRepoExists`);
    if(isOriginRepoExists===null){
      localStorage.setItem(`${encodeURIComponent(self.repo)}/isOriginRepoExists`,false);
      isOriginRepoExists=false;
    }
    else{
      isOriginRepoExists=isOriginRepoExists==="true";
    }
    if(!isOriginRepoExists){
      return;
    }
    const FILE = 0, HEAD = 1, WORKDIR = 2;
    const filepaths = (yield git.statusMatrix({ dir }))
      .filter(row => row[HEAD] !== row[WORKDIR])
      .map(row => row[FILE]);
    if (filepaths.length===0) {
      const depth=3;
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
        try{
          localStorage.setItem( `${encodeURIComponent(self.repo)}/isOriginRepoExists`,false);
          try{
            yield self.pfs.rmdir(`origin_${self.dir}`);
          }
          catch (e) {
          }
          yield git.clone({
            dir: `origin_${self.dir}`,
            corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
            url: self.repo,
            singleBranch: true,
            depth: 1
          });
          localStorage.setItem( `${encodeURIComponent(self.repo)}/isOriginRepoExists`,true);
        }
        catch (e) {
        }
        commits = yield git.log({ dir: dir, depth: depth, ref: 'master' });
        commitsNew=[];
        for(const commit of commits){
          if(!commitsOrigin.has(commit["oid"])){
            commitsNew.push(commit);
          }
        }
        if(commitsNew.length>0){
          try{
            localStorage.setItem( `${encodeURIComponent(self.repo)}/isMainRepoExists`,false);
            try{
              yield self.pfs.rmdir(dir);
            }
            catch (e) {
            }
            yield git.clone({
              dir: dir,
              corsProxy: window._env_.GIT_CORS || 'https://cors.isomorphic-git.org',
              url: self.repo,
              singleBranch: true,
              depth: 1
            });
            localStorage.setItem( `${encodeURIComponent(self.repo)}/isMainRepoExists`,true);
            message.info("课程已更新，请刷新!");
          }
          catch (e) {
            yield self.pfs.rmdir(dir);
            message.error("课程更新失败，请刷新后重试!",-1);
          }
        }
      }
    }
  });

  const getCourse= flow(function* () {
    try {
      let data = yield self.pfs.readFile(`${self.dir}/course.json`);
      self.course = JSON.parse(data.toString());
      self.course.preloadData();
    } catch (e) {
      message.error("课程配置文件不合法!",3);
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
