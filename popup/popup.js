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
            renderCourses(canvasData);
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
  
// Function to render all courses as a 2x2 table
function renderCourses(canvasData) {
    const coursesContainer = document.getElementById("courseTab");
    coursesContainer.innerHTML = ""; // Clear the container before rendering

    // Create a table for courses
    const table = document.createElement("table");
    const tbody = document.createElement("tbody");

    // Loop through courses and create table rows
    let row;
    canvasData.courses.forEach((course, index) => {
        // Start a new row for every 2 courses
        if (index % 2 === 0) {
            row = document.createElement("tr");
        }

        // Create a cell for each course
        const cell = document.createElement("td");
        const courseButton = document.createElement("button");
        courseButton.textContent = course.id;
        courseButton.classList.add("course-button");
        
        // Add event listener to each button
        courseButton.addEventListener("click", () => {
            displayAssignments(course);  // Show assignments for clicked course
        });

        cell.appendChild(courseButton);
        row.appendChild(cell);

        // Append row to table when we have 2 courses
        if ((index + 1) % 2 === 0 || index === canvasData.courses.length - 1) {
            tbody.appendChild(row);
        }
    });

    table.appendChild(tbody);
    coursesContainer.appendChild(table);
}

// Function to display assignments for a clicked course
function displayAssignments(course) {
    const assignmentsContainer = document.getElementById("assignTab");
    assignmentsContainer.innerHTML = "";  // Clear previous content

    const assignmentsHeader = document.createElement("h2");
    assignmentsHeader.textContent = `Assignments for ${course.id}`;
    assignmentsContainer.appendChild(assignmentsHeader);

    // Create a table for assignments
    const assignmentsTable = document.createElement("table");
    assignmentsTable.classList.add("assignment-table");

    // Add table headers
    const headerRow = document.createElement("tr");
    const header1 = document.createElement("th");
    header1.textContent = "Assignment";
    const header2 = document.createElement("th");
    header2.textContent = "Due Date";
    headerRow.appendChild(header1);
    headerRow.appendChild(header2);
    assignmentsTable.appendChild(headerRow);

    // Populate the table with assignments
    course.assignments.forEach(assignment => {
        const row = document.createElement("tr");

        const titleCell = document.createElement("td");
        titleCell.textContent = assignment.title;
        row.appendChild(titleCell);

        const dueDateCell = document.createElement("td");
        dueDateCell.textContent = assignment.dueDate;
        row.appendChild(dueDateCell);

        assignmentsTable.appendChild(row);
    });

    // Append the assignments table to the assignments container
    assignmentsContainer.appendChild(assignmentsTable);

    // Make sure the assignments tab is visible
    assignmentsContainer.style.display = "block";
}



// Function to create materials list for each assignment
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
