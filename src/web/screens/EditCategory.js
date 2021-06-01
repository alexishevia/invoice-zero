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
import { getCategoryByID, updateCategory, deleteCategory } from '../../models/categories';
import Validation from "../../helpers/Validation";
import ModalToolbar from "../ModalToolbar";

function buildcategoryData({ name }) {
  const categoryData = { name };
  new Validation(categoryData, "name").required().string().notEmpty();
  return categoryData;
}

export default function Editcategory({ id, onClose, onError }) {
  const [category, setCategory] = useState({});
  const [name, setName] = useState(null);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  useEffect(() => {
    async function fetchCategory() {
      try {
        setCategory(await getCategoryByID(id));
      } catch(err) {
        onError(err);
      }
    }
    fetchCategory();
  }, [id, onError]);

  const nameVal = name ?? category?.name;

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
      await deleteCategory(category)
      onClose();
    } catch (err) {
      onError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      await updateCategory(category, buildcategoryData({ name: nameVal }));
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
        title="Edit Category"
        onClose={onClose}
        endButton={endButton}
      />
      <IonContent>
        <form onSubmit={handleSubmit}>
          <IonAlert
            isOpen={isDeleteAlertOpen}
            onDidDismiss={() => setDeleteAlertOpen(false)}
            header="Delete Category"
            message="Are you sure you want to delete this category?"
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
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit">Update category</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

Editcategory.propTypes = {
  id: PropTypes.string.isRequired,
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
