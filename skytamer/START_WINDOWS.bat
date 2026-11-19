@echo off
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
 start "" http://localhost:3000
 node server.mjs
 goto :eof
)
where py >nul 2>nul
if %errorlevel%==0 (
 start "" http://localhost:3000
 py -m http.server 3000
 goto :eof
)
echo Bitte Node.js LTS oder Python 3 installieren und erneut starten.
pause
