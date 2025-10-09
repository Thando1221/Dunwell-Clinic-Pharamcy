import { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import InventoryList from "@/components/InventoryList";
import AddMedicineForm from "@/components/AddMedicineForm";
import DispenseMedicineForm from "@/components/DispenseMedicineForm";
import CategoryManager from "@/components/CategoryManager";
import Reports from "@/components/Reports";
import Navigation from "@/components/Navigation";
import Login from "@/components/Login";
import { useAuth } from "@/hooks/useAuth";

interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  expiryDate: string;
  batchNumber: string;
  supplier: string;
}

const Index = () => {
  const { isAuthenticated, isAdmin, login } = useAuth();
  const [currentView, setCurrentView] = useState<"dashboard" | "inventory" | "add-medicine" | "dispense-medicine" | "categories" | "reports">("dashboard");
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "1",
      name: "Paracetamol 500mg",
      category: "Tablets",
      stock: 45,
      minStock: 50,
      expiryDate: "2025-06-15",
      batchNumber: "PCT5001",
      supplier: "MedCorp"
    },
    {
      id: "2",
      name: "Amoxicillin 250mg",
      category: "Antibiotics",
      stock: 12,
      minStock: 25,
      expiryDate: "2024-12-20",
      batchNumber: "AMX2501",
      supplier: "PharmaCo"
    },
    {
      id: "3",
      name: "Cough Syrup",
      category: "Syrups",
      stock: 78,
      minStock: 30,
      expiryDate: "2025-03-10",
      batchNumber: "CS3001",
      supplier: "HealthLabs"
    },
    {
      id: "4",
      name: "Insulin Pen",
      category: "Injections",
      stock: 25,
      minStock: 15,
      expiryDate: "2024-11-30",
      batchNumber: "INS1501",
      supplier: "DiabetesCare"
    },
    {
      id: "5",
      name: "Vitamin D3",
      category: "Supplements",
      stock: 8,
      minStock: 20,
      expiryDate: "2025-08-25",
      batchNumber: "VD3201",
      supplier: "VitaHealth"
    }
  ]);

  const [categories, setCategories] = useState<string[]>([
    "Tablets",
    "Antibiotics", 
    "Syrups",
    "Injections",
    "Supplements",
    "Ointments",
    "Capsules",
    "Other"
  ]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedMedicines = localStorage.getItem('pharmacy-medicines');
    const savedCategories = localStorage.getItem('pharmacy-categories');
    
    if (savedMedicines) {
      setMedicines(JSON.parse(savedMedicines));
    }
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }
  }, []);

  // Save data to localStorage whenever medicines or categories change
  useEffect(() => {
    localStorage.setItem('pharmacy-medicines', JSON.stringify(medicines));
  }, [medicines]);

  useEffect(() => {
    localStorage.setItem('pharmacy-categories', JSON.stringify(categories));
  }, [categories]);

  const handleAddMedicine = (medicineData: any) => {
    const newMedicine: Medicine = {
      id: Date.now().toString(),
      ...medicineData,
      stock: parseInt(medicineData.stock),
      minStock: parseInt(medicineData.minStock || 0)
    };
    setMedicines(prev => [...prev, newMedicine]);
  };

  const handleDispenseMedicine = (medicineId: string, quantity: number, nurseName: string) => {
    setMedicines(prev => 
      prev.map(medicine => 
        medicine.id === medicineId 
          ? { ...medicine, stock: medicine.stock - quantity }
          : medicine
      )
    );
  };

  const handleAddCategory = (category: string) => {
    setCategories(prev => [...prev, category]);
  };

  const handleDeleteCategory = (category: string) => {
    setCategories(prev => prev.filter(c => c !== category));
  };

  const handleUpdateMedicine = (updatedMedicine: Medicine) => {
    setMedicines(prev => 
      prev.map(medicine => 
        medicine.id === updatedMedicine.id ? updatedMedicine : medicine
      )
    );
  };

  // If not authenticated, show login
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  // If authenticated but not admin, show access denied
  if (isAuthenticated && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-medical-50 to-medical-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to access this system. Only pharmacists can use this application.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-medical-600 text-white rounded hover:bg-medical-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "inventory":
        return (
          <InventoryList 
            onAddMedicine={() => setCurrentView("add-medicine")}
            onDispenseMedicine={() => setCurrentView("dispense-medicine")}
            onManageCategories={() => setCurrentView("categories")}
            medicines={medicines}
            categories={categories}
            onUpdateMedicine={handleUpdateMedicine}
          />
        );
      case "add-medicine":
        return (
          <AddMedicineForm 
            onBack={() => setCurrentView("inventory")}
            categories={categories}
            onAddMedicine={handleAddMedicine}
          />
        );
      case "dispense-medicine":
        return (
          <DispenseMedicineForm 
            onBack={() => setCurrentView("inventory")}
            medicines={medicines}
            onDispense={handleDispenseMedicine}
          />
        );
      case "categories":
        return (
          <CategoryManager 
            onBack={() => setCurrentView("inventory")}
            categories={categories}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        );
      case "reports":
        return <Reports medicines={medicines} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row">
        <Navigation activeTab={currentView} onTabChange={setCurrentView} />
        
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;