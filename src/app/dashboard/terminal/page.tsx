"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { X, Minus, Plus, ShoppingCart } from "lucide-react";

import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect } from "react";

import { db } from "@/lib/firebase";

type Product = {
  id: number;
  name: string;
  price: number;
};

type OrderItem = Product & { quantity: number };

// const products: Product[] = [
//   { id: 1, name: "Coffee", price: 3.5 },
//   { id: 2, name: "Tea", price: 2.5 },
//   { id: 3, name: "Sandwich", price: 5.0 },
//   { id: 4, name: "Salad", price: 6.5 },
//   { id: 5, name: "Cake", price: 4.0 },
// ];

export default function Page() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [order, setOrder] = React.useState<OrderItem[]>([]);
  const [isOrderSheetOpen, setIsOrderSheetOpen] = React.useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = React.useState(false);
  const [tableNumber, setTableNumber] = React.useState<number>(1);

  useEffect(() => {
    // Create a real-time listener
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        try {
          const productsList = snapshot.docs.map((doc) => ({
            id: parseInt(doc.id),
            name: doc.data().name,
            price: doc.data().price,
          }));
          setProducts(productsList);
        } catch (error) {
          console.error("Error processing products update:", error);
        }
      },
      (error) => {
        console.error("Error listening to products:", error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Empty dependency array since we want this to run once on mount

  const addToOrder = (product: Product) => {
    setOrder((prevOrder) => {
      const existingItem = prevOrder.find((item) => item.id === product.id);
      if (existingItem) {
        return prevOrder.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevOrder, { ...product, quantity: 1 }];
    });
  };

  const removeFromOrder = (productId: number) => {
    setOrder((prevOrder) => prevOrder.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    setOrder((prevOrder) =>
      prevOrder.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const totalAmount = order.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (order.length === 0) {
      alert("Cannot place empty order!");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Create the order object
      const newOrder = {
        date: serverTimestamp(),
        items: order.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: totalAmount,
        status: "In Progress" as const,
        tableNumber: tableNumber,
      };

      // Add the order to Firestore
      await addDoc(collection(db, "orders"), newOrder);

      // Clear the current order
      setOrder([]);
      setIsOrderSheetOpen(false);

      alert("Order placed successfully!");
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Error placing order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const OrderSummary = () => (
    <div className="flex flex-col h-full">
      <h2 className="mb-4 text-2xl font-bold">Current Order</h2>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Table Number</label>
        <Input
          type="number"
          min="1"
          value={tableNumber}
          onChange={(e) => setTableNumber(parseInt(e.target.value) || 1)}
          className="w-full"
        />
      </div>

      <ScrollArea className="flex-grow">
        {order.map((item) => (
          <div key={item.id} className="mb-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{item.name}</div>
              <div>${item.price.toFixed(2)}</div>
            </div>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(item.id, Math.max(1, item.quantity - 1))
                }
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.id, parseInt(e.target.value) || 1)
                }
                className="mx-2 w-16 text-center"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                className="ml-2"
                onClick={() => removeFromOrder(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </ScrollArea>
      <Separator className="my-4" />
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Total:</div>
        <div className="text-2xl font-bold">${totalAmount.toFixed(2)}</div>
      </div>
      <Button
        className="mt-4 w-full"
        size="lg"
        onClick={handlePlaceOrder}
        disabled={order.length === 0 || isPlacingOrder}
      >
        {isPlacingOrder ? "Placing Order..." : "Place Order"}
      </Button>
    </div>
  );

  return (
    <div className="relative min-h-screen p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="md:order-1">
          <CardContent className="p-6">
            <h2 className="mb-4 text-2xl font-bold">Products</h2>
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <Button
                    key={product.id}
                    variant="outline"
                    className="h-24 flex-col items-start p-4"
                    onClick={() => addToOrder(product)}
                  >
                    <div className="font-semibold">{product.name}</div>
                    <div className="mt-auto">${product.price.toFixed(2)}</div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="hidden md:block">
          <CardContent className="p-6">
            <OrderSummary />
          </CardContent>
        </Card>
      </div>
      <div className="fixed bottom-4 right-4 md:hidden">
        <Sheet open={isOrderSheetOpen} onOpenChange={setIsOrderSheetOpen}>
          <SheetTrigger asChild>
            <Button
              className="rounded-full p-4"
              onClick={() => setIsOrderSheetOpen(true)}
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="ml-2 font-bold">${totalAmount.toFixed(2)}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <OrderSummary />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
