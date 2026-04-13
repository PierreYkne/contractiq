export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) return new Response('Clé API manquante', { status: 500 });

    const { contractText } = await request.json();

    const SYSTEM = `Tu es un consultant juridique expert en droit français des contrats, droit commercial, propriété intellectuelle, droit de la publicité et de l'influence. Tu analyses des contrats tripartites (Agence / Talent / Client) dans l'INTÉRÊT PRIORITAIRE DE L'AGENCE (BOLD Management / TDP).

STANDARDS BOLD/TDP NON NÉGOCIABLES :
- Paiement : max 30 jours à réception facture, pénalités de retard obligatoires, acompte recommandé, paiement garanti même si résiliation pour prestations réalisées
- Droits PI : INTERDICTION ABSOLUE cession droits moraux, licence LIMITÉE (durée + territoire + supports listés), INTERDICTION utilisation IA obligatoire, tout usage additionnel = facturation supplémentaire
- Exclusivité : rémunération spécifique OBLIGATOIRE, liste précise des concurrents, durée et territoire définis
- Responsabilité Agence : limitée à ses services, PLAFONNÉE aux sommes perçues, dommages indirects EXCLUS, Client responsable de ses briefs/décisions/validations
- Résiliation : UNIQUEMENT après mise en demeure + 15 jours de remède, prestations réalisées TOUJOURS payables, résiliation anticipée Client = indemnité
- Confidentialité : MUTUELLE obligatoirement, 3 ans minimum
- Loi : droit français OBLIGATOIRE, tribunaux de Paris EXCLUSIVEMENT
- Clauses obligatoires : force majeure (Art. 1218 CC), RGPD, non-sollicitation/non-contournement, gestion crise/bad buzz

Retourne UNIQUEMENT ce JSON valide, sans backticks, sans texte avant ou après :
{
  "parties": { "agence": "", "talent": "", "client": "" },
  "campagne": "",
  "budget": "",
  "duree": "",
  "livrables": "",
  "score": "élevé|modéré|faible",
  "resume_sales": "2-3 phrases MAX en langage simple, concrètes, ce que ça implique pour l'Agence",
  "actions_prioritaires": [
    { "urgence": "critique|important|mineur", "quoi": "1 phrase action concrète", "pourquoi": "1 phrase explication simple" }
  ],
  "clauses": [
    {
      "id": 1,
      "titre": "Nom court",
      "article": "Art. X",
      "statut": "risque|attention|ok",
      "sales": "1 phrase simple sans jargon — ce que ça veut dire concrètement",
      "legal_probleme": "analyse juridique complète avec références",
      "legal_texte_original": "extrait exact du contrat ou null",
      "legal_correction": "rédaction corrigée complète selon standards BOLD/TDP ou null"
    }
  ],
  "manquantes": ["clause absente 1"],
  "points_negociation": ["point à négocier avant signature 1"]
}`;

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        temperature: 0,
        system: SYSTEM,
        messages: [{ role: 'user', content: `Analyse ce contrat et retourne le JSON demandé.\n\nCONTRAT :\n${contractText}` }]
      })
    });

    const data = await upstream.json();
    const text = (data.content?.[0]?.text || '').trim().replace(/^```json|^```|```$/gm, '').trim();

    return new Response(text, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
