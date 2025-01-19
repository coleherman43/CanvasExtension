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
            fetchButton.style.display = "flex"; // Show the Fetch Data button if the token exists
        }
    });
  
    // Save the API token to Chrome storage
    saveButton.addEventListener("click", () => {
        const apiToken = tokenInput.value.trim();
        if (apiToken) {
            chrome.storage.local.set({ apiToken }, () => {
                alert("API Token saved securely!");
                tokenInput.value = ""; // Clear the input field
                fetchButton.style.display = "center"; // Show the Fetch Data button
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
    const API_URL = "https://canvas.uoregon.edu/api/v1/courses?enrollment_state=active";
    console.log("Canvas Data Fetch initiated...\n");

    chrome.storage.local.get("apiToken", async (result) => {
        const apiToken = result.apiToken;

        if (!apiToken) {
            alert("No API token found! Please set it first.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched Canvas Data:", data);

            const canvasData = new CanvasData();
            const assignmentPromises = data.map(async (courseData) => {
                const course = new Course(courseData.id, courseData.name);
                await fetchAssignmentsForCourse(courseData.id, apiToken, course);
                canvasData.addCourse(course);
            });

            // Wait for all assignments to load
            await Promise.all(assignmentPromises);

            console.log("All assignments loaded:", canvasData);
            renderCourses(canvasData);
        } catch (error) {
            console.error("Error fetching Canvas data:", error);
        }
    });
}

  
  // Function to fetch assignments for a specific course
  function fetchAssignmentsForCourse(courseId, apiToken, course) {
    const ASSIGNMENTS_URL = `https://canvas.uoregon.edu/api/v1/courses/${courseId}/assignments`;

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

        // Add assignments to the course
        assignmentsData.forEach((assignmentData) => {
            const assignment = new Assignment(
                assignmentData.name, 
                assignmentData.due_at, 
                assignmentData.points_possible, 
                assignmentData.id
            );

            // Include the assignment's submission link
            assignment.subLink = assignmentData.html_url;

            // Extract materials if available (adjust field based on API)
            assignment.materials = assignmentData.lock_info || []; // Replace `lock_info` with the field providing materials
            console.log(`Adding assignment: ${assignment}\n`);
            course.addAssignment(assignment);
        });

        console.log(`Updated Course with Assignments:`, course);
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
    assignmentsContainer.innerHTML = ""; // Clear previous content

    // Check if the course has assignments
    if (!course.assignments || course.assignments.length === 0) {
        assignmentsContainer.innerHTML = "<p>No assignments available for this course.</p>";
        return;
    }

    const assignmentsHeader = document.createElement("h2");
    assignmentsHeader.textContent = `Assignments for ${course.id}`;
    assignmentsContainer.appendChild(assignmentsHeader);

    // Create a list of assignments
    course.assignments.forEach((assignment) => {
        const assignmentDiv = document.createElement("div");
        assignmentDiv.classList.add("assignment-item");

        // Create a button for the assignment
        const assignmentButton = document.createElement("button");
        assignmentButton.textContent = `${assignment.title} - Due: ${assignment.dueDate || "No Due Date"}`;
        assignmentButton.classList.add("assignment-button");

        // Add click event listener to toggle materials display
        assignmentButton.addEventListener("click", () => {
            console.log(`Assignment button clicked for: ${assignment.title}`);
            displayMaterials(assignment);
        });

        assignmentDiv.appendChild(assignmentButton);
        assignmentsContainer.appendChild(assignmentDiv);
    });

    assignmentsContainer.style.display = "block"; // Show the assignments tab
}



// Function to show/hide materials for an assignment
function displayMaterials(assignment) {
    const materialTab = document.getElementById("materialTab");

    // Clear the default "Materials" text
    materialTab.textContent = "";

    const materialsContainer = document.createElement("div");
    materialsContainer.id = `materials-${assignment.id}`;
    materialsContainer.classList.add("materials-container");

    // Add a header for the materials
    const materialsHeader = document.createElement("h3");
    materialsHeader.textContent = `Materials for ${assignment.title}`;
    materialsContainer.appendChild(materialsHeader);

    // Create a list for materials
    const materialsList = document.createElement("ul");
    materialsList.classList.add("materials-list");

    // Add the submission link
    if (assignment.subLink) {
        const submissionItem = document.createElement("li");
        const submissionLink = document.createElement("a");
        submissionLink.href = assignment.subLink;
        submissionLink.textContent = "Submission Link";
        submissionLink.target = "_blank";
        submissionItem.appendChild(submissionLink);
        materialsList.appendChild(submissionItem);
    }

    // Add existing materials
    assignment.materials.forEach((material) => {
        const materialItem = document.createElement("li");
        const materialLink = document.createElement("a");
        materialLink.href = material.link;
        materialLink.textContent = material.title;
        materialLink.target = "_blank";
        materialItem.appendChild(materialLink);
        materialsList.appendChild(materialItem);
    });

    materialsContainer.appendChild(materialsList);

    // Add a form for adding materials
    const addMaterialDiv = document.createElement("div");
    addMaterialDiv.classList.add("add-material");

    const materialTitleInput = document.createElement("input");
    materialTitleInput.type = "text";
    materialTitleInput.placeholder = "Material Title";
    materialTitleInput.classList.add("material-input");

    const materialLinkInput = document.createElement("input");
    materialLinkInput.type = "url";
    materialLinkInput.placeholder = "Material Link";
    materialLinkInput.classList.add("material-input");

    const addMaterialButton = document.createElement("button");
    addMaterialButton.textContent = "Add Material";
    addMaterialButton.classList.add("add-material-button");

    addMaterialButton.addEventListener("click", () => {
        const title = materialTitleInput.value.trim();
        const link = materialLinkInput.value.trim();

        if (title && link) {
            const newMaterial = { id: Assignment.generateId(), title, link };
            assignment.addMaterial(newMaterial);

            const materialItem = document.createElement("li");
            const materialLink = document.createElement("a");
            materialLink.href = link;
            materialLink.textContent = title;
            materialLink.target = "_blank";
            materialItem.appendChild(materialLink);
            materialsList.appendChild(materialItem);

            materialTitleInput.value = "";
            materialLinkInput.value = "";
        }
    });

    addMaterialDiv.appendChild(materialTitleInput);
    addMaterialDiv.appendChild(materialLinkInput);
    addMaterialDiv.appendChild(addMaterialButton);
    materialsContainer.appendChild(addMaterialDiv);

    materialTab.appendChild(materialsContainer);
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

