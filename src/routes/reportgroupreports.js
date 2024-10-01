const Router = require('koa-router');
const router = new Router();
const jwt = require('jsonwebtoken');


router.get('reportgroupreports.show', '/rgr/:id', async (ctx) => {
  try {
    const reportsgroupreports = await ctx.orm.ReportGroupReport.findAll({
      where: {
        reportGroupId: ctx.params.id
      }
    });
    ctx.body = reportsgroupreports;
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

router.get('reportgroupreports.all', '/', async (ctx) => {
  try {
    const reportsgroupreports = await ctx.orm.ReportGroupReport.findAll();


    const groupedReports = {};

    reportsgroupreports.forEach((reportGroupReport) => {
      const { reportGroupId, reportId } = reportGroupReport;
      if (!groupedReports[reportGroupId]) {
        groupedReports[reportGroupId] = { id: reportGroupId, reports: [] };
      }
      groupedReports[reportGroupId].reports.push(reportId);
    });

    // Obtener detalles de los informes
    for (const groupId in groupedReports) {
      const reportIds = groupedReports[groupId].reports;
      const reports = await ctx.orm.Report.findAll({
        where: {
          id: reportIds
        }
      });
      groupedReports[groupId].reports = reports;

      const userReportGroup = await ctx.orm.UserReportGroup.findAll({
        where: {
          reportGroupId: groupId,
        },
        attributes: ['userId']
      });
      const userIds = userReportGroup.map(report => report.userId);
      console.log("LOS IDS DE USUARIOS ENCONTRADOS SON", userIds);
      groupedReports[groupId].users = userIds;

    }

    ctx.body = Object.values(groupedReports);
    ctx.status = 200;
  } catch (error) {
    ctx.body = { error: error.message };  // Asegúrate de manejar el error adecuadamente
    ctx.status = 400;
  }
});

router.get('reportgroupreports.list', '/:id', async (ctx) => {
  try {
    const reportgroupreports = await ctx.orm.ReportGroupReport.findAll({
      where: {
        reportGroupId: ctx.params.id
      }
    });
    //console.log("reportsgroupreports: ",reportgroupreports);
    const reportIds = reportgroupreports.map((report) => report.reportId);
    const reports = await ctx.orm.Report.findAll({
      where: {
        id: reportIds
      }
    });

    const reportData = [];
    const translatedreportData = [];
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
        ctx.body = reportData;
        ctx.status = 200;

      } catch (error) {
        ctx.body = error;
        ctx.status = 400;
      }
  });

router.delete('reportgroupreports.delete', '/:id', async (ctx) => {
  const reportGroupId = ctx.params.id;
  //ESTE ENDPOINT DEBE REHACERSE Y BORRAR TODO LO ASOCIADO A ESE BATCH
  try {
    // Encontrar todos los informes asociados al grupo de informes
    const reportGroupReports = await ctx.orm.ReportGroupReport.findAll({
      where: {
        reportGroupId: reportGroupId
      }
    });

    // Extraer los IDs de los informes
    const reportIds = reportGroupReports.map(reportGroupReport => reportGroupReport.reportId);

    // Eliminar los informes
    await ctx.orm.Report.destroy({
      where: {
        id: reportIds
      }
    });

    await ctx.orm.TranslatedReport.destroy({
      where: {
        reportId: reportIds
      }
    });

    await ctx.orm.TranslatedSentence.destroy({
      where: {
        reportId: reportIds
      }
    });

    await ctx.orm.Sentence.destroy({
      where: {
        reportId: reportIds
      }
    });

    await ctx.orm.ReportGroup.destroy({
      where: {
        id: reportGroupId
      }
    });

    await ctx.orm.ReportGroupReport.destroy({
      where: {
        reportId: reportIds
      }
    });

    
    ctx.status = 200;
    ctx.body = { message: 'Informes asociados al grupo eliminados exitosamente.' };
  } catch (error) {
    console.error('Error al eliminar los informes asociados al grupo:', error);
    ctx.status = 500;
    ctx.body = { error: 'Ocurrió un error al eliminar los informes asociados al grupo.' };
  }
});

router.get('reportgroupreports.count', '/count/:id', async (ctx) => {
  try {
    const reportgroupreports = await ctx.orm.ReportGroupReport.findAll({
      where: {
        reportGroupId: ctx.params.id
      }
    });
    ctx.body = reportgroupreports.length;
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

router.get('reportgroupreports.completed', '/completed/:groupId', async (ctx) => {
  try {
    const token = ctx.request.headers.authorization;

    // Verificar token
    if (!token) {
      ctx.status = 401;
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
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    const groupId = ctx.params.groupId;

    const reportGroupReports = await ctx.orm.ReportGroupReport.findAll({
      where: { reportGroupId: groupId }
    });
    const reportIds = reportGroupReports.map(report => report.reportId);

    const reportsCompleted = [];
    let completedCount = 0;

    for (const reportId of reportIds) {
      const translatedSentences = await ctx.orm.TranslatedSentence.findAll({
        where: { reportId }
      });

      const translatedSentencesFiltered = translatedSentences.filter(sentence => sentence.text.trim().length > 0);

      const userTranslatedSentences = await ctx.orm.UserTranslatedSentence.findAll({
        where: {
          userId,
          translatedsentenceId: translatedSentences.map(ts => ts.id)
        }
      });

      const allReviewed = userTranslatedSentences.every(uts => uts.isSelectedCheck || uts.isSelectedTimes) &&
        userTranslatedSentences.length === translatedSentencesFiltered.length;

      if (allReviewed) completedCount++;

      reportsCompleted.push({
        reportId,
        completed: allReviewed
      });
    }

    ctx.body = { reportsCompleted, completedCount };
    ctx.status = 200;

  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

router.get('reportgroupreports.translated', '/translated/:groupId', async (ctx) => {
  try {
    const token = ctx.request.headers.authorization;

    if (!token) {
      ctx.status = 401;
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
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
    const userId = decodedToken.userId;
    const groupId = ctx.params.groupId;

    const reportGroupReports = await ctx.orm.ReportGroupReport.findAll({
      where: { reportGroupId: groupId }
    });
    const reportIds = reportGroupReports.map(report => report.reportId);

    let totalTranslatedSentences = 0;

    for (const reportId of reportIds) {
      const translatedSentences = await ctx.orm.TranslatedSentence.findAll({
        where: { reportId }
      });

      totalTranslatedSentences += translatedSentences.filter(sentence => sentence.text.trim() !== "").length;
    }

    ctx.body = { totalTranslatedSentences };
    ctx.status = 200;

  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
    console.error(error);
  }
});


module.exports = router;

