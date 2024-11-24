const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();

router.get('usertranslatedsentences.list', '/', async (ctx) => {
    try {
        const userTranslatedSentences = await ctx.orm.UserTranslatedSentence.findAll();
        ctx.status = 200;
        ctx.body = userTranslatedSentences;
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: 'No se pudieron obtener los UserTranslatedSentences.' };
    }
});

router.get('usertranslatedsentences.byTSentence', '/:id', async (ctx) => {
    const token = ctx.request.headers.authorization;
    const translatedsentenceId = ctx.params.id;

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

        const userTranslatedSentences = await ctx.orm.UserTranslatedSentence.findOne({
            where: {
                userId: userId,
                translatedsentenceId: translatedsentenceId
            }
        });

      if (userTranslatedSentences) {
        ctx.body = userTranslatedSentences;
        ctx.status = 200;
      }
      else {
        ctx.status = 201;
        ctx.body = { error: 'UserTranslatedSentence no encontrado.' };
      }
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.get('usertranslatedsentences.byGroupId', '/countTotal/:id', async (ctx) => {
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

      const groupId = ctx.params.id;
  
      const reportgroupreports = await ctx.orm.ReportGroupReport.findAll({
        where: {
          reportGroupId: groupId,
        },
      });
    
      const reportIds = reportgroupreports.map((report) => report.reportId);
      const reports = await ctx.orm.Report.findAll({
        where: {
          id: reportIds,
        },
      });
  
      // Obtener las user translated sentences asociadas a los reportes
      const userTranslatedSentences = [];
  
      for (const report of reports) {
        const translatedSentences = await ctx.orm.TranslatedSentence.findAll({
          where: {
            reportId: report.id,
          },
        });
  
        for (const translatedSentence of translatedSentences) {
          const userTranslatedSentence = await ctx.orm.UserTranslatedSentence.findOne({
            where: {
              userId: userId,  
              translatedsentenceId: translatedSentence.id
            },
          });
  
          if (userTranslatedSentence) {
            userTranslatedSentences.push(userTranslatedSentence);
          }
        }
      }
        ctx.body = userTranslatedSentences;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
  });
  

router.get('usertranslatedsentences.byReport', '/reportProgress/:id', async (ctx) => {
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

      const groupId = ctx.params.id;
  
      const reportgroupreports = await ctx.orm.ReportGroupReport.findAll({
        where: {
          reportGroupId: groupId,
        },
      });
    
      const reportIds = reportgroupreports.map((report) => report.reportId);
      const reports = await ctx.orm.Report.findAll({
        where: {
          id: reportIds,
        },
      });
  
      // Obtener las user translated sentences asociadas a los reportes
      const userTranslatedSentences = [];
  
      for (const report of reports) {
        const translatedSentences = await ctx.orm.TranslatedSentence.findAll({
          where: {
            reportId: report.id,
          },
        });
  
        for (const translatedSentence of translatedSentences) {
          const userTranslatedSentence = await ctx.orm.UserTranslatedSentence.findOne({
            where: {
              userId: userId,  
              translatedsentenceId: translatedSentence.id
            },
          });
  
          if (userTranslatedSentence) {
            userTranslatedSentences.push(userTranslatedSentence);
          }
        }
      }
        ctx.body = userTranslatedSentences;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
  });
  

router.post('usertranslatedsentences.create', '/:id', async (ctx) => {
    const token = ctx.request.headers.authorization;
    const userTranslatedSentenceAttributes = ctx.request.body;
    const translatedsentenceId = ctx.params.id;
    //console.log(translatedsentenceId)
    //console.log(userTranslatedSentenceAttributes)

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

        const userTranslatedSentence = await ctx.orm.UserTranslatedSentence.create({
            userId: userId,
            translatedsentenceId: translatedsentenceId,
            state: true,
            isSelectedCheck: userTranslatedSentenceAttributes.isSelectedCheck,
            isSelectedTimes: userTranslatedSentenceAttributes.isSelectedTimes,
            hasAcronym: userTranslatedSentenceAttributes.hasAcronym
        });
        //console.log("USTP created: ", userTranslatedSentence)
        ctx.body = userTranslatedSentence;
        ctx.status = 201;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.put('usertranslatedsentences.update', '/update/:id', async (ctx) => {
    const token = ctx.request.headers.authorization;
    const userTranslatedSentenceAttributes = ctx.request.body;
    const translatedsentenceId = ctx.params.id;

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

        const userTranslatedSentence = await ctx.orm.UserTranslatedSentence.findOne( { where: {
            userId: userId, 
            translatedsentenceId: translatedsentenceId,
          }
        });

        if (!userTranslatedSentence) {
            ctx.status = 201; // No encontrado
            ctx.body = 'UserTranslatedSentence no encontrado';
            return;
        }

        // Actualizar los campos según lo que se proporciona en el body de la solicitud
        userTranslatedSentence.isSelectedCheck = userTranslatedSentenceAttributes.isSelectedCheck !== undefined ? userTranslatedSentenceAttributes.isSelectedCheck : userTranslatedSentence.isSelectedCheck;
        userTranslatedSentence.isSelectedTimes = userTranslatedSentenceAttributes.isSelectedTimes !== undefined ? userTranslatedSentenceAttributes.isSelectedTimes : userTranslatedSentence.isSelectedTimes;

        if (userTranslatedSentenceAttributes.state !== undefined) {
            userTranslatedSentence.state = userTranslatedSentenceAttributes.state;
            userTranslatedSentence.isSelectedCheck = userTranslatedSentenceAttributes.state ? userTranslatedSentenceAttributes.isSelectedCheck : userTranslatedSentence.isSelectedCheck;
            userTranslatedSentence.isSelectedTimes = userTranslatedSentenceAttributes.state === false ? userTranslatedSentenceAttributes.isSelectedTimes : userTranslatedSentence.isSelectedTimes;
            userTranslatedSentence.hasAcronym = userTranslatedSentenceAttributes.hasAcronym;
        }

        await userTranslatedSentence.save();
        //console.log("USTP updated: ", userTranslatedSentence)
       
        ctx.body = userTranslatedSentence;
        ctx.status = 200; // OK
    } catch (error) {
        ctx.body = error;
        ctx.status = 400; // Error de solicitud
    }
});


router.get('usertranslatedsentences.show', '/user/:userId', async (ctx) => {
    const userId = ctx.params.userId;

    try {
        const userTranslatedSentences = await ctx.orm.UserTranslatedSentence.findAll({
            where: {
                userId: userId
            }
        });
        ctx.body = userTranslatedSentences;
        ctx.status = 200;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.delete('usertranslatedsentences.delete', '/:id', async (ctx) => {
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

        const userTranslatedSentence = await ctx.orm.UserTranslatedSentence.findOne({
            where: {
                userId: userId,
                translatedsentenceId: ctx.params.id
            }
        });
        if (!userTranslatedSentence) {
            ctx.status = 404; // No encontrado
            ctx.body = 'UserTranslatedSentence no encontrado';
            return;
        }

        // Verificar que el usuario actual es dueño del UserTranslatedSentence antes de eliminarlo
        if (userTranslatedSentence.userId !== userId) {
            ctx.status = 403; // Prohibido
            ctx.body = 'No tienes permisos para eliminar este UserTranslatedSentence';
            return;
        }

        await userTranslatedSentence.destroy();

        ctx.body = 'UserTranslatedSentence eliminado con éxito';
        ctx.status = 204; // Sin contenido
    } catch (error) {
        ctx.body = error;
        ctx.status = 400; // Error de solicitud
    }
});

router.delete('usertranslatedsentences.list', '/user/all', async (ctx) => {
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

    
        await ctx.orm.UserTranslatedSentence.destroy({ where: { userId: userId } });

        ctx.body = 'UserTranslatedSentences eliminados con éxito';
        ctx.status = 200;
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: 'No se pudieron eliminar los UserTranslatedSentences.' };
    }
});

// Define el endpoint para obtener el estado de revisión de un reporte
router.get('report.completed', '/completed/:reportId', async (ctx) => {
  const token = ctx.request.headers.authorization;

  // Verifica la existencia del token
  if (!token) {
    ctx.status = 401; // No autorizado
    ctx.body = 'Token no proporcionado';
    return;
  }

  // Verifica el formato del token
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
    const reportId = ctx.params.reportId;
    const translatedSentences = await ctx.orm.TranslatedSentence.findAll({
      where: {
        reportId: reportId,
      },
    });
    const translatedSentencesFiltered = translatedSentences.filter((sentence) => sentence.text.trim().length > 0);

    const userTranslatedSentences = [];

    for (const translatedSentence of translatedSentences) {
        
      const userTranslatedSentence = await ctx.orm.UserTranslatedSentence.findOne({
        where: {
          userId: userId,
          translatedsentenceId: translatedSentence.id,
        },
      });

      if (userTranslatedSentence) {
        userTranslatedSentences.push(userTranslatedSentence);
      }
    }
    // Verifica si todas las oraciones han sido revisadas
    const allReviewed = userTranslatedSentences.every((uts) => uts.isSelectedCheck || uts.isSelectedTimes) &&
     userTranslatedSentences.length === translatedSentencesFiltered.length;
     //console.log("userTranslatedSentences: ", userTranslatedSentences);
      //console.log("translatedSentences: ", translatedSentences);
        
     //console.log("userTranslatedSentences.length: ", userTranslatedSentences.length);
     //console.log("translatedSentencesFiltered.length: ", translatedSentencesFiltered.length);
    // Devuelve el resultado
    ctx.body = { completed: allReviewed };
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});

module.exports = router;
