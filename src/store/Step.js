import {types, flow, getRoot, getParent} from 'mobx-state-tree';

export const Step = types
  .model('Step', {
    title: '',
    text: '',
    content: '',
    check: '',
    preload: '',
    program: '',
    extraTab: '',
    oj:''
  }).volatile(self => ({
    passed: false,
    extraTabUrl: ''
  })).views(self => ({
    get store() {
      return getRoot(self);
    }
  })).actions(self => {

    const fetchText = flow(function* () {
      let file = yield getRoot(self).pfs.readFile(`${getRoot(self).dir}/${self.text}`);
      self.content = file.toString();
    });

    const checkStep = flow(function* (cb) {
      if (self.passed) {
        return true;
      }
      if (self.check === '') {
        self.passed = true;
        return true;
      }
      let file = yield self.store.pfs.readFile(`${self.store.dir}/${self.check}`);
      let script = file.toString();
      const docker_endpoint=getParent(self, 2).docker_endpoint;
      const dockerEndpoint=docker_endpoint===''?self.store.dockerEndpoint:docker_endpoint;
      let url=`${dockerEndpoint}/containers/${getParent(self, 2).containerId }/exec`;
      let response=yield fetch( url,{
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
          "AttachStdin": true,
          "AttachStdout": true,
          "AttachStderr": true,
          "Cmd": ["bash", "-c", script],
          "DetachKeys": "ctrl-p,ctrl-q",
          "Privileged": true,
          "Tty": true,
        })
      });
      let data=yield response.json();
      url=`${dockerEndpoint}/exec/${data.Id}/start`;
      response=yield fetch( url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Detach: false,
          Tty: true
        })
      });
      data=yield response.text();
      self.setPassed(data !== '');
      return self.passed;
    });

    const getHostPort = flow(function* () {
      const docker_endpoint=getParent(self, 2).docker_endpoint;
      const dockerEndpoint=docker_endpoint===''?self.store.dockerEndpoint:docker_endpoint;
      let url=`${dockerEndpoint}/containers/${getParent(self, 2).containerId}/json`;
      let response=yield fetch( url, {method: 'GET',mode:'cors'});
      let data=yield response.json();
      return data.NetworkSettings.Ports;
    });

    const getExtraTabUrl = flow(function* () {
      const extraTab = self.extraTab;
      const scenario=getParent(self, 2);
      const path = extraTab.substr(extraTab.indexOf('/'));
      const docker_endpoint=getParent(self, 2).docker_endpoint;
      const dockerEndpoint=docker_endpoint===''?self.store.dockerEndpoint:docker_endpoint;
      const host = dockerEndpoint.match(/(http:\/\/).+?(?=:)/)[0];
      const stepIndex=scenario.stepIndex;
      var matches = extraTab.match(/\[(.+?)]/mg);
      if (matches && matches.length > 0) {
        if (matches[0] === "[domain]") {
          const port=yield getHostPort();
          const portOrigin=matches[1].substr(2, matches[1].lastIndexOf(']') - 2);
          console.log(port);
          console.log(portOrigin);
          const extraTabUrlPort=port[`${portOrigin}/tcp`][0].HostPort;
          if(stepIndex===0){
            setTimeout(() => {
              self.setExtraTab(`${host}:${extraTabUrlPort}${path}`);
            }, 4000);
          }
          else{
            self.setExtraTab(`${host}:${extraTabUrlPort}${path}`);
          }
        }
        else {
          self.setExtraTab(extraTab);
        }
      }
      else {
        self.setExtraTab(extraTab);
      }
      console.log("extraTab", self.extraTabUrl);
    });

    const beforeStep = flow(function* (cb) {
      if (self.program) {
        let file = yield self.store.pfs.readFile(`${self.store.dir}/${self.program}`);
        let script = file.toString();
        const docker_endpoint=getParent(self, 2).docker_endpoint;
        const dockerEndpoint=docker_endpoint===''?self.store.dockerEndpoint:docker_endpoint;
        let url=`${dockerEndpoint}/containers/${getParent(self, 2).containerId}/exec`;
        let response = yield fetch( url, {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          mode: 'cors',
          body: JSON.stringify({
            "AttachStdin": true,
            "AttachStdout": true,
            "AttachStderr": true,
            "Cmd": ["sh", "-c", script],
            "DetachKeys": "ctrl-p,ctrl-q",
            "Privileged": true,
            "Tty": true,
          })
        });
        let data =yield response.json();
        url=`${dockerEndpoint}/exec/${data.Id}/start`;
        yield fetch(url, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            Detach: false,
            Tty: true
          })
        })
      }
      getExtraTabUrl();
    });

    const preloadStep = flow(function* () {
      if (self.preload === '') {
        return
      }
      let file = yield self.store.pfs.readFile(`${self.store.dir}/${self.preload}`);
      let script = file.toString();
      try {
        // eslint-disable-next-line no-eval
        eval(script);
      } catch (e) {
        console.log(e)
      }
    });

    return {
      afterCreate() {
        fetchText()
      },
      setTitle(title) {
        self.title = title;
      },
      setPassed(flag) {
        self.passed = flag;
      },
      setExtraTab(addr) {
        self.extraTabUrl = addr;
      },
      checkStep: checkStep,
      preloadStep: preloadStep,
      beforeStep: beforeStep
    }
  });
