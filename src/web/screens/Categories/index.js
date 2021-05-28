import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IonLabel, IonItem, IonLoading } from '@ionic/react';
import { getCategories, onCategoriesChange } from '../../../models/categories';
import CategoriesList from './CategoriesList';

export default function Categories({ onError }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        setCategories(await getCategories());
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
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
      <IonLoading isOpen={isLoading} />
      <CategoriesList categories={categories} />
    </>
  );
}

Categories.propTypes = {
  onError: PropTypes.func.isRequired,
};
