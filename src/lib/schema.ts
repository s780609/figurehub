import {
  pgTable,
  uuid,
  varchar,
  integer,
  text,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

export const conditionEnum = pgEnum("figure_condition", [
  "全新未拆",
  "拆擺",
]);

export const boxConditionEnum = pgEnum("box_condition", [
  "佳",
  "普通",
  "差",
  "無盒",
]);

export const shippingMethodEnum = pgEnum("shipping_method", [
  "賣貨便",
  "郵寄",
  "黑貓",
]);

export const saleMethodEnum = pgEnum("sale_method", ["出售", "競標"]);

export const soldStatusEnum = pgEnum("sold_status", ["未售出", "準備中", "已售出"]);

export const mediaTypeEnum = pgEnum("media_type", ["image", "video"]);

export const figures = pgTable("figures", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: integer("price").notNull(),
  condition: conditionEnum("condition").notNull(),
  boxCondition: boxConditionEnum("box_condition").notNull(),
  shippingMethod: shippingMethodEnum("shipping_method").notNull(),
  saleMethod: saleMethodEnum("sale_method").default("出售").notNull(),
  bidEndTime: varchar("bid_end_time", { length: 100 }),
  soldStatus: soldStatusEnum("sold_status").default("未售出").notNull(),
  description: text("description"),
  driveFolderUrl: text("drive_folder_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const figureMedia = pgTable("figure_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  figureId: uuid("figure_id")
    .references(() => figures.id, { onDelete: "cascade" })
    .notNull(),
  type: mediaTypeEnum("type").notNull(),
  url: text("url").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});
