import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";





export declare class Transfer {
  readonly id: string;
  readonly amount: number;
  readonly fromID: string;
  readonly toID: string;
  readonly transactionDate: string;
  constructor(init: ModelInit<Transfer>);
  static copyOf(source: Transfer, mutator: (draft: MutableModel<Transfer>) => MutableModel<Transfer> | void): Transfer;
}

export declare class Expense {
  readonly id: string;
  readonly amount: number;
  readonly accountID: string;
  readonly categoryID: string;
  readonly description?: string;
  readonly transactionDate: string;
  constructor(init: ModelInit<Expense>);
  static copyOf(source: Expense, mutator: (draft: MutableModel<Expense>) => MutableModel<Expense> | void): Expense;
}

export declare class Income {
  readonly id: string;
  readonly amount: number;
  readonly accountID: string;
  readonly categoryID: string;
  readonly description?: string;
  readonly transactionDate: string;
  constructor(init: ModelInit<Income>);
  static copyOf(source: Income, mutator: (draft: MutableModel<Income>) => MutableModel<Income> | void): Income;
}

export declare class Category {
  readonly id: string;
  readonly name: string;
  constructor(init: ModelInit<Category>);
  static copyOf(source: Category, mutator: (draft: MutableModel<Category>) => MutableModel<Category> | void): Category;
}

export declare class Account {
  readonly id: string;
  readonly name: string;
  readonly initialBalance: number;
  constructor(init: ModelInit<Account>);
  static copyOf(source: Account, mutator: (draft: MutableModel<Account>) => MutableModel<Account> | void): Account;
}