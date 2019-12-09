# myS3
https://mys3.mhirba.now.sh/

# Authors 
`Pierre Hérissé` && `Antoine Nivoy`

# Description
The goal here is to recreate an **`AWS S3`** docker container, working only locally, using **TypeScript** and **TypeORM**.

# Steps
### .step_01
- [X] Bootstrap an API server using express and typeORM with Typescript + Babel
- [X] You HAVE TO use snakecase and lowercase table names
- [X] Setup tests with **Jest**
- [ ] Setup docker container

### .step_02
- [X] A user is described with: uuid, nickname, email, password
- [X] Bootstrap all CRUD user operations
- [ ] You HAVE TO use JWT
- [ ] You HAVE TO send an email on user creation
- [ ] Add user password reset e-mail workflow

### interlude
- [ ] The file structure on your computer will be ~/myS3DATA/$USER_UUID/$BUCKET_NAME/$BLOB_NAME

### .step_03
- [ ] A bucket is describe with: id, name and belongs to a user
- [ ] Create routes which allows to create, edit and delete a bucket
- [ ] Create a route which allow to list all objects from a bucket
- [ ] Create a route which allow to check if a bucket exist with a head method that return 200 or 400

### .step_04
- [ ] An object or a blob is describe with: id, name, path, size and belongs to a bucket
- [ ] Create routes which allows to add and delete a blob using the package multer
- [ ] Create a route which allows to retrieve a blob
- [ ] Create a route which allows to duplicate a blob by adding .copy.$NB before the file extension
- [ ] Create a route which allow to get blob metadata. Infos: path and size

### .step_05
- [ ] Create a simple web interface with Vue 😎

### bonus
- [ ] Add bucket and|or blob sharing permission (read|write)

### required
- [ ] Make sure test coverage is 100%
- [ ] Don't forget to add .crew and .oav.name files
