"use client"

import { useState, useEffect, useCallback } from 'react';
import { UserCircle, Pencil, Trash } from 'lucide-react';
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
import { AddCustomerForm } from '@/components/add-customer-form';
import { EditCustomerForm } from '@/components/edit-customer-form';
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

interface Customer {
  customer_id: number;
  name: string;
  email: string;
  phone: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/customers', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDelete = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!customerToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:3001/api/customers/${customerToDelete.customer_id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token! },
      });
      fetchCustomers(); // Refresh list
    } catch (error) {
      console.error('Failed to delete customer', error);
    }
    setIsDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Customer Management</h1>
        <p className="text-neutral-600">Manage customer relationships and data</p>
      </header>

      <div className="mb-6 flex gap-4">
        <Input type="text" placeholder="Search customers by name, email, or phone..." className="flex-1" />
        <Button onClick={() => setIsAddModalOpen(true)}>Add New Customer</Button>
      </div>

      <AddCustomerForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onCustomerAdded={fetchCustomers} />
      <EditCustomerForm customer={selectedCustomer} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onCustomerUpdated={fetchCustomers} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the customer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Total Customers</h3>
            <UserCircle className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{customers.length}</div>
        </div>
        {/* Other stats can be made dynamic later */}
      </div>

      {/* Customers Table */}
      <div className="rounded-lg border border-neutral-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="p-6 text-center">Loading customers...</div>
        ) : customers.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.customer_id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(customer)} className="mr-2">
                      <Pencil className="size-4 text-neutral-800" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(customer)}>
                      <Trash className="size-4 text-neutral-800" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-neutral-600">No customers found.</div>
        )}
      </div>
    </div>
  );
}
