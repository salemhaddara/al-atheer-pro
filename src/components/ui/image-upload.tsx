import { useState, useRef } from 'react';
import { Button } from './button';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressAndConvertToBase64 } from '@/lib/image-utils';
import { toast } from 'sonner';

interface ImageUploadProps {
    value: string | null;
    onChange: (value: string | null) => void;
    disabled?: boolean;
    label?: string;
    className?: string;
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    label = 'Upload Image',
    className
}: ImageUploadProps) {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsLoading(true);
            try {
                const base64 = await compressAndConvertToBase64(file);
                onChange(base64);
            } catch (error) {
                console.error('Image processing error:', error);
                toast.error('Error processing image. Please try another file.');
            } finally {
                setIsLoading(false);
                // Reset input so the same file can be selected again if needed
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const handleRemove = () => {
        onChange(null);
    };

    const handleTriggerUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`space-y-4 w-full ${className}`}>
            {value ? (
                <div className="relative aspect-video w-full max-w-[200px] rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img
                        src={value}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={handleRemove}
                            disabled={disabled}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div
                    onClick={handleTriggerUpload}
                    className={`
            border-2 border-dashed border-gray-300 rounded-lg p-6 
            flex flex-col items-center justify-center gap-2 
            cursor-pointer hover:border-gray-400 hover:bg-gray-50/50 
            transition-all duration-200
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
                >
                    {isLoading ? (
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
                    ) : (
                        <div className="rounded-full bg-gray-100 p-2">
                            <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                    )}
                    <div className="text-center space-y-1">
                        <p className="text-sm font-medium text-gray-700">
                            {isLoading ? 'Processing...' : label}
                        </p>
                        <p className="text-xs text-gray-500">
                            JPEG, PNG, WebP (Max 5MB)
                        </p>
                    </div>
                </div>
            )}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || isLoading}
            />
        </div>
    );
}
