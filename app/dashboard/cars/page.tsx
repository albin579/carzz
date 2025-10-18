"use client"

import { useState, useEffect, useCallback } from 'react';
import { Car, CheckCircle, DollarSign, Pencil, Trash } from 'lucide-react';
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
import { AddCarForm } from '@/components/add-car-form';
import { EditCarForm } from '@/components/edit-car-form';
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

interface Car {
  car_id: number;
  make: string;
  model: string;
  year: number;
  price: string;
  vin: string;
  status: string;
}

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [carToDelete, setCarToDelete] = useState<Car | null>(null);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cars`, {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to fetch cars');
      const data = await response.json();
      setCars(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleEdit = (car: Car) => {
    setSelectedCar(car);
    setIsEditModalOpen(true);
  };

  const handleDelete = (car: Car) => {
    setCarToDelete(car);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!carToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/cars/${carToDelete.car_id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token! },
      });
      fetchCars(); // Refresh list
    } catch (error) {
      console.error('Failed to delete car', error);
    }
    setIsDeleteDialogOpen(false);
    setCarToDelete(null);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Car Inventory</h1>
        <p className="text-neutral-600">Manage your vehicle inventory</p>
      </header>

      <div className="mb-6 flex gap-4">
        <Input type="text" placeholder="Search cars by make, model, or VIN..." className="flex-1" />
        <Button onClick={() => setIsAddModalOpen(true)}>Add New Car</Button>
      </div>

      <AddCarForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCarAdded={fetchCars} />
      <EditCarForm car={selectedCar} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onCarUpdated={fetchCars} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the car from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Total Cars</h3>
            <Car className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{cars.length}</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Available</h3>
            <CheckCircle className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{cars.filter(c => c.status === 'Available').length}</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Sold</h3>
            <DollarSign className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{cars.filter(c => c.status === 'Sold').length}</div>
        </div>
      </div>

      {/* Cars Table */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 text-center">Loading cars...</div>
        ) : cars.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Make</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>VIN</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.car_id}>
                  <TableCell>{car.make}</TableCell>
                  <TableCell>{car.model}</TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>${car.price}</TableCell>
                  <TableCell>{car.vin}</TableCell>
                  <TableCell>{car.status}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(car)} className="mr-2">
                      <Pencil className="size-4 text-neutral-800" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(car)}>
                      <Trash className="size-4 text-neutral-800" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-neutral-600">No cars found.</div>
        )}
      </div>
    </div>
  );
}
