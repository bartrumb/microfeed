import {MICROFEED_VERSION} from "../../../common-src/Version";

export default async function handler(request, env, ctx) {
  // Get the base URL from the request
  const baseUrl = new URL(request.url).origin;

  // Define the OpenAPI spec inline
  const yamlContent = `openapi: "3.1.0"
info:
  version: "${MICROFEED_VERSION}"
  title: "microfeed api"
  description: |
    Allows to use microfeed as a headless cms or integrate with external services like Zapier.
    Using the microfeed api, you can programmatically create, update, delete items, and update the channel metadata.
  termsOfService: "https://github.com/microfeed/microfeed/blob/main/LICENSE"
  contact:
    name: "Listen Notes, Inc."
    url: "https://www.microfeed.org"
    email: "support@microfeed.org"
servers:
  - url: "${baseUrl}"
    description: API Production Server
tags:
  - name: Feed API
    description: |
      Read-only endpoints to fetch the jsonfeed and individual items.
      Anyone can use Feed API endpoints without authentication.
      In other words, these endpoints are public.
      You can disable Feed API endpoints at ${baseUrl}/admin/settings/ -
      toggle "Visible" of "JSON" in the "Subscribe methods" section.
  - name: Admin API
    description: |
      Endpoints to do CRUD operations on the microfeed instance, e.g.,
      create a new item, update an existing item, delete an item, upload media files...
      You need to use your microfeed instance's API key to access these endpoints.
      You can find your microfeed instance's API key at the API section of ${baseUrl}/admin/settings/.
paths:
  /json:
    get:
      tags:
        - Feed API
      summary: Fetches json for a feed
      description: |
        Fetches json data for a feed, including channel metadata and a list of items.
        The response data is in JSON feed format. For the formal JSON feed definition,
        please see https://www.jsonfeed.org/version/1.1/
        The response data can also be used as variables in the Web Feed mustache template at
        /admin/settings/code-editor/?type=themes&theme=custom#webFeed
      operationId: fetchFeedJson
      parameters:
        - name: next_cursor
          in: query
          description: |
            Offset for items, for pagination. You'll use **next_cursor** from response for this parameter.
          required: false
          schema:
            type: integer
            example: 1672707197212
        - name: sort
          in: query
          description: |
            How do you want to sort these items?
          required: false
          schema:
            type: string
            example: newest_first
            default: newest_first
            enum: [ "newest_first", "oldest_first" ]
      responses:
        200:
          description: Success response.
          links:
            paginate:
              operationId: fetchFeedJson
              parameters:
                next_cursor: $response.body#/_microfeed/items_next_cursor
                sort: $response.body#/_microfeed/items_sort_order
              description: Pagination through items.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/FeedJson"
        404:
          description: |
            This microfeed instance's Json feed is disabled by the admin at /admin/settings/
          content:
            text/plain:
              schema:
                type: string
                description: "Not Found"`;

  return new Response(yamlContent, {
    headers: {
      'Content-Type': 'application/yaml',
    },
  });
}
