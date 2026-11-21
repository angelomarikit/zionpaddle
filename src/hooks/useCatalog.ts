import { useQuery } from '@tanstack/react-query'
import { products as mockProducts } from '../data/mock/products'
import { collections as mockCollectionsList } from '../data/mock/collections'
import { fetchCollectionsFromSupabase, fetchProductsFromSupabase, getCatalogSource } from '../services/catalog'
import { applyCollectionPatches, applyProductPatches, filterDeletedCatalogProducts } from '../services/cms/localCms'
import type { Collection, Product } from '../types/commerce'

export function useCatalog() {
  const productsQuery = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: async (): Promise<Product[]> =>
      filterDeletedCatalogProducts(
        applyProductPatches((await fetchProductsFromSupabase()) ?? mockProducts),
      ),
    staleTime: 60_000,
  })

  const collectionsQuery = useQuery({
    queryKey: ['catalog', 'collections'],
    queryFn: async (): Promise<Collection[]> =>
      applyCollectionPatches((await fetchCollectionsFromSupabase()) ?? mockCollectionsList),
    staleTime: 60_000,
  })

  return {
    products: productsQuery.data ?? filterDeletedCatalogProducts(mockProducts),
    collections: collectionsQuery.data ?? mockCollectionsList,
    isLoading: productsQuery.isLoading || collectionsQuery.isLoading,
    source: productsQuery.data && getCatalogSource() === 'supabase' ? 'supabase' : 'mock',
  }
}

export function findProductBySlug(catalog: Product[], slug: string) {
  return catalog.find((p) => p.slug === slug)
}

export function productsInCollection(catalog: Product[], collectionSlug: string) {
  return catalog.filter((p) => p.collectionSlugs.includes(collectionSlug))
}