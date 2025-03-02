# Decision Log

## 2025-03-02: Cloudflare Workers Asset Loading Fix

### Context
The application was encountering a "Dynamic require of manifest.json is not supported" error in the Cloudflare Workers environment due to incompatible asset loading approaches between Vite and Workers.

### Decision
1. Replace dynamic manifest.json require with static path generation
2. Implement dedicated chunks for constants and admin-styles
3. Update HtmlHeader component to handle CSS loading explicitly

### Rationale
- Cloudflare Workers don't support dynamic requires, necessitating a static approach
- Separating constants into their own chunk improves caching and maintenance
- Explicit CSS handling in HtmlHeader ensures reliable asset loading

### Consequences
- Positive: Eliminated runtime errors in Workers environment
- Positive: Improved asset organization and caching
- Positive: More predictable build output
- Neutral: Slightly more complex build configuration
- Neutral: Manual management of chunk configurations

### Implementation Notes
- Updated ViteUtils.js to use predictable path structure
- Modified vite.config.js chunk configuration
- Enhanced HtmlHeader component for explicit CSS handling
- Verified working in both development and production

### Status
✅ Implemented and Verified

### Related Decisions
- Asset Path Standardization (2025-03-02)
- Environment Detection Improvements (2025-03-02)