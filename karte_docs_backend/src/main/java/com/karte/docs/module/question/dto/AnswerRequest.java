package com.karte.docs.module.question.dto;

public record AnswerRequest (
        String content,
        boolean makePublic
){
}
