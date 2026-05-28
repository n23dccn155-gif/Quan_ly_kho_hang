const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);
router.get('/', supplierController.getAllSuppliers);

module.exports = router;
