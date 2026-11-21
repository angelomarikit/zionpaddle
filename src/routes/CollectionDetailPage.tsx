import { Link, useParams } from 'react-router-dom'
import { productsInCollection, useCatalog } from '../hooks/useCatalog'
import { ProductCard } from '../components/product/ProductCard'
import { SectionShell } from '../components/tempo/SectionShell'
import { NotFoundPage } from './NotFoundPage'

export function CollectionDetailPage() {
  const { slug } = useParams()
  const { collections, products } = useCatalog()
  const collection = collections.find((c) => c.slug === slug)
  if (!collection) return <NotFoundPage />

  const items = productsInCollection(products, collection.slug)

  return (
    <>
      <div className="relative pt-16">
        <img
          src={collection.banner}
          alt={`PLACEHOLDER — ${collection.name} banner`}
          className="h-48 w-full object-cover md:h-64"
        />
      </div>
      <SectionShell surface="cream" className="pt-10">
        <p className="font-mono text-xs uppercase tracking-widest">(Collection)</p>
        <h1 className="mt-2 text-4xl font-bold">{collection.name}</h1>
        <p className="mt-3 max-w-xl text-cream-muted">{collection.description}</p>
      </SectionShell>
      <SectionShell surface="cream" className="!pt-0">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} showHoverVideo={false} showCommerceActions />
          ))}
        </div>
        <p className="mt-10 text-sm">
          <Link to="/collections" className="font-semibold uppercase tracking-wide">
            ← All collections
          </Link>
        </p>
      </SectionShell>
    </>
  )
}