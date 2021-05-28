import { DataStore, Predicates } from '@aws-amplify/datastore'

const ITEMS_PER_PAGE = 100; // amount of items to request per page
const MAX_PAGES = 500; // max amount of pages to request

export async function forEach(modelName, model, func) {
  let page = 0;
  while (true) {
    const transfers = await DataStore.query(model, Predicates.ALL, {
      page,
      limit: ITEMS_PER_PAGE,
    });
    if (!transfers || !transfers.length) {
      return; // done
    }
    transfers.forEach(func);
    page += 1;
    if (page === MAX_PAGES) {
      throw new Error(`max amount of ${modelName} pages requested`);
    }
  }
}

