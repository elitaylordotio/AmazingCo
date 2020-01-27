
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
    /// Finding everything under a node
//     MATCH (parent:Node { name:"3" })-[:HAS_CHILD *0..]->(child: Node)
// RETURN child

    public swapParentNode(childNode: string, newParentNode: string): Promise<QueryResult> {

        const query = "MATCH (newParentNode:Node) \
        WHERE newParentNode.name = $newParentNode \
        MATCH (childNode:Node) \
        WHERE childNode.name = $childNode \
        MATCH (oldParentNode:Node) \
        WHERE (oldParentNode)-[:HAS_CHILD]->(childNode) \
        MATCH (oldParentNode)-[childRelation:HAS_CHILD]->(childNode) \
        MATCH (childNode)-[parentRelation:HAS_PARENT]->(oldParentNode) \
        DELETE childRelation \
        DELETE parentRelation \
        CREATE (newParentNode)-[:HAS_CHILD]->(childNode) \
        CREATE (childNode)-[:HAS_PARENT]->(newParentNode) \
        SET childNode.height = (newParentNode.height + 1) \
        WITH childNode \
        MATCH path = (childNode)-[:HAS_CHILD *1..]->(child: Node) \
        SET child.height = (length(path) + childNode.height) \
        WITH childNode \
        RETURN childNode";
        return this.session.readTransaction((transaction) => {
            const result = transaction.run(query, { childNode, newParentNode });
            return result;
        });
    }

    private async createTree(size: number): Promise<any> {

        const promiseArray = [];
        promiseArray.push(() => this.clearAll());
        promiseArray.push(() => this.createNodeWithoutRelationship("0"));

        for (let i = 1; i < size; i++) {
            const parentNode = (Math.floor(Math.random() * (i))).toString();
            // tslint:disable-next-line: no-empty
            promiseArray.push(() => this.createNodeWithRelationship(i.toString(), parentNode));
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
        CREATE (newNode:Node {name: $nodeName, height: (parentNode.height + 1)})-[:HAS_PARENT]->(parentNode) \
        CREATE (parentNode)-[r:HAS_CHILD]->(newNode) \
        WITH newNode \
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
