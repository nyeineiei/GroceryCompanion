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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWebSocket } from "@/hooks/use-websocket";
import { OrderProgress } from "@/components/order-progress";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
  purchased: boolean;
};

type SafeOrder = Order & {
  total: number;
  serviceFee: number;
  items: OrderItem[];
};

export default function CustomerOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [items, setItems] = useState("");
  const [notes, setNotes] = useState("");

  useWebSocket();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/customer"],
    enabled: !!user, // Only run query when user is authenticated
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

  const payOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/pay`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/customer"] });
      toast({
        title: "Payment Successful",
        description: "Your order has been paid successfully.",
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

    const parsedItems = items
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [name, quantity = "1"] = line.split("x").map((s) => s.trim());
        return {
          name,
          quantity: parseInt(quantity) || 1,
          price: 0,
          purchased: false,
        };
      });

    createOrderMutation.mutate({
      items: parsedItems,
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
      case "paid":
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

  const safeOrders = orders?.map((order) => ({
    ...order,
    total: order.total ?? 0,
    serviceFee: order.serviceFee ?? 5.00,
    items: Array.isArray(order.items) ? order.items.map((item) => ({
      name: item.name ?? "",
      quantity: item.quantity ?? 1,
      price: item.price ?? 0,
      purchased: item.purchased ?? false,
    })) : [],
  })) as SafeOrder[];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Button onClick={() => setNewOrderOpen(true)}>New Order</Button>
        </div>

        <div className="grid gap-6">
          {safeOrders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    Order #{order.id}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {order.createdAt &&
                      format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
                <div className="mt-4">
                  <OrderProgress status={order.status} />
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  <h3 className="font-medium mb-2">Items:</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            ${item.price ? (item.price * item.quantity).toFixed(2) : "0.00"}
                          </TableCell>
                          <TableCell>
                            {item.purchased ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <span className="text-muted-foreground">Pending</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4">
                    <p className="text-right">
                      Subtotal: ${order.total.toFixed(2)}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        + ${order.serviceFee.toFixed(2)} service fee
                      </span>
                      <br />
                      <strong>
                        Total: ${(order.total + order.serviceFee).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                </div>
                {order.notes && (
                  <div>
                    <h3 className="font-medium mb-2">Notes:</h3>
                    <p className="text-muted-foreground">{order.notes}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                {order.status === "completed" && !order.isPaid && (
                  <Button
                    onClick={() => payOrderMutation.mutate(order.id)}
                    disabled={payOrderMutation.isPending}
                  >
                    {payOrderMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Pay Now
                  </Button>
                )}
                {order.status === "completed" && order.isPaid && (
                  <span className="text-green-500 font-medium">Paid</span>
                )}
                {order.status === "completed" && order.shopperId && (
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
                            reviewMutation.data && rating <= reviewMutation.data.rating
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
                  Shopping List (Format: Item name x quantity)
                </label>
                <Textarea
                  placeholder="Enter items (one per line, e.g. 'Milk x 2')"
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