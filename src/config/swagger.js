const swaggerUi = require('swagger-ui-express');
const { OpenApiGeneratorV3 } = require('@asteasolutions/zod-to-openapi');

const pathsRegistry = [];
const schemasRegistry = {};
const zodRegistry = []; // مصفوفة لتجميع الـ Zod DTOs

const registerPaths = (paths) => {
    pathsRegistry.push(...paths);
};

const registerSchema = (schemaName, schema) => {
    schemasRegistry[schemaName] = schema;
};

const registerZodDto = (zodDto) => {
    zodRegistry.push(zodDto);
};

const buildPaths = () => {
    const paths = {};
    pathsRegistry.forEach(route => {
        if (!paths[route.path]) {
            paths[route.path] = {};
        }
        paths[route.path][route.method] = {
            summary: route.summary,
            tags: route.tags,
            ...(route.parameters ? { parameters: route.parameters } : {}),
            ...(route.requestBody ? { requestBody: route.requestBody } : {}),
            responses: route.responses,
        };
    });
    return paths;
};

const getSwaggerSpecs = () => {
    // 👈 نمرر المصفوفة مباشرة للمولد
    const generator = new OpenApiGeneratorV3(zodRegistry);
    
    // ✅ التصحيح هنا: استخدام generateComponents() بدلاً من getComponents()
    const components = generator.generateComponents(); 

    return {
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
            schemas: {
                ...components.schemas, // ستظهر الـ DTOs المولدة تلقائياً هنا
                ...schemasRegistry
            },
        },
    };
};

module.exports = {
    swaggerUi,
    getSwaggerSpecs,
    registerPaths,
    registerSchema,
    registerZodDto
};