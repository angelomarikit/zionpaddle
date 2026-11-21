-- Extra product-page gallery images (in addition to per-colorway hero images).
alter table products
  add column if not exists gallery_images jsonb not null default '[]'::jsonb;

comment on column products.gallery_images is 'Ordered list of image URLs shown on the product page gallery.';