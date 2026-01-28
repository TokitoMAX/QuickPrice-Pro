# Script de déploiement automatique QuickPrice Pro
# Pré-requis : Avoir 'gh' (GitHub CLI) et 'vercel' CLI installés et authentifiés

Write-Host "🚀 Démarrage du déploiement..." -ForegroundColor Cyan

# 1. GitHub
Write-Host "1. Création du dépôt GitHub..." -ForegroundColor Yellow
try {
    # Check if gh is available
    gh --version | Out-Null
    if ($?) {
        # Create repo, public, source is current dir, set remote 'origin', and push
        gh repo create quickprice-pro --public --source . --remote origin --push
        Write-Host "✅ Dépôt GitHub créé et poussé !" -ForegroundColor Green
    } else {
        Write-Host "❌ GitHub CLI (gh) n'est pas installé." -ForegroundColor Red
        Write-Host "👉 Créez le dépôt manuellement sur github.com et lancez :"
        Write-Host "   git remote add origin <URL>"
        Write-Host "   git push -u origin main"
    }
} catch {
    Write-Host "⚠️ Erreur lors de la création GitHub (Dépôt existe peut-être déjà ?)" -ForegroundColor Red
}

# 2. Vercel
Write-Host "`n2. Déploiement sur Vercel..." -ForegroundColor Yellow
try {
    # Check if vercel is available
    vercel --version | Out-Null
    if ($?) {
        vercel --prod
        Write-Host "✅ Déploiement Vercel terminé !" -ForegroundColor Green
    } else {
        Write-Host "❌ Vercel CLI n'est pas installé." -ForegroundColor Red
        Write-Host "👉 Installez-le (npm i -g vercel) ou glissez le dossier sur vercel.com"
    }
} catch {
    Write-Host "⚠️ Erreur lors du déploiement Vercel" -ForegroundColor Red
}

Write-Host "`n✨ Terminé !" -ForegroundColor Cyan
