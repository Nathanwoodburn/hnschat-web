#!/bin/bash

docker build -t hnschat-web .
docker tag hnschat-web git.woodburn.au/nathanwoodburn/hnschat-web:latest
docker push git.woodburn.au/nathanwoodburn/hnschat-web:latest