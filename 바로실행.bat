@echo off
chcp 65001 >nul
echo ========================================
echo   GitHub 자동 업로드
echo ========================================
echo.

echo GitHub 사용자명을 입력하세요 (예: guitbe)
set /p USERNAME=

echo.
echo 저장소 이름을 입력하세요 (예: guitbe.github.io)
set /p REPO=

echo.
echo GitHub Personal Access Token을 입력하세요
echo (토큰이 없으면: https://github.com/settings/tokens)
set /p TOKEN=

echo.
echo 파일 업로드 중...

powershell -ExecutionPolicy Bypass -File "GitHub자동업로드_간단.ps1" -Username "%USERNAME%" -Repo "%REPO%" -Token "%TOKEN%"

echo.
echo 완료!
pause

