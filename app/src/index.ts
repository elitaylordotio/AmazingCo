
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { DBWrapper } from "./db";

dotenv.config();

// const port = process.env.SERVER_PORT;
const port = 3000;
const app = express();
// const db = new DBWrapper(process.env.USERNAME, process.env.PASSWORD, process.env.NEO4J);
const db = new DBWrapper("neo4j", "test", "bolt://neo4j:7687");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// define a route handler for the default home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + "/index.html"));
});

app.get(`/api/getAll`, async (req: any, res) => {

    db.getAllNodes().then((result) => {
        res.send(result.records);
    }).catch((error) => {
        res.send(error);
    });

});

app.post(`/api/getSection`, async (req: any, res) => {
    const node = req.body.node;

    db.getSection(node).then((result) => {
        res.send(result.records);
    }).catch((error) => {
        res.send(error);
    });

});

app.post(`/api/swap`, async (req: any, res) => {
    const child = req.body.childNode;
    const parent = req.body.newParentNode;

    db.swapParentNode(child, parent).then((result) => {
        res.send(result.records);
    }).catch((error) => {
        res.send(error);
    });
});

app.post(`/api/createTree`, async (req: any, res) => {
    const size = req.body.size;

    db.createTree(size).then((result) => {
        res.send(result.records);
    }).catch((error) => {
        res.send(error);
    });
});

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.debug(`server started at http://localhost:8080`);
});
