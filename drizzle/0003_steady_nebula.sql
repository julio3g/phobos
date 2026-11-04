ALTER TYPE "public"."margin_type" ADD VALUE 'margin' BEFORE 'fixed';--> statement-breakpoint
CREATE TABLE "product_materials" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"material_id" text NOT NULL,
	"quantity" numeric(14, 3) NOT NULL,
	"unit_cost" numeric(18, 6) NOT NULL,
	"total_cost" numeric(12, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "products" DROP CONSTRAINT "products_margin_percent_range";--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "currency" text DEFAULT 'BRL' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "default_hourly_rate" numeric(12, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "hourly_rate" numeric(12, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_material_id_materials_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materials"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_materials_unique" ON "product_materials" USING btree ("product_id","material_id");--> statement-breakpoint
CREATE INDEX "product_materials_material_idx" ON "product_materials" USING btree ("material_id");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_margin_percent_range" CHECK ("products"."margin_type"::text <> 'margin' or "products"."margin_value" < 100);