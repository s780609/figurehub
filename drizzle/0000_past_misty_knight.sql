CREATE TYPE "public"."box_condition" AS ENUM('佳', '普通', '差', '無盒');--> statement-breakpoint
CREATE TYPE "public"."figure_condition" AS ENUM('全新未拆', '拆擺');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."sale_method" AS ENUM('出售', '競標');--> statement-breakpoint
CREATE TYPE "public"."shipping_method" AS ENUM('賣貨便', '郵寄', '黑貓');--> statement-breakpoint
CREATE TABLE "figure_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"figure_id" uuid NOT NULL,
	"type" "media_type" NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "figures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"condition" "figure_condition" NOT NULL,
	"box_condition" "box_condition" NOT NULL,
	"shipping_method" "shipping_method" NOT NULL,
	"sale_method" "sale_method" DEFAULT '出售' NOT NULL,
	"sold" boolean DEFAULT false NOT NULL,
	"description" text,
	"drive_folder_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "figure_media" ADD CONSTRAINT "figure_media_figure_id_figures_id_fk" FOREIGN KEY ("figure_id") REFERENCES "public"."figures"("id") ON DELETE cascade ON UPDATE no action;