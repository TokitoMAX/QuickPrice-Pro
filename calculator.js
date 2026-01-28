

function calculatePrice() {
    // Check if calculator exists on this page
    const revenueInput = document.getElementById('monthlyRevenue');
    if (!revenueInput) return; // Exit if calculator inputs are not present

    // Get input values
    const monthlyRevenue = parseFloat(revenueInput.value) || 0;
    const workingDays = parseFloat(document.getElementById('workingDays')?.value) || 0;
    const hoursPerDay = parseFloat(document.getElementById('hoursPerDay')?.value) || 0;
    const monthlyCharges = parseFloat(document.getElementById('monthlyCharges')?.value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate')?.value) || 0;

    // Validation
    if (workingDays === 0 || hoursPerDay === 0) {
        return;
    }

    // ... rest of calculation ...
    // Calculate total monthly hours
    const monthlyHours = workingDays * hoursPerDay;

    // Calculate total needed before taxes
    const totalNeeded = monthlyRevenue + monthlyCharges;

    // Calculate revenue needed after taxes
    const revenueNeeded = totalNeeded / (1 - (taxRate / 100));

    // Calculate hourly rate
    const hourlyRate = revenueNeeded / monthlyHours;

    // Calculate daily rate
    const dailyRate = hourlyRate * hoursPerDay;

    // Calculate annual revenue
    const annualRevenue = revenueNeeded * 12;

    // Save inputs to storage specific for calculator
    saveCalculatorInputs({
        monthlyRevenue, workingDays, hoursPerDay, monthlyCharges, taxRate
    });

    // Update UI (with checks)
    const hourlyEl = document.getElementById('hourlyRate');
    if (hourlyEl) hourlyEl.textContent = `${Math.ceil(hourlyRate)}€/h`;

    const dailyEl = document.getElementById('dailyRate');
    if (dailyEl) dailyEl.textContent = `${Math.ceil(dailyRate)}€/j`;

    const annualEl = document.getElementById('annualRevenue');
    if (annualEl) annualEl.textContent = `${Math.ceil(annualRevenue).toLocaleString('fr-FR')}€`;

    // Update breakdown
    const taxAmount = revenueNeeded * (taxRate / 100);
    const bdNet = document.getElementById('breakdownNet');
    if (bdNet) bdNet.textContent = `${Math.ceil(monthlyRevenue).toLocaleString('fr-FR')}€`;

    const bdTax = document.getElementById('breakdownTax');
    if (bdTax) bdTax.textContent = `${Math.ceil(taxAmount).toLocaleString('fr-FR')}€`;

    const bdCharges = document.getElementById('breakdownCharges');
    if (bdCharges) bdCharges.textContent = `${Math.ceil(monthlyCharges).toLocaleString('fr-FR')}€`;

    const bdTotal = document.getElementById('breakdownTotal');
    if (bdTotal) bdTotal.textContent = `${Math.ceil(revenueNeeded).toLocaleString('fr-FR')}€`;

    // Update comparison marker position
    updateComparisonMarker(hourlyRate);

    // Add animation to results
    animateResults();
}
// ...
function updateComparisonMarker(hourlyRate) {
    const marker = document.getElementById('yourMarker');
    if (!marker) return; // Exit if marker doesn't exist

    const bar = marker.parentElement;

    // Market ranges
    const min = 30;
    const max = 80;

    // Calculate position (clamp between 10% and 90%)
    let position = ((hourlyRate - min) / (max - min)) * 80 + 10;
    position = Math.max(10, Math.min(90, position));

    marker.style.left = `${position}%`;

    // Update marker text
    marker.querySelector('.marker-label').textContent = `Vous: ${Math.ceil(hourlyRate)}€/h`;
}

function animateResults() {
    const cards = document.querySelectorAll('.result-card');
    cards.forEach((card, index) => {
        card.style.animation = 'none';
        setTimeout(() => {
            card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s backwards`;
        }, 10);
    });
}

function exportResults() {
    // Get current values
    const hourlyRate = document.getElementById('hourlyRate').textContent;
    const dailyRate = document.getElementById('dailyRate').textContent;
    const annualRevenue = document.getElementById('annualRevenue').textContent;

    const monthlyRevenue = document.getElementById('monthlyRevenue').value;
    const workingDays = document.getElementById('workingDays').value;
    const hoursPerDay = document.getElementById('hoursPerDay').value;
    const monthlyCharges = document.getElementById('monthlyCharges').value;
    const taxRate = document.getElementById('taxRate').value;

    // Create detailed report
    const report = `
═══════════════════════════════════════════════════
                   QUICKPRICE RAPPORT
           Analyse de Tarification Freelance
═══════════════════════════════════════════════════

📊 VOS PARAMÈTRES
────────────────────────────────────────────────────
• Revenu mensuel souhaité : ${monthlyRevenue}€
• Jours travaillés/mois : ${workingDays} jours
• Heures facturables/jour : ${hoursPerDay}h
• Charges mensuelles : ${monthlyCharges}€
• Taux charges sociales : ${taxRate}%

💰 VOS TARIFS RECOMMANDÉS
────────────────────────────────────────────────────
• Tarif Horaire Minimum : ${hourlyRate}
• Tarif Journalier (TJM) : ${dailyRate}
• Revenu Annuel Potentiel : ${annualRevenue}

📈 RÉPARTITION MENSUELLE
────────────────────────────────────────────────────
• Revenu net : ${document.getElementById('breakdownNet').textContent}
• Charges sociales : ${document.getElementById('breakdownTax').textContent}
• Charges professionnelles : ${document.getElementById('breakdownCharges').textContent}
• Total à facturer : ${document.getElementById('breakdownTotal').textContent}

💡 RECOMMANDATIONS
────────────────────────────────────────────────────
✓ Ne descendez jamais en dessous de ce tarif horaire
✓ Prévoyez une marge pour les périodes creuses
✓ Ajustez selon votre expérience et votre secteur
✓ Révisez vos tarifs tous les 6-12 mois

────────────────────────────────────────────────────
Généré avec QuickPrice le ${new Date().toLocaleDateString('fr-FR')}
www.quickprice.com
═══════════════════════════════════════════════════
    `;

    // Create and download file
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QuickPrice_Rapport_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message
    showNotification('✅ Rapport téléchargé avec succès !');
}

function shareResults() {
    const hourlyRate = document.getElementById('hourlyRate').textContent;
    const dailyRate = document.getElementById('dailyRate').textContent;

    const text = `💰 QuickPrice m'a aidé à calculer mes tarifs freelance !\n\n• Tarif horaire : ${hourlyRate}\n• TJM : ${dailyRate}\n\nCalculez vos tarifs gratuitement avec QuickPrice !`;

    // Try to use Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'Mes tarifs QuickPrice',
            text: text
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
        document.execCommand('copy');
        showNotification('📋 Copié dans le presse-papier !');
    } catch (err) {
        showNotification('❌ Erreur lors de la copie');
    }

    document.body.removeChild(textarea);
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(99, 102, 241, 0.4);
        z-index: 10000;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Add slide animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
