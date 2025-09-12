// Payment system functionality - Extracted from tickets.html
let selectedPaymentMethod = null;
let selectedDeliveryMethod = 'email';
let currentTicketType = null;
let currentTicketPrice = 0;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Buy ticket buttons
  document.querySelectorAll('.buy-ticket-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      currentTicketType = this.getAttribute('data-ticket-type');
      currentTicketPrice = parseInt(this.getAttribute('data-price'));
      openPaymentModal();
    });
  });

  // Payment method selection
  document.querySelectorAll('.payment-method').forEach(method => {
    method.addEventListener('click', function() {
      // Remove selected class from all methods
      document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
      // Add selected class to clicked method
      this.classList.add('selected');
      selectedPaymentMethod = this.getAttribute('data-method');
      
      // Show/hide card form
      const cardForm = document.getElementById('cardForm');
      if (selectedPaymentMethod === 'card') {
        cardForm.classList.add('active');
      } else {
        cardForm.classList.remove('active');
      }
      
      updateProceedButton();
    });
  });

  // Delivery method selection
  document.querySelectorAll('.delivery-method').forEach(method => {
    method.addEventListener('click', function() {
      document.querySelectorAll('.delivery-method').forEach(m => m.classList.remove('selected'));
      this.classList.add('selected');
      selectedDeliveryMethod = this.getAttribute('data-delivery');
    });
  });

  // Form validation
  const inputs = document.querySelectorAll('.form-input');
  inputs.forEach(input => {
    input.addEventListener('input', updateProceedButton);
  });

  // Card number formatting
  const cardNumberInput = document.querySelector('input[placeholder="1234 5678 9012 3456"]');
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
      e.target.value = formattedValue;
    });
  }

  // Expiry date formatting
  const expiryInput = document.querySelector('input[placeholder="MM/YY"]');
  if (expiryInput) {
    expiryInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      e.target.value = value;
    });
  }
});

function openPaymentModal() {
  // Update order summary (no processing fee)
  const ticketName = currentTicketType === 'vip' ? 'VIP Ticket' : 'Ordinary Ticket';
  
  document.getElementById('ticketTypeName').textContent = ticketName;
  document.getElementById('ticketPrice').textContent = `¥${currentTicketPrice.toLocaleString()}`;
  
  // Show modal
  document.getElementById('paymentModal').style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  document.getElementById('paymentModal').style.display = 'none';
  document.body.style.overflow = '';
}

function updateProceedButton() {
  const proceedBtn = document.querySelector('.proceed-btn');
  const emailInput = document.querySelector('input[type="email"]');
  
  let isValid = selectedPaymentMethod && emailInput?.value;
  
  // Additional validation for card payments
  if (selectedPaymentMethod === 'card' && paymentElement) {
    // Stripe Elements handles validation internally
    isValid = isValid && emailInput?.value;
  }
  
  proceedBtn.disabled = !isValid;
}

async function processPayment() {
  const proceedBtn = document.querySelector('.proceed-btn');
  const originalText = proceedBtn.textContent;
  proceedBtn.textContent = 'Processing...';
  proceedBtn.disabled = true;
  
  try {
    if (selectedPaymentMethod === 'card') {
      await processStripePayment();
    } else if (selectedPaymentMethod === 'paypay') {
      await initializePayPay();
      // PayPay processing is handled by polling
      proceedBtn.textContent = 'Waiting for Payment...';
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
    proceedBtn.textContent = originalText;
    proceedBtn.disabled = false;
  }
}

async function processStripePayment() {
  const emailInput = document.querySelector('input[type="email"]');
  
  const {error} = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: `${window.location.origin}/payment-success`,
      receipt_email: emailInput.value,
    },
    redirect: 'if_required'
  });

  if (error) {
    console.error('Stripe payment error:', error);
    throw error;
  } else {
    closePaymentModal();
    showSuccessModal();
  }
}

function showSuccessModal() {
  // Generate random order ID
  const orderId = Math.random().toString(36).substr(2, 8).toUpperCase();
  document.getElementById('orderId').textContent = orderId;
  
  document.getElementById('successModal').style.display = 'flex';
  
  // Send email (in real implementation, this would be handled by backend)
  console.log('Email sent with ticket details');
}

function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
  // Reset form
  location.reload();
}

// Close modals when clicking outside
document.getElementById('paymentModal').addEventListener('click', function(e) {
  if (e.target === this) closePaymentModal();
});

document.getElementById('successModal').addEventListener('click', function(e) {
  if (e.target === this) closeSuccessModal();
});