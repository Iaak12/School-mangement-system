/**
 * Calculate grade and grade point based on percentage and grading system
 */
const DEFAULT_GRADING = [
  { grade: 'A+', minPercentage: 91, maxPercentage: 100, gradePoint: 10.0, description: 'Outstanding' },
  { grade: 'A',  minPercentage: 81, maxPercentage: 90,  gradePoint: 9.0,  description: 'Excellent' },
  { grade: 'B+', minPercentage: 71, maxPercentage: 80,  gradePoint: 8.0,  description: 'Very Good' },
  { grade: 'B',  minPercentage: 61, maxPercentage: 70,  gradePoint: 7.0,  description: 'Good' },
  { grade: 'C+', minPercentage: 51, maxPercentage: 60,  gradePoint: 6.0,  description: 'Above Average' },
  { grade: 'C',  minPercentage: 41, maxPercentage: 50,  gradePoint: 5.0,  description: 'Average' },
  { grade: 'D',  minPercentage: 35, maxPercentage: 40,  gradePoint: 4.0,  description: 'Pass' },
  { grade: 'F',  minPercentage: 0,  maxPercentage: 34,  gradePoint: 0.0,  description: 'Fail' },
];

const getGrade = (percentage, gradingSystem = DEFAULT_GRADING) => {
  const system = gradingSystem.length ? gradingSystem : DEFAULT_GRADING;
  const entry = system.find(
    (g) => percentage >= g.minPercentage && percentage <= g.maxPercentage
  );
  return entry || { grade: 'F', gradePoint: 0, description: 'Fail' };
};

const calculateGPA = (subjectResults, gradingSystem) => {
  if (!subjectResults || subjectResults.length === 0) return 0;

  const total = subjectResults.reduce((sum, sub) => {
    const gradeEntry = getGrade(
      (sub.totalMarks / sub.maxMarks) * 100,
      gradingSystem
    );
    return sum + gradeEntry.gradePoint;
  }, 0);

  return parseFloat((total / subjectResults.length).toFixed(2));
};

const calculateResult = (marks, gradingSystem) => {
  let totalObtained = 0;
  let totalMaxMarks = 0;
  let allPassed = true;

  const processedMarks = marks.map((m) => {
    const total = (m.theoryMarks || 0) + (m.practicalMarks || 0);
    const percentage = (total / m.maxMarks) * 100;
    const gradeEntry = getGrade(percentage, gradingSystem);
    const passed = total >= m.passingMarks;

    if (!passed) allPassed = false;
    totalObtained += total;
    totalMaxMarks += m.maxMarks;

    return {
      ...m,
      totalMarks: total,
      grade: gradeEntry.grade,
      gradePoint: gradeEntry.gradePoint,
      isPassed: passed,
    };
  });

  const overallPercentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
  const overallGradeEntry = getGrade(overallPercentage, gradingSystem);

  return {
    marks: processedMarks,
    totalObtained,
    totalMaxMarks,
    percentage: parseFloat(overallPercentage.toFixed(2)),
    gpa: calculateGPA(processedMarks, gradingSystem),
    overallGrade: overallGradeEntry.grade,
    isPassed: allPassed,
  };
};

module.exports = { getGrade, calculateGPA, calculateResult, DEFAULT_GRADING };
