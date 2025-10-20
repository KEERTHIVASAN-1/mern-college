const User = require('../models/User');

/**
 * Send notification to all teachers when a new question is asked
 * @param {Object} question - The question object
 */
const notifyTeachersNewQuestion = async (question) => {
  try {
    // Find all teachers and admins
    const teachers = await User.find({ role: { $in: ['teacher', 'admin'] } });
    
    if (!teachers || teachers.length === 0) {
      return;
    }
    
    const notification = {
      type: 'question',
      title: 'New Question Asked',
      message: `A new question has been asked: ${question.title}`,
      relatedId: question._id,
      onModel: 'Question',
      isRead: false,
      createdAt: new Date()
    };
    
    // Add notification to each teacher
    const updatePromises = teachers.map(teacher => {
      teacher.notifications.push(notification);
      return teacher.save();
    });
    
    await Promise.all(updatePromises);
    console.log(`Notification sent to ${teachers.length} teachers`);
  } catch (error) {
    console.error('Error sending notification to teachers:', error);
  }
};

/**
 * Send notification to all teachers when a new answer is posted
 * @param {Object} answer - The answer object
 * @param {Object} question - The related question object
 */
const notifyTeachersNewAnswer = async (answer, question) => {
  try {
    // Find all teachers and admins
    const teachers = await User.find({ role: { $in: ['teacher', 'admin'] } });
    
    if (!teachers || teachers.length === 0) {
      return;
    }
    
    const notification = {
      type: 'answer',
      title: 'New Answer Posted',
      message: `A new answer has been posted to the question: ${question.title}`,
      relatedId: answer._id,
      onModel: 'Answer',
      isRead: false,
      createdAt: new Date()
    };
    
    // Add notification to each teacher
    const updatePromises = teachers.map(teacher => {
      teacher.notifications.push(notification);
      return teacher.save();
    });
    
    await Promise.all(updatePromises);
    console.log(`Notification sent to ${teachers.length} teachers`);
  } catch (error) {
    console.error('Error sending notification to teachers:', error);
  }
};

module.exports = {
  notifyTeachersNewQuestion,
  notifyTeachersNewAnswer
};