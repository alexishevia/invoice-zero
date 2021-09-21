import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { IonLabel, IonItem } from "@ionic/react";
import { getAccounts } from '../../../models/accounts';
import { getStats } from "../../../models/stats.mjs";
import AccountsList from "./AccountsList";

export default function Accounts({ onError }) {
  const [accounts, setAccounts] = useState([]);
  const [stats, setStats] = useState(null);

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
    // wait until accounts have loaded
    if (!accounts.length) {
      return;
    }
    const controller = new AbortController();
    async function fetchStats() {
      try {
        const stats = await getStats({ signal: controller.signal });
        if (controller.signal.aborted) { return; }
        setStats(stats);
      } catch(err){
        if (controller.signal.aborted) { return; }
        onError(err);
      }
    }
    fetchStats();
    return () => { controller.abort() };
  }, [accounts, onError]);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Accounts</h3>
        </IonLabel>
      </IonItem>
      <AccountsList accounts={accounts} stats={stats} />
    </>
  );
}

Accounts.propTypes = {
  onError: PropTypes.func.isRequired,
};
