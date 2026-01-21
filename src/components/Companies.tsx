import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Building2, Plus, MapPin, Users, TrendingUp, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInstitutions, deleteInstitution, getInstitutionStatistics, type Institution, type InstitutionStatistics } from '@/lib/api';
import { getStoredUser } from '@/lib/auth';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';


export function Companies() {
  const { t, direction } = useLanguage();

  // Check if user is super admin (system owner admin)
  const isSuperAdmin = () => {
    const authUser = getStoredUser();
    return authUser?.is_system_owner_admin === true;
  };

  const [companies, setCompanies] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<InstitutionStatistics | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [deletingInstitutionId, setDeletingInstitutionId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch institutions from API
  useEffect(() => {
    fetchInstitutions();
    fetchStatistics();
  }, []);

  const fetchInstitutions = async () => {
    setIsLoading(true);
    try {
      const result = await getInstitutions({ per_page: 100 });
      if (result.success) {
        const institutionsData = (result as any).data?.institutions;
        const institutionsList = Array.isArray(institutionsData) ? institutionsData : (institutionsData?.data || []);
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

        {isSuperAdmin() && (
          <Link href="/companies/new">
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              {t('institutions.addNew')}
            </Button>
          </Link>
        )}
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
                      {t('institutions.table.logo') || 'Logo'}
                    </TableHead>
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
                      <TableCell className='justify-center'>
                        {company.logo_url ? (
                          <Image
                            src={company.logo_url}
                            alt={company.name_en || company.name_ar || 'Logo'}
                            width={42}
                            height={42}
                            className="object-contain"
                          />
                        ) : (
                          <div className="w-8 h-6 flex items-center justify-center rounded-md border bg-gray-50">
                            <Building2 className="w-4 h-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
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
                            <Link href={`/companies/${company.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                {t('institutions.table.edit')}
                              </Button>
                            </Link>

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
                              <AlertDialogContent dir={direction} className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                                <AlertDialogHeader className={direction === 'rtl' ? 'text-right' : 'text-left'}>
                                  <AlertDialogTitle>{t('institutions.deleteConfirm.title')}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('institutions.deleteConfirm.message').replace('{name}', company.name_ar || company.name_en)}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className={direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}>
                                  <AlertDialogCancel onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setDeletingInstitutionId(null);
                                  }}>
                                    {t('institutions.deleteConfirm.cancel')}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmDelete}
                                    className="bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
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
    </div >
  );
}
