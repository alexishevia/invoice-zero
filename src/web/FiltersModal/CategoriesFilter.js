import React, { useState } from "react";
import PropTypes from "prop-types";
import { IonItem, IonLabel, IonToggle } from "@ionic/react";

function sortByName({ name: a }, { name: b }) {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
}

export default function CategoriesFilter({
  categories,
  categoriesStatus,
  setStatusForCategory,
}) {
  const [isAllToggled, setIsAllToggled] = useState(true);

  function toggleAll(evt) {
    evt && evt.preventDefault();
    const newVal = !isAllToggled;
    setIsAllToggled(newVal);
    categories.forEach(({ id }) => {
      setStatusForCategory(id, newVal);
    });
  }

  return (
    <>
      <IonItem className="ion-padding-top">
        <IonLabel color="primary">Categories</IonLabel>
        <IonToggle checked={isAllToggled} onIonChange={toggleAll} />
      </IonItem>
      {(categories || []).sort(sortByName).map(({ id, name }) => {
        const isActive = Object.hasOwnProperty.call(categoriesStatus, id)
          ? categoriesStatus[id]
          : true;
        return (
          <IonItem key={id}>
            <IonLabel>{name}</IonLabel>
            <IonToggle
              checked={isActive}
              onIonChange={() => {
                setStatusForCategory(id, !isActive);
              }}
            />
          </IonItem>
        );
      })}
    </>
  );
}

CategoriesFilter.defaultProps = {
  categories: [],
  categoriesStatus: {},
};

CategoriesFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })),
  categoriesStatus: PropTypes.shape({}),
  setStatusForCategory: PropTypes.func.isRequired,
};
