# Microfeed Project Overview

## Project Description
Microfeed is a Cloudflare-based feed management system using D1 for data storage. The project uses a hybrid architecture combining edge computing (Cloudflare Workers) with a SQLite-compatible database (D1).

## Core Components
- Edge Functions: Cloudflare Workers for request handling
- Database: Cloudflare D1 (SQLite-compatible)
- Local Development: Miniflare for local D1 emulation

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