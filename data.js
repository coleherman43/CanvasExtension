// This is where the classes for storing data are defined
class Course {
    constructor(name, assignments = []) {
      this.name = name;
      this.assignments = assignments;
    }
  
    // Add methods if needed, e.g., for sorting or filtering assignments
    addAssignment(assignment) {
      this.assignments.push(assignment);
    }
  }
  
  class Assignment {
    constructor(title, dueDate, submissionLink, links=[]) {
      this.title = title;
      this.dueDate = dueDate;
      this.submissionLink = submissionLink;
      this.links = links;
    }
  }
  
  export { Course, Assignment };
  