import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataStore } from '@aws-amplify/datastore'
import { IonLabel, IonItem, IonLoading } from '@ionic/react';
import { Account, Category, Transfer } from '../../models';
import TransactionsList from './TransactionsList';

function sortByTransactionDate(a, b) {
  if (a.transactionDate > b.transactionDate) {
    return -1;
  }
  if (b.transactionDate > a.transactionDate) {
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
        const result = await DataStore.query(Account);
        setAccounts(result);
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchAccounts();
    const subscription = DataStore.observe(Account).subscribe(() => fetchAccounts())
    return () => { subscription.unsubscribe() }
  }, [onError]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const result = await DataStore.query(Category);
        setCategories(result);
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchCategories();
    const subscription = DataStore.observe(Category).subscribe(() => fetchCategories())
    return () => { subscription.unsubscribe() }
  }, [onError]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);
        const transfers = await DataStore.query(Transfer);
        setTransactions([
          ...transfers.map(t => ({ ...t, type: "TRANSFER" }))
        ].sort(sortByTransactionDate));
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchTransactions();
    const subscription = DataStore.observe(Transfer).subscribe(() => fetchTransactions())
    return () => { subscription.unsubscribe() }
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
