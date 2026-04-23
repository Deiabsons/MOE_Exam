package com.exam.moe.model

data class Question(
    val id: Int,
    val text: String,
    val options: List<String>,
    val correctAnswer: Int,
    val page: String
)
