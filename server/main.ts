import os from 'os';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import logger, { morganStreamWriter } from './logger';
import { connectDatabase } from './mongoose';
import { forwardToGzippedScripts, serveStaticAssets, routeEverythingToIndex } from './static-assets';
import authRouter from './auth';
import { attachJwtToken } from './auth/express-middlewares';
import graphqlRouter from './graphql';

import './bootstrap';

const app = express();
const port = process.env.SERVER_PORT;

//=> Connect to the MongoDB database
connectDatabase(process.env.MONGO_URL).catch((error) => {
    logger.error(error.message);
    process.exit(1);
});

//=> Enable CORS
app.use(cors());

//=> Logging of HTTP requests with morgan
const morganFormat = process.env.NODE_ENV == 'production'
    ? ':remote-addr - :method :url [:status], resp. :response-time ms, :res[content-length] bytes, referrer ":referrer"'
    : 'dev';

app.use(morgan(morganFormat, { stream: morganStreamWriter }));

//=> Decode JSON request bodies
app.use(bodyParser.json());

//=> Serve authentication endpoints
app.use('/auth', authRouter);

//=> Serve the GraphQL API & GraphiQL
app.use(attachJwtToken(), graphqlRouter);

//=> Serve static assets
if (process.env.NODE_ENV == 'production') {
    app.use(forwardToGzippedScripts);
}

app.use(serveStaticAssets);
app.use(routeEverythingToIndex);

//=> Start the HTTP server
app.listen(port, () => {
    logger.info(`🌍 Up and running @ http://${os.hostname()}:${port}`);
    logger.info(`Built for: ${process.env.NODE_ENV}`);
});
