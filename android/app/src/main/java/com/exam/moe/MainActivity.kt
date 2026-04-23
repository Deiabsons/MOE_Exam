package com.exam.moe

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    ExamScreen()
                }
            }
        }
    }
}

@Composable
fun ExamScreen(viewModel: ExamViewModel = viewModel()) {
    val questions by viewModel.questions.collectAsState()
    val currentIndex by viewModel.currentIndex.collectAsState()
    val timeLeft by viewModel.timeLeft.collectAsState()
    val isFinished by viewModel.isFinished.collectAsState()
    val answers by viewModel.answers.collectAsState()

    if (questions.isEmpty()) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("EASA MOE Simulator", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(20.dp))
            Button(onClick = { viewModel.startExam() }) {
                Text("Start Final Exam")
            }
        }
    } else if (isFinished) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Exam Results", fontSize = 24.sp, fontWeight = FontWeight.Bold)
            Text("Score: ${viewModel.getScore()} / ${questions.size}", fontSize = 32.sp, color = Color.Blue)
            Spacer(modifier = Modifier.height(20.dp))
            Button(onClick = { viewModel.startExam() }) {
                Text("Retry New Exam")
            }
        }
    } else {
        val currentQ = questions[currentIndex]
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Q: ${currentIndex + 1}/${questions.size}")
                Text("Time: ${timeLeft / 60}:${(timeLeft % 60).toString().padStart(2, '0')}", color = Color.Red)
            }
            
            LinearProgressIndicator(
                progress = (currentIndex + 1).toFloat() / questions.size,
                modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))
            Text(currentQ.text, fontSize = 20.sp, fontWeight = FontWeight.SemiBold)
            
            Spacer(modifier = Modifier.height(24.dp))
            currentQ.options.forEachIndexed { index, option ->
                val isSelected = answers[currentQ.id] == index
                Button(
                    onClick = { viewModel.setAnswer(currentQ.id, index) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isSelected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.secondaryContainer,
                        contentColor = if (isSelected) Color.White else Color.Black
                    ),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)
                ) {
                    Text(option)
                }
            }

            Spacer(modifier = Modifier.weight(1f))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Button(onClick = { viewModel.prevQuestion() }, enabled = currentIndex > 0) {
                    Text("Prev")
                }
                if (currentIndex == questions.size - 1) {
                    Button(onClick = { viewModel.finishExam() }, colors = ButtonDefaults.buttonColors(containerColor = Color.Green)) {
                        Text("Finish")
                    }
                } else {
                    Button(onClick = { viewModel.nextQuestion() }) {
                        Text("Next")
                    }
                }
            }
        }
    }
}
