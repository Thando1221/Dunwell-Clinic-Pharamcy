import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddMedicineFormProps {
  onBack: () => void;
}

const AddMedicineForm = ({ onBack }: AddMedicineFormProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    Medication_Name: "",
    MedCategory_ID: "",
    Current_Stock: "",
    Minimum_Stock: "",
    Expiry_Date: "",
    Batch_No: "",
    Supplier: "",
    Description: ""
  });

  const [categories, setCategories] = useState<any[]>([]);

  // Fetch categories from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/category")
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch((err) => {
        console.error("Error fetching categories:", err);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive"
        });
      });
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.Medication_Name || !formData.MedCategory_ID || !formData.Current_Stock || !formData.Expiry_Date) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/medicine/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Medication_Name: formData.Medication_Name,
          MedCategory_ID: parseInt(formData.MedCategory_ID),
          Current_Stock: parseInt(formData.Current_Stock),
          Minimum_Stock: formData.Minimum_Stock ? parseInt(formData.Minimum_Stock) : null,
          Expiry_Date: formData.Expiry_Date,
          Batch_No: formData.Batch_No,
          Supplier: formData.Supplier,
          Description: formData.Description
        })
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: result.message || "Medicine added successfully",
          variant: "default"
        });

        setFormData({
          Medication_Name: "",
          MedCategory_ID: "",
          Current_Stock: "",
          Minimum_Stock: "",
          Expiry_Date: "",
          Batch_No: "",
          Supplier: "",
          Description: ""
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add medicine",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error("Error submitting medicine:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Add New Medicine</h1>
          <p className="text-muted-foreground">Enter medicine details to add to inventory</p>
        </div>
      </div>

      <Card className="w-full max-w-4xl bg-gradient-to-br from-card to-medical-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-medical-primary" />
            Medicine Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Medication_Name">Medicine Name *</Label>
                <Input
                  id="Medication_Name"
                  name="Medication_Name"
                  value={formData.Medication_Name}
                  onChange={handleInputChange}
                  placeholder="e.g., Paracetamol 500mg"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="MedCategory_ID">Category *</Label>
                <select
                  id="MedCategory_ID"
                  name="MedCategory_ID"
                  value={formData.MedCategory_ID}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.MedCategory_ID} value={cat.MedCategory_ID}>
                      {cat.MedCategory_Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Current_Stock">Current Stock *</Label>
                <Input
                  id="Current_Stock"
                  name="Current_Stock"
                  type="number"
                  value={formData.Current_Stock}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Minimum_Stock">Minimum Stock Level</Label>
                <Input
                  id="Minimum_Stock"
                  name="Minimum_Stock"
                  type="number"
                  value={formData.Minimum_Stock}
                  onChange={handleInputChange}
                  placeholder="e.g., 25"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Expiry_Date">Expiry Date *</Label>
                <Input
                  id="Expiry_Date"
                  name="Expiry_Date"
                  type="date"
                  value={formData.Expiry_Date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="Batch_No">Batch Number</Label>
                <Input
                  id="Batch_No"
                  name="Batch_No"
                  value={formData.Batch_No}
                  onChange={handleInputChange}
                  placeholder="e.g., PCT5001"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="Supplier">Supplier</Label>
              <Input
                id="Supplier"
                name="Supplier"
                value={formData.Supplier}
                onChange={handleInputChange}
                placeholder="e.g., MedCorp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="Description">Description (Optional)</Label>
              <Textarea
                id="Description"
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
                placeholder="Additional notes about the medicine..."
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-medical-primary hover:bg-medical-primary/90 flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Add Medicine
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMedicineForm;
