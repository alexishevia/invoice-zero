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
  IonLoading,
} from "@ionic/react";
import { DataStore } from '@aws-amplify/datastore'
import { trashOutline } from "ionicons/icons";
import { Category } from '../../models';
import Validation from "../../helpers/Validation";
import ModalToolbar from "../ModalToolbar";

function buildcategoryData({ id, name }) {
  const categoryData = {
    id,
    name,
  };
  new Validation(categoryData, "name").required().string().notEmpty();
  return categoryData;
}

export default function Editcategory({ id, onClose, onError }) {
  const [category, setCategory] = useState({});
  const [name, setName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteAlertOpen, setDeleteAlertOpen] = useState(false);

  useEffect(() => {
    async function fetchCategory() {
      try {
        setIsLoading(true);
        const data = await DataStore.query(Category, id);
        setCategory(data);
        setIsLoading(false);
      } catch(err) {
        setIsLoading(false);
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
      setIsLoading(true);
      await DataStore.delete(category)
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
      onError(err);
    }
  }

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      setIsLoading(true);
      const categoryData = buildcategoryData({ id, name: nameVal });
      await DataStore.save(
        Category.copyOf(category, updated => {
          updated.name = categoryData.name
        })
      )
      setIsLoading(false);
      onClose();
    } catch (err) {
      setIsLoading(false);
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
        <IonLoading isOpen={isLoading} />
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
