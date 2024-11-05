"use client";

import * as React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Pencil, Plus, Trash2 } from "lucide-react";

import {
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
};

export default function Page() {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(
    null
  );
  const [isAddingProduct, setIsAddingProduct] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      orderBy("name", "asc")
    );

    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      try {
        const productsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(productsList);
      } catch (error) {
        console.error("Error processing products update:", error);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveProduct = async (product: Product) => {
    setIsLoading(true);
    try {
      if (product.id) {
        const productRef = doc(db, "products", product.id);
        await updateDoc(productRef, {
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
        });
      } else {
        await addDoc(collection(db, "products"), {
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
        });
      }
      setEditingProduct(null);
      setIsAddingProduct(false);
      console.log(isAddingProduct);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, "products", id));
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product. Please try again.");
      }
    }
  };

  const ProductForm = ({
    product: initialProduct,
    onSave,
  }: {
    product: Product;
    onSave: (product: Product) => void;
  }) => {
    // Local state for form values
    const [formValues, setFormValues] = React.useState(initialProduct);

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(formValues);
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formValues.name}
            onChange={(e) =>
              setFormValues({ ...formValues, name: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formValues.category}
            onChange={(e) =>
              setFormValues({ ...formValues, category: e.target.value })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formValues.price}
            onChange={(e) =>
              setFormValues({
                ...formValues,
                price: parseFloat(e.target.value),
              })
            }
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            type="number"
            value={formValues.stock}
            onChange={(e) =>
              setFormValues({ ...formValues, stock: parseInt(e.target.value) })
            }
            required
          />
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </form>
    );
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              onClick={() => {
                setIsAddingProduct(true);
                setEditingProduct({
                  id: "",
                  name: "",
                  category: "",
                  price: 0,
                  stock: 0,
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Add New Product</SheetTitle>
            </SheetHeader>
            {editingProduct && (
              <ProductForm
                product={editingProduct}
                onSave={handleSaveProduct}
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-200px)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit Product</span>
                          </Button>
                        </SheetTrigger>
                        <SheetContent
                          side="right"
                          className="w-[400px] sm:w-[540px]"
                        >
                          <SheetHeader>
                            <SheetTitle>Edit Product</SheetTitle>
                          </SheetHeader>
                          {editingProduct && (
                            <ProductForm
                              product={editingProduct}
                              onSave={handleSaveProduct}
                            />
                          )}
                        </SheetContent>
                      </Sheet>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete Product</span>
                      </Button>
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
