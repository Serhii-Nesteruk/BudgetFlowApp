FROM mcr.microsoft.com/dotnet/aspnet:8.0-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        tesseract-ocr \
        tesseract-ocr-eng \
        tesseract-ocr-pol \
        libatomic1 \
        libgomp1 \
        libgtk-3-0 \
        libglib2.0-0 \
        libgl1 \
        libsm6 \
        libxext6 \
        libxrender1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY app/ ./

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
ENV RECEIPT_SCANNER_MODEL_PATH=/app/models/frozen_east_text_detection.pb

EXPOSE 8080

ENTRYPOINT ["dotnet", "ReceiptScanner.dll"]
