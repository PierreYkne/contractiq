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
          system: 'Tu es expert juridique contrats influence France. Analyse dans interet AGENCE BOLD/TDP. Reponds UNIQUEMENT avec du JSON valide commencant par { et finissant par }. Pas de texte avant ou apres. Format: {"parties":{"agence":"","talent":"","client":""},"campagne":"","budget":"","duree":"","livrables":"","score":"eleve|modere|faible","resume_sales":"2-3 phrases simples pour les Sales","actions_prioritaires":[{"urgence":"critique|important|mineur","quoi":"action concrete","pourquoi":"explication simple"}],"clauses":[{"id":1,"titre":"nom court","article":"Art.X ou Absent","statut":"risque|attention|ok","sales":"1 phrase simple","legal_probleme":"analyse juridique","legal_texte_original":"extrait ou null","legal_correction":"correction ou null"}],"manquantes":["clause absente"],"points_negociation":["point a negocier"]}',
          messages: [
            {
              role: 'user',
              content: 'Analyse ce contrat tripartite et retourne le JSON:\n\n' + contractText.substring(0, 6000)
            },
            {
              role: 'assistant',
              content: '{'
            }
          ]
        })
      });

      const data = await response.json();

      if (data.error) {
        return new Response(JSON.stringify({ error: data.error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        });
      }

      let text = '{' + (data.content?.[0]?.text || '').trim();
      const last = text.lastIndexOf('}');
      if (last !== -1) text = text.substring(0, last + 1);

      return new Response(text, {
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
