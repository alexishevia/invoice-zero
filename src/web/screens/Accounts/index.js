import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import { getAccounts } from '../../../models/accounts';
import AccountsList from "./AccountsList";

export default function Accounts({ onError }) {
  const [accounts, setAccounts] = useState([]);

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

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Accounts</h3>
        </IonLabel>
      </IonItem>
      <AccountsList accounts={accounts} />
    </>
  );
}

Accounts.propTypes = {
  onError: PropTypes.func.isRequired,
};
