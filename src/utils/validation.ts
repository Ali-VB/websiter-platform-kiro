import type { OnboardingData } from '../components/onboarding';

export interface ValidationError {
  field: string;
  message: string;
}

export class DataValidator {
  // Validate onboarding data before saving
  static validateOnboardingData(data: OnboardingData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Validate website purpose
    if (!data.websitePurpose?.type) {
      errors.push({
        field: 'websitePurpose.type',
        message: 'Website type is required',
      });
    }

    if (!data.websitePurpose?.basePrice || data.websitePurpose.basePrice <= 0) {
      errors.push({
        field: 'websitePurpose.basePrice',
        message: 'Valid base price is required',
      });
    }

    // Validate contact info
    if (!data.contactInfo?.name?.trim()) {
      errors.push({
        field: 'contactInfo.name',
        message: 'Name is required',
      });
    }

    if (!data.contactInfo?.email?.trim()) {
      errors.push({
        field: 'contactInfo.email',
        message: 'Email is required',
      });
    } else if (!this.isValidEmail(data.contactInfo.email)) {
      errors.push({
        field: 'contactInfo.email',
        message: 'Valid email is required',
      });
    }

    // Validate total price
    if (!data.totalPrice || data.totalPrice <= 0) {
      errors.push({
        field: 'totalPrice',
        message: 'Valid total price is required',
      });
    }

    // Validate additional features
    if (data.additionalFeatures) {
      data.additionalFeatures.forEach((feature, index) => {
        if (!feature.name?.trim()) {
          errors.push({
            field: `additionalFeatures[${index}].name`,
            message: 'Feature name is required',
          });
        }
        if (!feature.price || feature.price < 0) {
          errors.push({
            field: `additionalFeatures[${index}].price`,
            message: 'Valid feature price is required',
          });
        }
      });
    }

    return errors;
  }

  // Validate email format
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Sanitize string input
  static sanitizeString(input: string | undefined): string {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
  }

  // Validate and sanitize phone number
  static sanitizePhone(phone: string | undefined): string | undefined {
    if (!phone) return undefined;
    
    // Remove all non-digit characters except + and spaces
    const cleaned = phone.replace(/[^\d+\s()-]/g, '');
    return cleaned.trim() || undefined;
  }

  // Calculate total price from onboarding data
  static calculateTotalPrice(data: OnboardingData): number {
    let total = data.websitePurpose?.basePrice || 0;

    // Add additional features
    if (data.additionalFeatures) {
      total += data.additionalFeatures.reduce((sum, feature) => sum + (feature.price || 0), 0);
    }

    // Add hosting costs
    if (data.hosting?.monthlyPrice) {
      total += data.hosting.monthlyPrice * 12; // Annual hosting cost
    }

    // Add maintenance costs
    if (data.maintenance?.monthlyPrice) {
      total += data.maintenance.monthlyPrice * 12; // Annual maintenance cost
    }

    // Add rush fee if applicable
    if (data.timeline?.rushFee) {
      total += data.timeline.rushFee;
    }

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }
}