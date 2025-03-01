# Microfeed Project Overview

## Project Description
Microfeed is a Cloudflare-based feed management system using D1 for data storage. The project uses a hybrid architecture combining edge computing (Cloudflare Workers) with a SQLite-compatible database (D1).

## Core Components
- Edge Functions: Cloudflare Workers for request handling
- Database: Cloudflare D1 (SQLite-compatible)
- Local Development: Miniflare for local D1 emulation
- Asset Management: Vite for development and production assets

## System Architecture

### Data Layer
- **Database (FeedDb)**
  - Tables: channels, items, settings
  - Automatic initialization with default data
  - State verification before operations
  - Support for pagination and sorting

### Presentation Layer
- **Theme System**
  - Mustache-based templating
  - Default templates in edge-src/common/default_themes/
  - Support for custom themes via settings
  - Theme selection through SETTINGS_CATEGORIES.CUSTOM_CODE

### Data Processing
- **FeedPublicJsonBuilder**
  - Transforms database content for presentation
  - Handles media file processing
  - Manages subscription methods
  - Supports pagination with cursors

### Asset Management
- **ViteUtils**
  - Unified development and production paths
  - Client assets in specific directories:
    - JS: /assets/client/
    - CSS: /assets/
  - Public bucket URL handling for media
  - WSL-compatible asset resolution

## Memory Bank Structure
- `activeContext.md`: Current development context and ongoing tasks
- `productContext.md`: Project overview and architecture (this file)
- `progress.md`: Task progress tracking
- `decisionLog.md`: Architectural decisions and their rationale

## Key Architectural Decisions
1. Use of Cloudflare D1 for data storage
   - Pros: Serverless, edge-compatible, SQL-based
   - Cons: Local development challenges with Miniflare
2. Database Initialization Strategy
   - Tables created via SQL scripts
   - Initial data seeded through application code
   - Requires careful handling of concurrent operations
3. Theme System Implementation
   - Uses Mustache for simple, logic-less templating
   - Supports theme customization through settings
   - Maintains separation between data and presentation
4. Asset Organization
   - Unified paths for development and production
   - Standardized directory structure for client assets
   - R2 integration for media file storage
   - WSL-compatible asset resolution strategy
5. WSL Development Environment
   - Specific network configuration for WSL compatibility
   - Port forwarding considerations for local development
   - Standardized troubleshooting procedures

## Data Flow
1. Request handling by Cloudflare Worker
2. Data retrieval through FeedDb
3. Content transformation by FeedPublicJsonBuilder
4. Template rendering by Theme class
5. Response delivery to client

## Development Considerations
- Local development requires Miniflare setup
- Theme customization needs understanding of data structure
- Asset path handling unified between dev and prod
- Database operations include automatic initialization
- WSL Development Requirements:
  - Wrangler binding to 0.0.0.0 for host access
  - Port 8788 forwarding configuration
  - WSL 2 NAT handling
  - Standard command structure:
    ```bash
    wrangler pages dev --compatibility-date=2024-02-28 --d1 FEED_DB --ip 0.0.0.0 --port 8788
    ```
  - Troubleshooting workflow:
    1. Verify internal WSL access
    2. Check Windows host connectivity
    3. Validate project structure
    4. Monitor port forwarding status

## Asset Path Structure
- Development and Production:
  ```javascript
  {
    js: '/assets/client',  // JavaScript bundles and modules
    css: '/assets'         // Stylesheets and CSS resources
  }
  ```
- Benefits:
  - Consistent paths across environments
  - Simplified asset resolution
  - Better WSL compatibility
  - Reduced configuration complexity