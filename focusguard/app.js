/**
 * FocusGuard Premium Portal
 * Google Sign-In + Razorpay Payment Integration
 */

// Configuration
const CONFIG = {
  app: 'focusguard',
  googleClientId: '387675057644-69k4lh4j6m5hronf3eunp6qd1i4ulmfj.apps.googleusercontent.com',
  authApiUrl: 'https://e44zma7ej4d6uqov3zlf33sbre0oyvtj.lambda-url.us-east-1.on.aws/',
  paymentApiUrl: 'https://ixdhoc66ueb3bghpukzesddwsa0ovofg.lambda-url.us-east-1.on.aws/',
  razorpayKeyId: 'rzp_live_RsDxhp7JcQFQAl',
  currency: 'USD',
  pricing: {
    one_time: {
      amount: 1500, // in cents ($15 USD)
      description: 'FocusGuard Premium - Lifetime',
      duration: 'Lifetime'
    }
  }
};

// State
let currentUser = null;
let subscriptionStatus = null;

// DOM Elements
const elements = {
  signedOutSection: document.getElementById('signedOutSection'),
  signedInSection: document.getElementById('signedInSection'),
  pricingSection: document.getElementById('pricingSection'),
  premiumActiveSection: document.getElementById('premiumActiveSection'),
  userMenu: document.getElementById('userMenu'),
  userBtn: document.getElementById('userBtn'),
  userDropdown: document.getElementById('userDropdown'),
  userAvatar: document.getElementById('userAvatar'),
  userName: document.getElementById('userName'),
  dropdownAvatar: document.getElementById('dropdownAvatar'),
  dropdownName: document.getElementById('dropdownName'),
  dropdownEmail: document.getElementById('dropdownEmail'),
  signOutBtn: document.getElementById('signOutBtn'),
  statusCard: document.getElementById('statusCard'),
  statusBadge: document.getElementById('statusBadge'),
  statusText: document.getElementById('statusText'),
  premiumInfo: document.getElementById('premiumInfo'),
  premiumExpires: document.getElementById('premiumExpires'),
  loadingOverlay: document.getElementById('loadingOverlay'),
  toast: document.getElementById('toast')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initGoogleSignIn();
  initUserMenu();
  setYear();
  checkStoredSession();
});

// Set current year in footer
function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Initialize Google Sign-In with retry mechanism
function initGoogleSignIn(retryCount = 0) {
  const maxRetries = 10;
  const retryDelay = 300; // ms

  if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
    if (retryCount < maxRetries) {
      console.log(`Google Sign-In SDK not loaded yet, retrying... (${retryCount + 1}/${maxRetries})`);
      setTimeout(() => initGoogleSignIn(retryCount + 1), retryDelay);
    } else {
      console.error('Google Sign-In SDK failed to load after max retries');
    }
    return;
  }

  console.log('Google Sign-In SDK loaded, initializing...');
  
  google.accounts.id.initialize({
    client_id: CONFIG.googleClientId,
    callback: handleGoogleSignIn,
    auto_select: false,
    cancel_on_tap_outside: true
  });

  const buttonContainer = document.getElementById('googleSignInBtn');
  if (buttonContainer) {
    google.accounts.id.renderButton(
      buttonContainer,
      {
        theme: 'filled_black',
        size: 'large',
        width: 280,
        text: 'continue_with'
      }
    );
    console.log('Google Sign-In button rendered');
  }
}

// Handle Google Sign-In callback
async function handleGoogleSignIn(response) {
  if (!response.credential) {
    showToast('Sign-in failed. Please try again.', 'error');
    return;
  }

  showLoading(true, 'Signing in...');

  try {
    // Decode JWT to get user info
    const payload = decodeJWT(response.credential);
    
    // Send to backend for verification and user creation
    const backendResponse = await fetch(CONFIG.authApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: response.credential,
        action: 'signin'
      })
    });

    const data = await backendResponse.json();

    if (backendResponse.ok && data.success) {
      currentUser = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email,
        picture: payload.picture,
        idToken: response.credential
      };

      // Store session
      localStorage.setItem('focusguard_user', JSON.stringify(currentUser));
      
      updateUI();
      await checkSubscriptionStatus();
      showToast('Welcome back, ' + currentUser.name.split(' ')[0] + '!', 'success');
    } else {
      throw new Error(data.message || 'Authentication failed');
    }
  } catch (error) {
    console.error('Sign-in error:', error);
    showToast('Sign-in failed. Please try again.', 'error');
  } finally {
    showLoading(false);
  }
}

// Check for stored session
async function checkStoredSession() {
  const stored = localStorage.getItem('focusguard_user');
  if (stored) {
    try {
      currentUser = JSON.parse(stored);
      updateUI();
      await checkSubscriptionStatus();
    } catch (e) {
      localStorage.removeItem('focusguard_user');
    }
  }
}

// Sign out
async function handleSignOut() {
  showLoading(true, 'Signing out...');
  
  try {
    // Notify backend
    if (CONFIG.authApiUrl !== 'YOUR_AUTH_FUNCTION_URL') {
      await fetch(CONFIG.authApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signout' })
      }).catch(() => {});
    }

    // Clear Google session
    if (typeof google !== 'undefined') {
      google.accounts.id.disableAutoSelect();
    }

    // Clear local session
    currentUser = null;
    subscriptionStatus = null;
    localStorage.removeItem('focusguard_user');
    
    updateUI();
    showToast('Signed out successfully', 'success');
  } catch (error) {
    console.error('Sign-out error:', error);
  } finally {
    showLoading(false);
  }
}

// Check subscription status
async function checkSubscriptionStatus() {
  if (!currentUser) return;

  try {
    // Check with backend
    if (CONFIG.paymentApiUrl !== 'YOUR_PAYMENT_FUNCTION_URL') {
      const response = await fetch(`${CONFIG.paymentApiUrl}?action=status&userId=${currentUser.userId}&app=${CONFIG.app}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        subscriptionStatus = await response.json();
      }
    }

    // Fallback: check local storage for demo
    if (!subscriptionStatus) {
      const localStatus = localStorage.getItem(`${CONFIG.app}_subscription_${currentUser.userId}`);
      if (localStatus) {
        subscriptionStatus = JSON.parse(localStatus);
      } else {
        subscriptionStatus = { isPremium: false };
      }
    }

    updateSubscriptionUI();
  } catch (error) {
    console.error('Error checking subscription:', error);
    subscriptionStatus = { isPremium: false };
    updateSubscriptionUI();
  }
}

// Update subscription UI
function updateSubscriptionUI() {
  const isPremium = subscriptionStatus?.isPremium || false;
  
  // Update status badge
  if (isPremium) {
    elements.statusBadge.className = 'status-badge premium';
    elements.statusText.textContent = 'Premium Active';
    
    if (subscriptionStatus.expiresAt) {
      const expiresDate = new Date(subscriptionStatus.expiresAt);
      elements.premiumExpires.textContent = `Your subscription expires on ${expiresDate.toLocaleDateString('en-IN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
      elements.premiumInfo.style.display = 'block';
    } else {
      elements.premiumExpires.textContent = 'Lifetime access - no expiry';
      elements.premiumInfo.style.display = 'block';
    }

    // Show premium active section, hide pricing
    elements.pricingSection.style.display = 'none';
    elements.premiumActiveSection.style.display = 'flex';
  } else {
    elements.statusBadge.className = 'status-badge free';
    elements.statusText.textContent = 'Free Plan';
    elements.premiumInfo.style.display = 'none';
    
    // Show pricing, hide premium active
    elements.pricingSection.style.display = 'block';
    elements.premiumActiveSection.style.display = 'none';
  }
}

// Handle purchase
async function handlePurchase(planType) {
  if (!currentUser) {
    showToast('Please sign in first', 'error');
    return;
  }

  const plan = CONFIG.pricing[planType];
  if (!plan) {
    showToast('Invalid plan selected', 'error');
    return;
  }

  showLoading(true, 'Creating order...');

  try {
    let orderId;
    
    // Create order via backend
    if (CONFIG.paymentApiUrl !== 'YOUR_PAYMENT_FUNCTION_URL') {
      const orderResponse = await fetch(CONFIG.paymentApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-order',
          app: CONFIG.app,
          plan: planType,
          userId: currentUser.userId,
          email: currentUser.email
        })
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || 'Failed to create order');
      }
      orderId = orderData.orderId;
    } else {
      // Demo mode - generate fake order ID
      orderId = 'order_demo_' + Date.now();
    }

    showLoading(false);

    // Open Razorpay checkout
    openRazorpayCheckout(orderId, plan, planType);

  } catch (error) {
    console.error('Purchase error:', error);
    showToast('Failed to initiate payment. Please try again.', 'error');
    showLoading(false);
  }
}

// Open Razorpay checkout
function openRazorpayCheckout(orderId, plan, planType) {
  const options = {
    key: CONFIG.razorpayKeyId,
    amount: plan.amount,
    currency: CONFIG.currency,
    name: 'FocusGuard',
    description: plan.description,
    order_id: orderId,
    prefill: {
      name: currentUser.name,
      email: currentUser.email
    },
    notes: {
      app: CONFIG.app,
      plan: planType,
      userId: currentUser.userId
    },
    theme: {
      color: '#8b5cf6'
    },
    handler: function(response) {
      handlePaymentSuccess(response, planType);
    },
    modal: {
      ondismiss: function() {
        showToast('Payment cancelled', 'error');
      }
    }
  };

  try {
    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function(response) {
      console.error('Payment failed:', response.error);
      showToast('Payment failed: ' + response.error.description, 'error');
    });
    rzp.open();
  } catch (error) {
    console.error('Razorpay error:', error);
    // Demo mode - simulate successful payment
    if (CONFIG.razorpayKeyId === 'YOUR_RAZORPAY_KEY_ID') {
      showToast('Demo mode: Simulating successful payment...', 'success');
      setTimeout(() => {
        handlePaymentSuccess({
          razorpay_payment_id: 'pay_demo_' + Date.now(),
          razorpay_order_id: orderId,
          razorpay_signature: 'demo_signature'
        }, planType);
      }, 1500);
    } else {
      showToast('Failed to open payment window', 'error');
    }
  }
}

// Handle successful payment
async function handlePaymentSuccess(response, planType) {
  showLoading(true, 'Verifying payment...');

  try {
    // Verify payment with backend
    if (CONFIG.paymentApiUrl !== 'YOUR_PAYMENT_FUNCTION_URL') {
      const verifyResponse = await fetch(CONFIG.paymentApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-payment',
          app: CONFIG.app,
          plan: planType,
          userId: currentUser.userId,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const verifyData = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyData.message || 'Payment verification failed');
      }

      subscriptionStatus = verifyData.subscription;
    } else {
      // Demo mode - activate locally
      const expiresAt = planType === 'yearly' 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      subscriptionStatus = {
        isPremium: true,
        plan: planType,
        expiresAt: expiresAt,
        activatedAt: new Date().toISOString()
      };

      // Store locally for demo
      localStorage.setItem(
        `${CONFIG.app}_subscription_${currentUser.userId}`,
        JSON.stringify(subscriptionStatus)
      );
    }

    updateSubscriptionUI();
    showToast('Payment successful! Premium activated.', 'success');

  } catch (error) {
    console.error('Verification error:', error);
    showToast('Payment verification failed. Please contact support.', 'error');
  } finally {
    showLoading(false);
  }
}

// Update UI based on auth state
function updateUI() {
  if (currentUser) {
    // Show signed in state
    elements.signedOutSection.style.display = 'none';
    elements.signedInSection.style.display = 'block';
    elements.userMenu.style.display = 'block';

    // Update user info
    elements.userAvatar.src = currentUser.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name);
    elements.userName.textContent = currentUser.name.split(' ')[0];
    elements.dropdownAvatar.src = currentUser.picture || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.name);
    elements.dropdownName.textContent = currentUser.name;
    elements.dropdownEmail.textContent = currentUser.email;
  } else {
    // Show signed out state
    elements.signedOutSection.style.display = 'flex';
    elements.signedInSection.style.display = 'none';
    elements.userMenu.style.display = 'none';
  }
}

// Initialize user menu dropdown
function initUserMenu() {
  elements.userBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.userDropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    elements.userDropdown?.classList.remove('open');
  });

  elements.signOutBtn?.addEventListener('click', handleSignOut);
}

// Show/hide loading overlay
function showLoading(show, text = 'Processing...') {
  if (elements.loadingOverlay) {
    elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    const loadingText = elements.loadingOverlay.querySelector('.loading-text');
    if (loadingText) loadingText.textContent = text;
  }
}

// Show toast notification
function showToast(message, type = 'info') {
  if (elements.toast) {
    elements.toast.textContent = message;
    elements.toast.className = `toast ${type} show`;
    
    setTimeout(() => {
      elements.toast.classList.remove('show');
    }, 3000);
  }
}

// Decode JWT token
function decodeJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('JWT decode error:', e);
    return null;
  }
}

// Expose handlePurchase to global scope for onclick handlers
window.handlePurchase = handlePurchase;
