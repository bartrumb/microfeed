# Root config files
Move-Item -Path ".eslintrc.js" -Destination ".eslintrc.ts" -Force
Move-Item -Path "jest.config.js" -Destination "jest.config.ts" -Force
Move-Item -Path "jest.setup.js" -Destination "jest.setup.ts" -Force
Move-Item -Path "postcss.config.js" -Destination "postcss.config.ts" -Force
Move-Item -Path "tailwind.config.js" -Destination "tailwind.config.ts" -Force
Move-Item -Path "vite.config.js" -Destination "vite.config.ts" -Force

# Common source files
Move-Item -Path "common-src/Constants.js" -Destination "common-src/Constants.ts" -Force
Move-Item -Path "common-src/MediaFileUtils.js" -Destination "common-src/MediaFileUtils.ts" -Force
Move-Item -Path "common-src/OnboardingUtils.js" -Destination "common-src/OnboardingUtils.ts" -Force
Move-Item -Path "common-src/R2Utils.js" -Destination "common-src/R2Utils.ts" -Force
Move-Item -Path "common-src/Version.js" -Destination "common-src/Version.ts" -Force

# Edge source files
Move-Item -Path "edge-src/common/manifest-virtual.js" -Destination "edge-src/common/manifest-virtual.ts" -Force
Move-Item -Path "edge-src/common/RouteUtils.js" -Destination "edge-src/common/RouteUtils.ts" -Force
Move-Item -Path "edge-src/common/ViteUtils.js" -Destination "edge-src/common/ViteUtils.ts" -Force
Move-Item -Path "edge-src/models/DatabaseInitializer.js" -Destination "edge-src/models/DatabaseInitializer.ts" -Force
Move-Item -Path "edge-src/models/FeedCrudManager.js" -Destination "edge-src/models/FeedCrudManager.ts" -Force
Move-Item -Path "edge-src/models/FeedDb.js" -Destination "edge-src/models/FeedDb.ts" -Force
Move-Item -Path "edge-src/models/FeedPublicJsonBuilder.js" -Destination "edge-src/models/FeedPublicJsonBuilder.ts" -Force
Move-Item -Path "edge-src/models/FeedPublicRssBuilder.js" -Destination "edge-src/models/FeedPublicRssBuilder.ts" -Force
Move-Item -Path "edge-src/models/Theme.js" -Destination "edge-src/models/Theme.ts" -Force

# Function files
Move-Item -Path "functions/admin/_middleware.js" -Destination "functions/admin/_middleware.ts" -Force
Move-Item -Path "functions/admin/channels/index.jsx" -Destination "functions/admin/channels/index.tsx" -Force
Move-Item -Path "functions/admin/channels/primary/index.jsx" -Destination "functions/admin/channels/primary/index.tsx" -Force
Move-Item -Path "functions/admin/feed/json.jsx" -Destination "functions/admin/feed/json.tsx" -Force
Move-Item -Path "functions/admin/items/index.jsx" -Destination "functions/admin/items/index.tsx" -Force
Move-Item -Path "functions/admin/items/[itemId]/index.jsx" -Destination "functions/admin/items/[itemId]/index.tsx" -Force
Move-Item -Path "functions/admin/items/new/index.jsx" -Destination "functions/admin/items/new/index.tsx" -Force
Move-Item -Path "functions/admin/settings/index.jsx" -Destination "functions/admin/settings/index.tsx" -Force
Move-Item -Path "functions/admin/settings/code-editor/index.jsx" -Destination "functions/admin/settings/code-editor/index.tsx" -Force
Move-Item -Path "functions/api/_middleware.js" -Destination "functions/api/_middleware.ts" -Force
Move-Item -Path "functions/api/channels/[channelId]/index.jsx" -Destination "functions/api/channels/[channelId]/index.tsx" -Force
Move-Item -Path "functions/api/feed/index.js" -Destination "functions/api/feed/index.ts" -Force
Move-Item -Path "functions/api/items/index.jsx" -Destination "functions/api/items/index.tsx" -Force
Move-Item -Path "functions/api/items/[itemId]/index.jsx" -Destination "functions/api/items/[itemId]/index.tsx" -Force
Move-Item -Path "functions/api/media_files/presigned_urls/index.jsx" -Destination "functions/api/media_files/presigned_urls/index.tsx" -Force
Move-Item -Path "functions/i/[slug]/index.jsx" -Destination "functions/i/[slug]/index.tsx" -Force
Move-Item -Path "functions/i/[slug]/json/index.jsx" -Destination "functions/i/[slug]/json/index.tsx" -Force
Move-Item -Path "functions/i/[slug]/rss/index.jsx" -Destination "functions/i/[slug]/rss/index.tsx" -Force
Move-Item -Path "functions/rss/stylesheet.jsx" -Destination "functions/rss/stylesheet.tsx" -Force

# Operation files
Move-Item -Path "ops/deploy.js" -Destination "ops/deploy.ts" -Force
Move-Item -Path "ops/direct_upload.js" -Destination "ops/direct_upload.ts" -Force
Move-Item -Path "ops/handle_vars.js" -Destination "ops/handle_vars.ts" -Force
Move-Item -Path "ops/init_feed_db.js" -Destination "ops/init_feed_db.ts" -Force
Move-Item -Path "ops/init_project.js" -Destination "ops/init_project.ts" -Force
Move-Item -Path "ops/init_r2.js" -Destination "ops/init_r2.ts" -Force
Move-Item -Path "ops/process_openapi.js" -Destination "ops/process_openapi.ts" -Force
Move-Item -Path "ops/sync_microfeed_version.js" -Destination "ops/sync_microfeed_version.ts" -Force
Move-Item -Path "ops/sync_project_config.js" -Destination "ops/sync_project_config.ts" -Force
Move-Item -Path "ops/lib/utils.js" -Destination "ops/lib/utils.ts" -Force

Write-Host "Migration complete. Please review the changes and update any imports as needed."