declare module "@cashfreepayments/cashfree-sdk" {
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
      split_info?: Array<{
        vendor_id: string;
        percentage: number;
        vendor_bank: {
          account_holder_name: string;
          account_number: string;
          ifsc: string;
          bank_name: string;
        };
      }>;
    }
  }
}
