"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronRight, Utensils } from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { format } from "date-fns";

type Order = {
  id: string;
  date: string;
  total: number;
  items: { name: string; quantity: number; price: number }[];
  tableNumber: number;
};

// const orders: Order[] = [
//   {
//     id: "ORD001",
//     date: "2023-05-01 18:30",
//     total: 42.5,
//     tableNumber: 5,
//     items: [
//       { name: "Margherita Pizza", quantity: 1, price: 12.5 },
//       { name: "Caesar Salad", quantity: 1, price: 8.0 },
//       { name: "Spaghetti Carbonara", quantity: 1, price: 15.0 },
//       { name: "Tiramisu", quantity: 1, price: 7.0 },
//     ],
//   },
//   {
//     id: "ORD002",
//     date: "2023-05-01 19:15",
//     total: 35.5,
//     tableNumber: 3,
//     items: [
//       { name: "Grilled Salmon", quantity: 1, price: 18.5 },
//       { name: "Garlic Bread", quantity: 1, price: 4.0 },
//       { name: "Chocolate Mousse", quantity: 2, price: 6.5 },
//     ],
//   },
//   {
//     id: "ORD003",
//     date: "2023-05-01 20:00",
//     total: 51.0,
//     tableNumber: 8,
//     items: [
//       { name: "T-Bone Steak", quantity: 1, price: 28.0 },
//       { name: "Mushroom Risotto", quantity: 1, price: 14.0 },
//       { name: "House Wine", quantity: 1, price: 9.0 },
//     ],
//   },
// ];

// Add a helper function to format the Firestore timestamp
const formatFirestoreTimestamp = (timestamp: Timestamp) => {
  const date = timestamp.toDate();
  return format(date, "MMM d, yyyy h:mm a"); // Example: "May 1, 2024 3:30 PM"
};

export default function Page() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);

  useEffect(() => {
    // Create a query to sort orders by date in descending order
    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("date", "desc")
    );

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        try {
          const ordersList = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              date: formatFirestoreTimestamp(data.date),
              total: data.total,
              items: data.items,
              tableNumber: data.tableNumber,
            } as Order;
          });
          setOrders(ordersList);
        } catch (error) {
          console.error("Error processing orders update:", error);
        }
      },
      (error) => {
        console.error("Error listening to orders:", error);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const OrderDetails = ({ order }: { order: Order }) => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Order {order.id}</h3>
      </div>
      <p className="text-sm text-gray-500">Ordered on {order.date}</p>
      <p className="text-sm font-medium">Table Number: {order.tableNumber}</p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Item</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {order.items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                ${item.price.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex justify-between items-center font-semibold">
        <span>Total</span>
        <span>${order.total.toFixed(2)}</span>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Order History</h1>
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.tableNumber}</TableCell>
                    <TableCell>${order.total.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hidden md:inline-flex"
                            onClick={() => setSelectedOrder(order)}
                          >
                            View Details
                          </Button>
                        </SheetTrigger>
                        <SheetContent
                          side="right"
                          className="w-[400px] sm:w-[540px]"
                        >
                          <SheetHeader>
                            <SheetTitle>Order Details</SheetTitle>
                          </SheetHeader>
                          <OrderDetails order={order} />
                        </SheetContent>
                      </Sheet>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="md:hidden"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">View Order Details</span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[80vh]">
                          <SheetHeader>
                            <SheetTitle>Order Details</SheetTitle>
                          </SheetHeader>
                          <OrderDetails order={order} />
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
