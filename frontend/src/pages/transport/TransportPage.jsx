import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { transportAPI } from '../../api';
import { Bus, MapPin, User, Plus, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import useAuthStore from '../../store/authStore';

const TransportPage = () => {
  const { user } = useAuthStore();
  const [tab, setTab] = useState('routes');
  const isAdmin = ['admin', 'principal'].includes(user?.role);

  const { data: routes, isLoading: routesLoading } = useQuery({
    queryKey: ['transport-routes'],
    queryFn: () => transportAPI.routes(),
    select: (r) => r.data.data,
    enabled: tab === 'routes',
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['transport-vehicles'],
    queryFn: () => transportAPI.vehicles(),
    select: (r) => r.data.data,
    enabled: tab === 'vehicles',
  });

  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['transport-drivers'],
    queryFn: () => transportAPI.drivers(),
    select: (r) => r.data.data,
    enabled: tab === 'drivers',
  });

  const tabs = ['routes', 'vehicles', 'drivers'];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transport Management</h1>
          <p className="page-subtitle">Routes, vehicles, and drivers</p>
        </div>
        {isAdmin && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg hover:opacity-90">
            <Plus className="w-4 h-4" /> Add {tab.slice(0, -1).charAt(0).toUpperCase() + tab.slice(1, -1)}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-accent/50 rounded-xl w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors', tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      {/* Routes */}
      {tab === 'routes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {routesLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-64 rounded-xl" />) :
            (routes || []).map((route) => (
              <div key={route._id} className="stat-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl gradient-info flex items-center justify-center text-white">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{route.routeName}</h3>
                    <p className="text-xs text-muted-foreground">Route #{route.routeNumber}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {route.stops?.map((stop, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <div className="flex flex-col items-center">
                        <div className={cn('w-2 h-2 rounded-full', i === 0 ? 'bg-green-500' : i === route.stops.length - 1 ? 'bg-red-500' : 'bg-primary')} />
                        {i < route.stops.length - 1 && <div className="w-0.5 h-3 bg-border" />}
                      </div>
                      <div className="flex-1 flex justify-between">
                        <span className="text-foreground font-medium">{stop.stopName}</span>
                        <span className="text-muted-foreground">{stop.pickupTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {route.vehicle && (
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
                    <Bus className="w-3 h-3" />{route.vehicle.registrationNumber} · {route.vehicle.model}
                  </div>
                )}
              </div>
            ))
          }
          {(!routes || routes.length === 0) && !routesLoading && (
            <div className="col-span-full text-center py-16 text-muted-foreground">
              <Bus className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No routes found</p>
            </div>
          )}
        </div>
      )}

      {/* Vehicles */}
      {tab === 'vehicles' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehiclesLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />) :
            (vehicles || []).map((v) => (
              <div key={v._id} className="stat-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl gradient-warning flex items-center justify-center text-white">
                    <Bus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{v.registrationNumber}</h3>
                    <p className="text-xs text-muted-foreground">{v.make} {v.model}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-accent/50 rounded-lg">
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{v.type}</p>
                  </div>
                  <div className="p-2 bg-accent/50 rounded-lg">
                    <p className="text-muted-foreground">Capacity</p>
                    <p className="font-medium">{v.capacity} seats</p>
                  </div>
                  <div className="p-2 bg-accent/50 rounded-lg">
                    <p className="text-muted-foreground">Fuel</p>
                    <p className="font-medium capitalize">{v.fuelType}</p>
                  </div>
                  <div className="p-2 bg-accent/50 rounded-lg">
                    <p className="text-muted-foreground">Year</p>
                    <p className="font-medium">{v.year}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className={cn('w-2 h-2 rounded-full', v.isActive ? 'bg-green-500' : 'bg-gray-400')} />
                  <span className="text-xs text-muted-foreground">{v.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* Drivers */}
      {tab === 'drivers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {driversLoading ? Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />) :
            (drivers || []).map((d) => (
              <div key={d._id} className="stat-card flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl gradient-purple flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {d.firstName?.[0]}{d.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{d.firstName} {d.lastName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.phone}</p>
                  {d.vehicle && <p className="text-xs text-muted-foreground">Vehicle: {d.vehicle.registrationNumber}</p>}
                  {d.route && <p className="text-xs text-muted-foreground">Route: {d.route.routeName}</p>}
                  <p className="text-xs text-muted-foreground mt-1">Exp: {d.experience} yrs · Lic: {d.licenseNumber}</p>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
};

export default TransportPage;
