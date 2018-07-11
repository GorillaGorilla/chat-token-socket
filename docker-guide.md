### Docker


* First write your dockerfile

This should pull the dockerfile it inherits from (probably one that includes nodejs, probably git as well)

Add directorys, npm installs, defines which ports to expose and then defines the command to run when the container starts

* Then create the docker-compose file

This defines the container as a service, its where you can give a name to the service, tell it which ports hsould be mapped to what on the host machine.

You can then deploy the app using docker-compose build and docker-compose up

Other services can be defined along with your app (like mongodb, but to connect them you need to do something a bit snazzier

* Define a stack in docker compose

A stack is a grouping of services in usually a common network. You can define the network for them all to be a part of and they can connect to one another based upon their given names. You can also define how many instances, and what to do when one crashed. Very neat.

* Create a swarm

To deploy a stack you need a swarm. You can declare your local machine as a swarm, but really you want to make (at least) a couple of vms to be your swarm. Tell one to be the master and then the second one to join using the command the master tells you.

Watch out for the error you get if you don't ask the worker to join on port 2377. This is weird.

The great thing about using the swarm is that deploying to this local swarm is analoguous to deploying to AWS or similar.


To learn in more detail I recommend doing the official docker getting started tutorial - its very good.

https://docs.docker.com/get-started/

This tutorial gives a great explanation of Docker file and layers:

http://blog.mpayetta.com/node.js/docker/mongodb/2016/09/04/dockerizing-node-mongo-app/

Although it doesn't use a swarm.