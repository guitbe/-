# GitHub 자동 업로드 스크립트
# 이 스크립트를 실행하면 자동으로 GitHub에 파일이 업로드됩니다!

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub 자동 업로드 스크립트" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# GitHub 저장소 정보 입력
$repoOwner = Read-Host "GitHub 사용자명을 입력하세요 (예: guitbe)"
$repoName = Read-Host "저장소 이름을 입력하세요 (예: guitbe.github.io 또는 salary-calculator)"

# GitHub Personal Access Token 입력
Write-Host ""
Write-Host "GitHub Personal Access Token이 필요합니다." -ForegroundColor Yellow
Write-Host "토큰이 없으시면: https://github.com/settings/tokens 에서 생성하세요" -ForegroundColor Yellow
Write-Host "권한: repo (전체 저장소 권한)" -ForegroundColor Yellow
Write-Host ""
$token = Read-Host "GitHub Personal Access Token을 입력하세요" -AsSecureString
$tokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($token))

# Base64 인코딩
$bytes = [System.Text.Encoding]::ASCII.GetBytes("${repoOwner}:${tokenPlain}")
$base64Token = [System.Convert]::ToBase64String($bytes)

# 업로드할 파일 목록
$files = @("index.html", "styles.css", "script.js")

Write-Host ""
Write-Host "파일 업로드 중..." -ForegroundColor Green

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "  - $file 업로드 중..." -ForegroundColor Cyan
        
        # 파일 내용 읽기
        $content = Get-Content $file -Raw -Encoding UTF8
        $base64Content = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content))
        
        # GitHub API로 파일 업로드
        $url = "https://api.github.com/repos/${repoOwner}/${repoName}/contents/${file}"
        
        # 기존 파일이 있는지 확인
        try {
            $existingFile = Invoke-RestMethod -Uri $url -Method Get -Headers @{
                Authorization = "Basic $base64Token"
            }
            $sha = $existingFile.sha
        } catch {
            $sha = $null
        }
        
        # 파일 업로드/업데이트
        $body = @{
            message = "Update $file with AdSense code"
            content = $base64Content
        } | ConvertTo-Json
        
        if ($sha) {
            $body = @{
                message = "Update $file with AdSense code"
                content = $base64Content
                sha = $sha
            } | ConvertTo-Json
        }
        
        try {
            Invoke-RestMethod -Uri $url -Method Put -Headers @{
                Authorization = "Basic $base64Token"
                "Content-Type" = "application/json"
            } -Body $body | Out-Null
            
            Write-Host "  ✅ $file 업로드 완료!" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ $file 업로드 실패: $_" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠️ $file 파일을 찾을 수 없습니다." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  업로드 완료!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "웹사이트 주소: https://${repoOwner}.github.io/${repoName}" -ForegroundColor Yellow
Write-Host "또는: https://github.com/${repoOwner}/${repoName}" -ForegroundColor Yellow
Write-Host ""
Write-Host "5분 후 AdSense에서 확인하세요!" -ForegroundColor Green

