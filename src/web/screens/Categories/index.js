import React, { useState, useEffect } from 'react';
import { DataStore } from '@aws-amplify/datastore'
import { IonLabel, IonItem, IonLoading } from '@ionic/react';
import { Category } from '../../../models';
import CategoriesList from './CategoriesList';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  async function fetchCategories() {
    try {
      setIsLoading(true);
      const result = await DataStore.query(Category);
      setIsLoading(false);
      setCategories(result);
    } catch(err){
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
    const subscription = DataStore.observe(Category).subscribe(() => fetchCategories())
    return () => { subscription.unsubscribe() }
  }, []);

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
