export interface DashboardSummaryResponse {
    numberOfOrders: number;
    paidOrders: number;// isPaid true
    notPaidOrders: number;
    numberOfClients: number;// role: client
    numberOfProducts: number;
    productsWithNoInventory: number; // 0
    lowInventory: number; // productos con 10 o menos
}