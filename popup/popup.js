// This is where we make the interactive JS menu in the popup and import the data from Canvas

import {Course, Assignment, CanvasData, Material} from '../data.js';
console.log("Running CanvasExtension...\n");

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("saveToken");
    const fetchButton = document.getElementById("fetchData");
    const tokenInput = document.getElementById("apiToken");
  
    // Initially hide the Fetch Data button
    fetchButton.style.display = "none";
  
    // Check if a token is already saved and adjust Fetch Data button visibility
    chrome.storage.local.get("apiToken", (result) => {
        if (result.apiToken) {
            fetchButton.style.display = "block"; // Show the Fetch Data button if the token exists
        }
    });
  
    // Save the API token to Chrome storage
    saveButton.addEventListener("click", () => {
        const apiToken = tokenInput.value.trim();
        if (apiToken) {
            chrome.storage.local.set({ apiToken }, () => {
                alert("API Token saved securely!");
                tokenInput.value = ""; // Clear the input field
                fetchButton.style.display = "block"; // Show the Fetch Data button
            });
        } else {
            alert("Please enter a valid token!");
        }
    });
  
    // Trigger manual fetch when clicking Fetch Data
    fetchButton.addEventListener("click", () => {
        console.log("Fetch Data button clicked");
        // whenever data is fetched it will update the DOM with new divs (displayCanvasData)
        fetchCanvasData();
        console.log("Fetched Data\n");
    });
    
    // Auto-fetch on load
    chrome.storage.local.get("apiToken", (result) => {
        if (result.apiToken) {
            fetchCanvasData();
        }
    });
});

  
  // Function to fetch Canvas data and store in the classes
async function fetchCanvasData() {
    const API_URL = "https://canvas.uoregon.edu/api/v1/courses?enrollment_state=active";  // Get courses first
    console.log("Canvas Data Fetch initiated...\n");
  
    // Retrieve the token from Chrome storage
    chrome.storage.local.get("apiToken", (result) => {
      const apiToken = result.apiToken;
  
      if (!apiToken) {
        alert("No API token found! Please set it first.");
        return;
      }
  
      // Fetch data from Canvas API
      fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched Canvas Data:", data); // Log the fetched course data
  
          const canvasData = new CanvasData();
  
          // Loop over courses and fetch assignments for each one
          data.forEach(courseData => {
            const course = new Course(courseData.id, courseData.name);
  
            // Now fetch assignments for each course
            fetchAssignmentsForCourse(courseData.id, apiToken, course);
  
            canvasData.addCourse(course);
          });
  
          // At this point, `canvasData` holds all the courses (with no assignments yet)
          console.log(canvasData);  // For testing
          // Pass the canvasData to renderCourses to display the data
          displayCanvasData(canvasData);
        })
        .catch((error) => {
          console.error("Error fetching Canvas data:", error);
        });
    });
}
  
  // Function to fetch assignments for a specific course
function fetchAssignmentsForCourse(courseId, apiToken, course) {
    const ASSIGNMENTS_URL = `https://canvas.uoregon.edu/api/v1/courses/${courseId}/assignments`;  // Get assignments for the course

    fetch(ASSIGNMENTS_URL, {
        headers: {
        Authorization: `Bearer ${apiToken}`,
        },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
     })
    .then((assignmentsData) => {
        console.log(`Assignments for Course ${courseId}:`, assignmentsData);

        // Add assignments to course
        assignmentsData.forEach(assignmentData => {
            const assignment = new Assignment(assignmentData.name, assignmentData.due_at, assignmentData.points_possible, assignmentData.id);
            course.addAssignment(assignment);
        });

        console.log(course); // To see the course with assignments
    })
    .catch((error) => {
        console.error(`Error fetching assignments for course ${courseId}:`, error);
    });
}
  
// Function to render all courses
function renderCourses(canvasData) {
    const coursesContainer = document.getElementById("courseTab");
    coursesContainer.innerHTML = ""; // Clear the container before rendering

    canvasData.courses.forEach(course => {
        const courseElement = createCourseElement(course);
        coursesContainer.appendChild(courseElement);
    });
}

// Function to render a single course and its assignments
function createCourseElement(course) {
    const courseDiv = document.createElement("div");
    courseDiv.classList.add("course");

    // Create the course title
    const courseTitle = document.createElement("h3");
    courseTitle.textContent = course.id;
    courseDiv.appendChild(courseTitle);

    // Create a container for assignments
    const assignmentsContainer = document.createElement("div");
    assignmentsContainer.classList.add("assignTab");
    course.assignments.forEach(assignment => {
        const assignmentElement = createAssignmentElement(assignment);
        assignmentsContainer.appendChild(assignmentElement);
    });

    courseDiv.appendChild(assignmentsContainer);

    return courseDiv;
}

// Function to render a single assignment
function createAssignmentElement(assignment) {
    const assignmentDiv = document.createElement("div");
    assignmentDiv.classList.add("assignment");

    // Add assignment title
    const assignmentTitle = document.createElement("h4");
    assignmentTitle.textContent = assignment.title;
    assignmentDiv.appendChild(assignmentTitle);

    // Add assignment due date
    const dueDate = document.createElement("p");
    dueDate.textContent = `Due: ${assignment.dueDate}`;
    assignmentDiv.appendChild(dueDate);

    // Add assignment points
    const points = document.createElement("p");
    points.textContent = `Points Possible: ${assignment.value}`;
    assignmentDiv.appendChild(points);

    // Add materials
    const materialsList = createMaterialsList(assignment);
    assignmentDiv.appendChild(materialsList);

    return assignmentDiv;
}

// Function to create materials list
function createMaterialsList(assignment) {
    const materialsList = document.createElement("ul");
    
    assignment.materials.forEach(material => {
        const materialItem = document.createElement("li");
        const materialLink = document.createElement("a");
        materialLink.href = material.link;
        materialLink.textContent = material.title;
        materialItem.appendChild(materialLink);
        materialsList.appendChild(materialItem);
    });

    return materialsList;
}

// Call this function when the data is fetched and ready
function displayCanvasData(canvasData) {
    renderCourses(canvasData);
}