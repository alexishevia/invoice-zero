import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from "@ionic/react";
import { strToCents, centsToDollar } from '../../helpers/currency';
import { createAccount } from '../../models/accounts';
import Validation from "../../helpers/Validation";
import ModalToolbar from "../ModalToolbar";

function buildAccountData({ name, initialBalance }) {
  const accountData = {
    name,
    initialBalance: strToCents(initialBalance),
  };
  new Validation(accountData, "name").required().string().notEmpty();
  new Validation(accountData, "initialBalance")
    .required()
    .integer()
    .biggerOrEqualThan(0);
  return accountData;
}

export default function NewAccount({ onError, onClose }) {
  const [name, setName] = useState("");
  const [initialBalance, setInitialBalance] = useState('0.00');

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      await createAccount(buildAccountData({ name, initialBalance }));
      onClose();
    } catch (err) {
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
              onIonChange={(evt) => {
                const cents = strToCents(evt.detail.value);
                setInitialBalance(centsToDollar(cents));
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
