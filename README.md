# MoneyMind AI — Web App (Next.js + TypeScript)

موقع الويب الكامل لـ MoneyMind AI، مبني بـ Next.js 14 (App Router) +
TypeScript + Tailwind CSS، متصل مباشرة بقاعدة بيانات Supabase والـ Edge
Functions اللتين بنيناهما سابقاً. **لا توجد أي بيانات Mock/Dummy/Sample
في أي مكان** — كل ما يُعرض يأتي من القاعدة الحقيقية، وعند غياب البيانات
تظهر رسالة "لا توجد بيانات حتى الآن" (`EmptyState`).

## التشغيل محلياً

> ملاحظة: هذا المشروع كُتب يدوياً بالكامل (لم يُشغَّل `npm install` في بيئة
> الإنشاء بسبب عدم توفر اتصال شبكة)، لذا الخطوة الأولى الحقيقية هي تثبيت
> الحزم على جهازك/سيرفرك.

```bash
npm install
cp .env.example .env.local
# عدّل .env.local وضع فيه:
#   NEXT_PUBLIC_SUPABASE_URL
#   NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

افتح `http://localhost:3000` — سيُحوَّل تلقائياً إلى `/ar/dashboard` (أو
صفحة تسجيل الدخول إن لم تكن مسجلاً).

## إعداد Supabase Auth (Google / Apple)

من لوحة تحكم Supabase: **Authentication → Providers**
- فعّل **Google**: ضع Client ID و Client Secret من Google Cloud Console.
- فعّل **Apple**: ضع Service ID, Team ID, Key ID, والمفتاح الخاص من Apple
  Developer.
- في كلا المزوّدين، ضع **Redirect URL** كالتالي:
  `https://<project-ref>.supabase.co/auth/v1/callback`

كود الموقع (`LoginClient.tsx`) يستدعي `signInWithOAuth` ويُعيد التوجيه
بعد المصادقة إلى `/auth/callback` (انظر `src/app/auth/callback/route.ts`)
الذي يُحوّل الكود لجلسة فعلية تلقائياً.

## البنية

```
src/
├── app/
│   ├── layout.tsx                  # Layout جذري بسيط
│   ├── page.tsx                     # يُحوّل لـ /ar/dashboard
│   ├── auth/callback/route.ts       # OAuth callback handler
│   └── [locale]/
│       ├── layout.tsx                # يضبط dir/lang حسب اللغة
│       ├── (auth)/                   # تسجيل دخول/حساب/استعادة كلمة مرور
│       └── (app)/                    # كل الصفحات المحمية بعد تسجيل الدخول
│           ├── dashboard/
│           ├── income/
│           ├── expenses/
│           ├── savings/
│           ├── investments/
│           ├── goals/
│           ├── advisor/              # يستدعي Edge Function ai-financial-advisor
│           ├── roadmap/               # يستدعي Edge Function generate-wealth-roadmap
│           ├── reports/               # يستدعي Edge Function generate-report
│           └── settings/
├── components/
│   ├── ui/                          # Card, Button, EmptyState, StatCard
│   ├── layout/                      # Sidebar (desktop), BottomNav (mobile)
│   └── providers/ThemeProvider.tsx   # Dark/Light/System mode
├── hooks/
│   ├── useUser.ts                    # المستخدم الحالي + الملف الشخصي
│   └── useFinancialSummary.ts        # ملخص مالي حقيقي من Supabase
├── i18n/
│   ├── config.ts                     # locales, defaultLocale, RTL/LTR map
│   └── dictionaries/{ar,en}.ts       # 181 مفتاح متطابق تماماً بين اللغتين
├── lib/
│   ├── supabase/{client,server}.ts   # عملاء Supabase (browser + server)
│   └── format.ts                     # تنسيق عملة/أرقام/تواريخ حسب اللغة
├── types/database.ts                 # أنواع TypeScript مطابقة لـ schema القاعدة
└── middleware.ts                     # حماية المسارات + تحديث الجلسة
```

## القرارات التصميمية (Design Tokens)

التصميم مستوحى من البريف الأصلي (شبيه بـ Revolut/Wise/Monzo): minimal،
clean، mobile-first.

- **الألوان**: خلفية حبر عميق (`#0B1220`) في الوضع الغامق / أبيض ناعم
  (`#F7F8FA`) في الفاتح. لون مميز واحد فقط: زمردي عميق (`#0F9D6E`) يرمز
  للنمو المالي الإيجابي، مع توابع محايدة (slate) وتحذيرية (rose/amber).
- **الخطوط**: خط display بشخصية (Cairo) للعناوين، خط body مريح للعربي
  (IBM Plex Sans Arabic)، وخط tabular (Inter) للأرقام في البطاقات
  والجداول كي تتراصف المبالغ المالية بدقة.
- **العنصر المميز (Signature)**: الأرقام الحقيقية للمستخدم هي "البطل"
  المرئي — بطاقات `StatCard` بخط tabular وحركة دخول خفيفة (`animate-count-up`)
  دون أي إفراط بصري.
- **RTL/LTR**: يُضبط تلقائياً عبر `dir` على عنصر `<html>` بناءً على
  `[locale]` segment — كل التخطيط (Flexbox/margin logical properties)
  يعمل بدون أي كود خاص بالاتجاه.

## ملاحظات تقنية مهمة

1. **RLS تحمي كل شيء تلقائياً**: كل استعلامات Supabase من Client Components
   تستخدم `anon key` + جلسة المستخدم، فتُقيَّد تلقائياً بسياسات RLS التي
   بنيناها (`moneymind-db/02_rls_policies.sql`). لا حاجة لأي فحص يدوي
   لـ `user_id` في الواجهة.
2. **`current_amount` في أهداف الادخار لا يُكتب يدوياً أبداً**: تتم إضافة
   مساهمة في `savings_contributions` فقط، والـ trigger في القاعدة يُعيد
   حساب `current_amount` تلقائياً (انظر `SavingsClient.tsx`).
3. **استدعاء Edge Functions يتطلب JWT المستخدم الحقيقي**: كل استدعاء لـ
   `ai-financial-advisor`/`generate-wealth-roadmap`/`generate-report` يجلب
   `session.access_token` من Supabase Auth ويرسله كـ
   `Authorization: Bearer ...` — تماماً كما صُممت الدوال لتتوقعه.
4. **رفض التوليد عند نقص البيانات (422)**: صفحة خريطة الثروة تعرض رسالة
   `dict.roadmap.insufficientData` بدلاً من أي محاولة لعرض بيانات بديلة.
5. **`localStorage` يُستخدم فقط لتفضيل المظهر المحلي السريع** (`ThemeProvider`)،
   وهذا مسموح هنا لأن هذا مشروع Next.js كامل يعمل في متصفح حقيقي (بخلاف
   قيود Artifacts التي تمنع localStorage تماماً).

## الخطوة التالية المقترحة

تطبيق **Flutter** (Android/iOS) يستهلك نفس قاعدة البيانات ونفس الـ Edge
Functions — أو **Admin Dashboard** منفصل للمراقبة (بدون أي صلاحية تجاوز
RLS من جهة العميل؛ فقط عرض إحصائيات مجمّعة عبر service_role من السيرفر).
