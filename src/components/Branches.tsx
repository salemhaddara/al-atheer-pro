import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { MapPin, Plus, Users, Edit, Trash2, Star, Building2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';

export function Branches() {
  const { t, direction } = useLanguage();

  const [branches, setBranches] = useState([
    {
      id: '1',
      name: 'الفرع الرئيسي',
      nameEn: 'Main Branch',
      isMain: true,
      company: 'شركة الأمل للتجارة',
      city: 'الرياض',
      address: 'طريق الملك فهد، حي العليا',
      phone: '0112345678',
      mobile: '0501234567',
      email: 'main@alamal.com',
      manager: 'أحمد محمد',
      employeeIds: ['1', '2', '3', '4', '5'],
      status: 'نشط',
      notes: ''
    },
    {
      id: '2',
      name: 'فرع الشمال',
      nameEn: 'North Branch',
      isMain: false,
      company: 'شركة الأمل للتجارة',
      city: 'الرياض',
      address: 'حي النرجس، طريق الأمير محمد',
      phone: '0112345679',
      mobile: '0501234568',
      email: 'north@alamal.com',
      manager: 'فاطمة علي',
      employeeIds: ['6', '7', '8'],
      status: 'نشط',
      notes: ''
    },
    {
      id: '3',
      name: 'فرع جدة',
      nameEn: 'Jeddah Branch',
      isMain: false,
      company: 'شركة الأمل للتجارة',
      city: 'جدة',
      address: 'حي الروضة، شارع التحلية',
      phone: '0122345678',
      mobile: '0551234567',
      email: 'jeddah@alamal.com',
      manager: 'سعيد خالد',
      employeeIds: ['9', '10', '11', '12'],
      status: 'نشط',
      notes: ''
    }
  ]);

  const [employees] = useState([
    { id: '1', name: 'أحمد محمد', position: 'مدير' },
    { id: '2', name: 'فاطمة علي', position: 'محاسبة' },
    { id: '3', name: 'سعيد خالد', position: 'مبيعات' },
    { id: '4', name: 'نورة عبدالله', position: 'موارد بشرية' },
    { id: '5', name: 'محمد أحمد', position: 'مبيعات' },
    { id: '6', name: 'خالد سعيد', position: 'محاسبة' },
    { id: '7', name: 'ليلى حسن', position: 'مبيعات' },
    { id: '8', name: 'عمر علي', position: 'موظف استقبال' },
    { id: '9', name: 'هند محمد', position: 'مديرة' },
    { id: '10', name: 'طارق عبدالله', position: 'محاسب' },
    { id: '11', name: 'سارة خالد', position: 'مبيعات' },
    { id: '12', name: 'يوسف أحمد', position: 'مبيعات' }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<any>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    isMain: false,
    company: '',
    city: '',
    address: '',
    phone: '',
    mobile: '',
    email: '',
    manager: '',
    status: 'نشط',
    notes: ''
  });

  const handleAddBranch = () => {
    setEditingBranch(null);
    setSelectedEmployees([]);
    setFormData({
      name: '',
      isMain: false,
      company: '',
      city: '',
      address: '',
      phone: '',
      mobile: '',
      email: '',
      manager: '',
      status: 'نشط',
      notes: ''
    });
    setIsDialogOpen(true);
  };

  const handleEditBranch = (branch: any) => {
    setEditingBranch(branch);
    setSelectedEmployees(branch.employeeIds || []);
    setFormData({
      name: branch.name,
      isMain: branch.isMain,
      company: branch.company,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      mobile: branch.mobile,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
      notes: branch.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteBranch = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch?.isMain) {
      toast.error('لا يمكن حذف الفرع الرئيسي');
      return;
    }
    setBranches(branches.filter(b => b.id !== branchId));
    toast.success('تم حذف الفرع بنجاح');
  };

  const handleSaveBranch = () => {
    if (!formData.name || !formData.company) {
      toast.error('الرجاء إدخال اسم الفرع والشركة');
      return;
    }

    toast.success(editingBranch ? 'تم تحديث الفرع بنجاح' : 'تم إضافة الفرع بنجاح');
    setIsDialogOpen(false);
    setEditingBranch(null);
  };

  const toggleEmployee = (empId: string) => {
    setSelectedEmployees(prev =>
      prev.includes(empId)
        ? prev.filter(id => id !== empId)
        : [...prev, empId]
    );
  };

  const totalEmployees = branches.reduce((sum, branch) => sum + branch.employeeIds.length, 0);

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} justify-between gap-4`}>
        <div className={`flex-1 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <h1 className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.title')}</h1>
          <p className={`text-gray-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>إدارة الفروع والموظفين</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddBranch} className={`gap-2 shrink-0 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
              <Plus className="w-4 h-4" />
              <span>{t('branches.newBranch')}</span>
            </Button>
          </DialogTrigger>
          <DialogContent
            className="!max-w-none w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] 2xl:w-[55vw] max-h-[90vh] overflow-y-auto"
            dir={direction}
          >
            <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
              <DialogTitle className={`text-xl ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                {editingBranch ? 'تعديل الفرع' : 'إضافة فرع جديد'}
              </DialogTitle>
              <DialogDescription className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                {editingBranch ? 'قم بتحديث بيانات الفرع وموظفيه' : 'أدخل المعلومات الأساسية للفرع'}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4" dir={direction}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  المعلومات الأساسية
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-2">
                  <Phone className="w-4 h-4" />
                  معلومات التواصل
                </TabsTrigger>
                <TabsTrigger value="employees" className="gap-2">
                  <Users className="w-4 h-4" />
                  الموظفين ({selectedEmployees.length})
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Information */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* Main Branch Toggle */}
                <div className={`flex items-center justify-between p-4 border-2 rounded-lg bg-amber-50 border-amber-300 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Star className="w-6 h-6 text-amber-600" />
                    <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      <Label className="font-bold text-base">فرع رئيسي</Label>
                      <p className="text-sm text-gray-600 mt-1">تحديد هذا الفرع كفرع رئيسي للشركة</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.isMain}
                    onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">اسم الفرع *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="مثال: الفرع الرئيسي"
                      className="text-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">الشركة *</Label>
                    <Select
                      value={formData.company}
                      onValueChange={(value) => setFormData({ ...formData, company: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر الشركة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="شركة الأمل للتجارة">{t('sidebar.companies.alamal')}</SelectItem>
                        <SelectItem value="شركة النجاح التقنية">{t('sidebar.companies.alnajah')}</SelectItem>
                        <SelectItem value="مؤسسة الريادة للخدمات">{t('sidebar.companies.alreyada')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المدينة</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="الرياض، جدة، الدمام..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>العنوان</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="حي، شارع، مبنى..."
                    />
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 border rounded-lg ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label className="text-base">حالة الفرع</Label>
                    <p className="text-sm text-gray-600">تفعيل أو تعطيل الفرع</p>
                  </div>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="نشط">نشط</SelectItem>
                      <SelectItem value="غير نشط">غير نشط</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Tab 2: Contact Information */}
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>رقم الهاتف</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="011XXXXXXX"
                      dir="ltr"
                      type="tel"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الجوال</Label>
                    <Input
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>البريد الإلكتروني</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    placeholder="branch@company.com"
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>ملاحظات</Label>
                  <Textarea
                    rows={4}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="أدخل أي ملاحظات إضافية عن الفرع..."
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Employees */}
              <TabsContent value="employees" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-base">مدير الفرع</Label>
                  <Select
                    value={formData.manager}
                    onValueChange={(value) => setFormData({ ...formData, manager: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مدير الفرع" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.name}>
                          {emp.name} - {emp.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-base">موظفي الفرع</Label>
                  <p className="text-sm text-gray-600">
                    اختر الموظفين المرتبطين بهذا الفرع ({selectedEmployees.length} محدد)
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 border rounded-lg bg-gray-50">
                    {employees.map(emp => (
                      <div
                        key={emp.id}
                        onClick={() => toggleEmployee(emp.id)}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${selectedEmployees.includes(emp.id)
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={() => { }}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{emp.name}</p>
                          <p className="text-xs text-gray-600">{emp.position}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t mt-6">
              <Button
                className="flex-1"
                onClick={handleSaveBranch}
                size="lg"
              >
                {editingBranch ? 'حفظ التغييرات' : 'إضافة الفرع'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                size="lg"
              >
                إلغاء
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className={`flex flex-row items-center ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} justify-between pb-2`}>
            <MapPin className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-sm">{t('branches.stats.totalBranches')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-gray-600 mt-1">
              {branches.filter(b => b.status === 'نشط').length} {t('branches.stats.activeBranches')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={`flex flex-row items-center ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} justify-between pb-2`}>
            <Users className="w-4 h-4 text-green-600" />
            <CardTitle className="text-sm">{t('branches.stats.totalEmployees')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-gray-600 mt-1">{t('branches.stats.inAllBranches')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className={`flex flex-row items-center ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} justify-between pb-2`}>
            <Star className="w-4 h-4 text-amber-600" />
            <CardTitle className="text-sm">الفرع الرئيسي</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            <div className="text-lg font-bold">{branches.find(b => b.isMain)?.name || 'غير محدد'}</div>
            <p className="text-xs text-gray-600 mt-1">الفرع الرئيسي النشط</p>
          </CardContent>
        </Card>
      </div>

      {/* Branches Table */}
      <Card>
        <CardHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <CardTitle>{t('branches.list.title')}</CardTitle>
          <CardDescription>{t('branches.list.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div dir={direction} className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>النوع</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.branchName')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.company')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.city')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.phone')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.manager')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.employees')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.status')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell>
                      {branch.isMain && (
                        <Badge className="bg-amber-100 text-amber-700 gap-1">
                          <Star className="w-3 h-3" />
                          رئيسي
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{direction === 'rtl' ? branch.name : branch.nameEn}</TableCell>
                    <TableCell>{branch.company}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell dir="ltr" className="text-sm">{branch.phone}</TableCell>
                    <TableCell>{branch.manager}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Users className="w-3 h-3" />
                        {branch.employeeIds.length}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={branch.status === 'نشط' ? 'default' : 'secondary'}>{branch.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBranch(branch)}
                          className="gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          {t('branches.table.edit')}
                        </Button>
                        {!branch.isMain && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
