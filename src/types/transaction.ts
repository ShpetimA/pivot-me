export type Transaction = {
  transaction_type: "invoice" | "bill" | "direct_expense";
  transaction_number: string;
  amount: string;
  status: "paid" | "unpaid" | "partially_paid";
  year: string;
};
