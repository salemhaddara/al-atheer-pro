'use client';

import { ReactNode, useState, useEffect, useRef, useMemo } from 'react';
import { Sidebar } from './Sidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { getSettings, getInstitutions, type Institution } from '../lib/api';
import { getStoredUser } from '../lib/auth';

// Simplified institution interface for Sidebar (only what we need)
interface SimplifiedInstitution {
  id: number;
  name_ar: string;
  name_en: string;
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [currentCompany, setCurrentCompany] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cached_company_name') || '';
    }
    return '';
  });
  const [currentInstitutionId, setCurrentInstitutionId] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selected_institution_id');
      return saved ? Number(saved) : null;
    }
    return null;
  });
  const [institutions, setInstitutions] = useState<Institution[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cached_institutions');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Use refs to avoid stale closures in event handlers
  const currentInstitutionIdRef = useRef<number | null>(null);
  const institutionsRef = useRef<Institution[]>([]);

  // Create simplified institutions array for Sidebar (only id, name_ar, name_en)
  const simplifiedInstitutions = useMemo<SimplifiedInstitution[]>(() => {
    return institutions.map(inst => ({
      id: inst.id,
      name_ar: inst.name_ar || '',
      name_en: inst.name_en || '',
    }));
  }, [institutions]);

  // Keep refs and localStorage in sync with state
  useEffect(() => {
    currentInstitutionIdRef.current = currentInstitutionId;
    if (typeof window !== 'undefined' && currentInstitutionId) {
      localStorage.setItem('selected_institution_id', String(currentInstitutionId));
    }
  }, [currentInstitutionId]);

  useEffect(() => {
    institutionsRef.current = institutions;
    if (typeof window !== 'undefined' && institutions.length > 0) {
      localStorage.setItem('cached_institutions', JSON.stringify(institutions));
    }
  }, [institutions]);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentCompany) {
      localStorage.setItem('cached_company_name', currentCompany);
    }
  }, [currentCompany]);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved === 'true';
    }
    return false;
  });
  const { direction, language } = useLanguage();

  // Load institutions and current institution
  useEffect(() => {
    let isMounted = true;

    const loadInstitutions = async () => {
      try {
        const authUser = getStoredUser();
        if (!authUser) return;

        const superAdmin = authUser.is_system_owner_admin === true;
        setIsSuperAdmin(superAdmin);

        if (superAdmin) {
          // Super admin: fetch all institutions
          const result = await getInstitutions({ per_page: 100 });
          if (!isMounted) return;

          if (result.success && result.data?.institutions?.data) {
            setInstitutions(result.data.institutions.data);

            // Get selected institution from localStorage or use first one
            const savedInstitutionId = typeof window !== 'undefined'
              ? localStorage.getItem('selected_institution_id')
              : null;

            if (savedInstitutionId) {
              const institution = result.data.institutions.data.find(
                (inst: Institution) => inst.id === Number(savedInstitutionId)
              );
              if (institution) {
                setCurrentInstitutionId(institution.id);
                await loadCompanyName(institution.id);
                return;
              }
            }

            // Use first institution if available
            if (result.data.institutions.data.length > 0) {
              const firstInstitution = result.data.institutions.data[0];
              setCurrentInstitutionId(firstInstitution.id);
              await loadCompanyName(firstInstitution.id);
            } else {
              // No institutions, load system settings
              await loadCompanyName(null);
            }
          } else {
            await loadCompanyName(null);
          }
        } else {
          // Regular user: get their institution(s) from API
          // The API filters institutions by user access automatically
          const result = await getInstitutions({ per_page: 100 });
          if (!isMounted) return;

          if (result.success && result.data?.institutions?.data && result.data.institutions.data.length > 0) {
            const userInstitutions = result.data.institutions.data;
            setInstitutions(userInstitutions);

            // Get saved institution or use first one
            const savedInstitutionId = typeof window !== 'undefined'
              ? localStorage.getItem('selected_institution_id')
              : null;

            let selectedInstitution = userInstitutions[0]; // Default to first

            if (savedInstitutionId) {
              const savedInstitution = userInstitutions.find(
                (inst: Institution) => inst.id === Number(savedInstitutionId)
              );
              if (savedInstitution) {
                selectedInstitution = savedInstitution;
              }
            }

            setCurrentInstitutionId(selectedInstitution.id);
            // Set company name from institution name immediately as fallback
            const institutionName = language === 'ar' ? selectedInstitution.name_ar : selectedInstitution.name_en;
            if (institutionName) {
              setCurrentCompany(institutionName);
            }
            // Then try to load from settings (will override if found)
            await loadCompanyName(selectedInstitution.id);
          } else {
            // No institution assigned, use system settings
            setInstitutions([]);
            setCurrentInstitutionId(null);
            await loadCompanyName(null);
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading institutions:', error);
        }
        if (isMounted) {
          await loadCompanyName(null);
        }
      }
    };

    const loadCompanyName = async (institutionId: number | null) => {
      if (!isMounted) return;

      try {
        const params: any = { per_page: 100 };
        if (institutionId) {
          params.scope = 'institution';
          params.institution_id = institutionId;
        } else {
          params.scope = 'system';
        }

        const result = await getSettings(params);
        if (!isMounted) return;

        if (result.success && result.data?.settings?.data) {
          const settingsMap = new Map<string, any>();
          result.data.settings.data.forEach((setting: any) => {
            settingsMap.set(setting.key, setting.value);
          });

          // Get company name based on current language
          const companyKey = language === 'ar' ? 'company_name_ar' : 'company_name_en';
          const companyName = settingsMap.get(companyKey) || settingsMap.get('company_name_ar') || settingsMap.get('company_name_en');

          // Only update if we have a company name from settings, otherwise keep the institution name
          if (companyName) {
            setCurrentCompany(companyName);
          }
        }
        // Don't set fallback here - let the institution name stay if settings don't have company name
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error loading company name:', error);
        }
        // Don't override with fallback - keep institution name
      }
    };

    loadInstitutions();

    // Listen for settings updates (when settings are saved)
    const handleSettingsUpdate = async () => {
      if (!isMounted) return;
      // Use ref to get current institution ID (avoids stale closure)
      const currentInstId = currentInstitutionIdRef.current;
      if (currentInstId) {
        // No need to refresh institution data - logo comes from settings context
        loadCompanyName(currentInstId);
      } else {
        loadCompanyName(null);
      }
    };

    // Listen for institution changes
    const handleInstitutionChange = (event: Event) => {
      if (!isMounted) return;
      const customEvent = event as CustomEvent<{ institutionId: number | null }>;
      if (customEvent.detail?.institutionId) {
        setCurrentInstitutionId(customEvent.detail.institutionId);
        loadCompanyName(customEvent.detail.institutionId);
      } else {
        setCurrentInstitutionId(null);
        loadCompanyName(null);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('settingsUpdated', handleSettingsUpdate);
      window.addEventListener('institutionChanged', handleInstitutionChange);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('settingsUpdated', handleSettingsUpdate);
        window.removeEventListener('institutionChanged', handleInstitutionChange);
      }
    };
  }, [language]); // Only reload when language changes, NOT when institutions change

  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  const handleInstitutionChange = (institutionId: number | null) => {
    setCurrentInstitutionId(institutionId);
    // Dispatch event to reload settings
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('institutionChanged', { detail: { institutionId } }));
    }
  };

  return (
    <>
      <Sidebar
        currentCompany={currentCompany}
        onCompanyChange={setCurrentCompany}
        isCollapsed={isSidebarCollapsed}
        onToggle={handleSidebarToggle}
        institutions={simplifiedInstitutions}
        currentInstitutionId={currentInstitutionId}
        onInstitutionChange={handleInstitutionChange}
        isSuperAdmin={isSuperAdmin}
      />
      <main
        className="min-h-screen p-8 bg-gray-50 transition-all duration-300 ease-in-out"
        style={{
          marginLeft: direction === 'ltr' ? (isSidebarCollapsed ? '5rem' : '16rem') : '0',
          marginRight: direction === 'rtl' ? (isSidebarCollapsed ? '5rem' : '16rem') : '0'
        }}
      >
        {children}
      </main>
    </>
  );
}

