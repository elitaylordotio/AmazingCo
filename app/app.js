
var env = process.env.NODE_ENV || 'development';
var config = require('./config')[env];
var neo4j = require('neo4j-driver');
var driver, session;

driver = neo4j.driver(config.neo4j, neo4j.auth.basic(config.username, config.password));
session = driver.session();




const personName = 'Alice';
const resultPromise = session.run(
    'CREATE (a:Person {name: $name}) RETURN a',
    { name: personName }
);

resultPromise.then(result => {
    session.close();

    const singleRecord = result.records[0];
    const node = singleRecord.get(0);

    console.log(node.properties.name);

    // on application exit:
    driver.close();
});
