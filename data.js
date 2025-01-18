// This is where the classes for storing data are defined
class Course {
    constructor(name, id) {
      this.name = name;
      this.id = id;
      this.assignments = [];
    }
  
    addAssignment(assignment) {
      this.assignments.push(assignment);
    }
  
    removeAssignment(assignmentId) {
      this.assignments = this.assignments.filter(assignment => assignment.id !== assignmentId);
    }
  }
  
  class Assignment {
    constructor(title, dueDate, grade, id) {
      this.title = title;
      this.dueDate = dueDate;
      this.grade = grade;
      this.id = id;
    }
  }
  
  class CanvasData {
    constructor() {
      this.courses = [];
    }
  
    addCourse(course) {
      this.courses.push(course);
    }
  
    getCourseById(courseId) {
      return this.courses.find(course => course.id === courseId);
    }
  
    // Other methods to manage courses and assignments can be added here.
  }
  
  export {CanvasData, Course, Assignment};