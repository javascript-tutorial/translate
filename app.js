const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const app = new Koa();
const debug = require('debug')('app');
const Router = require('koa-router');

const router = new Router();

router.post('/hook', require('./handlers/hook').post);
router.get('/translate', require('./handlers/translate').get);
router.get('/contributors', require('./handlers/contributors').get);
router.get('/repo', require('./handlers/repo').get);
router.get('/translate/:lang.svg', require('./handlers/translateInSvg').get);
router.get('/cache-test', require('./handlers/cacheTest').get);

app.use(logger());

app.use(bodyParser());

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app;
