const generatePrompt = (props) => {
  const {
    customTopics,
    selectedModules,
    selectedTopics,
    professorNotes,
    selectedSubject,
    pdfSummary,
    NumberOfQuestions,
  } = props;
  let prompt = null;
  if (customTopics) {
    prompt = `
     Generate multiple-choice questions (MCQs) based on the following topics. Each question should include one correct answer and three incorrect answers. The output should be formatted as JSON, containing the following fields:
    [
      {
        "difficulty": "Easy" | "Medium" | "Hard", 
        "question": "{the question text}",
        "correct_answer": "{the correct answer}",
        "incorrect_answers": ["{incorrect answer 1}", "{incorrect answer 2}", "{incorrect answer 3}"],
        "explanation": "{a brief explanation about the correct answer}",
        "topic": "{a short topic description}",
        "bloom_taxonomy": Generate a Bloom's Taxonomy level-based categorization choices:( Remember, Understand, Apply, Analyze, Evaluate, Create ) also consider the difficulty of the problem according to the bloom's taxonomy ("create" being the hardest and "remember" is the lowest )
      }
    ]
    Topics: ${customTopics}
    Number of questions required: ${NumberOfQuestions}
    `;
  } else {
    prompt = `
    Generate multiple-choice questions (MCQs) in JSON format based on the provided modules, notes, topics, and course outcomes. Each question should include one correct answer and three incorrect answers, structured as follows:
    [
      {
        "difficulty": "Easy" | "Medium" | "Hard",
        "category": "{subject name}",
        "question": "{question text}",
        "correct_answer": "{correct answer}",
        "incorrect_answers": ["{incorrect answer 1}", "{incorrect answer 2}", "{incorrect answer 3}"],
        "explanation": "{brief explanation of the correct answer}",
        "topic": "{related topic}",
        "fromNotes": true | false,
        "fromPDF": true | false,
        "bloom_taxonomy": "Remember" | "Understand" | "Apply" | "Analyze" | "Evaluate" | "Create", // Select based on question difficulty and taxonomy level (Create is hardest, Remember is easiest)
        "course_outcomes": "{matching course outcome, or null if none provided}",
        "CO": "CO1" | "CO2" | "CO3" | "CO4" | "CO5" | "CO6" // Select the relevant course outcome number
      }
    ]
      Make sure that there is atleast one question from every CO.
    Modules to base questions on: ${selectedModules
      .map((mod) => mod.module_name)
      .join(", ")}
    Topics to consider: ${selectedTopics}
    Notes provided by the professor: ${
      professorNotes ? professorNotes : "No notes provided"
    }
    Course outcomes available: ${
      selectedSubject?.course_outcomes?.map((co) => co).join(", ") ||
      "No course outcomes provided"
    }
    PDF content summary: ${pdfSummary}
    Number of questions to generate: ${NumberOfQuestions}
    Please provide the output strictly in JSON format without any markdown, text, or extra characters. Do not include code blocks or escape characters.
  `;
  }
  console.log(prompt);
  return prompt;
};

export default generatePrompt;
