export type Json =
  | boolean
  | null
  | number
  | string
  | { [key: string]: Json | undefined }
  | Json[];

export type TenantTheme =
  | "classico"
  | "natural"
  | "tech"
  | "delivery"
  | "elegante"
  | "minimal";

export type TenantStatus = "ativo" | "inadimplente" | "cancelado";
export type SubscriptionStatus = "ativo" | "atrasado" | "cancelado";
export type SignupIntentStatus = "pendente" | "pago" | "expirado" | "cancelado";

export type Database = {
  public: {
    Tables: {
      api_rate_limits: {
        Row: {
          key_hash: string;
          request_count: number;
          reset_at: string;
          updated_at: string;
        };
        Insert: {
          key_hash: string;
          request_count?: number;
          reset_at: string;
          updated_at?: string;
        };
        Update: {
          key_hash?: string;
          request_count?: number;
          reset_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      asaas_webhook_events: {
        Row: {
          attempts: number;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at: string | null;
          processing_error: string | null;
          received_at: string;
        };
        Insert: {
          attempts?: number;
          event_id: string;
          event_type: string;
          payload: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          received_at?: string;
        };
        Update: {
          attempts?: number;
          event_id?: string;
          event_type?: string;
          payload?: Json;
          processed_at?: string | null;
          processing_error?: string | null;
          received_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          nome: string;
          ordem: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          nome: string;
          ordem?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          nome?: string;
          ordem?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          ativo: boolean;
          category_id: string;
          created_at: string;
          descricao: string | null;
          id: string;
          imagem_url: string | null;
          nome: string;
          ordem: number;
          preco: number;
          tenant_id: string;
          updated_at: string;
          variacao_info: string | null;
        };
        Insert: {
          ativo?: boolean;
          category_id: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          imagem_url?: string | null;
          nome: string;
          ordem?: number;
          preco: number;
          tenant_id: string;
          updated_at?: string;
          variacao_info?: string | null;
        };
        Update: {
          ativo?: boolean;
          category_id?: string;
          created_at?: string;
          descricao?: string | null;
          id?: string;
          imagem_url?: string | null;
          nome?: string;
          ordem?: number;
          preco?: number;
          tenant_id?: string;
          updated_at?: string;
          variacao_info?: string | null;
        };
        Relationships: [];
      };
      signup_intents: {
        Row: {
          asaas_checkout_id: string | null;
          asaas_customer_id: string | null;
          asaas_subscription_id: string | null;
          created_at: string;
          email: string;
          expires_at: string;
          external_reference: string;
          id: string;
          nome_loja: string;
          privacy_accepted_at: string;
          provisioned_tenant_id: string | null;
          slug: string;
          status: SignupIntentStatus;
          tema: TenantTheme;
          terms_accepted_at: string;
          updated_at: string;
          whatsapp: string;
        };
        Insert: {
          asaas_checkout_id?: string | null;
          asaas_customer_id?: string | null;
          asaas_subscription_id?: string | null;
          created_at?: string;
          email: string;
          expires_at?: string;
          external_reference?: string;
          id?: string;
          nome_loja: string;
          privacy_accepted_at: string;
          provisioned_tenant_id?: string | null;
          slug: string;
          status?: SignupIntentStatus;
          tema?: TenantTheme;
          terms_accepted_at: string;
          updated_at?: string;
          whatsapp: string;
        };
        Update: {
          asaas_checkout_id?: string | null;
          asaas_customer_id?: string | null;
          asaas_subscription_id?: string | null;
          created_at?: string;
          email?: string;
          expires_at?: string;
          external_reference?: string;
          id?: string;
          nome_loja?: string;
          privacy_accepted_at?: string;
          provisioned_tenant_id?: string | null;
          slug?: string;
          status?: SignupIntentStatus;
          tema?: TenantTheme;
          terms_accepted_at?: string;
          updated_at?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          asaas_customer_id: string | null;
          asaas_subscription_id: string | null;
          created_at: string;
          id: string;
          next_due_date: string | null;
          portal_url: string | null;
          status: SubscriptionStatus;
          tenant_id: string;
          updated_at: string;
          valor: number;
        };
        Insert: {
          asaas_customer_id?: string | null;
          asaas_subscription_id?: string | null;
          created_at?: string;
          id?: string;
          next_due_date?: string | null;
          portal_url?: string | null;
          status?: SubscriptionStatus;
          tenant_id: string;
          updated_at?: string;
          valor?: number;
        };
        Update: {
          asaas_customer_id?: string | null;
          asaas_subscription_id?: string | null;
          created_at?: string;
          id?: string;
          next_due_date?: string | null;
          portal_url?: string | null;
          status?: SubscriptionStatus;
          tenant_id?: string;
          updated_at?: string;
          valor?: number;
        };
        Relationships: [];
      };
      tenants: {
        Row: {
          banner_url: string | null;
          created_at: string;
          descricao_curta: string | null;
          endereco: string | null;
          id: string;
          instagram: string | null;
          logo_url: string | null;
          nome_loja: string;
          owner_user_id: string;
          slug: string;
          status: TenantStatus;
          tema: TenantTheme;
          updated_at: string;
          whatsapp: string;
        };
        Insert: {
          banner_url?: string | null;
          created_at?: string;
          descricao_curta?: string | null;
          endereco?: string | null;
          id?: string;
          instagram?: string | null;
          logo_url?: string | null;
          nome_loja: string;
          owner_user_id: string;
          slug: string;
          status?: TenantStatus;
          tema?: TenantTheme;
          updated_at?: string;
          whatsapp: string;
        };
        Update: {
          banner_url?: string | null;
          created_at?: string;
          descricao_curta?: string | null;
          endereco?: string | null;
          id?: string;
          instagram?: string | null;
          logo_url?: string | null;
          nome_loja?: string;
          owner_user_id?: string;
          slug?: string;
          status?: TenantStatus;
          tema?: TenantTheme;
          updated_at?: string;
          whatsapp?: string;
        };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      consume_api_rate_limit: {
        Args: { p_key_hash: string; p_limit: number; p_window_seconds: number };
        Returns: { allowed: boolean; remaining: number; reset_at: string; retry_after: number }[];
      };
      email_has_tenant: {
        Args: { p_email: string };
        Returns: boolean;
      };
      expire_stale_signup_intents: {
        Args: Record<PropertyKey, never>;
        Returns: number;
      };
      get_public_catalog: {
        Args: { p_slug: string };
        Returns: Json;
      };
      get_public_store_status: {
        Args: { p_slug: string };
        Returns: string | null;
      };
      reorder_categories: {
        Args: { p_ids: string[]; p_tenant_id: string };
        Returns: number;
      };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
