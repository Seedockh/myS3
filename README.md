# myS3
https://mys3.mhirba.now.sh/

# Authors
`Pierre Hérissé` && `Antoine Nivoy`

# Description
The goal here is to recreate an **`AWS S3`** docker container, working only locally, using **TypeScript** and **TypeORM**.

# Run with Docker

**`Dockerfile`** and **`docker-compose.yml`** are configured so you don't have any database configuration to deal with.

You'll just need 2 environment files :
- **.env.dev**
- **.env.testing**

Each one will follow this structure :
```console
NODE_ENV = dev_or_test
DB_HOST=localhost
DB_USER=mys3
DB_PASSWORD=mys3
DB_DATABASE=mys3_or_test_mys3
DB_PORT=5432
JWT_SECRET = some_secret
MAIL_USER = one_of_your_gmail_address
MAIL_PASSWORD = one_of_your_gmail_password
```

Once you have your 2 `.env` files, you're good to build & run the docker image :
```console
sudo docker-compose up --build
```

  `Note : Tests suite will run during the build so you can check if everything is alright and well covered.`

Then both server & client will be accessible :
  - Server on http://localhost:1337
  - Client on http://localhost:8181


# Databases

We're actually using **PostgreSQL** for handling databases.

You will need to create 2 databases :
  - 1 for **dev** environment
  - 1 for **testing** environment

For convenience, we advise you to name your database this way :
  - **dev** : `mys3`
  - **testing** : `test_mys3`

You can provide both `dev & testing` database names in environment files :
```console
DB_DATABASE= your_postgres_dev_or_test_database_name
```

## Windows Setup

On Windows, you might need to make sure of 2 steps :
- Create a SUPERUSER to manage your tables, like so : `psql -U postgres -c "CREATE ROLE mys3 LOGIN SUPERUSER INHERIT CREATEDB CREATEROLE;" mys3`
- Or if you need to update it to SUPERUSER : `psql -U postgres -c "ALTER ROLE mys3 WITH SUPERUSER"`
- You might also need to install `uuid-ossp`, compulsory for our project. To do so, just CREATE the extension like so :
   ```SQL
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

# Mailing service

For mailing, we're using `gmail` system. You'll need to use :
- One of your **`Gmail`** address
- The associated password
- Make sure you **_Grant the access to less secured applications_** in your Account Management panel / Security tab

You can provide both `email & password` in environment files :
```console
MAIL_USER = one_of_your_gmail_address
MAIL_PASSWORD = one_of_your_gmail_password
```

# Server-side Environment

You'll need 2 environment files :
- **.env.dev**
- **.env.testing**

Each one will follow this structure :
```console
NODE_ENV = dev_or_test
DB_HOST = localhost
DB_USER = your_postgres_user
DB_PASSWORD = your_postgres_password
DB_DATABASE= your_postgres_dev_or_test_database_name
DB_PORT = 5432
JWT_SECRET = some_secret
MAIL_USER = one_of_your_gmail_address
MAIL_PASSWORD = one_of_your_gmail_password
```

Server can now be started with :
```console
yarn dev
```

# Client-side Environment

The client is located at `/mys3-client/` and can be started with :
```console
npm install
#or
yarn install

yarn serve
```

It will be launched at http://localhost:8081/ with **VueJS** :
![https://image.noelshack.com/fichiers/2020/02/1/1578272919-screenshot-from-2020-01-06-02-08-16.png](https://image.noelshack.com/fichiers/2020/02/1/1578272919-screenshot-from-2020-01-06-02-08-16.png)


# Testing Environment

To run our testsuite, the **dev server** (`yarn dev`) needs to be **`shut down`** (with **`CTRL+C`** for instance).

Once it is closed, you can run this command in root directory :
```console
yarn test
```

This project has a **100% Tests coverage** :
![https://image.noelshack.com/fichiers/2020/02/1/1578272721-screenshot-from-2020-01-06-02-04-58.png](https://image.noelshack.com/fichiers/2020/02/1/1578272721-screenshot-from-2020-01-06-02-04-58.png)

# Steps
### .step_01
- [X] Bootstrap an API server using express and typeORM with Typescript + Babel
- [X] You HAVE TO use snakecase and lowercase table names
- [X] Setup tests with **Jest**
- [ ] Setup docker container

### .step_02
- [X] A user is described with: uuid, nickname, email, password
- [X] Bootstrap all CRUD user operations
- [x] You HAVE TO use JWT
- [x] You HAVE TO send an email on user creation
- [X] Add user password reset e-mail workflow

### interlude
- [X] The file structure on your computer will be ~/myS3DATA/$USER_UUID/$BUCKET_NAME/$BLOB_NAME

### .step_03
- [X] A bucket is describe with: id, name and belongs to a user
- [X] Create routes which allowshttp://localhost:8081/ to create, edit and delete a bucket
- [X] Create a route which allow to list all objects from a bucket
- [X] Create a route which allow to check if a bucket exist with a head method that return 200 or 400

### .step_04
- [X] An object or a blob is describe with: id, name, path, size and belongs to a bucket
- [X] Create routes which allows to add and delete a blob using the package multer
- [X] Create a route which allows to retrieve a blob
- [X] Create a route which allows to duplicate a blob by adding .copy.$NB before the file extension
- [X] Create a route which allow to get blob metadata. Infos: path and size

### .step_05
- [X] Create a simple web interface with Vue 😎
- [ ] Optimistic UI : make UI responding instantaneously generating front before backend response, display will change only if response is different than front UI

### .step_06
- [X] Your client has to handle all user API actions. _From the authentication to the upload through browsing buckets and files_

### .step_07
- [ ] You HAVE TO transform you application to handle Server-side Rendering (SSR). _Maybe express has a kind of middleware_

### .step_08
- [ ] You HAVE TO use at least one major feature from your front library. _Hook/Context with React, Observables with Angular or Mixins with Vue_

### .step_09
- [ ] One click sharing. _Well, on each blob, we can generate a static public link for the assets 😱😎_

### .step_10
- [X] Of course your app is responsive :)

### bonus
- [ ] Add bucket and|or blob sharing permission (read|write)
- [ ] Front : PRPL

### required
- [X] Make sure test coverage is 100%
- [X] Don't forget to add .crew and .oav.name files
