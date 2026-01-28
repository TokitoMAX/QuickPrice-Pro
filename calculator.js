// QuickPrice Pro - Calculator Module
// Handles TJM and Hourly Rate calculations

function initCalculator() {
    loadCalculatorInputs();

    // Add event listeners for auto-calculation
    const inputs = ['monthlyRevenue', 'workingDays', 'hoursPerDay', 'monthlyCharges', 'taxRate'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', calculatePrice);
        }
    });

    // Run initial calculation
    calculatePrice();
}

function calculatePrice() {
    // Check if calculator exists on this page
    const revenueInput = document.getElementById('monthlyRevenue');
    if (!revenueInput) return;

    // Get input values
    const monthlyRevenue = parseFloat(revenueInput.value) || 0;
    const workingDays = parseFloat(document.getElementById('workingDays')?.value) || 0;
    const hoursPerDay = parseFloat(document.getElementById('hoursPerDay')?.value) || 0;
    const monthlyCharges = parseFloat(document.getElementById('monthlyCharges')?.value) || 0;
    const taxRate = parseFloat(document.getElementById('taxRate')?.value) || 0;

    // Validation
    if (workingDays === 0 || hoursPerDay === 0) return;

    // Calculate total needed before taxes
    // Formula: RevenueNeeded = (NetGoal + Charges) / (1 - TaxRate)

    const targetNet = monthlyRevenue;
    const charges = monthlyCharges;
    const rate = taxRate / 100;

    // Total a facturer pour avoir le net voulu + payer les charges
    // Rev - (Rev * Rate) - Charges = Net
    // Rev(1 - Rate) = Net + Charges
    // Rev = (Net + Charges) / (1 - Rate)

    let revenueNeeded = 0;
    if (rate < 1) {
        revenueNeeded = (targetNet + charges) / (1 - rate);
    }

    // Calculate total monthly hours
    const monthlyHours = workingDays * hoursPerDay;

    // Calculate hourly rate
    const hourlyRate = monthlyHours > 0 ? revenueNeeded / monthlyHours : 0;

    // Calculate daily rate
    const dailyRate = hourlyRate * hoursPerDay;

    // Calculate annual revenue
    const annualRevenue = revenueNeeded * 12;

    // Save inputs to storage
    saveCalculatorInputs({
        monthlyRevenue, workingDays, hoursPerDay, monthlyCharges, taxRate
    });

    // Update UI
    const hourlyEl = document.getElementById('hourlyRate');
    if (hourlyEl) hourlyEl.textContent = `${Math.ceil(hourlyRate)} €/h`;

    const dailyEl = document.getElementById('dailyRate');
    if (dailyEl) dailyEl.textContent = `${Math.ceil(dailyRate)} €/j`;

    const annualEl = document.getElementById('annualRevenue');
    if (annualEl) annualEl.textContent = `${Math.ceil(annualRevenue).toLocaleString('fr-FR')} €`;

    // Update breakdown
    const taxAmount = revenueNeeded * rate;

    updateElement('breakdownNet', Math.ceil(targetNet));
    updateElement('breakdownTax', Math.ceil(taxAmount));
    updateElement('breakdownCharges', Math.ceil(charges));
    updateElement('breakdownTotal', Math.ceil(revenueNeeded));

    // Update comparison marker
    updateComparisonMarker(hourlyRate);

    // Show results
    const resultsPanel = document.getElementById('resultsPanel');
    if (resultsPanel) resultsPanel.style.display = 'block';
}

function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = `${value.toLocaleString('fr-FR')} €`;
}

function saveCalculatorInputs(data) {
    localStorage.setItem('qp_calculator_inputs', JSON.stringify(data));
}

function loadCalculatorInputs() {
    const data = JSON.parse(localStorage.getItem('qp_calculator_inputs'));
    if (data) {
        setInputValue('monthlyRevenue', data.monthlyRevenue);
        setInputValue('workingDays', data.workingDays);
        setInputValue('hoursPerDay', data.hoursPerDay);
        setInputValue('monthlyCharges', data.monthlyCharges);
        setInputValue('taxRate', data.taxRate);
    }
}

function setInputValue(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) el.value = value;
}

function updateComparisonMarker(hourlyRate) {
    const marker = document.getElementById('yourMarker');
    if (!marker) return;

    // Market ranges (Arbitrary for visual aid)
    const min = 30;
    const max = 150;

    // Calculate position (clamp between 5% and 95%)
    let position = ((hourlyRate - min) / (max - min)) * 100;
    position = Math.max(5, Math.min(95, position));

    marker.style.left = `${position}%`;

    const label = marker.querySelector('.marker-label');
    if (label) label.textContent = `Vous: ${Math.ceil(hourlyRate)}€`;
}

// Integration with Quotes
function useRate(type) {
    const dailyRateText = document.getElementById('dailyRate').textContent;
    const dailyRate = parseFloat(dailyRateText.replace(/[^0-9]/g, ''));

    if (dailyRate > 0) {
        // Create a draft item
        const draftItem = {
            description: 'Prestation (base TJM calculé)',
            quantity: 1,
            unitPrice: dailyRate
        };

        // Save to storage to be picked up by quotes.js
        Storage.set('qp_draft_quote_item', draftItem);

        // Navigate to quotes
        App.navigateTo('quotes');
        // Quotes will auto-detect the draft item in init
        setTimeout(() => {
            if (typeof Quotes !== 'undefined') Quotes.showAddForm();
        }, 100);
    }
}

// Global Exports
window.calculatePrice = calculatePrice;
window.useRate = useRate;
window.loadCalculatorInputs = initCalculator; // Alias for app.js loading
