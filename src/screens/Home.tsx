import { useQuery } from "@tanstack/react-query";
import { TransactionTable } from "~/components/TransactionTable";
import { transactions } from "~/constants/data";

const Home = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return transactions;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return <TransactionTable data={data} />;
};

export default Home;
