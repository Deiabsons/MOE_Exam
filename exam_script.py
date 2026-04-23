import tkinter as tk
from tkinter import messagebox, ttk
import random
import time

# Sample Questions (You can add all 273 here following this format)
QUESTIONS = [
    {
        "id": 1,
        "text": "Abbreviation of FAA.",
        "options": ["Federal Authority Administration", "Federal Aviation Administration", "Federal Aviation Agency"],
        "correct": 1,
        "page": "20"
    },
    {
        "id": 2,
        "text": "EgyptAir Maintenance and Engineering is committed to:",
        "options": [
            "Ensure that safety standards are not reduced by commercial imperatives",
            "Ensure that safety standards are reduced by commercial imperatives",
            "Ensure that safety standards will reduced by commercial imperatives"
        ],
        "correct": 0,
        "page": "25"
    },
    # ... add more questions here
]

class ExamApp:
    def __init__(self, root):
        self.root = root
        self.root.title("EASA MOE Exam Simulator")
        self.root.geometry("800x600")
        
        self.questions = random.sample(QUESTIONS, min(50, len(QUESTIONS)))
        self.current_idx = 0
        self.answers = {}
        self.time_left = 50 * 60
        
        self.setup_ui()
        self.update_timer()
        self.display_question()

    def setup_ui(self):
        # Timer Label
        self.timer_label = tk.Label(self.root, text="Time: 50:00", font=("Arial", 14, "bold"), fg="red")
        self.timer_label.pack(pady=10)
        
        # Progress
        self.progress_label = tk.Label(self.root, text="Question 1/50", font=("Arial", 10))
        self.progress_label.pack()
        
        # Question Text
        self.q_label = tk.Label(self.root, text="", font=("Arial", 14), wraplength=700, justify="left")
        self.q_label.pack(pady=20, padx=20)
        
        # Options
        self.radio_var = tk.IntVar(value=-1)
        self.option_buttons = []
        for i in range(3):
            rb = tk.Radiobutton(self.root, text="", variable=self.radio_var, value=i, font=("Arial", 12), command=self.save_answer)
            rb.pack(anchor="w", padx=50, pady=5)
            self.option_buttons.append(rb)
            
        # Navigation
        nav_frame = tk.Frame(self.root)
        nav_frame.pack(side="bottom", pady=30)
        
        tk.Button(nav_frame, text="Previous", command=self.prev_q).grid(row=0, column=0, padx=10)
        tk.Button(nav_frame, text="Next", command=self.next_q).grid(row=0, column=1, padx=10)
        tk.Button(nav_frame, text="Finish Exam", command=self.finish_exam, bg="green", fg="white").grid(row=0, column=2, padx=10)

    def display_question(self):
        q = self.questions[self.current_idx]
        self.progress_label.config(text=f"Question {self.current_idx + 1}/{len(self.questions)}")
        self.q_label.config(text=q["text"])
        
        for i, opt in enumerate(q["options"]):
            self.option_buttons[i].config(text=opt)
            
        self.radio_var.set(self.answers.get(self.current_idx, -1))

    def save_answer(self):
        self.answers[self.current_idx] = self.radio_var.get()

    def next_q(self):
        if self.current_idx < len(self.questions) - 1:
            self.current_idx += 1
            self.display_question()

    def prev_q(self):
        if self.current_idx > 0:
            self.current_idx -= 1
            self.display_question()

    def update_timer(self):
        if self.time_left > 0:
            mins, secs = divmod(self.time_left, 60)
            self.timer_label.config(text=f"Time: {mins:02d}:{secs:02d}")
            self.time_left -= 1
            self.root.after(1000, self.update_timer)
        else:
            self.finish_exam()

    def finish_exam(self):
        score = 0
        for i, q in enumerate(self.questions):
            if self.answers.get(i) == q["correct"]:
                score += 1
        
        messagebox.showinfo("Result", f"Exam Finished!\nScore: {score}/{len(self.questions)}")
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = ExamApp(root)
    root.mainloop()
