import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IonLabel, IonItem } from '@ionic/react';
import { getCategories, onCategoriesChange } from '../../../models/categories';
import CategoriesList from './CategoriesList';

export default function Categories({ onError }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setCategories(await getCategories());
      } catch(err){
        onError(err);
      }
    }
    fetchCategories();
    const subscription = onCategoriesChange(() => fetchCategories())
    return () => { subscription.unsubscribe() }
  }, [onError]);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Categories</h3>
        </IonLabel>
      </IonItem>
      <CategoriesList categories={categories} />
    </>
  );
}

Categories.propTypes = {
  onError: PropTypes.func.isRequired,
};
