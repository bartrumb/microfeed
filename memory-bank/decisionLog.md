# Decision Log

## 2025-03-02: Prop Name Standardization for Vite Migration

### Context
The migration from Webpack to Vite required updating component props from `webpackJsList` and `webpackCssList` to `scripts` and `styles` to align with the new build system's asset handling approach.

### Decision
1. Verify all Edge components have been updated to use the new Vite-compatible props
2. Confirm consistent environment detection with `isDev` constant
3. Validate chunk naming strategy across components

### Rationale
- Consistent prop naming is essential for proper asset loading in the Vite build system
- Environment-specific script loading optimizes performance in development and production
- Standardized chunk naming improves caching and maintenance

### Consequences
- Positive: Unified asset loading approach across all components
- Positive: Clearer separation between development and production environments
- Positive: More maintainable component structure
- Neutral: Requires careful coordination between component references and Vite configuration

### Implementation Notes
- All Edge components now use `scripts` and `styles` props
- Environment detection uses the same `isDev` constant across components
- Chunk naming follows a consistent pattern for better predictability

### Status
✅ Verified

### Related Decisions
- Cloudflare Workers Asset Loading Fix (2025-03-02)
- Asset Path Standardization (2025-03-02)

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