const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

function handleSubmit(event) {
  event.preventDefault();
  alert("Thanks for your interest! Newsletter integration coming soon.");
}
