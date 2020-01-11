FROM node:12-alpine

USER root
ADD ./docker/initdb.sql /docker-entrypoint-initdb.d

WORKDIR /home/app/

# Setup server
RUN npm install -g yarn npx
COPY package.json .
ADD . /home/app/
RUN npm install --silent
RUN cd ./mys3-client && npm install --silent
EXPOSE 1337 8181

COPY ./docker/start.sh /home/app/start.sh
RUN chmod +x /home/app/start.sh
CMD /bin/sh /home/app/start.sh
