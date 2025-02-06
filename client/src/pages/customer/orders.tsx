import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InsertOrder, Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, Truck, Check, Star } from "lucide-react";
import { format } from "date-fns";

export default function CustomerOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [items, setItems] = useState("");
  const [notes, setNotes] = useState("");

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/customer"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (order: InsertOrder) => {
      const res = await apiRequest("POST", "/api/orders", order);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/customer"] });
      setNewOrderOpen(false);
      setItems("");
      setNotes("");
      toast({
        title: "Order Created",
        description: "Your order has been placed successfully.",
      });
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      orderId,
      toId,
      rating,
    }: {
      orderId: number;
      toId: number;
      rating: number;
    }) => {
      const res = await apiRequest("POST", "/api/reviews", {
        orderId,
        toId,
        rating,
        comment: "",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/customer"] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    },
  });

  const handleNewOrder = () => {
    if (!items.trim()) {
      toast({
        title: "Error",
        description: "Please add at least one item to your order",
        variant: "destructive",
      });
      return;
    }

    createOrderMutation.mutate({
      items: items.split("\n").filter(Boolean),
      notes,
    });
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return <ShoppingCart className="h-5 w-5 text-yellow-500" />;
      case "accepted":
      case "shopping":
        return <ShoppingCart className="h-5 w-5 text-blue-500 animate-bounce" />;
      case "delivering":
        return <Truck className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Button onClick={() => setNewOrderOpen(true)}>New Order</Button>
        </div>

        <div className="grid gap-6">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    Order #{order.id}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Items:</h3>
                    <ul className="list-disc list-inside text-muted-foreground">
                      {order.items.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  {order.notes && (
                    <div>
                      <h3 className="font-medium mb-2">Notes:</h3>
                      <p className="text-muted-foreground">{order.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                {order.status === "completed" && !order.shopperId && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <Button
                        key={rating}
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          reviewMutation.mutate({
                            orderId: order.id,
                            toId: order.shopperId!,
                            rating,
                          })
                        }
                      >
                        <Star
                          className={`h-5 w-5 ${
                            rating <= (order.rating || 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    ))}
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog open={newOrderOpen} onOpenChange={setNewOrderOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Shopping List
                </label>
                <Textarea
                  placeholder="Enter items (one per line)"
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Special Instructions
                </label>
                <Textarea
                  placeholder="Any preferences or instructions for the shopper"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button
                className="w-full"
                onClick={handleNewOrder}
                disabled={createOrderMutation.isPending}
              >
                {createOrderMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Place Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
