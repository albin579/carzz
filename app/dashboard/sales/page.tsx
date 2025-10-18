"use client"

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Car, LineChart, Clock, Pencil, Trash } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { AddSaleForm } from '@/components/add-sale-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { API_URL } from '@/lib/api';

interface Sale {
  sale_id: number;
  make: string;
  model: string;
  customer_name: string;
  salesperson_name: string;
  sale_date: string;
  sale_price: string;
  car_id: number;
  customer_id: number;
  salesperson_id: number;
}

interface Salesperson {
  salesperson_id: number;
  name: string;
  email: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [saleForPriceEdit, setSaleForPriceEdit] = useState<Sale | null>(null);
  const [newPrice, setNewPrice] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState<Sale | null>(null);

  const totalSales = sales.reduce((acc, sale) => acc + parseFloat(sale.sale_price), 0);
  const carsSold = sales.length;
  const avgSalePrice = carsSold > 0 ? totalSales / carsSold : 0;

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const [salesRes, salespersonsRes] = await Promise.all([
        fetch(`${API_URL}/api/sales`, { headers: { 'x-auth-token': token } }),
        fetch(`${API_URL}/api/salespersons`, { headers: { 'x-auth-token': token } })
      ]);

      if (!salesRes.ok || !salespersonsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const salesData = await salesRes.json();
      const salespersonsData = await salespersonsRes.json();

      setSales(salesData);
      setSalespersons(salespersonsData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const handleDelete = (sale: Sale) => {
    setSaleToDelete(sale);
    setIsDeleteDialogOpen(true);
  };

  const handlePriceEdit = (sale: Sale) => {
    setSaleForPriceEdit(sale);
    setNewPrice(sale.sale_price);
    setIsPriceModalOpen(true);
  };

  const confirmPriceUpdate = async () => {
    if (!saleForPriceEdit) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/sales/${saleForPriceEdit.sale_id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token!
        },
        body: JSON.stringify({ sale_price: newPrice }),
      });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to update sale price', error);
    }
    setIsPriceModalOpen(false);
    setSaleForPriceEdit(null);
    setNewPrice('');
  };

  const confirmDelete = async () => {
    if (!saleToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/sales/${saleToDelete.sale_id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token! },
      });
      fetchData(); // Refresh list
    } catch (error) {
      console.error('Failed to delete sale', error);
    }
    setIsDeleteDialogOpen(false);
    setSaleToDelete(null);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Sales Management</h1>
        <p className="text-neutral-600">Track and manage vehicle sales</p>
      </header>

      {/* Search and Actions */}
      <div className="mb-6 flex gap-4">
        <Input type="text" placeholder="Search sales by customer, car, or sale ID..." className="flex-1" />
        <Button onClick={() => setIsSaleModalOpen(true)}>New Sale</Button>
      </div>

      <AddSaleForm isOpen={isSaleModalOpen} onClose={() => setIsSaleModalOpen(false)} onSaleAdded={fetchData} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the sale.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Price Edit Modal */}
      <AlertDialog open={isPriceModalOpen} onOpenChange={setIsPriceModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Sale Price</AlertDialogTitle>
            <AlertDialogDescription>
              Update the sale price for {saleForPriceEdit?.make} {saleForPriceEdit?.model} sold to {saleForPriceEdit?.customer_name}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              type="number"
              step="0.01"
              placeholder="Enter new price"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsPriceModalOpen(false);
              setSaleForPriceEdit(null);
              setNewPrice('');
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPriceUpdate}>Update Price</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Total Sales</h3>
            <DollarSign className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">${(totalSales / 1000000).toFixed(1)}M</div>
          <div className="text-sm font-medium text-neutral-900">+8% this month</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Cars Sold</h3>
            <Car className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{carsSold}</div>
          <div className="text-sm font-medium text-neutral-900">+12 this month</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Avg Sale Price</h3>
            <LineChart className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{avgSalePrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
          <div className="text-sm font-medium text-neutral-600">-2% this month</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Pending Sales</h3>
            <Clock className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">8</div>
          <div className="text-sm font-medium text-neutral-600">Awaiting completion</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sales Table (Main Column) */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">Recent Sales</h2>
            {isLoading ? (
              <div className="p-6 text-center">Loading sales...</div>
            ) : sales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Salesperson</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.sale_id}>
                      <TableCell>{sale.make} {sale.model}</TableCell>
                      <TableCell>{sale.customer_name}</TableCell>
                      <TableCell>{sale.salesperson_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>${sale.sale_price}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handlePriceEdit(sale)}
                            className="h-6 w-6 p-0"
                          >
                            <Pencil className="size-3 text-neutral-600" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(sale)}>
                          <Trash className="size-4 text-neutral-800" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-neutral-600">No sales found.</div>
            )}
          </div>
        </div>

        {/* Salespersons Table (Side Column) */}
        <div>
          <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold text-neutral-900">Sales Team</h2>
            {isLoading ? (
              <div className="p-6 text-center">Loading team...</div>
            ) : salespersons.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salespersons.map((sp) => (
                    <TableRow key={sp.salesperson_id}>
                      <TableCell>{sp.name}</TableCell>
                      <TableCell>{sp.email}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-neutral-600">No salespersons found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
