const Router = require('koa-router');
const router = new Router();

router.get('translatedreports.list', '/', async (ctx) => {
    try {
      const reports = await ctx.orm.TranslatedReport.findAll();
      ctx.status = 200;
      ctx.body = reports;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: 'No se pudieron obtener los reportes.' };
    }
  });


router.delete('translatedreports.delete', '/:id', async (ctx) => {
  const translatedReportId = ctx.params.id;

  try {
    const translatedReport = await ctx.orm.TranslatedReport.findByPk(translatedReportId);

    if (!translatedReport) {
      ctx.status = 404;
      ctx.body = { error: 'Informe traducido no encontrado' };
      return;
    }

    await translatedReport.destroy();
    ctx.status = 200;
    ctx.body = { message: 'Informe traducido eliminado exitosamente' };
  } catch (error) {
    console.error('Error al eliminar el informe traducido:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al eliminar el informe traducido' };
  }
});


router.delete('translatedreports.deleteAll', '/', async (ctx) => {
  try {
    await ctx.orm.TranslatedReport.destroy({ where: {} });
    ctx.status = 204; // No Content
  } catch (error) {
    console.error('Error al eliminar todos los TranslatedReport:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al eliminar los TranslatedReport.' };
  }
});

module.exports = router;