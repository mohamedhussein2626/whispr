export type Plan = {
    id: number;
    name: string;
    description?: string;
    features?: string;
    price: number;
    priceId?: string;
    interval: "monthly" | "yearly" | "lifetime";
    status: "ACTIVE" | "HIDDEN" | "DISABLED";
    isPopular: boolean;
    numberOfFiles: number; 
    numberOfEssayWriter: number;
    numberOfEssayGrader: number;
  };
  