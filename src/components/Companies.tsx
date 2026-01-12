import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Building2, Plus, MapPin, Users, TrendingUp, Loader2, Trash2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { getInstitutions, createInstitution, updateInstitution, deleteInstitution, getUsers, getInstitutionStatistics, type Institution, type CreateInstitutionRequest, type User, type InstitutionStatistics } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { SearchableSelect, type SearchableSelectOption } from './ui/searchable-select';

interface InstitutionFormData {
  name_ar: string;
  name_en: string;
  activity_ar: string;
  activity_en: string;
  phone_number: string;
  secondary_phone_number: string;
  email: string;
  website: string;
  address: string;
  country: string;
  tax_number: string;
  business_registry: string;
  system_type: 'restaurant' | 'retail';
  default_currency: string;
  notes: string;
}

export function Companies() {
  const { t, direction } = useLanguage();
  const { currentUser } = useUser();
  
  // Check if user is super admin (system owner admin)
  const isSuperAdmin = () => {
    const authUser = getStoredUser();
    return authUser?.is_system_owner_admin === true;
  };
  const [companies, setCompanies] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<Institution | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedAdminUserId, setSelectedAdminUserId] = useState<string>('');
  const [statistics, setStatistics] = useState<InstitutionStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [deletingInstitutionId, setDeletingInstitutionId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<InstitutionFormData>({
    name_ar: '',
    name_en: '',
    activity_ar: '',
    activity_en: '',
    phone_number: '',
    secondary_phone_number: '',
    email: '',
    website: '',
    address: '',
    country: 'Saudi Arabia',
    tax_number: '',
    business_registry: '',
    system_type: 'retail',
    default_currency: 'SAR',
    notes: ''
  });

  // Fetch institutions from API
  useEffect(() => {
    fetchInstitutions();
    fetchUsers();
    fetchStatistics();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const result = await getUsers({ per_page: 100 });
      if (result.success && result.data) {
        const usersData = result.data.users;
        const usersList = Array.isArray(usersData) ? usersData : [];
        setUsers(usersList);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const result = await getInstitutions({ per_page: 100 });
      if (result.success) {
        // Handle paginated response
        const institutionsData = result.data.institutions;
        const institutionsList = institutionsData?.data || (Array.isArray(institutionsData) ? institutionsData : []);
        setCompanies(institutionsList);
      } else {
        toast.error(result.message || t('institutions.messages.loadFailed'));
      }
    } catch (error) {
      console.error('Error fetching institutions:', error);
      toast.error(t('institutions.messages.networkError'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    setIsLoadingStats(true);
    try {
      const result = await getInstitutionStatistics();
      if (result.success && result.data) {
        setStatistics(result.data.statistics);
      } else {
        console.error('Failed to fetch statistics:', result.message);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleEdit = (institution: Institution) => {
    setEditingInstitution(institution);
    setFormData({
      name_ar: institution.name_ar || '',
      name_en: institution.name_en || '',
      activity_ar: institution.activity_ar || '',
      activity_en: institution.activity_en || '',
      phone_number: institution.phone_number || '',
      secondary_phone_number: institution.secondary_phone_number || '',
      email: institution.email || '',
      website: institution.website || '',
      address: institution.address || '',
      country: institution.country || 'Saudi Arabia',
      tax_number: institution.tax_number || '',
      business_registry: institution.business_registry || '',
      system_type: institution.system_type || 'retail',
      default_currency: institution.default_currency || 'SAR',
      notes: institution.notes || ''
    });
    // Set logo preview if exists
    if (institution.logo_url) {
      setLogoPreview(institution.logo_url);
    } else {
      setLogoPreview(null);
    }
    setLogoFile(null);
    // Note: admin_user_id is not editable when updating
    setSelectedAdminUserId('');
    setIsDialogOpen(true);
  };

  const handleDelete = async (institution: Institution) => {
    setDeletingInstitutionId(institution.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingInstitutionId) return;

    try {
      const result = await deleteInstitution(deletingInstitutionId);
      if (result.success) {
        toast.success(t('institutions.messages.deleteSuccess'));
        // Refresh institutions list and statistics
        fetchInstitutions();
        fetchStatistics();
      } else {
        toast.error(result.message || t('institutions.messages.deleteFailed'));
      }
    } catch (error) {
      console.error('Error deleting institution:', error);
      toast.error(t('institutions.messages.deleteFailed'));
    } finally {
      setIsDeleteDialogOpen(false);
      setDeletingInstitutionId(null);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInstitution(null);
    setSelectedAdminUserId('');
    setLogoFile(null);
    setLogoPreview(null);
    // Reset form
    setFormData({
      name_ar: '',
      name_en: '',
      activity_ar: '',
      activity_en: '',
      phone_number: '',
      secondary_phone_number: '',
      email: '',
      website: '',
      address: '',
      country: 'Saudi Arabia',
      tax_number: '',
      business_registry: '',
      system_type: 'retail',
      default_currency: 'SAR',
      notes: ''
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('institutions.messages.invalidImageType') || 'Please select a valid image file');
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t('institutions.messages.imageTooLarge') || 'Image size must be less than 5MB');
        return;
      }
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    // Reset file input
    const fileInput = document.getElementById('logo-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name_ar.trim() || !formData.name_en.trim()) {
      toast.error(t('institutions.messages.validation.nameArRequired'));
      return;
    }
    if (!formData.activity_ar.trim() || !formData.activity_en.trim()) {
      toast.error(t('institutions.messages.validation.activityRequired'));
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error(t('institutions.messages.validation.phoneRequired'));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t('institutions.messages.validation.emailRequired'));
      return;
    }
    if (!formData.country.trim()) {
      toast.error(t('institutions.messages.validation.countryRequired'));
      return;
    }

    // For new institutions, admin_user_id is required
    if (!editingInstitution && !selectedAdminUserId) {
      toast.error(t('institutions.messages.validation.adminUserRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingInstitution) {
        // Update existing institution
        const updatePayload: Partial<CreateInstitutionRequest> = {
          name_ar: formData.name_ar.trim(),
          name_en: formData.name_en.trim(),
          activity_ar: formData.activity_ar.trim(),
          activity_en: formData.activity_en.trim(),
          phone_number: formData.phone_number.trim(),
          email: formData.email.trim(),
          country: formData.country.trim(),
          system_type: formData.system_type,
        };

        // Add optional fields if provided
        if (formData.secondary_phone_number.trim()) {
          updatePayload.secondary_phone_number = formData.secondary_phone_number.trim();
        }
        if (formData.website.trim()) {
          updatePayload.website = formData.website.trim();
        }
        if (formData.address.trim()) {
          updatePayload.address = formData.address.trim();
        }
        if (formData.tax_number.trim()) {
          updatePayload.tax_number = formData.tax_number.trim();
        }
        if (formData.business_registry.trim()) {
          updatePayload.business_registry = formData.business_registry.trim();
        }
        if (formData.default_currency.trim()) {
          updatePayload.default_currency = formData.default_currency.trim();
        }
        if (formData.notes.trim()) {
          updatePayload.notes = formData.notes.trim();
        }

        const result = await updateInstitution(editingInstitution.id, updatePayload);

        if (result.success) {
          toast.success(t('institutions.messages.updateSuccess'));
          handleCloseDialog();
          // Refresh institutions list and statistics
          fetchInstitutions();
          fetchStatistics();
        } else {
          // Handle validation errors
          if (result.errors) {
            const errorMessages = Object.values(result.errors).flat();
            toast.error(errorMessages[0] || result.message);
          } else {
            toast.error(result.message || t('institutions.messages.updateFailed'));
          }
        }
      } else {
        // Create new institution
        const payload: CreateInstitutionRequest = {
          name_ar: formData.name_ar.trim(),
          name_en: formData.name_en.trim(),
          activity_ar: formData.activity_ar.trim(),
          activity_en: formData.activity_en.trim(),
          phone_number: formData.phone_number.trim(),
          email: formData.email.trim(),
          country: formData.country.trim(),
          system_type: formData.system_type,
          admin_user_id: parseInt(selectedAdminUserId), // Selected user becomes the admin
        };

        // Add optional fields if provided
        if (formData.secondary_phone_number.trim()) {
          payload.secondary_phone_number = formData.secondary_phone_number.trim();
        }
        if (formData.website.trim()) {
          payload.website = formData.website.trim();
        }
        if (formData.address.trim()) {
          payload.address = formData.address.trim();
        }
        if (formData.tax_number.trim()) {
          payload.tax_number = formData.tax_number.trim();
        }
        if (formData.business_registry.trim()) {
          payload.business_registry = formData.business_registry.trim();
        }
        if (formData.default_currency.trim()) {
          payload.default_currency = formData.default_currency.trim();
        }
        if (formData.notes.trim()) {
          payload.notes = formData.notes.trim();
        }

        const result = await createInstitution(payload);

        if (result.success) {
          toast.success(t('institutions.messages.createSuccess'));
          handleCloseDialog();
          // Refresh institutions list and statistics
          fetchInstitutions();
          fetchStatistics();
        } else {
          // Handle validation errors
          if (result.errors) {
            const errorMessages = Object.values(result.errors).flat();
            toast.error(errorMessages[0] || result.message);
          } else {
            toast.error(result.message || t('institutions.messages.createFailed'));
          }
        }
      }
    } catch (error) {
      console.error('Error saving institution:', error);
      toast.error(editingInstitution 
        ? t('institutions.messages.updateFailed') 
        : t('institutions.messages.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className={`${direction === 'rtl' ? 'text-right' : 'text-left'} flex-1`}>
          <h1>{t('institutions.title')}</h1>
          <p className="text-gray-600">{t('institutions.subtitle')}</p>
        </div>
       
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open) {
              // Opening dialog - reset editing state for new institution
              setEditingInstitution(null);
              setSelectedAdminUserId('');
              setLogoFile(null);
              setLogoPreview(null);
            } else {
              // Closing dialog - reset form
              handleCloseDialog();
            }
          }}>
             {isSuperAdmin() && (
            <DialogTrigger asChild>
              <Button className="gap-2 shrink-0">
                <Plus className="w-4 h-4" />
                {t('institutions.addNew')}
              </Button>
            </DialogTrigger>
             )}
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" dir={direction}>
            <DialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
              <DialogTitle>
                {editingInstitution ? t('institutions.editTitle') : t('institutions.addTitle')}
              </DialogTitle>
              <DialogDescription>
                {editingInstitution ? t('institutions.editDescription') : t('institutions.addDescription')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Required Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('institutions.form.nameAr')}</Label>
                  <Input 
                    placeholder={t('institutions.form.nameArPlaceholder')} 
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    dir={direction}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('institutions.form.nameEn')}</Label>
                  <Input 
                    placeholder={t('institutions.form.nameEnPlaceholder')} 
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('institutions.form.activityAr')}</Label>
                  <Input 
                    placeholder={t('institutions.form.activityArPlaceholder')} 
                    value={formData.activity_ar}
                    onChange={(e) => setFormData({ ...formData, activity_ar: e.target.value })}
                    dir={direction}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('institutions.form.activityEn')}</Label>
                  <Input 
                    placeholder={t('institutions.form.activityEnPlaceholder')} 
                    value={formData.activity_en}
                    onChange={(e) => setFormData({ ...formData, activity_en: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('institutions.form.phoneNumber')}</Label>
                  <Input 
                    placeholder={t('institutions.form.phoneNumberPlaceholder')} 
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('institutions.form.secondaryPhoneNumber')}</Label>
                  <Input 
                    placeholder={t('institutions.form.secondaryPhoneNumberPlaceholder')} 
                    value={formData.secondary_phone_number}
                    onChange={(e) => setFormData({ ...formData, secondary_phone_number: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('institutions.form.email')}</Label>
                  <Input 
                    type="email" 
                    placeholder={t('institutions.form.emailPlaceholder')} 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('institutions.form.website')}</Label>
                  <Input 
                    placeholder={t('institutions.form.websitePlaceholder')} 
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('institutions.form.address')}</Label>
                <Input 
                  placeholder={t('institutions.form.addressPlaceholder')} 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  dir={direction}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('institutions.form.country')}</Label>
                  <Input 
                    placeholder={t('institutions.form.countryPlaceholder')} 
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('institutions.form.systemType')}</Label>
                  <Select 
                    value={formData.system_type} 
                    onValueChange={(value: 'restaurant' | 'retail') => setFormData({ ...formData, system_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">{t('institutions.form.systemTypeRetail')}</SelectItem>
                      <SelectItem value="restaurant">{t('institutions.form.systemTypeRestaurant')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('institutions.form.taxNumber')}</Label>
                  <Input 
                    placeholder={t('institutions.form.taxNumberPlaceholder')} 
                    value={formData.tax_number}
                    onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    dir="ltr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('institutions.form.businessRegistry')}</Label>
                  <Input 
                    placeholder={t('institutions.form.businessRegistryPlaceholder')} 
                    value={formData.business_registry}
                    onChange={(e) => setFormData({ ...formData, business_registry: e.target.value })}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('institutions.form.defaultCurrency')}</Label>
                  <Input 
                    placeholder={t('institutions.form.defaultCurrencyPlaceholder')} 
                    value={formData.default_currency}
                    onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })}
                    maxLength={3}
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('institutions.form.notes')}</Label>
                <Input 
                  placeholder={t('institutions.form.notesPlaceholder')} 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  dir={direction}
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>{t('institutions.form.logo') || 'Logo'}</Label>
                <div className="flex items-center gap-4">
                  {logoPreview && (
                    <div className="relative">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleRemoveLogo}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo-input"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                    <Label
                      htmlFor="logo-input"
                      className="flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-400 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {logoPreview 
                          ? t('institutions.form.changeLogo') || 'Change Logo'
                          : t('institutions.form.uploadLogo') || 'Upload Logo'}
                      </span>
                    </Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('institutions.form.logoHint') || 'JPEG, PNG, or WebP. Max 5MB'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Admin User Selection - Only show when creating new institution */}
              {!editingInstitution && (
                <div className="space-y-2">
                  <Label>{t('institutions.form.adminUser')} *</Label>
                  {isLoadingUsers ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className={`${direction === 'rtl' ? 'mr-2' : 'ml-2'} text-sm text-gray-500`}>
                        {t('institutions.form.loadingUsers')}
                      </span>
                    </div>
                  ) : (
                    <SearchableSelect
                      options={users.map(user => ({
                        id: String(user.id),
                        name: user.full_name,
                        phone: user.phone_number || undefined,
                        email: user.email
                      }))}
                      value={selectedAdminUserId}
                      onValueChange={setSelectedAdminUserId}
                      placeholder={t('institutions.form.adminUserPlaceholder')}
                      searchPlaceholder={t('institutions.form.adminUserSearchPlaceholder')}
                      emptyMessage={t('institutions.form.noUsersFound')}
                      searchKeys={['name', 'email', 'phone']}
                      dir={direction}
                    />
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={handleCloseDialog}
                  disabled={isSubmitting}
                >
                  {t('institutions.messages.cancel')}
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className={`w-4 h-4 ${direction === 'rtl' ? 'ml-2' : 'mr-2'} animate-spin`} />
                      {t('institutions.messages.saving')}
                    </>
                  ) : (
                    t('institutions.messages.save')
                  )}
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
            <Building2 className="w-4 h-4 text-blue-600" />
            <CardTitle className={`text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t('institutions.stats.totalInstitutions')}
            </CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            {isLoadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <div className="text-2xl">{statistics?.total_institutions ?? companies.length}</div>
            )}
            <p className="text-xs text-gray-600 mt-1">{t('institutions.stats.activeInstitutions')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <MapPin className="w-4 h-4 text-green-600" />
            <CardTitle className={`text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t('institutions.stats.totalBranches')}
            </CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            {isLoadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <div className="text-2xl">{statistics?.total_branches ?? 0}</div>
            )}
            <p className="text-xs text-gray-600 mt-1">{t('institutions.stats.branchesInAllRegions')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <CardTitle className={`text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t('institutions.stats.totalEmployees')}
            </CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            {isLoadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <div className="text-2xl">{statistics?.total_employees ?? 0}</div>
            )}
            <p className="text-xs text-gray-600 mt-1">{t('institutions.stats.employeesInAllInstitutions')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <CardTitle className={`text-sm ${direction === 'rtl' ? 'text-right' : 'text-left'}`}>
              {t('institutions.stats.totalRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent className={direction === 'rtl' ? 'text-right' : 'text-left'}>
            {isLoadingStats ? (
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            ) : (
              <div className="text-2xl">{formatCurrency(statistics?.total_revenue ?? 0)}</div>
            )}
            <p className="text-xs text-gray-600 mt-1">{t('institutions.stats.thisMonth')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
          <CardTitle>{t('institutions.table.title')}</CardTitle>
          <CardDescription>{t('institutions.table.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className={`${direction === 'rtl' ? 'mr-2' : 'ml-2'} text-gray-600`}>
                {t('institutions.table.loading')}
              </span>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('institutions.table.noInstitutions')}
            </div>
          ) : (
            <div dir={direction}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.institutionName')}
                    </TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.activity')}
                    </TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.businessRegistry')}
                    </TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.taxNumber')}
                    </TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.email')}
                    </TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.phone')}
                    </TableHead>
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.systemType')}
                    </TableHead>
                    {isSuperAdmin() && (
                    <TableHead className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                      {t('institutions.table.actions')}
                    </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        <div>
                          <div className="font-medium">{company.name_ar}</div>
                          <div className="text-sm text-gray-500">{company.name_en}</div>
                        </div>
                      </TableCell>
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        <div>
                          <div>{company.activity_ar}</div>
                          <div className="text-sm text-gray-500">{company.activity_en}</div>
                        </div>
                      </TableCell>
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        {company.business_registry || '-'}
                      </TableCell>
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        {company.tax_number || '-'}
                      </TableCell>
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        {company.email}
                      </TableCell>
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        {company.phone_number}
                      </TableCell>
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        <Badge variant="outline">
                          {company.system_type === 'retail' 
                            ? t('institutions.form.systemTypeRetail') 
                            : t('institutions.form.systemTypeRestaurant')}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin() && (
                      <TableCell className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(company)}
                          >
                            {t('institutions.table.edit')}
                          </Button>
                          
                            <AlertDialog open={isDeleteDialogOpen && deletingInstitutionId === company.id} onOpenChange={setIsDeleteDialogOpen}>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDelete(company)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent dir={direction}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('institutions.deleteConfirm.title')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('institutions.deleteConfirm.message').replace('{name}', company.name_ar || company.name_en)}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setDeletingInstitutionId(null);
                                  }}>
                                    {t('institutions.deleteConfirm.cancel')}
                                  </AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700 text-black focus-visible:ring-red-600"
                                  >
                                    {t('institutions.deleteConfirm.delete')}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
