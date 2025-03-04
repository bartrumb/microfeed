# Markdown File Tree Generator for microfeed Project
# This script generates a structured Markdown index of source code files

$projectRoot = "C:\Code\microfeed"
$outputFile = "$projectRoot\memory-bank\microfeed-index.md"

# Define file type groups
$fileGroups = @{
    "JavaScript/TypeScript" = @("*.js", "*.ts")
    "React Components" = @("*.jsx", "*.tsx")
    "Web Resources" = @("*.html", "*.css")
    "Configuration" = @("*.json")
    "Documentation" = @("*.md")
}

# Define directories to exclude (from gitignore)
$excludeDirs = @(
    "node_modules", ".git", "build", "dist", "coverage",
    "logs", "lib-cov", ".nyc_output", ".grunt", "bower_components",
    ".lock-wscript", "jspm_packages", "typings", ".npm", ".eslintcache",
    ".rpt2_cache", ".rts2_cache_cjs", ".rts2_cache_es", ".rts2_cache_umd",
    ".node_repl_history", ".yarn-integrity", ".cache", ".next", ".nuxt",
    ".vuepress/dist", ".serverless", ".fusebox", ".dynamodb", ".tern-port",
    ".wrangler", ".yarn"
)

# Define file extensions to be included
$includeExtensions = @(".js", ".ts", ".jsx", ".tsx", ".html", ".css", ".json", ".md")

# Function to get human-readable file size
function Format-FileSize {
    param([long]$SizeInBytes)
    
    if ($SizeInBytes -lt 1KB) { return "$SizeInBytes B" }
    elseif ($SizeInBytes -lt 1MB) { return "{0:N2} KB" -f ($SizeInBytes / 1KB) }
    elseif ($SizeInBytes -lt 1GB) { return "{0:N2} MB" -f ($SizeInBytes / 1MB) }
    else { return "{0:N2} GB" -f ($SizeInBytes / 1GB) }
}

# Function to check if a path should be excluded
function Test-ShouldExclude {
    param([string]$Path)
    
    foreach ($dir in $excludeDirs) {
        if ($Path -like "*\$dir\*" -or $Path -like "*\$dir") {
            return $true
        }
    }
    
    # Get file extension
    $extension = [System.IO.Path]::GetExtension($Path).ToLower()
    if ($extension -and -not $includeExtensions.Contains($extension)) {
        return $true
    }
    
    return $false
}

# Get all directories (excluding the ones in excludeDirs)
$allDirs = Get-ChildItem -Path $projectRoot -Directory -Recurse | 
    Where-Object { -not (Test-ShouldExclude -Path $_.FullName) } |
    Sort-Object FullName

# Create array to store all file information
$fileInfo = @()

# Process files in each directory
foreach ($fileGroup in $fileGroups.Keys) {
    $patterns = $fileGroups[$fileGroup]
    $groupFiles = @()
    
    foreach ($pattern in $patterns) {
        $filesForPattern = Get-ChildItem -Path $projectRoot -Filter $pattern -Recurse -File | 
            Where-Object { -not (Test-ShouldExclude -Path $_.FullName) }
        $groupFiles += $filesForPattern
    }
    
    # Group files by directory
    $filesByDir = $groupFiles | Group-Object DirectoryName | Sort-Object Name
    
    foreach ($dirGroup in $filesByDir) {
        $dirPath = $dirGroup.Name
        $relativePath = $dirPath.Replace($projectRoot, "").TrimStart("\")
        
        foreach ($file in $dirGroup.Group | Sort-Object Name) {
            $fileObj = [PSCustomObject]@{
                FullPath = $file.FullName
                Directory = $relativePath
                FileName = $file.Name
                Extension = $file.Extension.ToLower()
                FileSize = $file.Length
                FormattedSize = Format-FileSize -SizeInBytes $file.Length
                ModifiedDate = $file.LastWriteTime
                Group = $fileGroup
            }
            
            $fileInfo += $fileObj
        }
    }
}

# Start building the Markdown content
$markdownContent = @"
# Microfeed Project File Index

Generated on: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

This index provides a structured view of the microfeed project source code.

## Project Structure Overview

"@

# Add TOC
$markdownContent += "`n`n## Table of Contents`n`n"
foreach ($fileGroup in $fileGroups.Keys) {
    $markdownContent += "- [${fileGroup}](#$($fileGroup.ToLower().Replace('/', '').Replace(' ', '-')))`n"
}

# Add statistics overview
$markdownContent += "`n## File Statistics`n`n"
$markdownContent += "| Category | Count | Total Size |`n"
$markdownContent += "|----------|-------|------------|`n"

foreach ($fileGroup in $fileGroups.Keys) {
    $groupFiles = $fileInfo | Where-Object { $_.Group -eq $fileGroup }
    $fileCount = $groupFiles.Count
    $totalSize = ($groupFiles | Measure-Object -Property FileSize -Sum).Sum
    
    $markdownContent += "| $fileGroup | $fileCount | $(Format-FileSize -SizeInBytes $totalSize) |`n"
}

# Add directory structure
$markdownContent += "`n## Top-Level Directories`n`n"
$topDirs = Get-ChildItem -Path $projectRoot -Directory | 
    Where-Object { -not (Test-ShouldExclude -Path $_.FullName) } |
    Sort-Object Name

foreach ($dir in $topDirs) {
    $dirFiles = $fileInfo | Where-Object { $_.Directory -like "$($dir.Name)*" }
    $fileCount = $dirFiles.Count
    $totalSize = ($dirFiles | Measure-Object -Property FileSize -Sum).Sum
    
    $markdownContent += "- **$($dir.Name)/** - $fileCount files, $(Format-FileSize -SizeInBytes $totalSize)`n"
}

# Add file listings by group
foreach ($fileGroup in $fileGroups.Keys) {
    $groupFiles = $fileInfo | Where-Object { $_.Group -eq $fileGroup }
    
    if ($groupFiles.Count -eq 0) { continue }
    
    $markdownContent += "`n## $fileGroup`n`n"
    
    # Get all unique directories in this group
    $uniqueDirs = $groupFiles | Select-Object -ExpandProperty Directory -Unique | Sort-Object
    
    foreach ($dirPath in $uniqueDirs) {
        $dirFiles = $groupFiles | Where-Object { $_.Directory -eq $dirPath } | Sort-Object FileName
        
        if ($dirPath -eq "") {
            $markdownContent += "### [Root Directory]`n`n"
        } else {
            $markdownContent += "### $dirPath`n`n"
        }
        
        $markdownContent += "| File | Size | Last Modified |`n"
        $markdownContent += "|------|------|---------------|`n"
        
        foreach ($file in $dirFiles) {
            $markdownContent += "| $($file.FileName) | $($file.FormattedSize) | $($file.ModifiedDate.ToString('yyyy-MM-dd HH:mm:ss')) |`n"
        }
        
        $markdownContent += "`n"
    }
}

# Add recently modified files
$markdownContent += "`n## Most Recently Modified Files`n`n"
$markdownContent += "| File | Type | Size | Last Modified |`n"
$markdownContent += "|------|------|------|---------------|`n"

$recentFiles = $fileInfo | Sort-Object -Property ModifiedDate -Descending | Select-Object -First 20
foreach ($file in $recentFiles) {
    $filePath = if ($file.Directory) { "$($file.Directory)\$($file.FileName)" } else { $file.FileName }
    $markdownContent += "| $filePath | $($file.Group) | $($file.FormattedSize) | $($file.ModifiedDate.ToString('yyyy-MM-dd HH:mm:ss')) |`n"
}

# Write the markdown content to a file
$markdownContent | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "Markdown index generated at: $outputFile"
Write-Host "Total files indexed: $($fileInfo.Count)"