'use server';
import { stripe } from "@/lib/stripe";
import { ProductType } from "@/types/ProductType";


export async function fetchProduct({lastProductId} :{lastProductId?: string | undefined}){
    // fazendo o limite ser apenas um, caso tenha mais produtos para carregar é so mudar o limit
    const params = lastProductId ? {starting_after: lastProductId, limit: 1} : {limit: 1};
    const {data: products, has_more} = await stripe.products.list(params);
    const formatedProducts = await Promise.all(
      products.map(async (product) => {
        const price = await stripe.prices.list({
          product: product.id,
  
        });
        return {
          id: product.id,
          price: price.data[0].unit_amount,
          name: product.name,
          image: product.images[0],
          description: product.description,
          currency: price.data[0].currency,
        }
      })
    );
    return {formatedProducts, has_more};
    }