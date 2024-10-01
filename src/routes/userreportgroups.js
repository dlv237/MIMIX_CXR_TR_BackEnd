const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();

router.get('userreportgroups.all', '/all', async (ctx) => {
  try {
    const userreportgroups = await ctx.orm.UserReportGroup.findAll();
    ctx.body = userreportgroups;
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

router.get('userreportgroups.group', '/reportGroup/:reportGroupId', async (ctx) => {
  const token = ctx.request.headers.authorization;
  const reportGroupId = ctx.params.reportGroupId;
  if (!token) {
    ctx.status = 401; // No autorizado
    ctx.body = 'Token no proporcionado';
    return;
  }
  const tokenParts = token.split(' ');
  if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
    ctx.status = 401;
    ctx.body = 'Token mal formateado';
    return;
  }
  const accessToken = tokenParts[1];

  try {

    const userReportGroup = await ctx.orm.UserReportGroup.findAll({
      where: {
        reportGroupId: reportGroupId,
      },
    });

   
    if (!userReportGroup) {
      ctx.status = 404;
      ctx.body = { error: 'UserReportGroup no encontrado.' };
      return;
    }

    ctx.status = 200;
    ctx.body = userReportGroup;

    } catch (error) {
      console.error('Error al obtener el URG:', error);
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al obtener el URG.' };
    }
  }
);

router.get('userreportgroups.report', '/report/:groupId/:reportId', async (ctx) => {
  const reportId = parseInt(ctx.params.reportId, 10); 
  const groupId = parseInt(ctx.params.groupId, 10);

  try {
    const reportgroupreports = await ctx.orm.ReportGroupReport.findAll({
      where: {
        reportGroupId: groupId
      }
    });
    
    const reportIds = reportgroupreports.map((report) => report.reportId);
    const reports = await ctx.orm.Report.findAll({
      where: {
        id: reportIds
      }
    });

    const reportData = [];
    let indexReport = 0;
    for (const report of reports) {
      const impressionsentences = await ctx.orm.Sentence.findAll({
        where: {
          reportId: report.id,
          sentence_type: "impression",
        }
      }); 
      const findingssentences = await ctx.orm.Sentence.findAll({
        where: {
          reportId: report.id,
          sentence_type: "findings",
        }
      }); 
      const backgroundsentences = await ctx.orm.Sentence.findAll({
        where: {
          reportId: report.id,
          sentence_type: "background",

        }
      });
      const impressiontranslatedsentences = await ctx.orm.TranslatedSentence.findAll({
        where: {
          reportId: report.id,
          translated_sentence_type: "impression",
        }
      });
      const findingstranslatedsentences = await ctx.orm.TranslatedSentence.findAll({
        where: {
          reportId: report.id,
          translated_sentence_type: "findings",
        }
      });   
      const backgroundtranslatedsentences = await ctx.orm.TranslatedSentence.findAll({
        where: {
          reportId: report.id,
          translated_sentence_type: "background",
        }
      });

      reportData.push({
        "report": {
          "index": indexReport,
          "reportId": report.id,
          "sentences": {
            "impression": impressionsentences,
            "findings": findingssentences,
            "background": backgroundsentences
          },
          "translated_sentences": {
            "impression": impressiontranslatedsentences,
            "findings": findingstranslatedsentences,
            "background": backgroundtranslatedsentences
          }
        }
      });
      indexReport++;
      }
      const specificReport = reportData.find(r => r.report.index === (reportId));
      ctx.body = specificReport || { error: "Report not found" };
      console.log("reportData:", reportData);
      ctx.status = specificReport ? 200 : 404;

      } catch (error) {
        ctx.body = error;
        ctx.status = 400;
      }
  });


router.get('userreportgroups.user', '/user/:reportGroupId', async (ctx) => {
  const token = ctx.request.headers.authorization;
  const reportGroupId = ctx.params.reportGroupId;
  console.log("reportGroupId: ",reportGroupId);

  if (isNaN(reportGroupId)) {
    ctx.status = 400;
    ctx.body = { error: 'reportGroupId debe ser un número válido.' };
    return;
  }

    if (!token) {
      ctx.status = 401; // No autorizado
      ctx.body = 'Token no proporcionado';
      return;
    }
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      ctx.status = 401;
      ctx.body = 'Token mal formateado';
      return;
    }
    const accessToken = tokenParts[1];
  
    try {
      const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
      const userReportGroup = await ctx.orm.UserReportGroup.findOne({
      where: {
        userId: userId,
        reportGroupId: reportGroupId,
      },
    }
    );

    if (!userReportGroup) {
      ctx.status = 404;
      ctx.body = { error: 'UserReportGroup no encontrado.' };
      return;
    }
    ctx.status = 200;
    ctx.body = userReportGroup;
    
  } catch (error) {
    console.error('Error al obtener el URG:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al obtener el URG.' };
  }
});

router.patch('userreportgroups.updateProgress', '/updateprogressReports/:reportGroupId', async (ctx) => {
  const token = ctx.request.headers.authorization;
  const { reportGroupId } = ctx.params;
  const { progressReports } = ctx.request.body;
  //console.log("progressReports: ",progressReports, "reportGroupId: ",reportGroupId);
    if (!token) {
      ctx.status = 401; // No autorizado
      ctx.body = 'Token no proporcionado';
      return;
    }
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      ctx.status = 401;
      ctx.body = 'Token mal formateado';
      return;
    }
    const accessToken = tokenParts[1];
  
    try {
      const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
    const userReportGroup = await ctx.orm.UserReportGroup.findOne({
      where: {
        userId: userId,
        reportGroupId: reportGroupId,
      },
    }
    );

    if (!userReportGroup) {
      ctx.status = 404;
      ctx.body = { error: 'UserReportGroup no encontrado.' };
      return;
    }
    userReportGroup.progressReports = progressReports;
    await userReportGroup.save();

    ctx.status = 200;
    ctx.body = { message: 'Progreso actualizado exitosamente.' };
  } catch (error) {
    console.error('Error al actualizar el progreso:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al actualizar el progreso.' };
  }
});

router.patch('userreportgroups.updateProgress', '/updateprogressTranslatedSentences/:reportGroupId', async (ctx) => {
  const token = ctx.request.headers.authorization;
  const { reportGroupId } = ctx.params;
  const { progressTranslatedSentences } = ctx.request.body;
  //console.log("progressTranslatedSentences: ",progressTranslatedSentences, "reportGroupId: ",reportGroupId);
    if (!token) {
      ctx.status = 401; // No autorizado
      ctx.body = 'Token no proporcionado';
      return;
    }
    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      ctx.status = 401;
      ctx.body = 'Token mal formateado';
      return;
    }
    const accessToken = tokenParts[1];
  
    try {
      const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
    const userReportGroup = await ctx.orm.UserReportGroup.findOne({
      where: {
        userId: userId,
        reportGroupId: reportGroupId,
      },
    }
    );
    if (!userReportGroup) {
      ctx.status = 404;
      ctx.body = { error: 'UserReportGroup no encontrado.' };
      return;
    }
    userReportGroup.progressTranslatedSentences = progressTranslatedSentences;
    await userReportGroup.save();

    ctx.status = 200;
    ctx.body = { message: 'Progreso actualizado exitosamente.' };
  } catch (error) {
    console.error('Error al actualizar el progreso:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al actualizar el progreso.' };
  }
});



router.post('userreportgroups.create', '/', async (ctx) => {
  const { userIds, reportGroupId } = ctx.request.body;

  try {
    // Verifica si el grupo de reportes existe
    const reportGroup = await ctx.orm.ReportGroup.findByPk(reportGroupId);
    if (!reportGroup) {
      ctx.status = 404;
      ctx.body = { error: 'ReportGroup no encontrado.' };
      return;
    }

    // Verifica si los usuarios ya están en el grupo de reportes
    const existingUserReportGroups = await ctx.orm.UserReportGroup.findAll({
      where: {
        reportGroupId,
        userId: userIds,
      },
    });
    const existingUserIds = existingUserReportGroups.map(urg => urg.userId);
    const newUserIds = userIds.filter(userId => !existingUserIds.includes(userId));

    if (newUserIds.length === 0) {
      ctx.status = 400;
      ctx.body = { error: 'Todos los usuarios ya están asociados grupo de reportes.' };
      return;
    }

    // Crea los nuevos UserReportGroups
    const createdUserReportGroups = await Promise.all(
      newUserIds.map(userId =>
        ctx.orm.UserReportGroup.create({ userId, reportGroupId })
      )
    );

    ctx.status = 201;
    ctx.body = { userReportGroups: createdUserReportGroups };
  } catch (error) {
    console.error('Error al crear el grupo de reportes:', error);
    ctx.status = 400;
    ctx.body = { error: 'Error al crear el grupo de reportes:'};
  }
});


  router.delete('userreportgroups.delete', '/:userId/:reportGroupId', async (ctx) => {
    const userId = ctx.params.userId;
    const reportGroupId = ctx.params.reportGroupId;
    console.log("userId: ",userId);
    try {
      // Eliminar la asociación de usuarios a un grupo de reportes
      await ctx.orm.UserReportGroup.destroy({
        where: {
          userId: userId,
          reportGroupId: reportGroupId,
        }
      });
      ctx.status = 200;
      ctx.body = { message: 'Asociación de usuarios eliminada exitosamente.' };
    } catch (error) {
      console.error('Error al eliminar la asociación de usuarios:', error);
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar la asociación de usuarios.' };
    }
  });
  
  router.delete('userreportgroups.deleteAll', '/all', async (ctx) => {
    try {
      await ctx.orm.UserReportGroup.destroy({ where: {} }); // Borra todos los registros
      ctx.status = 200;
      ctx.body = { message: 'Todos los UserReportGroups han sido eliminados.' };
    } catch (error) {
      console.error('Error al eliminar todos los UserReportGroups:', error);
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar todos los UserReportGroups.' };
    }
  });

  router.get('userreportgroups.list', '/', async (ctx) => {
    try {
        const userreportgroups = await ctx.orm.UserReportGroup.findAll();   
        ctx.body = userreportgroups;
        ctx.status = 200;
    } 
    
    catch(error){
        ctx.body = error;
        ctx.status = 400; 
    }
});
  
  module.exports = router;