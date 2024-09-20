import AddCart from "@/app/components/AddCart";
import ProductImage from "@/app/components/ProductImage";
import { formatPrice } from "@/lib/utils";
import Stripe from "stripe";

type ProductPageProps = {
    params: {
        id:string;
    }
};

async function getProduct(id: string){
    
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,{apiVersion: '2024-06-20',});
    const product = await stripe.products.retrieve(id);
    const price = await stripe.prices.list({
        product: product.id,
    });
    return{
        id: product.id,
        price: price.data[0].unit_amount,
        name: product.name,
        image: product.images[0],
        description: product.description,
    };
}
export default async function ProductPage({ params: {id }}: ProductPageProps){
    const produto = await getProduct(id);

    return <div className="flex flex-col md:flex-row items-center max-w-7xl mx-auto gap-8 p-10">
        <ProductImage product={produto}/>
        <div className="flex flex-col">
            <div className="pb-4">
                <h1 className="text-2xl font-bold text-gray-300">{produto.name}</h1>     
                <h2>{formatPrice(produto.price)}</h2>

            </div>

            <div className="pb-4">
                <p className="text-sm text-gray-400">{produto.description}</p>
            </div>
            <div>
                <AddCart product={produto}/>
            </div>
        </div>
    </div>;
}