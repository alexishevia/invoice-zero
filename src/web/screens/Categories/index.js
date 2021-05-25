import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { DataStore } from '@aws-amplify/datastore'
import { IonLabel, IonItem, IonLoading } from '@ionic/react';
import { Category } from '../../../models';
import CategoriesList from './CategoriesList';

export default function Categories({ onError }) {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const result = await DataStore.query(Category);
        setCategories(result);
        setIsLoading(false);
      } catch(err){
        setIsLoading(false);
        onError(err);
      }
    }
    fetchCategories();
    const subscription = DataStore.observe(Category).subscribe(() => fetchCategories())
    return () => { subscription.unsubscribe() }
  }, [onError]);

  return (
    <>
      <IonItem>
        <IonLabel>
          <h3>Categories</h3>
        </IonLabel>
        <IonLoading isOpen={isLoading} />
      </IonItem>
      <CategoriesList categories={categories} />
    </>
  );
}

Categories.propTypes = {
  onError: PropTypes.func.isRequired,
};
