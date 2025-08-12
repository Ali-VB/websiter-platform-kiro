// Mock data for quote management system
// This will be replaced with real Supabase integration once database schema is set up

import type { ProjectQuote, QuoteSearchParams, WorkflowMetrics } from '../../types/quote';

// Mock quotes data
const mockQuotes: (ProjectQuote & { clientInfo?: any; requestInfo?: any })[] = [
  {
    id: '1',
    projectRequestId: 'req-1',
    clientId: 'client-1',
    adminId: 'admin-1',
    status: 'pending',
    originalQuote: {
      lineItems: [
        {
          id: '1',
          description: 'Company Portfolio Website',
          category: 'design',
          quantity: 1,
          unitPrice: 1500,
          totalPrice: 1500,
          isEditable: true,
          isCustom: false
        },
        {
          id: '2',
          description: 'Contact Form Integration',
          category: 'development',
          quantity: 1,
          unitPrice: 200,
          totalPrice: 200,
          isEditable: true,
          isCustom: false
        }
      ],
      subtotal: 1700,
      taxRate: 0.13,
      taxAmount: 221,
      totalAmount: 1921,
      initialPaymentPercentage: 50,
      initialPaymentAmount: 960.50,
      finalPaymentAmount: 960.50,
      estimatedTimeline: {
        estimatedStartDate: new Date(),
        estimatedCompletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        milestones: [
          {
            id: '1',
            title: 'Design Phase',
            description: 'Initial design concepts and wireframes',
            estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            order: 1
          },
          {
            id: '2',
            title: 'Development Phase',
            description: 'Website development and functionality',
            estimatedDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
            order: 2
          }
        ]
      },
      terms: '50% deposit required to begin work. Final payment due upon completion.'
    },
    version: 1,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    urgencyLevel: 'urgent',
    clientFeedback: [],
    adminNotes: 'Client requested modern design with mobile responsiveness.',
    clientInfo: {
      id: 'client-1',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1 (555) 123-4567'
    },
    requestInfo: {
      websiteType: 'company_portfolio',
      features: [
        { name: 'Contact Form', selected: true, price: 200 },
        { name: 'Gallery', selected: false, price: 150 }
      ],
      clientDetails: {
        company: 'Smith Consulting',
        additionalNotes: 'Need professional look for consulting business'
      }
    }
  },
  {
    id: '2',
    projectRequestId: 'req-2',
    clientId: 'client-2',
    status: 'under_review',
    originalQuote: {
      lineItems: [
        {
          id: '1',
          description: 'E-commerce Website',
          category: 'development',
          quantity: 1,
          unitPrice: 3000,
          totalPrice: 3000,
          isEditable: true,
          isCustom: false
        },
        {
          id: '2',
          description: 'Payment Gateway Integration',
          category: 'development',
          quantity: 1,
          unitPrice: 500,
          totalPrice: 500,
          isEditable: true,
          isCustom: false
        }
      ],
      subtotal: 3500,
      taxRate: 0.13,
      taxAmount: 455,
      totalAmount: 3955,
      initialPaymentPercentage: 50,
      initialPaymentAmount: 1977.50,
      finalPaymentAmount: 1977.50,
      estimatedTimeline: {
        estimatedStartDate: new Date(),
        estimatedCompletionDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        milestones: [
          {
            id: '1',
            title: 'Design & Planning',
            description: 'E-commerce design and product catalog planning',
            estimatedDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            order: 1
          },
          {
            id: '2',
            title: 'Development',
            description: 'E-commerce functionality and payment integration',
            estimatedDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
            order: 2
          }
        ]
      },
      terms: 'E-commerce project with 50% upfront payment. Includes payment gateway setup.'
    },
    version: 1,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    urgencyLevel: 'normal',
    clientFeedback: [],
    adminNotes: 'Complex e-commerce project, needs detailed planning.',
    clientInfo: {
      id: 'client-2',
      name: 'Sarah Johnson',
      email: 'sarah@boutique.com',
      phone: '+1 (555) 987-6543'
    },
    requestInfo: {
      websiteType: 'ecommerce',
      features: [
        { name: 'Product Catalog', selected: true, price: 800 },
        { name: 'Shopping Cart', selected: true, price: 600 },
        { name: 'Payment Gateway', selected: true, price: 500 }
      ],
      clientDetails: {
        company: 'Sarah\'s Boutique',
        additionalNotes: 'Online clothing store with inventory management'
      }
    }
  },
  {
    id: '3',
    projectRequestId: 'req-3',
    clientId: 'client-3',
    status: 'confirmed',
    originalQuote: {
      lineItems: [
        {
          id: '1',
          description: 'Personal Resume Website',
          category: 'design',
          quantity: 1,
          unitPrice: 800,
          totalPrice: 800,
          isEditable: true,
          isCustom: false
        }
      ],
      subtotal: 800,
      taxRate: 0.13,
      taxAmount: 104,
      totalAmount: 904,
      initialPaymentPercentage: 50,
      initialPaymentAmount: 452,
      finalPaymentAmount: 452,
      estimatedTimeline: {
        estimatedStartDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        estimatedCompletionDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        milestones: [
          {
            id: '1',
            title: 'Content Collection',
            description: 'Gather resume content and portfolio items',
            estimatedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            order: 1
          }
        ]
      },
      terms: 'Simple resume website with portfolio section.'
    },
    version: 1,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    confirmedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    urgencyLevel: 'normal',
    clientFeedback: [],
    adminNotes: 'Quick turnaround project, client very responsive.',
    clientInfo: {
      id: 'client-3',
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+1 (555) 456-7890'
    },
    requestInfo: {
      websiteType: 'personal_resume',
      features: [
        { name: 'Portfolio Gallery', selected: true, price: 150 },
        { name: 'Contact Form', selected: true, price: 100 }
      ],
      clientDetails: {
        additionalNotes: 'Software developer looking for clean, professional design'
      }
    }
  },
  {
    id: '4',
    projectRequestId: 'req-4',
    clientId: 'client-4',
    status: 'pending',
    originalQuote: {
      lineItems: [
        {
          id: '1',
          description: 'Landing Page',
          category: 'design',
          quantity: 1,
          unitPrice: 600,
          totalPrice: 600,
          isEditable: true,
          isCustom: false
        }
      ],
      subtotal: 600,
      taxRate: 0.13,
      taxAmount: 78,
      totalAmount: 678,
      initialPaymentPercentage: 50,
      initialPaymentAmount: 339,
      finalPaymentAmount: 339,
      estimatedTimeline: {
        estimatedStartDate: new Date(),
        estimatedCompletionDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        milestones: [
          {
            id: '1',
            title: 'Design & Development',
            description: 'Single page design and development',
            estimatedDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
            order: 1
          }
        ]
      },
      terms: 'Single landing page with call-to-action optimization.'
    },
    version: 1,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    urgencyLevel: 'overdue',
    clientFeedback: [],
    adminNotes: 'Simple landing page project.',
    clientInfo: {
      id: 'client-4',
      name: 'Lisa Rodriguez',
      email: 'lisa@startup.com',
      phone: '+1 (555) 321-0987'
    },
    requestInfo: {
      websiteType: 'landing_page',
      features: [
        { name: 'Lead Capture Form', selected: true, price: 150 }
      ],
      clientDetails: {
        company: 'TechStart Inc.',
        additionalNotes: 'Product launch landing page'
      }
    }
  }
];

// Mock workflow metrics
const mockMetrics: WorkflowMetrics = {
  averageResponseTime: 18.5, // hours
  pendingRequestCount: 2,
  conversionRate: 0.75,
  totalRevenue: 15420,
  monthlyStats: [
    {
      month: 'Dec 2024',
      quotesGenerated: 8,
      projectsConfirmed: 6,
      revenue: 12500,
      averageProjectValue: 2083
    },
    {
      month: 'Nov 2024',
      quotesGenerated: 12,
      projectsConfirmed: 9,
      revenue: 18750,
      averageProjectValue: 2083
    },
    {
      month: 'Oct 2024',
      quotesGenerated: 10,
      projectsConfirmed: 7,
      revenue: 14200,
      averageProjectValue: 2029
    }
  ]
};

export class MockQuoteService {
  // Simulate API delay
  private static delay(ms: number = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async getQuotes(params: QuoteSearchParams) {
    await this.delay();
    
    let filteredQuotes = [...mockQuotes];

    // Apply filters
    if (params.filters.status !== 'all') {
      filteredQuotes = filteredQuotes.filter(q => q.status === params.filters.status);
    }

    if (params.filters.client !== 'all') {
      filteredQuotes = filteredQuotes.filter(q => q.clientId === params.filters.client);
    }

    if (params.filters.urgency !== 'all') {
      filteredQuotes = filteredQuotes.filter(q => q.urgencyLevel === params.filters.urgency);
    }

    // Apply search
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredQuotes = filteredQuotes.filter(q => 
        q.clientInfo?.name.toLowerCase().includes(query) ||
        q.clientInfo?.email.toLowerCase().includes(query) ||
        q.adminNotes?.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filteredQuotes.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (params.sortBy) {
        case 'created_at':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updated_at':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'total_amount':
          aValue = (a.editedQuote || a.originalQuote).totalAmount;
          bValue = (b.editedQuote || b.originalQuote).totalAmount;
          break;
        case 'urgency':
          const urgencyOrder = { 'overdue': 3, 'urgent': 2, 'normal': 1 };
          aValue = urgencyOrder[a.urgencyLevel];
          bValue = urgencyOrder[b.urgencyLevel];
          break;
        default:
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
      }

      if (params.sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    // Apply pagination
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);

    return {
      quotes: paginatedQuotes,
      totalCount: filteredQuotes.length,
      totalPages: Math.ceil(filteredQuotes.length / params.limit)
    };
  }

  static async getQuote(id: string) {
    await this.delay();
    const quote = mockQuotes.find(q => q.id === id);
    if (!quote) {
      throw new Error('Quote not found');
    }
    return quote;
  }

  static async updateQuoteStatus(id: string, status: ProjectQuote['status'], adminNotes?: string) {
    await this.delay();
    const quote = mockQuotes.find(q => q.id === id);
    if (!quote) {
      throw new Error('Quote not found');
    }
    
    quote.status = status;
    quote.updatedAt = new Date();
    if (adminNotes) {
      quote.adminNotes = adminNotes;
    }
    if (status === 'confirmed') {
      quote.confirmedAt = new Date();
    }
    
    return quote;
  }

  static async getWorkflowMetrics() {
    await this.delay();
    return mockMetrics;
  }

  static subscribeToQuotes(_callback: (payload: any) => void) {
    // Mock subscription - in real implementation this would be Supabase real-time
    return {
      unsubscribe: () => {
        console.log('Unsubscribed from quotes');
      }
    };
  }
}

// Use mock service until real database is set up
export const QuoteService = MockQuoteService;