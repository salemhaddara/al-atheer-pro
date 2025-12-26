'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { login } from '@/lib/api';
import { storeAuthData, mapApiUserToUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface LoginFormData {
    identifier: string;
    password: string;
    rememberMe?: boolean;
}

interface LoginFormProps {
    isRTL: boolean;
}

export function LoginForm({ isRTL }: LoginFormProps) {
    const { t, language } = useLanguage();
    const { login: setUser } = useUser();
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        defaultValues: {
            identifier: '',
            password: '',
            rememberMe: false,
        },
        mode: 'onBlur',
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);

        try {
            const result = await login({
                identifier: data.identifier.trim(),
                password: data.password,
                device_token: null,
            });

            if (result.success) {
                storeAuthData(result.data.token, result.data.user);
                const appUser = mapApiUserToUser(result.data.user);
                setUser(appUser);
                toast.success(t('login.loginSuccess'));
                router.push('/');
                router.refresh();
            } else {
                if (result.errors) {
                    const errorMessages = Object.values(result.errors).flat();
                    const errorMessage = errorMessages[0] || result.message;

                    if (errorMessage.includes('banned')) {
                        toast.error(t('login.accountBanned'));
                    } else if (errorMessage.includes('incorrect') || errorMessage.includes('غير صحيحة')) {
                        toast.error(t('login.invalidCredentials'));
                    } else {
                        toast.error(errorMessage);
                    }
                } else {
                    toast.error(result.message || t('login.loginFailed'));
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(t('login.networkError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`w-full lg:w-1/2 xl:w-3/5 flex items-center justify-center bg-background p-3 sm:p-4 md:p-6 lg:p-8 xl:p-12 2xl:p-16 ${isRTL ? 'lg:order-first' : ''}`}>
            <div className="w-full max-w-md space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
                {/* Logo */}
                <div className="flex flex-col items-center space-y-2 sm:space-y-3 md:space-y-4">
                    <Image src="/assets/logo/logo.png" alt="Logo" width={54} height={54} className="w-20 h-20 sm:w-20 sm:h-20 md:w-20 md:h-20 lg:w-24 lg:h-24 text-primary" />
                    <div className="text-center px-2 sm:px-4">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 sm:mb-2">
                            {t('login.title')}
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
                            {t('login.subtitle')}
                        </p>
                    </div>
                </div>

                {/* Login Card */}
                <Card className="border-border shadow-xl shadow-black/5 dark:shadow-black/20">
                    <CardContent className="p-4 sm:p-6 md:p-8">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5 md:space-y-6">
                            {/* Identifier Field */}
                            <div className="space-y-2 sm:space-y-2.5">
                                <Label htmlFor="identifier" className="text-xs sm:text-sm font-medium">
                                    {t('login.identifier')}
                                </Label>
                                <div className="relative">
                                    <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-0 ${isRTL ? 'right-3' : 'left-3'}`}>
                                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="identifier"
                                        type="text"
                                        placeholder={t('login.identifierPlaceholder')}
                                        className={`${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'} w-full h-10 sh-11 text-sm text-base`}
                                        autoComplete="username"
                                        aria-invalid={!!errors.identifier}
                                        aria-describedby={errors.identifier ? 'identifier-error' : undefined}
                                        {...register('identifier', {
                                            required: t('login.identifierRequired'),
                                            minLength: {
                                                value: 1,
                                                message: t('login.identifierRequired'),
                                            },
                                        })}
                                    />
                                </div>
                                {errors.identifier && (
                                    <p id="identifier-error" className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                                        {errors.identifier.message || t('login.identifierRequired')}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2 sm:space-y-2.5">
                                <Label htmlFor="password" className="text-xs sm:text-sm font-medium">
                                    {t('login.password')}
                                </Label>
                                <div className="relative">
                                    <div className={`absolute top-1/2 -translate-y-1/2 pointer-events-none z-0 ${isRTL ? 'right-3' : 'left-3'}`}>
                                        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                                    </div>
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={t('login.passwordPlaceholder')}
                                        className={`${isRTL ? 'pr-10 pl-10' : 'pl-10 pr-10'} w-full h-10 sh-11 text-sm text-base`}
                                        autoComplete="current-password"
                                        aria-invalid={!!errors.password}
                                        aria-describedby={errors.password ? 'password-error' : undefined}
                                        {...register('password', {
                                            required: t('login.passwordRequired'),
                                            minLength: {
                                                value: 1,
                                                message: t('login.passwordRequired'),
                                            },
                                        })}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-20 ${isRTL ? 'left-3' : 'right-3'}`}
                                        aria-label={showPassword ? t('login.hidePassword') : t('login.showPassword')}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        ) : (
                                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p id="password-error" className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1" role="alert">
                                        {errors.password.message || t('login.passwordRequired')}
                                    </p>
                                )}
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm pt-1">
                                <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        {...register('rememberMe')}
                                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-input text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer transition-colors"
                                    />
                                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                        {t('login.rememberMe')}
                                    </span>
                                </label>
                                <button
                                    type="button"
                                    className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded transition-colors text-left sm:text-right"
                                    onClick={() => {
                                        toast.info(language === 'ar' ? 'ميزة استعادة كلمة المرور قريباً' : 'Forgot password feature coming soon');
                                    }}
                                >
                                    {t('login.forgotPassword')}
                                </button>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-10 sm:h-11 md:h-12 text-sm sm:text-base font-medium shadow-lg hover:shadow-xl transition-all mt-2 sm:mt-0"
                                disabled={isLoading}
                                aria-busy={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="animate-spin h-4 w-4 sm:h-5 sm:w-5 border-2 border-current border-t-transparent rounded-full" />
                                        {t('login.signingIn')}
                                    </span>
                                ) : (
                                    t('login.signIn')
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Additional Info */}
                <p className="text-center text-[10px] sm:text-xs md:text-sm text-muted-foreground px-2 sm:px-4">
                    {language === 'ar' ? (
                        <>
                            يمكنك تسجيل الدخول باستخدام البريد الإلكتروني، اسم المستخدم، أو رقم الهاتف
                        </>
                    ) : (
                        <>
                            You can sign in using your email, username, or phone number
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}

