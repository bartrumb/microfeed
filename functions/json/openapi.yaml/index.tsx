interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export async function onRequestGet({ env }: { env: Env }) {
  // Read the YAML file from the public directory
  const yamlContent = await env.ASSETS.fetch(new Request('/openapi.yaml')).then((res: Response) => res.text());
  
  return new Response(yamlContent, {
    headers: {
      'Content-Type': 'application/yaml',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

export function onRequestHead(): Response {
  return new Response(null, {
    headers: {
      'Content-Type': 'application/yaml',
      'Access-Control-Allow-Origin': '*'
    }
  });
}