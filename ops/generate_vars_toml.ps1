# Check if .vars.toml exists
if (Test-Path ".vars.toml") {
    Write-Host ".vars.toml exists."
    exit
}

# Create the TOML content
$tomlContent = @"
CLOUDFLARE_PROJECT_NAME = "$env:CLOUDFLARE_PROJECT_NAME"
CLOUDFLARE_ACCOUNT_ID = "$env:CLOUDFLARE_ACCOUNT_ID"
CLOUDFLARE_API_TOKEN = "$env:CLOUDFLARE_API_TOKEN"

R2_ACCESS_KEY_ID = "$env:R2_ACCESS_KEY_ID"
R2_SECRET_ACCESS_KEY = "$env:R2_SECRET_ACCESS_KEY"
R2_PUBLIC_BUCKET = "$env:R2_PUBLIC_BUCKET"

D1_DATABASE_NAME = "$env:D1_DATABASE_NAME"

PRODUCTION_BRANCH = "$env:PRODUCTION_BRANCH"

MICROFEED_VERSION = "v1"
NODE_VERSION = "18.0"

DEPLOYMENT_ENVIRONMENT = "$env:DEPLOYMENT_ENVIRONMENT"
"@

# Write the content to .vars.toml
$tomlContent | Out-File -FilePath ".vars.toml" -Encoding UTF8