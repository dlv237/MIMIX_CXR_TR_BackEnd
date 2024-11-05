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




module.exports = router