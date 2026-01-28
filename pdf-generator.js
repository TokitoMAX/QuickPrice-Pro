// QuickPrice Pro - PDF Generator (Simple version sans bibliothèque externe)

const PDFGenerator = {
    generateInvoice(invoice, client, user) {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const date = new Date(invoice.createdAt).toLocaleDateString('fr-FR');
        const dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('fr-FR') : '-';

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Facture ${invoice.number}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 50px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .company-info h1 { margin: 0; color: #2c3e50; font-size: 24px; }
                    .invoice-details { text-align: right; }
                    .invoice-details h2 { margin: 0; color: #2c3e50; }
                    .client-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .box { width: 45%; }
                    .box h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; color: #7f8c8d; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600; color: #2c3e50; }
                    td { padding: 12px; border-bottom: 1px solid #eee; }
                    .totals { width: 40%; margin-left: auto; }
                    .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
                    .final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #2c3e50; color: #2c3e50; }
                    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 20px; }
                    .status-stamp {
                        position: absolute; top: 150px; right: 40px;
                        font-size: 20px; font-weight: bold; color: #c0392b; border: 3px solid #c0392b;
                        padding: 10px; transform: rotate(-15deg); opacity: 0.5;
                    }
                    .status-stamp.paid { color: #27ae60; border-color: #27ae60; }
                    
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${invoice.status === 'paid' ? '<div class="status-stamp paid">PAYÉE</div>' : ''}
                
                <div class="header">
                    <div class="company-info">
                        <h1>${user.company.name || 'Votre Entreprise'}</h1>
                        <p>
                            ${user.company.address || ''}<br>
                            ${user.company.email || ''}<br>
                            ${user.company.phone || ''}<br>
                            ${user.company.siret ? `SIRET: ${user.company.siret}` : ''}
                        </p>
                    </div>
                    <div class="invoice-details">
                        <h2>FACTURE</h2>
                        <p>
                            <strong>N°:</strong> ${invoice.number}<br>
                            <strong>Date:</strong> ${date}<br>
                            <strong>Échéance:</strong> ${dueDate}
                        </p>
                    </div>
                </div>

                <div class="client-section">
                    <div class="box">
                        <h3>Émetteur</h3>
                        <p>
                            <strong>${user.company.name || 'Votre Nom'}</strong><br>
                            ${user.company.address || ''}
                        </p>
                    </div>
                    <div class="box">
                        <h3>Facturé à</h3>
                        <p>
                            <strong>${client.name}</strong><br>
                            ${client.address || ''}<br>
                            ${client.zipCode || ''} ${client.city || ''}<br>
                            ${client.email || ''}
                        </p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="width: 100px; text-align: right;">Qté</th>
                            <th style="width: 120px; text-align: right;">Prix Unit.</th>
                            <th style="width: 120px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${invoice.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td style="text-align: right;">${item.quantity}</td>
                            <td style="text-align: right;">${App.formatCurrency(item.unitPrice)}</td>
                            <td style="text-align: right;">${App.formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Sous-total HT</span>
                        <span>${App.formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>TVA (${settings.taxRate}%)</span>
                        <span>${App.formatCurrency(invoice.tax)}</span>
                    </div>
                    <div class="total-row final-total">
                        <span>Total TTC</span>
                        <span>${App.formatCurrency(invoice.total)}</span>
                    </div>
                </div>

                <div style="margin-top: 40px; font-size: 14px;">
                    <p><strong>Conditions de paiement :</strong> ${invoice.dueDate ? 'Paiement avant l\'échéance' : 'Paiement à réception'}</p>
                    <p style="font-size: 12px; color: #666;">En cas de retard de paiement, indemnité forfaitaire pour frais de recouvrement : 40€ (art. L.441-6 du Code de Commerce).</p>
                </div>

                <div class="footer">
                    <p>Facture générée par QuickPrice Pro</p>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showNotification('✅ Impression lancée (Enregistrez en PDF)', 'success');
    },

    generateQuote(quote, client, user) {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const date = new Date(quote.createdAt).toLocaleDateString('fr-FR');
        const validUntil = new Date(new Date(quote.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>Devis ${quote.number}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
                    .header { display: flex; justify-content: space-between; margin-bottom: 50px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                    .company-info h1 { margin: 0; color: #2c3e50; font-size: 24px; }
                    .invoice-details { text-align: right; }
                    .invoice-details h2 { margin: 0; color: #2c3e50; }
                    .client-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .box { width: 45%; }
                    .box h3 { border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; color: #7f8c8d; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; font-weight: 600; color: #2c3e50; }
                    td { padding: 12px; border-bottom: 1px solid #eee; }
                    .totals { width: 40%; margin-left: auto; }
                    .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
                    .final-total { font-size: 18px; font-weight: bold; border-top: 2px solid #2c3e50; color: #2c3e50; }
                    .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #eee; padding-top: 20px; }
                    .signature-box { margin-top: 60px; page-break-inside: avoid; border: 1px solid #eee; padding: 20px; width: 60%; margin-left: auto; }
                    .signature-box p { margin-bottom: 40px; font-weight: bold; }
                    @media print {
                        body { padding: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-info">
                        <h1>${user.company.name || 'Votre Entreprise'}</h1>
                        <p>
                            ${user.company.address || ''}<br>
                            ${user.company.email || ''}<br>
                            ${user.company.phone || ''}<br>
                            ${user.company.siret ? `SIRET: ${user.company.siret}` : ''}
                        </p>
                    </div>
                    <div class="invoice-details">
                        <h2>DEVIS</h2>
                        <p>
                            <strong>N°:</strong> ${quote.number}<br>
                            <strong>Date:</strong> ${date}<br>
                            <strong>Valide jusqu'au:</strong> ${validUntil}
                        </p>
                    </div>
                </div>

                <div class="client-section">
                    <div class="box">
                        <h3>Émis par</h3>
                        <p>
                            <strong>${user.company.name || 'Votre Nom'}</strong><br>
                            ${user.company.address || ''}
                        </p>
                    </div>
                    <div class="box">
                        <h3>adressé à</h3>
                        <p>
                            <strong>${client.name}</strong><br>
                            ${client.address || ''}<br>
                            ${client.zipCode || ''} ${client.city || ''}<br>
                            ${client.email || ''}
                        </p>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="width: 100px; text-align: right;">Qté</th>
                            <th style="width: 120px; text-align: right;">Prix Unit.</th>
                            <th style="width: 120px; text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${quote.items.map(item => `
                        <tr>
                            <td>${item.description}</td>
                            <td style="text-align: right;">${item.quantity}</td>
                            <td style="text-align: right;">${App.formatCurrency(item.unitPrice)}</td>
                            <td style="text-align: right;">${App.formatCurrency(item.quantity * item.unitPrice)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span>Sous-total HT</span>
                        <span>${App.formatCurrency(quote.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span>TVA (${settings.taxRate}%)</span>
                        <span>${App.formatCurrency(quote.tax)}</span>
                    </div>
                    <div class="total-row final-total">
                        <span>Total TTC</span>
                        <span>${App.formatCurrency(quote.total)}</span>
                    </div>
                </div>

                <div class="signature-box">
                    <p>Bon pour accord</p>
                    <div style="font-size: 12px; color: #666; margin-bottom: 20px;">Date et signature précédées de la mention "Bon pour accord"</div>
                    <div style="height: 50px; border-bottom: 1px dotted #ccc;"></div>
                </div>

                <div class="footer">
                    <p>Devis généré par QuickPrice Pro</p>
                </div>

                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank'; // Open in new tab which triggers print
        a.download = `Devis_${quote.number}.html`; // Fallback name
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showNotification('✅ Devis généré (Impression lancée)', 'success');
    }
};
