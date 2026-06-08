const express = require('express');
const router = express.Router();
const easyDentalController = require('../controllers/easyDentalController');

// Define the routes
router.post('/agendamentos', easyDentalController.getAgendamentos);
router.post('/kpi-producao', easyDentalController.getKPIPrd);
router.post('/prestador-cpf', easyDentalController.getPrestadorCPF);
router.post('/unidades', easyDentalController.getUnidades);

module.exports = router;
