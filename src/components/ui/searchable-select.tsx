'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from './utils';
import { Button } from './button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './popover';
import { Badge } from './badge';

export interface SearchableSelectOption {
  id: string;
  name: string;
  accountNumber?: string;
  phone?: string;
  [key: string]: any; // Allow additional properties
}

interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  displayKey?: 'name' | 'accountNumber' | 'phone'; // What to display in the input
  searchKeys?: string[]; // Keys to search in (default: ['name', 'accountNumber', 'phone'])
  dir?: 'rtl' | 'ltr'; // Direction for RTL/LTR support
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = 'اختر...',
  searchPlaceholder = 'ابحث بالاسم أو رقم الحساب...',
  emptyMessage = 'لا توجد نتائج',
  disabled = false,
  className,
  displayKey = 'name',
  searchKeys = ['name', 'accountNumber', 'phone'],
  dir = 'rtl'
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedOption = options.find(option => option.id === value);

  // Filter options based on search
  const filteredOptions = React.useMemo(() => {
    if (!searchValue.trim()) return options;
    
    const searchLower = searchValue.toLowerCase();
    return options.filter(option =>
      searchKeys.some(key => {
        const value = option[key];
        return value && String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [options, searchValue, searchKeys]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !selectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedOption ? (
              <>
                <span className="truncate">{selectedOption[displayKey] || selectedOption.name}</span>
                {selectedOption.accountNumber && (
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {selectedOption.accountNumber}
                  </Badge>
                )}
              </>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className={`${dir === 'rtl' ? 'mr-2' : 'ml-2'} h-4 w-4 shrink-0 opacity-50`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-[var(--radix-popover-trigger-width)]" align={dir === 'rtl' ? 'end' : 'start'} dir={dir}>
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={searchPlaceholder} 
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.name} ${option.accountNumber || ''} ${option.phone || ''}`}
                  onSelect={() => {
                    onValueChange(option.id === value ? '' : option.id);
                    setOpen(false);
                    setSearchValue('');
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      `${dir === 'rtl' ? 'mr-2' : 'ml-2'} h-4 w-4`,
                      value === option.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.name}</span>
                      {option.accountNumber && (
                        <Badge variant="outline" className="text-xs">
                          {option.accountNumber}
                        </Badge>
                      )}
                    </div>
                    {option.phone && (
                      <span className="text-xs text-gray-500">{option.phone}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

