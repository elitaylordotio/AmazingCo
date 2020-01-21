
import neo4j, { Driver, QueryResult, Session } from "neo4j-driver";

export class DBWrapper {

    private driver: Driver;

    private session: Session;

    constructor(username: string, password: string, dbUrl: string) {

        this.driver = neo4j.driver("bolt://localhost:7687", neo4j.auth.basic("neo4j", "test"));
        // this.driver = neo4j.driver(dbUrl, neo4j.auth.basic(username, password));
        this.session = this.driver.session();

        this.createTree(25);

    }

    public getAllNodes(): Promise<QueryResult> {

        const query = "MATCH (n:Node) RETURN (n)";
        return this.session.readTransaction((transaction) => {
            const result = transaction.run(query);
            return result;
        });
    }

    private getRootNode(): Promise<QueryResult> {
        const query = "MATCH (r:Node) WHERE NOT (r)-[:HAS_PARENT]-() RETURN r.name AS name";
        return this.session.readTransaction((transaction) => {
            const result = transaction.run(query);
            return result;
        });
    }

    private getDistance(startNode: string, endNode: string): Promise<QueryResult> {
        const query = "MATCH (a:Node { name: $startNode }),(b:Node { name: $endNode}), p = shortestPath((a)-[*..15]-(b)) RETURN length(p)";
        return this.session.readTransaction((transaction) => {
            const result = transaction.run(query, { startNode, endNode });
            return result;
        });
    }

    private async createTree(size: number): Promise<any> {

        const promiseArray = [];
        promiseArray.push(() => this.clearAll());
        promiseArray.push(() => this.createNodeWithoutRelationship("0"));

        for (let i = 1; i < size; i++) {
            const parentNode = (Math.floor(Math.random() * (i))).toString();
            promiseArray.push(() => this.createNodeWithRelationship(i.toString(), parentNode).then((result) => {
                // tslint:disable-next-line:no-console
                console.log(result);
            }));
        }

        for (const promise of promiseArray) {
            await promise();
        }
    }

    private clearAll(): Promise<QueryResult> {
        const query = "Match (n) DETACH DELETE n;";
        return this.session.writeTransaction((transaction) => {
            const result = transaction.run(query);
            return result;
        });
    }

    private createNodeWithRelationship(nodeName: string, parentName: string): Promise<QueryResult> {
        const query = "MATCH (parentNode:Node) \
        WHERE parentNode.name = $parentName \
        CREATE (newNode:Node {name: $nodeName})-[:HAS_PARENT]->(parentNode) \
        CREATE (parentNode)-[r:HAS_CHILD]->(newNode) \
        WITH newNode \
        MATCH (root:Node) \
        WHERE NOT (root)-[:HAS_PARENT]-() \
        WITH newNode \
        MATCH p = shortestPath((newNode)-[*]-(root)) \
        RETURN newNode";
        return this.session.writeTransaction((transaction) => {
            const result = transaction.run(query, { nodeName, parentName });
            return result;
        });
    }

    private createNodeWithoutRelationship(nodeName: string): Promise<QueryResult> {
        const query = "CREATE (a:Node {name: $nodeName, height: 0}) RETURN a.name AS name";
        return this.session.writeTransaction((transaction) => {
            const result = transaction.run(query, { nodeName });
            return result;
        });
    }
}
