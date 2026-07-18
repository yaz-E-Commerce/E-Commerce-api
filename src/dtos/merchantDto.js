const { z } = require('zod')
const { extendZodWithOpenApi } = require('@asteasolutions/zod-to-openapi')

// استيراد الـ Enums من ملف الموديل مباشرة لمنع التكرار (DRY)
const {
    JordanGovernorate,
    DaysOfWeek,
    ShopSpecialization,
    SubscriptionPlan,
} = require('../models/merchantModel')

extendZodWithOpenApi(z)

// ==========================================
// 1. المخططات الفرعية للـ Validation (Zod Sub-Schemas)
// ==========================================

// ساعات العمل اليومية
const BusinessDayScheduleDtoSchema = z
    .object({
        day: z.nativeEnum(DaysOfWeek, {
            errorMap: () => ({ message: 'shop.errors.INVALID_DAY' }),
        }),
        open: z
            .string()
            .regex(
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                'shop.errors.INVALID_TIME_FORMAT'
            )
            .optional(), // صيغة 24 ساعة (09:00)
        close: z
            .string()
            .regex(
                /^([01]\d|2[0-3]):([0-5]\d)$/,
                'shop.errors.INVALID_TIME_FORMAT'
            )
            .optional(),
        isClosed: z.boolean().default(false),
    })
    .openapi({
        description: 'Operating schedule for a single business day',
    })

// ملف واجهة المتجر (Profile)
const ShopProfileDtoSchema = z.object({
    name: z
        .string({ required_error: 'shop.errors.NAME_REQUIRED' })
        .trim()
        .min(2, 'shop.errors.NAME_TOO_SHORT')
        .max(100, 'shop.errors.NAME_TOO_LONG')
        .openapi({
            example: 'سوق جراسا للمطرزات',
            description: 'Store commercial name',
        }),

    specialization: z
        .nativeEnum(ShopSpecialization, {
            errorMap: () => ({ message: 'shop.errors.INVALID_SPECIALIZATION' }),
        })
        .default(ShopSpecialization.GENERAL)
        .openapi({
            example: 'TRADITIONAL_CLOTHES',
            description: 'The niche specialization of the shop',
        }),

    headline: z
        .string()
        .max(150, 'shop.errors.HEADLINE_TOO_LONG')
        .optional()
        .openapi({
            example: 'أصالة الماضي بأيدي أردنية',
            description: 'Short subtitle under store logo',
        }),

    shopStory: z.string().optional().openapi({
        example: 'بدأنا عام ٢٠٢٠ لدعم السيدات المنتجات في جرش...',
        description: 'Emotional connection story',
    }),
})

// معلومات التواصل
const ShopContactDtoSchema = z.object({
    supportPhone: z
        .string()
        .trim()
        .optional()
        .openapi({ example: '+962791234567' }),
    whatsappNumber: z
        .string()
        .trim()
        .optional()
        .openapi({ example: '+962791234567' }),
    customWhatsappMessage: z
        .string()
        .optional()
        .openapi({ example: 'مرحباً، أود الاستفسار عن منتج...' }),
    facebookUrl: z
        .string()
        .url('shop.errors.INVALID_URL')
        .optional()
        .or(z.literal('')),
    instagramUrl: z
        .string()
        .url('shop.errors.INVALID_URL')
        .optional()
        .or(z.literal('')),
})

// الهوية البصرية والألوان (Branding)
const ShopBrandingDtoSchema = z
    .object({
        logoUrl: z
            .string()
            .url('shop.errors.INVALID_URL')
            .or(z.literal(''))
            .optional()
            .openapi({ example: 'https://api.domain.com/uploads/logo.png' }),
        bannerUrl: z
            .string()
            .url('shop.errors.INVALID_URL')
            .or(z.literal(''))
            .optional()
            .openapi({ example: 'https://api.domain.com/uploads/banner.png' }),
        promoVideoUrl: z
            .string()
            .url('shop.errors.INVALID_URL')
            .or(z.literal(''))
            .optional()
            .openapi({ example: 'https://www.youtube.com/watch?v=video' }),
        gallery: z
            .array(z.string().url('shop.errors.INVALID_URL'))
            .default([])
            .openapi({ example: [] }),
        theme: z
            .object({
                primaryColor: z
                    .string()
                    .regex(/^#[0-9A-F]{6}$/i)
                    .default('#800020')
                    .openapi({ example: '#800020' }),
                secondaryColor: z
                    .string()
                    .regex(/^#[0-9A-F]{6}$/i)
                    .default('#F5F5DC')
                    .openapi({ example: '#F5F5DC' }),
                textColor: z
                    .string()
                    .regex(/^#[0-9A-F]{6}$/i)
                    .default('#333333')
                    .openapi({ example: '#333333' }),
                backgroundColor: z
                    .string()
                    .regex(/^#[0-9A-F]{6}$/i)
                    .default('#FFFFFF')
                    .openapi({ example: '#FFFFFF' }),
            })
            .default({}),
    })
    .default({})
    .openapi({
        description: 'Store branding assets and color palette configuration',
        example: {
            logoUrl: '',
            bannerUrl: '',
            promoVideoUrl: '',
            gallery: [],
            theme: {
                primaryColor: '#800020',
                secondaryColor: '#F5F5DC',
                textColor: '#333333',
                backgroundColor: '#FFFFFF',
            },
        },
    })

// الموقع والتوصيل
const ShopLocationDtoSchema = z.object({
    supportedGovernorates: z
        .array(
            z.nativeEnum(JordanGovernorate, {
                errorMap: () => ({
                    message: 'shop.errors.INVALID_GOVERNORATE',
                }),
            })
        )
        .default([JordanGovernorate.AMMAN])
        .openapi({
            example: ['AMMAN', 'ZARQA'],
            description: 'Supported shipping areas',
        }),

    physicalAddress: z
        .string()
        .optional()
        .openapi({ example: 'عمان، شارع الرينبو، مجمع رقم 15' }),

    postalCode: z.string().optional().openapi({ example: '11118' }),

    pickupAvailable: z
        .boolean()
        .default(false)
        .openapi({ example: true, description: 'Is in-store pickup allowed?' }),

    estimatedDeliveryTime: z
        .string()
        .default('2-3 days')
        .openapi({ example: '1-2 days' }),

    // 🎯 تم حقن الـ Example هنا لمصفوفة ساعات العمل
    businessHours: z
        .array(BusinessDayScheduleDtoSchema)
        .default([])
        .openapi({
            description: 'The weekly operating schedule for the shop',
            example: [
                {
                    day: 'SATURDAY',
                    open: '09:00',
                    close: '22:00',
                    isClosed: false,
                },
                {
                    day: 'FRIDAY',
                    open: '14:00',
                    close: '23:00',
                    isClosed: false,
                },
                {
                    day: 'SUNDAY',
                    open: '00:00',
                    close: '00:00',
                    isClosed: true,
                },
            ],
        }),
    coordinates: z
        .object({
            type: z.literal('Point').default('Point'),
            coordinates: z.tuple([z.number(), z.number()]), // [Long, Lat]
        })
        .optional()
        .openapi({
            example: { type: 'Point', coordinates: [35.9106, 31.9522] },
        }),
})

// الإعدادات المتاحة للمدخلات
const ShopSettingsDtoSchema = z.object({
    minimumOrderValue: z.number().nonnegative().default(0).openapi({
        example: 5,
        description: 'Minimum cart total to place order',
    }),
    documents: z
        .array(z.string())
        .default([])
        .openapi({ description: 'Files, commercial registers or IDs' }),
})

// ==========================================
// 2. المخططات الرئيسية للـ DTOs (Main DTOs)
// ==========================================

// 🚀 المخطط الأساسي عند إنشاء متجر جديد
const CreateShopDto = z
    .object({
        slug: z
            .string({ required_error: 'shop.errors.SLUG_REQUIRED' })
            .trim()
            .min(3, 'shop.errors.SLUG_TOO_SHORT')
            .regex(/^[a-z0-9-]+$/, 'shop.errors.INVALID_SLUG_FORMAT') // أحرف صغيرة، أرقام، وشحطات فقط
            .openapi({
                example: 'jerash-embroideries',
                description: 'Unique SEO-friendly URL slug',
            }),

        profile: ShopProfileDtoSchema,

        // 🎯 تم حقن الـ Example هنا لكائن بيانات التواصل والتواصل الاجتماعي
        contact: ShopContactDtoSchema.default({}).openapi({
            description: 'Store contact channels and social media links',
            example: {
                supportPhone: '+962791234567',
                whatsappNumber: '+962791234567',
                customWhatsappMessage:
                    'مرحباً، أود الاستفسار عن منتجات متجركم المتاحة.',
                facebookUrl: 'https://www.facebook.com/jerash.store',
                instagramUrl: 'https://www.instagram.com/jerash.store',
            },
        }),

        branding: ShopBrandingDtoSchema,
        location: ShopLocationDtoSchema,
        // في حال أردت توضيح أنها حقول تابعة للإدارة فقط داخل Swagger:
        settings: ShopSettingsDtoSchema.default({}).openapi({
            description:
                'Internal shop settings. Managed by system admins, not during initial creation.',
            readOnly: true, // تعني أن الحقل للقراءة فقط ولا يجب إرساله في الـ POST request
        }),
    })
    .openapi('CreateShopDto')

// 🔄 الـ DTO الخاص بتعديل المتجر (تصبح فيه كل الحقول اختيارية تلقائياً)
const UpdateShopDto = CreateShopDto.partial().openapi('UpdateShopDto')

module.exports = {
    CreateShopDto,
    UpdateShopDto,
}
