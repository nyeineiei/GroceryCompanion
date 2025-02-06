import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user?.role === "customer") {
    setLocation("/orders");
    return null;
  }

  if (user?.role === "shopper") {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold mb-6">
                Fresh Groceries,
                <br />
                Delivered Fast
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Shop from your favorite stores and get your groceries delivered by shoppers in your community.
              </p>
              <Button size="lg" onClick={() => setLocation("/auth")}>
                Get Started
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1556767576-5ec41e3239ea"
                alt="Fresh produce"
                className="rounded-lg shadow-lg"
              />
              <img
                src="https://images.unsplash.com/photo-1483181957632-8bda974cbc91"
                alt="Grocery delivery"
                className="rounded-lg shadow-lg mt-8"
              />
            </div>
          </div>

          <div className="mt-24 text-center">
            <h2 className="text-3xl font-bold mb-12">How it works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1592502712628-c5219bf0bc12"
                  alt="Create list"
                  className="rounded-lg shadow-lg mb-4 aspect-square object-cover"
                />
                <h3 className="text-xl font-semibold mb-2">Create your list</h3>
                <p className="text-muted-foreground">
                  Add items to your shopping list and leave special instructions
                </p>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1516274626895-055a99214f08"
                  alt="Shopper matching"
                  className="rounded-lg shadow-lg mb-4 aspect-square object-cover"
                />
                <h3 className="text-xl font-semibold mb-2">Match with a shopper</h3>
                <p className="text-muted-foreground">
                  Get paired with a trusted shopper in your area
                </p>
              </div>
              <div>
                <img
                  src="https://images.unsplash.com/photo-1481437156560-3205f6a55735"
                  alt="Delivery"
                  className="rounded-lg shadow-lg mb-4 aspect-square object-cover"
                />
                <h3 className="text-xl font-semibold mb-2">Get your delivery</h3>
                <p className="text-muted-foreground">
                  Track your order and receive your groceries at your door
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}