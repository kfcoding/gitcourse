import {types, flow, getRoot, getParent} from 'mobx-state-tree';

export const Step = types
  .model('Step', {
    title: '',
    text: '',
    content: '',
    check: '',
    preload: '',
    program: '',
    extraTab: ''
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
      let url=`${self.store.docker_endpoint}/containers/${getParent(self, 2).container_id }/exec`;
      let response=yield fetch( url,{
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
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
      url=`${self.store.docker_endpoint}/exec/${data.Id}/start`;
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

    const getHostPort = flow(function* (port) {
      let url=`${self.store.docker_endpoint}/containers/${getParent(self, 2).container_id}/json`;
      let response=yield fetch( url, {method: 'GET'});
      let data=yield response.json();
      return data.NetworkSettings.Ports[port.substr(1) + '/tcp'][0].HostPort;
    });

    const getExtraTabUrl = flow(function* () {
      let extraTab = self.extraTab;
      const path = extraTab.substr(extraTab.indexOf('/'));
      const host = self.store.docker_endpoint.match(/(http:\/\/).+?(?=:)/)[0];
      var matches = extraTab.match(/\[(.+?)]/mg);
      if (matches && matches.length > 0) {
        if (matches[0] === "[domain]") {console.log(matches[1].substr(1, matches[1].lastIndexOf(']')));
          let port = yield getHostPort(matches[1].substr(1, matches[1].lastIndexOf(']') - 1));
          setTimeout(() => {
            self.setExtraTab(`${host}:${port}${path}`);
          }, 4000);
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
        let url=`${self.store.docker_endpoint}/containers/${getParent(self, 2).container_id}/exec`;
        let response = yield fetch( url, {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
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
        url=`${self.store.docker_endpoint}/exec/${data.Id}/start`;
        yield fetch(url, {
          method: 'POST',
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
