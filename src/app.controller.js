import connectDB from "./DB/connection.js";
import authController from "./modules/auth/auth.controller.js";
import userController from "./modules/user/user.controller.js";
import companyController from "./modules/company/company.controller.js";
import { globalErrorHandling } from "./utils/response/error.response.js";
import cors from "cors";
import path from "node:path";
import rateLimit from 'express-rate-limit';
import helmet from "helmet";
import {createHandler} from "graphql-http/lib/use/express"
import playground from "graphql-playground-middleware-express";
import { schema } from "./modules/app.graph.js";
import "./utils/cornJobs.js";

const limiter = rateLimit({
    limit: 5,
    windowMs: 2 * 60 * 1000,
    message: {err: "Rate limit reached, please try again after 2 minutes"},
    legacyHeaders: true,
    standardHeaders: 'draft-8'
})

const bootstrap = (app, express)=>{
    app.use(cors());
    app.use(helmet());
    app.use(limiter);

    app.use('/uploads', express.static(path.resolve('./src/uploads')))
    app.use(express.json());

    

    app.get("/playground", playground.default({endpoint: '/graphql'}))
    app.use("/graphql", createHandler({schema: schema}));

    app.get("/", (req, res, next)=>{
        return res.status(200).json({message: "Welcome in node.js"})
    });

    app.use("/auth", authController);
    app.use("/user",userController);
    app.use("/company", companyController);

    app.all("*", (req, res, next)=>{
        return res.status(404).json({message: "In-valid routing"})
    });

    app.use(globalErrorHandling)

    connectDB()
}

export default bootstrap;