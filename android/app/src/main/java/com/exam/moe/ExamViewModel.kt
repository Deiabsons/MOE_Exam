package com.exam.moe

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.exam.moe.data.QuestionData
import com.exam.moe.model.Question
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ExamViewModel : ViewModel() {
    private val _questions = MutableStateFlow<List<Question>>(emptyList())
    val questions: StateFlow<List<Question>> = _questions

    private val _currentIndex = MutableStateFlow(0)
    val currentIndex: StateFlow<Int> = _currentIndex

    private val _answers = MutableStateFlow<Map<Int, Int>>(emptyMap())
    val answers: StateFlow<Map<Int, Int>> = _answers

    private val _timeLeft = MutableStateFlow(50 * 60)
    val timeLeft: StateFlow<Int> = _timeLeft

    private val _isFinished = MutableStateFlow(false)
    val isFinished: StateFlow<Boolean> = _isFinished

    fun startExam() {
        val mandatory = QuestionData.questions.filter { it.id in 1001..1025 }
        val remaining = QuestionData.questions.filter { it.id !in 1001..1025 }.shuffled()
        
        _questions.value = (mandatory + remaining.take(25)).shuffled()
        _currentIndex.value = 0
        _answers.value = emptyMap()
        _timeLeft.value = 50 * 60
        _isFinished.value = false
        startTimer()
    }

    private fun startTimer() {
        viewModelScope.launch {
            while (_timeLeft.value > 0 && !_isFinished.value) {
                delay(1000)
                _timeLeft.value -= 1
            }
            if (_timeLeft.value == 0) _isFinished.value = true
        }
    }

    fun setAnswer(questionId: Int, answerIndex: Int) {
        val currentAnswers = _answers.value.toMutableMap()
        currentAnswers[questionId] = answerIndex
        _answers.value = currentAnswers
    }

    fun nextQuestion() {
        if (_currentIndex.value < _questions.value.size - 1) {
            _currentIndex.value += 1
        }
    }

    fun prevQuestion() {
        if (_currentIndex.value > 0) {
            _currentIndex.value -= 1
        }
    }

    fun finishExam() {
        _isFinished.value = true
    }

    fun getScore(): Int {
        var score = 0
        _questions.value.forEach { q ->
            if (_answers.value[q.id] == q.correctAnswer) {
                score++
            }
        }
        return score
    }
}
