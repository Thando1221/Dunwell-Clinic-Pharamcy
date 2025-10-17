import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Tag, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Category {
  MedCategory_ID: number;
  MedCategory_Name: string;
}

interface CategoryManagerProps {
  onBack: () => void;
}

const CategoryManager = ({ onBack }: CategoryManagerProps) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL; // ✅ use live backend

  // Load categories from backend
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/category`);
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/category/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ MedCategory_Name: newCategory.trim() }),
      });

      const result = await res.json();
      if (res.ok) {
        toast({
          title: "Category Added",
          description: `${newCategory} has been added`,
          variant: "default",
        });
        setNewCategory("");
        fetchCategories();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add category",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error adding category:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number, name: string) => {
    try {
      const res = await fetch(`${API_BASE}/category/delete/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();

      if (res.ok) {
        toast({
          title: "Category Deleted",
          description: `${name} has been removed`,
          variant: "default",
        });
        fetchCategories();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete category",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error deleting category:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Category Manager</h1>
          <p className="text-muted-foreground">Manage medicine categories</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-card to-medical-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-medical-primary" />
              Add New Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category Name</Label>
                <Input
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g., Pain Relievers"
                />
              </div>
              <Button
                type="submit"
                className="bg-medical-primary hover:bg-medical-primary/90 w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-medical-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-medical-secondary" />
              Existing Categories ({categories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No categories available
                </p>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.MedCategory_ID}
                    className="flex items-center justify-between p-3 border rounded-lg bg-background/50"
                  >
                    <Badge variant="outline" className="text-sm">
                      {cat.MedCategory_Name}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(cat.MedCategory_ID, cat.MedCategory_Name)}
                      className="text-medical-danger hover:text-medical-danger hover:bg-medical-danger/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoryManager;
