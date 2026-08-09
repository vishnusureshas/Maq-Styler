import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchProducts } from '@/store/slices/productSlice';
import { fetchCategories, selectCategories } from '@/store/slices/categorySlice';
import { productApi } from '@/api/product';
import type { Product } from '@/types/product';
import { Navbar } from '@/components/home/Navbar';
import { Hero } from '@/components/home/Hero';
import { Benefits } from '@/components/home/Benefits';
import { StatsBar } from '@/components/home/StatsBar';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromoBanner } from '@/components/home/PromoBanner';
import { ArrivalsCarousel } from '@/components/home/ArrivalsCarousel';
import { AICurated } from '@/components/home/AICurated';
import { Newsletter } from '@/components/home/Newsletter';
import { HomeFooter } from '@/components/home/HomeFooter';

export default function Home() {
  const dispatch = useAppDispatch();
  const { list: featured, status } = useAppSelector((s) => s.product);
  const categories = useAppSelector(selectCategories);
  const [arrivals, setArrivals] = useState<Product[]>([]);

  useEffect(() => {
    dispatch(fetchProducts({ featured: true, pageSize: 4 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    let active = true;
    productApi
      .list({ pageSize: 16 })
      .then(({ data }) => {
        if (active) setArrivals(data.products ?? []);
      })
      .catch(() => {
        /* hero/carousels degrade gracefully offline */
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="bg-white">
      <Navbar />
      <Hero products={featured.length > 0 ? featured : arrivals} categories={categories} />
      <Benefits />
      <StatsBar />
      <CategoryGrid categories={categories} products={arrivals} />
      <FeaturedProducts products={featured} loading={status === 'loading'} />
      <PromoBanner products={arrivals} />
      <ArrivalsCarousel products={arrivals} />
      <AICurated products={arrivals} />
      <Newsletter />
      <HomeFooter />
    </div>
  );
}