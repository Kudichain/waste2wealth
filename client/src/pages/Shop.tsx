import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Shirt, Package, Award } from "lucide-react";

export default function Shop() {
  const products = [
    {
      name: "KudiChain T-Shirt",
      price: "₦5,000",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
      category: "Apparel"
    },
    {
      name: "Collector's Gloves",
      price: "₦2,500",
      image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400",
      category: "Equipment"
    },
    {
      name: "Reusable Bags Set",
      price: "₦3,500",
      image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400",
      category: "Equipment"
    },
    {
      name: "KudiChain Cap",
      price: "₦3,000",
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
      category: "Apparel"
    },
    {
      name: "Safety Vest",
      price: "₦4,500",
      image: "https://images.unsplash.com/photo-1617696590795-f8e1c98d78a3?w=400",
      category: "Equipment"
    },
    {
      name: "Water Bottle",
      price: "₦2,000",
      image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
      category: "Accessories"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 pt-20">
        <section className="py-20 px-6 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-outfit font-extrabold text-5xl md:text-6xl mb-6 text-gray-900">
              KudiChain Shop
            </h1>
            <p className="text-xl text-gray-700">
              Official merchandise and collector equipment
            </p>
          </div>
        </section>

        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {products.map((product) => (
                <Card key={product.name} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-gray-600 mb-2">{product.category}</div>
                    <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl text-primary">{product.price}</span>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Award className="h-16 w-16 mx-auto mb-6" />
            <h2 className="font-outfit font-bold text-3xl mb-6">Earn While You Shop</h2>
            <p className="text-xl mb-8">
              Use your KOBO tokens to get discounts on all shop items!
            </p>
            <p className="text-lg opacity-90">
              1 KOBO = ₦1,000 discount
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
