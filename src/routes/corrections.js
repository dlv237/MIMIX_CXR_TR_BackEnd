const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();

router.get('corrections.list', '/', async (ctx) => {
  try {
    const corrections = await ctx.orm.Correction.findAll();
    ctx.status = 200;
    ctx.body = corrections;
  } catch (error) {
    ctx.status = 400;
    ctx.body = { error: 'No se pudieron obtener las correcciones.' };
  }
});

router.get('corrections.id', '/:id', async (ctx) => {
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

    const correction = await ctx.orm.Correction.findOne({
      where: {
        userId: userId,
        id: ctx.params.id,
      },
    });

    if (correction) {
      ctx.body = correction;
      ctx.status = 200;
    }
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

router.post('corrections.create', '/', async (ctx) => {
  const token = ctx.request.headers.authorization;
  const correctionAttributes = ctx.request.body;
  //console.log("correctionAttributes: ", correctionAttributes)
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
    //console.log("correctionAttributes: ", correctionAttributes)
    // Crea la corrección
    const correction = await ctx.orm.Correction.create({
      userId: userId,
      translatedSentenceId: correctionAttributes.translatedSentenceId,
      wordSelected: correctionAttributes.wordSelected,
      wordIndex: correctionAttributes.wordIndex,
      errorType: correctionAttributes.errorType,
    });

    //console.log('Corrección creada exitosamente:', correction);
    ctx.body = correction;
    ctx.status = 201;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

router.get('corrections.show', "/user/:userId", async (ctx) => {
    const userId = ctx.params.userId;
    try {
        const corrections = await ctx.orm.Correction.findAll({
            where: {
                userId: userId
            }
        });
        ctx.body = corrections;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.get('corrections.show', "/user/translatedsentence/:translatedSentenceId", async (ctx) => {
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
        const corrections = await ctx.orm.Correction.findAll({
            where: {
                userId: userId,
                translatedSentenceId: translatedSentenceId
            }
        });
        ctx.body = corrections;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.delete('corrections.deleteByUserAndSentence', '/delete/user/:translatedSentenceId', async (ctx) => {
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

    // Eliminar todas las correcciones asociadas al userId y translatedSentenceId
    await ctx.orm.Correction.destroy({
      where: {
        userId: userId,
        translatedSentenceId: translatedSentenceId
      }
    });

    ctx.status = 204; // Sin contenido
  } catch (error) {
    ctx.status = 400;
    ctx.body = error;
  }
});


router.delete('corrections.destroyAll','/', async (ctx) => {
    try {
      // Eliminar todos las sugerencias
      await ctx.orm.Correction.destroy({ where: {} });
      ctx.status = 200;
      ctx.body = { message: 'Todas las sugerencias han sido eliminados.' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar las sugerencias.' };
    }
  });

  router.delete('corrections.deleteById', '/delete/:id', async (ctx) => {
    const token = ctx.request.headers.authorization;
    const correctionId = ctx.params.id;
  
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
  
      // Busca la corrección por su ID
      const correction = await ctx.orm.Correccion.findByPk(correctionId);
  
      // Verifica que la corrección exista
      if (!correction) {
        ctx.status = 404; // No encontrado
        ctx.body = { error: 'La corrección no se encontró.' };
        return;
      }
  
      // Verifica que el usuario actual sea el propietario de la corrección
      if (decodedToken.userId !== correction.userId) {
        ctx.status = 403; // Prohibido
        ctx.body = 'No tienes permiso para eliminar esta corrección.';
        return;
      }
  
      // Elimina la corrección
      await correction.destroy();
  
      ctx.status = 204; // Sin contenido
    } catch (error) {
      ctx.status = 400;
      ctx.body = error;
    }
  });
  
module.exports = router;
