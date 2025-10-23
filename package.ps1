cd C:\Users\GeorgeBrunner\Cursor\SocratIQAgents

Write-Host "Packaging shared layer..."
New-Item -ItemType Directory -Force -Path "lambda\shared\nodejs\node_modules" | Out-Null
Copy-Item -Recurse -Force "lambda\shared\node_modules\*" "lambda\shared\nodejs\node_modules\"
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\shared\nodejs\"
Compress-Archive -Path "lambda\shared\nodejs\*" -DestinationPath "agent-shared-layer.zip" -Force
Remove-Item -Recurse -Force "lambda\shared\nodejs"
Write-Host "Done: agent-shared-layer.zip"

Write-Host "Packaging VERA..."
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\agents\vera\dist\"
Copy-Item -Recurse -Force "lambda\shared\node_modules" "lambda\agents\vera\dist\"
Compress-Archive -Path "lambda\agents\vera\dist\*" -DestinationPath "vera-agent.zip" -Force
Write-Host "Done: vera-agent.zip"

Write-Host "Packaging FINN..."
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\agents\finn\dist\"
Copy-Item -Recurse -Force "lambda\shared\node_modules" "lambda\agents\finn\dist\"
Compress-Archive -Path "lambda\agents\finn\dist\*" -DestinationPath "finn-agent.zip" -Force
Write-Host "Done: finn-agent.zip"

Write-Host "Packaging NORA..."
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\agents\nora\dist\"
Copy-Item -Recurse -Force "lambda\shared\node_modules" "lambda\agents\nora\dist\"
Compress-Archive -Path "lambda\agents\nora\dist\*" -DestinationPath "nora-agent.zip" -Force
Write-Host "Done: nora-agent.zip"

Write-Host "Packaging CLIA..."
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\agents\clia\dist\"
Copy-Item -Recurse -Force "lambda\shared\node_modules" "lambda\agents\clia\dist\"
Compress-Archive -Path "lambda\agents\clia\dist\*" -DestinationPath "clia-agent.zip" -Force
Write-Host "Done: clia-agent.zip"

Write-Host "Packaging Sophie..."
Copy-Item -Recurse -Force "lambda\shared\dist\*" "lambda\agents\sophie\dist\"
Copy-Item -Recurse -Force "lambda\shared\node_modules" "lambda\agents\sophie\dist\"
Compress-Archive -Path "lambda\agents\sophie\dist\*" -DestinationPath "sophie-orchestrator.zip" -Force
Write-Host "Done: sophie-orchestrator.zip"

Write-Host ""
Write-Host "All packages created!"
Get-ChildItem *.zip | Select-Object Name, @{Name="Size (MB)";Expression={[math]::Round($_.Length/1MB,2)}}
