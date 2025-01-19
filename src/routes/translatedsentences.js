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

    const reportGroupReport = await ctx.orm.ReportGroupReport.findOne({
      where: {
        reportId: sentence.reportId
      }
    });

    const reportGroupId = reportGroupReport.reportGroupId;

    ctx.status = 200;
    ctx.body = {sentence, translatedSentence, reportGroupId };
  } catch (error) {
    console.error('Error al obtener la TranslatedSentence por ID:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al obtener la TranslatedSentence.' };
  }
});

module.exports = router;