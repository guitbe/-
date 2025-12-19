param(
    [string]$Username,
    [string]$Repo,
    [string]$Token
)

# GitHub 자동 업로드 스크립트 (간단 버전)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub 자동 업로드" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $Username -or -not $Repo -or -not $Token) {
    Write-Host "사용법: .\GitHub자동업로드_간단.ps1 -Username '사용자명' -Repo '저장소명' -Token '토큰'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "GitHub 토큰 만들기: https://github.com/settings/tokens" -ForegroundColor Yellow
    Write-Host "권한: repo (전체 저장소 권한)" -ForegroundColor Yellow
    exit
}

# Base64 인코딩
$bytes = [System.Text.Encoding]::ASCII.GetBytes("${Username}:${Token}")
$base64Token = [System.Convert]::ToBase64String($bytes)

# 업로드할 파일 목록
$files = @("index.html", "styles.css", "script.js")

Write-Host "파일 업로드 중..." -ForegroundColor Green
Write-Host ""

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  📤 $file 업로드 중..." -ForegroundColor Cyan
        
        # 파일 내용 읽기
        $content = Get-Content $file -Raw -Encoding UTF8
        $base64Content = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
        
        # GitHub API URL
        $url = "https://api.github.com/repos/${Username}/${Repo}/contents/${file}"
        
        # 기존 파일 SHA 가져오기
        $sha = $null
        try {
            $existingFile = Invoke-RestMethod -Uri $url -Method Get -Headers @{
                Authorization = "token $Token"
                "User-Agent" = "GitHub-Upload-Script"
            } -ErrorAction SilentlyContinue
            $sha = $existingFile.sha
        } catch {
            # 파일이 없으면 새로 만들기
        }
        
        # 업로드/업데이트
        $body = @{
            message = "Update $file - AdSense code added"
            content = $base64Content
        }
        
        if ($sha) {
            $body.sha = $sha
        }
        
        try {
            $jsonBody = $body | ConvertTo-Json
            Invoke-RestMethod -Uri $url -Method Put -Headers @{
                Authorization = "token $Token"
                "Content-Type" = "application/json"
                "User-Agent" = "GitHub-Upload-Script"
            } -Body $jsonBody | Out-Null
            
            Write-Host "  ✅ $file 업로드 완료!" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ $file 업로드 실패" -ForegroundColor Red
            Write-Host "     오류: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️  $file 파일을 찾을 수 없습니다." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  업로드 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "웹사이트 주소:" -ForegroundColor Yellow
Write-Host "  https://${Username}.github.io/${Repo}" -ForegroundColor Cyan
Write-Host ""
Write-Host "5-10분 후 AdSense에서 확인하세요!" -ForegroundColor Green
Write-Host ""

