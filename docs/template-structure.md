# Microfeed Template Structure

## Overview
Microfeed uses Mustache templates for rendering feed content. Templates are organized into several components that handle different aspects of the feed display.

## Template Components

### Web Header (`web_header.html`)
Renders the page header including metadata and navigation.

Required Fields:
```json
{
  "title": "Feed title",
  "home_page_url": "Homepage URL (optional)",
  "feed_url": "Feed URL",
  "favicon": "Favicon URL (optional)",
  "description": "Feed description (optional)"
}
```

### Web Feed (`web_feed.html`)
Main feed template that displays the channel information and item list.

Required Fields:
```json
{
  "title": "Feed title",
  "description": "Feed description",
  "items": [
    {
      "id": "Item ID",
      "title": "Item title",
      "_microfeed": {
        "web_url": "Web URL",
        "date_published_short": "Formatted date"
      }
    }
  ],
  "_microfeed": {
    "subscribe_methods": [
      {
        "name": "Method name",
        "url": "Subscription URL",
        "image": "Method icon URL"
      }
    ]
  }
}
```

### Web Item (`web_item.html`)
Individual item template used for standalone item pages.

Required Fields:
```json
{
  "id": "Item ID",
  "title": "Item title",
  "content_html": "HTML content",
  "content_text": "Plain text content",
  "date_published": "ISO date string",
  "_microfeed": {
    "web_url": "Web URL",
    "json_url": "JSON URL",
    "rss_url": "RSS URL",
    "date_published_short": "Formatted date",
    "is_audio": "Boolean",
    "is_video": "Boolean",
    "is_image": "Boolean"
  }
}
```

## Namespace Conventions

### _microfeed Namespace
The `_microfeed` namespace contains Microfeed-specific extensions:

- **URLs**: `web_url`, `json_url`, `rss_url`
- **Media Types**: `is_audio`, `is_video`, `is_image`
- **Dates**: `date_published_short`, `date_published_ms`
- **iTunes**: `itunes:title`, `itunes:block`, `itunes:explicit`
- **Navigation**: `items_next_cursor`, `items_prev_cursor`

## Theme Customization

1. Create a new theme directory in `edge-src/common/themes/your-theme/`
2. Copy and modify the default templates:
   - web_header.html
   - web_feed.html
   - web_item.html
   - web_body_start.html
   - web_body_end.html

3. Register the theme in settings:
```json
{
  "customCode": {
    "themes": {
      "your-theme": {
        "web_header": "...",
        "web_feed": "...",
        "web_item": "..."
      }
    }
  }
}
```

## Validation Rules

1. Required Fields
   - All templates must have access to the feed title
   - Items must have ID, title, and publication date
   - URLs must be properly encoded

2. HTML Safety
   - Use triple mustache {{{html}}} for HTML content
   - Use double mustache {{text}} for plain text

3. Date Formatting
   - Use `date_published` for ISO dates
   - Use `date_published_short` for formatted display

4. Media Handling
   - Check `is_audio`, `is_video`, `is_image` before rendering media
   - Use proper media containers based on type

## Error Handling

1. Missing Fields
   - Provide fallback values for optional fields
   - Show error message for required fields

2. Invalid Data
   - Validate URLs before rendering
   - Check media file existence
   - Handle missing dates gracefully