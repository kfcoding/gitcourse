import {flow,types} from 'mobx-state-tree';
import * as browserfs from "browserfs";
import * as pify from "pify";
import * as git from "isomorphic-git";
import {message} from 'antd';
import {Course} from "./Course";

export const Store = types.model('Store', {
  course: types.optional(Course, {})
}).volatile(self => ({
  bfs: {},
  pfs: {},
  repo:'',
  dockerEndpoint:'',
  corsProxy:'',
  isFull:false,
  showGuide:true,
  loading: true,
  currentIndex:-1,
  completeIndex: 0
})).views(self => ({
  get dir() {
    return encodeURIComponent(self.repo)
  }
})).actions(self => {

  const fetchCourse = flow(function* () {
    let isRepoCloned= localStorage.getItem( `${encodeURIComponent(self.repo)}/isRepoCloned`);
    if(isRepoCloned===null){
      localStorage.setItem( `${encodeURIComponent(self.repo)}/isRepoCloned`,false);
      isRepoCloned=false;
    }
    else{
      isRepoCloned=isRepoCloned==="true";
    }
    if(!isRepoCloned) {
      let corsProxy='';
      if(self.corsProxy===''){
        corsProxy= 'https://cors.isomorphic-git.org';
      }
      else{
        corsProxy=self.corsProxy;
      }
      try{
        try{
          yield git.clone({
            dir: self.dir,
            corsProxy: corsProxy,
            url: self.repo,
            singleBranch: true,
            depth: 1
          });
        }
        catch (e) {
          try{
            yield git.pull({
              dir: self.dir,
              corsProxy: corsProxy,
              url: self.repo,
              singleBranch: true,
              depth: 1
            });
          }catch (e) {
          }
        }
        localStorage.setItem( `${encodeURIComponent(self.repo)}/isRepoCloned`,true);
      }
      catch (e) {
        localStorage.setItem( `${encodeURIComponent(self.repo)}/isRepoCloned`,false);
        message.error("课程拉取失败，请刷新后重试!");
      }
    }
    try{
      let data = yield self.pfs.readFile(`${self.dir}/course.json`);
      self.course = JSON.parse(data.toString());
      self.course.preloadData();
      self.loading = false;
    }
    catch (e) {
      message.error("课程读取发生异常,请联系课程作者!");
      localStorage.setItem( `${encodeURIComponent(self.repo)}/isRepoCloned`,false);
    }
  });

  const updateCourse= flow(function* () {
    const dir=self.dir;
    try{
      localStorage.setItem( `${encodeURIComponent(self.repo)}/isRepoCloned`,false);
      let corsProxy='';
      if(self.corsProxy===''){
        corsProxy= 'https://cors.isomorphic-git.org';
      }
      else{
        corsProxy=self.corsProxy;
      }
      yield git.pull({
        dir: dir,
        corsProxy: corsProxy,
        url: self.repo,
        singleBranch: true,
        depth: 1
      });
      localStorage.setItem( `${encodeURIComponent(self.repo)}/isRepoCloned`,true);
    }
    catch (e) {
      localStorage.setItem( `${encodeURIComponent(self.repo)}/isRepoCloned`,false);
      message.error("课程拉取失败，请刷新后重试!",-1);
    }
  });

  const initCourse= flow(function* () {
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
      self.completeIndex =localStorage.getItem( `${encodeURIComponent(self.repo)}/completeIndex`)||0;
    }),
    setCompleteIndex: index => {
      self.completeIndex = index;
      localStorage.setItem(`${self.dir}/completeIndex`, index)
    },
    setCurrentIndex: index => {
      self.currentIndex = index;
    },
    setIsFull(flag) {
      self.isFull = flag
    },
    setShowGuide(flag) {
      self.showGuide=flag
    },
    setDockerEndpoint(data) {
      self.dockerEndpoint=data
    },
    setCorsProxy(data) {
      self.corsProxy=data
    },
    setRepo(data) {
      self.repo=data
    },
    getCourse: initCourse,
    updateCourse,
    initFs
  })
});