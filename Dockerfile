FROM node:18-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app

RUN yarn -D

COPY . /usr/src/app

RUN yarn build

CMD [ "yarn", "start" ]