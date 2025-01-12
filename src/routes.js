const Router = require('koa-router');
const users = require('./routes/users');
const reports = require('./routes/reports');
const reportgroups = require('./routes/reportgroups');
const userreportgroups = require('./routes/userreportgroups');
const reportgroupreports = require('./routes/reportgroupreports');
const sentences = require('./routes/sentences');
const translatedsentences = require('./routes/translatedsentences');
const translatedreports = require('./routes/translatedreports');
const suggestions = require('./routes/suggestions');
const corrections = require('./routes/corrections');
const usertranslatedsentences = require('./routes/usertranslatedsentences')
const authRoutes = require('./routes/authentication.js')
const dotenv = require('dotenv');
const jwtMiddleware = require('koa-jwt')

dotenv.config();

const router = new Router();
router.use(authRoutes.routes());
router.use('/sentences', sentences.routes());
router.use('/translatedsentences', translatedsentences.routes());
router.use('/translatedreports', translatedreports.routes());

//rutas protegidas
router.use(jwtMiddleware( { secret: process.env.JWT_SECRET } ))
router.use('/users', users.routes());
router.use('/corrections', corrections.routes());
router.use('/suggestions', suggestions.routes());
router.use('/reports', reports.routes());
router.use('/reportgroups', reportgroups.routes());
router.use('/userreportgroups', userreportgroups.routes());
router.use('/reportgroupreports', reportgroupreports.routes());
router.use('/usertranslatedsentences', usertranslatedsentences.routes());  
router.use('/comments', require('./routes/comments.js').routes());
router.use('/translatedsentences', require('./routes/translatedsentences.js').routes());

module.exports = router;