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
  IonPage,
} from "@ionic/react";
import { trashOutline } from "ionicons/icons";
import { strToCents, centsToDollar } from '../../helpers/currency';
import { getAccountByID, updateAccount, deleteAccount } from '../../models/accounts';
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

export default function EditAccount({ id, onClose, onError }) {
  const [account, setAccount] = useState({});
  const [name, setName] = useState(null);
  const [initialBalance, setInitialBalance] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  useEffect(() => {
    async function fetchAccount() {
      try {
        setAccount(await getAccountByID(id));
      } catch(err) {
        onError(err);
      }
    }
    fetchAccount();
  }, [id, onError]);

  const nameVal = name ?? account?.name;
  const initialBalanceVal = initialBalance ?? centsToDollar(account?.initialBalance);

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
      await deleteAccount(account);
      onClose();
    } catch (err) {
      onError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      await updateAccount(account, buildAccountData({
        name: nameVal,
        initialBalance: initialBalanceVal,
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
        title="Edit Account"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
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
                const cents = strToCents(evt.detail.value);
                setInitialBalance(centsToDollar(cents));
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
