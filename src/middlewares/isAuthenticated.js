const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

async function isAuthenticated(req, res, next) {
    // extract jwt
    const token = req.header('Authorization'[1]);
    if (!token) {
        return res.status(401).json({ message: 'Access Denied' });
    }
    try {
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        console.log(`error decoding token: ${error}`);
    }
}


module.exports = isAuthenticated;
