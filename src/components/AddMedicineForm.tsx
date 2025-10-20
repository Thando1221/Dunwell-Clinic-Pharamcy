import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Package, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddMedicineFormProps {
  onBack: () => void;
}

const AddMedicineForm = ({ onBack }: AddMedicineFormProps) => {
  const { toast } = useToast();

  const API_BASE = import.meta.env.VITE_API_URL; // ✅ dynamic backend base URL

  const [formData, setFormData] = useState({
    Medication_ID: "",
    Medication_Name: "",
    MedCategory_ID: "",
    Current_Stock: "",
    Minimum_Stock: "",
    Expiry_Date: "",
    Batch_No: "",
    Supplier: "",
    Description: "",
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch categories
  useEffect(() => {
    fetch(`${API_BASE}/category`)
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        })
      );
  }, [toast, API_BASE]);

  // ✅ Fetch all medicines
  const fetchMedicines = () => {
    fetch(`${API_BASE}/medicine`)
      .then((res) => res.json())
      .then((data) => setMedicines(data))
      .catch(() =>
        toast({
          title: "Error",
          description: "Failed to load medicines",
          variant: "destructive",
        })
      );
  };

  useEffect(() => {
    fetchMedicines();
  }, [API_BASE]);

  // ✅ Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Add or update medicine
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const required = ["Medication_Name", "MedCategory_ID", "Current_Stock", "Expiry_Date"];
    if (required.some((f) => !formData[f as keyof typeof formData])) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const url = isEditing
      ? `${API_BASE}/medicine/${formData.Medication_ID}`
      : `${API_BASE}/medicine/add`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Medication_Name: formData.Medication_Name,
          MedCategory_ID: parseInt(formData.MedCategory_ID),
          Current_Stock: parseInt(formData.Current_Stock),
          Minimum_Stock: formData.Minimum_Stock
            ? parseInt(formData.Minimum_Stock)
            : null,
          Expiry_Date: formData.Expiry_Date,
          Batch_No: formData.Batch_No,
          Supplier: formData.Supplier,
          Description: formData.Description,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Success",
          description: result.message,
        });
        setFormData({
          Medication_ID: "",
          Medication_Name: "",
          MedCategory_ID: "",
          Current_Stock: "",
          Minimum_Stock: "",
          Expiry_Date: "",
          Batch_No: "",
          Supplier: "",
          Description: "",
        });
        setIsEditing(false);
        fetchMedicines();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  // ✅ Edit medicine
  const handleEdit = (medicine: any) => {
    setIsEditing(true);
    setFormData({
      Medication_ID: medicine.Medication_ID,
      Medication_Name: medicine.Medication_Name,
      MedCategory_ID: medicine.MedCategory_ID.toString(),
      Current_Stock: medicine.Current_Stock.toString(),
      Minimum_Stock: medicine.Minimum_Stock?.toString() || "",
      Expiry_Date: medicine.Expiry_Date.split("T")[0],
      Batch_No: medicine.Batch_No || "",
      Supplier: medicine.Supplier || "",
      Description: medicine.Description || "",
    });
  };

  // ✅ Delete medicine
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medicine?")) return;

    try {
      const res = await fetch(`${API_BASE}/medicine/${id}`, {
        method: "DELETE",
      });

      const result = await res.json();
      if (res.ok) {
        toast({ title: "Deleted", description: result.message });
        fetchMedicines();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete medicine",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold">
            {isEditing ? "Edit Medicine" : "Add New Medicine"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing
              ? "Update details of the selected medicine."
              : "Enter medicine details to add to inventory."}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-medical-primary" />
            Medicine Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Medicine Name *</Label>
                <Input
                  name="Medication_Name"
                  value={formData.Medication_Name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Category *</Label>
                <select
                  name="MedCategory_ID"
                  value={formData.MedCategory_ID}
                  onChange={handleInputChange}
                  className="border rounded-md p-2 w-full"
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
              <div>
                <Label>Current Stock *</Label>
                <Input
                  name="Current_Stock"
                  type="number"
                  value={formData.Current_Stock}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Minimum Stock</Label>
                <Input
                  name="Minimum_Stock"
                  type="number"
                  value={formData.Minimum_Stock}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Expiry Date *</Label>
                <Input
                  name="Expiry_Date"
                  type="date"
                  value={formData.Expiry_Date}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label>Batch Number</Label>
                <Input
                  name="Batch_No"
                  value={formData.Batch_No}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <Label>Supplier</Label>
              <Input
                name="Supplier"
                value={formData.Supplier}
                onChange={handleInputChange}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="Description"
                value={formData.Description}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-medical-primary hover:bg-medical-primary/90"
              >
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Update Medicine" : "Add Medicine"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Medicine List */}
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Current Medicines</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-muted text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Stock</th>
                <th className="p-2">Expiry</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m) => (
                <tr key={m.Medication_ID} className="border-t">
                  <td className="p-2">{m.Medication_Name}</td>
                  <td className="p-2">{m.Current_Stock}</td>
                  <td className="p-2">{m.Expiry_Date?.split("T")[0]}</td>
                  <td className="p-2 text-right flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(m)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(m.Medication_ID)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMedicineForm;
