# AmazingCo
Interview Project for Trade Shift

Get all(direct and non-direct) descendant nodes of a given node (the given node can be anyone in the tree structure).

Change the parent node of a given node (the given node can be anyone in the tree structure).

They need to answer quickly, even with tons of nodes. 

Also, we can’t afford to lose this information, so persistence is required.

Each node should have the following info:

a) node identification

b) who is the parent node

c) who is the root node

d) the height of the node. In the above example, height(root) = 0 and height(a) == 1.

    We can only have docker and docker-compose on our machines, so your server needs to be ran using them.

    Make a simple UI for this challenge. 


## How to Build

* git pull repo
* create .env file filled with in root directory of app
```
NODE_ENV=development
USERNAME=neo4j
PASSWORD=test
NEO4J=bolt://neo4j:7687
SERVER_PORT=3000
```
* docker-compose up neo4j
* npm install
* npm run prestart
* docker-compose up app
    (neo4j must be up and running or this will crash)

* Checkout localhost:8080

## Things that this doesn't have
This is a very bare bones quick test environment

Things it should have and doesn't
* Error handling
* Testing
* Error message
* Crash handling
* Can't swap root node
* You can remove sections of the tree from the tree


