docker build -t $DOCKER_IMAGE .

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker push $DOCKER_IMAGE

curl $UPDATE_HOOK