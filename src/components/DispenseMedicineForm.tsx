import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserCheck, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Medicine {
  Medication_ID: number;
  Medication_Name: string;
  Current_Stock: number;
}

interface Nurse {
  UserID: number;
  Name: string;
  Surname: string;
}

interface DispenseMedicineFormProps {
  onBack: () => void;
}

const DispenseMedicineForm = ({ onBack }: DispenseMedicineFormProps) => {
  const { toast } = useToast();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [formData, setFormData] = useState({
    medicineId: "",
    quantity: "",
    nurseId: "",
    notes: ""
  });

  // Fetch medicines + nurses on mount
  useEffect(() => {
    fetchMedicines();
    fetchNurses();
  }, []);

  const fetchMedicines = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/medicine"); // ✅ correct route
      const data = await res.json();
      setMedicines(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not load medicines",
        variant: "destructive"
      });
    }
  };

  const fetchNurses = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dispense/nurses"); // ✅ fixed route
      const data = await res.json();
      setNurses(data);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Could not load nurses",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.medicineId || !formData.quantity || !formData.nurseId) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const selectedMedicine = medicines.find(m => m.Medication_ID.toString() === formData.medicineId);
    const quantity = parseInt(formData.quantity);

    if (quantity > (selectedMedicine?.Current_Stock || 0)) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedMedicine?.Current_Stock} units available`,
        variant: "destructive"
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/dispense", { // ✅ fixed route
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Medication_ID: formData.medicineId,
          NurseID: formData.nurseId, // ✅ correct key for backend
          Quantity: quantity,
          Notes: formData.notes
        })
      });

      if (res.ok) {
        toast({
          title: "Medicine Dispensed",
          description: `${quantity} units of ${selectedMedicine?.Medication_Name} dispensed successfully`,
          variant: "default"
        });

        setFormData({
          medicineId: "",
          quantity: "",
          nurseId: "",
          notes: ""
        });

        fetchMedicines(); // refresh stock
      } else {
        const error = await res.json();
        toast({
          title: "Error",
          description: error.message || "Failed to dispense medicine",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const selectedMedicine = medicines.find(m => m.Medication_ID.toString() === formData.medicineId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dispense Medicine</h1>
          <p className="text-muted-foreground">Dispense medicine to nursing staff</p>
        </div>
      </div>

      <Card className="w-full max-w-4xl bg-gradient-to-br from-card to-medical-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-medical-primary" />
            Dispensing Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medicine Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicineId">Select Medicine *</Label>
                <select
                  id="medicineId"
                  name="medicineId"
                  value={formData.medicineId}
                  onChange={handleInputChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Choose medicine</option>
                  {medicines.map(med => (
                    <option key={med.Medication_ID} value={med.Medication_ID}>
                      {med.Medication_Name} (Stock: {med.Current_Stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="Enter quantity"
                  max={selectedMedicine?.Current_Stock || 0}
                  required
                />
                {selectedMedicine && (
                  <p className="text-sm text-muted-foreground">
                    Available: {selectedMedicine.Current_Stock} units
                  </p>
                )}
              </div>
            </div>

            {/* Nurse Selection */}
            <div className="space-y-2">
              <Label htmlFor="nurseId">Select Nurse *</Label>
              <select
                id="nurseId"
                name="nurseId"
                value={formData.nurseId}
                onChange={handleInputChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Choose nurse</option>
                {nurses.map(n => (
                  <option key={n.UserID} value={n.UserID}>
                    {n.Name} {n.Surname}
                  </option>
                ))}
              </select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about dispensing..."
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="bg-medical-primary hover:bg-medical-primary/90 flex-1">
                <Package className="h-4 w-4 mr-2" />
                Dispense Medicine
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

export default DispenseMedicineForm;
