import React from 'react';
import { StoreView } from '@/components/StoreView';
import { shopifyFetch } from '@/lib/shopify';
import { PRODUCTS_QUERY } from '@/lib/shopify-queries';
import { Product } from '@/lib/shopify-types';
import { getCart } from '@/lib/cart-actions';

export default async function Store() {
  const data = await shopifyFetch<{ products: { nodes: Product[] } }>(PRODUCTS_QUERY, {
    first: 20,
  });

  const cart = await getCart();
  const cartCount = cart?.totalQuantity || 0;

  return (
    <StoreView products={data.products.nodes} cartCount={cartCount} />
  );
}
