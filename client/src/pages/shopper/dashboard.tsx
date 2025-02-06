import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Navbar from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Order } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ShoppingCart,
  Truck,
  Check,
  Star,
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  purchased: boolean;
}


export default function ShopperDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: myOrders } = useQuery<Order[]>({
    queryKey: ["/api/orders/shopper"],
  });

  const { data: pendingOrders, isLoading: isPendingLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/pending"],
    enabled: user?.isAvailable ?? false,
  });

  const availabilityMutation = useMutation({
    mutationFn: async (isAvailable: boolean) => {
      const res = await apiRequest("POST", "/api/shoppers/availability", {
        isAvailable,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/pending"] });
    },
  });

  const acceptOrderMutation = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/accept`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/shopper"] });
      queryClient.invalidateQueries({ queryKey: ["/api/orders/pending"] });
      toast({
        title: "Order Accepted",
        description: "You can now start shopping for this order.",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: number;
      status: Order["status"];
    }) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/status`, {
        status,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/shopper"] });
    },
  });

  const updateItemsMutation = useMutation({
    mutationFn: async ({
      orderId,
      items,
    }: {
      orderId: number;
      items: OrderItem[];
    }) => {
      const res = await apiRequest("POST", `/api/orders/${orderId}/items`, {
        items,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders/shopper"] });
      toast({
        title: "Items Updated",
        description: "Order items have been updated successfully.",
      });
    },
  });

  const getNextStatus = (currentStatus: Order["status"]): Order["status"] | null => {
    switch (currentStatus) {
      case "accepted":
        return "shopping";
      case "shopping":
        return "delivering";
      case "delivering":
        return "completed";
      default:
        return null;
    }
  };

  if (isPendingLoading) {
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
          <div>
            <h1 className="text-3xl font-bold">Shopper Dashboard</h1>
            <div className="flex items-center gap-2 mt-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">
                {(user?.rating ?? 5.0).toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Available for orders
            </span>
            <Switch
              checked={user?.isAvailable ?? false}
              onCheckedChange={(checked) => availabilityMutation.mutate(checked)}
            />
          </div>
        </div>

        {user?.isAvailable && pendingOrders?.length ? (
          <>
            <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
            <div className="grid gap-6 mb-8">
              {pendingOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-yellow-500" />
                      Order #{order.id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Items:</h3>
                        <ul className="list-disc list-inside text-muted-foreground">
                          {order.items?.map((item, i) => (
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
                    <Button
                      onClick={() => acceptOrderMutation.mutate(order.id)}
                      disabled={acceptOrderMutation.isPending}
                    >
                      {acceptOrderMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Accept Order
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        ) : null}

        <h2 className="text-xl font-semibold mb-4">My Orders</h2>
        <div className="grid gap-6">
          {myOrders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {order.status === "shopping" ? (
                      <ShoppingCart className="h-5 w-5 text-blue-500 animate-bounce" />
                    ) : order.status === "delivering" ? (
                      <Truck className="h-5 w-5 text-blue-500 animate-pulse" />
                    ) : (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    Order #{order.id}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {order.createdAt &&
                      format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
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
                        <TableHead>Purchased</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.isArray(order.items) && order.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => {
                                const newItems = [...order.items];
                                newItems[index] = {
                                  ...item,
                                  price: parseFloat(e.target.value) || 0,
                                };
                                updateItemsMutation.mutate({
                                  orderId: order.id,
                                  items: newItems,
                                });
                              }}
                              className="w-24"
                              disabled={order.status === "completed"}
                            />
                          </TableCell>
                          <TableCell>
                            <Checkbox
                              checked={item.purchased}
                              onCheckedChange={(checked) => {
                                const newItems = [...order.items];
                                newItems[index] = {
                                  ...item,
                                  purchased: checked as boolean,
                                };
                                updateItemsMutation.mutate({
                                  orderId: order.id,
                                  items: newItems,
                                });
                              }}
                              disabled={order.status === "completed"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="mt-4">
                    <p className="text-right">
                      Total: ${order.total.toFixed(2)}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        + ${order.serviceFee.toFixed(2)} service fee
                      </span>
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
                {order.status !== "completed" && (
                  <Button
                    onClick={() => {
                      const nextStatus = getNextStatus(order.status);
                      if (nextStatus) {
                        updateStatusMutation.mutate({
                          orderId: order.id,
                          status: nextStatus,
                        });
                      }
                    }}
                    disabled={updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {order.status === "accepted"
                      ? "Start Shopping"
                      : order.status === "shopping"
                      ? "Start Delivery"
                      : "Mark as Delivered"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}