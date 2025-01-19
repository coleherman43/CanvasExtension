// This is where we make the interactive JS menu in the popup and import the data from Canvas

import {Course, Assignment, CanvasData} from '../data.js';
console.log("Running CanvasExtension...\n");
// popup.js

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
    const API_URL = "https://canvas.uoregon.edu/api/v1/courses";  // Replace with your Canvas domain
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
          console.log(data); // Handle the fetched data here
  
          // Create instances of your classes with the fetched data
          const canvasData = new CanvasData();
          data.forEach(courseData => {
            const course = new Course(courseData.id, courseData.name);
  
            // Assuming each course contains assignments in the response:
            courseData.assignments.forEach(assignmentData => {
              const assignment = new Assignment(assignmentData.id, assignmentData.name, assignmentData.due_at);
              course.addAssignment(assignment);
            });
  
            canvasData.addCourse(course);
          });
  
          // At this point, `canvasData` holds all the courses and assignments in your classes.
          console.log(canvasData);  // You can now use the canvasData object for testing or other purposes
        })
        .catch((error) => {
          console.error("Error fetching Canvas data:", error);
        });
    });
  }
  