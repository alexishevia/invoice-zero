import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel, IonToggle } from "@ionic/react";

const allTypes = [
  { name: "Expense", value: "EXPENSE" },
  { name: "Income", value: "INCOME" },
  { name: "Transfer", value: "TRANSFER" },
]

export default function TypesFilter({ activeTypes, setStatusForType }) {
  const [isAllToggled, setIsAllToggled] = useState(true);

  function toggleAll(evt) {
    evt && evt.preventDefault();
    const newVal = !isAllToggled;
    setIsAllToggled(newVal);
    allTypes.forEach(({ value }) => {
      setStatusForType(value, newVal);
    });
  }

  return (
    <>
      <IonItem>
        <IonLabel color="primary">Transaction Type</IonLabel>
        <IonToggle checked={isAllToggled} onIonChange={toggleAll} />
      </IonItem>
      {allTypes.map(({ name, value }) => {
        const isActive = activeTypes.includes(value);
        return (
          <IonItem key={value}>
            <IonLabel>{name}</IonLabel>
            <IonToggle
              checked={isActive}
              onIonChange={(evt) => {
                evt && evt.preventDefault();
                setStatusForType(value, !isActive);
              }}
            />
          </IonItem>
        );
      })}
    </>
  );
}

TypesFilter.propTypes = {
  activeTypes: PropTypes.arrayOf(PropTypes.string).isRequired,
  setStatusForType: PropTypes.func.isRequired,
};
