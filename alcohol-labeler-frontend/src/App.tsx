import AlcoholLabelForm from "./components/AlcoholLabelForm";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Alcohol Label Validator
          </h1>
          <p className="mt-2 text-gray-600">
            Submit your product details and upload a label image for validation
          </p>
        </div>
        <AlcoholLabelForm />
      </div>
    </div>
  );
}

export default App;
