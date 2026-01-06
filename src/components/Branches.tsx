import { useState, useEffect } from 'react';
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
import { MapPin, Plus, Users, Edit, Trash2, Star, Building2, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '../contexts/LanguageContext';
import { getBranches, createBranch, updateBranch, deleteBranch, getInstitutions, getInstitutionEmployees, type Branch, type CreateBranchRequest, type Institution, type InstitutionEmployee } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';

export function Branches() {
  const { t, direction } = useLanguage();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionEmployees, setInstitutionEmployees] = useState<InstitutionEmployee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name_ar: '',
    name_en: '',
    institution_id: '',
    location_name_ar: '',
    location_name_en: '',
    is_main: false,
    phone_number: '',
    email: '',
    is_active: true
  });

  useEffect(() => {
    fetchBranches();
    fetchInstitutions();
  }, []);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const result = await getBranches({ per_page: 100 });
      if (result.success) {
        const branchesData = result.data.branches;
        const branchesList = branchesData?.data || (Array.isArray(branchesData) ? branchesData : []);
        setBranches(branchesList);
      } else {
        toast.error(result.message || t('branches.messages.loadFailed'));
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error(t('branches.messages.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    try {
      const result = await getInstitutions({ per_page: 100 });
      if (result.success) {
        const institutionsData = result.data.institutions;
        const institutionsList = institutionsData?.data || (Array.isArray(institutionsData) ? institutionsData : []);
        setInstitutions(institutionsList);
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
    }
  };

  const fetchInstitutionEmployees = async (institutionId: number) => {
    if (!institutionId) {
      setInstitutionEmployees([]);
      return;
    }
    
    setIsLoadingEmployees(true);
    try {
      const result = await getInstitutionEmployees(institutionId);
      if (result.success) {
        setInstitutionEmployees(result.data.employees || []);
      } else {
        console.error('Error fetching employees:', result.message);
        setInstitutionEmployees([]);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      setInstitutionEmployees([]);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleAddBranch = () => {
    setEditingBranch(null);
    setSelectedEmployees([]);
    setInstitutionEmployees([]);
    setFormData({
      name_ar: '',
      name_en: '',
      institution_id: '',
      location_name_ar: '',
      location_name_en: '',
      is_main: false,
      phone_number: '',
      email: '',
      is_active: true
    });
    setIsDialogOpen(true);
  };

  const handleEditBranch = async (branch: Branch) => {
    setEditingBranch(branch);
    setSelectedEmployees([]);
    setFormData({
      name_ar: branch.name_ar || '',
      name_en: branch.name_en || '',
      institution_id: branch.institution_id.toString(),
      location_name_ar: branch.location_name_ar || '',
      location_name_en: branch.location_name_en || '',
      is_main: branch.is_main || false,
      phone_number: branch.phone_number || '',
      email: branch.email || '',
      is_active: branch.is_active ?? true
    });
    
    // Fetch employees for this branch's institution
    if (branch.institution_id) {
      await fetchInstitutionEmployees(branch.institution_id);
    }
    
    setIsDialogOpen(true);
  };

  const handleInstitutionChange = (institutionId: string) => {
    setFormData({ ...formData, institution_id: institutionId });
    setSelectedEmployees([]);
    if (institutionId) {
      fetchInstitutionEmployees(parseInt(institutionId));
    } else {
      setInstitutionEmployees([]);
    }
  };

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleDeleteBranch = async (branchId: number) => {
    const branch = branches.find(b => b.id === branchId);
    if (branch?.is_main) {
      toast.error(t('branches.messages.cannotDeleteMain'));
      return;
    }
    
    try {
      const result = await deleteBranch(branchId);
      if (result.success) {
        toast.success(t('branches.messages.deleteSuccess'));
        fetchBranches();
      } else {
        toast.error(result.message || t('branches.messages.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error(t('branches.messages.deleteFailed'));
    }
  };

  const handleSaveBranch = async () => {
    if (!formData.name_ar || !formData.name_en || !formData.institution_id || !formData.location_name_ar || !formData.location_name_en) {
      toast.error(t('branches.messages.validation.requiredFields'));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBranchRequest = {
        name_ar: formData.name_ar.trim(),
        name_en: formData.name_en.trim(),
        institution_id: parseInt(formData.institution_id),
        location_name_ar: formData.location_name_ar.trim(),
        location_name_en: formData.location_name_en.trim(),
        is_main: formData.is_main || false,
        is_active: formData.is_active ?? true
      };

      if (formData.phone_number.trim()) {
        payload.phone_number = formData.phone_number.trim();
      }
      if (formData.email.trim()) {
        payload.email = formData.email.trim();
      }

      const result = editingBranch
        ? await updateBranch(editingBranch.id, payload)
        : await createBranch(payload);

      if (result.success) {
        toast.success(editingBranch ? t('branches.messages.updateSuccess') : t('branches.messages.createSuccess'));
        setIsDialogOpen(false);
        setEditingBranch(null);
        fetchBranches();
      } else {
        if (result.errors) {
          const errorMessages = Object.values(result.errors).flat();
          toast.error(errorMessages[0] || result.message);
        } else {
          toast.error(result.message || (editingBranch ? t('branches.messages.updateFailed') : t('branches.messages.createFailed')));
        }
      }
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error(editingBranch ? t('branches.messages.updateFailed') : t('branches.messages.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeBranches = branches.filter(b => b.is_active).length;

  const isSuperAdmin = () => {
    const authUser = getStoredUser();
    return authUser?.is_system_owner_admin === true;
  };

  return (
    <div className="space-y-6" dir={direction}>
      {/* Header */}
      <div className={`flex items-center ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} justify-between gap-4`}>
        <div className={`flex-1 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
          <h1 className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.title')}</h1>
          <p className={`text-gray-600 ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>{t('branches.subtitle')}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            {isSuperAdmin() && (
              <Button onClick={handleAddBranch} className={`gap-2 shrink-0 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                <Plus className="w-4 h-4" />
                <span>{t('branches.newBranch')}</span>
              </Button>
            )}
          </DialogTrigger>
          <DialogContent
            className="!max-w-none w-[95vw] sm:w-[90vw] md:w-[85vw] lg:w-[75vw] xl:w-[65vw] 2xl:w-[55vw] max-h-[90vh] overflow-y-auto"
            dir={direction}
          >
            <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
              <DialogTitle className={`text-xl ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
                {editingBranch ? t('branches.form.editTitle') : t('branches.form.addTitle')}
              </DialogTitle>
              <DialogDescription className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                {editingBranch ? t('branches.form.editDescription') : t('branches.form.addDescription')}
              </DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="basic" className="mt-4" dir={direction}>
              <TabsList className="grid w-full grid-cols-3 gap=">
                <TabsTrigger value="basic" className="gap-2">
                  <Building2 className="w-4 h-4" />
                  {t('branches.form.basicInfo')}
                </TabsTrigger>
                <TabsTrigger value="contact" className="gap-2">
                  <Phone className="w-4 h-4" />
                  {t('branches.form.contactInfo')}
                </TabsTrigger>
                <TabsTrigger value="employees" className="gap-1">
                  <Users className="w-4 h-4" />
                  {t('branches.form.employees')}
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Basic Information */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                {/* Main Branch Toggle */}
           
                <div className={`flex items-center justify-between p-4 border-2 rounded-lg bg-amber-50 border-amber-300 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex items-center gap-3 ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Star className="w-6 h-6 text-amber-600" />
                    <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      <Label className="font-bold text-base">{t('branches.form.mainBranch')}</Label>
                      <p className="text-sm text-gray-600 mt-1">{t('branches.form.mainBranchDescription')}</p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_main}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_main: checked })}
                  />
                </div>
            
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">{t('branches.form.nameAr')} *</Label>
                    <Input
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      placeholder={t('branches.form.nameArPlaceholder')}
                      className="text-lg"
                      dir={direction}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">{t('branches.form.nameEn')} *</Label>
                    <Input
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      placeholder={t('branches.form.nameEnPlaceholder')}
                      className="text-lg"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-base">{t('branches.form.institution')} *</Label>
                  <Select
                    value={formData.institution_id}
                    onValueChange={handleInstitutionChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('branches.form.institutionPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id.toString()}>
                          {direction === 'rtl' ? institution.name_ar : institution.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">{t('branches.form.locationAr')} *</Label>
                    <Input
                      value={formData.location_name_ar}
                      onChange={(e) => setFormData({ ...formData, location_name_ar: e.target.value })}
                      placeholder={t('branches.form.locationArPlaceholder')}
                      dir={direction}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">{t('branches.form.locationEn')} *</Label>
                    <Input
                      value={formData.location_name_en}
                      onChange={(e) => setFormData({ ...formData, location_name_en: e.target.value })}
                      placeholder={t('branches.form.locationEnPlaceholder')}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 border rounded-lg ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                    <Label className="text-base">{t('branches.form.isActive')}</Label>
                    <p className="text-sm text-gray-600">{t('branches.form.isActiveDescription')}</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </TabsContent>

              {/* Tab 2: Contact Information */}
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>{t('branches.form.phoneNumber')}</Label>
                  <Input
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    placeholder={t('branches.form.phoneNumberPlaceholder')}
                    dir="ltr"
                    type="tel"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t('branches.form.email')}</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    type="email"
                    placeholder={t('branches.form.emailPlaceholder')}
                    dir="ltr"
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Employees */}
              <TabsContent value="employees" className="space-y-4 mt-4">
                {!formData.institution_id ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>{t('branches.form.selectInstitutionFirst')}</p>
                  </div>
                ) : isLoadingEmployees ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label className="text-base">{t('branches.form.employees')}</Label>
                      <p className="text-sm text-gray-600">
                        {t('branches.form.employeesHelp')} ({selectedEmployees.length} {t('branches.form.selected')})
                      </p>
                    </div>
                    {institutionEmployees.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>{t('branches.form.noEmployees')}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                        {institutionEmployees.map((employee) => {
                          const user = employee.user;
                          const role = employee.institution_role;
                          if (!user) return null;
                          
                          return (
                            <div
                              key={employee.id}
                              onClick={() => toggleEmployee(user.id)}
                              className={`flex items-center gap-3 h-10 px-3 border rounded-md cursor-pointer transition-colors ${
                                selectedEmployees.includes(user.id)
                                  ? 'bg-blue-50 border-blue-300'
                                  : 'bg-background border-input hover:border-gray-400'
                              }`}
                              dir={direction}
                            >
                              <input
                                type="checkbox"
                                checked={selectedEmployees.includes(user.id)}
                                onChange={() => {}}
                                className="w-4 h-4 cursor-pointer shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'} truncate`}>
                                  {user.first_name + ' ' + user.last_name ||`User ${user.id}`}
                                </p>
                                <p className="text-xs text-gray-600 mt-1"> {role?.name_ar || role?.name_en || ''}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>

            {/* Save Button */}
            <div className="flex gap-3 pt-4 border-t mt-6">
              <Button
                className="flex-1"
                onClick={handleSaveBranch}
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {t('branches.messages.saving')}
                  </>
                ) : (
                  editingBranch ? t('branches.form.saveChanges') : t('branches.form.addBranch')
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                size="lg"
                disabled={isSubmitting}
              >
                {t('branches.form.cancel')}
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
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-2xl font-bold">{branches.length}</div>
                <p className="text-xs text-gray-600 mt-1">
                  {activeBranches} {t('branches.stats.activeBranches')}
                </p>
              </>
            )}
            </CardContent>
            
          </Card>
         
          {!isSuperAdmin() && (
        <Card>
          <CardHeader className={`flex flex-row items-center ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'} justify-between pb-2`}>
            <Star className="w-4 h-4 text-amber-600" />
            <CardTitle className="text-sm">{t('branches.stats.mainBranch')}</CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <>
                <div className="text-lg font-bold">
                  {direction === 'rtl' 
                    ? branches.find(b => b.is_main)?.name_ar || t('branches.stats.notSet')
                    : branches.find(b => b.is_main)?.name_en || t('branches.stats.notSet')}
                </div>
                <p className="text-xs text-gray-600 mt-1">{t('branches.stats.mainBranchActive')}</p>
              </>
            )}
          </CardContent>
        </Card>
          )}
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
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.type')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.branchName')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.institution')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.location')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.phone')}</TableHead>
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.status')}</TableHead>
                  {isSuperAdmin() && (
                  <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>{t('branches.table.actions')}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                    </TableCell>
                  </TableRow>
                ) : branches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      {t('branches.table.noBranches')}
                    </TableCell>
                  </TableRow>
                ) : (
                  branches.map((branch) => (
                    <TableRow key={branch.id}>
                      <TableCell>
                        {branch.is_main && (
                          <Badge className="bg-amber-100 text-amber-700 gap-1">
                            <Star className="w-3 h-3" />
                            {t('branches.table.main')}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {direction === 'rtl' ? branch.name_ar : branch.name_en}
                      </TableCell>
                      <TableCell>
                        {branch.institution 
                          ? (direction === 'rtl' ? branch.institution.name_ar : branch.institution.name_en)
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {direction === 'rtl' ? branch.location_name_ar : branch.location_name_en}
                      </TableCell>
                      <TableCell dir="ltr" className="text-sm">{branch.phone_number || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={branch.is_active ? 'default' : 'secondary'}>
                          {branch.is_active ? t('branches.table.active') : t('branches.table.inactive')}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin() && (
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
                          {!branch.is_main && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBranch(branch.id)}
                              className="gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                              {t('branches.table.delete')}
                            </Button>
                          )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

