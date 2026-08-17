using System;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using MediBridge.Services.EmailPayment.Data;
using MediBridge.Services.EmailPayment.Repositories.Implementations;
using MediBridge.Services.EmailPayment.Repositories.Interfaces;
using MediBridge.Services.EmailPayment.Services.Implementations;
using MediBridge.Services.EmailPayment.Services.Interfaces;
using MediBridge.Services.EmailPayment.Services.Singletons;

var builder = WebApplication.CreateBuilder(args);

// ==========================================
// 1. Database & ORM (EF Core MySQL Code-First)
// ==========================================
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<MediBridgeDbContext>(options =>
    options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 33)), mySqlOptions =>
    {
        mySqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
    }));

// ==========================================
// 2. Dependency Injection & Design Patterns
// ==========================================
// SINGLETON PATTERN: In-Memory Notification Log Engine across microservice lifetime
builder.Services.AddSingleton<DevEmailLogSingleton>();

// REPOSITORY PATTERN: Data Access Layer
builder.Services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();

// SERVICE LAYER PATTERN: Business Logic abstraction (SOLID Principles)
builder.Services.Configure<MediBridge.Services.EmailPayment.DTOs.RazorpayOptions>(builder.Configuration.GetSection("Razorpay"));
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddHostedService<MediBridge.Services.EmailPayment.Services.Implementations.KafkaConsumerService>();

builder.Services.AddScoped<IPaymentService, PaymentService>();

// ==========================================
// 3. JWT Authentication & RBAC Configuration
// ==========================================
var jwtSecret = builder.Configuration.GetValue<string>("Jwt:Secret") 
    ?? "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false, // Shared with Spring Boot token issues
        ValidateAudience = false,
        ClockSkew = TimeSpan.FromMinutes(5)
    };
});

builder.Services.AddAuthorization();

// ==========================================
// 4. CORS Policy for React Frontend & API Gateway
// ==========================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddControllers();

// ==========================================
// 5. Swagger / OpenAPI Interactive Documentation
// ==========================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "MediBridge Email & Payment Microservice API (.NET)",
        Version = "v1",
        Description = "ASP.NET Core RESTful Microservice implementing SOLID principles, DI, DTO, Repository, Service Layer, and Singleton Design Patterns for MediBridge Healthcare Platform."
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    // Note: Security definition configured above for Bearer authorization in interactive Swagger UI
});

var app = builder.Build();

// ==========================================
// 6. Middleware Pipeline & Auto Schema Sync
// ==========================================
if (app.Environment.IsDevelopment() || true) // Always enable Swagger UI for seamless testing and demonstration
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MediBridge .NET Microservice v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Automatically verify database and ensure Code-First tables exist
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<MediBridgeDbContext>();
        // Check if database connection is open and ensure table schema exists
        dbContext.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogWarning("Notice: EF Core EnsureCreated encountered an exception (MySQL server might be offline or table already configured): {Msg}", ex.Message);
    }
}

app.Run();
