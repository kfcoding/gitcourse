<p align="center"><img src="https://kfcoding-static.oss-cn-hangzhou.aliyuncs.com/kfcoding-book-cover/gitcourseguid.png"/></p>

<h1 align="center">Gitcourse</h1>

A front framework which can present courses made by repositories.  

Here is a sample as well as a guide to this project: [gitcourse-guide](http://gitcourse.kfcoding.com/#https://code.kfcoding.com/liuchangfreeman/gitcourse-guide.git)

## Before start

This project relies on **bash**.   

For windows uses, you need to install [Windows Subsystem for Linux](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10) first.  

## 
### 1、Install **npm**
For ubuntu users(include WSL):
```bash
apt-get install nodejs npm
```
For macos users:
```bash
brew install nodejs npm
```
### 2、Install **yarn** && **webpack**
```bash
npm install yarn webpack -g
```
### 3、Install project packages
```bash
cd gitcourse
yarn install
```
### 4、Start a webpack-server
```bash
DOCKER_ENDPOINT=http://docker.kfcoding.com:20375/v1.24 GIT_CORS=http://code.kfcoding.com:8081 npm run start
```

Now you can access the gitcourse on [localhost:3000](http://127.0.0.1:3000).  

If you have a general question about Gitcourse or some suggestions about Gitcourse we encourage you to post on our [slack workspace](https://app.slack.com/client/TPD8HAVMW/CPFELS1AA) . The maintainers and other community members are glad to talk with you.
