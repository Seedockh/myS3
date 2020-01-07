FROM ubuntu:16.04

RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys B97B0AFCAA1A47F044F244A07FCC7D46ACCC4CF8

RUN echo "deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main" > /etc/apt/sources.list.d/pgdg.list

RUN apt-get update && apt-get install -y python-software-properties software-properties-common postgresql-9.3 postgresql-client-9.3 postgresql-contrib-9.3

USER postgres

RUN /etc/init.d/postgresql start &&\
    psql --command "CREATE USER mys3 WITH SUPERUSER PASSWORD 'mys3'" &&\
    psql --command "CREATE DATABASE mys3 OWNER mys3"

RUN echo "host  all   all       0.0.0.0/0     md5" >> /etc/postgresql/9.3/main/pg_hba.conf

RUN echo "listen_addresses='*'" >> /etc/postgresql/9.3/main/postgresql.conf

EXPOSE 5432

VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]

CMD ["/usr/lib/postgresql/9.3/bin/postgres", "-D", "/var/lib/postgresql/9.3/main", "-c", "config_file=/etc/postgresql/9.3/main/postgresql.conf"]


USER root
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_13.x  | bash -
RUN apt-get -y install nodejs
RUN npm install -g yarn

ENV ENV_NAME dev
ENV NODE_ENV dev

# Setup server
WORKDIR /usr/src/mys3-server
COPY package.json .
RUN npm install
ADD . /usr/src/mys3-server
CMD ["yarn", "dev"]
EXPOSE 1337

#RUN cd ./mys3-client/

# Setup client
#WORKDIR /usr/src/mys3-client
#COPY mys3-client/package.json .
#RUN npm install
#ADD ./mys3-client /usr/src/mys3-client
#CMD ["yarn", "serve"]
#EXPOSE 8181
