import { Cashfree } from '@cashfreepayments/cashfree-sdk';

declare module 'cashfree-pg' {
  interface VendorBankDetails {
    account_holder_name: string;
    account_number: string;
    ifsc: string;
    bank_name: string;
  }

  interface SplitInfo {
    vendor_id: string;
    percentage: number;
    vendor_bank: VendorBankDetails;
  }

  namespace Cashfree {
    interface CreateOrderRequest {
      order_id: string;
      order_amount: number;
      order_currency: string;
      customer_details: {
        customer_id: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
      };
      order_meta?: {
        return_url?: string;
        notify_url?: string;
      };
      order_tags?: {
        [key: string]: string;
      };
      order_note?: string;
      order_splits?: {
        vendor_id: string;
        percentage?: number;
        amount?: number;
      }[];
    }
  }
}