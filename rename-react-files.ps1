# Rename React files to .jsx
Get-ChildItem -Path "client-src", "edge-src" -Recurse -Include "*.js" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "import.*react|React\.|<.*>.*</.*>|<.*/>") {
        $newName = $_.FullName -replace '\.js$', '.jsx'
        Move-Item -Path $_.FullName -Destination $newName -Force
        Write-Host "Renamed $($_.Name) to $($_.Name -replace '\.js$', '.jsx')"
    }
}

# Update imports in all files to reference .jsx
Get-ChildItem -Path "client-src", "edge-src" -Recurse -Include "*.js", "*.jsx" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $updated = $content -replace '(import.*from.*[''"])(.*)\.js([''"])', '$1$2.jsx$3'
    if ($content -ne $updated) {
        Set-Content -Path $_.FullName -Value $updated
        Write-Host "Updated imports in $($_.Name)"
    }
}