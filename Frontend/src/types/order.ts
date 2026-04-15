export type Order = {
  id?: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  region: string;
  city: string;
  address: string;
  postal_code?: string;
  notes?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image_url: string;
  }[];
  shipping_fee: number;
  total: number;
  status: 'new' | 'in_progress' | 'completed';
  created_at?: string;
  updated_at?: string;
}; 