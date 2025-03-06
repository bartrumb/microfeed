import { ADMIN_URLS } from "../../../common-src/StringUtils";

interface RequestContext {
  request: Request;
}

export async function onRequestGet({ request }: RequestContext): Promise<Response> {
  const urlObj = new URL(request.url);
  return Response.redirect(`${urlObj.origin}${ADMIN_URLS.editPrimaryChannel()}`, 302);
}
