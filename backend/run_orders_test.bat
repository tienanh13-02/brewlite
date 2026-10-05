@echo off
setlocal
chcp 65001 > nul

set "BACKEND_DIR=%~dp0"
set "BASE_URL=http://localhost:3000"
set "LOGIN_REQUEST=%TEMP%\brewlite-login-%RANDOM%.json"
set "LOGIN_RESPONSE=%TEMP%\brewlite-login-response-%RANDOM%.json"
set "ORDER_REQUEST=%TEMP%\brewlite-order-%RANDOM%.json"
set "INVALID_REQUEST=%TEMP%\brewlite-invalid-order-%RANDOM%.json"
set "INVALID_RESPONSE=%TEMP%\brewlite-invalid-response-%RANDOM%.json"

echo.
echo === BrewLite backend clean restart and API test ===
echo This stops the process listening on port 3000 and starts this backend folder.
echo It does not reset the database or delete files.
echo.

set /p "BREWLITE_EMAIL=Login email: "
set /p "BREWLITE_PASSWORD=Login password: "
set /p "BREWLITE_PRODUCT_ID=Product ID to order [1]: "
if not defined BREWLITE_PRODUCT_ID set "BREWLITE_PRODUCT_ID=1"

echo.
echo [1/5] Stop the listener on port 3000, if present...
for /f "delims=" %%P in ('powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue ^| Select-Object -ExpandProperty OwningProcess -Unique"') do (
    echo Stopping PID %%P
    taskkill /PID %%P /F > nul 2>&1
)

echo.
echo [2/5] Build the backend from the current source...
pushd "%BACKEND_DIR%"
call npm run build
if errorlevel 1 (
    echo ERROR: Backend build failed. Fix the reported compile errors before testing.
    popd
    goto :fail
)
popd

echo.
echo [3/5] Start this backend in a new window...
start "BrewLite backend - port 3000" /D "%BACKEND_DIR%" cmd /k "npm run start:dev"

powershell -NoProfile -Command "$ready = $false; for ($i = 0; $i -lt 60 -and -not $ready; $i++) { try { $client = New-Object System.Net.Sockets.TcpClient; $client.Connect('127.0.0.1', 3000); $client.Close(); $ready = $true } catch { Start-Sleep -Milliseconds 1000 } }; if (-not $ready) { exit 1 }"
if errorlevel 1 (
    echo ERROR: Backend did not listen on port 3000 within 60 seconds.
    goto :fail
)
echo Backend is listening on port 3000.

echo.
echo [4/5] Login and verify /auth/me...
powershell -NoProfile -Command "$body = @{ email = $env:BREWLITE_EMAIL; password = $env:BREWLITE_PASSWORD } | ConvertTo-Json -Compress; [IO.File]::WriteAllText($env:LOGIN_REQUEST, $body, [Text.UTF8Encoding]::new($false))"
for /f "delims=" %%S in ('curl.exe -sS -o "%LOGIN_RESPONSE%" -w "%%{http_code}" -H "Content-Type: application/json" --data-binary "@%LOGIN_REQUEST%" "%BASE_URL%/auth/login"') do set "LOGIN_STATUS=%%S"
if not "%LOGIN_STATUS%"=="200" (
    echo ERROR: Login returned HTTP %LOGIN_STATUS%. Check the credentials and database user.
    type "%LOGIN_RESPONSE%"
    echo.
    goto :fail
)
for /f "usebackq delims=" %%T in (`powershell -NoProfile -Command "$j = Get-Content -Raw '%LOGIN_RESPONSE%' | ConvertFrom-Json; $j.accessToken"`) do set "BREWLITE_TOKEN=%%T"
if not defined BREWLITE_TOKEN (
    echo ERROR: Login response did not contain accessToken.
    type "%LOGIN_RESPONSE%"
    echo.
    goto :fail
)
curl.exe -sS -f -H "Authorization: Bearer %BREWLITE_TOKEN%" "%BASE_URL%/auth/me"
if errorlevel 1 (
    echo.
    echo ERROR: /auth/me failed.
    goto :fail
)
echo.

echo.
echo [5/5] Test a valid order, then verify invalid topping is rejected...
powershell -NoProfile -Command "$body = @{ items = @(@{ productId = [int]$env:BREWLITE_PRODUCT_ID; size = 'M'; topping = 'Không'; qty = 1 }) } | ConvertTo-Json -Depth 5 -Compress; [IO.File]::WriteAllText($env:ORDER_REQUEST, $body, [Text.UTF8Encoding]::new($false))"
for /f "delims=" %%S in ('curl.exe -sS -o "%TEMP%\brewlite-order-response-%RANDOM%.json" -w "%%{http_code}" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer %BREWLITE_TOKEN%" --data-binary "@%ORDER_REQUEST%" "%BASE_URL%/orders"') do set "ORDER_STATUS=%%S"
if not "%ORDER_STATUS:~0,1%"=="2" (
    echo ERROR: Valid order returned HTTP %ORDER_STATUS%. Check that the product ID exists.
    goto :fail
)
echo Valid order returned HTTP %ORDER_STATUS%.

powershell -NoProfile -Command "$body = @{ items = @(@{ productId = [int]$env:BREWLITE_PRODUCT_ID; size = 'M'; topping = 'Khong'; qty = 1 }) } | ConvertTo-Json -Depth 5 -Compress; [IO.File]::WriteAllText($env:INVALID_REQUEST, $body, [Text.UTF8Encoding]::new($false))"
for /f "delims=" %%S in ('curl.exe -sS -o "%INVALID_RESPONSE%" -w "%%{http_code}" -X POST -H "Content-Type: application/json" -H "Authorization: Bearer %BREWLITE_TOKEN%" --data-binary "@%INVALID_REQUEST%" "%BASE_URL%/orders"') do set "INVALID_STATUS=%%S"
if not "%INVALID_STATUS%"=="400" (
    echo ERROR: Invalid topping should return HTTP 400, got %INVALID_STATUS%.
    type "%INVALID_RESPONSE%"
    echo.
    goto :fail
)
echo Invalid topping correctly returned HTTP 400.
echo.
echo All checks passed. The backend remains running in its separate window.
call :cleanup
pause
exit /b 0

:fail
call :cleanup
pause
exit /b 1

:cleanup
del "%LOGIN_REQUEST%" "%LOGIN_RESPONSE%" "%ORDER_REQUEST%" "%INVALID_REQUEST%" "%INVALID_RESPONSE%" 2> nul
exit /b
