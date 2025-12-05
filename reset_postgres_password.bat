@echo off
REM ================================================
REM PostgreSQL Password Reset Script
REM For Students: Use this if you forgot password
REM ================================================

echo.
echo ========================================
echo  POSTGRESQL PASSWORD RESET
echo ========================================
echo.

set PGBIN=C:\Program Files\PostgreSQL\18\bin
set PGDATA=C:\Program Files\PostgreSQL\18\data

echo This script will help you reset PostgreSQL password.
echo.
echo Step 1: Stop PostgreSQL service...
net stop postgresql-x64-18
if errorlevel 1 (
    echo Note: Service might already be stopped or needs admin rights
    echo Please run this script as Administrator
    pause
    exit /b 1
)

echo.
echo Step 2: Edit pg_hba.conf to allow passwordless login...
echo.
echo Manual steps required:
echo 1. Open: C:\Program Files\PostgreSQL\18\data\pg_hba.conf
echo 2. Find lines with "md5" or "scram-sha-256"
echo 3. Change them to "trust"
echo 4. Save the file
echo.
echo Example:
echo   Before: host    all    all    127.0.0.1/32    md5
echo   After:  host    all    all    127.0.0.1/32    trust
echo.
pause

echo.
echo Step 3: Start PostgreSQL service...
net start postgresql-x64-18

echo.
echo Step 4: Connect and reset password...
echo Now you can connect without password and set a new one:
echo.
echo Run this in a new terminal:
echo   cd "C:\Program Files\PostgreSQL\18\bin"
echo   psql -U postgres
echo   ALTER USER postgres PASSWORD 'your_new_password';
echo   \q
echo.
echo Step 5: Revert pg_hba.conf back to md5/scram-sha-256
echo.
pause
