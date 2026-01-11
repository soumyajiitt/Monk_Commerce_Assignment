export interface Variant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  sku?: string;
  inventory_quantity?: number;
  option1?: string;
  option2?: string;
  option3?: string;
  created_at?: string;
  updated_at?: string;
  taxable?: boolean;
  barcode?: string;
  grams?: number;
  image_id?: number;
  weight?: number;
  weight_unit?: string;
  inventory_item_id?: number;
  old_inventory_quantity?: number;
  requires_shipping?: boolean;
  admin_graphql_api_id?: string;
}

export interface Image {
  id: number;
  product_id: number;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  admin_graphql_api_id?: string;
}

export interface Product {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  handle: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: Variant[];
  options: {
    id: number;
    product_id: number;
    name: string;
    position: number;
    values: string[];
  }[];
  images: Image[];
  image: Image | null;
}

export interface Discount {
  value: number;
  type: 'flat' | 'percentage';
}

export interface SelectedProduct extends Omit<Product, 'variants'> {
  showVariants: boolean;
  discount?: Discount;
  variants: Array<Variant & { discount?: Discount }>;
}
