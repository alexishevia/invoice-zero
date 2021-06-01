import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  IonButton,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
} from '@ionic/react';
import { createCategory } from '../../models/categories';
import Validation from '../../helpers/Validation';
import ModalToolbar from '../ModalToolbar';

function buildCategoryData({ name }) {
  const categoryData = { name };
  new Validation(categoryData, "name").required().string().notEmpty();
  return categoryData;
}

export default function NewCategory({ onError, onClose }) {
  const [name, setName] = useState("");

  async function handleSubmit(evt) {
    evt.preventDefault();
    try {
      await createCategory(buildCategoryData({ name }))
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
      <ModalToolbar title="New Category" onClose={onClose} />
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
          <IonButton color="medium" onClick={handleCancel}>
            Cancel
          </IonButton>
          <IonButton type="submit">Add Category</IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

NewCategory.propTypes = {
  onError: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};
