import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonLoading,
} from "@ionic/react";
import { DataStore } from '@aws-amplify/datastore'
import { Account } from '../../models';
import Validation from "../../helpers/Validation";
import ModalToolbar from "../ModalToolbar";

function buildAccountData({ name, initialBalance }) {
  const accountData = {
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

export default function NewAccount({ onError, onClose }) {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      const accountData = buildAccountData({ name, initialBalance });
      setIsLoading(true);
      await DataStore.save(new Account(accountData))
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
      <ModalToolbar title="New Account" onClose={onClose} />
      <IonLoading isOpen={isLoading} />
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="stacked">Name:</IonLabel>
            <IonInput
              type="text"
              value={name}
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
              value={initialBalance}
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
          <IonButton type="submit">Add Account</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewAccount.propTypes = {
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

