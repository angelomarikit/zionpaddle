import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { products as mockProducts } from '../data/mock/products'
import { collections as mockCollectionsList } from '../data/mock/collections'
import {
  collectionsWithProductSlugs,
  fetchCollectionsFromSupabase,
  fetchProductsFromSupabase,
  getCatalogSource,
  mergeStorefrontCollections,
  mergeStorefrontProducts,
} from '../services/catalog'
import { applyCollectionPatches, applyProductPatches, filterDeletedCatalogProducts } from '../services/cms/localCms'
import type { Collection, Product } from '../types/commerce'

export function useCatalog() {
  const productsQuery = useQuery({
    queryKey: ['catalog', 'products'],
    queryFn: async (): Promise<Product[]> => {
      const fromDb = await fetchProductsFromSupabase()
      const merged = mergeStorefrontProducts(fromDb, mockProducts)
      return filterDeletedCatalogProducts(applyProductPatches(merged))
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  const collectionsQuery = useQuery({
    queryKey: ['catalog', 'collections'],
    queryFn: async (): Promise<Collection[]> => {
      const fromDb = await fetchCollectionsFromSupabase()
      return applyCollectionPatches(mergeStorefrontCollections(fromDb, mockCollectionsList))
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  const products = productsQuery.data ?? filterDeletedCatalogProducts(applyProductPatches(mockProducts))
  const collectionsRaw = collectionsQuery.data ?? applyCollectionPatches(mockCollectionsList)
  const collections = useMemo(
    () => collectionsWithProductSlugs(collectionsRaw, products),
    [collectionsRaw, products],
  )

  const dbProductCount = productsQuery.data?.length ?? 0

  return {
    products,
    collections,
    isLoading: productsQuery.isLoading || collectionsQuery.isLoading,
    source:
      getCatalogSource() === 'supabase' && (productsQuery.data !== undefined || dbProductCount > 0)
        ? 'supabase'
        : 'mock',
  }
}

export function findProductBySlug(catalog: Product[], slug: string) {
  return catalog.find((p) => p.slug === slug)
}

export function productsInCollection(catalog: Product[], collectionSlug: string) {
  return catalog.filter((p) => p.collectionSlugs.includes(collectionSlug))
}