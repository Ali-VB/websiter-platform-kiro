import jsPDF from 'jspdf';
import type { Project } from '../types';

interface InvoiceData {
    invoiceNumber: string;
    issueDate: string;
    dueDate: string;
    notes: string;
    taxRate: number;
}

export const generateInvoicePDF = (project: Project, invoiceData: InvoiceData) => {
    const pdf = new jsPDF();
    
    // Company header
    pdf.setFontSize(20);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text('WEBSITER', 20, 30);
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Professional Website Development', 20, 38);
    pdf.text('Email: hello@websiter.com', 20, 45);
    pdf.text('Phone: (555) 123-4567', 20, 52);
    
    // Invoice title
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('INVOICE', 150, 30);
    
    // Invoice details
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Invoice #: ${invoiceData.invoiceNumber}`, 150, 45);
    pdf.text(`Issue Date: ${invoiceData.issueDate}`, 150, 52);
    pdf.text(`Due Date: ${invoiceData.dueDate}`, 150, 59);
    
    // Client information
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Bill To:', 20, 80);
    
    pdf.setFontSize(10);
    pdf.text(project.clientName, 20, 90);
    pdf.text(`Project: ${project.title}`, 20, 97);
    pdf.text(`Website Type: ${project.websiteType}`, 20, 104);
    
    // Table header
    const tableStartY = 130;
    pdf.setFillColor(249, 250, 251); // Light gray background
    pdf.rect(20, tableStartY, 170, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Description', 25, tableStartY + 7);
    pdf.text('Amount', 160, tableStartY + 7);
    
    // Table content
    let currentY = tableStartY + 20;
    const lineHeight = 15;
    
    // Main project item
    pdf.text(project.title, 25, currentY);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(project.description, 25, currentY + 5);
    
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.text(`$${project.price || 0}`, 160, currentY);
    
    currentY += lineHeight;
    
    // Features
    if (project.features && project.features.length > 0) {
        project.features.forEach((feature: any) => {
            if (feature.price > 0) {
                pdf.text(feature.name, 25, currentY);
                pdf.setFontSize(8);
                pdf.setTextColor(100, 100, 100);
                pdf.text('Additional feature', 25, currentY + 5);
                
                pdf.setFontSize(10);
                pdf.setTextColor(0, 0, 0);
                pdf.text(`$${feature.price}`, 160, currentY);
                
                currentY += lineHeight;
            }
        });
    }
    
    // Calculations
    const calculateSubtotal = () => {
        const baseAmount = project.price || 0;
        const featuresTotal = project.features?.reduce((sum: number, feature: any) => sum + (feature.price || 0), 0) || 0;
        return baseAmount + featuresTotal;
    };
    
    const subtotal = calculateSubtotal();
    const tax = subtotal * (invoiceData.taxRate / 100);
    const total = subtotal + tax;
    
    // Summary section
    currentY += 10;
    const summaryX = 130;
    
    pdf.setFontSize(10);
    pdf.text('Subtotal:', summaryX, currentY);
    pdf.text(`$${subtotal.toFixed(2)}`, 160, currentY);
    
    if (invoiceData.taxRate > 0) {
        currentY += 8;
        pdf.text(`Tax (${invoiceData.taxRate}%):`, summaryX, currentY);
        pdf.text(`$${tax.toFixed(2)}`, 160, currentY);
    }
    
    // Total
    currentY += 12;
    pdf.setFontSize(12);
    pdf.setTextColor(59, 130, 246); // Blue color
    pdf.text('Total:', summaryX, currentY);
    pdf.text(`$${total.toFixed(2)}`, 160, currentY);
    
    // Notes
    if (invoiceData.notes) {
        currentY += 25;
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Notes:', 20, currentY);
        
        currentY += 8;
        pdf.setTextColor(100, 100, 100);
        const splitNotes = pdf.splitTextToSize(invoiceData.notes, 170);
        pdf.text(splitNotes, 20, currentY);
    }
    
    // Footer
    const footerY = 270;
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Thank you for your business!', 20, footerY);
    pdf.text('Payment terms: Net 30 days', 20, footerY + 5);
    
    return pdf;
};

export const downloadInvoicePDF = (project: Project, invoiceData: InvoiceData) => {
    const pdf = generateInvoicePDF(project, invoiceData);
    const fileName = `invoice-${invoiceData.invoiceNumber}-${project.clientName.replace(/\s+/g, '-')}.pdf`;
    pdf.save(fileName);
};

export const previewInvoicePDF = (project: Project, invoiceData: InvoiceData) => {
    const pdf = generateInvoicePDF(project, invoiceData);
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
};