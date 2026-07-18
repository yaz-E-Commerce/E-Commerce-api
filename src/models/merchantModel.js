const mongoose = require('mongoose')

// ==========================================
// 1. تعريف الـ Enums والـ Constants (المطابقة لـ NestJS)
// ==========================================

const JordanGovernorate = {
    AMMAN: 'AMMAN',
    ZARQA: 'ZARQA',
    IRBID: 'IRBID',
    BALQA: 'BALQA',
    MAFRAQ: 'MAFRAQ',
    JERASH: 'JERASH',
    AJLOUN: 'AJLOUN',
    MADABA: 'MADABA',
    KARAK: 'KARAK',
    TAFILAH: 'TAFILAH',
    MAAN: 'MAAN',
    AQABA: 'AQABA',
}

const DaysOfWeek = {
    SUNDAY: 'SUNDAY',
    MONDAY: 'MONDAY',
    TUESDAY: 'TUESDAY',
    WEDNESDAY: 'WEDNESDAY',
    THURSDAY: 'THURSDAY',
    FRIDAY: 'FRIDAY',
    SATURDAY: 'SATURDAY',
}

const ShopApprovalStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    SUSPENDED: 'SUSPENDED',
}

const ShopSpecialization = {
    TRADITIONAL_CLOTHES: 'TRADITIONAL_CLOTHES',
    HOME_FOOD: 'HOME_FOOD',
    HANDCRAFTS: 'HANDCRAFTS',
    LOCAL_BRANDS: 'LOCAL_BRANDS',
    ART: 'ART',
    CAFE: 'CAFE',
    RESTAURANT: 'RESTAURANT',
    BEAUTY: 'BEAUTY',
    ELECTRONICS: 'ELECTRONICS',
    FASHION: 'FASHION',
    SPORTS: 'SPORTS',
    HEALTH: 'HEALTH',
    BOOKS: 'BOOKS',
    TOYS: 'TOYS',
    GADGETS: 'GADGETS',
    PETS: 'PETS',
    FOOD_DELIVERY: 'FOOD_DELIVERY',
    GENERAL: 'GENERAL',
}

const SubscriptionPlan = {
    BASIC: 'BASIC',
    PREMIUM: 'PREMIUM',
    // أضف الخطط الأخرى
}

const SubscriptionStatus = {
    ACTIVE: 'ACTIVE',
    EXPIRED: 'EXPIRED',
    PENDING: 'PENDING',
}

// ==========================================
// 2. بناء الـ Sub-Schemas (الكائنات الفرعية)
// ==========================================

// جدول ساعات العمل الأسبوعي
const businessDayScheduleSchema = new mongoose.Schema(
    {
        day: {
            type: String,
            enum: Object.values(DaysOfWeek),
            required: true,
        },
        open: { type: String },
        close: { type: String },
        isClosed: { type: Boolean, default: false },
    },
    { _id: false }
)

// تقييم المتجر
const shopRatingSchema = new mongoose.Schema(
    {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 },
    },
    { _id: false }
)

// أداء التاجر
const merchantPerformanceSchema = new mongoose.Schema(
    {
        responseTimeMinutes: { type: Number, default: 0 },
        completionRate: { type: Number, default: 100 },
    },
    { _id: false }
)

// معلومات واجهة المحل (Profile)
const shopProfileSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        specialization: {
            type: String,
            enum: Object.values(ShopSpecialization),
            default: ShopSpecialization.GENERAL,
        },
        headline: { type: String, maxlength: 150, default: '' }, // 👈 إعطاء ديفولت نص فارغ
        shopStory: { type: String, default: '' }, // 👈 ديفولت نص فارغ
        isVerified: { type: Boolean, default: false },
    },
    { _id: false }
)

// معلومات التواصل
const shopContactSchema = new mongoose.Schema(
    {
        supportPhone: { type: String },
        whatsappNumber: { type: String },
        customWhatsappMessage: { type: String },
        facebookUrl: { type: String },
        instagramUrl: { type: String },
    },
    { _id: false }
)

// الهوية البصرية والألوان (Branding)
const shopBrandingSchema = new mongoose.Schema(
    {
        logoUrl: { type: String },
        bannerUrl: { type: String },
        promoVideoUrl: { type: String },
        gallery: { type: [String], default: [] },
        theme: {
            type: {
                primaryColor: { type: String, default: '#800020' },
                secondaryColor: { type: String, default: '#F5F5DC' },
                textColor: { type: String, default: '#333333' },
                backgroundColor: { type: String, default: '#FFFFFF' },
            },
            default: {
                primaryColor: '#800020',
                secondaryColor: '#F5F5DC',
                textColor: '#333333',
                backgroundColor: '#FFFFFF',
            },
            _id: false,
        },
    },
    { _id: false }
)

// الموقع الجغرافي والشحن
const shopLocationSchema = new mongoose.Schema(
    {
        supportedGovernorates: {
            type: [String],
            enum: Object.values(JordanGovernorate),
            default: [JordanGovernorate.AMMAN],
        },
        physicalAddress: { type: String },
        postalCode: { type: String },
        pickupAvailable: { type: Boolean, default: false },
        estimatedDeliveryTime: { type: String, default: '2-3 days' },
        businessHours: { type: [businessDayScheduleSchema], default: [] },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                required: true,
                default: [35.9106, 31.9522], // إحداثيات عمان الافتراضية
            },
        },
    },
    { _id: false }
)

// تحديث سكيما الإعدادات في الموديل لضمان بناء الكائنات الفرعية تلقائياً
const shopSettingsSchema = new mongoose.Schema(
    {
        plan: {
            type: String,
            enum: Object.values(SubscriptionPlan),
            default: SubscriptionPlan.BASIC,
        },
        subscription: {
            type: {
                status: {
                    type: String,
                    enum: Object.values(SubscriptionStatus),
                    default: SubscriptionStatus.ACTIVE,
                },
                currentPeriodStart: { type: Date, default: Date.now },
                currentPeriodEnd: {
                    type: Date,
                    default: () =>
                        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                },
            },
            default: {}, // 👈 يضمن بناء كائن الاشتراك تلقائياً بالقيمة الافتراضية
        },
        searchBoost: { type: Number, default: 0 },
        isFeaturedVisible: { type: Boolean, default: false },
        minimumOrderValue: { type: Number, default: 0 },
        rating: { type: shopRatingSchema, default: {} }, // 👈 بناء كائن التقييم تلقائياً (0, 0)
        performance: { type: merchantPerformanceSchema, default: {} }, // 👈 بناء كائن الأداء تلقائياً
        documents: { type: [String], default: [] },
    },
    { _id: false }
)

// ==========================================
// 3. المخطط الرئيسي للمتجر (Main Shop Schema)
// ==========================================

const merchantSchema = new mongoose.Schema(
    {
        merchantUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            index: true,
        },
        approvalStatus: {
            type: String,
            enum: Object.values(ShopApprovalStatus),
            default: ShopApprovalStatus.PENDING,
            index: true,
        },
        profile: {
            type: shopProfileSchema,
            required: true,
        },
        contact: {
            type: shopContactSchema,
            default: {},
        },
        branding: {
            type: shopBrandingSchema,
            required: true,
        },
        location: {
            type: shopLocationSchema,
            required: true,
        },
        settings: {
            type: shopSettingsSchema,
            required: true,
            default: {}, // 👈 أضف هذه لضمان الأمان المطلق في الموديل
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

// ==========================================
// 4. الفهارس المتقدمة (Indexes كما هي في NestJS)
// ==========================================

merchantSchema.index({ 'profile.specialization': 1, approvalStatus: 1 })
merchantSchema.index({ merchantUserId: 1 })
merchantSchema.index({ approvalStatus: 1, 'settings.plan': 1 })
merchantSchema.index({ slug: 1 }, { unique: true })
merchantSchema.index({ 'settings.searchBoost': -1, approvalStatus: 1 })

// فهرس الـ GeoJSON لتطبيقات الخرائط والبحث عن أقرب متجر
merchantSchema.index({ 'location.coordinates': '2dsphere' })
merchantSchema.index({ createdAt: -1 })

// تصدير الموديل والـ Enums لتستفيد منها في التحقق والـ DTOs
module.exports = {
    Merchant: mongoose.model('Merchant', merchantSchema),
    JordanGovernorate,
    DaysOfWeek,
    ShopApprovalStatus,
    ShopSpecialization,
    SubscriptionPlan,
    SubscriptionStatus,
}
