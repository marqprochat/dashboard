const easyDentalService = require('../services/easyDentalService');

/**
 * Controller to handle EasyDental related requests
 */
const getAgendamentos = async (req, res) => {
  try {
    // Example using the logic from the user's request
    const { clientId, dt_inicio, dt_termino, nm_unidade } = req.body;

    // Optional: Validation
    if (!clientId) {
      return res.status(400).json({ error: 'clientId is required' });
    }

    const data = await easyDentalService.getAgendamentos(
      clientId || "5C9KnPvhhmQh", // Fallback to user example if not provided
      dt_inicio || "2026-01-01",
      dt_termino || "2026-01-31",
      nm_unidade || "Valinhos"
    );

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments from EasyDental',
      error: error.message
    });
  }
};

const getKPIPrd = async (req, res) => {
  try {
    const { clientId, dt_inicio, dt_termino, nm_unidade, nm_prestador } = req.body;
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    const data = await easyDentalService.getKPIPrd(clientId, dt_inicio, dt_termino, nm_unidade, nm_prestador);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch KPIs', error: error.message });
  }
};

const getPrestadorCPF = async (req, res) => {
  try {
    const { clientId, cpf } = req.body;
    if (!clientId || !cpf) return res.status(400).json({ error: 'clientId and cpf are required' });

    const data = await easyDentalService.getPrestadorCPF(clientId, cpf);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch provider', error: error.message });
  }
};

const getUnidades = async (req, res) => {
  try {
    const { clientId } = req.body;
    if (!clientId) return res.status(400).json({ error: 'clientId is required' });

    const data = await easyDentalService.getUnidadeAtendimento(clientId);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch units', error: error.message });
  }
};

module.exports = {
  getAgendamentos,
  getKPIPrd,
  getPrestadorCPF,
  getUnidades
};
