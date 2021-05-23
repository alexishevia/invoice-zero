// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Transfer, Expense, Income, Category, Account } = initSchema(schema);

export {
  Transfer,
  Expense,
  Income,
  Category,
  Account
};