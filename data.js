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

    getAssignments() {
        return this.assignments;
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
        this.materials = this.materials.filter(material => material.id != materialId);
    }

}
  
class Material {
    constructor(link, title) {
        if (!/^https?:\/\/.+$/.test(link)) {
            throw new Error("Invalid link format");
        }
        this.link = link;
        this.title = title;
        this.id = generateId();
    }

    static generateId() {
        return `mat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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

    removeCourse(courseId) {
        this.courses = this.courses.filter(course => course.id !== courseId);
    }
}
  

  export {CanvasData, Course, Assignment, Material};