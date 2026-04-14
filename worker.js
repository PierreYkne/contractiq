export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('OK', { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    try {
      const { contractText } = await request.json();

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'REMPLACER_CLE',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 8000,
          temperature: 0,
          system: 'Tu es expert juridique contrats influence France. Analyse dans interet AGENCE. Standards BOLD/TDP: paiement max 30j+penalites, pas droits moraux, licence limitee+interdiction IA, exclusivite remuneree+concurrents listes, responsabilite Agence plafonnee+dommages indirects exclus, resiliation apres mise en demeure 15j, confidentialite mutuelle 3ans, droit francais+Paris, RGPD, force majeure Art.1218. Retourne UNIQUEMENT JSON valide sans backticks: {"parties":{"agence":"","talent":"","client":""},"campagne":"","budget":"","duree":"","livrables":"","score":"eleve|modere|faible","resume_sales":"2-3 phrases simples","actions_prioritaires":[{"urgence":"critique|important|mineur","quoi":"action","pourquoi":"raison"}],"clauses":[{"id":1,"titre":"","article":"Art.X","statut":"risque|attention|ok","sales":"1 phrase simple","legal_probleme":"analyse complete","legal_texte_original":"extrait ou null","legal_correction":"correction ou null"}],"manquantes":[""],"points_negociation":[""]}',
          messages: [{
            role: 'user',
            content: 'Analyse ce contrat:\n\n' + contractText
          }]
        })
      });

      const data = await response.json();
      const text = (data.content?.[0]?.text || '').trim().replace(/^```json|^```|```$/gm, '').trim();

      return new Response(text, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
  }
};
