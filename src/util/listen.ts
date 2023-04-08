import https from 'https';
import http from 'http';
import { makeLogger } from './logger';

const { network: networkConfig } = require('../../config');

export default function listen(handler?: http.RequestListener) {
  const { https: httpsConfig, port, host } = networkConfig;
  let server;
  if (httpsConfig) {
    server = https.createServer(httpsConfig, handler);
  } else {
    server = http.createServer(handler);
  }

  const logger = makeLogger();

  server.listen(port, host, () => {
    logger(`Listening on port ${port}`);
  });
}
