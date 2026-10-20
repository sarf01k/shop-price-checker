// Integration contract. The frontend only talks to a backend through these two interfaces.
// services/api/* implements them against Supabase (products table, product-images bucket, Supabase Auth).

export type WeightUnit = "g" | "kg" | "ml" | "l" | "pieces";

export type Product = {
  id: string;
  name: string;
  size?: number; // e.g. '240', '1.5', '500'
  unit?: WeightUnit; // e.g. 'g', 'kg', 'ml', 'l', 'pieces'
  price: number | null; // 2 d.p. (e.g. 25.00 [null if unpriced])
  image_url: string; // absolute URL or ''
  created_at?: string; // ISO
  updated_at?: string; // ISO
};

export type NewProduct = Omit<Product, "id" | "created_at" | "updated_at">;

export interface ProductsApi {
  list(): Promise<Product[]>; // public, sorted by name
  create(p: NewProduct): Promise<Product>; // owner only
  update(id: string, p: NewProduct): Promise<Product>; // owner only; replaces all editable fields
  updatePrice(id: string, price: number): Promise<Product>; // owner only
  remove(id: string): Promise<void>; // owner only
  uploadImage(file: File): Promise<string>; // owner only -> returns image URL
  deleteImage(url: string): Promise<void>; // owner only; best effort, never throws
}

export type Session = { email: string };

export interface AuthApi {
  getSession(): Promise<Session | null>;
  signIn(email: string, password: string): Promise<Session>; // throws ApiError('INVALID_CREDENTIALS')
  signOut(): Promise<void>;
  onChange?(cb: (session: Session | null) => void): () => void; // optional; returns unsubscribe
}

export class ApiError extends Error {
  code:
    | "INVALID_CREDENTIALS"
    | "NETWORK"
    | "FORBIDDEN"
    | "VALIDATION"
    | "UNKNOWN";
}
