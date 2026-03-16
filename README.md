 ملف README.md كامل، احترافي، ومصمم خصيصاً ليكون الواجهة الرسمية لـ TEC SDK. هذا الملف مكتوب باللغة الإنجليزية (لأنه المعيار التقني للمطورين) مع توضيحات باللغة العربية داخل الكود لتسهيل العمل على فريقك في الـ 24 قطاع.
README.md
# TEC SDK — Titan Elite Commerce 🚀

[![Publish TEC SDK](https://github.com/Yasser1728/tec-sdk/actions/workflows/publish.yml/badge.svg)](https://github.com/Yasser1728/tec-sdk/actions)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**TEC SDK** هو الجسر البرمجي السيادي الذي يربط بين الـ 24 قطاع أعمال (Sectors) وبين منصة **TEC** المركزية. تم تصميمه ليوفر أداءً عالياً، أماناً فائقاً، وتكاملاً سلساً مع نظام **Pi Network**.

---

## 📦 التثبيت (Installation)

بما أن هذه المكتبة خاصة (Private) ومستضافة على **GitHub Packages**، يجب عليك التأكد من وجود ملف `.npmrc` في المجلد الرئيسي لمشروعك يحتوي على الآتي:

```text
@yasser1728:registry=[https://npm.pkg.github.com](https://npm.pkg.github.com)
//[npm.pkg.github.com/:_authToken=$](https://npm.pkg.github.com/:_authToken=$){NODE_AUTH_TOKEN}

ثم قم بتشغيل الأمر التالي:
npm install @yasser1728/tec-sdk

🚀 دليل البدء السريع (Quick Start)
يمكنك تشغيل الـ SDK والوصول لكل الخدمات (الهوية، المحفظة، المدفوعات) من خلال مكان واحد:
import { TecSdk } from '@yasser1728/tec-sdk';

// تهيئة الـ SDK
const tec = new TecSdk({
  apiKey: process.env.TEC_API_KEY,
  gatewayUrl: '[https://api.tec-ecosystem.com](https://api.tec-ecosystem.com)'
});

async function start() {
  try {
    // 1. تسجيل الدخول عبر Pi Network
    const auth = await tec.auth.loginWithPi('PI_ACCESS_TOKEN');
    console.log(`Welcome, ${auth.user.username}`);

    // 2. جلب رصيد المحفظة
    const wallet = await tec.wallet.getBalance(auth.user.userId);
    console.log(`Balance: ${wallet.balance} PI`);

    // 3. تنفيذ عملية دفع
    const payment = await tec.payment.createPayment(
      auth.user.userId,
      50, // المبلغ
      'PI',
      { orderId: 'INV-1001' } // بيانات إضافية
    );
  } catch (error) {
    console.error('Error:', error.message);
  }
}

🏗️ الوحدات الأساسية (Core Modules)
| الموديول | الوصف |
|---|---|
| AuthClient | المسؤول عن الهوية، تسجيل دخول Pi، وإدارة الجلسات (Sessions). |
| WalletClient | لإدارة الأرصدة، عمليات الإيداع والخصم، وتاريخ المعاملات. |
| PaymentClient | معالجة المدفوعات بأمان مع نظام إعادة محاولة أوتوماتيكي (Retry Logic). |
🛡️ المميزات التقنية
 * Resiliency: مزود بنظام Exponential Backoff لإعادة المحاولة تلقائياً عند فشل الشبكة.
 * Type Safety: اعتماد كامل على Zod للتحقق من صحة البيانات القادمة من السيرفر.
 * Logging: نظام تتبع أخطاء عالي الأداء باستخدام Pino.
 * Tree Shaking: مكتبة خفيفة الوزن تسمح للمتصفح بحذف الأكواد غير المستخدمة لتقليل حجم التطبيق.
🛠️ للتطوير والمساهمة (Development)
إذا كنت ترغب في التعديل على الـ SDK نفسه:
 * قم بعمل Clone للمستودع: git clone https://github.com/Yasser1728/tec-sdk.git
 * تثبيت المكتبات: npm ci
 * تشغيل الاختبارات: npm test
 * بناء النسخة النهائية: npm run build
📄 الترخيص (License)
Internal use only for TEC | Titan Elite Commerce. Licensed under MIT.
Maintained by @Yasser1728 — CEO & Founder of TEC.

---

### **كيفية استخدامه؟**
1. قم بإنشاء ملف جديد في المجلد الرئيسي لمشروعك (Root) باسم **`README.md`**.
2. انسخ الكود أعلاه بالكامل والصقه فيه.
3. بمجرد رفعه على GitHub، ستجده يظهر بشكل منسق واحترافي في واجهة المشروع.

**هل تحتاج مني أي تعديل إضافي على صياغة الأهداف أو المهام داخل الملف؟**

