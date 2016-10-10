This project consists of a server that handles authentication via REST APIs.
It was created by the IBM UK rapid prototyping team who borrowed heavily from this tutorial provided by devdactic:
https://devdactic.com/restful-api-user-authentication-1/

All credit to the developer of that tutorial.

The database is a mongo and uses the Mongoose object model library to define the user accounts, and the authentication is done via the passport library.
Using the jwt strategy.

It provides authorisation based upon tokens, there is a route to register which creates a user account.

To log into that account one must access the authenticate route providing the correct credentials in the body of a post request.

If successful this generates a token which is returned to the user.

By attaching this token to the "Authorization" header of subsequent requests protected routes can be accessed.

The schemas for objects in the database (for example the user accounts) are defined using the mongoose object modelling library.
The files for these are stored in app/models
The core logic of the apps functionality is stored in controllers in the app/controllers folder.
These expose different functions in the express middleware fashion:

function(req, res, next){
code here

}

which allows functions to be chained up.

the process.env.NODE_ENV governs which database connection string is used, which allows the app to be run locally by setting NOVE_ENV to development.

Whereas when built in bluemix the NODE_ENV variable is by default set to production.