import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import microbesImage from "@/assets/evergreen-microbes.jpg";
import fertilizerImage from "@/assets/evergreen-fertilizer.jpg";
import compostImage from "@/assets/evergreen-compost.jpg";
import cocopeatImage from "@/assets/evergreen-cocopeat.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  type: string;
  description: string;
  longDescription: string;
  price: number;
  weight: string;
  rating: number;
  applications: string[];
  image: string;
  tone: string;
};

export const products: Product[] = [
  { id: "pseudomonas", name: "Pseudomonas", category: "Biofertilizers", type: "Microbial culture", description: "A considered microbial input for a more resilient root zone.", longDescription: "A living microbial culture selected for growers who want to give the root zone a more thoughtful start. Use as part of a consistent soil-care routine.", price: 499, weight: "1 kg", rating: 4.9, applications: ["Home Gardening", "Nurseries", "Vegetable Crops"], image: microbesImage, tone: "A pale limestone study of living cultures." },
  { id: "cocopeat", name: "Cocopeat", category: "Growing Media", type: "Root substrate", description: "A light, airy coconut fibre medium for balanced growing.", longDescription: "A refined growing medium with a loose, tactile structure. Ideal for seed starting, containers and blends where the root zone needs air and balance.", price: 349, weight: "5 kg", rating: 4.8, applications: ["Home Gardening", "Terrace Gardening", "Nurseries"], image: cocopeatImage, tone: "Warm coconut fibre and woven texture." },
  { id: "vermicompost", name: "Vermicompost", category: "Soil Enhancers", type: "Organic soil conditioner", description: "Rich organic matter for a more generous, living soil profile.", longDescription: "A dark, tactile soil conditioner for building a richer growing environment. Add to beds, containers or blends as part of a steady soil-building practice.", price: 399, weight: "5 kg", rating: 4.9, applications: ["Organic Farming", "Home Gardening", "Flowering Plants"], image: compostImage, tone: "Worm-cast texture and forest floor depth." },
  { id: "vam", name: "VAM", category: "Biofertilizers", type: "Mycorrhizal inoculant", description: "A considered mycorrhizal companion for stronger root exploration.", longDescription: "A mycorrhizal inoculant designed to sit alongside a careful growing routine. Apply close to the root zone and follow the directions on your selected pack.", price: 599, weight: "500 g", rating: 4.7, applications: ["Nurseries", "Fruit Crops", "Commercial Agriculture"], image: microbesImage, tone: "A quiet lab study of soil biology." },
  { id: "bone-meal", name: "Bone Meal Powder", category: "Plant Nutrition", type: "Organic nutrient", description: "A slow-release organic input for flowering and fruiting routines.", longDescription: "A considered nutrient input for growers planning toward flowering and fruiting. Use in moderation and alongside a balanced growing program.", price: 299, weight: "2 kg", rating: 4.8, applications: ["Flowering Plants", "Fruit Crops", "Terrace Gardening"], image: fertilizerImage, tone: "Measured organic nutrition on stone." },
  { id: "neem-cake", name: "Neem Cake", category: "Plant Protection", type: "Botanical soil input", description: "A botanical soil companion for everyday plant care.", longDescription: "A botanical input that can be folded into a wider soil-care routine for containers, beds and nursery work.", price: 279, weight: "2 kg", rating: 4.6, applications: ["Home Gardening", "Vegetable Crops", "Organic Farming"], image: fertilizerImage, tone: "A natural, textured botanical soil study." },
];

type CartLine = { id: string; quantity: number };
type StoreContextValue = { cart: CartLine[]; wishlist: string[]; addToCart: (id: string) => void; updateQuantity: (id: string, quantity: number) => void; removeFromCart: (id: string) => void; toggleWishlist: (id: string) => void; cartCount: number; cartTotal: number; isWishlisted: (id: string) => boolean };

const StoreContext = createContext<StoreContextValue | null>(null);

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const saved = window.localStorage.getItem(key); return saved ? (JSON.parse(saved) as T) : fallback; } catch { return fallback; }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => readStorage("evergreen-cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage("evergreen-wishlist", []));

  useEffect(() => { window.localStorage.setItem("evergreen-cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { window.localStorage.setItem("evergreen-wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const value = useMemo<StoreContextValue>(() => {
    const cartCount = cart.reduce((sum, line) => sum + line.quantity, 0);
    const cartTotal = cart.reduce((sum, line) => sum + (products.find((product) => product.id === line.id)?.price ?? 0) * line.quantity, 0);
    return {
      cart, wishlist, cartCount, cartTotal,
      addToCart: (id) => setCart((current) => current.some((line) => line.id === id) ? current.map((line) => line.id === id ? { ...line, quantity: line.quantity + 1 } : line) : [...current, { id, quantity: 1 }]),
      updateQuantity: (id, quantity) => setCart((current) => quantity < 1 ? current.filter((line) => line.id !== id) : current.map((line) => line.id === id ? { ...line, quantity } : line)),
      removeFromCart: (id) => setCart((current) => current.filter((line) => line.id !== id)),
      toggleWishlist: (id) => setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]),
      isWishlisted: (id) => wishlist.includes(id),
    };
  }, [cart, wishlist]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
}

export function getProduct(id: string) { return products.find((product) => product.id === id); }