import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Warehouse, Package, TrendingDown, AlertTriangle, Plus, Search, ArrowRightLeft, Settings, Grid3x3, Edit, Trash2, Boxes, Calculator, ArrowDownCircle, ArrowUpCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getStock, adjustStock, getCostPrice, getWarehouseProducts, increaseStock, reduceStock } from '../data/inventory';
import { createInventoryAdjustmentEntry, createInventoryReceiptFromAccountEntry, createInventoryIssueToAccountEntry, addJournalEntry } from '../data/journalEntries';
import { 
  getWarehouses, 
  getBranches, 
  createWarehouse,
  updateWarehouse,
  type Warehouse as WarehouseType, 
  type Branch, 
  type CreateWarehouseRequest,
  getWarehouseStorages,
  createWarehouseStorage,
  updateWarehouseStorage,
  deleteWarehouseStorage,
  getWarehouseStorageShelves,
  createWarehouseStorageShelf,
  updateWarehouseStorageShelf,
  deleteWarehouseStorageShelf,
  type WarehouseStorage,
  type CreateWarehouseStorageRequest,
  type WarehouseStorageShelf as WarehouseStorageShelfType,
  type CreateWarehouseStorageShelfRequest
} from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useLanguage } from '../contexts/LanguageContext';

export function Warehouses() {
  const { t, direction } = useLanguage();

  const [warehouses, setWarehouses] = useState<WarehouseType[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [storages, setStorages] = useState<WarehouseStorage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseType | null>(null);
  const [warehouseFormData, setWarehouseFormData] = useState({
    name_ar: '',
    name_en: '',
    branch_id: '',
    location_ar: '',
    location_en: '',
    capacity: '',
    is_active: true,
    is_default: false,
    notes: ''
  });

  useEffect(() => {
    fetchWarehouses();
    fetchBranches();
  }, []);

  useEffect(() => {
    if (t) {
      setReceiptCreditAccount(t('warehouses.receipt.cash'));
      setIssueDebitAccount(t('warehouses.issue.expenses'));
    }
  }, [t]);

  useEffect(() => {
    if (warehouses.length > 0) {
      fetchAllStorages();
    }
  }, [warehouses]);

  useEffect(() => {
    if (storages.length > 0) {
      fetchAllShelves();
    }
  }, [storages]);

  const fetchWarehouses = async () => {
    setIsLoading(true);
    try {
      const result = await getWarehouses({ per_page: 100 });
      if (result.success) {
        const warehousesData = result.data.warehouses;
        const warehousesList = warehousesData?.data || (Array.isArray(warehousesData) ? warehousesData : []);
        setWarehouses(warehousesList);
      } else {
        toast.error(result.message || 'Failed to load warehouses');
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast.error('An error occurred while loading warehouses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const result = await getBranches({ per_page: 100 });
      if (result.success) {
        const branchesData = result.data.branches;
        const branchesList = branchesData?.data || (Array.isArray(branchesData) ? branchesData : []);
        setBranches(branchesList);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchAllStorages = async () => {
    try {
      const allStorages: WarehouseStorage[] = [];
      for (const warehouse of warehouses) {
        const result = await getWarehouseStorages(warehouse.id);
        if (result.success) {
          allStorages.push(...result.data.storages);
        }
      }
      setStorages(allStorages);
    } catch (error) {
      console.error('Error fetching storages:', error);
    }
  };

  const fetchAllShelves = async () => {
    try {
      const allShelves: Array<WarehouseStorageShelfType & { 
        warehouseId?: number; 
        warehouse?: string; 
        storage?: string;
        used?: number;
        products?: number;
        status?: string;
      }> = [];
      
      for (const storage of storages) {
        const warehouse = warehouses.find(w => w.id === storage.warehouse_id);
        if (!warehouse) continue;

        const result = await getWarehouseStorageShelves(storage.warehouse_id, storage.id);
        if (result.success) {
          const shelvesWithMetadata = result.data.shelves.map(shelf => ({
            ...shelf,
            warehouseId: storage.warehouse_id,
            warehouse: direction === 'rtl' ? warehouse.name_ar : warehouse.name_en,
            storage: direction === 'rtl' ? storage.name_ar : storage.name_en,
            used: 0, // TODO: Calculate from actual product inventory
            products: 0, // TODO: Calculate from actual product inventory
            status: shelf.is_active ? t('warehouses.shelf.active') : t('warehouses.shelf.inactive')
          }));
          allShelves.push(...shelvesWithMetadata);
        }
      }
      setShelves(allShelves);
    } catch (error) {
      console.error('Error fetching shelves:', error);
      toast.error(t('warehouses.messages.shelfLoadError'));
    }
  };

  const [shelves, setShelves] = useState<Array<WarehouseStorageShelfType & { 
    warehouseId?: number; 
    warehouse?: string; 
    storage?: string;
    used?: number;
    products?: number;
    status?: string;
  }>>([]);

  const [isShelfDialogOpen, setIsShelfDialogOpen] = useState(false);
  const [editingShelf, setEditingShelf] = useState<(WarehouseStorageShelfType & { warehouseId?: number; storageId?: number }) | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingShelves, setIsLoadingShelves] = useState(false);
  const [shelfFormData, setShelfFormData] = useState({
    code: '',
    capacity: '',
    level: '',
    is_active: true,
    warehouseId: '',
    storageId: ''
  });

  // Storage management state
  const [isStorageDialogOpen, setIsStorageDialogOpen] = useState(false);
  const [editingStorage, setEditingStorage] = useState<WarehouseStorage | null>(null);
  const [storageFormData, setStorageFormData] = useState({
    name_ar: '',
    name_en: '',
    capacity: '',
    warehouseId: ''
  });
  const [isSubmittingStorage, setIsSubmittingStorage] = useState(false);
  
  // Inventory Adjustment State
  const [adjustmentWarehouse, setAdjustmentWarehouse] = useState<string>('1');
  const [adjustmentProducts, setAdjustmentProducts] = useState<Array<{
    productId: string;
    productName: string;
    recordedQty: number;
    actualQty: number;
    difference: number;
    costPrice: number;
    reason: string;
  }>>([]);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('');

  // Inventory Receipt State
  const [receiptWarehouse, setReceiptWarehouse] = useState<string>('1');
  const [receiptItems, setReceiptItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }>>([]);
  const [receiptCreditAccount, setReceiptCreditAccount] = useState<string>('');
  const [receiptCustomAccount, setReceiptCustomAccount] = useState<string>('');
  const [receiptIncludeTax, setReceiptIncludeTax] = useState<boolean>(false);
  const [receiptDescription, setReceiptDescription] = useState<string>('');

  // Inventory Issue State
  const [issueWarehouse, setIssueWarehouse] = useState<string>('1');
  const [issueItems, setIssueItems] = useState<Array<{
    productId: string;
    productName: string;
    quantity: number;
    costPrice: number;
    totalAmount: number;
  }>>([]);
  const [issueDebitAccount, setIssueDebitAccount] = useState<string>('');
  const [issueCustomAccount, setIssueCustomAccount] = useState<string>('');
  const [issueReason, setIssueReason] = useState<string>('');
  const [issueDescription, setIssueDescription] = useState<string>('');

  const [inventory, setInventory] = useState([
    { id: '1', product: 'كمبيوتر محمول HP', barcode: '1234567890', warehouse: 'المستودع الرئيسي', shelf: 'A-01', quantity: 45, minStock: 10, status: 'متوفر' },
    { id: '2', product: 'طابعة Canon', barcode: '1234567891', warehouse: 'المستودع الرئيسي', shelf: 'A-02', quantity: 8, minStock: 15, status: 'منخفض' },
    { id: '3', product: 'شاشة Samsung 27"', barcode: '1234567892', warehouse: 'مستودع الفرع الشمالي', shelf: 'B-01', quantity: 32, minStock: 10, status: 'متوفر' },
    { id: '4', product: 'لوحة مفاتيح Logitech', barcode: '1234567893', warehouse: 'المستودع الرئيسي', shelf: 'A-03', quantity: 2, minStock: 20, status: 'نفد' }
  ]);

  const [transfers, setTransfers] = useState([
    { id: 'TR-001', date: '2025-01-25', from: 'المستودع الرئيسي', to: 'مستودع الفرع الشمالي', product: 'كمبيوتر محمول HP', quantity: 10, status: 'مكتمل' },
    { id: 'TR-002', date: '2025-01-28', from: 'مستودع الفرع الشمالي', to: 'مستودع الفرع الجنوبي', product: 'طابعة Canon', quantity: 5, status: 'قيد النقل' },
    { id: 'TR-003', date: '2025-01-29', from: 'المستودع الرئيسي', to: 'مستودع الفرع الجنوبي', product: 'شاشة Samsung', quantity: 8, status: 'معلق' }
  ]);

  // Products list for adjustment
  const products = [
    { id: '1', name: 'كمبيوتر محمول HP' },
    { id: '2', name: 'طابعة Canon' },
    { id: '3', name: 'شاشة Samsung 27"' },
    { id: '4', name: 'لوحة مفاتيح Logitech' },
    { id: '5', name: 'ماوس Logitech' },
    { id: '6', name: 'كاميرا ويب HD' }
  ];

  // Storage management handlers
  const handleAddStorage = () => {
    setEditingStorage(null);
    setStorageFormData({
      name_ar: '',
      name_en: '',
      capacity: '',
      warehouseId: ''
    });
    setIsStorageDialogOpen(true);
  };

  const handleEditStorage = (storage: WarehouseStorage) => {
    setEditingStorage(storage);
    setStorageFormData({
      name_ar: storage.name_ar || '',
      name_en: storage.name_en || '',
      capacity: storage.capacity?.toString() || '',
      warehouseId: storage.warehouse_id?.toString() || ''
    });
    setIsStorageDialogOpen(true);
  };

  const handleDeleteStorage = async (storage: WarehouseStorage) => {
    if (!storage.warehouse_id) {
      toast.error(t('warehouses.messages.invalidData'));
      return;
    }

    try {
      const result = await deleteWarehouseStorage(storage.warehouse_id, storage.id);
      
      if (result.success) {
        toast.success(t('warehouses.messages.storageDeleted'));
        await fetchAllStorages();
        await fetchAllShelves();
      } else {
        toast.error(result.message || t('warehouses.messages.error'));
      }
    } catch (error) {
      console.error('Error deleting storage:', error);
      toast.error(t('warehouses.messages.storageDeleteError'));
    }
  };

  const handleSaveStorage = async () => {
    if (!storageFormData.name_ar || !storageFormData.name_en || !storageFormData.capacity || !storageFormData.warehouseId) {
      toast.error(t('warehouses.messages.fillRequired'));
      return;
    }

    const warehouseId = parseInt(storageFormData.warehouseId);
    const storageData: CreateWarehouseStorageRequest = {
      name_ar: storageFormData.name_ar.trim(),
      name_en: storageFormData.name_en.trim(),
      capacity: parseInt(storageFormData.capacity)
    };

    setIsSubmittingStorage(true);
    try {
      if (editingStorage) {
        // Update existing storage
        const result = await updateWarehouseStorage(warehouseId, editingStorage.id, storageData);
        
        if (result.success) {
          toast.success(t('warehouses.messages.storageUpdated'));
          setIsStorageDialogOpen(false);
          setEditingStorage(null);
          await fetchAllStorages();
          await fetchAllShelves();
        } else {
          toast.error(result.message || t('warehouses.messages.error'));
        }
      } else {
        // Create new storage
        const result = await createWarehouseStorage(warehouseId, storageData);
        
        if (result.success) {
          toast.success(t('warehouses.messages.storageCreated'));
          setIsStorageDialogOpen(false);
          setStorageFormData({
            name_ar: '',
            name_en: '',
            capacity: '',
            warehouseId: ''
          });
          await fetchAllStorages();
        } else {
          toast.error(result.message || t('warehouses.messages.error'));
        }
      }
    } catch (error) {
      console.error('Error saving storage:', error);
      toast.error(t('warehouses.messages.storageSaveError'));
    } finally {
      setIsSubmittingStorage(false);
    }
  };

  const handleAddShelf = () => {
    setEditingShelf(null);
    setShelfFormData({
      code: '',
      capacity: '',
      level: '',
      is_active: true,
      warehouseId: '',
      storageId: ''
    });
    setIsShelfDialogOpen(true);
  };

  const handleEditShelf = (shelf: any) => {
    setEditingShelf(shelf);
    const storage = storages.find(s => s.id === shelf.warehouse_storage_id);
    setShelfFormData({
      code: shelf.code || '',
      capacity: shelf.capacity?.toString() || '',
      level: shelf.level !== null && shelf.level !== undefined ? shelf.level.toString() : '',
      is_active: shelf.is_active ?? true,
      warehouseId: shelf.warehouseId?.toString() || (storage?.warehouse_id?.toString() || ''),
      storageId: shelf.warehouse_storage_id?.toString() || ''
    });
    setIsShelfDialogOpen(true);
  };

  const handleDeleteShelf = async (shelf: any) => {
    if (shelf.used && shelf.used > 0) {
      toast.error(t('warehouses.messages.cannotDeleteShelfWithProducts'));
      return;
    }

    if (!shelf.warehouseId || !shelf.warehouse_storage_id) {
      toast.error(t('warehouses.messages.invalidShelf'));
      return;
    }

    try {
      const result = await deleteWarehouseStorageShelf(
        shelf.warehouseId,
        shelf.warehouse_storage_id,
        shelf.id
      );
      
      if (result.success) {
        toast.success(t('warehouses.messages.shelfDeleted'));
        // Refresh storages and shelves
        await fetchAllStorages();
        await fetchAllShelves();
      } else {
        toast.error(result.message || t('warehouses.messages.error'));
      }
    } catch (error) {
      console.error('Error deleting shelf:', error);
      toast.error(t('warehouses.messages.shelfDeleteError'));
    }
  };

  const handleSaveShelf = async () => {
    if (!shelfFormData.code || !shelfFormData.capacity || !shelfFormData.storageId) {
      toast.error(t('warehouses.messages.fillRequired'));
      return;
    }

    const storageId = parseInt(shelfFormData.storageId);
    const storage = storages.find(s => s.id === storageId);
    if (!storage) {
      toast.error(t('warehouses.messages.invalidStorage'));
      return;
    }

    const shelfData: CreateWarehouseStorageShelfRequest = {
      code: shelfFormData.code,
      capacity: parseInt(shelfFormData.capacity),
      level: shelfFormData.level ? parseInt(shelfFormData.level) : null,
      is_active: shelfFormData.is_active
    };

    try {
      if (editingShelf) {
        // Update existing shelf
        const result = await updateWarehouseStorageShelf(
          storage.warehouse_id,
          storageId,
          editingShelf.id,
          shelfData
        );
        
        if (result.success) {
          toast.success(t('warehouses.messages.shelfUpdated'));
          setIsShelfDialogOpen(false);
          setEditingShelf(null);
          await fetchAllStorages();
          await fetchAllShelves();
        } else {
          toast.error(result.message || t('warehouses.messages.shelfSaveError'));
        }
      } else {
        // Create new shelf
        const result = await createWarehouseStorageShelf(
          storage.warehouse_id,
          storageId,
          shelfData
        );
        
        if (result.success) {
          toast.success(t('warehouses.messages.shelfCreated'));
          setIsShelfDialogOpen(false);
          setShelfFormData({
            code: '',
            capacity: '',
            level: '',
            is_active: true,
            warehouseId: '',
            storageId: ''
          });
          await fetchAllStorages();
          await fetchAllShelves();
        } else {
          toast.error(result.message || t('warehouses.messages.error'));
        }
      }
    } catch (error) {
      console.error('Error saving shelf:', error);
      toast.error(t('warehouses.messages.shelfSaveError'));
    }
  };

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setWarehouseFormData({
      name_ar: '',
      name_en: '',
      branch_id: '',
      location_ar: '',
      location_en: '',
      capacity: '',
      is_active: true,
      is_default: false,
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditWarehouse = (warehouse: WarehouseType) => {
    setEditingWarehouse(warehouse);
    setWarehouseFormData({
      name_ar: warehouse.name_ar || '',
      name_en: warehouse.name_en || '',
      branch_id: warehouse.branch_id?.toString() || '',
      location_ar: warehouse.location_ar || '',
      location_en: warehouse.location_en || '',
      capacity: warehouse.capacity?.toString() || '',
      is_active: warehouse.is_active ?? true,
      is_default: warehouse.is_default || false,
      notes: warehouse.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSaveWarehouse = async () => {
    if (!warehouseFormData.name_ar || !warehouseFormData.name_en || !warehouseFormData.branch_id || 
        !warehouseFormData.location_ar || !warehouseFormData.location_en || !warehouseFormData.capacity) {
        toast.error(t('warehouses.messages.fillAllRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateWarehouseRequest = {
        name_ar: warehouseFormData.name_ar.trim(),
        name_en: warehouseFormData.name_en.trim(),
        branch_id: parseInt(warehouseFormData.branch_id),
        location_ar: warehouseFormData.location_ar.trim(),
        location_en: warehouseFormData.location_en.trim(),
        capacity: parseInt(warehouseFormData.capacity),
        is_active: warehouseFormData.is_active ?? true,
        is_default: warehouseFormData.is_default || false
      };

      if (warehouseFormData.notes?.trim()) {
        payload.notes = warehouseFormData.notes.trim();
      }

      let result;
      if (editingWarehouse) {
        // Update existing warehouse
        result = await updateWarehouse(editingWarehouse.id, payload);
        if (result.success) {
          toast.success(t('warehouses.messages.warehouseUpdated'));
        }
      } else {
        // Create new warehouse
        result = await createWarehouse(payload);
        if (result.success) {
          toast.success(t('warehouses.messages.warehouseCreated'));
        }
      }

      if (result.success) {
        setIsDialogOpen(false);
        setEditingWarehouse(null);
        setWarehouseFormData({
          name_ar: '',
          name_en: '',
          branch_id: '',
          location_ar: '',
          location_en: '',
          capacity: '',
          is_active: true,
          is_default: false,
          notes: ''
        });
        await fetchWarehouses();
        await fetchAllStorages();
        await fetchAllShelves();
      } else {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          toast.error(errorMessages[0] || result.message);
        } else {
          toast.error(result.message || t('warehouses.messages.warehouseSaveError'));
        }
      }
    } catch (error) {
      console.error('Error saving warehouse:', error);
      toast.error(t('warehouses.messages.warehouseSaveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA').format(amount);
  };

  const getStockStatus = (status: string) => {
    switch (status) {
      case t('warehouses.inventory.status'): return 'default';
      case t('warehouses.stats.lowStock'): return 'secondary';
      case t('warehouses.stats.outOfStock'): return 'destructive';
      default: return 'outline';
    }
  };

  const getShelfFillColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredShelves = shelves
    .filter(s => selectedWarehouse === 'all' || s.warehouseId?.toString() === selectedWarehouse)
    .filter(s =>
      searchQuery === '' ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.warehouse && s.warehouse.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.storage && s.storage.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-right flex-1">
          <h1>{t('warehouses.title')}</h1>
          <p className="text-gray-600">{t('warehouses.subtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddWarehouse} className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              {t('warehouses.warehouse.new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader className="text-right">
              <DialogTitle>{editingWarehouse ? t('warehouses.warehouse.edit') : t('warehouses.warehouse.add')}</DialogTitle>
              <DialogDescription>{t('warehouses.warehouse.editDescription')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('warehouses.warehouse.nameAr')} *</Label>
                  <Input 
                    value={warehouseFormData.name_ar}
                    onChange={(e) => setWarehouseFormData({ ...warehouseFormData, name_ar: e.target.value })}
                    placeholder={t('warehouses.warehouse.nameAr')}
                    dir={direction}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('warehouses.warehouse.nameEn')} *</Label>
                  <Input 
                    value={warehouseFormData.name_en}
                    onChange={(e) => setWarehouseFormData({ ...warehouseFormData, name_en: e.target.value })}
                    placeholder="West Branch Warehouse"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('warehouses.warehouse.branch')} *</Label>
                <Select
                  value={warehouseFormData.branch_id}
                  onValueChange={(value) => setWarehouseFormData({ ...warehouseFormData, branch_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('warehouses.warehouse.selectBranch')} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => {
                      const authUser = getStoredUser();
                      const isSuperAdmin = authUser?.is_system_owner_admin === true;
                      const branchName = direction === 'rtl' ? branch.name_ar : branch.name_en;
                      const institutionName = branch.institution 
                        ? (direction === 'rtl' ? branch.institution.name_ar : branch.institution.name_en)
                        : '';
                      
                      return (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {isSuperAdmin && institutionName 
                            ? `${branchName} - ${institutionName}`
                            : branchName}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('warehouses.warehouse.locationAr')} *</Label>
                  <Input 
                    value={warehouseFormData.location_ar}
                    onChange={(e) => setWarehouseFormData({ ...warehouseFormData, location_ar: e.target.value })}
                    placeholder={t('warehouses.warehouse.locationAr')}
                    dir={direction}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('warehouses.warehouse.locationEn')} *</Label>
                  <Input 
                    value={warehouseFormData.location_en}
                    onChange={(e) => setWarehouseFormData({ ...warehouseFormData, location_en: e.target.value })}
                    placeholder="Riyadh - Al Sulaimaniyah"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('warehouses.warehouse.capacity')} *</Label>
                <Input 
                  type="number" 
                  value={warehouseFormData.capacity}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, capacity: e.target.value })}
                  placeholder="5000"
                  dir="ltr"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="text-right">
                  <Label>{t('warehouses.warehouse.status')}</Label>
                  <p className="text-sm text-gray-600">{t('warehouses.warehouse.statusDescription')}</p>
                </div>
                <select 
                  className="border rounded px-3 py-1"
                  value={warehouseFormData.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, is_active: e.target.value === 'active' })}
                >
                  <option value="active">{t('warehouses.warehouse.active')}</option>
                  <option value="inactive">{t('warehouses.warehouse.inactive')}</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                <div className="text-right">
                  <Label>{t('warehouses.warehouse.isDefault')}</Label>
                  <p className="text-sm text-gray-600">{t('warehouses.warehouse.isDefaultDescription')}</p>
                </div>
                <input 
                  type="checkbox" 
                  className="w-5 h-5"
                  checked={warehouseFormData.is_default}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, is_default: e.target.checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('warehouses.warehouse.notes')}</Label>
                <textarea
                  className="w-full border rounded-lg p-2 text-right"
                  rows={3}
                  placeholder={t('warehouses.warehouse.notesPlaceholder')}
                  value={warehouseFormData.notes}
                  onChange={(e) => setWarehouseFormData({ ...warehouseFormData, notes: e.target.value })}
                  dir={direction}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  className="flex-1" 
                  onClick={handleSaveWarehouse}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {t('warehouses.warehouse.saving')}
                    </>
                  ) : (
                    editingWarehouse ? t('warehouses.warehouse.saveChanges') : t('warehouses.warehouse.save')
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  {t('warehouses.warehouse.cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Warehouse className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">{t('warehouses.stats.warehouseCount')}</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">8</div>
            <p className="text-xs text-gray-600 mt-1">{t('warehouses.stats.activeWarehouses')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Package className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">{t('warehouses.stats.totalProducts')}</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">{formatCurrency(6500)}</div>
            <p className="text-xs text-gray-600 mt-1">{t('warehouses.stats.storedUnits')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingDown className="w-4 h-4 text-orange-600" />
            <CardTitle className="text-sm">{t('warehouses.stats.lowStock')}</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">12</div>
            <p className="text-xs text-gray-600 mt-1">{t('warehouses.stats.needsReorder')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <CardTitle className="text-sm">{t('warehouses.stats.outOfStock')}</CardTitle>
          </CardHeader>
          <CardContent className="text-right">
            <div className="text-2xl">3</div>
            <p className="text-xs text-gray-600 mt-1">{t('warehouses.stats.outOfStockProducts')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="warehouses" className="w-full">
        <TabsList>
          <TabsTrigger value="warehouses">{t('warehouses.tabs.warehouses')}</TabsTrigger>
          <TabsTrigger value="inventory">{t('warehouses.tabs.inventory')}</TabsTrigger>
          <TabsTrigger value="transfers">{t('warehouses.tabs.transfers')}</TabsTrigger>
          <TabsTrigger value="receipt">{t('warehouses.tabs.receipt')}</TabsTrigger>
          <TabsTrigger value="issue">{t('warehouses.tabs.issue')}</TabsTrigger>
          <TabsTrigger value="adjustment">{t('warehouses.tabs.adjustment')}</TabsTrigger>
          <TabsTrigger value="storages">{t('warehouses.tabs.storages')}</TabsTrigger>
          <TabsTrigger value="shelves">{t('warehouses.tabs.shelves')}</TabsTrigger>
        </TabsList>

        {/* Warehouses */}
        <TabsContent value="warehouses" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle>{t('warehouses.list.title')}</CardTitle>
              <CardDescription>{t('warehouses.list.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">{t('warehouses.list.warehouseName')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.list.location')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.list.capacity')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.list.user')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.list.fillPercentage')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.list.manager')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.list.status')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.list.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        </TableCell>
                      </TableRow>
                    ) : warehouses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          No warehouses found
                        </TableCell>
                      </TableRow>
                    ) : (
                      warehouses.map((warehouse) => {
                        const used = 0; // TODO: Calculate from inventory when available
                        const fillPercentage = warehouse.capacity > 0 ? (used / warehouse.capacity) * 100 : 0;
                        return (
                          <TableRow key={warehouse.id}>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              {direction === 'rtl' ? warehouse.name_ar : warehouse.name_en}
                            </TableCell>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              {direction === 'rtl' ? warehouse.location_ar : warehouse.location_en}
                            </TableCell>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              {warehouse.capacity.toLocaleString()}
                            </TableCell>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              {used.toLocaleString()}
                            </TableCell>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              <div className={`flex items-center gap-2 ${direction === 'rtl' ? '' : 'justify-start'}`}>
                                <span className="text-sm">{fillPercentage.toFixed(0)}%</span>
                                <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-blue-600"
                                    style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              {warehouse.branch 
                                ? (direction === 'rtl' ? warehouse.branch.name_ar : warehouse.branch.name_en)
                                : '-'}
                            </TableCell>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              <Badge variant={warehouse.is_active ? 'default' : 'secondary'}>
                                {warehouse.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleEditWarehouse(warehouse)}
                                title={t('warehouses.list.edit')}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm" className="gap-2">
                  <Search className="w-4 h-4" />
                  {t('warehouses.inventory.advancedSearch')}
                </Button>
                <div className="text-right">
                  <CardTitle>{t('warehouses.inventory.title')}</CardTitle>
                  <CardDescription>{t('warehouses.inventory.subtitle')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input placeholder={t('warehouses.inventory.searchPlaceholder')} className="text-right" dir="rtl" />
              </div>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">{t('warehouses.inventory.product')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.inventory.barcode')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.inventory.warehouse')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.inventory.shelf')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.inventory.quantity')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.inventory.minStock')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.inventory.status')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.inventory.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-right">{item.product}</TableCell>
                        <TableCell className="text-right">{item.barcode}</TableCell>
                        <TableCell className="text-right">{item.warehouse}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.shelf}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{item.minStock}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={getStockStatus(item.status)}>
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">{t('warehouses.list.edit')}</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transfers */}
        <TabsContent value="transfers" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <ArrowRightLeft className="w-4 h-4" />
                      {t('warehouses.transfers.new')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle>{t('warehouses.transfers.newTransfer')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('warehouses.transfers.from')}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((w) => (
                              <SelectItem key={w.id} value={w.id.toString()}>
                                {direction === 'rtl' ? w.name_ar : w.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('warehouses.transfers.to')}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map((w) => (
                              <SelectItem key={w.id} value={w.id.toString()}>
                                {direction === 'rtl' ? w.name_ar : w.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('warehouses.transfers.product')}</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder={t('warehouses.transfers.selectProduct')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">كمبيوتر محمول HP</SelectItem>
                            <SelectItem value="2">طابعة Canon</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('warehouses.transfers.quantity')}</Label>
                        <Input type="number" placeholder="0" />
                      </div>
                      <Button className="w-full" onClick={() => toast.success(t('warehouses.transfers.transferCreated'))}>
                        {t('warehouses.transfers.execute')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="text-right">
                  <CardTitle>{t('warehouses.transfers.title')}</CardTitle>
                  <CardDescription>{t('warehouses.transfers.subtitle')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div dir="rtl">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">{t('warehouses.transfers.transferNumber')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.transfers.date')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.transfers.fromWarehouse')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.transfers.toWarehouse')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.transfers.product')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.transfers.quantity')}</TableHead>
                      <TableHead className="text-right">{t('warehouses.transfers.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transfers.map((transfer) => (
                      <TableRow key={transfer.id}>
                        <TableCell className="text-right">{transfer.id}</TableCell>
                        <TableCell className="text-right">{transfer.date}</TableCell>
                        <TableCell className="text-right">{transfer.from}</TableCell>
                        <TableCell className="text-right">{transfer.to}</TableCell>
                        <TableCell className="text-right">{transfer.product}</TableCell>
                        <TableCell className="text-right">{transfer.quantity}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={transfer.status === t('warehouses.transfers.completed') ? 'default' : 'secondary'}>
                            {transfer.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Receipt */}
        <TabsContent value="receipt" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-green-600" />
                {t('warehouses.receipt.title')}
              </CardTitle>
              <CardDescription>{t('warehouses.receipt.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label>{t('warehouses.receipt.targetWarehouse')}</Label>
                <Select value={receiptWarehouse} onValueChange={setReceiptWarehouse}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {direction === 'rtl' ? warehouse.name_ar : warehouse.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Products */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">{t('warehouses.receipt.products')}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReceiptItems([...receiptItems, {
                        productId: '',
                        productName: '',
                        quantity: 1,
                        costPrice: 0,
                        taxRate: 0,
                        taxAmount: 0,
                        totalAmount: 0
                      }]);
                    }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    {t('warehouses.receipt.addProduct')}
                  </Button>
                </div>

                {receiptItems.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('warehouses.receipt.products')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.receipt.quantity')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.receipt.purchasePrice')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.receipt.tax')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.receipt.total')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.storage.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {receiptItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-right">
                                <Select
                                  value={item.productId}
                                  onValueChange={(value) => {
                                    const product = products.find(p => p.id === value);
                                    const costPrice = getCostPrice(value, receiptWarehouse) || 0;
                                    const updated = [...receiptItems];
                                    updated[index] = {
                                      ...item,
                                      productId: value,
                                      productName: product?.name || '',
                                      costPrice,
                                      taxAmount: receiptIncludeTax ? costPrice * item.quantity * (item.taxRate / 100) : 0,
                                      totalAmount: costPrice * item.quantity + (receiptIncludeTax ? costPrice * item.quantity * (item.taxRate / 100) : 0)
                                    };
                                    setReceiptItems(updated);
                                  }}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder={t('warehouses.transfers.selectProduct')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-20"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const qty = Number(e.target.value);
                                    const updated = [...receiptItems];
                                    updated[index] = {
                                      ...item,
                                      quantity: qty,
                                      taxAmount: receiptIncludeTax ? item.costPrice * qty * (item.taxRate / 100) : 0,
                                      totalAmount: item.costPrice * qty + (receiptIncludeTax ? item.costPrice * qty * (item.taxRate / 100) : 0)
                                    };
                                    setReceiptItems(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-24"
                                  value={item.costPrice}
                                  onChange={(e) => {
                                    const price = Number(e.target.value);
                                    const updated = [...receiptItems];
                                    updated[index] = {
                                      ...item,
                                      costPrice: price,
                                      taxAmount: receiptIncludeTax ? price * item.quantity * (item.taxRate / 100) : 0,
                                      totalAmount: price * item.quantity + (receiptIncludeTax ? price * item.quantity * (item.taxRate / 100) : 0)
                                    };
                                    setReceiptItems(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                {receiptIncludeTax ? (
                                  <Select
                                    value={item.taxRate.toString()}
                                    onValueChange={(value) => {
                                      const rate = Number(value);
                                      const updated = [...receiptItems];
                                      updated[index] = {
                                        ...item,
                                        taxRate: rate,
                                        taxAmount: item.costPrice * item.quantity * (rate / 100),
                                        totalAmount: item.costPrice * item.quantity + (item.costPrice * item.quantity * (rate / 100))
                                      };
                                      setReceiptItems(updated);
                                    }}
                                  >
                                    <SelectTrigger className="w-24">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="0">0%</SelectItem>
                                      <SelectItem value="15">15%</SelectItem>
                                      <SelectItem value="5">5%</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <span className="text-gray-400">{t('warehouses.receipt.noTax')}</span>
                                )}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReceiptItems(receiptItems.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {/* Tax Option */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeTax"
                    checked={receiptIncludeTax}
                    onChange={(e) => {
                      setReceiptIncludeTax(e.target.checked);
                      setReceiptItems(receiptItems.map(item => ({
                        ...item,
                        taxRate: e.target.checked ? 15 : 0,
                        taxAmount: e.target.checked ? item.costPrice * item.quantity * 0.15 : 0,
                        totalAmount: item.costPrice * item.quantity + (e.target.checked ? item.costPrice * item.quantity * 0.15 : 0)
                      })));
                    }}
                  />
                  <Label htmlFor="includeTax">{t('warehouses.receipt.includeTax')}</Label>
                </div>
              </div>

              {/* Credit Account Selection */}
              <div className="space-y-2">
                <Label>{t('warehouses.receipt.creditAccount')}</Label>
                <Select value={receiptCreditAccount} onValueChange={(value) => {
                  setReceiptCreditAccount(value);
                  if (value !== t('warehouses.receipt.customAccount')) {
                    setReceiptCustomAccount('');
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={t('warehouses.receipt.cash')}>{t('warehouses.receipt.cash')}</SelectItem>
                    <SelectItem value={t('warehouses.receipt.bank')}>{t('warehouses.receipt.bank')}</SelectItem>
                    <SelectItem value={t('warehouses.receipt.suppliers')}>{t('warehouses.receipt.suppliers')}</SelectItem>
                    <SelectItem value={t('warehouses.receipt.companyAccount')}>{t('warehouses.receipt.companyAccount')}</SelectItem>
                    <SelectItem value={t('warehouses.receipt.customAccount')}>{t('warehouses.receipt.customAccount')}</SelectItem>
                  </SelectContent>
                </Select>
                {receiptCreditAccount === t('warehouses.receipt.customAccount') && (
                  <Input
                    placeholder={t('warehouses.receipt.enterAccountName')}
                    value={receiptCustomAccount}
                    onChange={(e) => setReceiptCustomAccount(e.target.value)}
                  />
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{t('warehouses.receipt.description')}</Label>
                <Input
                  placeholder={t('warehouses.receipt.descriptionPlaceholder')}
                  value={receiptDescription}
                  onChange={(e) => setReceiptDescription(e.target.value)}
                />
              </div>

              {/* Summary */}
              {receiptItems.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('warehouses.receipt.subtotal')}:</span>
                    <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                      receiptItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
                    )}</span>
                  </div>
                  {receiptIncludeTax && (
                    <div className="flex justify-between">
                      <span className="font-semibold">{t('warehouses.receipt.taxAmount')}:</span>
                      <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                        receiptItems.reduce((sum, item) => sum + item.taxAmount, 0)
                      )}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">{t('warehouses.receipt.grandTotal')}:</span>
                    <span className="text-lg font-bold text-green-600">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                      receiptItems.reduce((sum, item) => sum + item.totalAmount, 0)
                    )}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReceiptItems([]);
                    setReceiptCreditAccount(t('warehouses.receipt.cash'));
                    setReceiptCustomAccount('');
                    setReceiptIncludeTax(false);
                    setReceiptDescription('');
                  }}
                >
                  {t('warehouses.receipt.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    if (receiptItems.length === 0) {
                      toast.error(t('warehouses.receipt.addProducts'));
                      return;
                    }

                    const emptyProducts = receiptItems.filter(item => !item.productId || item.quantity <= 0 || item.costPrice <= 0);
                    if (emptyProducts.length > 0) {
                      toast.error(t('warehouses.receipt.completeAllProducts'));
                      return;
                    }

                    if (receiptCreditAccount === t('warehouses.receipt.customAccount') && !receiptCustomAccount.trim()) {
                      toast.error(t('warehouses.receipt.enterAccountName'));
                      return;
                    }

                    const receiptNumber = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
                    const warehouse = warehouses.find(w => w.id.toString() === receiptWarehouse);
                    const warehouseName = warehouse ? (direction === 'rtl' ? warehouse.name_ar : warehouse.name_en) : '';
                    const totalAmount = receiptItems.reduce((sum, item) => sum + item.totalAmount, 0);
                    const totalTax = receiptItems.reduce((sum, item) => sum + item.taxAmount, 0);

                    // Increase stock for each product
                    receiptItems.forEach((item) => {
                      increaseStock(item.productId, receiptWarehouse, item.quantity, item.costPrice);
                    });

                    // Create journal entry
                    const creditAccount = receiptCreditAccount === t('warehouses.receipt.customAccount') ? receiptCustomAccount : receiptCreditAccount;
                    const journalEntry = createInventoryReceiptFromAccountEntry(
                      receiptNumber,
                      totalAmount - totalTax, // Amount without tax
                      creditAccount,
                      warehouseName,
                      receiptDescription || undefined,
                      receiptIncludeTax,
                      totalTax
                    );

                    addJournalEntry(journalEntry);

                    toast.success(`${t('warehouses.messages.receiptCreated')} - ${receiptNumber}`);
                    setReceiptItems([]);
                    setReceiptCreditAccount(t('warehouses.receipt.cash'));
                    setReceiptCustomAccount('');
                    setReceiptIncludeTax(false);
                    setReceiptDescription('');
                  }}
                >
                  <ArrowDownCircle className="w-4 h-4 ml-2" />
                  {t('warehouses.receipt.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Issue */}
        <TabsContent value="issue" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
                {t('warehouses.issue.title')}
              </CardTitle>
              <CardDescription>{t('warehouses.issue.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label>{t('warehouses.issue.targetWarehouse')}</Label>
                <Select value={issueWarehouse} onValueChange={setIssueWarehouse}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {direction === 'rtl' ? warehouse.name_ar : warehouse.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Add Products */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">{t('warehouses.issue.products')}</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIssueItems([...issueItems, {
                        productId: '',
                        productName: '',
                        quantity: 1,
                        costPrice: 0,
                        totalAmount: 0
                      }]);
                    }}
                  >
                    <Plus className="w-4 h-4 ml-2" />
                    {t('warehouses.issue.addProduct')}
                  </Button>
                </div>

                {issueItems.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <div dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('warehouses.issue.product')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.issue.availableQty')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.issue.quantity')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.issue.costPrice')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.issue.total')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.storage.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {issueItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="text-right">
                                <Select
                                  value={item.productId}
                                  onValueChange={(value) => {
                                    const product = products.find(p => p.id === value);
                                    const costPrice = getCostPrice(value, issueWarehouse) || 0;
                                    const stock = getStock(value, issueWarehouse);
                                    const updated = [...issueItems];
                                    updated[index] = {
                                      ...item,
                                      productId: value,
                                      productName: product?.name || '',
                                      costPrice,
                                      totalAmount: costPrice * item.quantity
                                    };
                                    setIssueItems(updated);
                                  }}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue placeholder={t('warehouses.transfers.selectProduct')} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {products.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={getStock(item.productId, issueWarehouse) <= 0 ? 'text-red-600' : ''}>
                                  {item.productId ? getStock(item.productId, issueWarehouse) : '-'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-20"
                                  value={item.quantity}
                                  onChange={(e) => {
                                    const qty = Number(e.target.value);
                                    const updated = [...issueItems];
                                    updated[index] = {
                                      ...item,
                                      quantity: qty,
                                      totalAmount: item.costPrice * qty
                                    };
                                    setIssueItems(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <span>{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.costPrice)}</span>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(item.totalAmount)}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setIssueItems(issueItems.filter((_, i) => i !== index));
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>

              {/* Debit Account Selection */}
              <div className="space-y-2">
                <Label>{t('warehouses.issue.debitAccount')}</Label>
                <Select value={issueDebitAccount} onValueChange={(value) => {
                  setIssueDebitAccount(value);
                  if (value !== t('warehouses.issue.customAccount')) {
                    setIssueCustomAccount('');
                  }
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={t('warehouses.issue.expenses')}>{t('warehouses.issue.expenses')}</SelectItem>
                    <SelectItem value={t('warehouses.issue.depreciation')}>{t('warehouses.issue.depreciation')}</SelectItem>
                    <SelectItem value={t('warehouses.issue.companyAccount')}>{t('warehouses.issue.companyAccount')}</SelectItem>
                    <SelectItem value={t('warehouses.issue.customAccount')}>{t('warehouses.issue.customAccount')}</SelectItem>
                  </SelectContent>
                </Select>
                {issueDebitAccount === t('warehouses.issue.customAccount') && (
                  <Input
                    placeholder={t('warehouses.issue.enterAccountName')}
                    value={issueCustomAccount}
                    onChange={(e) => setIssueCustomAccount(e.target.value)}
                  />
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>{t('warehouses.issue.reason')}</Label>
                <Input
                  placeholder={t('warehouses.issue.reasonPlaceholder')}
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>{t('warehouses.issue.description')}</Label>
                <Input
                  placeholder={t('warehouses.issue.descriptionPlaceholder')}
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                />
              </div>

              {/* Summary */}
              {issueItems.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-semibold">{t('warehouses.issue.total')}:</span>
                    <span className="text-lg font-bold text-red-600">{new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                      issueItems.reduce((sum, item) => sum + item.totalAmount, 0)
                    )}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIssueItems([]);
                    setIssueDebitAccount(t('warehouses.issue.expenses'));
                    setIssueCustomAccount('');
                    setIssueReason('');
                    setIssueDescription('');
                  }}
                >
                  {t('warehouses.issue.cancel')}
                </Button>
                <Button
                  onClick={() => {
                    if (issueItems.length === 0) {
                      toast.error(t('warehouses.issue.addProducts'));
                      return;
                    }

                    const emptyProducts = issueItems.filter(item => !item.productId || item.quantity <= 0);
                    if (emptyProducts.length > 0) {
                      toast.error(t('warehouses.issue.completeAllProducts'));
                      return;
                    }

                    // Validate stock availability
                    for (const item of issueItems) {
                      const availableStock = getStock(item.productId, issueWarehouse);
                      if (availableStock < item.quantity) {
                        toast.error(`${t('warehouses.issue.availableStock')} ${item.productName}: ${availableStock} ${t('warehouses.issue.only')}`);
                        return;
                      }
                    }

                    if (issueDebitAccount === t('warehouses.issue.customAccount') && !issueCustomAccount.trim()) {
                      toast.error(t('warehouses.issue.enterCustomAccount'));
                      return;
                    }

                    if (!issueReason.trim()) {
                      toast.error(t('warehouses.issue.enterReason'));
                      return;
                    }

                    const issueNumber = `ISS-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
                    const warehouse = warehouses.find(w => w.id.toString() === issueWarehouse);
                    const warehouseName = warehouse ? (direction === 'rtl' ? warehouse.name_ar : warehouse.name_en) : '';
                    const totalAmount = issueItems.reduce((sum, item) => sum + item.totalAmount, 0);

                    // Reduce stock for each product
                    issueItems.forEach((item) => {
                      const success = reduceStock(item.productId, issueWarehouse, item.quantity);
                      if (!success) {
                        toast.error(`${t('warehouses.issue.issueFailed')} ${item.productName}`);
                        return;
                      }
                    });

                    // Create journal entry
                    const debitAccount = issueDebitAccount === t('warehouses.issue.customAccount') ? issueCustomAccount : issueDebitAccount;
                    const journalEntry = createInventoryIssueToAccountEntry(
                      issueNumber,
                      totalAmount,
                      debitAccount,
                      warehouseName,
                      issueDescription || undefined,
                      issueReason
                    );

                    addJournalEntry(journalEntry);

                    toast.success(`${t('warehouses.messages.issueCreated')} - ${issueNumber}`);
                    setIssueItems([]);
                    setIssueDebitAccount(t('warehouses.issue.expenses'));
                    setIssueCustomAccount('');
                    setIssueReason('');
                    setIssueDescription('');
                  }}
                >
                  <ArrowUpCircle className="w-4 h-4 ml-2" />
                  {t('warehouses.issue.save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Adjustment */}
        <TabsContent value="adjustment" className="space-y-4">
          <Card>
            <CardHeader className="text-right">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                {t('warehouses.adjustment.title')}
              </CardTitle>
              <CardDescription>{t('warehouses.adjustment.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Warehouse Selection */}
              <div className="space-y-2">
                <Label>{t('warehouses.adjustment.selectWarehouse')}</Label>
                <Select value={adjustmentWarehouse} onValueChange={(value) => {
                  setAdjustmentWarehouse(value);
                  // Load products for selected warehouse
                  const warehouseProducts = getWarehouseProducts(value);
                  setAdjustmentProducts(warehouseProducts.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    return {
                      productId: item.productId,
                      productName: product?.name || t('warehouses.adjustment.unknownProduct'),
                      recordedQty: item.quantity,
                      actualQty: item.quantity,
                      difference: 0,
                      costPrice: item.costPrice,
                      reason: ''
                    };
                  }));
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                        {direction === 'rtl' ? warehouse.name_ar : warehouse.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Products Adjustment Table */}
              {adjustmentProducts.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">المنتجات</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const warehouseProducts = getWarehouseProducts(adjustmentWarehouse);
                        setAdjustmentProducts(warehouseProducts.map(item => {
                          const product = products.find(p => p.id === item.productId);
                          return {
                            productId: item.productId,
                            productName: product?.name || t('warehouses.adjustment.unknownProduct'),
                            recordedQty: item.quantity,
                            actualQty: item.quantity,
                            difference: 0,
                            costPrice: item.costPrice,
                            reason: ''
                          };
                        }));
                      }}
                    >
                      {t('warehouses.adjustment.refreshList')}
                    </Button>
                  </div>
                  
                  <div className="border rounded-lg overflow-hidden">
                    <div dir="rtl">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('warehouses.adjustment.product')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.adjustment.recordedQty')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.adjustment.actualQty')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.adjustment.difference')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.adjustment.reason')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adjustmentProducts.map((item, index) => (
                            <TableRow key={item.productId}>
                              <TableCell className="text-right font-medium">{item.productName}</TableCell>
                              <TableCell className="text-right">{item.recordedQty}</TableCell>
                              <TableCell className="text-right">
                                <Input
                                  type="number"
                                  className="w-24"
                                  value={item.actualQty}
                                  onChange={(e) => {
                                    const newActualQty = Number(e.target.value);
                                    const newDifference = newActualQty - item.recordedQty;
                                    const updated = [...adjustmentProducts];
                                    updated[index] = {
                                      ...item,
                                      actualQty: newActualQty,
                                      difference: newDifference
                                    };
                                    setAdjustmentProducts(updated);
                                  }}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-semibold ${item.difference > 0 ? 'text-green-600' : item.difference < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                  {item.difference > 0 ? '+' : ''}{item.difference}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Input
                                  placeholder={t('warehouses.adjustment.reason')}
                                  className="w-48"
                                  value={item.reason}
                                  onChange={(e) => {
                                    const updated = [...adjustmentProducts];
                                    updated[index] = { ...item, reason: e.target.value };
                                    setAdjustmentProducts(updated);
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">{t('warehouses.adjustment.totalIncrease')}:</span>
                      <span className="text-green-600 font-semibold">
                        {adjustmentProducts.filter(p => p.difference > 0).reduce((sum, p) => sum + p.difference, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">{t('warehouses.adjustment.totalDecrease')}:</span>
                      <span className="text-red-600 font-semibold">
                        {Math.abs(adjustmentProducts.filter(p => p.difference < 0).reduce((sum, p) => sum + p.difference, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">{t('warehouses.adjustment.financialDifference')}:</span>
                      <span className={`font-semibold ${adjustmentProducts.reduce((sum, p) => sum + (p.difference * p.costPrice), 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(
                          adjustmentProducts.reduce((sum, p) => sum + (p.difference * p.costPrice), 0)
                        )}
                      </span>
                    </div>
                  </div>

                  {/* General Reason */}
                  <div className="space-y-2">
                    <Label>{t('warehouses.adjustment.generalReason')}</Label>
                    <Input
                      placeholder={t('warehouses.adjustment.generalReasonPlaceholder')}
                      value={adjustmentReason}
                      onChange={(e) => setAdjustmentReason(e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAdjustmentProducts([]);
                        setAdjustmentReason('');
                      }}
                    >
                      {t('warehouses.receipt.cancel')}
                    </Button>
                    <Button
                      onClick={() => {
                        // Validate
                        const hasChanges = adjustmentProducts.some(p => p.difference !== 0);
                        if (!hasChanges) {
                          toast.error(t('warehouses.adjustment.noChanges'));
                          return;
                        }

                        const productsWithChanges = adjustmentProducts.filter(p => p.difference !== 0);
                        const missingReasons = productsWithChanges.filter(p => !p.reason.trim());
                        if (missingReasons.length > 0) {
                          toast.error(t('warehouses.adjustment.enterReasonForAll'));
                          return;
                        }

                        // Apply adjustments
                        const adjustmentNumber = `ADJ-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
                        const warehouse = warehouses.find(w => w.id.toString() === adjustmentWarehouse);
                        const warehouseName = warehouse ? (direction === 'rtl' ? warehouse.name_ar : warehouse.name_en) : '';

                        productsWithChanges.forEach((item) => {
                          // Adjust stock
                          adjustStock(item.productId, adjustmentWarehouse, item.actualQty);

                          // Create journal entry
                          const adjustmentAmount = Math.abs(item.difference * item.costPrice);
                          const adjustmentType = item.difference > 0 ? 'increase' : 'decrease';
                          const reason = item.reason || adjustmentReason || 'تسوية مخزون';
                          
                          const journalEntry = createInventoryAdjustmentEntry(
                            `${adjustmentNumber}-${item.productId}`,
                            adjustmentAmount,
                            adjustmentType,
                            reason,
                            warehouseName
                          );
                          
                          addJournalEntry(journalEntry);
                        });

                        toast.success(`${t('warehouses.messages.adjustmentCreated')} - ${adjustmentNumber}`);
                        setAdjustmentProducts([]);
                        setAdjustmentReason('');
                      }}
                    >
                      <Calculator className="w-4 h-4 ml-2" />
                      {t('warehouses.adjustment.save')}
                    </Button>
                  </div>
                </div>
              )}

              {adjustmentProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Calculator className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>{t('warehouses.adjustment.selectWarehouse')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storages */}
        <TabsContent value="storages" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog open={isStorageDialogOpen} onOpenChange={setIsStorageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddStorage} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      {t('warehouses.storage.new')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl" className="max-w-2xl">
                    <DialogHeader className="text-right">
                      <DialogTitle>
                        {editingStorage ? t('warehouses.storage.edit') : t('warehouses.storage.add')}
                      </DialogTitle>
                      <DialogDescription>
                        {editingStorage ? t('warehouses.storage.edit') : t('warehouses.storage.add')}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('warehouses.storage.warehouse')} *</Label>
                        <Select 
                          value={storageFormData.warehouseId}
                          onValueChange={(value) => setStorageFormData({ ...storageFormData, warehouseId: value })}
                          disabled={!!editingStorage}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t('warehouses.storage.selectWarehouse')} />
                          </SelectTrigger>
                          <SelectContent>
                            {warehouses.map(w => (
                              <SelectItem key={w.id} value={w.id.toString()}>
                                {direction === 'rtl' ? w.name_ar : w.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('warehouses.storage.nameAr')} *</Label>
                          <Input
                            value={storageFormData.name_ar}
                            onChange={(e) => setStorageFormData({ ...storageFormData, name_ar: e.target.value })}
                            placeholder={t('warehouses.storage.nameAr')}
                            dir="rtl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('warehouses.storage.nameEn')} *</Label>
                          <Input
                            value={storageFormData.name_en}
                            onChange={(e) => setStorageFormData({ ...storageFormData, name_en: e.target.value })}
                            placeholder="Section A"
                            dir="ltr"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('warehouses.storage.capacity')} *</Label>
                        <Input
                          type="number"
                          value={storageFormData.capacity}
                          onChange={(e) => setStorageFormData({ ...storageFormData, capacity: e.target.value })}
                          placeholder="1000"
                          min="1"
                        />
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={handleSaveStorage}
                        disabled={!storageFormData.name_ar || !storageFormData.name_en || !storageFormData.capacity || !storageFormData.warehouseId || isSubmittingStorage}
                      >
                        {isSubmittingStorage ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            {t('warehouses.storage.saving')}
                          </>
                        ) : (
                          editingStorage ? t('warehouses.storage.saveChanges') : t('warehouses.storage.save')
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="text-right">
                  <CardTitle>{t('warehouses.storage.title')}</CardTitle>
                  <CardDescription>{t('warehouses.storage.subtitle')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('warehouses.storage.filterAll')}</SelectItem>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {direction === 'rtl' ? w.name_ar : w.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Count */}
                <div className="text-right text-sm text-gray-600">
                  {t('warehouses.storage.showing')} <span className="font-bold text-blue-600">
                    {storages.filter(s => selectedWarehouse === 'all' || s.warehouse_id.toString() === selectedWarehouse).length}
                  </span> {t('warehouses.storage.of')} {storages.length} {t('warehouses.storage.storage')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-right">
              <CardTitle>{t('warehouses.storage.title')}</CardTitle>
              <CardDescription>{t('warehouses.storage.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {storages.length === 0 ? (
                <div className="text-center py-12" dir="rtl">
                  <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500 text-lg">{t('warehouses.storage.noStorages')}</p>
                  <p className="text-gray-400 text-sm mt-2">{t('warehouses.storage.noStoragesSubtext')}</p>
                </div>
              ) : (
                <div dir="rtl" className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{t('warehouses.storage.nameAr')}</TableHead>
                        <TableHead className="text-right">{t('warehouses.storage.warehouse')}</TableHead>
                        <TableHead className="text-right">{t('warehouses.storage.capacity')}</TableHead>
                        <TableHead className="text-right">{t('warehouses.storage.shelvesCount')}</TableHead>
                        <TableHead className="text-right">{t('warehouses.storage.edit')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storages
                        .filter(s => selectedWarehouse === 'all' || s.warehouse_id.toString() === selectedWarehouse)
                        .map((storage) => {
                          const warehouse = warehouses.find(w => w.id === storage.warehouse_id);
                          const shelvesCount = storage.shelves?.length || 0;
                          
                          return (
                            <TableRow key={storage.id}>
                              <TableCell className="text-right font-medium">
                                {direction === 'rtl' ? storage.name_ar : storage.name_en}
                              </TableCell>
                              <TableCell className="text-right">
                                {warehouse ? (direction === 'rtl' ? warehouse.name_ar : warehouse.name_en) : '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium">{storage.capacity}</TableCell>
                              <TableCell className="text-right">
                                <Badge variant="secondary">{shelvesCount} {t('warehouses.storage.shelvesCount')}</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditStorage(storage)}
                                    className="gap-1"
                                  >
                                    <Edit className="w-4 h-4" />
                                    {t('warehouses.storage.editButton')}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteStorage(storage)}
                                    className="gap-1"
                                    disabled={shelvesCount > 0}
                                    title={shelvesCount > 0 ? t('warehouses.storage.cannotDelete') : ''}
                                  >
                                    <Trash2 className={`w-4 h-4 ${shelvesCount > 0 ? 'text-gray-400' : 'text-red-600'}`} />
                                    {t('warehouses.storage.deleteButton')}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shelves */}
        <TabsContent value="shelves" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Dialog open={isShelfDialogOpen} onOpenChange={setIsShelfDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleAddShelf} size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      {t('warehouses.shelf.new')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent dir="rtl">
                    <DialogHeader className="text-right">
                      <DialogTitle>
                        {editingShelf ? t('warehouses.shelf.edit') : t('warehouses.shelf.add')}
                      </DialogTitle>
                      <DialogDescription>
                        {editingShelf ? t('warehouses.shelf.edit') : t('warehouses.shelf.add')}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('warehouses.shelf.code')} *</Label>
                          <Input
                            value={shelfFormData.code}
                            onChange={(e) => setShelfFormData({ ...shelfFormData, code: e.target.value })}
                            placeholder="A-01"
                            className="font-mono"
                            dir="ltr"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>{t('warehouses.shelf.warehouse')} *</Label>
                          <Select 
                            value={shelfFormData.warehouseId}
                            onValueChange={(value) => {
                              setShelfFormData({ ...shelfFormData, warehouseId: value, storageId: '' });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('warehouses.shelf.selectWarehouse')} />
                            </SelectTrigger>
                            <SelectContent>
                              {warehouses.map(w => (
                                <SelectItem key={w.id} value={w.id.toString()}>
                                  {direction === 'rtl' ? w.name_ar : w.name_en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>{t('warehouses.shelf.storage')} *</Label>
                        <Select 
                          value={shelfFormData.storageId}
                          onValueChange={(value) => setShelfFormData({ ...shelfFormData, storageId: value })}
                          disabled={!shelfFormData.warehouseId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={shelfFormData.warehouseId ? t('warehouses.shelf.selectStorage') : t('warehouses.shelf.selectStorageFirst')} />
                          </SelectTrigger>
                          <SelectContent>
                            {storages
                              .filter(s => s.warehouse_id.toString() === shelfFormData.warehouseId)
                              .map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>
                                  {direction === 'rtl' ? s.name_ar : s.name_en}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('warehouses.shelf.level')}</Label>
                          <Select 
                            value={shelfFormData.level || "none"}
                            onValueChange={(value) => setShelfFormData({ ...shelfFormData, level: value === "none" ? "" : value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t('warehouses.shelf.selectLevel')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">{t('warehouses.shelf.noLevel')}</SelectItem>
                              <SelectItem value="1">{t('warehouses.shelf.level1')}</SelectItem>
                              <SelectItem value="2">{t('warehouses.shelf.level2')}</SelectItem>
                              <SelectItem value="3">{t('warehouses.shelf.level3')}</SelectItem>
                              <SelectItem value="4">{t('warehouses.shelf.level4')}</SelectItem>
                              <SelectItem value="5">{t('warehouses.shelf.level5')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('warehouses.shelf.capacity')} *</Label>
                          <Input
                            type="number"
                            value={shelfFormData.capacity}
                            onChange={(e) => setShelfFormData({ ...shelfFormData, capacity: e.target.value })}
                            placeholder="200"
                            min="1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <Select 
                          value={shelfFormData.is_active ? t('warehouses.shelf.active') : t('warehouses.shelf.inactive')}
                          onValueChange={(value) => setShelfFormData({ ...shelfFormData, is_active: value === t('warehouses.shelf.active') })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={t('warehouses.shelf.active')}>{t('warehouses.shelf.active')}</SelectItem>
                            <SelectItem value={t('warehouses.shelf.inactive')}>{t('warehouses.shelf.inactive')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-right">
                          <Label>{t('warehouses.shelf.status')}</Label>
                          <p className="text-sm text-gray-600">{t('warehouses.shelf.statusDescription')}</p>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={handleSaveShelf}
                        disabled={!shelfFormData.code || !shelfFormData.capacity || !shelfFormData.storageId}
                      >
                        {editingShelf ? t('warehouses.shelf.saveChanges') : t('warehouses.shelf.save')}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="text-right">
                  <CardTitle>{t('warehouses.shelf.title')}</CardTitle>
                  <CardDescription>{t('warehouses.shelf.subtitle')}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder={t('warehouses.shelf.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                      dir="rtl"
                    />
                  </div>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('warehouses.shelf.filterAll')}</SelectItem>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {direction === 'rtl' ? w.name_ar : w.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Results Count */}
                <div className="text-right text-sm text-gray-600">
                  {t('warehouses.shelf.showing')} <span className="font-bold text-blue-600">{filteredShelves.length}</span> {t('warehouses.shelf.of')} {shelves.length} {t('warehouses.shelf.shelf')}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-right">
              <CardTitle>{t('warehouses.shelf.list')}</CardTitle>
              <CardDescription>{t('warehouses.shelf.listSubtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* View Toggle */}
              <Tabs defaultValue="grid" className="w-full" dir="rtl">
                <TabsList className="mb-4">
                  <TabsTrigger value="grid" className="gap-2">
                    <Grid3x3 className="w-4 h-4" />
                    {t('warehouses.shelf.viewGrid')}
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2">
                    <Package className="w-4 h-4" />
                    {t('warehouses.shelf.viewList')}
                  </TabsTrigger>
                </TabsList>

                {/* Grid View */}
                <TabsContent value="grid">
                  {filteredShelves.length === 0 ? (
                    <div className="text-center py-12" dir="rtl">
                      <Grid3x3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 text-lg">{t('warehouses.shelf.noShelves')}</p>
                      <p className="text-gray-400 text-sm mt-2">{t('warehouses.shelf.noShelvesSubtext')}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" dir="rtl">
                      {filteredShelves.map((shelf) => {
                        const used = shelf.used || 0;
                        const fillPercentage = shelf.capacity > 0 ? (used / shelf.capacity) * 100 : 0;
                        const isAlmostFull = fillPercentage >= 90;
                        const isNearFull = fillPercentage >= 70 && fillPercentage < 90;

                        return (
                          <Card
                            key={shelf.id}
                            className={`hover:shadow-lg transition-all ${isAlmostFull ? 'border-red-200 bg-red-50/30' :
                              isNearFull ? 'border-yellow-200 bg-yellow-50/30' :
                                'border-gray-200'
                              }`}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                {/* Header with Code */}
                                <div className="flex items-center justify-between">
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditShelf(shelf)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteShelf(shelf)}
                                      className="h-8 w-8 p-0"
                                      disabled={(shelf.used ?? 0) > 0}
                                    >
                                      <Trash2 className={`w-4 h-4 ${(shelf.used ?? 0) > 0 ? 'text-gray-300' : 'text-red-600'}`} />
                                    </Button>
                                  </div>
                                  <Badge variant="outline" className="font-mono text-base px-3 py-1 font-bold">
                                    {shelf.code}
                                  </Badge>
                                </div>

                                {/* Warehouse Info */}
                                <div className="text-right space-y-1">
                                  <p className="text-sm font-medium text-gray-900">{shelf.warehouse}</p>
                                  {shelf.storage && (
                                    <p className="text-xs text-gray-600">{shelf.storage}</p>
                                  )}
                                  <div className="flex items-center gap-1 justify-end flex-wrap">
                                    {shelf.level && (
                                      <Badge variant="secondary" className="text-xs">
                                        {t('warehouses.shelf.level')} {shelf.level}
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {/* Capacity Visualization */}
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className={`font-medium ${isAlmostFull ? 'text-red-600' :
                                      isNearFull ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>
                                      {fillPercentage.toFixed(0)}%
                                    </span>
                                    <span className="text-gray-600">{used} / {shelf.capacity}</span>
                                  </div>
                                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full ${getShelfFillColor(fillPercentage)} transition-all`}
                                      style={{ width: `${fillPercentage}%` }}
                                    />
                                  </div>
                                </div>

                                {/* Products & Status */}
                                <div className="flex items-center justify-between pt-2 border-t">
                                  <Badge
                                    variant={shelf.status === t('warehouses.shelf.active') ? 'default' : shelf.status === 'صيانة' ? 'destructive' : 'secondary'}
                                  >
                                    {shelf.status}
                                  </Badge>
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Boxes className="w-3 h-3" />
                                    <span>{shelf.products} {t('warehouses.shelf.products')}</span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* List View */}
                <TabsContent value="list">
                  {filteredShelves.length === 0 ? (
                    <div className="text-center py-12" dir="rtl">
                      <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-gray-500 text-lg">{t('warehouses.shelf.noShelves')}</p>
                      <p className="text-gray-400 text-sm mt-2">{t('warehouses.shelf.noShelvesSubtext')}</p>
                    </div>
                  ) : (
                    <div dir="rtl" className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-right">{t('warehouses.shelf.code')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.shelf.warehouse')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.shelf.storage')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.shelf.level')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.shelf.capacity')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.list.user')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.list.fillPercentage')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.shelf.products')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.list.status')}</TableHead>
                            <TableHead className="text-right">{t('warehouses.list.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredShelves.map((shelf) => {
                            const used = shelf.used || 0;
                            const fillPercentage = shelf.capacity > 0 ? (used / shelf.capacity) * 100 : 0;
                            const isAlmostFull = fillPercentage >= 90;
                            const isNearFull = fillPercentage >= 70 && fillPercentage < 90;

                            return (
                              <TableRow
                                key={shelf.id}
                                className={isAlmostFull ? 'bg-red-50/50' : ''}
                              >
                                <TableCell className="text-right">
                                  <Badge variant="outline" className="font-mono font-bold text-base px-3 py-1">
                                    {shelf.code}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">{shelf.warehouse}</TableCell>
                                <TableCell className="text-right">{shelf.storage || '-'}</TableCell>
                                <TableCell className="text-right">
                                  {shelf.level ? (
                                    <Badge variant="secondary">المستوى {shelf.level}</Badge>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-medium">{shelf.capacity}</TableCell>
                                <TableCell className="text-right font-bold text-blue-600">{used}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-2 justify-start">
                                    <span className={`text-sm font-bold ${isAlmostFull ? 'text-red-600' :
                                      isNearFull ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>
                                      {fillPercentage.toFixed(0)}%
                                    </span>
                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full ${getShelfFillColor(fillPercentage)} transition-all`}
                                        style={{ width: `${fillPercentage}%` }}
                                      />
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center gap-1 text-sm text-gray-600">
                                    <Boxes className="w-3 h-3" />
                                    <span>{shelf.products} {t('warehouses.shelf.products')}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge
                                    variant={shelf.status === t('warehouses.shelf.active') ? 'default' : shelf.status === 'صيانة' ? 'destructive' : 'secondary'}
                                  >
                                    {shelf.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditShelf(shelf)}
                                      className="gap-1"
                                    >
                                      <Edit className="w-4 h-4" />
                                      {t('warehouses.shelf.editButton')}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteShelf(shelf)}
                                      className="gap-1"
                                      disabled={(shelf.used ?? 0) > 0}
                                      title={(shelf.used ?? 0) > 0 ? t('warehouses.shelf.cannotDelete') : ''}
                                    >
                                      <Trash2 className={`w-4 h-4 ${(shelf.used ?? 0) > 0 ? 'text-gray-400' : 'text-red-600'}`} />
                                      {t('warehouses.shelf.deleteButton')}
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
