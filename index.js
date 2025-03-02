import path from "node:path";
import * as dotenv from "dotenv";
dotenv.config({path: path.resolve('./src/config/.env.dev')});
import bootstrap from "./src/app.controller.js";
import express from "express";

import { runIo } from "./src/modules/Socket/socket.controller.js";
const app = express();
const port = process.env.PORT || 5000;


bootstrap(app, express);
const httpServer = app.listen(port, () => console.log(`Example running on port ${port}`))

runIo(httpServer)