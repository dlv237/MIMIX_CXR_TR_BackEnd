const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();
const argon2 = require('argon2');

router.get("users.list","/",async(ctx)=>{
    try{
        const users = await ctx.orm.User.findAll();
        ctx.body = users;
        ctx.status = 200;
    } catch(error){
        ctx.body = error;
        ctx.status = 400;
    }
})

router.get('users.show', '/user', async (ctx) => {
    const token = ctx.request.headers.authorization;
    //console.log("el token:",token)

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
      //console.log("accessToken:",accessToken)
      
    try {
        const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET);
        const userId = decodedToken.userId;
        const user = await ctx.orm.User.findByPk(userId);

        //console.log('User:', user); // Agrega logs de depuración
        if (user) {
        ctx.body = user;
        ctx.status = 200;
          } 
        } catch (error) {
          ctx.body = error;
          ctx.status = 400;
        }});
      


  
router.delete('users.delete', '/delete/:userId', async (ctx) => {
  const userId = ctx.params.userId;
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

  console.log("accessToken:",accessToken)
  try {
      const user = await ctx.orm.User.findByPk(userId);
      await user.destroy();

      /*
      if (user.role !== 'Admin') {
          ctx.status = 403; // Prohibido
          ctx.body = 'No tienes permiso para realizar esta acción';
          return;
      } 
      */

      ctx.body = user;
      ctx.status = 201;
    } catch (error) {
      ctx.body = error;
      ctx.status = 400;
    }
  });

router.delete('users.deleteAll', '/', async (ctx) => {
    try {
      await ctx.orm.User.destroy({ where: {} });
      ctx.status = 200;
      ctx.body = { message: 'Todos los usuarios han sido eliminados.' };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Ocurrió un error al eliminar todos los usuarios.' };
    }
  });

  router.delete('users.delete', '/delete/:userId', async (ctx) => {
    const userId = ctx.params.userId;
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
        const userRole = decodedToken.role;
        //console.log("userRole", userRole)
        // Verifica que el usuario tenga el rol de administrador
        if (userRole !== 'Admin') {
            ctx.status = 403; // Prohibido
            ctx.body = 'No tienes permiso para realizar esta acción';
            return;
        }

        const user = await ctx.orm.User.findByPk(userId);
        if (user) {
            await user.destroy();
            ctx.status = 200;
            ctx.body = { message: `Usuario con ID ${userId} ha sido eliminado.` };
        } else {
            ctx.status = 404; // No encontrado
            ctx.body = { error: 'Usuario no encontrado.' };
        }
    } catch (error) {
        ctx.status = 500;
        ctx.body = { error: 'Ocurrió un error al eliminar el usuario.' };
    }
});

router.put('users.update', '/update', async (ctx) => {

    try {

      const user = await ctx.orm.User.findOne({ where: { email: ctx.request.body.email } });
      if (user) {
        const { firstName, lastName, email, role, password } = ctx.request.body;

        const hashedPassword = await argon2.hash(password);

        await user.update({ firstName, lastName, email, role, password: hashedPassword });
        ctx.status = 200;
        ctx.body = user;
      } else {
        ctx.status = 404;
        ctx.body = { error: 'Usuario no encontrado.' };
      }
    }
    catch (error) {
      ctx.status = 500;
    }

  }
);

router.get('users.list', '/list', async (ctx) => {
  try {
    const queryIds = ctx.query.usersIds;
    const userIds = queryIds.split(',').map(id => parseInt(id, 10));
    
    const users = await ctx.orm.User.findAll({
      where: {
        id: userIds
      }
    });
    ctx.body = users;
    ctx.status = 200;
  } catch (error) {
    ctx.body = error;
    ctx.status = 400;
  }
});
  
module.exports = router;