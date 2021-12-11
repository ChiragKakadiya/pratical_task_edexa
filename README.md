# Chiarg_edexa Task

This is initial project setup, in this we have created .env file and configure it.


- You need to make copy of .env.sample an rename it with .env
- After that configure your port, host, database port, databse name, secret key according to your requirement

### Note:
- Default port will be 3000
- Default host will be localhost
- Default databse name will be admin
- Default databse port will be 27017

### Important:
- Set `x-access-token` as a key into Header section with access token as value for perform every action after login

### Setup Steps

- For project setup set database setting in .env file and run below commands.

  Install dependency
  ```
  npm install
  ```

- You need start project by npm start command or node index.js
- we configure npm start in script so for running application we can directly use it.


### Below are the routes you can use.
- `POST => /signup` => This route is use for signUp of the user
- `POST => /login` => This route is use for login of the user
- `GET => /user/:userId` => This route is use for get all details of specific user
- `POST => /create/user` => This route is use for create user if user have and access for it
- `GET => /users` => This route is use for get all details of all users if user have and access for it
- `PUT => /user/:userId` => This route is use for modify specific user's data if user have and access for it
- `PUT => /permission/:userId` => This route is use for provide permission to specific user if user have and access for it
- `PUT => /permissionRevoke/:userId` => This route is use for revoke specific users's permission if user have and access for it
- `DELETE => /user/:userId` => This route is use for delete specific user if user have and access for it