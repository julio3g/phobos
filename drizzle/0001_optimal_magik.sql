CREATE TYPE "public"."margin_type" AS ENUM('percent', 'fixed');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('draft', 'confirmed', 'in_production', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'partial', 'paid', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."person_type" AS ENUM('individual', 'company');--> statement-breakpoint
CREATE TYPE "public"."unit" AS ENUM('un', 'm', 'g', 'kg', 'ml', 'pair');--> statement-breakpoint
CREATE TABLE "clients" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"trade_name" text,
	"contact_name" text,
	"email" text,
	"phone" text,
	"person_type" "person_type",
	"cpf" text,
	"cnpj" text,
	"state_registration" text,
	"street" text,
	"neighborhood" text,
	"address_number" integer,
	"complement" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "clients_person_doc_check" CHECK (
        ("clients"."person_type" = 'individual' AND "clients"."cpf" IS NOT NULL AND "clients"."cnpj" IS NULL)
        OR
        ("clients"."person_type" = 'company' AND "clients"."cnpj" IS NOT NULL AND "clients"."cpf" IS NULL)
      )
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"variant" text,
	"image_url" text,
	"purchase_url" text,
	"unit" "unit" NOT NULL,
	"package_price" numeric(12, 2) NOT NULL,
	"package_quantity" numeric(14, 3) NOT NULL,
	"unit_cost" numeric(18, 6) GENERATED ALWAYS AS (package_price / package_quantity) STORED NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "materials_package_quantity_positive" CHECK ("materials"."package_quantity" > 0),
	CONSTRAINT "materials_package_price_nonnegative" CHECK ("materials"."package_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"product_id" text NOT NULL,
	"quantity" numeric NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"unit_cost" numeric(12, 2) NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"number" integer NOT NULL,
	"status" "order_status" DEFAULT 'draft' NOT NULL,
	"client_id" text NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"shipping" numeric(12, 2) DEFAULT 0 NOT NULL,
	"cost_total" numeric(12, 2) DEFAULT 0 NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"notes" varchar(150),
	"total" numeric(12, 2) GENERATED ALWAYS AS (subtotal - discount + shipping) STORED NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"variant" text,
	"image_url" text,
	"description" text,
	"value" numeric(12, 2),
	"labor_minutes" integer DEFAULT 0 NOT NULL,
	"margin_type" "margin_type" DEFAULT 'percent' NOT NULL,
	"margin_value" numeric(12, 2) NOT NULL,
	"material_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"labor_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_cost" numeric(12, 2) GENERATED ALWAYS AS (material_cost + labor_cost) STORED NOT NULL,
	"sale_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"archived_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp,
	CONSTRAINT "products_labor_minutes_nonnegative" CHECK ("products"."labor_minutes" >= 0),
	CONSTRAINT "products_margin_nonnegative" CHECK ("products"."margin_value" >= 0),
	CONSTRAINT "products_margin_percent_range" CHECK ("products"."margin_type" <> 'percent' or "products"."margin_value" < 100)
);
--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_organization_id_orders_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "clients_cpf_uniq" ON "clients" USING btree ("cpf");--> statement-breakpoint
CREATE UNIQUE INDEX "clients_cnpj_uniq" ON "clients" USING btree ("cnpj");--> statement-breakpoint
CREATE UNIQUE INDEX "materials_identity_unique" ON "materials" USING btree ("organization_id",lower("name"),lower(coalesce("brand", '')),lower(coalesce("variant", '')));--> statement-breakpoint
CREATE INDEX "materials_org_idx" ON "materials" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_identity_unique" ON "products" USING btree ("organization_id",lower("name"),lower(coalesce("variant", '')));