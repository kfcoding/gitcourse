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
    hideTerminal: false
  }).volatile(self => ({
    passed: false,
    extraTabUrl: ''
  })).views(self => ({
    get store() {
      return getRoot(self);
    }
  })).actions(self => {
    const fetchText = flow(function* () {
      let data = yield getRoot(self).pfs.readFile(getRoot(self).dir + '/' + self.text);
      self.content = data.toString();
    });

    const checkstep = flow(function* (cb) {
      if (self.passed) {
        return true;
      }
      if (self.check === '') {
        self.passed = true;
        return true;
      }
      let checkfile = yield self.store.pfs.readFile(self.store.dir + '/' + self.check);
      let bash_str = checkfile.toString();
      return fetch(self.store.docker_endpoint + '/containers/' + getParent(self, 2).container_id + '/exec', {
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          "AttachStdin": true,
          "AttachStdout": true,
          "AttachStderr": true,
          "Cmd": ["bash", "-c", bash_str],
          "DetachKeys": "ctrl-p,ctrl-q",
          "Privileged": true,
          "Tty": true,
        })
      }).then(resp => resp.json())
        .then(data => {
          return fetch(self.store.docker_endpoint + '/exec/' + data.Id + '/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              Detach: false,
              Tty: true
            })
          }).then(resp => resp.text())
            .then(d => {
              self.setPassed(d !== '');
              return self.passed;
            })
        });
    });

    const getPort = flow(function* (cb) {
      return fetch(self.store.docker_endpoint + '/containers/' + getParent(self, 2).container_id + '/json', {
        method: 'GET'
      }).then(resp => resp.json())
        .then(data => {

          let desktop_port = data.NetworkSettings.Ports['8888/tcp'][0].HostPort;
          let extratab = self.extraTab;
          const path = extratab.substr(extratab.indexOf('/'));
          const host = self.store.docker_endpoint.match(/(?<=http:\/\/).+?(?=:)/)[0];
          var matches = extratab.match(/(?<=\[).+?(?=])/mg);
          if (matches && matches.length > 0) {
            if (matches[0] === "domain") {
              self.setExtraTab(`http://${host}:${desktop_port}${path}`);
            }
            else {
              self.setExtraTab(`${matches[0]}${matches[1]}${path}`);
            }
          }
          console.log("extraTab", self.extraTab);
        })
    });

    const getHostPort = flow(function* (port) {
      return fetch(self.store.docker_endpoint + '/containers/' + getParent(self, 2).container_id + '/json', {
        method: 'GET'
      }).then(resp => resp.json())
        .then(data => data.NetworkSettings.Ports[port.substr(1) + '/tcp'][0].HostPort)
    })

    const getExtraTabUrl = flow(function* () {
      let extratab = self.extraTab;
      const path = extratab.substr(extratab.indexOf('/'));
      const host = self.store.docker_endpoint.match(/(?<=http:\/\/).+?(?=:)/)[0];
      var matches = extratab.match(/(?<=\[).+?(?=])/mg);

      if (matches && matches.length > 0) {
        if (matches[0] === "domain") {
          let port = yield getHostPort(matches[1]);
          // setTimeout(() => {
            self.setExtraTab(`http://${host}:${port}${path}`);
          // }, 3000)

        }
        else {
          self.setExtraTab(`${matches[0]}${matches[1]}${path}`);
        }
      }
      console.log("extraTab", self.extraTabUrl);
    })

    const beforestep = flow(function* (cb) {
      if (self.program) {
        let programsfile = yield self.store.pfs.readFile(self.store.dir + '/' + self.program);
        let bash_str = programsfile.toString();
        let data = yield fetch(self.store.docker_endpoint + '/containers/' + getParent(self, 2).container_id + '/exec', {
          headers: {
            'Content-Type': 'application/json'
          },
          method: 'POST',
          body: JSON.stringify({
            "AttachStdin": true,
            "AttachStdout": true,
            "AttachStderr": true,
            "Cmd": ["sh", "-c", bash_str],
            "DetachKeys": "ctrl-p,ctrl-q",
            "Privileged": true,
            "Tty": true,
          })
        }).then(resp => resp.json());

        yield fetch(self.store.docker_endpoint + '/exec/' + data.Id + '/start', {
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

    const preloadstep = flow(function* () {
      if (self.preload === '') {
        return
      }
      let file = yield self.store.pfs.readFile(self.store.dir + '/' + self.preload);
      let script = file.toString();
      try {
        eval(script)
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
      checkstep: checkstep,
      preloadstep: preloadstep,
      inspectstep: getPort,
      beforestep: beforestep
    }
  });
