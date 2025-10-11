"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Sale {
  sale_id: number;
  car_id: number;
  customer_id: number;
  salesperson_id: number;
  sale_price: string;
}

interface EditSaleFormProps {
  sale: Sale | null;
  isOpen: boolean;
  onClose: () => void;
  onSaleUpdated: () => void;
}

export function EditSaleForm({ sale, isOpen, onClose, onSaleUpdated }: EditSaleFormProps) {
  const [carId, setCarId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [salespersonId, setSalespersonId] = useState('');
  const [salePrice, setSalePrice] = useState('');

  useEffect(() => {
    if (sale) {
      setCarId(sale.car_id.toString());
      setCustomerId(sale.customer_id.toString());
      setSalespersonId(sale.salesperson_id.toString());
      setSalePrice(sale.sale_price);
    }
  }, [sale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale) return;

    const updatedSale = { 
      car_id: parseInt(carId),
      customer_id: parseInt(customerId),
      salesperson_id: parseInt(salespersonId),
      sale_price: salePrice
    };

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/sales/${sale.sale_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token!
        },
        body: JSON.stringify(updatedSale),
      });

      if (response.ok) {
        onSaleUpdated();
        onClose();
      }
    } catch (error) {
      console.error('Failed to update sale', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label>Car ID</label>
            <Input value={carId} onChange={(e) => setCarId(e.target.value)} />
          </div>
          <div>
            <label>Customer ID</label>
            <Input value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          </div>
          <div>
            <label>Salesperson ID</label>
            <Input value={salespersonId} onChange={(e) => setSalespersonId(e.target.value)} />
          </div>
          <div>
            <label>Sale Price</label>
            <Input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
