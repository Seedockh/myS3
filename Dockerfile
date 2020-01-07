FROM node:12-alpine

USER root
RUN npm install -g yarn
ENV NODE_ENV dev

# Setup server
WORKDIR /home/app/mys3-server
COPY package.json .
RUN npm install
ADD . /home/app/mys3-server
CMD ["yarn", "dev"]
EXPOSE 1337

#RUN cd ./mys3-client/

# Setup client
#WORKDIR /home/app/mys3-client
#COPY mys3-client/package.json .
#RUN npm install
#ADD ./mys3-client /home/app/mys3-client
#CMD ["yarn", "serve"]
#EXPOSE 8181
