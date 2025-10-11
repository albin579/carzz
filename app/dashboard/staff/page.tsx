"use client"

import { useState, useEffect, useCallback } from 'react';
import { Users, Pencil, Trash } from 'lucide-react';
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
import { AddSalespersonForm } from '@/components/add-salesperson-form';
import { EditSalespersonForm } from '@/components/edit-salesperson-form';
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

interface Salesperson {
  salesperson_id: number;
  name: string;
  email: string;
  phone?: string;
}

export default function StaffPage() {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSalesperson, setSelectedSalesperson] = useState<Salesperson | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [salespersonToDelete, setSalespersonToDelete] = useState<Salesperson | null>(null);

  const fetchSalespersons = useCallback(async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/salespersons', {
        headers: { 'x-auth-token': token },
      });
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setSalespersons(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalespersons();
  }, [fetchSalespersons]);

  const handleEdit = (salesperson: Salesperson) => {
    setSelectedSalesperson(salesperson);
    setIsEditModalOpen(true);
  };

  const handleDelete = (salesperson: Salesperson) => {
    setSalespersonToDelete(salesperson);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!salespersonToDelete) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`http://localhost:3001/api/salespersons/${salespersonToDelete.salesperson_id}`, {
        method: 'DELETE',
        headers: { 'x-auth-token': token! },
      });
      fetchSalespersons(); // Refresh list
    } catch (error) {
      console.error('Failed to delete salesperson', error);
    }
    setIsDeleteDialogOpen(false);
    setSalespersonToDelete(null);
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Staff Management</h1>
        <p className="text-neutral-600">Manage sales team and personnel</p>
      </header>

      <div className="mb-6 flex gap-4">
        <Input type="text" placeholder="Search staff by name..." className="flex-1" />
        <Button onClick={() => setIsAddModalOpen(true)}>Add New Staff</Button>
      </div>

      <AddSalespersonForm isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSalespersonAdded={fetchSalespersons} />
      <EditSalespersonForm salesperson={selectedSalesperson} isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onSalespersonUpdated={fetchSalespersons} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the staff member.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Stats Grid - Can be made dynamic later */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Total Staff</h3>
            <Users className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{salespersons.length}</div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Sales Personnel</h2>
        {isLoading ? (
          <div className="p-6 text-center">Loading staff...</div>
        ) : salespersons.length > 0 ? (
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
              {salespersons.map((sp) => (
                <TableRow key={sp.salesperson_id}>
                  <TableCell>{sp.name}</TableCell>
                  <TableCell>{sp.email}</TableCell>
                  <TableCell>{sp.phone || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(sp)} className="mr-2">
                      <Pencil className="size-4 text-neutral-800" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(sp)}>
                      <Trash className="size-4 text-neutral-800" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="p-6 text-center text-neutral-600">No staff found.</div>
        )}
      </div>
    </div>
  );
}
