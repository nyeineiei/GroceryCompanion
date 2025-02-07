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
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Geolocation is not supported by your browser"));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      const res = await apiRequest("POST", `/api/orders/${orderId}/accept`, {
        location,
      });
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
    onError: (error: Error) => {
      toast({
        title: "Error Accepting Order",
        description: error.message,
        variant: "destructive",
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

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "shopping":
        return <ShoppingCart className="h-5 w-5 text-blue-500 animate-bounce" />;
      case "delivering":
        return <Truck className="h-5 w-5 text-blue-500 animate-pulse" />;
      case "completed":
        return <Check className="h-5 w-5 text-green-500" />;
      default:
        return <ShoppingCart className="h-5 w-5 text-yellow-500" />;
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await acceptOrderMutation.mutate(orderId);
    } catch (error) {
      // Error is handled in onError above
    }
  };


  if (isPendingLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Convert pending orders to safe orders with defaults
  const safePendingOrders = pendingOrders?.map(order => ({
    ...order,
    total: order.total ?? 0,
    serviceFee: order.serviceFee ?? 5.00,
    items: Array.isArray(order.items) ? order.items.map(item => ({
      name: item.name ?? '',
      quantity: item.quantity ?? 1,
      price: item.price ?? 0,
      purchased: item.purchased ?? false
    })) : []
  })) as SafeOrder[];

  // Convert my orders to safe orders with defaults
  const safeMyOrders = myOrders?.map(order => ({
    ...order,
    total: order.total ?? 0,
    serviceFee: order.serviceFee ?? 5.00,
    items: Array.isArray(order.items) ? order.items.map(item => ({
      name: item.name ?? '',
      quantity: item.quantity ?? 1,
      price: item.price ?? 0,
      purchased: item.purchased ?? false
    })) : []
  })) as SafeOrder[];

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

        {user?.isAvailable && safePendingOrders && safePendingOrders.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
            <div className="grid gap-6 mb-8">
              {safePendingOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-yellow-500" />
                      Order #{order.displayOrderNumber || order.id}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Items:</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Quantity</TableHead>
                              <TableHead>Price</TableHead>
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
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => handleAcceptOrder(order.id)}
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
        )}

        <h2 className="text-xl font-semibold mb-4">My Orders</h2>
        <div className="grid gap-6">
          {safeMyOrders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    Order #{order.displayOrderNumber || order.id}
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
                      {order.items.map((item, index) => (
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
                              onCheckedChange={(checked: boolean) => {
                                const newItems = [...order.items];
                                newItems[index] = {
                                  ...item,
                                  purchased: checked,
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