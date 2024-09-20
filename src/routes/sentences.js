
const Router = require('koa-router');
const router = new Router();

router.get('sentences.get', '/fromreport/:id', async (ctx) => {
  const reportId = ctx.params.id;
  try {
    const sentences = await ctx.orm.Sentence.findAll({
      where: {
        reportId: reportId
      }
    });
    ctx.status = 200;
    ctx.body = {
      sentences
    };
  } catch (error) {
    console.error('Error al obtener las oraciones asociadas al informe:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al obtener las oraciones asociadas al informe.' };
  }
});

router.delete('sentences.delete', '/:id', async (ctx) => {
    const reportId = ctx.params.id;
    try {
      const sentences = await ctx.orm.Sentence.findAll({
        where: {
          reportId: reportId
        }
      });
      const sentenceIds = sentences.map(sentence => sentence.id);
      await ctx.orm.Sentence.destroy({
        where: {
          id: sentenceIds
        }
      });
  
      ctx.status = 200;
      ctx.body = { message: 'Oraciones asociadas al informe eliminadas exitosamente.' };
    } catch (error) {
      console.error('Error al eliminar las oraciones asociadas al informe:', error);
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar las oraciones asociadas al informe.' };
    }
  });
  
  router.delete('sentences.deleteAll', '/', async (ctx) => {
    try {
      await ctx.orm.Sentence.destroy({ where: {} });
      ctx.status = 200; // No Content
    } catch (error) {
      console.error('Error al eliminar todas las sentences:', error);
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar todas las sentences.' };
    }
  });

module.exports = router