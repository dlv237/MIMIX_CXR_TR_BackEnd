const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();

router.get('suggestions.list', '/', async (ctx) => {
    try {
      const suggestions = await ctx.orm.Suggestion.findAll();
      ctx.status = 200;
      ctx.body = suggestions;
    } catch (error) {
      ctx.status = 400;
      ctx.body = { error: 'No se pudieron obtener las sugerencias.' };
    }
  });
  

router.get("suggestions.id", "/:id", async (ctx) => {
    const token = ctx.request.headers.authorization;
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
  
      const suggestion = await ctx.orm.Suggestion.findOne({
        where: {
          userId: userId, 
          translatedSentenceId: ctx.params.id,
        }
      });
  
      if (suggestion) {
        ctx.body = suggestion;
        ctx.status = 200;
      }
    } catch (error) {
      ctx.body = error;
      ctx.status = 400;
    }
  });
  
router.post('suggestions.create', "/", async (ctx) => {
    const token = ctx.request.headers.authorization; 
    const suggestionAttributes = ctx.request.body;  

    console.log("suggestionAttributes",suggestionAttributes)

     if (!token) {
    ctx.status = 401;  // No autorizado
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
        const translatedSentenceId = suggestionAttributes.translatedSentenceId;
        const translatedSentence = await ctx.orm.TranslatedSentence.findByPk(translatedSentenceId);
        console.log("sentence: ",translatedSentence);
        // Crea la sugerencia 

        const suggestion = await ctx.orm.Suggestion.create({
          userId: userId,
          translatedSentenceId: translatedSentenceId,
          text: '',
          state: true,
          comments: suggestionAttributes.comments, 
          changesFinalTranslation: suggestionAttributes.changesFinalTranslation,
          sentenceType: translatedSentence.translated_sentence_type
        });
        console.log('Sugerencia creada exitosamente:', suggestion); 
        ctx.body = suggestion; 
        ctx.status = 201;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});


router.put('suggestions.update', "/update/:id", async (ctx) => {
  const token = ctx.request.headers.authorization;
  const translatedSentenceId = ctx.params.id;
  const suggestionAttributes = ctx.request.body;
  console.log("update suggestionAttributes",suggestionAttributes)
  if (!token) {
    ctx.status = 401;  // No autorizado
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
      console.log("userId",userId);

    // Busca la sugerencia por su ID
    const suggestion = await ctx.orm.Suggestion.findOne({ where: { userId: userId, translatedSentenceId: translatedSentenceId} });

    if (!suggestion) {
      ctx.status = 404;
      ctx.body = { error: 'La sugerencia no se encontró.' };
      return;
    }

    // Verifica si el usuario actual es el propietario de la sugerencia
    if (suggestion.userId !== userId) {
      ctx.status = 403; // Prohibido
      ctx.body = 'No tienes permiso para editar esta sugerencia.';
      return;
    }

    // Actualiza los datos de la sugerencia
    suggestion.text = suggestionAttributes.text;
    suggestion.comments = suggestionAttributes.comments;
    suggestion.changesFinalTranslation = suggestionAttributes.changesFinalTranslation;
    
    await suggestion.update();
    await suggestion.save();

    ctx.status = 200;
    ctx.body = { message: 'Sugerencia actualizada exitosamente' };
  } catch (error) {
    ctx.status = 400;
    ctx.body = error;
  }
});

router.get('suggestions.show', "/user/:userId", async (ctx) => {
    const userId = ctx.params.userId;

    try {
        const suggestions = await ctx.orm.Suggestion.findAll({
            where: {
                userId: userId
            }
        });
        ctx.body = suggestions;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.get('suggestions.show', "/user/translatedsentence/:translatedSentenceId", async (ctx) => {
  const token = ctx.request.headers.authorization;
  const translatedSentenceId = ctx.params.translatedSentenceId;
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
        const suggestions = await ctx.orm.Suggestion.findAll({
            where: {
                userId: userId,
                translatedSentenceId: translatedSentenceId
            }
        });
        ctx.body = suggestions;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.delete('suggestions.destroyAll','/', async (ctx) => {
    try {
      // Eliminar todos las sugerencias
      await ctx.orm.Suggestion.destroy({ where: {} });
      ctx.status = 200;
      ctx.body = { message: 'Todas las sugerencias han sido eliminados.' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar las sugerencias.' };
    }
  });

// Ruta para eliminar una sugerencia por su ID
router.delete('suggestions.delete', '/delete/:translatedSentenceId', async (ctx) => {
  const token = ctx.request.headers.authorization;
  const translatedSentenceId = ctx.params.translatedSentenceId;

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

    if (decodedToken.userId !== userId) {
      ctx.status = 403; // Prohibido
      ctx.body = 'No tienes permiso para eliminar estas correcciones.';
      return;
    }

    // Busca todas las sugerencias por su ID, userId y translatedSentenceId
    await ctx.orm.Suggestion.destroy({
      where: {
        userId: userId,
        translatedSentenceId: translatedSentenceId
      }
    });

    ctx.status = 204; // Sin contenido
    ctx.body = "sugerencia eliminada con exito"
  } catch (error) {
    ctx.status = 400;
    ctx.body = error;
  }
});


router.get('suggestions.result', '/result/:groupId', async (ctx) => {
  const groupId = ctx.params.groupId;
  const userId = ctx.request.query.userId;

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

  try {
    const groupReports = await ctx.orm.ReportGroupReport.findAll({
      where: { reportGroupId: groupId },
      attributes: ['reportId'],
      include: [
        {
          model: ctx.orm.Report,
          attributes: ['id', 'impression', 'findings', 'background', 'report_file', 'original_language', 'report_translated'],
          order: [['id', 'ASC']],
          include: [
            {
              model: ctx.orm.Sentence,
              as: 'sentences',
              attributes: ['id', 'text', 'array_index', 'sentence_type'],
              order: [['id', 'ASC']],
              include: [
                {
                  model: ctx.orm.TranslatedSentence,
                  as: 'translatedSentence',
                  attributes: ['id', 'text'],
                  order: [['id', 'ASC']],
                  include: [
                    {
                      model: ctx.orm.Suggestion,
                      as: 'suggestions',
                      where: { userId: userId },
                      required: false,
                      attributes: ['changesFinalTranslation'],
                      separate: true
                    }
                  ],
                  required: false
                }
              ]
            }
          ]
        }
      ],
      order: [
        [ctx.orm.Report, { model: ctx.orm.Sentence, as: 'sentences' }, 'id', 'ASC']
      ]
    });

    const finalResult = groupReports.map(grp => {
      const report = grp.Report;
      if (!report) {
        return {
          reportId: null,
          sentences: []
        };
      }

      const impression = report.impression;
      const findings = report.findings;

      const background_sentences = [];
      const findings_sentences = [];
      const impression_sentences = [];

      const background_translated_sentences = [];
      const findings_translated_sentences = [];
      const impression_translated_sentences = [];

      const suggested_background_sentences = [];
      const suggested_findings_sentences = [];
      const suggested_impression_sentences = [];

      const sentencesFormatted = (report.sentences || []).map(sentence => {
        let suggestion;

        if (
          sentence.translatedSentence &&
          sentence.translatedSentence.suggestions &&
          sentence.translatedSentence.suggestions.length > 0
        ) {
          suggestion = sentence.translatedSentence.suggestions[0].changesFinalTranslation;
        }

        switch (sentence.sentence_type) {
          case 'background':
            background_sentences.push(sentence.text);
            background_translated_sentences.push(sentence.translatedSentence.text);
            if (suggestion) {
              suggested_background_sentences.push(suggestion);
            } else {
              suggested_background_sentences.push("no suggestion");
            }
            break;
          case 'findings':
            findings_sentences.push(sentence.text);
            findings_translated_sentences.push(sentence.translatedSentence.text);
            if (suggestion) {
              suggested_findings_sentences.push(suggestion);
            } else {
              suggested_findings_sentences.push("no suggestion");
            }
            break;
          case 'impression':
            impression_sentences.push(sentence.text);
            impression_translated_sentences.push(sentence.translatedSentence.text);
            if (suggestion) {
              suggested_impression_sentences.push(suggestion);
            } else {
              suggested_impression_sentences.push("no suggestion");
            }
            break;
        }
      });

      return {
        report_id: report.id,
        impression: impression,
        findings: findings,
        background_sentences: background_sentences,
        findings_sentences: findings_sentences,
        impression_sentences: impression_sentences,
        background_translated_sentences: background_translated_sentences,
        findings_translated_sentences: findings_translated_sentences,
        impression_translated_sentences: impression_translated_sentences,
        suggested_background_sentences: suggested_background_sentences,
        suggested_findings_sentences: suggested_findings_sentences,
        suggested_impression_sentences: suggested_impression_sentences,
        original_language: report.original_language,
        report_file: report.report_file,
        report_used_for_translation: report.report_translated,
      };
    });

    ctx.status = 200;
    ctx.body = finalResult;
  } catch (error) {
    ctx.status = 400;
    ctx.body = error.message || error;
  }
});


module.exports = router