import { useQuery } from "@tanstack/react-query";
import { Order } from "@shared/schema";
import { format } from "date-fns";
import Navbar from "@/components/layout/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, Check, Loader2 } from "lucide-react";

export default function CustomerOrderHistory() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders/customer/history"],
  });

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
        <h1 className="text-3xl font-bold mb-8">Order History</h1>
        <div className="grid gap-6">
          {orders?.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    Order #{order.displayOrderNumber || order.id}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {order.createdAt &&
                      format(new Date(order.createdAt), "MMM d, yyyy h:mm a")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
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
                {order.shopperId && (
                  <div className="mt-4 flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">
                      Order completed
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
