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
    constructor(title, dueDate, value, id) {
      this.title = title;
      this.dueDate = dueDate;
      this.value = value;
      // to differentiate courses with the same title
      this.id = id;
      // to update as we add links to relevant sites
      this.materials = [];
      // for the submission link
      this.subLink = "";
    }

    updateSubLink(link) {
        this.subLink = link;
    }

    addMaterial(material) {
        this.materials.push(material);
    }

    removeMaterial(materialId) {
        this.materials.filter(material => material.id != materialId);
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