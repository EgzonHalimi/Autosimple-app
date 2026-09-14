const express = require('express');
const router = express.Router();
const carController = require('../controllers/carController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', carController.getCars);
router.get('/:id', carController.getCar);
router.post('/', authMiddleware, carController.addCar);

module.exports = router;