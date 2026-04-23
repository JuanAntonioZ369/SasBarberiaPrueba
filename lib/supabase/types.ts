export type Role = "admin" | "barbero";
export type TransactionType = "income" | "expense";
export type MembershipStatus = "active" | "expired" | "cancelled";
export type MembershipPlan = "monthly" | "quarterly" | "annual";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  barbershop_id: string | null;
  created_at: string;
}

export interface Barbershop {
  id: string;
  owner_id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Client {
  id: string;
  barbershop_id: string;
  full_name: string;
  phone: string | null;
  age: number | null;
  birthday: string | null;
  notes: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  barbershop_id: string;
  name: string;
  category: string;
  purchase_price: number;
  sale_price: number;
  stock: number;
  min_stock: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  barbershop_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  client_id: string | null;
  date: string;
  created_by: string;
  created_at: string;
}

export interface Membership {
  id: string;
  barbershop_id: string;
  client_id: string;
  plan: MembershipPlan;
  price: number;
  start_date: string;
  end_date: string;
  status: MembershipStatus;
  created_at: string;
  client?: Client;
}

export interface DemoUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  barbershop_id: string;
}
