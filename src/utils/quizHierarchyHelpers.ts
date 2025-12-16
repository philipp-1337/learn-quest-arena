export const parseIds = (id: string) => id.split(':');

export const parseQuizIds = (id: string) => {
  const [subjectId, classId, topicId, quizId] = id.split(':');
  return { subjectId, classId, topicId, quizId };
};
