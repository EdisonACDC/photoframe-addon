import { useQuery } from "@tanstack/react-query";
import { type Order } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function OrdersPage() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: "Copiato!",
        description: "Codice licenza copiato negli appunti",
      });
    } catch (err) {
      toast({
        title: "Errore",
        description: "Impossibile copiare",
        variant: "destructive",
      });
    }
  };

  const totalRevenue = orders?.reduce((sum, order) => sum + parseFloat(order.amount), 0) || 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Vendite PhotoFrame PRO</h1>
        <p className="text-muted-foreground mt-1">
          Gestisci ordini e codici licenza
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Vendite Totali</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ricavo Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Ricavo Netto (77%)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{(totalRevenue * 0.77).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Dopo commissioni Lemon Squeezy 5% + Stripe 3%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ultimi Ordini</CardTitle>
          <CardDescription>
            Codici licenza generati automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Caricamento ordini...
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Codice Licenza</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell className="font-medium" data-testid={`text-date-${order.id}`}>
                        {new Date(order.createdAt).toLocaleDateString("it-IT", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell data-testid={`text-customer-${order.id}`}>
                        {order.customerName || "N/A"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate" data-testid={`text-email-${order.id}`}>
                        {order.customerEmail}
                      </TableCell>
                      <TableCell data-testid={`text-amount-${order.id}`}>
                        {order.currency} {order.amount}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code 
                            className="px-2 py-1 bg-muted rounded text-sm font-mono select-all cursor-text"
                            data-testid={`text-license-${order.id}`}
                          >
                            {order.licenseKey}
                          </code>
                          <button
                            onClick={() => copyToClipboard(order.licenseKey, order.id)}
                            className="p-1 hover:bg-muted rounded"
                            data-testid={`button-copy-license-${order.id}`}
                            title="Copia codice"
                          >
                            {copiedId === order.id ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.emailSent ? "default" : "destructive"}
                          data-testid={`badge-email-${order.id}`}
                        >
                          {order.emailSent ? "✓ Inviata" : "✗ Fallita"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={order.status === "paid" ? "default" : "secondary"}
                          data-testid={`badge-status-${order.id}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nessun ordine ancora</p>
              <p className="text-sm text-muted-foreground mt-2">
                Gli ordini da Lemon Squeezy appariranno qui automaticamente
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Come Funziona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            1. Cliente acquista su Lemon Squeezy (€5,50+)
          </p>
          <p className="text-sm text-muted-foreground">
            2. Lemon Squeezy invia webhook automaticamente
          </p>
          <p className="text-sm text-muted-foreground">
            3. Sistema genera codice PRO univoco
          </p>
          <p className="text-sm text-muted-foreground">
            4. Email notifica inviata a mariusgrosu8879@gmail.com
          </p>
          <p className="text-sm text-muted-foreground">
            5. Copia il codice e invialo al cliente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
