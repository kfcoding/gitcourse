program=/code-server
if [ ! -f "$program" ]; then
  cat /etc/issue|grep Alpine >/dev/null 2>&1
  if [ $? -eq 0 ]; then
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
    apk add --no-cache wget tar
    wget URL_CODE_SERVER_ALPINE
    tar -xvf code-server-alpine.tar
    mv code-server-alpine code-server
    rm -rf code-server-alpine.tar
  else
    apt-get install wget tar
    wget URL_CODE_SERVER
    tar -xvf code-server.tar
    rm -rf code-server.tar
  fi
fi
chmod 777 /code-server
/code-server --auth none --host 0.0.0.0 --port