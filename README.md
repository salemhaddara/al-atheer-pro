# Arabic Reputation System

نظام إدارة شامل باللغة العربية يتضمن:
- إدارة الموظفين والحضور والرواتب
- إدارة العملاء والموردين
- نظام نقاط البيع (POS)
- إدارة المخزون والمستودعات
- المحاسبة والمالية
- التقارير والإحصائيات

## نوع المشروع

- **Framework**: React 18.3.1
- **Build Tool**: Vite 6.3.5
- **Language**: TypeScript 5.9.3
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: React Hooks (useState, useMemo)
- **Storage**: localStorage (Client-side only)

## التثبيت والتشغيل

```bash
# تثبيت المكتبات
npm install

# تشغيل المشروع في وضع التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build
```

## النشر على Vercel

### الطريقة الأولى: عبر Vercel Dashboard

1. **إنشاء حساب على Vercel**:
   - اذهب إلى [vercel.com](https://vercel.com)
   - سجل دخول بحساب GitHub/GitLab/Bitbucket

2. **ربط المشروع**:
   - اضغط على "Add New Project"
   - اختر المستودع الخاص بك
   - Vercel سيكتشف تلقائياً أنه مشروع Vite

3. **الإعدادات**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **النشر**:
   - اضغط "Deploy"
   - انتظر حتى يكتمل البناء
   - ستحصل على رابط للموقع

### الطريقة الثانية: عبر Vercel CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel

# النشر للإنتاج
vercel --prod
```

## ملاحظات مهمة

### ⚠️ تحذير: البيانات المحلية

هذا المشروع يستخدم `localStorage` لحفظ البيانات، مما يعني:
- البيانات محلية على المتصفح فقط
- لا توجد قاعدة بيانات خلفية
- البيانات لا تنتقل بين الأجهزة
- البيانات تُحذف عند مسح بيانات المتصفح

### للتطوير المستقبلي:

إذا كنت تريد نظام إنتاج حقيقي، ستحتاج إلى:
1. **Backend API** (Node.js, Python, etc.)
2. **قاعدة بيانات** (PostgreSQL, MongoDB, etc.)
3. **Authentication** (JWT, OAuth, etc.)
4. **Hosting للـ Backend** (Railway, Render, AWS, etc.)

## البنية التقنية

```
src/
├── components/          # مكونات React
│   ├── ui/            # مكونات UI الأساسية
│   └── reports/       # صفحات التقارير
├── contexts/          # React Contexts
├── data/              # إدارة البيانات (localStorage)
├── locales/           # ملفات الترجمة
└── utils/             # دوال مساعدة
```

## الميزات الرئيسية

- ✅ إدارة الموظفين (البيانات الأساسية، الوظيفية، الإجازات)
- ✅ نظام الحضور والانصراف
- ✅ معالجة الرواتب
- ✅ إدارة العملاء والموردين
- ✅ نظام نقاط البيع (POS)
- ✅ إدارة المخزون والمستودعات
- ✅ المحاسبة والقيود المحاسبية التلقائية
- ✅ التقارير والإحصائيات
- ✅ دعم RTL (العربية)
- ✅ واجهة مستخدم حديثة

## المتطلبات

- Node.js 18+ 
- npm أو yarn

## الرخصة

خاص - جميع الحقوق محفوظة
