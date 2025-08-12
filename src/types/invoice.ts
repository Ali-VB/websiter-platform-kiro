export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    projectId: string;
    clientId: string;
    clientName: string;
    clientEmail: string;
    
    // Invoice details
    issueDate: Date;
    dueDate: Date;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    
    // Items and pricing
    items: InvoiceItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    
    // Payment options
    paymentOptions: {
        fullPayment: boolean;
        partialPayment: boolean;
        minimumPayment?: number;
    };
    
    // Metadata
    notes?: string;
    terms?: string;
    createdAt: Date;
    updatedAt: Date;
    sentAt?: Date;
    paidAt?: Date;
}

export interface InvoiceTemplate {
    companyName: string;
    companyAddress: string;
    companyPhone: string;
    companyEmail: string;
    companyWebsite: string;
    logo?: string;
    
    // Default terms and conditions
    defaultTerms: string;
    defaultNotes: string;
    
    // Tax settings
    defaultTaxRate: number;
    taxLabel: string; // e.g., "HST", "GST", "VAT"
}