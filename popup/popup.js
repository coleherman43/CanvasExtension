// This is where we make the interactive JS bits for the actual extension interface
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
  });
  
  async function fetchCanvasData() {
    const API_URL = "https://<your-canvas-domain>/api/v1/courses";
  
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
          console.log(data); // Handle and display the fetched data
        })
        .catch((error) => {
          console.error("Error fetching Canvas data:", error);
        });
    });
  }
  