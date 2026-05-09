// src/utils/printUtils.js

export const printReport = (elementId, title) => {
    // Get the report element
    const reportElement = document.getElementById(elementId);
    if (!reportElement) {
        console.error('Report element not found:', elementId);
        alert('Report content not found. Please try again.');
        return;
    }

    // Clone the element to avoid modifying the original
    const printContent = reportElement.cloneNode(true);

    // Remove any buttons or no-print elements from the clone
    const noPrintElements = printContent.querySelectorAll('.no-print, button, .print-hide');
    noPrintElements.forEach(el => el.remove());

    // Create print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (!printWindow) {
        alert('Please allow pop-ups to print reports');
        return;
    }

    // Get current page title
    const pageTitle = title || document.title;

    // Get company settings - try multiple sources
    let companyName = 'ERP System';
    let companyAddress = '';
    let companyPhone = '';
    let companyEmail = '';

    // Try to get from localStorage
    try {
        const savedName = localStorage.getItem('company_name');
        if (savedName) companyName = savedName;

        const savedAddress = localStorage.getItem('company_address');
        if (savedAddress) companyAddress = savedAddress;

        const savedPhone = localStorage.getItem('company_phone');
        if (savedPhone) companyPhone = savedPhone;

        const savedEmail = localStorage.getItem('company_email');
        if (savedEmail) companyEmail = savedEmail;
    } catch (e) {
        console.error('Error loading company settings:', e);
    }

    // Basic print styles
    const printStyles = `
        <style>
            @page {
                size: A4;
                margin: 1.5cm;
            }
            body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 12px;
                line-height: 1.4;
            }
            .print-header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 10px;
                border-bottom: 2px solid #333;
            }
            .company-name {
                font-size: 22px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .company-details {
                font-size: 11px;
                color: #555;
                margin-bottom: 3px;
            }
            .report-title {
                font-size: 16px;
                font-weight: bold;
                margin: 15px 0 5px;
            }
            .report-date {
                font-size: 10px;
                color: #666;
                margin-bottom: 20px;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 20px;
            }
            th, td {
                border: 1px solid #ccc;
                padding: 8px 10px;
                text-align: left;
                vertical-align: top;
            }
            th {
                background-color: #f5f5f5;
                font-weight: bold;
            }
            .text-right {
                text-align: right;
            }
            .text-center {
                text-align: center;
            }
            .font-bold {
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-size: 9px;
                color: #888;
            }
            @media print {
                body {
                    padding: 0;
                    margin: 0;
                }
                .no-print {
                    display: none !important;
                }
            }
        </style>
    `;

    // Write HTML to print window
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${pageTitle}</title>
            ${printStyles}
        </head>
        <body>
            <div class="print-header">
                <div class="company-name">${escapeHtml(companyName)}</div>
                ${companyAddress ? `<div class="company-details">${escapeHtml(companyAddress)}</div>` : ''}
                ${companyPhone ? `<div class="company-details">📞 ${escapeHtml(companyPhone)}</div>` : ''}
                ${companyEmail ? `<div class="company-details">✉️ ${escapeHtml(companyEmail)}</div>` : ''}
                <div class="report-title">${escapeHtml(pageTitle)}</div>
                <div class="report-date">Generated on: ${new Date().toLocaleString()}</div>
            </div>
            ${printContent.outerHTML}
            <div class="footer">
                This is a computer-generated report. No signature required.
            </div>
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { 
                        window.close(); 
                    }, 1000);
                };
            <\/script>
        </body>
        </html>
    `);

    printWindow.document.close();
};

// Helper function to escape HTML special characters
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}