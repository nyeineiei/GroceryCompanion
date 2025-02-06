import { Progress } from "@/components/ui/progress";
import { Order } from "@shared/schema";
import { ShoppingCart, Truck, Check, Clock } from "lucide-react";

const orderStages = [
  { status: "pending", label: "Pending", icon: Clock },
  { status: "accepted", label: "Accepted", icon: ShoppingCart },
  { status: "shopping", label: "Shopping", icon: ShoppingCart },
  { status: "delivering", label: "Delivering", icon: Truck },
  { status: "completed", label: "Delivered", icon: Check },
  { status: "paid", label: "Paid", icon: Check },
] as const;

type OrderStage = typeof orderStages[number]["status"];

export function OrderProgress({ status }: { status: Order["status"] }) {
  const currentStageIndex = orderStages.findIndex((stage) => stage.status === status);
  const progress = ((currentStageIndex + 1) / orderStages.length) * 100;

  return (
    <div className="space-y-2">
      <Progress value={progress} className="h-2" />
      <div className="flex justify-between">
        {orderStages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index <= currentStageIndex;
          const isCurrentStage = index === currentStageIndex;

          return (
            <div
              key={stage.status}
              className={`flex flex-col items-center ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div
                className={`rounded-full p-1 ${
                  isCurrentStage ? "bg-primary/10 animate-pulse" : ""
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "fill-primary" : ""}`} />
              </div>
              <span className="text-[10px] font-medium mt-1">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}