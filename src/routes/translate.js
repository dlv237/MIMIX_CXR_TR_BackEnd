const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();


router.get('translatedsentences.show', "/:translatedReportId", async (ctx) => {
    const translatedReportId = ctx.params.translatedReportId;

    try {
        const translatedsentences = await ctx.orm.TranslatedSentence.findAll({
            where: {
                translatedReportId: translatedReportId
            }
        });
        ctx.body = translatedsentences;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router