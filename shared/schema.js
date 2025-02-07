"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertReviewSchema = exports.insertOrderSchema = exports.insertUserSchema = exports.orderItemSchema = exports.reviews = exports.orders = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    role: (0, pg_core_1.text)("role", { enum: ["customer", "shopper"] }).notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    isAvailable: (0, pg_core_1.boolean)("is_available").default(false),
    rating: (0, pg_core_1.real)("rating").default(5.0),
});
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    customerId: (0, pg_core_1.integer)("customer_id").references(() => exports.users.id).notNull(),
    shopperId: (0, pg_core_1.integer)("shopper_id").references(() => exports.users.id),
    status: (0, pg_core_1.text)("status", {
        enum: ["pending", "accepted", "shopping", "delivering", "completed", "paid"]
    }).notNull().default("pending"),
    items: (0, pg_core_1.jsonb)("items").$type().notNull().default([]),
    notes: (0, pg_core_1.text)("notes"),
    total: (0, pg_core_1.real)("total").notNull().default(0),
    serviceFee: (0, pg_core_1.real)("service_fee").notNull().default(5.00),
    isPaid: (0, pg_core_1.boolean)("is_paid").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").notNull().defaultNow(),
    shopperLocation: (0, pg_core_1.jsonb)("shopper_location").$type(),
    estimatedDeliveryTime: (0, pg_core_1.timestamp)("estimated_delivery_time"),
});
exports.reviews = (0, pg_core_1.pgTable)("reviews", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    orderId: (0, pg_core_1.integer)("order_id").references(() => exports.orders.id).notNull(),
    fromId: (0, pg_core_1.integer)("from_id").references(() => exports.users.id).notNull(),
    toId: (0, pg_core_1.integer)("to_id").references(() => exports.users.id).notNull(),
    rating: (0, pg_core_1.integer)("rating").notNull(),
    comment: (0, pg_core_1.text)("comment"),
});
exports.orderItemSchema = zod_1.z.object({
    name: zod_1.z.string(),
    price: zod_1.z.number().min(0),
    purchased: zod_1.z.boolean(),
    quantity: zod_1.z.number().int().min(1),
});
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users).pick({
    username: true,
    password: true,
    role: true,
    name: true,
    phone: true,
});
exports.insertOrderSchema = (0, drizzle_zod_1.createInsertSchema)(exports.orders)
    .extend({
    items: zod_1.z.array(exports.orderItemSchema),
})
    .pick({
    items: true,
    notes: true,
});
exports.insertReviewSchema = (0, drizzle_zod_1.createInsertSchema)(exports.reviews).pick({
    rating: true,
    comment: true,
});
