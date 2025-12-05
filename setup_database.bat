@echo off
REM ================================================
REM Zalo Clone - PostgreSQL Database Setup Script
REM For Students: Run this to create the database
REM ================================================

echo.
echo ========================================
echo  ZALO CLONE - DATABASE SETUP
echo ========================================
echo.

REM Set PostgreSQL bin path
set PGBIN=C:\Program Files\PostgreSQL\18\bin
set PGPASSWORD=%1

if "%1"=="" (
    echo Error: Please provide your PostgreSQL password
    echo Usage: setup_database.bat YOUR_PASSWORD
    echo Example: setup_database.bat postgres123
    exit /b 1
)

echo [1/3] Testing PostgreSQL connection...
"%PGBIN%\psql" -U postgres -c "SELECT version();" > nul 2>&1
if errorlevel 1 (
    echo ERROR: Cannot connect to PostgreSQL. Check if:
    echo   1. PostgreSQL service is running
    echo   2. Your password is correct
    exit /b 1
)
echo      ✓ PostgreSQL connection successful

echo.
echo [2/3] Creating database 'zalo_db'...
"%PGBIN%\psql" -U postgres -c "DROP DATABASE IF EXISTS zalo_db;"
"%PGBIN%\psql" -U postgres -c "CREATE DATABASE zalo_db;"
if errorlevel 1 (
    echo ERROR: Failed to create database
    exit /b 1
)
echo      ✓ Database 'zalo_db' created

echo.
echo [3/3] Creating tables and sample data...
"%PGBIN%\psql" -U postgres -d zalo_db -f database_setup.sql
if errorlevel 1 (
    echo ERROR: Failed to create tables
    exit /b 1
)
echo      ✓ Tables created successfully

echo.
echo ========================================
echo  DATABASE SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo   1. Update your .env file with the password
echo   2. Run: npm run dev:server
echo.

set PGPASSWORD=
