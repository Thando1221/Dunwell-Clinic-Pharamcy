import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, Package2, UserCheck, Settings } from "lucide-react";

interface Medicine {
  Medication_ID: number;
  Medication_Name: string;
  MedCategory_Name: string;
  Current_Stock: number;
  Minimum_Stock: number;
  Expiry_Date: string;
  Batch_No: string;
  Supplier: string;
}

const InventoryList = ({
  onAddMedicine,
  onDispenseMedicine,
  onManageCategories,
  onUpdateMedicine,
}: {
  onAddMedicine: () => void;
  onDispenseMedicine: () => void;
  onManageCategories: () => void;
  onUpdateMedicine: (medicine: Medicine) => void;
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const API_BASE = import.meta.env.VITE_API_URL; // ✅ use live backend

  // Fetch medicines + categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [medRes, catRes] = await Promise.all([
          axios.get(`${API_BASE}/medicine`),
          axios.get(`${API_BASE}/category`),
        ]);

        setMedicines(medRes.data);
        setCategories(catRes.data.map((c: any) => c.MedCategory_Name));
      } catch (err) {
        console.error("❌ Failed to fetch inventory data:", err);
      }
    };

    fetchData();
  }, []);

  const allCategories = ["all", ...categories];

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.Medication_Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.Batch_No.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || medicine.MedCategory_Name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: "Out of Stock", variant: "destructive" as const };
    if (stock <= minStock * 0.5) return { status: "Critical", variant: "destructive" as const };
    if (stock <= minStock) return { status: "Low Stock", variant: "secondary" as const };
    return { status: "In Stock", variant: "default" as const };
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground">Manage your pharmacy stock</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            onClick={onDispenseMedicine}
            variant="outline"
            className="border-medical-secondary text-medical-secondary hover:bg-medical-secondary/10 w-full sm:w-auto"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Dispense
          </Button>
          <Button onClick={onManageCategories} variant="outline" className="w-full sm:w-auto">
            <Settings className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button
            onClick={onAddMedicine}
            className="bg-medical-primary hover:bg-medical-primary/90 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Medicine
          </Button>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search medicines or batch numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            {allCategories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All Categories" : category}
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Medicines Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filteredMedicines.map((medicine) => {
          const stockStatus = getStockStatus(medicine.Current_Stock, medicine.Minimum_Stock);
          const expiringSoon = isExpiringSoon(medicine.Expiry_Date);

          return (
            <Card
              key={medicine.Medication_ID}
              className="transition-all hover:shadow-lg bg-gradient-to-br from-card to-medical-primary/5"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Package2 className="h-5 w-5 text-medical-primary" />
                    <CardTitle className="text-lg">{medicine.Medication_Name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {medicine.MedCategory_Name}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Stock Level</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{medicine.Current_Stock} units</span>
                    <Badge variant={stockStatus.variant} className="text-xs">
                      {stockStatus.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Batch #</span>
                  <span className="font-medium">{medicine.Batch_No}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Expiry Date</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-medium ${expiringSoon ? "text-medical-danger" : ""}`}>
                      {new Date(medicine.Expiry_Date).toLocaleDateString()}
                    </span>
                    {expiringSoon && (
                      <Badge variant="destructive" className="text-xs">
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">Supplier</span>
                  <span className="text-sm font-medium">{medicine.Supplier}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredMedicines.length === 0 && (
        <div className="text-center py-12">
          <Package2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No medicines found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default InventoryList;
