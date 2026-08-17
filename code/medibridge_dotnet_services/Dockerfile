# Stage 1: Build the application
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["MediBridge.Services.EmailPayment.csproj", "./"]
RUN dotnet restore "MediBridge.Services.EmailPayment.csproj"
COPY . .
RUN dotnet build "MediBridge.Services.EmailPayment.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "MediBridge.Services.EmailPayment.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Run the application
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port 5001
EXPOSE 5001

# Force ASP.NET to listen on port 5001
ENV ASPNETCORE_URLS=http://+:5001

ENTRYPOINT ["dotnet", "MediBridge.Services.EmailPayment.dll"]
