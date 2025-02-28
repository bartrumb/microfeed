#!/bin/sh

# Clear existing .vars.toml and add header
echo "# Environment Configuration\n" > .vars.toml
echo "[${DEPLOYMENT_ENVIRONMENT:-production}]" >> .vars.toml

# Determine which vars file to use based on environment
VARS_FILE=".production.vars"
if [ "$DEPLOYMENT_ENVIRONMENT" = "preview" ]; then
    VARS_FILE=".preview.vars"
fi

echo "Generating .vars.toml from $VARS_FILE"

# Create a temporary file with Unix line endings
TEMP_FILE=$(mktemp)
tr -d '\r' < "$VARS_FILE" > "$TEMP_FILE"

# Required variables to validate
REQUIRED_VARS="R2_PUBLIC_BUCKET CLOUDFLARE_PROJECT_NAME CLOUDFLARE_ACCOUNT_ID"
FOUND_VARS=""

# Process each line and create TOML format
while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in
        ''|'#'*) continue ;;
        *=*)
            # Extract key and value, trim whitespace
            key=$(echo "$line" | sed 's/=.*//' | tr -d ' ')
            
            # Get value after equals sign, preserve internal whitespace
            value=$(echo "$line" | cut -d'=' -f2- | sed 's/^"//;s/"$//')
            
            # Track required variables
            for req in $REQUIRED_VARS; do
                if [ "$key" = "$req" ]; then
                    FOUND_VARS="$FOUND_VARS $key"
                fi
            done

            # Always quote the value
            if ! echo "$value" | grep -q '^".*"$'; then
                value="\"$value\""
            fi
            
            # Write to TOML file
            echo "$key = $value" >> .vars.toml
            ;;
    esac
done < "$TEMP_FILE"

# Remove temp file
rm -f "$TEMP_FILE"

# Validate required variables
for req in $REQUIRED_VARS; do
    if ! echo "$FOUND_VARS" | grep -q "$req"; then
        echo "Error: Required variable $req not found in $VARS_FILE"
        exit 1
    fi
done

echo "Generated .vars.toml successfully"
