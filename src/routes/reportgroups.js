const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();

router.get('reportgroups.list', '/', async (ctx) => {
    try {
        const reportgroups = await ctx.orm.ReportGroup.findAll();   
        ctx.body = reportgroups;
        ctx.status = 200;
    } 
    
    catch(error){
        ctx.body = error;
        ctx.status = 400; 
    }
});

/*
router.post('reportgroups.create', '/', async (ctx) => {
    const { name, reportIds } = ctx.request.body;
    const createdReports = [];
    try {
      // Crear el grupo de reportes
      const reportgroup = await ctx.orm.ReportGroup.create({
        name: name,
      });

      for (const reportId of reportIds) {
        const reportgroupId = reportgroup.id;
        const createdReportGroupReport = await ctx.orm.ReportGroupReport.create({
          reportId: reportId,
          reportGroupId: reportgroup.id,
        });
        createdReports.push(createdReportGroupReport)
      }
      
      ctx.body = {
        reportgroup,
        createdReports,
    };
      ctx.status = 201;
      
    } catch (error) {
        console.error('Error al crear el grupo de reportes:', error);
        ctx.body = { error: error.message }; // Devuelve el mensaje de error específico
        ctx.status = 400;
    }
  });
  */

  router.post('reportgroups.create', '/', async (ctx) => {
    const { name, reportIds } = ctx.request.body;
    const createdReports = [];
    try {
      const validReports = await ctx.orm.Report.findAll({
        where: {
          id: reportIds
        }
      });
  
      if (validReports.length !== reportIds.length) {
        throw new Error("Uno o más reportIds proporcionados no son válidos.");
      }
  
      // Crear el grupo de reportes
      const reportgroup = await ctx.orm.ReportGroup.create({
        name: name,
      });
  
      // Agregar los reportIds al grupo de reportes
      for (const reportId of reportIds) {
        const createdReportGroupReport = await ctx.orm.ReportGroupReport.create({
          reportId: reportId,
          reportGroupId: reportgroup.id,
        });
        createdReports.push(createdReportGroupReport)
      }
      
      ctx.body = {
        reportgroup,
        createdReports,
      };
      ctx.status = 201;
      
    } catch (error) {
        console.error('Error al crear el grupo de reportes:', error);
        ctx.body = { error: error.message };
        ctx.status = 400;
    }
  });

  router.get('reportgroups.show', '/user', async (ctx) => {
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
      // Decodificar el token para obtener el userId
      const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
      const userId = decodedToken.userId;
  
      // Obtener todos los grupos de reportes para un usuario específico
      const userReportGroups = await ctx.orm.UserReportGroup.findAll({
        where: { userId }
      });

      const reportGroups = [];

      for (const userReportGroup of userReportGroups) {
        const reportGroupId = userReportGroup.reportGroupId;
      
        // Buscar el ReportGroup por su id
        const foundReportGroup = await ctx.orm.ReportGroup.findOne({
          where: { id: reportGroupId }
        });
      
        // Si se encuentra, agregarlo a la lista
        if (foundReportGroup) {
          reportGroups.push(foundReportGroup);
        }
      }
      
      // Ahora 'reportGroups' contiene todos los ReportGroup asociados al usuario
      //console.log(reportGroups);

      ctx.body = reportGroups;
      ctx.status = 200;
    } catch (error) {
      console.error('Error al obtener los grupos de reportes para el usuario:', error);
      ctx.body = { error: error.message };
      ctx.status = 400;
    }
  });
  
router.delete('reportgroups.delete', '/:id', async (ctx) => {
    const reportGroupId = ctx.params.id;
    
    try {
      // Eliminar el grupo de reportes
      await ctx.orm.ReportGroup.destroy({
        where: {
          id: reportGroupId
        }
      });
      ctx.status = 200;
      ctx.body = { message: 'Grupo de reportes eliminado exitosamente.' };
    } catch (error) {
      console.error('Error al eliminar el grupo de reportes:', error);
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar el grupo de reportes.' };
    }
  });

module.exports = router;