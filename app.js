const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const app = new Koa();
const debug = require('debug')('app');
const Router = require('koa-router');

const router = new Router();

router.post('/hook', require('./handlers/hook').post);
router.get('/stats', require('./handlers/stats').get);
router.get('/stats/:lang.svg', require('./handlers/statsInSvg').get);

app.use(logger());

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;