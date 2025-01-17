const { getUserByEmail } = require('../models/userModel');
const jwt = require('jsonwebtoken');

const storeRefreshToken = async (userId, refreshToken) => { }

const storeAccessToken = async (userId, accessToken) => { }

const createToken = async (data) => {
    const jwtToken = jwt.sign(
        {
            email: data.email,
            accessToken: data.accessToken,
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return jwtToken;
}

const createCookie = async (res, token) => {
    res.cookie('auth', token, {
        httpOnly: true,
        sameSite: 'none',
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    });
}

const verifyUser = async (email) => {
    try {
        const user = await getUserByEmail(email);
        if (!user) {
            console.log('here')
            return false;
        }
        return user;
    } catch (error) {
        res.status(500).send('Failed to verify user!');
    }
}

const decodeJWT = (token) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
}

module.exports = { storeRefreshToken, storeAccessToken, createToken, verifyUser, createCookie, decodeJWT };