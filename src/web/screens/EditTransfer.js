import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonDatetime,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { strToCents, centsToDollar } from '../../helpers/currency';
import { trashOutline } from "ionicons/icons";
import { getAccounts } from "../../models/accounts";
import { getStats } from "../../models/stats";
import { getTransferByID, updateTransfer, deleteTransfer } from '../../models/transfers';
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

export default function EditTransfer({ id, onError, onClose }) {
  const [amount, setAmount] = useState(null);
  const [fromID, setFromID] = useState(null);
  const [toID, setToID] = useState(null);
  const [transactionDate, setTransferDate] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [accountBalances, setAccountBalances] = useState({});
  const [transfer, setTransfer] = useState({});

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

  useEffect(() => {
    async function fetchTransfer() {
      try {
        setTransfer(await getTransferByID(id));
      } catch(err) {
        onError(err);
      }
    }
    fetchTransfer();
  }, [id, onError]);

  const amountVal = amount ?? centsToDollar(transfer?.amount);
  const fromIDVal =
    fromID ?? (accounts || []).find((acct) => acct.id === transfer?.fromID)?.id;
  const toIDVal =
    toID ?? (accounts || []).find((acct) => acct.id === transfer?.toID)?.id;
  const transactionDateVal = transactionDate ?? transfer?.transactionDate;

  function handleCancel(evt) {
    evt.preventDefault();
    onClose();
  }

  function handleDelete(evt) {
    evt.preventDefault();
    setDeleteAlertOpen(true);
  }

  async function handleDeleteConfirm() {
    try {
      setDeleteAlertOpen(false);
      await deleteTransfer(transfer)
      onClose();
    } catch (err) {
      onError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      await updateTransfer(transfer, buildTransferData({
        fromID: fromIDVal,
        toID: toIDVal,
        amount: amountVal,
        transactionDate: transactionDateVal,
      }));
      onClose();
    } catch (err) {
      onError(err);
    }
  }

  const endButton = (
    <IonButton onClick={handleDelete}>
      <IonIcon icon={trashOutline} />
    </IonButton>
  );

  return (
    <IonPage id="main-content">
      <ModalToolbar
        title="Edit Transfer"
        color="tertiary"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Transfer"
            message="Are you sure you want to delete this transfer?"
            buttons={[
              { text: "Cancel", role: "cancel" },
              { text: "Delete", handler: handleDeleteConfirm },
            ]}
          />
          <IonItem>
            <IonLabel position="stacked">From:</IonLabel>
            <IonSelect
              value={fromIDVal}
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
              value={toIDVal}
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
            <IonLabel position="stacked">Amount:</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              value={amountVal}
              placeholder="$"
              onIonChange={(evt) => {
                const cents = strToCents(evt.detail.value);
                setAmount(centsToDollar(cents));
              }}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Date:</IonLabel>
            <IonDatetime
              value={transactionDateVal}
              onIonChange={(evt) => {
                setTransferDate(evt.detail.value);
              }}
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit" color="tertiary">
            Update Transfer
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditTransfer.propTypes = {
  id: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
