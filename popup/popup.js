// This is where we make the interactive JS menu in the popup and import the data from Canvas

import {Course, Assignment, CanvasData} from '../data.js';
console.log("Running CanvasExtension...\n");

document.addEventListener("DOMContentLoaded", () => {
    const saveButton = document.getElementById("saveToken");
    const tokenInput = document.getElementById("apiToken");
  
    // Save the API token to Chrome storage
    saveButton.addEventListener("click", () => {
      const apiToken = tokenInput.value.trim();
      if (apiToken) {
        chrome.storage.local.set({ apiToken }, () => {
          alert("API Token saved securely!");
          tokenInput.value = ""; // Clear the input field
        });
      } else {
        alert("Please enter a valid token!");
      }
    });
  
    // Fetch Canvas data when the popup is loaded
    fetchCanvasData();
  });
  
  // Function to fetch Canvas data and store in the classes
  async function fetchCanvasData() {
    const API_URL = "https://canvas.uoregon.edu/api/v1/courses";  // Get courses first
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
          const assignment = new Assignment(assignmentData.id, assignmentData.name, assignmentData.due_at);
          course.addAssignment(assignment);
        });
  
        console.log(course); // To see the course with assignments
      })
      .catch((error) => {
        console.error(`Error fetching assignments for course ${courseId}:`, error);
      });
  }
  
  


