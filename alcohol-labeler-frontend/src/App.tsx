import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AlcoholLabelForm from "./components/AlcoholLabelForm";
import AllLabelValidations from "./components/AllLabelValidations";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Alcohol Label Validator
            </h1>
            <p className="mt-2 text-gray-600">
              Submit your product details and upload a label image for
              validation
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AlcoholLabelForm />
            </div>
            <div className="lg:col-span-1">
              <AllLabelValidations />
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
