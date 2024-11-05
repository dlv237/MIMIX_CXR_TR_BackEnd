const Router = require('koa-router');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const router = new Router();

router.post("authentication.signup", "/signup", async (ctx) => {
    const authInfo = ctx.request.body;

    try {
        const existingUser = await ctx.orm.User.findOne({ where: { email: authInfo.email } });

        if (existingUser) {
            ctx.status = 400;
            ctx.body = { error: 'The user with this email already exists' };
            return;
        }

        const hashedPassword = authInfo.password;

        const user = await ctx.orm.User.create({
            firstName: authInfo.firstName,
            lastName: authInfo.lastName,
            role: authInfo.role,
            email: authInfo.email,
            password: hashedPassword, // Store the hashed password
        });

        ctx.body = user;
        ctx.status = 201;
    } catch (error) {
        ctx.body = { error: 'An error occurred while creating the user' };
        ctx.status = 500;
    }
});

router.post("authentication.login", "/login", async (ctx) => {
    const authInfo = ctx.request.body;

    try {
        const user = await ctx.orm.User.findOne({ where: { email: authInfo.email } });

        if (!user) {
            ctx.status = 400;
            ctx.body = { error: 'User not found' };
            return;
        }

        const passwordMatch =authInfo.password;

        if (!passwordMatch) {
            ctx.status = 400;
            ctx.body = { error: 'Incorrect password' };
            return;
        }

        // Create a JWT payload
        const payload = { scope: 'user', userId: user.id };
        const JWT_PRIVATE_KEY = process.env.JWT_SECRET;
        const expirationSeconds = 1 * 60 * 60 * 24; // 1 day

        const token = jwt.sign(payload, JWT_PRIVATE_KEY, {
            subject: user.id.toString(),
            expiresIn: expirationSeconds
        });

        ctx.body = {
            access_token: token,
            token_type: 'Bearer',
            expires_in: expirationSeconds
        };
        ctx.status = 200;
    } catch (error) {
        console.error('Error during login:', error);
        ctx.status = 500;
        ctx.body = { error: 'An error occurred during login' };
    }
});

module.exports = router;
