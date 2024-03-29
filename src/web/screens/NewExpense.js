import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonContent,
  IonDatetime,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { strToCents, centsToDollar } from '../../helpers/currency';
import { getAccounts } from "../../models/accounts";
import { getStats } from "../../models/stats";
import { getCategories } from "../../models/categories";
import { createExpense } from "../../models/expenses";
import { dateToDayStr, isValidDate, isValidDayStr } from "../../helpers/date";
import Validation from "../../helpers/Validation";
import ModalToolbar from "../ModalToolbar";

function today() {
  return dateToDayStr(new Date());
}

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

function buildExpenseData({
  accountID,
  categoryID,
  amount,
  description,
  transactionDate,
}) {
  const expenseData = {
    accountID,
    categoryID,
    amount: strToCents(amount),
    description: description || "",
    transactionDate: isValidDayStr(transactionDate) ? transactionDate : today(),
  };

  new Validation(expenseData, "accountID").required().string().notEmpty();
  new Validation(expenseData, "categoryID").required().string().notEmpty();
  new Validation(expenseData, "amount").required().integer().biggerThan(0);
  new Validation(expenseData, "description").string();
  new Validation(expenseData, "transactionDate").required().dayString();

  return expenseData;
}

export default function NewExpense({ onError, onClose }) {
  const [amount, setAmount] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [categoryID, setCategoryID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setTransactionDate] = useState(today());
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountBalances, setAccountBalances] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchAccounts() {
      try {
        setAccounts(await getAccounts());
      } catch(err){
        onError(err);
      }
    }
    fetchAccounts();
  }, [onError]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategories(await getCategories());
      } catch(err){
        onError(err);
      }
    }
    fetchCategories();
  }, [onError]);

  useEffect(() => {
    if (accounts.length === 0) { // wait until accounts are loaded
      return;
    }
    async function fetchAccountBalances() {
      try {
        const stats = await getStats();
        setAccountBalances(
          Object.entries(stats.perAccount).reduce((memo, [id, vals]) => {
            memo[id] = centsToDollar(vals.currentBalance);
            return memo;
          }, {})
        );
      } catch(err){
        onError(err);
      }
    }
    fetchAccountBalances();
  }, [accounts, onError]);

  async function handleSubmit(evt) {
    evt.preventDefault();
    setIsLoading(true);
    try {
      const expenseData = buildExpenseData({
        accountID,
        categoryID,
        amount,
        description,
        transactionDate,
      });
      await createExpense(expenseData);
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      onError(err);
    }
  }

  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  return (
    <IonPage id="main-content">
      <ModalToolbar title="New Expense" onClose={onClose} color="danger" />
      <IonLoading isOpen={isLoading} />
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">Amount:</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              value={amount}
              placeholder="$"
              onIonChange={(evt) => {
                const cents = strToCents(evt.detail.value);
                setAmount(centsToDollar(cents));
              }}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Account:</IonLabel>
            <IonSelect
              value={accountID}
              onIonChange={(evt) => {
                setAccountID(evt.detail.value);
              }}
              placeholder="Account"
            >
              {(accounts || [])
                .sort(sortByName)
                .map(({ id: accID, name }) => (
                  <IonSelectOption key={accID} value={accID}>
                    {name}
                    {accountBalances.hasOwnProperty(accID) ? ` ($${accountBalances[accID]} available)` : ""}
                  </IonSelectOption>
                ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Category:</IonLabel>
            <IonSelect
              value={categoryID}
              onIonChange={(evt) => {
                setCategoryID(evt.detail.value);
              }}
              placeholder="Category"
            >
              {(categories || [])
                .sort(sortByName)
                .map(({ id: catID, name }) => (
                  <IonSelectOption key={catID} value={catID}>
                    {name}
                  </IonSelectOption>
                ))}
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Date:</IonLabel>
            <IonDatetime
              value={transactionDate}
              onIonChange={(evt) => {
                const date = new Date(evt.detail.value);
                if (isValidDate(date)) {
                  setTransactionDate(dateToDayStr(date));
                }
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description:</IonLabel>
            <IonInput
              type="text"
              value={description}
              onIonChange={(evt) => {
                setDescription(evt.detail.value);
              }}
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit" color="danger">
            Add Expense
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewExpense.propTypes = {
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
