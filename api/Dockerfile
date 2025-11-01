FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .

RUN dotnet publish ./cmd/GeneratorDaemon/GeneratorDaemon.csproj -c Release -r linux-arm64 --self-contained false -o /app/GeneratorDaemon
RUN dotnet publish ./cmd/TransactionServer/TransactionServer.csproj -c Release -r linux-arm64 --self-contained false -o /app/TransactionServer

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .

