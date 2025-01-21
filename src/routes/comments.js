const jwt = require('jsonwebtoken');
const Router = require('koa-router');
const router = new Router();

router.get('comments.list', '/', async (ctx) => {
    try {
        const comments = await ctx.orm.Comment.findAll();
        ctx.status = 200;
        ctx.body = comments;
    } catch (error) {
        ctx.status = 400;
        ctx.body = { error: 'No se pudieron obtener los comentarios.' };
    }
});

router.get('comments.translatedSentenceId', '/:translatedSentenceId', async (ctx) => {
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
        const comments = await ctx.orm.Comment.findOne({
            where: {
                translatedSentenceId: ctx.params.translatedSentenceId,
                userId: userId
            }
        });
        ctx.status = 200;
        ctx.body = comments;
    } catch (error) {
        ctx.status = 400;
        console.log(error);
        ctx.body = { error: 'No se pudieron obtener los comentarios.' };
    }
});

router.put('comments.update', '/:id', async (ctx) => {
    const token = ctx.request.headers.authorization;
    const commentAttributes = ctx.request.body;
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

        const comment = await ctx.orm.Comment.findOne({
            where: {
                userId: userId,
                id: ctx.params.id,
            },
        });

        await ctx.orm.TranslatedSentence.update(
            { hasComments: true },
            { where: { id: comment.translatedSentenceId } }
        )
        
        if (comment) {
            await comment.update(commentAttributes);
            ctx.body = comment;
            ctx.status = 200;
        }
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.delete('comments.delete', '/:id', async (ctx) => {
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

        const comment = await ctx.orm.Comment.findOne({
            where: {
                userId: userId,
                id: ctx.params.id,
            },
        });

        if (comment) {
            await comment.destroy();
            ctx.status = 204;
        }
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.post('comments.create', '/', async (ctx) => {
    const token = ctx.request.headers.authorization;
    console.log(token);
    const commentAttributes = ctx.request.body;
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

        commentAttributes.userId = userId;

        const comment = await ctx.orm.Comment.create(commentAttributes);
        await ctx.orm.TranslatedSentence.update(
            { hasComments: true },
            { where: { id: comment.translatedSentenceId } }
        )
        ctx.body = comment;
        ctx.status = 201;
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.patch('comments.update', '/:id', async (ctx) => {
    const token = ctx.request.headers.authorization;
    const commentAttributes = ctx.request.body;
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

        const comment = await ctx.orm.Comment.findOne({
            where: {
                userId: userId,
                id: ctx.params.id,
            },
        });

        if (comment) {
            await comment.update(commentAttributes);
            ctx.body = comment;
            ctx.status = 200;
        }
    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

router.patch('comments.stateUdate', '/:id/state', async (ctx) => {
    const commentAttributes = ctx.request.body;

    try {

        const comment = await ctx.orm.Comment.findOne({
            where: {
                id: ctx.params.id,
            },
        });

        if (comment) {
            await comment.update(commentAttributes);
            ctx.body = comment;
            ctx.status = 200;
        }

    } catch (error) {
        ctx.body = error;
        ctx.status = 400;
    }
});

module.exports = router;