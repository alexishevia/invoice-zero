import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem, IonLoading } from "@ionic/react";
import { getAccounts, onAccountsChange } from '../../../models/accounts';
import AccountsList from "./AccountsList";

export default function Accounts({ onError }) {
  const [accounts, setAccounts] = useState([]);
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
    const subscription = onAccountsChange(() => fetchAccounts())
    return () => { subscription.unsubscribe() }
  }, [onError]);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Accounts</h3>
        </IonLabel>
      </IonItem>
      <IonLoading isOpen={isLoading} />
      <AccountsList accounts={accounts} />
    </>
  );
}

Accounts.propTypes = {
  onError: PropTypes.func.isRequired,
};
