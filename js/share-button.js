const shareBtn = document.getElementById("share-btn");
const shareModal = document.getElementById("shareModal");
const closeModal = document.getElementById("closeModal");
const copyConfirm = document.getElementById("copyConfirm");

// Open the share modal
shareBtn.onclick = () => {
  const linkInput = document.getElementById("gameLink");
  linkInput.value = window.location.href; // Set the value dynamically
  shareModal.style.display = "block";
  copyConfirm.style.display = "none";
};

// Close the modal when clicking the close button
closeModal.onclick = () => {
  shareModal.style.display = "none";
};

// Close the modal when clicking outside of it
window.onclick = function(event) {
  if (event.target === shareModal) {
    shareModal.style.display = "none";
  }
};

// Copy the current page URL to clipboard
function copyGameLink() {
  const linkInput = document.getElementById("gameLink");
  const currentUrl = window.location.href;

  // Set input field value
  linkInput.value = currentUrl;

  // Use Clipboard API (modern browsers)
  navigator.clipboard.writeText(currentUrl).then(() => {
    document.getElementById("copyConfirm").style.display = "block";
  }).catch(err => {
    console.error("Failed to copy link:", err);
  });
}
