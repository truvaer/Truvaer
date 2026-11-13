import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  Globe,
  Sliders,
  DollarSign,
  Layers,
  Wrench,
  Trash2,
  Edit2,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { db } from '../data/mockDatabase';
import { formatDateDDMMYYYY } from '../utils/dateFormat';
import { StoreInventoryItem, StoreItemCondition, StoreItemStatus, AdminUser } from '../types';

interface StoresPortalProps {
  activeAdminUser?: AdminUser | null;
  onRefreshAll?: () => void;
}

export const StoresPortal: React.FC<StoresPortalProps> = ({ activeAdminUser, onRefreshAll }) => {
  const [items, setItems] = useState<StoreInventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Geographic Scoping
  const [selectedZone, setSelectedZone] = useState<string>(
    activeAdminUser?.territory_scope?.zone && activeAdminUser.territory_scope.zone !== 'All Zones'
      ? activeAdminUser.territory_scope.zone
      : 'All Zones'
  );
  const [selectedCountry, setSelectedCountry] = useState<string>(
    activeAdminUser?.territory_scope?.country && activeAdminUser.territory_scope.country !== 'All Countries'
      ? activeAdminUser.territory_scope.country
      : 'All Countries'
  );
  const [selectedTerritory, setSelectedTerritory] = useState<string>(
    activeAdminUser?.territory_scope?.territory && activeAdminUser.territory_scope.territory !== 'All Hubs'
      ? activeAdminUser.territory_scope.territory
      : 'All Hubs'
  );

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StoreInventoryItem | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Permission checks
  const canEdit =
    !activeAdminUser ||
    activeAdminUser.role === 'SUPER_ADMIN' ||
    activeAdminUser.department === 'Stores' ||
    activeAdminUser.module_permissions?.Stores?.access === 'EDIT' ||
    activeAdminUser.module_permissions?.Stores?.access === 'FULL';

  const canDelete =
    !activeAdminUser ||
    activeAdminUser.role === 'SUPER_ADMIN' ||
    activeAdminUser.module_permissions?.Stores?.canDelete === true ||
    activeAdminUser.module_permissions?.Stores?.access === 'FULL';

  const loadData = () => {
    const data = db.getStoreInventory(selectedZone, selectedCountry, selectedTerritory);
    setItems(data);
  };

  useEffect(() => {
    loadData();
  }, [selectedZone, selectedCountry, selectedTerritory]);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleStockChange = (itemId: string, delta: number) => {
    if (!canEdit) {
      showNotice('Access Denied: You have View-only access to Stores.', 'error');
      return;
    }
    const updated = db.updateStoreStock(itemId, delta);
    if (updated) {
      loadData();
      showNotice(`Stock updated for ${updated.part_number}. Current Quantity: ${updated.quantity}`, 'success');
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (!canDelete) {
      showNotice('Access Denied: Delete permission is restricted by Admin Control Panel.', 'error');
      return;
    }
    if (confirm('Are you sure you want to remove this aviation component from inventory?')) {
      const ok = db.deleteStoreInventoryItem(itemId);
      if (ok) {
        loadData();
        showNotice('Part removed from inventory successfully.', 'success');
      }
    }
  };

  const filteredItems = items.filter((it) => {
    const matchesSearch =
      it.part_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.serial_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || it.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPartsCount = items.reduce((acc, it) => acc + it.quantity, 0);
  const lowStockCount = items.filter((it) => it.status === 'LOW_STOCK' || it.status === 'OUT_OF_STOCK').length;
  const totalInventoryValue = items.reduce((acc, it) => acc + it.quantity * it.unit_cost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Airside Stores &amp; Rotables Inventory Hub
              </h2>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                Stores Operations Module
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              Certified rotables, APU turbine modules, avionics clean vault components, and Ground Support Equipment (GSE)
              with real-time stock thresholds and territorial airside isolation.
            </p>
          </div>

          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Aviation Spare</span>
            </button>
          )}
        </div>

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center space-x-2 border transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Geographic Ribbon */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-medium flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>Warehouse Territory Scope:</span>
          </span>

          {/* Zone Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Zone:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="bg-transparent font-semibold text-white outline-none text-[11px] cursor-pointer"
            >
              <option value="All Zones" className="bg-slate-900">All Zones</option>
              <option value="West Zone" className="bg-slate-900">West Zone (BOM)</option>
              <option value="North Zone" className="bg-slate-900">North Zone (DEL)</option>
              <option value="South Zone" className="bg-slate-900">South Zone (BLR)</option>
              <option value="European Hub" className="bg-slate-900">European Hub (MUC)</option>
              <option value="Middle East Hub" className="bg-slate-900">Middle East Hub (DXB)</option>
              <option value="Americas" className="bg-slate-900">Americas (MIA)</option>
            </select>
          </div>

          {/* Country Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-[11px] text-slate-400">Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent font-semibold text-white outline-none text-[11px] cursor-pointer"
            >
              <option value="All Countries" className="bg-slate-900">All Countries</option>
              <option value="IN" className="bg-slate-900">India (IN)</option>
              <option value="AE" className="bg-slate-900">UAE (AE)</option>
              <option value="US" className="bg-slate-900">United States (US)</option>
              <option value="DE" className="bg-slate-900">Germany (DE)</option>
            </select>
          </div>

          {/* Hub Selector */}
          <div className="flex items-center space-x-1 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] text-slate-400">Hangar Hub:</span>
            <select
              value={selectedTerritory}
              onChange={(e) => setSelectedTerritory(e.target.value)}
              className="bg-transparent font-semibold text-white outline-none text-[11px] cursor-pointer"
            >
              <option value="All Hubs" className="bg-slate-900">All Hangar Hubs</option>
              <option value="BOM (Mumbai)" className="bg-slate-900">BOM (Mumbai)</option>
              <option value="DEL (Delhi)" className="bg-slate-900">DEL (Delhi)</option>
              <option value="DXB (Dubai)" className="bg-slate-900">DXB (Dubai)</option>
              <option value="MUC (Munich)" className="bg-slate-900">MUC (Munich)</option>
              <option value="MIA (Miami)" className="bg-slate-900">MIA (Miami)</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <Package className="w-3.5 h-3.5 text-amber-400" />
            <span>Total Certified Components</span>
          </div>
          <div className="text-xl font-black text-white mt-1">{totalPartsCount} Units</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Across {items.length} distinct Part Numbers</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Low Stock Reorder Alerts</span>
          </div>
          <div className="text-xl font-black text-rose-400 mt-1">{lowStockCount} Parts</div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">At or below safety replenishment threshold</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stores Valuation</span>
          </div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            ₹{(totalInventoryValue / 100000).toFixed(1)} Lakhs
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 font-medium">Bonded warehouse inventory value</div>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/70 p-3 rounded-2xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Part Number, Serial #, Component Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 text-white outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400">Status Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs rounded-xl px-3 py-2 text-white outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="LOW_STOCK">Low Stock (Reorder)</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Part Number &amp; Serial #</th>
                <th className="px-4 py-3 font-semibold">Component Name / Category</th>
                <th className="px-4 py-3 font-semibold">Warehouse / Hangar Location</th>
                <th className="px-4 py-3 font-semibold">Condition</th>
                <th className="px-4 py-3 font-semibold">Stock Qty</th>
                <th className="px-4 py-3 font-semibold">Unit Cost</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-white text-xs">{item.part_number}</div>
                    <div className="text-[11px] text-amber-400 font-mono">{item.serial_number}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Territory: {item.territory}</div>
                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <div className="font-semibold text-white truncate">{item.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.category}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-200 font-medium">{item.warehouse_hangar}</div>
                    <div className="text-[10px] text-slate-400">{item.zone}</div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {item.condition}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">Insp: {formatDateDDMMYYYY(item.last_inspected)}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-black text-sm text-white">{item.quantity}</span>
                      <span className="text-[10px] text-slate-400 font-mono">/ Min {item.min_threshold}</span>
                    </div>
                    {canEdit && (
                      <div className="flex items-center space-x-1 mt-1">
                        <button
                          onClick={() => handleStockChange(item.id, -1)}
                          disabled={item.quantity <= 0}
                          className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center font-bold text-xs disabled:opacity-30 cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          onClick={() => handleStockChange(item.id, 1)}
                          className="w-5 h-5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded flex items-center justify-center font-bold text-xs cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 font-mono font-bold text-slate-200">
                    ₹{item.unit_cost.toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        item.status === 'IN_STOCK'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : item.status === 'LOW_STOCK'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {canEdit && (
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Edit Component Specs"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="Delete from Inventory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Aviation Spare */}
      {showAddModal && (
        <AddStoreItemModal
          onClose={() => setShowAddModal(false)}
          onSubmit={(newItem) => {
            db.addStoreInventoryItem({
              ...newItem,
              added_by: activeAdminUser?.name || 'Stores Officer',
            });
            loadData();
            setShowAddModal(false);
            showNotice('New aviation spare successfully registered into stores.', 'success');
          }}
        />
      )}

      {/* Modal: Edit Aviation Spare */}
      {editingItem && (
        <EditStoreItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(updates) => {
            db.updateStoreInventoryItem(editingItem.id, updates);
            loadData();
            setEditingItem(null);
            showNotice('Component specifications updated.', 'success');
          }}
        />
      )}
    </div>
  );
};

// ===================================================================
// ADD & EDIT STORE ITEM MODALS
// ===================================================================

const AddStoreItemModal: React.FC<{
  onClose: () => void;
  onSubmit: (item: Partial<StoreInventoryItem>) => void;
}> = ({ onClose, onSubmit }) => {
  const [partNumber, setPartNumber] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StoreInventoryItem['category']>('Turbine Components');
  const [subCategory, setSubCategory] = useState('Rotables & Spares');
  const [warehouse, setWarehouse] = useState('Hangar 4 - Bonded Spares Bay');
  const [quantity, setQuantity] = useState(2);
  const [minThreshold, setMinThreshold] = useState(1);
  const [unitCost, setUnitCost] = useState(500000);
  const [condition, setCondition] = useState<StoreItemCondition>('FACTORY_NEW');
  const [territory, setTerritory] = useState('BOM (Mumbai)');
  const [description, setDescription] = useState('');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center space-x-2">
            <Package className="w-4 h-4 text-amber-400" />
            <span>Register New Aircraft Spare / Rotable</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Part Number (P/N):</label>
              <input
                type="text"
                placeholder="e.g. CFM-BLD-88210"
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Serial Number (S/N):</label>
              <input
                type="text"
                placeholder="e.g. SN-88210-99"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white uppercase outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Component Name:</label>
            <input
              type="text"
              placeholder="e.g. CFM56 Stage 1 High-Pressure Turbine Rotor Blade"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            />
          </div>

          {/* CRITICAL: Category & Sub-Category on SAME LINE */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoreInventoryItem['category'])}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Turbine Components">Turbine Components</option>
                <option value="Avionics Spares">Avionics Spares</option>
                <option value="Airframe Rotables">Airframe Rotables</option>
                <option value="Ground Support Equipment">Ground Support Equipment</option>
                <option value="Cabin Interior Parts">Cabin Interior Parts</option>
                <option value="Consumables & Hardware">Consumables &amp; Hardware</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1">Sub-Category:</label>
              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Rotables & Spares">Rotables &amp; Spares</option>
                <option value="Line Replaceable Units (LRU)">Line Replaceable Units (LRU)</option>
                <option value="Standard Hardware & Fasteners">Standard Hardware &amp; Fasteners</option>
                <option value="Emergency Equipment">Emergency Equipment</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Quantity:</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Min Threshold:</label>
              <input
                type="number"
                min="0"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Unit Cost (INR):</label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Condition:</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as StoreItemCondition)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="FACTORY_NEW">Factory New (FN)</option>
                <option value="SERVICEABLE">Serviceable (SV)</option>
                <option value="OVERHAULED">Overhauled (OH)</option>
                <option value="AS_REMOVED">As Removed (AR)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Hangar Hub:</label>
              <select
                value={territory}
                onChange={(e) => setTerritory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="BOM (Mumbai)">BOM (Mumbai)</option>
                <option value="DEL (Delhi)">DEL (Delhi)</option>
                <option value="DXB (Dubai)">DXB (Dubai)</option>
                <option value="MUC (Munich)">MUC (Munich)</option>
                <option value="MIA (Miami)">MIA (Miami)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Hangar Vault / Bay Location:</label>
            <input
              type="text"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Description &amp; Certifications:</label>
            <textarea
              rows={2}
              placeholder="EASA Form 1 / FAA 8130-3 release certificate details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!partNumber.trim() || !name.trim()) {
                alert('Part Number and Component Name are mandatory.');
                return;
              }
              onSubmit({
                part_number: partNumber,
                serial_number: serialNumber,
                name,
                category,
                warehouse_hangar: warehouse,
                quantity,
                min_threshold: minThreshold,
                unit_cost: unitCost,
                condition,
                territory,
                description,
              });
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            Save to Stores
          </button>
        </div>
      </div>
    </div>
  );
};

const EditStoreItemModal: React.FC<{
  item: StoreInventoryItem;
  onClose: () => void;
  onSubmit: (updates: Partial<StoreInventoryItem>) => void;
}> = ({ item, onClose, onSubmit }) => {
  const [name, setName] = useState(item.name);
  const [warehouse, setWarehouse] = useState(item.warehouse_hangar);
  const [minThreshold, setMinThreshold] = useState(item.min_threshold);
  const [unitCost, setUnitCost] = useState(item.unit_cost);
  const [condition, setCondition] = useState<StoreItemCondition>(item.condition);
  const [description, setDescription] = useState(item.description);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-black text-white flex items-center space-x-2">
            <Edit2 className="w-4 h-4 text-amber-400" />
            <span>Edit Component: {item.part_number}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xs cursor-pointer font-bold">
            ✕
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Component Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Min Alert Threshold:</label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Unit Valuation (INR):</label>
              <input
                type="number"
                value={unitCost}
                onChange={(e) => setUnitCost(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Condition:</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as StoreItemCondition)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="FACTORY_NEW">Factory New (FN)</option>
                <option value="SERVICEABLE">Serviceable (SV)</option>
                <option value="OVERHAULED">Overhauled (OH)</option>
                <option value="AS_REMOVED">As Removed (AR)</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 font-semibold block mb-1">Hangar / Vault Location:</label>
              <input
                type="text"
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Certifications &amp; Notes:</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit({
                name,
                warehouse_hangar: warehouse,
                min_threshold: minThreshold,
                unit_cost: unitCost,
                condition,
                description,
              });
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold shadow cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
