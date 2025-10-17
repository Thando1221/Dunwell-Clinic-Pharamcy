import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Package, AlertTriangle, Activity, Clock } from "lucide-react";

function Dashboard() {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStock: 0,
    expiringSoon: 0,
  });
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [expiringSoon, setExpiringSoon] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const API_BASE = import.meta.env.VITE_API_URL;

  // Fetch main dashboard stats once
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsRes = await fetch(`${API_BASE}/dashboard`);
        setStats(await statsRes.json());
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, []);

  // Fetch Alerts + Recent Activity every 10 minutes
  useEffect(() => {
    const fetchAlertsAndActivity = async () => {
      try {
        const [stockRes, expRes, activityRes] = await Promise.all([
          fetch(`${API_BASE}/dashboard/stock-alerts`),
          fetch(`${API_BASE}/dashboard/expiring-soon`),
          fetch(`${API_BASE}/dashboard/recent-activity`),
        ]);

        const stockData = await stockRes.json();
        const expData = await expRes.json();
        const activityData: any[] = await activityRes.json();

        // Filter recent activity to today
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const todayActivity = activityData.filter(
          (act) => new Date(act.date) >= startOfDay && new Date(act.date) < endOfDay
        );

        setStockAlerts(stockData);
        setExpiringSoon(expData);
        setRecentActivity(todayActivity);
      } catch (err) {
        console.error("Error fetching alerts and activity:", err);
      }
    };

    fetchAlertsAndActivity(); // initial fetch
    const interval = setInterval(fetchAlertsAndActivity, 600000); // 10 min
    return () => clearInterval(interval);
  }, []);

  const cards = [
    {
      title: "Total Medications",
      value: stats.totalMedicines,
      icon: Package,
      description: "in inventory",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStock,
      icon: AlertTriangle,
      description: "needs restock",
    },
    {
      title: "Expiring Soon",
      value: stats.expiringSoon,
      icon: Activity,
      description: "next 30 days",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Pharmacy inventory overview (Live Data)
          </p>
        </div>
        <Badge variant="secondary" className="bg-medical-primary text-white">
          Live Status
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {cards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx} className="transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-5 w-5 text-medical-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Section */}
        <Card className="bg-gradient-to-br from-card to-medical-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-medical-warning" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="stock" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="stock">
                  Low Stock ({stockAlerts.length})
                </TabsTrigger>
                <TabsTrigger value="expiry">
                  Expiring Soon ({expiringSoon.length})
                </TabsTrigger>
              </TabsList>

              {/* Low Stock */}
              <TabsContent value="stock" className="space-y-3 mt-3 max-h-60 overflow-y-auto">
                {stockAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ✅ No low stock items
                  </p>
                ) : (
                  stockAlerts.slice(0, 3).map((item) => (
                    <div
                      key={item.Medication_ID}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                    >
                      <div>
                        <p className="font-medium">{item.Medication_Name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.Current_Stock} units (min {item.Minimum_Stock})
                        </p>
                      </div>
                      <Badge variant="destructive">Low</Badge>
                    </div>
                  ))
                )}
              </TabsContent>

              {/* Expiring Soon */}
              <TabsContent value="expiry" className="space-y-3 mt-3 max-h-60 overflow-y-auto">
                {expiringSoon.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    ✅ No upcoming expiries
                  </p>
                ) : (
                  expiringSoon.slice(0, 3).map((item) => (
                    <div
                      key={item.Medication_ID}
                      className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                    >
                      <div>
                        <p className="font-medium">{item.Medication_Name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expires {new Date(item.Expiry_Date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-medical-danger text-white flex items-center gap-1"
                      >
                        <Clock className="w-3 h-3" /> Soon
                      </Badge>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gradient-to-br from-card to-medical-secondary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-medical-secondary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-60 overflow-y-auto">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No activity today
              </p>
            ) : (
              recentActivity.slice(0, 3).map((act, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-background/50"
                >
                  <div>
                    <p className="font-medium">{act.action}</p>
                    <p className="text-sm text-muted-foreground">{act.details}</p>
                    {act.supplier && (
                      <p className="text-xs text-muted-foreground">
                        Supplier: {act.supplier}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(act.date).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
