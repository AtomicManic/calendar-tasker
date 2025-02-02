const { domains } = require('googleapis/build/src/apis/domains');
const { getUserByEmail } = require('../models/userModel');
const jwt = require('jsonwebtoken');

const storeRefreshToken = async (userId, refreshToken) => { }

const storeAccessToken = async (userId, accessToken) => { }

const createToken = async (data) => {
    const jwtToken = await jwt.sign(
        {
            email: data.email,
            accessToken: data.accessToken,
            googleId: data.googleId
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return jwtToken;
}

const createCookie = async (res, token) => {
    res.cookie('auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
        path: '/',
        domain: 'localhost'
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

const getUserPhoneNumber = async (accessToken) => {
    try {
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=phoneNumbers', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        console.log('Phone number response:', response);
        const data = await response.json();

        if (data.phoneNumbers && data.phoneNumbers.length > 0) {
            return data.phoneNumbers[0].value;
        } else {
            return "No phone number found";
        }
    } catch (error) {
        console.error("Error fetching phone number:", error);
        return null;
    }
};

module.exports = { storeRefreshToken, storeAccessToken, createToken, verifyUser, createCookie, decodeJWT, getUserPhoneNumber };