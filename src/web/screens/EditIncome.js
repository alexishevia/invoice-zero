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
import { getIncomeByID, updateIncome, deleteIncome } from '../../models/incomes';
import { getCategories } from "../../models/categories";
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

function buildIncomeData({
  accountID,
  categoryID,
  amount,
  description,
  transactionDate,
}) {
  const incomeData = {
    accountID,
    categoryID,
    amount: strToCents(amount),
    description: description || "",
    transactionDate: isValidDayStr(transactionDate) ? transactionDate : today(),
  };

  new Validation(incomeData, "accountID").required().string().notEmpty();
  new Validation(incomeData, "categoryID").required().string().notEmpty();
  new Validation(incomeData, "amount").required().integer().biggerThan(0);
  new Validation(incomeData, "description").required().string();
  new Validation(incomeData, "transactionDate").required().dayString();

  return incomeData;
}

export default function EditIncome({ id, onError, onClose }) {
  const [amount, setAmount] = useState(null);
  const [accountID, setAccountID] = useState(null);
  const [categoryID, setCategoryID] = useState(null);
  const [description, setDescription] = useState(null);
  const [transactionDate, setIncomeDate] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accountBalances, setAccountBalances] = useState({});
  const [income, setIncome] = useState({});

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

  useEffect(() => {
    async function fetchIncome() {
      try {
        setIncome(await getIncomeByID(id));
      } catch(err) {
        onError(err);
      }
    }
    fetchIncome();
  }, [id, onError]);

  const amountVal = amount ?? centsToDollar(income?.amount);
  const accountIDVal =
    accountID ??
    (accounts || []).find((acct) => acct.id === income?.accountID)?.id;
  const categoryIDVal =
    categoryID ??
    (categories || []).find((cat) => cat.id === income?.categoryID)?.id;
  const descriptionVal = description ?? income?.description;
  const transactionDateVal = transactionDate ?? income?.transactionDate;

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
      await deleteIncome(income)
      onClose();
    } catch (err) {
      onError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      await updateIncome(income, buildIncomeData({
        accountID: accountIDVal,
        categoryID: categoryIDVal,
        amount: amountVal,
        description: descriptionVal,
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
        title="Edit Income"
        color="success"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Income"
            message="Are you sure you want to delete this income?"
            buttons={[
              { text: "Cancel", role: "cancel" },
              { text: "Delete", handler: handleDeleteConfirm },
            ]}
          />
          <IonItem>
            <IonLabel position="stacked">Account:</IonLabel>
            <IonSelect
              value={accountIDVal}
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
              value={categoryIDVal}
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
                setIncomeDate(evt.detail.value);
              }}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Description:</IonLabel>
            <IonInput
              type="text"
              value={descriptionVal}
              onIonChange={(evt) => {
                setDescription(evt.detail.value);
              }}
            />
          </IonItem>
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit" color="success">
            Update Income
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

EditIncome.propTypes = {
  id: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
