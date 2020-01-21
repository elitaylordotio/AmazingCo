
import bodyParser from "body-parser";
import dotenv from "dotenv";
import express from "express";
import { DBWrapper } from "./db";

dotenv.config();

const port = process.env.SERVER_PORT;
const app = express();
const db = new DBWrapper(process.env.USERNAME, process.env.PASSWORD, process.env.NEO4J);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// define a route handler for the default home page
app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get(`/api/getNode`, async (req: any, res) => {

        db.getAllNodes().then((result) => {
            res.send(result.records);
        }).catch((error) => {
            res.send(error);
        });

});

// start the Express server
app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.debug(`server started at http://localhost:${port}`);
});
