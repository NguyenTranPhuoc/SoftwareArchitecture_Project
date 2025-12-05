# Verify User Account Script
# This script manually verifies a user account in the auth database
# Use this for development when email service is not configured

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

Write-Host "`n🔐 Verifying User Account..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Check if user exists
Write-Host "`n[1/2] Checking if user exists..." -ForegroundColor Yellow
$checkUser = docker exec auth-user-monorepo-postgres-1 psql -U zalo_auth_user -d zalo_auth_db -t -c "SELECT email, is_verified FROM users WHERE email = '$Email';" 2>&1

if ($checkUser -like "*0 rows*" -or $checkUser -like "*does not exist*") {
    Write-Host "❌ Error: User with email '$Email' not found!" -ForegroundColor Red
    Write-Host "`n💡 Make sure you've registered this account first" -ForegroundColor Yellow
    Write-Host "   Go to http://localhost:3003 and click 'Đăng ký'`n" -ForegroundColor White
    exit 1
}

Write-Host "✅ User found: $Email" -ForegroundColor Green

# Verify the user
Write-Host "`n[2/2] Verifying account..." -ForegroundColor Yellow
$result = docker exec auth-user-monorepo-postgres-1 psql -U zalo_auth_user -d zalo_auth_db -c "UPDATE users SET is_verified = true WHERE email = '$Email';" 2>&1

if ($result -like "*UPDATE 1*") {
    Write-Host "✅ Account verified successfully!" -ForegroundColor Green
    Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "🎉 You can now login!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Go to http://localhost:3003" -ForegroundColor White
    Write-Host "   2. Click 'Đăng nhập' (Login)" -ForegroundColor White
    Write-Host "   3. Enter your email: $Email" -ForegroundColor White
    Write-Host "   4. Enter your password" -ForegroundColor White
    Write-Host "   5. Start chatting!`n" -ForegroundColor White
} else {
    Write-Host "❌ Error: Failed to verify account" -ForegroundColor Red
    Write-Host "Details: $result`n" -ForegroundColor Gray
    exit 1
}

# Show verification status
Write-Host "🔍 Verification Status:" -ForegroundColor Cyan
docker exec auth-user-monorepo-postgres-1 psql -U zalo_auth_user -d zalo_auth_db -c "SELECT email, is_verified, created_at FROM users WHERE email = '$Email';"

Write-Host ""
