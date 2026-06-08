/**
 * Data controller — placeholder for future API integrations
 * Currently the frontend fetches directly from Google Sheets.
 * This controller can be used to:
 * - Proxy Google Sheets requests (to hide API keys)
 * - Cache data in the database
 * - Integrate with external APIs
 */

/**
 * GET /api/data/production
 * Future: proxy to Google Sheets or external API
 */
async function getProduction(req, res) {
  res.json({
    message: 'Endpoint preparado para futura integração com API',
    status: 'placeholder'
  });
}

module.exports = { getProduction };
