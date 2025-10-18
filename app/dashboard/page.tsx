"use client"

import { useState, useEffect } from 'react';
import { Car, DollarSign, Users, UserCircle, BadgeDollarSign } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_cars: 0,
    total_sales: 0,
    active_staff: 0,
    total_customers: 0,
  });
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const [statsRes, salesRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard-stats`, { headers: { 'x-auth-token': token } }),
          fetch(`${API_URL}/api/sales`, { headers: { 'x-auth-token': token } }),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (salesRes.ok) {
          const salesData = await salesRes.json();
          setRecentSales(salesData.slice(0, 3));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard Overview</h1>
        <p className="text-neutral-600">Welcome to your car management system</p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Total Cars</h3>
            <Car className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{stats.total_cars}</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Total Sales</h3>
            <DollarSign className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">${stats.total_sales.toLocaleString()}</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Active Staff</h3>
            <Users className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{stats.active_staff}</div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium uppercase tracking-wide text-neutral-600">Customers</h3>
            <UserCircle className="size-8 text-neutral-800" />
          </div>
          <div className="mb-2 text-3xl font-bold text-neutral-900">{stats.total_customers}</div>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Recent Sales</h2>
        <div className="flex flex-col gap-4">
          {recentSales.map((sale: any) => (
            <div key={sale.sale_id} className="flex items-center gap-4 rounded-md border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-2xl"><BadgeDollarSign className="size-8 text-neutral-800" /></div>
              <div className="flex-1">
                <div className="font-medium text-neutral-900">Sale completed - {sale.make} {sale.model}</div>
                <div className="text-sm text-neutral-600">Sold by {sale.salesperson_name} to {sale.customer_name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
