const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();

async function validateToken(ctx, token) {
    if (!token) {
        ctx.status = 401;
        ctx.body = 'Token no proporcionado';
        return false;
    }

    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        ctx.status = 401;
        ctx.body = 'Token mal formateado';
        return false;
    }

    return true;
}

router.post('report.create', "/", async (ctx) => {
    const token = ctx.request.headers.authorization;
    const { jsonContent } = ctx.request.body;
    //console.log("jsonContent: ", jsonContent)
    if (!(await validateToken(ctx, token))) {
        return;
    }
    try {
        const decodedToken = jwt.verify(token.split(' ')[1], process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        const createdReports = [];
        
        const reportGroup = await ctx.orm.ReportGroup.create({
            name: "grupo de reportes",   
        });

        for (const jsonReport of jsonContent) {
            const report = await ctx.orm.Report.create({
                userId: userId,
                background: jsonReport.background,
                findings: jsonReport.findings,
                impression: jsonReport.impression,
                report_translated: jsonReport.report_used_for_translation,
                report_file: jsonReport.report_file,
                original_language: "english",
                mimic_id: jsonReport.mimic_id
            });

            //console.log("Report created");

            const reportGroupReport = await ctx.orm.ReportGroupReport.create({
                reportId: report.id,
                reportGroupId: reportGroup.id,
            });

            const dateParts = jsonReport.date.split('/');
            const formattedDate = new Date(Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0]));
          
            const translatedReport = await ctx.orm.TranslatedReport.create({
                model: jsonReport.model,
                translated_date: formattedDate,
                translated_language: jsonReport.language_of_translation,
                reportId: report.id
            });
            
            //console.log("Translated report created");
            const background_sentences = jsonReport.background_sentences.split("', '").map(sentence => sentence.replace(/['\[\]]/g, '')).filter(sentence => sentence.length > 0);
            const background_translated_sentences = jsonReport.background_translated_sentences.split("', '").map(sentence => sentence.replace(/['\[\]]/g, '')).filter(sentence => sentence.length > 0);
            const findings_sentences = jsonReport.findings_sentences.split("', '").map(sentence => sentence.replace(/['\[\]]/g, '')).filter(sentence => sentence.length > 0);
            const findings_translated_sentences = jsonReport.findings_translated_sentences.split("', '").map(sentence => sentence.replace(/['\[\]]/g, '')).filter(sentence => sentence.length > 0);
            const impression_sentences = jsonReport.impression_sentences.split("', '").map(sentence => sentence.replace(/['\[\]]/g, '')).filter(sentence => sentence.length > 0);
            const impression_translated_sentences = jsonReport.impression_translated_sentences.split("', '").map(sentence => sentence.replace(/['\[\]]/g, '')).filter(sentence => sentence.length > 0);
            
            for (let arrayBackgroundIndex = 0; arrayBackgroundIndex < background_sentences.length; arrayBackgroundIndex++) {
                const sentenceText = background_sentences[arrayBackgroundIndex];
                const sentence = await ctx.orm.Sentence.create({
                    reportId: report.id,
                    array_index: arrayBackgroundIndex,
                    text: sentenceText,
                    sentence_type: "background"
                });

                //console.log("background Sentence created")
                
                const translatedsentenceType = "background";
                const translatedsentenceText = background_translated_sentences[arrayBackgroundIndex];
                const translatedSentence = await ctx.orm.TranslatedSentence.create({
                    sentenceId: sentence.id,
                    reportId: report.id,
                    array_index: arrayBackgroundIndex,
                    text: translatedsentenceText,
                    translated_sentence_type: translatedsentenceType
                });

                //console.log("background Translated Sentence created")
            }
            //console.log("background sentences finished" )
            
            for (let arrayFindingsIndex = 0; arrayFindingsIndex < findings_sentences.length; arrayFindingsIndex++) {
                const sentenceText = findings_sentences[arrayFindingsIndex];
                const sentence = await ctx.orm.Sentence.create({
                    reportId: report.id,
                    array_index: arrayFindingsIndex,
                    text: sentenceText,
                    sentence_type: "findings"
                });
                //console.log("Findings Sentence created")

                const translatedsentenceText = findings_translated_sentences[arrayFindingsIndex];
                const translatedsentenceType = "findings";
                const translatedSentence = await ctx.orm.TranslatedSentence.create({
                    sentenceId: sentence.id,
                    reportId: report.id,
                    array_index: arrayFindingsIndex,
                    text: translatedsentenceText,
                    translated_sentence_type: translatedsentenceType
                });

                //console.log("Findings Translated Sentence created")
            }

            //console.log("Findings sentences finished");

            for (let arrayImpressionIndex = 0; arrayImpressionIndex < impression_sentences.length; arrayImpressionIndex++) {
                const sentenceText = impression_sentences[arrayImpressionIndex];
                const sentence = await ctx.orm.Sentence.create({
                    reportId: report.id,
                    array_index: arrayImpressionIndex,
                    text: sentenceText,
                    sentence_type: "impression"
                });

                //console.log("impression Sentence created")
                
                const translatedsentenceType = "impression";
                const translatedsentenceText = impression_translated_sentences[arrayImpressionIndex];
                const translatedSentence = await ctx.orm.TranslatedSentence.create({
                    sentenceId: sentence.id,
                    reportId: report.id,
                    array_index: arrayImpressionIndex,
                    text: translatedsentenceText,
                    translated_sentence_type: translatedsentenceType
                });

                //console.log("impression Translated Sentence created")
            }

            //console.log("impression sentences finished");

            
            createdReports.push({ report, translatedReport });
        }

        ctx.body = createdReports;
        ctx.status = 201;
    } catch (error) {
        ctx.body = { error: 'Ocurrió un error al procesar la solicitud.' };
        console.error('Error en la creación de informes:', error);
        ctx.status = 400;
    }
});


router.get('reports.list', '/', async (ctx) => {
    try {
      const reports = await ctx.orm.Report.findAll();
      ctx.status = 200;
      ctx.body = reports;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: 'No se pudieron obtener los reportes.' };
    }
  });
  
router.get("reports.id","/:id",async(ctx)=>{
    try{
        const report = await ctx.orm.Report.findOne({where:{id:ctx.params.id}});
        ctx.body = report;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

router.get('reports.show', "/user/:userId", async (ctx) => {
    const userId = ctx.params.userId;
    try {
        const reports = await ctx.orm.Report.findAll({
            where: {
                userId: userId
            }
        });
        ctx.body = reports;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.delete('reports.destroyAll','/', async (ctx) => {
    try {
      await ctx.orm.Report.destroy({ where: {} });
      ctx.status = 200;
      ctx.body = { message: 'Todos los reportes han sido eliminados.' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar los reportes.' };
    }
  });
  

module.exports = router