import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Routes } from "react-router";
import PivotReport from "~/screens/PivotReport/PivotReport";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<PivotReport />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
