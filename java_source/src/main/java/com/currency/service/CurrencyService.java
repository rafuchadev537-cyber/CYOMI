package com.currency.service;

import com.currency.model.ExchangeRateResponse;
import com.google.gson.Gson;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class CurrencyService {
    private static final String API_KEY = "YOUR_API_KEY_HERE";
    private static final String BASE_URL = "https://v6.exchangerate-api.com/v6/";
    private final HttpClient client = HttpClient.newHttpClient();
    private final Gson gson = new Gson();

    private final java.util.Map<String, Double> MOCK_RATES = java.util.Map.of(
        "USD", 1.0, "EUR", 0.92, "GBP", 0.79, "INR", 83.31, "JPY", 151.62
    );

    public ExchangeRateResponse getLatestRates(String baseCode) throws Exception {
        if (API_KEY == null || API_KEY.equals("YOUR_API_KEY_HERE") || API_KEY.isEmpty()) {
            return generateMockResponse(baseCode);
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BASE_URL + API_KEY + "/latest/" + baseCode))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            
            if (response.statusCode() != 200) {
                return generateMockResponse(baseCode);
            }

            return gson.fromJson(response.body(), ExchangeRateResponse.class);
        } catch (Exception e) {
            return generateMockResponse(baseCode);
        }
    }

    private ExchangeRateResponse generateMockResponse(String baseCode) {
        // Simple mock implementation for demo purposes
        return new ExchangeRateResponse(); 
        // In a real app, we'd hydrate this with MOCK_RATES adjusted by baseCode
    }
}
