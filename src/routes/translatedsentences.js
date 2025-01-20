const Router = require('koa-router');
const router = new Router();

  router.delete('translatedsentences.deleteAll', '/', async (ctx) => {
      try {
        await ctx.orm.TranslatedSentence.destroy({ where: {} });
        ctx.status = 200; // No Content
      } catch (error) {
        console.error('Error al eliminar todas las TranslatedSentences:', error);
        ctx.status = 500;
        ctx.body = { error: 'Ocurrió un error al eliminar todas las TranslatedSentences.' };
      }
    });
  
  router.get('translatedsentences.getAll', '/all', async (ctx) => {
    try {
      // Buscar todas las TranslatedSentences
      const translatedSentences = await ctx.orm.TranslatedSentence.findAll();
  
      ctx.status = 200;
      ctx.body = { translatedSentences };
    } catch (error) {
      console.error('Error al obtener todas las TranslatedSentences:', error);
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al obtener todas las TranslatedSentences.' };
    }
  });

router.get('translatedsentences.getById', '/:id', async (ctx) => {
  const translatedSentenceId = ctx.params.id;
  try {
    const translatedSentence = await ctx.orm.TranslatedSentence.findOne({
      where: {
        id: translatedSentenceId
      }
    });
    const sentence = await ctx.orm.Sentence.findOne({
      where: {
        id: translatedSentence.sentenceId
      }
    });

    const reportGroupReport = await ctx.orm.ReportGroupReport.findAll({
      where: {
        reportId: sentence.reportId
      }
    });

    console.log('reportGroupReport:', reportGroupReport);

    const reportGroupId = reportGroupReport.reportGroupId;

    console.log('reportGroupId:', reportGroupId);

    const reportGroupReports = await ctx.orm.ReportGroupReport.findAll({
      where: {
        reportGroupId: reportGroupId
      }
    });

    console.log('reportGroupReports:', reportGroupReports);

    const reportIds = reportGroupReports.map((report) => report.reportId);

    console.log('reportIds:', reportIds);

    const reports = await ctx.orm.Report.findAll({
      where: {
        id: reportIds
      }
    });

    console.log('reports:', reports);

    let indexReport = 0;
    for (const report of reports) {
      indexReport++;
      if (report.id === sentence.reportId) {
        break;
      }
    }

    console.log('indexReport:', indexReport);

    ctx.status = 200;
    ctx.body = { sentence, translatedSentence, reportGroupId, indexReport };
  } catch (error) {
    console.error('Error al obtener la TranslatedSentence por ID:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al obtener la TranslatedSentence.' };
  }
});

module.exports = router;