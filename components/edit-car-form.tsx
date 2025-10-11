"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Car {
  car_id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  vin: string;
  status: string;
}

interface EditCarFormProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
  onCarUpdated: () => void;
}

export function EditCarForm({ car, isOpen, onClose, onCarUpdated }: EditCarFormProps) {
  const [formData, setFormData] = useState({ make: '', model: '', year: '', price: '', vin: '', status: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make,
        model: car.model,
        year: String(car.year),
        price: car.price,
        vin: car.vin,
        status: car.status,
      });
    }
  }, [car]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!car) return;

    setIsLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/cars/${car.car_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update car');
      }

      onCarUpdated();
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
          <DialogTitle>Edit Car</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 py-4">
            {/* Form fields are the same as AddCarForm, pre-filled with data */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="make" className="text-right">Make</Label>
              <Input id="make" name="make" value={formData.make} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model" className="text-right">Model</Label>
              <Input id="model" name="model" value={formData.model} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">Year</Label>
              <Input id="year" name="year" type="number" value={formData.year} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">Price</Label>
              <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="vin" className="text-right">VIN</Label>
              <Input id="vin" name="vin" value={formData.vin} onChange={handleChange} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <Input id="status" name="status" value={formData.status} onChange={handleChange} className="col-span-3" required />
            </div>
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
