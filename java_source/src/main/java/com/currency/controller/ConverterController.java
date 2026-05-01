package com.currency.controller;

import com.currency.model.ExchangeRateResponse;
import com.currency.service.CurrencyService;
import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.util.ArrayList;

public class ConverterController {
    @FXML private TextField amountField;
    @FXML private ComboBox<String> fromCombo;
    @FXML private ComboBox<String> toCombo;
    @FXML private Label resultLabel;
    @FXML private Label rateInfoLabel;

    private final CurrencyService service = new CurrencyService();

    @FXML
    public void initialize() {
        var currencies = FXCollections.observableArrayList("USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "BRL");
        fromCombo.setItems(currencies);
        toCombo.setItems(currencies);
        
        fromCombo.setValue("USD");
        toCombo.setValue("EUR");
    }

    @FXML
    private void handleConvert() {
        try {
            double amount = Double.parseDouble(amountField.getText());
            String from = fromCombo.getValue();
            String to = toCombo.getValue();

            ExchangeRateResponse data = service.getLatestRates(from);
            double rate = data.getConversionRates().get(to);
            double result = amount * rate;

            resultLabel.setText(String.format("%.2f %s", result, to));
            rateInfoLabel.setText(String.format("1 %s = %.4f %s", from, rate, to));
        } catch (NumberFormatException e) {
            resultLabel.setText("Invalid Amount");
        } catch (Exception e) {
            resultLabel.setText("Service Offline");
            e.printStackTrace();
        }
    }

    @FXML
    private void handleReverse() {
        String from = fromCombo.getValue();
        fromCombo.setValue(toCombo.getValue());
        toCombo.setValue(from);
        handleConvert();
    }
}
