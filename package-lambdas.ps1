# Quick packaging script for Lambda functions
cd C:\Users\GeorgeBrunner\Cursor\SocratIQAgents

# Package shared layer
Write-Host "Packaging shared layer..."
New-Item -ItemType Directory -Force -Path "lambda\shared\nodejs\node_modules" | Out-Null
Copy-Item -Recurse -Force "lambda\shared\node_modules\*" "lambda\shared\nodejs\node_modules\"
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\shared\nodejs\"
Compress-Archive -Path "lambda\shared\nodejs\*" -DestinationPath "agent-shared-layer.zip" -Force
Remove-Item -Recurse -Force "lambda\shared\nodejs"
Write-Host "✓ Shared layer packaged"

# Function to package an agent
function Package-Agent($Name) {
    Write-Host "Packaging $Name..."
    Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\agents\$Name\dist\"
    Copy-Item -Recurse -Force "lambda\shared\node_modules" "lambda\agents\$Name\dist\"
    Compress-Archive -Path "lambda\agents\$Name\dist\*" -DestinationPath "$Name-agent.zip" -Force
    Write-Host "✓ $Name packaged"
}

# Package all agents
Package-Agent "vera"
Package-Agent "finn"
Package-Agent "nora"
Package-Agent "clia"
Package-Agent "sophie"

Write-Host ""
Write-Host "All packages created successfully!"
ls *.zip | Select-Object Name, Length
