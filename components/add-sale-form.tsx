"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { API_URL } from '@/lib/api';

interface AddSaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSaleAdded: () => void;
}

interface Car {
  car_id: number;
  make: string;
  model: string;
  status: string;
}

interface Customer {
  customer_id: number;
  name: string;
}

interface Salesperson {
  salesperson_id: number;
  name: string;
}

export function AddSaleForm({ isOpen, onClose, onSaleAdded }: AddSaleFormProps) {
  const [cars, setCars] = useState<Car[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [formData, setFormData] = useState({ car_id: '', customer_id: '', salesperson_id: '', sale_price: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const [carsRes, customersRes, salespersonsRes] = await Promise.all([
          fetch(`${API_URL}/api/cars`, { headers: { 'x-auth-token': token } }),
          fetch(`${API_URL}/api/customers`, { headers: { 'x-auth-token': token } }),
          fetch(`${API_URL}/api/salespersons`, { headers: { 'x-auth-token': token } })
        ]);

        const carsData = await carsRes.json();
        const customersData = await customersRes.json();
        const salespersonsData = await salespersonsRes.json();

        setCars(carsData.filter((car: Car) => car.status === 'Available'));
        setCustomers(customersData);
        setSalespersons(salespersonsData);
      } catch (error) {
        console.error('Failed to fetch data for form', error);
      }
    };
    fetchData();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to record a sale.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to record sale');
      }

      onSaleAdded();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record New Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="car_id" className="text-right">Car</Label>
              <Select name="car_id" onValueChange={(value) => setFormData(prev => ({...prev, car_id: value}))} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a car" />
                </SelectTrigger>
                <SelectContent>
                  {cars.map(car => <SelectItem key={car.car_id} value={String(car.car_id)}>{car.make} {car.model}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer_id" className="text-right">Customer</Label>
              <Select name="customer_id" onValueChange={(value) => setFormData(prev => ({...prev, customer_id: value}))} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(c => <SelectItem key={c.customer_id} value={String(c.customer_id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salesperson_id" className="text-right">Salesperson</Label>
              <Select name="salesperson_id" onValueChange={(value) => setFormData(prev => ({...prev, salesperson_id: value}))} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a salesperson" />
                </SelectTrigger>
                <SelectContent>
                  {salespersons.map(sp => <SelectItem key={sp.salesperson_id} value={String(sp.salesperson_id)}>{sp.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sale_price" className="text-right">Sale Price</Label>
              <input id="sale_price" name="sale_price" type="number" value={formData.sale_price} onChange={(e) => setFormData(prev => ({...prev, sale_price: e.target.value}))} className="col-span-3" required />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Recording...' : 'Record Sale'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
