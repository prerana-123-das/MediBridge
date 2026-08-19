const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Proxy GenAI Service
app.use(createProxyMiddleware({
    target: process.env.GENAI_URL || 'http://localhost:8000',
    changeOrigin: true,
    pathFilter: '/chat'
}));

// Proxy .NET Email Service
app.use(createProxyMiddleware({
    target: process.env.DOTNET_URL || 'http://localhost:5001',
    changeOrigin: true,
    pathFilter: '/api/v1/email'
}));

// Proxy .NET Payment Service
app.use(createProxyMiddleware({
    target: process.env.DOTNET_PAYMENTS_URL || 'http://localhost:5001',
    changeOrigin: true,
    pathFilter: '/api/v1/payments'
}));

// Proxy remaining requests to Spring Boot Backend
// Notice how it must only match /api/v1 but NOT /api/v1/email and /api/v1/payments
app.use(createProxyMiddleware({
    target: process.env.BACKEND_URL || 'http://localhost:8081',
    changeOrigin: true,
    pathFilter: (path, req) => {
        return path.startsWith('/api/v1') && !path.startsWith('/api/v1/email') && !path.startsWith('/api/v1/payments');
    }
}));

// Proxy Swagger documentation to Spring Boot Backend
app.use(createProxyMiddleware({
    target: process.env.BACKEND_DOCS_URL || 'http://localhost:8081',
    changeOrigin: true,
    pathFilter: '/v3/api-docs'
}));

app.use(createProxyMiddleware({
    target: process.env.BACKEND_SWAGGER_URL || 'http://localhost:8081',
    changeOrigin: true,
    pathFilter: '/swagger-ui'
}));

// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'API Gateway is running' });
});

app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
});
