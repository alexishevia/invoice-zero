import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  IonAlert,
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonLoading,
  IonPage,
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { DataStore } from '@aws-amplify/datastore'
import { Account } from '../../models';
import Validation from "../../helpers/Validation";
import ModalToolbar from "../ModalToolbar";

function buildAccountData({ id, name, initialBalance }) {
  const accountData = {
    id,
    name,
    initialBalance: parseFloat(initialBalance, 10),
  };
  new Validation(accountData, "name").required().string().notEmpty();
  new Validation(accountData, "initialBalance")
    .required()
    .number()
    .biggerOrEqualThan(0);
  return accountData;
}

export default function EditAccount({ id, onClose, onError }) {
  const [account, setAccount] = useState({});
  const [name, setName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialBalance, setInitialBalance] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  useEffect(() => {
    async function fetchAccount() {
      try {
        setIsLoading(true);
        const data = await DataStore.query(Account, id);
        setAccount(data);
        setIsLoading(false);
      } catch(err) {
        setIsLoading(false);
        onError(err);
      }
    }
    fetchAccount();
  }, [id, onError]);

  const nameVal = name ?? account?.name;
  const initialBalanceVal = initialBalance ?? account?.initialBalance;

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
      setIsLoading(true);
      await DataStore.delete(account)
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      onError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      setIsLoading(true);
      const accountData = buildAccountData({
        id,
        name: nameVal,
        initialBalance: initialBalanceVal,
      });
      await DataStore.save(
        Account.copyOf(account, updated => {
          updated.name = accountData.name
          updated.initialBalance = accountData.initialBalance
        })
      )
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
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
        title="Edit Account"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <IonLoading isOpen={isLoading} />
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Account"
            message="Are you sure you want to delete this account?"
            buttons={[
              { text: "Cancel", role: "cancel" },
              { text: "Delete", handler: handleDeleteConfirm },
            ]}
          />
          <IonItem>
            <IonLabel position="stacked">Name:</IonLabel>
            <IonInput
              type="text"
              value={nameVal}
              onIonChange={(evt) => {
                setName(evt.detail.value);
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Initial Balance:</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              value={initialBalanceVal}
              placeholder="$"
              onIonChange={(evt) => {
                setInitialBalance(evt.detail.value);
              }}
              required
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit">Update Account</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditAccount.propTypes = {
  id: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
