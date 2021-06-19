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
import { createTransfer } from "../../models/transfers";
import { dateToDayStr, isValidDayStr } from "../../helpers/date";
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

function buildTransferData({
  fromID,
  toID,
  amount,
  transactionDate,
}) {
  const transferData = {
    fromID,
    toID,
    amount: strToCents(amount),
    transactionDate: isValidDayStr(transactionDate) ? transactionDate : today(),
  };

  new Validation(transferData, "fromID").required().string().notEmpty();
  new Validation(transferData, "toID").required().string().notEmpty();
  new Validation(transferData, "amount").required().integer().biggerThan(0);
  new Validation(transferData, "transactionDate").required().dayString();

  return transferData;
}

export default function NewTransfer({ onError, onClose }) {
  const [amount, setAmount] = useState(null);
  const [fromID, setFromID] = useState(null);
  const [toID, setToID] = useState(null);
  const [transactionDate, setTransferDate] = useState(today());
  const [accounts, setAccounts] = useState([]);
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
      const transferData = buildTransferData({
        fromID,
        toID,
        amount,
        transactionDate,
      });
      await createTransfer(transferData);
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
      <ModalToolbar title="New Transfer" color="tertiary" onClose={onClose} />
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
            <IonLabel position="stacked">From:</IonLabel>
            <IonSelect
              value={fromID}
              onIonChange={(evt) => {
                setFromID(evt.detail.value);
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
            <IonLabel position="stacked">To:</IonLabel>
            <IonSelect
              value={toID}
              onIonChange={(evt) => {
                setToID(evt.detail.value);
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
            <IonLabel position="stacked">Date:</IonLabel>
            <IonDatetime
              value={transactionDate}
              onIonChange={(evt) => {
                setTransferDate(evt.detail.value);
              }}
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit" color="tertiary">
            Add Transfer
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewTransfer.propTypes = {
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
