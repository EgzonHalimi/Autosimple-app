const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const fs = require('fs');

// Ruaj të dhënat në memory
let users = [];

// Ngarko të dhënat ekzistuese
try {
    if (fs.existsSync('./data/users.json')) {
        const data = fs.readFileSync('./data/users.json', 'utf8');
        users = JSON.parse(data).map(u => new User(u));
    }
} catch (error) {
    console.log('No existing users data');
}

// Krijo folderin data
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

const saveUsers = () => {
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
};

// REGJISTRIM
exports.signup = async (req, res) => {
    try {
        const { username, email, password, profile } = req.body;
        
        if (users.some(u => u.username === username)) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        if (users.some(u => u.email === email)) {
            return res.status(400).json({ error: 'Email already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            profile: profile || {}
        });
        
        if (users.length === 0) {
            newUser.isAdmin = true;
        }
        
        users.push(newUser);
        saveUsers();
        
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, isAdmin: newUser.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                profile: newUser.profile
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;
        
        const user = users.find(u => u.username === identifier || u.email === identifier);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jwt.sign(
            { id: user.id, username: user.username, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                isAdmin: user.isAdmin,
                profile: user.profile
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};