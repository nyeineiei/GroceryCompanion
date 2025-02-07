import { z } from "zod";
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "users";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        username: import("drizzle-orm/pg-core").PgColumn<{
            name: "username";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        password: import("drizzle-orm/pg-core").PgColumn<{
            name: "password";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        role: import("drizzle-orm/pg-core").PgColumn<{
            name: "role";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: "customer" | "shopper";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["customer", "shopper"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        phone: import("drizzle-orm/pg-core").PgColumn<{
            name: "phone";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        isAvailable: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_available";
            tableName: "users";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        rating: import("drizzle-orm/pg-core").PgColumn<{
            name: "rating";
            tableName: "users";
            dataType: "number";
            columnType: "PgReal";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type OrderItem = {
    name: string;
    price: number;
    purchased: boolean;
    quantity: number;
};
export declare const orders: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "orders";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "orders";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        customerId: import("drizzle-orm/pg-core").PgColumn<{
            name: "customer_id";
            tableName: "orders";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        shopperId: import("drizzle-orm/pg-core").PgColumn<{
            name: "shopper_id";
            tableName: "orders";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "orders";
            dataType: "string";
            columnType: "PgText";
            data: "pending" | "accepted" | "shopping" | "delivering" | "completed" | "paid";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["pending", "accepted", "shopping", "delivering", "completed", "paid"];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        items: import("drizzle-orm/pg-core").PgColumn<{
            name: "items";
            tableName: "orders";
            dataType: "json";
            columnType: "PgJsonb";
            data: OrderItem[];
            driverParam: unknown;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: OrderItem[];
        }>;
        notes: import("drizzle-orm/pg-core").PgColumn<{
            name: "notes";
            tableName: "orders";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        total: import("drizzle-orm/pg-core").PgColumn<{
            name: "total";
            tableName: "orders";
            dataType: "number";
            columnType: "PgReal";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        serviceFee: import("drizzle-orm/pg-core").PgColumn<{
            name: "service_fee";
            tableName: "orders";
            dataType: "number";
            columnType: "PgReal";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        isPaid: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_paid";
            tableName: "orders";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "orders";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        shopperLocation: import("drizzle-orm/pg-core").PgColumn<{
            name: "shopper_location";
            tableName: "orders";
            dataType: "json";
            columnType: "PgJsonb";
            data: {
                latitude: number;
                longitude: number;
                timestamp: string;
            };
            driverParam: unknown;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {
            $type: {
                latitude: number;
                longitude: number;
                timestamp: string;
            };
        }>;
        estimatedDeliveryTime: import("drizzle-orm/pg-core").PgColumn<{
            name: "estimated_delivery_time";
            tableName: "orders";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const reviews: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "reviews";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "reviews";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        orderId: import("drizzle-orm/pg-core").PgColumn<{
            name: "order_id";
            tableName: "reviews";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        fromId: import("drizzle-orm/pg-core").PgColumn<{
            name: "from_id";
            tableName: "reviews";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        toId: import("drizzle-orm/pg-core").PgColumn<{
            name: "to_id";
            tableName: "reviews";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        rating: import("drizzle-orm/pg-core").PgColumn<{
            name: "rating";
            tableName: "reviews";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        comment: import("drizzle-orm/pg-core").PgColumn<{
            name: "comment";
            tableName: "reviews";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const orderItemSchema: z.ZodObject<{
    name: z.ZodString;
    price: z.ZodNumber;
    purchased: z.ZodBoolean;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    price: number;
    purchased: boolean;
    quantity: number;
}, {
    name: string;
    price: number;
    purchased: boolean;
    quantity: number;
}>;
export declare const insertUserSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodNumber>;
    username: z.ZodString;
    password: z.ZodString;
    role: z.ZodEnum<["customer", "shopper"]>;
    name: z.ZodString;
    phone: z.ZodString;
    isAvailable: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    rating: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "username" | "password" | "role" | "name" | "phone">, "strip", z.ZodTypeAny, {
    username: string;
    password: string;
    role: "customer" | "shopper";
    name: string;
    phone: string;
}, {
    username: string;
    password: string;
    role: "customer" | "shopper";
    name: string;
    phone: string;
}>;
export declare const insertOrderSchema: z.ZodObject<Pick<z.objectUtil.extendShape<{
    id: z.ZodOptional<z.ZodNumber>;
    customerId: z.ZodNumber;
    shopperId: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<["pending", "accepted", "shopping", "delivering", "completed", "paid"]>>;
    items: z.ZodOptional<z.ZodObject<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        purchased: z.ZodBoolean;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        price: number;
        purchased: boolean;
        quantity: number;
    }, {
        name: string;
        price: number;
        purchased: boolean;
        quantity: number;
    }>[], "strip", z.ZodTypeAny, {
        [x: number]: {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        };
        length: number;
        toString: () => string;
        toLocaleString: {
            (): string;
            (locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
        };
        pop: () => unknown;
        push: (...items: unknown[]) => number;
        concat: {
            (...items: ConcatArray<unknown>[]): unknown[];
            (...items: unknown[]): unknown[];
        };
        join: (separator?: string) => string;
        reverse: () => unknown[];
        shift: () => unknown;
        slice: (start?: number, end?: number) => unknown[];
        sort: (compareFn?: ((a: unknown, b: unknown) => number) | undefined) => z.objectUtil.addQuestionMarks<{
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }[], any>;
        splice: {
            (start: number, deleteCount?: number): unknown[];
            (start: number, deleteCount: number, ...items: unknown[]): unknown[];
        };
        unshift: (...items: unknown[]) => number;
        indexOf: (searchElement: unknown, fromIndex?: number) => number;
        lastIndexOf: (searchElement: unknown, fromIndex?: number) => number;
        every: {
            <S extends unknown>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): this is S[];
            (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): boolean;
        };
        some: (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any) => boolean;
        forEach: (callbackfn: (value: unknown, index: number, array: unknown[]) => void, thisArg?: any) => void;
        map: <U>(callbackfn: (value: unknown, index: number, array: unknown[]) => U, thisArg?: any) => U[];
        filter: {
            <S extends unknown>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): S[];
            (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): unknown[];
        };
        reduce: {
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown): unknown;
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown, initialValue: unknown): unknown;
            <U>(callbackfn: (previousValue: U, currentValue: unknown, currentIndex: number, array: unknown[]) => U, initialValue: U): U;
        };
        reduceRight: {
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown): unknown;
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown, initialValue: unknown): unknown;
            <U>(callbackfn: (previousValue: U, currentValue: unknown, currentIndex: number, array: unknown[]) => U, initialValue: U): U;
        };
        find: {
            <S extends unknown>(predicate: (value: unknown, index: number, obj: unknown[]) => value is S, thisArg?: any): S | undefined;
            (predicate: (value: unknown, index: number, obj: unknown[]) => unknown, thisArg?: any): unknown;
        };
        findIndex: (predicate: (value: unknown, index: number, obj: unknown[]) => unknown, thisArg?: any) => number;
        fill: (value: unknown, start?: number, end?: number) => z.objectUtil.addQuestionMarks<{
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }[], any>;
        copyWithin: (target: number, start: number, end?: number) => z.objectUtil.addQuestionMarks<{
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }[], any>;
        entries: () => ArrayIterator<[number, unknown]>;
        keys: () => ArrayIterator<number>;
        values: () => ArrayIterator<unknown>;
        includes: (searchElement: unknown, fromIndex?: number) => boolean;
        flatMap: <U, This = undefined>(callback: (this: This, value: unknown, index: number, array: unknown[]) => U | readonly U[], thisArg?: This | undefined) => U[];
        flat: <A, D extends number = 1>(this: A, depth?: D | undefined) => FlatArray<A, D>[];
        at: (index: number) => unknown;
        findLast: {
            <S extends unknown>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): S | undefined;
            (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): unknown;
        };
        findLastIndex: (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any) => number;
        toReversed: () => unknown[];
        toSorted: (compareFn?: ((a: unknown, b: unknown) => number) | undefined) => unknown[];
        toSpliced: {
            (start: number, deleteCount: number, ...items: unknown[]): unknown[];
            (start: number, deleteCount?: number): unknown[];
        };
        with: (index: number, value: unknown) => unknown[];
        [Symbol.iterator]: () => ArrayIterator<unknown>;
        readonly [Symbol.unscopables]: {
            [x: number]: boolean | undefined;
            length?: boolean | undefined;
            toString?: boolean | undefined;
            toLocaleString?: boolean | undefined;
            pop?: boolean | undefined;
            push?: boolean | undefined;
            concat?: boolean | undefined;
            join?: boolean | undefined;
            reverse?: boolean | undefined;
            shift?: boolean | undefined;
            slice?: boolean | undefined;
            sort?: boolean | undefined;
            splice?: boolean | undefined;
            unshift?: boolean | undefined;
            indexOf?: boolean | undefined;
            lastIndexOf?: boolean | undefined;
            every?: boolean | undefined;
            some?: boolean | undefined;
            forEach?: boolean | undefined;
            map?: boolean | undefined;
            filter?: boolean | undefined;
            reduce?: boolean | undefined;
            reduceRight?: boolean | undefined;
            find?: boolean | undefined;
            findIndex?: boolean | undefined;
            fill?: boolean | undefined;
            copyWithin?: boolean | undefined;
            entries?: boolean | undefined;
            keys?: boolean | undefined;
            values?: boolean | undefined;
            includes?: boolean | undefined;
            flatMap?: boolean | undefined;
            flat?: boolean | undefined;
            at?: boolean | undefined;
            findLast?: boolean | undefined;
            findLastIndex?: boolean | undefined;
            toReversed?: boolean | undefined;
            toSorted?: boolean | undefined;
            toSpliced?: boolean | undefined;
            with?: boolean | undefined;
            [Symbol.iterator]?: boolean | undefined;
            readonly [Symbol.unscopables]?: boolean | undefined;
        };
    }, {
        [x: number]: {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        };
        length: number;
        toString: () => string;
        toLocaleString: {
            (): string;
            (locales: string | string[], options?: Intl.NumberFormatOptions & Intl.DateTimeFormatOptions): string;
        };
        pop: () => unknown;
        push: (...items: unknown[]) => number;
        concat: {
            (...items: ConcatArray<unknown>[]): unknown[];
            (...items: unknown[]): unknown[];
        };
        join: (separator?: string) => string;
        reverse: () => unknown[];
        shift: () => unknown;
        slice: (start?: number, end?: number) => unknown[];
        sort: (compareFn?: ((a: unknown, b: unknown) => number) | undefined) => z.baseObjectInputType<z.ZodObject<{
            name: z.ZodString;
            price: z.ZodNumber;
            purchased: z.ZodBoolean;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }, {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }>[]>;
        splice: {
            (start: number, deleteCount?: number): unknown[];
            (start: number, deleteCount: number, ...items: unknown[]): unknown[];
        };
        unshift: (...items: unknown[]) => number;
        indexOf: (searchElement: unknown, fromIndex?: number) => number;
        lastIndexOf: (searchElement: unknown, fromIndex?: number) => number;
        every: {
            <S extends unknown>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): this is S[];
            (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): boolean;
        };
        some: (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any) => boolean;
        forEach: (callbackfn: (value: unknown, index: number, array: unknown[]) => void, thisArg?: any) => void;
        map: <U>(callbackfn: (value: unknown, index: number, array: unknown[]) => U, thisArg?: any) => U[];
        filter: {
            <S extends unknown>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): S[];
            (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): unknown[];
        };
        reduce: {
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown): unknown;
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown, initialValue: unknown): unknown;
            <U>(callbackfn: (previousValue: U, currentValue: unknown, currentIndex: number, array: unknown[]) => U, initialValue: U): U;
        };
        reduceRight: {
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown): unknown;
            (callbackfn: (previousValue: unknown, currentValue: unknown, currentIndex: number, array: unknown[]) => unknown, initialValue: unknown): unknown;
            <U>(callbackfn: (previousValue: U, currentValue: unknown, currentIndex: number, array: unknown[]) => U, initialValue: U): U;
        };
        find: {
            <S extends unknown>(predicate: (value: unknown, index: number, obj: unknown[]) => value is S, thisArg?: any): S | undefined;
            (predicate: (value: unknown, index: number, obj: unknown[]) => unknown, thisArg?: any): unknown;
        };
        findIndex: (predicate: (value: unknown, index: number, obj: unknown[]) => unknown, thisArg?: any) => number;
        fill: (value: unknown, start?: number, end?: number) => z.baseObjectInputType<z.ZodObject<{
            name: z.ZodString;
            price: z.ZodNumber;
            purchased: z.ZodBoolean;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }, {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }>[]>;
        copyWithin: (target: number, start: number, end?: number) => z.baseObjectInputType<z.ZodObject<{
            name: z.ZodString;
            price: z.ZodNumber;
            purchased: z.ZodBoolean;
            quantity: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }, {
            name: string;
            price: number;
            purchased: boolean;
            quantity: number;
        }>[]>;
        entries: () => ArrayIterator<[number, unknown]>;
        keys: () => ArrayIterator<number>;
        values: () => ArrayIterator<unknown>;
        includes: (searchElement: unknown, fromIndex?: number) => boolean;
        flatMap: <U, This = undefined>(callback: (this: This, value: unknown, index: number, array: unknown[]) => U | readonly U[], thisArg?: This | undefined) => U[];
        flat: <A, D extends number = 1>(this: A, depth?: D | undefined) => FlatArray<A, D>[];
        at: (index: number) => unknown;
        findLast: {
            <S extends unknown>(predicate: (value: unknown, index: number, array: unknown[]) => value is S, thisArg?: any): S | undefined;
            (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any): unknown;
        };
        findLastIndex: (predicate: (value: unknown, index: number, array: unknown[]) => unknown, thisArg?: any) => number;
        toReversed: () => unknown[];
        toSorted: (compareFn?: ((a: unknown, b: unknown) => number) | undefined) => unknown[];
        toSpliced: {
            (start: number, deleteCount: number, ...items: unknown[]): unknown[];
            (start: number, deleteCount?: number): unknown[];
        };
        with: (index: number, value: unknown) => unknown[];
        [Symbol.iterator]: () => ArrayIterator<unknown>;
        readonly [Symbol.unscopables]: {
            [x: number]: boolean | undefined;
            length?: boolean | undefined;
            toString?: boolean | undefined;
            toLocaleString?: boolean | undefined;
            pop?: boolean | undefined;
            push?: boolean | undefined;
            concat?: boolean | undefined;
            join?: boolean | undefined;
            reverse?: boolean | undefined;
            shift?: boolean | undefined;
            slice?: boolean | undefined;
            sort?: boolean | undefined;
            splice?: boolean | undefined;
            unshift?: boolean | undefined;
            indexOf?: boolean | undefined;
            lastIndexOf?: boolean | undefined;
            every?: boolean | undefined;
            some?: boolean | undefined;
            forEach?: boolean | undefined;
            map?: boolean | undefined;
            filter?: boolean | undefined;
            reduce?: boolean | undefined;
            reduceRight?: boolean | undefined;
            find?: boolean | undefined;
            findIndex?: boolean | undefined;
            fill?: boolean | undefined;
            copyWithin?: boolean | undefined;
            entries?: boolean | undefined;
            keys?: boolean | undefined;
            values?: boolean | undefined;
            includes?: boolean | undefined;
            flatMap?: boolean | undefined;
            flat?: boolean | undefined;
            at?: boolean | undefined;
            findLast?: boolean | undefined;
            findLastIndex?: boolean | undefined;
            toReversed?: boolean | undefined;
            toSorted?: boolean | undefined;
            toSpliced?: boolean | undefined;
            with?: boolean | undefined;
            [Symbol.iterator]?: boolean | undefined;
            readonly [Symbol.unscopables]?: boolean | undefined;
        };
    }>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    total: z.ZodOptional<z.ZodNumber>;
    serviceFee: z.ZodOptional<z.ZodNumber>;
    isPaid: z.ZodOptional<z.ZodBoolean>;
    createdAt: z.ZodOptional<z.ZodDate>;
    shopperLocation: z.ZodOptional<z.ZodNullable<z.ZodObject<{
        latitude: z.ZodNumber;
        longitude: z.ZodNumber;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        latitude: number;
        longitude: number;
        timestamp: string;
    }, {
        latitude: number;
        longitude: number;
        timestamp: string;
    }>>>;
    estimatedDeliveryTime: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, {
    items: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        price: z.ZodNumber;
        purchased: z.ZodBoolean;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        name: string;
        price: number;
        purchased: boolean;
        quantity: number;
    }, {
        name: string;
        price: number;
        purchased: boolean;
        quantity: number;
    }>, "many">;
}>, "items" | "notes">, "strip", z.ZodTypeAny, {
    items: {
        name: string;
        price: number;
        purchased: boolean;
        quantity: number;
    }[];
    notes?: string | null | undefined;
}, {
    items: {
        name: string;
        price: number;
        purchased: boolean;
        quantity: number;
    }[];
    notes?: string | null | undefined;
}>;
export declare const insertReviewSchema: z.ZodObject<Pick<{
    id: z.ZodOptional<z.ZodNumber>;
    orderId: z.ZodNumber;
    fromId: z.ZodNumber;
    toId: z.ZodNumber;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "rating" | "comment">, "strip", z.ZodTypeAny, {
    rating: number;
    comment?: string | null | undefined;
}, {
    rating: number;
    comment?: string | null | undefined;
}>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type User = typeof users.$inferSelect;
export type Order = typeof orders.$inferSelect & {
    displayOrderNumber?: number;
};
export type Review = typeof reviews.$inferSelect;
