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
          'x-api-key': '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',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          temperature: 0,
          system: 'Tu es expert juridique contrats influence France. Analyse dans interet AGENCE BOLD/TDP. Reponds UNIQUEMENT avec du JSON valide. Pas de texte avant ou apres, pas de backticks. Format exact: {"parties":{"agence":"","talent":"","client":""},"campagne":"","budget":"","duree":"","livrables":"","score":"eleve|modere|faible","resume_sales":"2-3 phrases simples","actions_prioritaires":[{"urgence":"critique|important|mineur","quoi":"action","pourquoi":"raison"}],"clauses":[{"id":1,"titre":"","article":"Art.X","statut":"risque|attention|ok","sales":"1 phrase","legal_probleme":"analyse","legal_texte_original":"extrait ou null","legal_correction":"correction ou null"}],"manquantes":[""],"points_negociation":[""]}',
          messages: [{
            role: 'user',
            content: 'Analyse ce contrat et retourne UNIQUEMENT le JSON:\n\n' + contractText.substring(0, 5000)
          }]
        })
      });

      const data = await response.json();

      if (data.error) {
        return new Response(JSON.stringify({ error: data.error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const raw = (data.content?.[0]?.text || '').trim();
      const start = raw.indexOf('{');
      const end = raw.lastIndexOf('}');

      if (start === -1 || end === -1) {
        return new Response(JSON.stringify({ error: 'JSON invalide', raw: raw.substring(0, 200) }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      const json = raw.substring(start, end + 1);

      return new Response(json, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }
  }
};
