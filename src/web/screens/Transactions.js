import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IonLabel, IonItem, IonLoading } from '@ionic/react';
import { getAccounts, onAccountsChange } from "../../models/accounts";
import { getCategories, onCategoriesChange } from "../../models/categories";
import { getTransfers, onTransfersChange } from "../../models/transfers";
import { getIncomes, onIncomesChange } from "../../models/incomes";
import { getExpenses, onExpensesChange } from "../../models/expenses";
import TransactionsList from '../TransactionsList';

function sortByLastChangedAt(a, b) {
  if (a._lastChangedAt > b._lastChangedAt) {
    return -1;
  }
  if (b._lastChangedAt > a._lastChangedAt) {
    return 1;
  }
  return 0;
}

export default function Transactions({ onError }) {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setIsLoading(true);
        setAccounts(await getAccounts());
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchAccounts();
    const subscription = onAccountsChange(() => fetchAccounts());
    return () => { subscription.unsubscribe() }
  }, [onError]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        setCategories(await getCategories());
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchCategories();
    const subscription = onCategoriesChange(() => fetchCategories());
    return () => { subscription.unsubscribe() }
  }, [onError]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const [
          transfers,
          incomes,
          expenses
        ] = await Promise.all([
          getTransfers(),
          getIncomes(),
          getExpenses(),
        ]);
        setTransactions([
          ...transfers.map(t => ({ ...t, type: "TRANSFER" })),
          ...incomes.map(i => ({ ...i, type: "INCOME" })),
          ...expenses.map(e => ({ ...e, type: "EXPENSE" })),
        ].sort(sortByLastChangedAt));
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchTransactions();
    const transfersSubscription = onTransfersChange(() => fetchTransactions())
    const incomesSubscription = onIncomesChange(() => fetchTransactions())
    const expensesSubscription = onExpensesChange(() => fetchTransactions())
    return () => {
      transfersSubscription.unsubscribe()
      incomesSubscription.unsubscribe()
      expensesSubscription.unsubscribe()
    }
  }, [onError]);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Transactions</h3>
        </IonLabel>
      </IonItem>
      <IonLoading isOpen={isLoading} />
      <TransactionsList
        accounts={accounts}
        transactions={transactions}
        categories={categories}
      />
    </>
  );
}

Transactions.propTypes = {
  onError: PropTypes.func.isRequired,
};
