
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Waybill
 * 
 */
export type Waybill = $Result.DefaultSelection<Prisma.$WaybillPayload>
/**
 * Model MappingRule
 * 
 */
export type MappingRule = $Result.DefaultSelection<Prisma.$MappingRulePayload>

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Waybills
 * const waybills = await prisma.waybill.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Waybills
   * const waybills = await prisma.waybill.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.waybill`: Exposes CRUD operations for the **Waybill** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Waybills
    * const waybills = await prisma.waybill.findMany()
    * ```
    */
  get waybill(): Prisma.WaybillDelegate<ExtArgs>;

  /**
   * `prisma.mappingRule`: Exposes CRUD operations for the **MappingRule** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more MappingRules
    * const mappingRules = await prisma.mappingRule.findMany()
    * ```
    */
  get mappingRule(): Prisma.MappingRuleDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Waybill: 'Waybill',
    MappingRule: 'MappingRule'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "waybill" | "mappingRule"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Waybill: {
        payload: Prisma.$WaybillPayload<ExtArgs>
        fields: Prisma.WaybillFieldRefs
        operations: {
          findUnique: {
            args: Prisma.WaybillFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.WaybillFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>
          }
          findFirst: {
            args: Prisma.WaybillFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.WaybillFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>
          }
          findMany: {
            args: Prisma.WaybillFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>[]
          }
          create: {
            args: Prisma.WaybillCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>
          }
          createMany: {
            args: Prisma.WaybillCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.WaybillCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>[]
          }
          delete: {
            args: Prisma.WaybillDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>
          }
          update: {
            args: Prisma.WaybillUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>
          }
          deleteMany: {
            args: Prisma.WaybillDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.WaybillUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.WaybillUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$WaybillPayload>
          }
          aggregate: {
            args: Prisma.WaybillAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateWaybill>
          }
          groupBy: {
            args: Prisma.WaybillGroupByArgs<ExtArgs>
            result: $Utils.Optional<WaybillGroupByOutputType>[]
          }
          count: {
            args: Prisma.WaybillCountArgs<ExtArgs>
            result: $Utils.Optional<WaybillCountAggregateOutputType> | number
          }
        }
      }
      MappingRule: {
        payload: Prisma.$MappingRulePayload<ExtArgs>
        fields: Prisma.MappingRuleFieldRefs
        operations: {
          findUnique: {
            args: Prisma.MappingRuleFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.MappingRuleFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>
          }
          findFirst: {
            args: Prisma.MappingRuleFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.MappingRuleFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>
          }
          findMany: {
            args: Prisma.MappingRuleFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>[]
          }
          create: {
            args: Prisma.MappingRuleCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>
          }
          createMany: {
            args: Prisma.MappingRuleCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.MappingRuleCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>[]
          }
          delete: {
            args: Prisma.MappingRuleDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>
          }
          update: {
            args: Prisma.MappingRuleUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>
          }
          deleteMany: {
            args: Prisma.MappingRuleDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.MappingRuleUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.MappingRuleUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$MappingRulePayload>
          }
          aggregate: {
            args: Prisma.MappingRuleAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateMappingRule>
          }
          groupBy: {
            args: Prisma.MappingRuleGroupByArgs<ExtArgs>
            result: $Utils.Optional<MappingRuleGroupByOutputType>[]
          }
          count: {
            args: Prisma.MappingRuleCountArgs<ExtArgs>
            result: $Utils.Optional<MappingRuleCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model Waybill
   */

  export type AggregateWaybill = {
    _count: WaybillCountAggregateOutputType | null
    _avg: WaybillAvgAggregateOutputType | null
    _sum: WaybillSumAggregateOutputType | null
    _min: WaybillMinAggregateOutputType | null
    _max: WaybillMaxAggregateOutputType | null
  }

  export type WaybillAvgAggregateOutputType = {
    quantity: number | null
  }

  export type WaybillSumAggregateOutputType = {
    quantity: number | null
  }

  export type WaybillMinAggregateOutputType = {
    id: string | null
    externalCode: string | null
    receiverStore: string | null
    receiverName: string | null
    receiverPhone: string | null
    receiverAddress: string | null
    skuCode: string | null
    skuName: string | null
    quantity: number | null
    skuSpec: string | null
    remark: string | null
    batchId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WaybillMaxAggregateOutputType = {
    id: string | null
    externalCode: string | null
    receiverStore: string | null
    receiverName: string | null
    receiverPhone: string | null
    receiverAddress: string | null
    skuCode: string | null
    skuName: string | null
    quantity: number | null
    skuSpec: string | null
    remark: string | null
    batchId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type WaybillCountAggregateOutputType = {
    id: number
    externalCode: number
    receiverStore: number
    receiverName: number
    receiverPhone: number
    receiverAddress: number
    skuCode: number
    skuName: number
    quantity: number
    skuSpec: number
    remark: number
    batchId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type WaybillAvgAggregateInputType = {
    quantity?: true
  }

  export type WaybillSumAggregateInputType = {
    quantity?: true
  }

  export type WaybillMinAggregateInputType = {
    id?: true
    externalCode?: true
    receiverStore?: true
    receiverName?: true
    receiverPhone?: true
    receiverAddress?: true
    skuCode?: true
    skuName?: true
    quantity?: true
    skuSpec?: true
    remark?: true
    batchId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WaybillMaxAggregateInputType = {
    id?: true
    externalCode?: true
    receiverStore?: true
    receiverName?: true
    receiverPhone?: true
    receiverAddress?: true
    skuCode?: true
    skuName?: true
    quantity?: true
    skuSpec?: true
    remark?: true
    batchId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type WaybillCountAggregateInputType = {
    id?: true
    externalCode?: true
    receiverStore?: true
    receiverName?: true
    receiverPhone?: true
    receiverAddress?: true
    skuCode?: true
    skuName?: true
    quantity?: true
    skuSpec?: true
    remark?: true
    batchId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type WaybillAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Waybill to aggregate.
     */
    where?: WaybillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Waybills to fetch.
     */
    orderBy?: WaybillOrderByWithRelationInput | WaybillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: WaybillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Waybills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Waybills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Waybills
    **/
    _count?: true | WaybillCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: WaybillAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: WaybillSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: WaybillMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: WaybillMaxAggregateInputType
  }

  export type GetWaybillAggregateType<T extends WaybillAggregateArgs> = {
        [P in keyof T & keyof AggregateWaybill]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateWaybill[P]>
      : GetScalarType<T[P], AggregateWaybill[P]>
  }




  export type WaybillGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: WaybillWhereInput
    orderBy?: WaybillOrderByWithAggregationInput | WaybillOrderByWithAggregationInput[]
    by: WaybillScalarFieldEnum[] | WaybillScalarFieldEnum
    having?: WaybillScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: WaybillCountAggregateInputType | true
    _avg?: WaybillAvgAggregateInputType
    _sum?: WaybillSumAggregateInputType
    _min?: WaybillMinAggregateInputType
    _max?: WaybillMaxAggregateInputType
  }

  export type WaybillGroupByOutputType = {
    id: string
    externalCode: string | null
    receiverStore: string | null
    receiverName: string | null
    receiverPhone: string | null
    receiverAddress: string | null
    skuCode: string | null
    skuName: string | null
    quantity: number | null
    skuSpec: string | null
    remark: string | null
    batchId: string
    createdAt: Date
    updatedAt: Date
    _count: WaybillCountAggregateOutputType | null
    _avg: WaybillAvgAggregateOutputType | null
    _sum: WaybillSumAggregateOutputType | null
    _min: WaybillMinAggregateOutputType | null
    _max: WaybillMaxAggregateOutputType | null
  }

  type GetWaybillGroupByPayload<T extends WaybillGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<WaybillGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof WaybillGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], WaybillGroupByOutputType[P]>
            : GetScalarType<T[P], WaybillGroupByOutputType[P]>
        }
      >
    >


  export type WaybillSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    externalCode?: boolean
    receiverStore?: boolean
    receiverName?: boolean
    receiverPhone?: boolean
    receiverAddress?: boolean
    skuCode?: boolean
    skuName?: boolean
    quantity?: boolean
    skuSpec?: boolean
    remark?: boolean
    batchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["waybill"]>

  export type WaybillSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    externalCode?: boolean
    receiverStore?: boolean
    receiverName?: boolean
    receiverPhone?: boolean
    receiverAddress?: boolean
    skuCode?: boolean
    skuName?: boolean
    quantity?: boolean
    skuSpec?: boolean
    remark?: boolean
    batchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["waybill"]>

  export type WaybillSelectScalar = {
    id?: boolean
    externalCode?: boolean
    receiverStore?: boolean
    receiverName?: boolean
    receiverPhone?: boolean
    receiverAddress?: boolean
    skuCode?: boolean
    skuName?: boolean
    quantity?: boolean
    skuSpec?: boolean
    remark?: boolean
    batchId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $WaybillPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Waybill"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      externalCode: string | null
      receiverStore: string | null
      receiverName: string | null
      receiverPhone: string | null
      receiverAddress: string | null
      skuCode: string | null
      skuName: string | null
      quantity: number | null
      skuSpec: string | null
      remark: string | null
      batchId: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["waybill"]>
    composites: {}
  }

  type WaybillGetPayload<S extends boolean | null | undefined | WaybillDefaultArgs> = $Result.GetResult<Prisma.$WaybillPayload, S>

  type WaybillCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<WaybillFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: WaybillCountAggregateInputType | true
    }

  export interface WaybillDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Waybill'], meta: { name: 'Waybill' } }
    /**
     * Find zero or one Waybill that matches the filter.
     * @param {WaybillFindUniqueArgs} args - Arguments to find a Waybill
     * @example
     * // Get one Waybill
     * const waybill = await prisma.waybill.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends WaybillFindUniqueArgs>(args: SelectSubset<T, WaybillFindUniqueArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Waybill that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {WaybillFindUniqueOrThrowArgs} args - Arguments to find a Waybill
     * @example
     * // Get one Waybill
     * const waybill = await prisma.waybill.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends WaybillFindUniqueOrThrowArgs>(args: SelectSubset<T, WaybillFindUniqueOrThrowArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Waybill that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaybillFindFirstArgs} args - Arguments to find a Waybill
     * @example
     * // Get one Waybill
     * const waybill = await prisma.waybill.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends WaybillFindFirstArgs>(args?: SelectSubset<T, WaybillFindFirstArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Waybill that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaybillFindFirstOrThrowArgs} args - Arguments to find a Waybill
     * @example
     * // Get one Waybill
     * const waybill = await prisma.waybill.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends WaybillFindFirstOrThrowArgs>(args?: SelectSubset<T, WaybillFindFirstOrThrowArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Waybills that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaybillFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Waybills
     * const waybills = await prisma.waybill.findMany()
     * 
     * // Get first 10 Waybills
     * const waybills = await prisma.waybill.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const waybillWithIdOnly = await prisma.waybill.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends WaybillFindManyArgs>(args?: SelectSubset<T, WaybillFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Waybill.
     * @param {WaybillCreateArgs} args - Arguments to create a Waybill.
     * @example
     * // Create one Waybill
     * const Waybill = await prisma.waybill.create({
     *   data: {
     *     // ... data to create a Waybill
     *   }
     * })
     * 
     */
    create<T extends WaybillCreateArgs>(args: SelectSubset<T, WaybillCreateArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Waybills.
     * @param {WaybillCreateManyArgs} args - Arguments to create many Waybills.
     * @example
     * // Create many Waybills
     * const waybill = await prisma.waybill.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends WaybillCreateManyArgs>(args?: SelectSubset<T, WaybillCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Waybills and returns the data saved in the database.
     * @param {WaybillCreateManyAndReturnArgs} args - Arguments to create many Waybills.
     * @example
     * // Create many Waybills
     * const waybill = await prisma.waybill.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Waybills and only return the `id`
     * const waybillWithIdOnly = await prisma.waybill.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends WaybillCreateManyAndReturnArgs>(args?: SelectSubset<T, WaybillCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Waybill.
     * @param {WaybillDeleteArgs} args - Arguments to delete one Waybill.
     * @example
     * // Delete one Waybill
     * const Waybill = await prisma.waybill.delete({
     *   where: {
     *     // ... filter to delete one Waybill
     *   }
     * })
     * 
     */
    delete<T extends WaybillDeleteArgs>(args: SelectSubset<T, WaybillDeleteArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Waybill.
     * @param {WaybillUpdateArgs} args - Arguments to update one Waybill.
     * @example
     * // Update one Waybill
     * const waybill = await prisma.waybill.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends WaybillUpdateArgs>(args: SelectSubset<T, WaybillUpdateArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Waybills.
     * @param {WaybillDeleteManyArgs} args - Arguments to filter Waybills to delete.
     * @example
     * // Delete a few Waybills
     * const { count } = await prisma.waybill.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends WaybillDeleteManyArgs>(args?: SelectSubset<T, WaybillDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Waybills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaybillUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Waybills
     * const waybill = await prisma.waybill.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends WaybillUpdateManyArgs>(args: SelectSubset<T, WaybillUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Waybill.
     * @param {WaybillUpsertArgs} args - Arguments to update or create a Waybill.
     * @example
     * // Update or create a Waybill
     * const waybill = await prisma.waybill.upsert({
     *   create: {
     *     // ... data to create a Waybill
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Waybill we want to update
     *   }
     * })
     */
    upsert<T extends WaybillUpsertArgs>(args: SelectSubset<T, WaybillUpsertArgs<ExtArgs>>): Prisma__WaybillClient<$Result.GetResult<Prisma.$WaybillPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Waybills.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaybillCountArgs} args - Arguments to filter Waybills to count.
     * @example
     * // Count the number of Waybills
     * const count = await prisma.waybill.count({
     *   where: {
     *     // ... the filter for the Waybills we want to count
     *   }
     * })
    **/
    count<T extends WaybillCountArgs>(
      args?: Subset<T, WaybillCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], WaybillCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Waybill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaybillAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends WaybillAggregateArgs>(args: Subset<T, WaybillAggregateArgs>): Prisma.PrismaPromise<GetWaybillAggregateType<T>>

    /**
     * Group by Waybill.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {WaybillGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends WaybillGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: WaybillGroupByArgs['orderBy'] }
        : { orderBy?: WaybillGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, WaybillGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWaybillGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Waybill model
   */
  readonly fields: WaybillFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Waybill.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__WaybillClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Waybill model
   */ 
  interface WaybillFieldRefs {
    readonly id: FieldRef<"Waybill", 'String'>
    readonly externalCode: FieldRef<"Waybill", 'String'>
    readonly receiverStore: FieldRef<"Waybill", 'String'>
    readonly receiverName: FieldRef<"Waybill", 'String'>
    readonly receiverPhone: FieldRef<"Waybill", 'String'>
    readonly receiverAddress: FieldRef<"Waybill", 'String'>
    readonly skuCode: FieldRef<"Waybill", 'String'>
    readonly skuName: FieldRef<"Waybill", 'String'>
    readonly quantity: FieldRef<"Waybill", 'Int'>
    readonly skuSpec: FieldRef<"Waybill", 'String'>
    readonly remark: FieldRef<"Waybill", 'String'>
    readonly batchId: FieldRef<"Waybill", 'String'>
    readonly createdAt: FieldRef<"Waybill", 'DateTime'>
    readonly updatedAt: FieldRef<"Waybill", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Waybill findUnique
   */
  export type WaybillFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * Filter, which Waybill to fetch.
     */
    where: WaybillWhereUniqueInput
  }

  /**
   * Waybill findUniqueOrThrow
   */
  export type WaybillFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * Filter, which Waybill to fetch.
     */
    where: WaybillWhereUniqueInput
  }

  /**
   * Waybill findFirst
   */
  export type WaybillFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * Filter, which Waybill to fetch.
     */
    where?: WaybillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Waybills to fetch.
     */
    orderBy?: WaybillOrderByWithRelationInput | WaybillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Waybills.
     */
    cursor?: WaybillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Waybills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Waybills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Waybills.
     */
    distinct?: WaybillScalarFieldEnum | WaybillScalarFieldEnum[]
  }

  /**
   * Waybill findFirstOrThrow
   */
  export type WaybillFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * Filter, which Waybill to fetch.
     */
    where?: WaybillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Waybills to fetch.
     */
    orderBy?: WaybillOrderByWithRelationInput | WaybillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Waybills.
     */
    cursor?: WaybillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Waybills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Waybills.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Waybills.
     */
    distinct?: WaybillScalarFieldEnum | WaybillScalarFieldEnum[]
  }

  /**
   * Waybill findMany
   */
  export type WaybillFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * Filter, which Waybills to fetch.
     */
    where?: WaybillWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Waybills to fetch.
     */
    orderBy?: WaybillOrderByWithRelationInput | WaybillOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Waybills.
     */
    cursor?: WaybillWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Waybills from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Waybills.
     */
    skip?: number
    distinct?: WaybillScalarFieldEnum | WaybillScalarFieldEnum[]
  }

  /**
   * Waybill create
   */
  export type WaybillCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * The data needed to create a Waybill.
     */
    data: XOR<WaybillCreateInput, WaybillUncheckedCreateInput>
  }

  /**
   * Waybill createMany
   */
  export type WaybillCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Waybills.
     */
    data: WaybillCreateManyInput | WaybillCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Waybill createManyAndReturn
   */
  export type WaybillCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Waybills.
     */
    data: WaybillCreateManyInput | WaybillCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Waybill update
   */
  export type WaybillUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * The data needed to update a Waybill.
     */
    data: XOR<WaybillUpdateInput, WaybillUncheckedUpdateInput>
    /**
     * Choose, which Waybill to update.
     */
    where: WaybillWhereUniqueInput
  }

  /**
   * Waybill updateMany
   */
  export type WaybillUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Waybills.
     */
    data: XOR<WaybillUpdateManyMutationInput, WaybillUncheckedUpdateManyInput>
    /**
     * Filter which Waybills to update
     */
    where?: WaybillWhereInput
  }

  /**
   * Waybill upsert
   */
  export type WaybillUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * The filter to search for the Waybill to update in case it exists.
     */
    where: WaybillWhereUniqueInput
    /**
     * In case the Waybill found by the `where` argument doesn't exist, create a new Waybill with this data.
     */
    create: XOR<WaybillCreateInput, WaybillUncheckedCreateInput>
    /**
     * In case the Waybill was found with the provided `where` argument, update it with this data.
     */
    update: XOR<WaybillUpdateInput, WaybillUncheckedUpdateInput>
  }

  /**
   * Waybill delete
   */
  export type WaybillDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
    /**
     * Filter which Waybill to delete.
     */
    where: WaybillWhereUniqueInput
  }

  /**
   * Waybill deleteMany
   */
  export type WaybillDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Waybills to delete
     */
    where?: WaybillWhereInput
  }

  /**
   * Waybill without action
   */
  export type WaybillDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Waybill
     */
    select?: WaybillSelect<ExtArgs> | null
  }


  /**
   * Model MappingRule
   */

  export type AggregateMappingRule = {
    _count: MappingRuleCountAggregateOutputType | null
    _min: MappingRuleMinAggregateOutputType | null
    _max: MappingRuleMaxAggregateOutputType | null
  }

  export type MappingRuleMinAggregateOutputType = {
    id: string | null
    fingerprint: string | null
    mappings: string | null
    templateName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MappingRuleMaxAggregateOutputType = {
    id: string | null
    fingerprint: string | null
    mappings: string | null
    templateName: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type MappingRuleCountAggregateOutputType = {
    id: number
    fingerprint: number
    mappings: number
    templateName: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type MappingRuleMinAggregateInputType = {
    id?: true
    fingerprint?: true
    mappings?: true
    templateName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MappingRuleMaxAggregateInputType = {
    id?: true
    fingerprint?: true
    mappings?: true
    templateName?: true
    createdAt?: true
    updatedAt?: true
  }

  export type MappingRuleCountAggregateInputType = {
    id?: true
    fingerprint?: true
    mappings?: true
    templateName?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type MappingRuleAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MappingRule to aggregate.
     */
    where?: MappingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MappingRules to fetch.
     */
    orderBy?: MappingRuleOrderByWithRelationInput | MappingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: MappingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MappingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MappingRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned MappingRules
    **/
    _count?: true | MappingRuleCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: MappingRuleMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: MappingRuleMaxAggregateInputType
  }

  export type GetMappingRuleAggregateType<T extends MappingRuleAggregateArgs> = {
        [P in keyof T & keyof AggregateMappingRule]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateMappingRule[P]>
      : GetScalarType<T[P], AggregateMappingRule[P]>
  }




  export type MappingRuleGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: MappingRuleWhereInput
    orderBy?: MappingRuleOrderByWithAggregationInput | MappingRuleOrderByWithAggregationInput[]
    by: MappingRuleScalarFieldEnum[] | MappingRuleScalarFieldEnum
    having?: MappingRuleScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: MappingRuleCountAggregateInputType | true
    _min?: MappingRuleMinAggregateInputType
    _max?: MappingRuleMaxAggregateInputType
  }

  export type MappingRuleGroupByOutputType = {
    id: string
    fingerprint: string
    mappings: string
    templateName: string | null
    createdAt: Date
    updatedAt: Date
    _count: MappingRuleCountAggregateOutputType | null
    _min: MappingRuleMinAggregateOutputType | null
    _max: MappingRuleMaxAggregateOutputType | null
  }

  type GetMappingRuleGroupByPayload<T extends MappingRuleGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<MappingRuleGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof MappingRuleGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], MappingRuleGroupByOutputType[P]>
            : GetScalarType<T[P], MappingRuleGroupByOutputType[P]>
        }
      >
    >


  export type MappingRuleSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fingerprint?: boolean
    mappings?: boolean
    templateName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["mappingRule"]>

  export type MappingRuleSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    fingerprint?: boolean
    mappings?: boolean
    templateName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["mappingRule"]>

  export type MappingRuleSelectScalar = {
    id?: boolean
    fingerprint?: boolean
    mappings?: boolean
    templateName?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type $MappingRulePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "MappingRule"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      fingerprint: string
      mappings: string
      templateName: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["mappingRule"]>
    composites: {}
  }

  type MappingRuleGetPayload<S extends boolean | null | undefined | MappingRuleDefaultArgs> = $Result.GetResult<Prisma.$MappingRulePayload, S>

  type MappingRuleCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<MappingRuleFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: MappingRuleCountAggregateInputType | true
    }

  export interface MappingRuleDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['MappingRule'], meta: { name: 'MappingRule' } }
    /**
     * Find zero or one MappingRule that matches the filter.
     * @param {MappingRuleFindUniqueArgs} args - Arguments to find a MappingRule
     * @example
     * // Get one MappingRule
     * const mappingRule = await prisma.mappingRule.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends MappingRuleFindUniqueArgs>(args: SelectSubset<T, MappingRuleFindUniqueArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one MappingRule that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {MappingRuleFindUniqueOrThrowArgs} args - Arguments to find a MappingRule
     * @example
     * // Get one MappingRule
     * const mappingRule = await prisma.mappingRule.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends MappingRuleFindUniqueOrThrowArgs>(args: SelectSubset<T, MappingRuleFindUniqueOrThrowArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first MappingRule that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MappingRuleFindFirstArgs} args - Arguments to find a MappingRule
     * @example
     * // Get one MappingRule
     * const mappingRule = await prisma.mappingRule.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends MappingRuleFindFirstArgs>(args?: SelectSubset<T, MappingRuleFindFirstArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first MappingRule that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MappingRuleFindFirstOrThrowArgs} args - Arguments to find a MappingRule
     * @example
     * // Get one MappingRule
     * const mappingRule = await prisma.mappingRule.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends MappingRuleFindFirstOrThrowArgs>(args?: SelectSubset<T, MappingRuleFindFirstOrThrowArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more MappingRules that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MappingRuleFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all MappingRules
     * const mappingRules = await prisma.mappingRule.findMany()
     * 
     * // Get first 10 MappingRules
     * const mappingRules = await prisma.mappingRule.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const mappingRuleWithIdOnly = await prisma.mappingRule.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends MappingRuleFindManyArgs>(args?: SelectSubset<T, MappingRuleFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a MappingRule.
     * @param {MappingRuleCreateArgs} args - Arguments to create a MappingRule.
     * @example
     * // Create one MappingRule
     * const MappingRule = await prisma.mappingRule.create({
     *   data: {
     *     // ... data to create a MappingRule
     *   }
     * })
     * 
     */
    create<T extends MappingRuleCreateArgs>(args: SelectSubset<T, MappingRuleCreateArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many MappingRules.
     * @param {MappingRuleCreateManyArgs} args - Arguments to create many MappingRules.
     * @example
     * // Create many MappingRules
     * const mappingRule = await prisma.mappingRule.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends MappingRuleCreateManyArgs>(args?: SelectSubset<T, MappingRuleCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many MappingRules and returns the data saved in the database.
     * @param {MappingRuleCreateManyAndReturnArgs} args - Arguments to create many MappingRules.
     * @example
     * // Create many MappingRules
     * const mappingRule = await prisma.mappingRule.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many MappingRules and only return the `id`
     * const mappingRuleWithIdOnly = await prisma.mappingRule.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends MappingRuleCreateManyAndReturnArgs>(args?: SelectSubset<T, MappingRuleCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a MappingRule.
     * @param {MappingRuleDeleteArgs} args - Arguments to delete one MappingRule.
     * @example
     * // Delete one MappingRule
     * const MappingRule = await prisma.mappingRule.delete({
     *   where: {
     *     // ... filter to delete one MappingRule
     *   }
     * })
     * 
     */
    delete<T extends MappingRuleDeleteArgs>(args: SelectSubset<T, MappingRuleDeleteArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one MappingRule.
     * @param {MappingRuleUpdateArgs} args - Arguments to update one MappingRule.
     * @example
     * // Update one MappingRule
     * const mappingRule = await prisma.mappingRule.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends MappingRuleUpdateArgs>(args: SelectSubset<T, MappingRuleUpdateArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more MappingRules.
     * @param {MappingRuleDeleteManyArgs} args - Arguments to filter MappingRules to delete.
     * @example
     * // Delete a few MappingRules
     * const { count } = await prisma.mappingRule.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends MappingRuleDeleteManyArgs>(args?: SelectSubset<T, MappingRuleDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more MappingRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MappingRuleUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many MappingRules
     * const mappingRule = await prisma.mappingRule.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends MappingRuleUpdateManyArgs>(args: SelectSubset<T, MappingRuleUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one MappingRule.
     * @param {MappingRuleUpsertArgs} args - Arguments to update or create a MappingRule.
     * @example
     * // Update or create a MappingRule
     * const mappingRule = await prisma.mappingRule.upsert({
     *   create: {
     *     // ... data to create a MappingRule
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the MappingRule we want to update
     *   }
     * })
     */
    upsert<T extends MappingRuleUpsertArgs>(args: SelectSubset<T, MappingRuleUpsertArgs<ExtArgs>>): Prisma__MappingRuleClient<$Result.GetResult<Prisma.$MappingRulePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of MappingRules.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MappingRuleCountArgs} args - Arguments to filter MappingRules to count.
     * @example
     * // Count the number of MappingRules
     * const count = await prisma.mappingRule.count({
     *   where: {
     *     // ... the filter for the MappingRules we want to count
     *   }
     * })
    **/
    count<T extends MappingRuleCountArgs>(
      args?: Subset<T, MappingRuleCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], MappingRuleCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a MappingRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MappingRuleAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends MappingRuleAggregateArgs>(args: Subset<T, MappingRuleAggregateArgs>): Prisma.PrismaPromise<GetMappingRuleAggregateType<T>>

    /**
     * Group by MappingRule.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {MappingRuleGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends MappingRuleGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: MappingRuleGroupByArgs['orderBy'] }
        : { orderBy?: MappingRuleGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, MappingRuleGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetMappingRuleGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the MappingRule model
   */
  readonly fields: MappingRuleFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for MappingRule.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__MappingRuleClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the MappingRule model
   */ 
  interface MappingRuleFieldRefs {
    readonly id: FieldRef<"MappingRule", 'String'>
    readonly fingerprint: FieldRef<"MappingRule", 'String'>
    readonly mappings: FieldRef<"MappingRule", 'String'>
    readonly templateName: FieldRef<"MappingRule", 'String'>
    readonly createdAt: FieldRef<"MappingRule", 'DateTime'>
    readonly updatedAt: FieldRef<"MappingRule", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * MappingRule findUnique
   */
  export type MappingRuleFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * Filter, which MappingRule to fetch.
     */
    where: MappingRuleWhereUniqueInput
  }

  /**
   * MappingRule findUniqueOrThrow
   */
  export type MappingRuleFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * Filter, which MappingRule to fetch.
     */
    where: MappingRuleWhereUniqueInput
  }

  /**
   * MappingRule findFirst
   */
  export type MappingRuleFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * Filter, which MappingRule to fetch.
     */
    where?: MappingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MappingRules to fetch.
     */
    orderBy?: MappingRuleOrderByWithRelationInput | MappingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MappingRules.
     */
    cursor?: MappingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MappingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MappingRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MappingRules.
     */
    distinct?: MappingRuleScalarFieldEnum | MappingRuleScalarFieldEnum[]
  }

  /**
   * MappingRule findFirstOrThrow
   */
  export type MappingRuleFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * Filter, which MappingRule to fetch.
     */
    where?: MappingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MappingRules to fetch.
     */
    orderBy?: MappingRuleOrderByWithRelationInput | MappingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for MappingRules.
     */
    cursor?: MappingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MappingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MappingRules.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of MappingRules.
     */
    distinct?: MappingRuleScalarFieldEnum | MappingRuleScalarFieldEnum[]
  }

  /**
   * MappingRule findMany
   */
  export type MappingRuleFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * Filter, which MappingRules to fetch.
     */
    where?: MappingRuleWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of MappingRules to fetch.
     */
    orderBy?: MappingRuleOrderByWithRelationInput | MappingRuleOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing MappingRules.
     */
    cursor?: MappingRuleWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` MappingRules from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` MappingRules.
     */
    skip?: number
    distinct?: MappingRuleScalarFieldEnum | MappingRuleScalarFieldEnum[]
  }

  /**
   * MappingRule create
   */
  export type MappingRuleCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * The data needed to create a MappingRule.
     */
    data: XOR<MappingRuleCreateInput, MappingRuleUncheckedCreateInput>
  }

  /**
   * MappingRule createMany
   */
  export type MappingRuleCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many MappingRules.
     */
    data: MappingRuleCreateManyInput | MappingRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MappingRule createManyAndReturn
   */
  export type MappingRuleCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many MappingRules.
     */
    data: MappingRuleCreateManyInput | MappingRuleCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * MappingRule update
   */
  export type MappingRuleUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * The data needed to update a MappingRule.
     */
    data: XOR<MappingRuleUpdateInput, MappingRuleUncheckedUpdateInput>
    /**
     * Choose, which MappingRule to update.
     */
    where: MappingRuleWhereUniqueInput
  }

  /**
   * MappingRule updateMany
   */
  export type MappingRuleUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update MappingRules.
     */
    data: XOR<MappingRuleUpdateManyMutationInput, MappingRuleUncheckedUpdateManyInput>
    /**
     * Filter which MappingRules to update
     */
    where?: MappingRuleWhereInput
  }

  /**
   * MappingRule upsert
   */
  export type MappingRuleUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * The filter to search for the MappingRule to update in case it exists.
     */
    where: MappingRuleWhereUniqueInput
    /**
     * In case the MappingRule found by the `where` argument doesn't exist, create a new MappingRule with this data.
     */
    create: XOR<MappingRuleCreateInput, MappingRuleUncheckedCreateInput>
    /**
     * In case the MappingRule was found with the provided `where` argument, update it with this data.
     */
    update: XOR<MappingRuleUpdateInput, MappingRuleUncheckedUpdateInput>
  }

  /**
   * MappingRule delete
   */
  export type MappingRuleDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
    /**
     * Filter which MappingRule to delete.
     */
    where: MappingRuleWhereUniqueInput
  }

  /**
   * MappingRule deleteMany
   */
  export type MappingRuleDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which MappingRules to delete
     */
    where?: MappingRuleWhereInput
  }

  /**
   * MappingRule without action
   */
  export type MappingRuleDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the MappingRule
     */
    select?: MappingRuleSelect<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const WaybillScalarFieldEnum: {
    id: 'id',
    externalCode: 'externalCode',
    receiverStore: 'receiverStore',
    receiverName: 'receiverName',
    receiverPhone: 'receiverPhone',
    receiverAddress: 'receiverAddress',
    skuCode: 'skuCode',
    skuName: 'skuName',
    quantity: 'quantity',
    skuSpec: 'skuSpec',
    remark: 'remark',
    batchId: 'batchId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type WaybillScalarFieldEnum = (typeof WaybillScalarFieldEnum)[keyof typeof WaybillScalarFieldEnum]


  export const MappingRuleScalarFieldEnum: {
    id: 'id',
    fingerprint: 'fingerprint',
    mappings: 'mappings',
    templateName: 'templateName',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type MappingRuleScalarFieldEnum = (typeof MappingRuleScalarFieldEnum)[keyof typeof MappingRuleScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type WaybillWhereInput = {
    AND?: WaybillWhereInput | WaybillWhereInput[]
    OR?: WaybillWhereInput[]
    NOT?: WaybillWhereInput | WaybillWhereInput[]
    id?: StringFilter<"Waybill"> | string
    externalCode?: StringNullableFilter<"Waybill"> | string | null
    receiverStore?: StringNullableFilter<"Waybill"> | string | null
    receiverName?: StringNullableFilter<"Waybill"> | string | null
    receiverPhone?: StringNullableFilter<"Waybill"> | string | null
    receiverAddress?: StringNullableFilter<"Waybill"> | string | null
    skuCode?: StringNullableFilter<"Waybill"> | string | null
    skuName?: StringNullableFilter<"Waybill"> | string | null
    quantity?: IntNullableFilter<"Waybill"> | number | null
    skuSpec?: StringNullableFilter<"Waybill"> | string | null
    remark?: StringNullableFilter<"Waybill"> | string | null
    batchId?: StringFilter<"Waybill"> | string
    createdAt?: DateTimeFilter<"Waybill"> | Date | string
    updatedAt?: DateTimeFilter<"Waybill"> | Date | string
  }

  export type WaybillOrderByWithRelationInput = {
    id?: SortOrder
    externalCode?: SortOrderInput | SortOrder
    receiverStore?: SortOrderInput | SortOrder
    receiverName?: SortOrderInput | SortOrder
    receiverPhone?: SortOrderInput | SortOrder
    receiverAddress?: SortOrderInput | SortOrder
    skuCode?: SortOrderInput | SortOrder
    skuName?: SortOrderInput | SortOrder
    quantity?: SortOrderInput | SortOrder
    skuSpec?: SortOrderInput | SortOrder
    remark?: SortOrderInput | SortOrder
    batchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WaybillWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: WaybillWhereInput | WaybillWhereInput[]
    OR?: WaybillWhereInput[]
    NOT?: WaybillWhereInput | WaybillWhereInput[]
    externalCode?: StringNullableFilter<"Waybill"> | string | null
    receiverStore?: StringNullableFilter<"Waybill"> | string | null
    receiverName?: StringNullableFilter<"Waybill"> | string | null
    receiverPhone?: StringNullableFilter<"Waybill"> | string | null
    receiverAddress?: StringNullableFilter<"Waybill"> | string | null
    skuCode?: StringNullableFilter<"Waybill"> | string | null
    skuName?: StringNullableFilter<"Waybill"> | string | null
    quantity?: IntNullableFilter<"Waybill"> | number | null
    skuSpec?: StringNullableFilter<"Waybill"> | string | null
    remark?: StringNullableFilter<"Waybill"> | string | null
    batchId?: StringFilter<"Waybill"> | string
    createdAt?: DateTimeFilter<"Waybill"> | Date | string
    updatedAt?: DateTimeFilter<"Waybill"> | Date | string
  }, "id">

  export type WaybillOrderByWithAggregationInput = {
    id?: SortOrder
    externalCode?: SortOrderInput | SortOrder
    receiverStore?: SortOrderInput | SortOrder
    receiverName?: SortOrderInput | SortOrder
    receiverPhone?: SortOrderInput | SortOrder
    receiverAddress?: SortOrderInput | SortOrder
    skuCode?: SortOrderInput | SortOrder
    skuName?: SortOrderInput | SortOrder
    quantity?: SortOrderInput | SortOrder
    skuSpec?: SortOrderInput | SortOrder
    remark?: SortOrderInput | SortOrder
    batchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: WaybillCountOrderByAggregateInput
    _avg?: WaybillAvgOrderByAggregateInput
    _max?: WaybillMaxOrderByAggregateInput
    _min?: WaybillMinOrderByAggregateInput
    _sum?: WaybillSumOrderByAggregateInput
  }

  export type WaybillScalarWhereWithAggregatesInput = {
    AND?: WaybillScalarWhereWithAggregatesInput | WaybillScalarWhereWithAggregatesInput[]
    OR?: WaybillScalarWhereWithAggregatesInput[]
    NOT?: WaybillScalarWhereWithAggregatesInput | WaybillScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Waybill"> | string
    externalCode?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    receiverStore?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    receiverName?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    receiverPhone?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    receiverAddress?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    skuCode?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    skuName?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    quantity?: IntNullableWithAggregatesFilter<"Waybill"> | number | null
    skuSpec?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    remark?: StringNullableWithAggregatesFilter<"Waybill"> | string | null
    batchId?: StringWithAggregatesFilter<"Waybill"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Waybill"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Waybill"> | Date | string
  }

  export type MappingRuleWhereInput = {
    AND?: MappingRuleWhereInput | MappingRuleWhereInput[]
    OR?: MappingRuleWhereInput[]
    NOT?: MappingRuleWhereInput | MappingRuleWhereInput[]
    id?: StringFilter<"MappingRule"> | string
    fingerprint?: StringFilter<"MappingRule"> | string
    mappings?: StringFilter<"MappingRule"> | string
    templateName?: StringNullableFilter<"MappingRule"> | string | null
    createdAt?: DateTimeFilter<"MappingRule"> | Date | string
    updatedAt?: DateTimeFilter<"MappingRule"> | Date | string
  }

  export type MappingRuleOrderByWithRelationInput = {
    id?: SortOrder
    fingerprint?: SortOrder
    mappings?: SortOrder
    templateName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MappingRuleWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    fingerprint?: string
    AND?: MappingRuleWhereInput | MappingRuleWhereInput[]
    OR?: MappingRuleWhereInput[]
    NOT?: MappingRuleWhereInput | MappingRuleWhereInput[]
    mappings?: StringFilter<"MappingRule"> | string
    templateName?: StringNullableFilter<"MappingRule"> | string | null
    createdAt?: DateTimeFilter<"MappingRule"> | Date | string
    updatedAt?: DateTimeFilter<"MappingRule"> | Date | string
  }, "id" | "fingerprint">

  export type MappingRuleOrderByWithAggregationInput = {
    id?: SortOrder
    fingerprint?: SortOrder
    mappings?: SortOrder
    templateName?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: MappingRuleCountOrderByAggregateInput
    _max?: MappingRuleMaxOrderByAggregateInput
    _min?: MappingRuleMinOrderByAggregateInput
  }

  export type MappingRuleScalarWhereWithAggregatesInput = {
    AND?: MappingRuleScalarWhereWithAggregatesInput | MappingRuleScalarWhereWithAggregatesInput[]
    OR?: MappingRuleScalarWhereWithAggregatesInput[]
    NOT?: MappingRuleScalarWhereWithAggregatesInput | MappingRuleScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"MappingRule"> | string
    fingerprint?: StringWithAggregatesFilter<"MappingRule"> | string
    mappings?: StringWithAggregatesFilter<"MappingRule"> | string
    templateName?: StringNullableWithAggregatesFilter<"MappingRule"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"MappingRule"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"MappingRule"> | Date | string
  }

  export type WaybillCreateInput = {
    id?: string
    externalCode?: string | null
    receiverStore?: string | null
    receiverName?: string | null
    receiverPhone?: string | null
    receiverAddress?: string | null
    skuCode?: string | null
    skuName?: string | null
    quantity?: number | null
    skuSpec?: string | null
    remark?: string | null
    batchId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaybillUncheckedCreateInput = {
    id?: string
    externalCode?: string | null
    receiverStore?: string | null
    receiverName?: string | null
    receiverPhone?: string | null
    receiverAddress?: string | null
    skuCode?: string | null
    skuName?: string | null
    quantity?: number | null
    skuSpec?: string | null
    remark?: string | null
    batchId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaybillUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalCode?: NullableStringFieldUpdateOperationsInput | string | null
    receiverStore?: NullableStringFieldUpdateOperationsInput | string | null
    receiverName?: NullableStringFieldUpdateOperationsInput | string | null
    receiverPhone?: NullableStringFieldUpdateOperationsInput | string | null
    receiverAddress?: NullableStringFieldUpdateOperationsInput | string | null
    skuCode?: NullableStringFieldUpdateOperationsInput | string | null
    skuName?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: NullableIntFieldUpdateOperationsInput | number | null
    skuSpec?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    batchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaybillUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalCode?: NullableStringFieldUpdateOperationsInput | string | null
    receiverStore?: NullableStringFieldUpdateOperationsInput | string | null
    receiverName?: NullableStringFieldUpdateOperationsInput | string | null
    receiverPhone?: NullableStringFieldUpdateOperationsInput | string | null
    receiverAddress?: NullableStringFieldUpdateOperationsInput | string | null
    skuCode?: NullableStringFieldUpdateOperationsInput | string | null
    skuName?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: NullableIntFieldUpdateOperationsInput | number | null
    skuSpec?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    batchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaybillCreateManyInput = {
    id?: string
    externalCode?: string | null
    receiverStore?: string | null
    receiverName?: string | null
    receiverPhone?: string | null
    receiverAddress?: string | null
    skuCode?: string | null
    skuName?: string | null
    quantity?: number | null
    skuSpec?: string | null
    remark?: string | null
    batchId: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type WaybillUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalCode?: NullableStringFieldUpdateOperationsInput | string | null
    receiverStore?: NullableStringFieldUpdateOperationsInput | string | null
    receiverName?: NullableStringFieldUpdateOperationsInput | string | null
    receiverPhone?: NullableStringFieldUpdateOperationsInput | string | null
    receiverAddress?: NullableStringFieldUpdateOperationsInput | string | null
    skuCode?: NullableStringFieldUpdateOperationsInput | string | null
    skuName?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: NullableIntFieldUpdateOperationsInput | number | null
    skuSpec?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    batchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type WaybillUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    externalCode?: NullableStringFieldUpdateOperationsInput | string | null
    receiverStore?: NullableStringFieldUpdateOperationsInput | string | null
    receiverName?: NullableStringFieldUpdateOperationsInput | string | null
    receiverPhone?: NullableStringFieldUpdateOperationsInput | string | null
    receiverAddress?: NullableStringFieldUpdateOperationsInput | string | null
    skuCode?: NullableStringFieldUpdateOperationsInput | string | null
    skuName?: NullableStringFieldUpdateOperationsInput | string | null
    quantity?: NullableIntFieldUpdateOperationsInput | number | null
    skuSpec?: NullableStringFieldUpdateOperationsInput | string | null
    remark?: NullableStringFieldUpdateOperationsInput | string | null
    batchId?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MappingRuleCreateInput = {
    id?: string
    fingerprint: string
    mappings: string
    templateName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MappingRuleUncheckedCreateInput = {
    id?: string
    fingerprint: string
    mappings: string
    templateName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MappingRuleUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fingerprint?: StringFieldUpdateOperationsInput | string
    mappings?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MappingRuleUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    fingerprint?: StringFieldUpdateOperationsInput | string
    mappings?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MappingRuleCreateManyInput = {
    id?: string
    fingerprint: string
    mappings: string
    templateName?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type MappingRuleUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    fingerprint?: StringFieldUpdateOperationsInput | string
    mappings?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type MappingRuleUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    fingerprint?: StringFieldUpdateOperationsInput | string
    mappings?: StringFieldUpdateOperationsInput | string
    templateName?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type WaybillCountOrderByAggregateInput = {
    id?: SortOrder
    externalCode?: SortOrder
    receiverStore?: SortOrder
    receiverName?: SortOrder
    receiverPhone?: SortOrder
    receiverAddress?: SortOrder
    skuCode?: SortOrder
    skuName?: SortOrder
    quantity?: SortOrder
    skuSpec?: SortOrder
    remark?: SortOrder
    batchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WaybillAvgOrderByAggregateInput = {
    quantity?: SortOrder
  }

  export type WaybillMaxOrderByAggregateInput = {
    id?: SortOrder
    externalCode?: SortOrder
    receiverStore?: SortOrder
    receiverName?: SortOrder
    receiverPhone?: SortOrder
    receiverAddress?: SortOrder
    skuCode?: SortOrder
    skuName?: SortOrder
    quantity?: SortOrder
    skuSpec?: SortOrder
    remark?: SortOrder
    batchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WaybillMinOrderByAggregateInput = {
    id?: SortOrder
    externalCode?: SortOrder
    receiverStore?: SortOrder
    receiverName?: SortOrder
    receiverPhone?: SortOrder
    receiverAddress?: SortOrder
    skuCode?: SortOrder
    skuName?: SortOrder
    quantity?: SortOrder
    skuSpec?: SortOrder
    remark?: SortOrder
    batchId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type WaybillSumOrderByAggregateInput = {
    quantity?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type MappingRuleCountOrderByAggregateInput = {
    id?: SortOrder
    fingerprint?: SortOrder
    mappings?: SortOrder
    templateName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MappingRuleMaxOrderByAggregateInput = {
    id?: SortOrder
    fingerprint?: SortOrder
    mappings?: SortOrder
    templateName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type MappingRuleMinOrderByAggregateInput = {
    id?: SortOrder
    fingerprint?: SortOrder
    mappings?: SortOrder
    templateName?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use WaybillDefaultArgs instead
     */
    export type WaybillArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = WaybillDefaultArgs<ExtArgs>
    /**
     * @deprecated Use MappingRuleDefaultArgs instead
     */
    export type MappingRuleArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = MappingRuleDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}