/**
 * Service to handle requests to the EasyDental API (RPC)
 */
class EasyDentalService {
  constructor() {
    this.apiUrl = 'https://prsrb.onrender.com/v1/rpc';
    this.apiKey = process.env.API_EASYDENTAL;
  }

  /**
   * General method to make RPC requests
   * @param {string} method - The RPC method to call (e.g., 'RPCGetAgendamentos')
   * @param {string} clientId - The client identifier
   * @param {Object} params - Parameters for the method
   * @returns {Promise<Object>} - The API response
   */
  async makeRequest(method, clientId, params = {}) {
    try {
      if (!this.apiKey) {
        throw new Error('API_EASYDENTAL key is not defined in .env');
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          clientId: clientId,
          method: method,
          params: params
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Request failed with status ${response.status}: ${JSON.stringify(errorData)}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in EasyDentalService:', error.message);
      throw error;
    }
  }

  /**
   * Specific example for obtaining appointments
   */
  async getAgendamentos(clientId, dtInicio, dtTermino, nmUnidade) {
    const params = {
      dt_inicio: dtInicio,
      dt_termino: dtTermino,
      nm_unidade: nmUnidade
    };

    return this.makeRequest('RPCGetAgendamentos', clientId, params);
  }

  /**
   * RPCGetKPIPrd - Returns production data for the dashboard
   */
  async getKPIPrd(clientId, dtInicio, dtTermino, nmUnidade = "", nmPrestador = "") {
    const params = {
      dt_inicio: dtInicio,
      dt_termino: dtTermino,
      nm_unidade: nmUnidade,
      nm_prestador: nmPrestador
    };

    return this.makeRequest('RPCGetKPIPrd', clientId, params);
  }

  /**
   * RPCGetPrestadorCPF - Returns provider ID and name by CPF
   */
  async getPrestadorCPF(clientId, cpf) {
    const params = {
      cpf: cpf
    };

    return this.makeRequest('RPCGetPrestadorCPF', clientId, params);
  }

  /**
   * RPCGetUnidadeAtendimento - Returns active unit IDs and names
   */
  async getUnidadeAtendimento(clientId) {
    return this.makeRequest('RPCGetUnidadeAtendimento', clientId, {});
  }
}

module.exports = new EasyDentalService();
