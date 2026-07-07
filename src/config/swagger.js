const swaggerUi = require('swagger-ui-express');
const { OpenApiGeneratorV3, OpenAPIRegistry } = require('@asteasolutions/zod-to-openapi');

const pathsRegistry = [];
const schemasRegistry = {};

const registerPaths = (paths) => {
    pathsRegistry.push(...paths);
};

const registerSchema = (schemaName, schema) => {
    schemasRegistry[schemaName] = schema;
};

const registerZodDto = (zodDto, schemaName = 'Schema') => {
    try {
        const localRegistry = new OpenAPIRegistry();
        localRegistry.register(schemaName, zodDto);

        const generator = new OpenApiGeneratorV3(localRegistry.definitions);
        const components = generator.generateComponents();
        const generatedSchemas = components?.components?.schemas || {};

        if (generatedSchemas[schemaName]) {
            schemasRegistry[schemaName] = generatedSchemas[schemaName];
        }
    } catch (error) {
        console.error(`❌ Failed to auto-generate swagger schema for ${schemaName}:`, error);
        schemasRegistry[schemaName] = { type: 'object', properties: {} };
    }
};

const buildPaths = () => {
    const paths = {};
    pathsRegistry.forEach(route => {
        if (!paths[route.path]) {
            paths[route.path] = {};
        }

        // 🎯 تجهيز الـ Parameters وحقن هيدر اللغة تلقائياً
        const parameters = route.parameters ? [...route.parameters] : [];
        
        parameters.push({
            name: 'Accept-Language',
            in: 'header',
            required: false,
            description: 'لغة الاستجابة المطلوبة (ar للعربية، en للإنجليزية)',
            schema: {
                type: 'string',
                enum: ['ar', 'en'], // يظهر كـ Dropdown خيارات منسدلة في السواجر
                default: 'ar'       // مطابق للـ defaultLocale في app.js عندك
            }
        });

        paths[route.path][route.method] = {
            summary: route.summary,
            tags: route.tags,
            parameters: parameters, // حقن المصفوفة المحدثة
            ...(route.requestBody ? { requestBody: route.requestBody } : {}),
            responses: route.responses,
        };
    });
    return paths;
};
const getSwaggerSpecs = () => ({
    openapi: '3.0.0',
    info: {
        title: 'E-Commerce API',
        version: '1.0.0',
        description: 'API Documentation - NestJS Style',
    },
    servers: [
        {
            url: process.env.API_URL || 'http://localhost:3000/api/v1',
            description: 'Development server',
        },
    ],
    paths: buildPaths(),
    components: {
        schemas: schemasRegistry,
    },
});

module.exports = {
    swaggerUi,
    getSwaggerSpecs,
    registerPaths,
    registerSchema,
    registerZodDto
};