// Set current year in footer
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Newsletter Lambda Function URL
const NEWSLETTER_API_URL = 'https://dqkt3fisl2msjgo2oepljdtndq0kgwba.lambda-url.us-east-1.on.aws/';

/**
 * Shows a message to the user
 * @param {string} message - Message to display
 * @param {boolean} isSuccess - Whether this is a success message
 */
function showMessage(message, isSuccess) {
  const messageEl = document.getElementById('newsletterMessage');
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `newsletter-message ${isSuccess ? 'success' : 'error'}`;
  }
}

/**
 * Sets the loading state of the form
 * @param {boolean} isLoading - Whether the form is loading
 */
function setLoading(isLoading) {
  const submitBtn = document.getElementById('submitBtn');
  const form = document.getElementById('newsletterForm');
  
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    submitBtn.textContent = isLoading ? 'Subscribing...' : 'Join the newsletter';
  }
  
  if (form) {
    const inputs = form.querySelectorAll('input');
    inputs.forEach(input => {
      input.disabled = isLoading;
    });
  }
}

/**
 * Handles the newsletter form submission
 * @param {Event} event - Form submit event
 */
async function handleSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const formData = new FormData(form);
  const email = formData.get('email')?.toString().trim();
  const name = formData.get('name')?.toString().trim();

  // Clear previous message
  showMessage('', true);

  // Validate inputs
  if (!name) {
    showMessage('Please enter your name', false);
    return;
  }

  if (!email) {
    showMessage('Please enter your email', false);
    return;
  }

  // Check if API URL is configured
  if (NEWSLETTER_API_URL === 'YOUR_NEWSLETTER_FUNCTION_URL') {
    showMessage('Newsletter service not configured yet. Please try again later.', false);
    console.warn('Newsletter API URL not configured. Update NEWSLETTER_API_URL in script.js');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch(NEWSLETTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      showMessage(data.message || 'Successfully subscribed!', true);
      form.reset();
    } else if (response.status === 409) {
      // Already subscribed
      showMessage(data.message || 'This email is already subscribed.', false);
    } else {
      showMessage(data.message || data.error || 'Something went wrong. Please try again.', false);
    }
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    showMessage('Network error. Please check your connection and try again.', false);
  } finally {
    setLoading(false);
  }
}
