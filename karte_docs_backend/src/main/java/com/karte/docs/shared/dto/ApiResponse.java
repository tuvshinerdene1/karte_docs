package com.karte.docs.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
public class ApiResponse<T> {
    private String message;
    private T data;
    private LocalDateTime timestamp;

    public static <T> ApiResponse<T> success(T data, String message){
        return ApiResponse.<T>builder()
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
