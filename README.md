# myS3
https://mys3.mhirba.now.sh/

# Authors
`Pierre Hérissé` && `Antoine Nivoy`

# Description
The goal here is to recreate an **`AWS S3`** docker container, working only locally, using **TypeScript** and **TypeORM**.

# Environment

We're actually using **PostgreSQL** for handling databases.

For mailing, we're using `gmail` system so you'll need to use one of your **`Gmail`** address & password, and make sure you **_Grant the access to less secured applications_** in your Account Management panel / Security tab.

You'll need 2 environment files :
- **.env.dev**
- **.env.testing**

Each one will follow this structure :
```env
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
- [X] Create routes which allows to create, edit and delete a bucket
- [X] Create a route which allow to list all objects from a bucket
- [X] Create a route which allow to check if a bucket exist with a head method that return 200 or 400

### .step_04
- [X] An object or a blob is describe with: id, name, path, size and belongs to a bucket
- [ ] Create routes which allows to add and delete a blob using the package multer
- [ ] Create a route which allows to retrieve a blob
- [ ] Create a route which allows to duplicate a blob by adding .copy.$NB before the file extension
- [ ] Create a route which allow to get blob metadata. Infos: path and size

### .step_05
- [ ] Create a simple web interface with Vue 😎
- [ ] Optimistic UI : make UI responding instantaneously generating front before backend response, display will change only if response is different than front UI

### .step_06
- [ ] Your client has to handle all user API actions. _From the authentication to the upload through browsing buckets and files_

### .step_07
- [ ] You HAVE TO transform you application to handle Server-side Rendering (SSR). _Maybe express has a kind of middleware_

### .step_08
- [ ] You HAVE TO use at least one major feature from your front library. _Hook/Context with React, Observables with Angular or Mixins with Vue_

### .step_09
- [ ] One click sharing. _Well, on each blob, we can generate a static public link for the assets 😱😎_

### .step_10
- [ ] Of course your app is responsive :)

### bonus
- [ ] Add bucket and|or blob sharing permission (read|write)
- [ ] Front : PRPL

### required
- [ ] Make sure test coverage is 100%
- [ ] Don't forget to add .crew and .oav.name files
