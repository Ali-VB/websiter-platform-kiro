import { supabase } from '../../lib/supabase';
import type { Invoice, InvoiceItem } from '../../types/invoice';

export class InvoiceService {
    // Create a new invoice
    static async createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
        const { data, error } = await supabase
            .from('invoices')
            .insert({
                invoice_number: invoiceData.invoiceNumber,
                project_id: invoiceData.projectId,
                client_id: invoiceData.clientId,
                client_name: invoiceData.clientName,
                client_email: invoiceData.clientEmail,
                issue_date: invoiceData.issueDate.toISOString(),
                due_date: invoiceData.dueDate.toISOString(),
                status: invoiceData.status,
                items: invoiceData.items,
                subtotal: invoiceData.subtotal,
                tax_rate: invoiceData.taxRate,
                tax_amount: invoiceData.taxAmount,
                total: invoiceData.total,
                payment_options: invoiceData.paymentOptions,
                notes: invoiceData.notes,
                terms: invoiceData.terms,
                sent_at: invoiceData.sentAt?.toISOString(),
                paid_at: invoiceData.paidAt?.toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        return this.mapDatabaseToInvoice(data);
    }

    // Get invoice by ID
    static async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return this.mapDatabaseToInvoice(data);
    }

    // Get invoices for a project
    static async getInvoicesByProject(projectId: string): Promise<Invoice[]> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(this.mapDatabaseToInvoice);
    }

    // Get all invoices (admin)
    static async getAllInvoices(): Promise<Invoice[]> {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return data.map(this.mapDatabaseToInvoice);
    }

    // Update invoice status
    static async updateInvoiceStatus(invoiceId: string, status: Invoice['status']): Promise<void> {
        const updates: any = { status };
        
        if (status === 'sent') {
            updates.sent_at = new Date().toISOString();
        } else if (status === 'paid') {
            updates.paid_at = new Date().toISOString();
        }

        const { error } = await supabase
            .from('invoices')
            .update(updates)
            .eq('id', invoiceId);

        if (error) throw error;
    }

    // Generate invoice number
    static async generateInvoiceNumber(): Promise<string> {
        const { data, error } = await supabase
            .from('invoices')
            .select('invoice_number')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) throw error;

        const currentYear = new Date().getFullYear();
        const prefix = `WS-${currentYear}-`;

        if (!data || data.length === 0) {
            return `${prefix}001`;
        }

        const lastInvoiceNumber = data[0].invoice_number;
        const lastNumber = parseInt(lastInvoiceNumber.split('-').pop() || '0');
        const nextNumber = (lastNumber + 1).toString().padStart(3, '0');

        return `${prefix}${nextNumber}`;
    }

    // Generate invoice from project
    static async generateInvoiceFromProject(projectId: string, websiteRequest: any): Promise<Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>> {
        const invoiceNumber = await this.generateInvoiceNumber();
        const issueDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30); // 30 days payment terms

        // Calculate pricing based on website request
        const items: InvoiceItem[] = [];
        let subtotal = 0;

        // Base website cost
        const basePrice = this.calculateBasePrice(websiteRequest.website_type);
        items.push({
            id: '1',
            description: `${websiteRequest.website_type.charAt(0).toUpperCase() + websiteRequest.website_type.slice(1)} Website Development`,
            quantity: 1,
            unitPrice: basePrice,
            total: basePrice
        });
        subtotal += basePrice;

        // Add features
        if (websiteRequest.features && websiteRequest.features.length > 0) {
            websiteRequest.features.forEach((feature: string, index: number) => {
                const featurePrice = this.calculateFeaturePrice(feature);
                if (featurePrice > 0) {
                    items.push({
                        id: (index + 2).toString(),
                        description: this.getFeatureDescription(feature),
                        quantity: 1,
                        unitPrice: featurePrice,
                        total: featurePrice
                    });
                    subtotal += featurePrice;
                }
            });
        }

        // Add hosting if selected
        if (websiteRequest.hosting_preference === 'managed') {
            items.push({
                id: (items.length + 1).toString(),
                description: 'Managed Hosting (1 Year)',
                quantity: 1,
                unitPrice: 120,
                total: 120
            });
            subtotal += 120;
        }

        // Add domain if needed
        if (websiteRequest.domain_preference === 'new') {
            items.push({
                id: (items.length + 1).toString(),
                description: 'Domain Registration (1 Year)',
                quantity: 1,
                unitPrice: 15,
                total: 15
            });
            subtotal += 15;
        }

        const taxRate = 0.13; // 13% HST for Ontario, Canada
        const taxAmount = subtotal * taxRate;
        const total = subtotal + taxAmount;

        return {
            invoiceNumber,
            projectId,
            clientId: websiteRequest.user_id,
            clientName: websiteRequest.users?.name || 'Client',
            clientEmail: websiteRequest.users?.email || '',
            issueDate,
            dueDate,
            status: 'draft',
            items,
            subtotal,
            taxRate,
            taxAmount,
            total,
            paymentOptions: {
                fullPayment: true,
                partialPayment: true,
                minimumPayment: Math.ceil(total * 0.5) // 50% minimum
            },
            terms: 'Payment is due within 30 days of invoice date. Late payments may incur additional fees.',
            notes: 'Thank you for choosing Websiter for your website development needs!'
        };
    }

    // Helper methods for pricing
    private static calculateBasePrice(websiteType: string): number {
        const basePrices: Record<string, number> = {
            'business': 299,
            'ecommerce': 499,
            'portfolio': 199,
            'blog': 149,
            'landing': 99,
            'nonprofit': 199
        };
        return basePrices[websiteType] || 299;
    }

    private static calculateFeaturePrice(feature: string): number {
        const featurePrices: Record<string, number> = {
            'contact_form': 25,
            'newsletter_signup': 20,
            'social_media_integration': 15,
            'google_analytics': 10,
            'seo_optimization': 50,
            'blog_functionality': 75,
            'ecommerce_basic': 150,
            'ecommerce_advanced': 300,
            'booking_system': 100,
            'membership_area': 200,
            'multilingual': 100,
            'custom_forms': 50
        };
        return featurePrices[feature] || 0;
    }

    private static getFeatureDescription(feature: string): string {
        const descriptions: Record<string, string> = {
            'contact_form': 'Contact Form Integration',
            'newsletter_signup': 'Newsletter Signup Form',
            'social_media_integration': 'Social Media Integration',
            'google_analytics': 'Google Analytics Setup',
            'seo_optimization': 'SEO Optimization',
            'blog_functionality': 'Blog Functionality',
            'ecommerce_basic': 'Basic E-commerce Features',
            'ecommerce_advanced': 'Advanced E-commerce Features',
            'booking_system': 'Online Booking System',
            'membership_area': 'Member Login Area',
            'multilingual': 'Multi-language Support',
            'custom_forms': 'Custom Forms'
        };
        return descriptions[feature] || feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Map database record to Invoice type
    private static mapDatabaseToInvoice(data: any): Invoice {
        return {
            id: data.id,
            invoiceNumber: data.invoice_number,
            projectId: data.project_id,
            clientId: data.client_id,
            clientName: data.client_name,
            clientEmail: data.client_email,
            issueDate: new Date(data.issue_date),
            dueDate: new Date(data.due_date),
            status: data.status,
            items: data.items,
            subtotal: data.subtotal,
            taxRate: data.tax_rate,
            taxAmount: data.tax_amount,
            total: data.total,
            paymentOptions: data.payment_options,
            notes: data.notes,
            terms: data.terms,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            sentAt: data.sent_at ? new Date(data.sent_at) : undefined,
            paidAt: data.paid_at ? new Date(data.paid_at) : undefined,
        };
    }
}