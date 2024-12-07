const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const path = require('path');
const router = new Router();
const fs = require('fs');

const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

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

router.post('reportgroups.stats', '/stats', async (ctx) => {
  const { reportGroupId, userId } = ctx.request.body;

  const scriptPath = '/app/stats/report_creator.py';
  console.log('Ruta del script de Python:', scriptPath);
  const jsonFileName = `report.json`;
  const jsonFilePath = `/app/batch_report_files/batch_${reportGroupId}/user_${userId}/${jsonFileName}`;
  console.log('Ruta absoluta del archivo JSON:', jsonFilePath);

  try {
  
    if (fs.existsSync(jsonFilePath)) {
      const stats = fs.statSync(jsonFilePath);
      const lastModified = new Date(stats.mtime);
      const now = new Date();
      const diffMinutes = Math.floor((now - lastModified) / 1000 / 60);
      console.log('Diferencia de minutos:', diffMinutes);

      if (diffMinutes <= 30) {
        console.log('JSON encontrado en:', jsonFilePath);
        const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
        ctx.body = JSON.parse(jsonData);
        ctx.status = 200;
        return;
      }
    }



    const { stdout, stderr } = await exec(`python ${scriptPath} ${reportGroupId} ${userId}`);
    console.log('stdout:', stdout);

    if (stderr && !stderr.includes('[nltk_data]')) {
      console.error('Error en el script:', stderr);
      ctx.status = 500;
      ctx.body = { error: 'Error en el script de Python.' };
      return;
    }

    console.log('stdout:', stdout);

    if (fs.existsSync(jsonFilePath)) {
      console.log('JSON encontrado en:', jsonFilePath);
      const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
      ctx.body = JSON.parse(jsonData);
      ctx.status = 200;
      

    } else {
      console.error('PDF no encontrado en:', jsonFilePath);
      ctx.status = 500;
      ctx.body = { error: 'El reporte no fue generado correctamente.' };
    }
  } catch (error) {
    console.error('Error ejecutando script:', error);
    ctx.status = 500;
    ctx.body = { error: 'Error al generar el reporte.' };
  }
});


router.get('reportgroups.statsPdf', '/stats/:reportGroupId/:userId', async (ctx) => {
  const { reportGroupId, userId } = ctx.params;

  const pdfFileName = `report.pdf`;
  const pdfFilePath = `/app/batch_report_files/batch_${reportGroupId}/user_${userId}/${pdfFileName}`;
  console.log('Ruta absoluta del archivo PDF:', pdfFilePath);

  try {

    if (fs.existsSync(pdfFilePath)) {
      console.log('PDF encontrado en:', pdfFilePath);
      ctx.set('Content-Type', 'application/pdf');
      ctx.set('Content-Disposition', `attachment; filename="${pdfFileName}"`);
      ctx.body = fs.createReadStream(pdfFilePath);

    } else {
      console.error('PDF no encontrado en:', pdfFilePath);
      ctx.status = 500;
      ctx.body = { error: 'El reporte no fue generado correctamente.' };
    }
  } catch (error) {
    console.error('Error ejecutando script:', error);
    ctx.status = 500;
    ctx.body = { error: 'Error al generar el reporte.' };
  }
}
);

module.exports = router;