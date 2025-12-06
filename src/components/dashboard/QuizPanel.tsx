"use client";

import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from "lucide-react";

// Match the Prisma schema structure
interface QuizQuestion {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  answer: string; // This stores the correct answer (e.g., "A", "B", "C", "D")
  createdAt: Date;
}

interface Quiz {
  id: string;
  fileId: string;
  title: string;
  createdAt: Date;
  questions: QuizQuestion[];
}

interface QuizPanelProps {
  quiz: Quiz;
}

export default function QuizPanel({ quiz }: QuizPanelProps) {
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [answered, setAnswered] = useState<Record<number, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (!quiz || !quiz.questions.length) return null;

  const q = quiz.questions[current];
  const total = quiz.questions.length;
  const answeredCount = Object.keys(answered).length;
  const progress = Math.round((answeredCount / total) * 100);

  // Helper function to check if answer is correct
  const isAnswerCorrect = (
    selectedAnswer: string,
    correctAnswer: string,
    options: string[],
  ) => {
    // The correctAnswer is the index/letter (e.g., "A", "B", "C", "D")
    // We need to find the corresponding option text
    const correctAnswerIndex = correctAnswer.charCodeAt(0) - 65; // Convert A=0, B=1, C=2, D=3
    const correctOptionText = options[correctAnswerIndex];

    console.log("Debug answer comparison:", {
      selectedAnswer,
      correctAnswer,
      correctAnswerIndex,
      correctOptionText,
      options,
      isCorrect: selectedAnswer === correctOptionText,
    });

    return selectedAnswer === correctOptionText;
  };

  // Calculate correct/incorrect counts
  const correctCount = quiz.questions.filter(
    (question, index) =>
      answered[index] &&
      isAnswerCorrect(selected[index], question.answer, question.options),
  ).length;

  const incorrectCount = answeredCount - correctCount;

  const handleAnswerSelect = (answer: string) => {
    setSelected((prev) => ({ ...prev, [current]: answer }));
    setAnswered((prev) => ({ ...prev, [current]: true }));
  };

  const handleNext = () => {
    if (current < total - 1) {
      setCurrent(current + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (current > 0) {
      setCurrent(current - 1);
    }
  };

  const restartQuiz = () => {
    setSelected({});
    setAnswered({});
    setCurrent(0);
    setQuizCompleted(false);
  };

  const isCurrentQuestionAnswered = answered[current];
  const isCurrentAnswerCorrect = isAnswerCorrect(
    selected[current],
    q.answer,
    q.options,
  );

  return (
    <div className="h-full bg-gray-50 flex flex-col overflow-hidden">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Practice Test</h1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  Question {current + 1} / {total}
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <Progress value={progress} className="mb-6" />

          {/* Topic Badge */}
          <div className="mb-6">
            <Badge className="text-xs px-3 py-1 bg-green-500 text-white border-green-500">
              Ready to Test Your Knowledge! 🚀
            </Badge>
          </div>

          {/* Question Card */}
          <Card className="mb-6 shadow-lg">
            <CardContent className="p-6">
              <div className="font-semibold text-lg mb-6 leading-relaxed">
                {q.question}
              </div>

              <div className="space-y-3">
                {q.options.map((opt, oidx) => {
                  const isSelected = selected[current] === opt;
                  const isCorrect = isAnswerCorrect(opt, q.answer, q.options);
                  const isWrong = isSelected && !isCorrect;
                  const showFeedback = isCurrentQuestionAnswered;
                  const optionLetter = String.fromCharCode(65 + oidx); // A, B, C, D

                  return (
                    <div
                      key={oidx}
                      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      } ${
                        showFeedback && isCorrect
                          ? "border-green-500 bg-green-50"
                          : ""
                      } ${
                        showFeedback && isWrong
                          ? "border-red-500 bg-red-50"
                          : ""
                      }`}
                      onClick={() =>
                        !isCurrentQuestionAnswered && handleAnswerSelect(opt)
                      }
                    >
                      {/* Radio button indicator */}
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-white"></div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-gray-600">
                              {optionLetter}.
                            </span>
                            <span className="font-medium text-gray-900">
                              {opt}
                            </span>
                          </div>
                        </div>

                        {/* Feedback badges */}
                        {showFeedback && isCorrect && (
                          <Badge className="ml-2 bg-green-100 text-green-800 border-green-200 flex-shrink-0">
                            Correct
                          </Badge>
                        )}
                        {showFeedback && isWrong && (
                          <Badge
                            variant="destructive"
                            className="ml-2 flex-shrink-0"
                          >
                            Incorrect
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Immediate Feedback */}
              {isCurrentQuestionAnswered && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  {isCurrentAnswerCorrect ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-medium">Correct!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">
                        Incorrect. Correct answer:{" "}
                        <b>{q.options[q.answer.charCodeAt(0) - 65]}</b>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quiz Results */}
          {quizCompleted && (
            <Card className="mb-6 shadow-lg border-green-200">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">
                    🎉 Quiz Completed!
                  </h3>
                  <p className="text-gray-600">
                    Great job! Here&apos;s how you performed:
                  </p>
                </div>

                <div className="flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {Math.round((correctCount / total) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      {correctCount} out of {total} correct
                    </div>
                  </div>
                </div>

                <Progress
                  value={(correctCount / total) * 100}
                  className="mb-6 h-3"
                />

                <div className="flex justify-center gap-8 text-sm mb-6">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">{correctCount} Correct</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">
                      {incorrectCount} Incorrect
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    {correctCount === total
                      ? "Perfect score! You&apos;re a quiz master! 🏆"
                      : correctCount >= total * 0.8
                        ? "Excellent work! You&apos;re doing great! 🌟"
                        : correctCount >= total * 0.6
                          ? "Good job! Keep practicing to improve! 💪"
                          : "Keep studying! Practice makes perfect! 📚"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Fixed Navigation Bar */}
      <div className="bg-blue-900 py-4 px-4 rounded-lg shadow-lg mx-auto mb-4 max-w-lg">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-12">
          <Button
            variant="ghost"
            size="lg"
            onClick={handlePrevious}
            disabled={current === 0}
            className="text-white hover:bg-blue-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Previous
          </Button>

          {!quizCompleted ? (
            <Button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered}
              size="lg"
              className="bg-white text-blue-900 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {current === total - 1 ? "Finish Quiz" : "Next"}
              {current < total - 1 && <ChevronRight className="w-5 h-5 ml-2" />}
            </Button>
          ) : (
            <Button
              onClick={restartQuiz}
              variant="ghost"
              size="lg"
              className="text-white hover:bg-blue-800 hover:text-white transition-colors"
            >
              Restart Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
