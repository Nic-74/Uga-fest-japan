// Payment system functionality - Updated with PayPay integration and Email Notifications
let selectedPaymentMethod = null;
let selectedDeliveryMethod = 'email';
let currentTicketType = null;
let currentTicketPrice = 0;

// PayPay payment links
const PAYPAY_LINKS = {
  ordinary: 'https://qr.paypay.ne.jp/p2p01_8iPn5mpkgQF3ossX', // ¥10,000
  vip: 'https://qr.paypay.ne.jp/p2p01_s6bpsnFgW51sfOJJ'       // ¥20,000
};

// EmailJS configuration
const EMAILJS_CONFIG = {
  publicKey: '4d0JD6v9ntHksYUD6',
  serviceId: 'service_yfa65gi',
  organizerTemplateId: 'template_g3bh96l',
  customerTemplateId: 'template_dix8pfk',
  organizerEmail: 'nicholaslubega74@gmail.com'
};

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

  // Initialize EmailJS
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.log('EmailJS initialized successfully');
  } else {
    console.error('EmailJS library not loaded. Make sure to include the EmailJS script.');
  }

  // Check for pending orders
  checkPendingOrders();
});

function openPaymentModal() {
  // Update order summary
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
  
  // Reset form state
  selectedPaymentMethod = null;
  document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
  document.getElementById('cardForm').classList.remove('active');
  updateProceedButton();
}

function updateProceedButton() {
  const proceedBtn = document.querySelector('.proceed-btn');
  const nameInput = document.querySelector('input[placeholder="Your full name"]');
  const emailInput = document.querySelector('input[type="email"]');
  
  let isValid = selectedPaymentMethod && nameInput?.value && emailInput?.value;
  
  // Additional validation for card payments
  if (selectedPaymentMethod === 'card') {
    const cardInputs = document.querySelectorAll('#cardForm .form-input[required]');
    const cardFormValid = Array.from(cardInputs).every(input => input.value.trim() !== '');
    isValid = isValid && cardFormValid;
  }
  
  proceedBtn.disabled = !isValid;
  
  // Update button text based on payment method
  if (selectedPaymentMethod === 'paypay') {
    proceedBtn.textContent = 'Pay with PayPay';
  } else if (selectedPaymentMethod === 'card') {
    proceedBtn.textContent = 'Complete Purchase';
  } else {
    proceedBtn.textContent = 'Complete Purchase';
  }
}

async function processPayment() {
  const proceedBtn = document.querySelector('.proceed-btn');
  const originalText = proceedBtn.textContent;
  
  try {
    if (selectedPaymentMethod === 'card') {
      proceedBtn.textContent = 'Processing...';
      proceedBtn.disabled = true;
      await processCardPayment();
    } else if (selectedPaymentMethod === 'paypay') {
      await processPayPayPayment();
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
    proceedBtn.textContent = originalText;
    proceedBtn.disabled = false;
  }
}

async function processCardPayment() {
  // Simulate card processing
  return new Promise((resolve) => {
    setTimeout(async () => {
      console.log('Card payment processed successfully');
      closePaymentModal();
      await showSuccessModal();
      resolve();
    }, 2000);
  });
}

async function processPayPayPayment() {
  const nameInput = document.querySelector('input[placeholder="Your full name"]');
  const emailInput = document.querySelector('input[type="email"]');
  const phoneInput = document.querySelector('input[type="tel"]');
  
  // Validate required fields
  if (!nameInput.value) {
    alert('Please enter your full name');
    return;
  }
  
  if (!emailInput.value) {
    alert('Please enter your email address');
    return;
  }
  
  // Get the appropriate PayPay link based on ticket type
  const payPayLink = PAYPAY_LINKS[currentTicketType];
  
  if (!payPayLink) {
    alert('PayPay link not found for this ticket type');
    return;
  }
  
  // Store customer details for order processing
  const customerData = {
    name: nameInput.value,
    email: emailInput.value,
    phone: phoneInput.value || '',
    ticketType: currentTicketType,
    ticketPrice: currentTicketPrice,
    deliveryMethod: selectedDeliveryMethod,
    orderTime: new Date().toISOString()
  };
  
  // Store in sessionStorage for order tracking
  sessionStorage.setItem('pendingOrder', JSON.stringify(customerData));
  
  // Show instructions modal before redirect
  showPayPayInstructions(payPayLink);
}

function showPayPayInstructions(payPayLink) {
  // Create instruction modal
  const instructionModal = document.createElement('div');
  instructionModal.id = 'payPayInstructions';
  instructionModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
  `;
  
  instructionModal.innerHTML = `
    <div style="background: white; padding: 30px; border-radius: 12px; max-width: 400px; text-align: center; margin: 20px;">
      <div style="font-size: 48px; margin-bottom: 20px;">💳</div>
      <h3 style="margin-bottom: 15px; color: #333;">PayPay Payment</h3>
      <p style="margin-bottom: 20px; color: #666; line-height: 1.5;">
        You will be redirected to PayPay to complete your payment of ¥${currentTicketPrice.toLocaleString()}.
      </p>
      <p style="margin-bottom: 25px; color: #666; font-size: 14px;">
        After completing the payment, please return to this page to confirm your order.
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button onclick="cancelPayPayPayment()" style="padding: 12px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">
          Cancel
        </button>
        <button onclick="proceedToPayPay('${payPayLink}')" style="padding: 12px 20px; background: #ff6b6b; color: white; border: none; border-radius: 6px; cursor: pointer;">
          Continue to PayPay
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(instructionModal);
}

function proceedToPayPay(payPayLink) {
  // Remove instruction modal
  const modal = document.getElementById('payPayInstructions');
  if (modal) {
    modal.remove();
  }
  
  // Close payment modal
  closePaymentModal();
  
  // Show processing state
  showPaymentProcessing();
  
  // Open PayPay link in new tab/window
  const payPayWindow = window.open(payPayLink, '_blank', 'width=400,height=600');
  
  // Start checking for payment completion
  startPaymentPolling(payPayWindow);
}

function cancelPayPayPayment() {
  const modal = document.getElementById('payPayInstructions');
  if (modal) {
    modal.remove();
  }
  // Clear pending order
  sessionStorage.removeItem('pendingOrder');
}

function showPaymentProcessing() {
  const processingModal = document.createElement('div');
  processingModal.id = 'paymentProcessing';
  processingModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10000;
  `;
  
  processingModal.innerHTML = `
    <div style="background: white; padding: 40px; border-radius: 12px; text-align: center; max-width: 350px;">
      <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
      <h3 style="margin-bottom: 15px; color: #333;">Waiting for Payment</h3>
      <p style="margin-bottom: 25px; color: #666; line-height: 1.5;">
        Please complete your PayPay payment. This window will automatically update when payment is received.
      </p>
      <button onclick="checkPaymentStatus()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
        Check Status
      </button>
      <button onclick="cancelPaymentProcessing()" style="padding: 10px 20px; border: 1px solid #ddd; background: white; border-radius: 6px; cursor: pointer;">
        Cancel
      </button>
    </div>
  `;
  
  document.body.appendChild(processingModal);
}

function startPaymentPolling(payPayWindow) {
  const pollInterval = setInterval(() => {
    // Check if PayPay window is closed (user might have completed payment)
    if (payPayWindow && payPayWindow.closed) {
      clearInterval(pollInterval);
      // Ask user about payment status
      setTimeout(() => {
        if (confirm('Did you complete the PayPay payment successfully?')) {
          completePayPayOrder();
        } else {
          cancelPaymentProcessing();
        }
      }, 500);
    }
  }, 1000);
  
  // Stop polling after 10 minutes
  setTimeout(() => {
    clearInterval(pollInterval);
    if (payPayWindow && !payPayWindow.closed) {
      payPayWindow.close();
    }
  }, 600000);
}

function checkPaymentStatus() {
  // In a real implementation, this would check with your backend
  const userConfirmed = confirm('Have you completed the PayPay payment successfully?');
  if (userConfirmed) {
    completePayPayOrder();
  }
}

async function completePayPayOrder() {
  // Remove processing modal
  const modal = document.getElementById('paymentProcessing');
  if (modal) {
    modal.remove();
  }
  
  // Complete the order
  await showSuccessModal();
  
  // Clear pending order
  sessionStorage.removeItem('pendingOrder');
}

function cancelPaymentProcessing() {
  const modal = document.getElementById('paymentProcessing');
  if (modal) {
    modal.remove();
  }
  
  // Clear pending order
  sessionStorage.removeItem('pendingOrder');
  
  // Optionally reopen payment modal
  if (confirm('Would you like to try a different payment method?')) {
    openPaymentModal();
  }
}

async function showSuccessModal() {
  // Generate random order ID
  const orderId = Math.random().toString(36).substr(2, 8).toUpperCase();
  document.getElementById('orderId').textContent = orderId;
  
  document.getElementById('successModal').style.display = 'flex';
  
  // Send notification emails to organizer and customer
  try {
    await sendEmailNotifications(orderId);
    console.log('Email notifications sent successfully');
  } catch (error) {
    console.error('Failed to send email notifications:', error);
    // Still show success but indicate email issue
    alert('Order completed successfully! However, there was an issue sending confirmation emails. Please contact support.');
  }
  
  // In a real implementation, this would trigger backend processes:
  // - Update inventory
  // - Log transaction
  console.log('Order completed successfully:', {
    orderId,
    ticketType: currentTicketType,
    price: currentTicketPrice,
    paymentMethod: selectedPaymentMethod
  });
}

function closeSuccessModal() {
  document.getElementById('successModal').style.display = 'none';
  // Reset form
  location.reload();
}

// Check for pending orders on page load
function checkPendingOrders() {
  const pendingOrder = sessionStorage.getItem('pendingOrder');
  if (pendingOrder) {
    const orderData = JSON.parse(pendingOrder);
    // Check if order is older than 30 minutes
    const orderTime = new Date(orderData.orderTime);
    const now = new Date();
    const timeDiff = (now - orderTime) / (1000 * 60); // in minutes
    
    if (timeDiff < 30) {
      // Ask user about payment status
      setTimeout(() => {
        if (confirm('You have a pending PayPay payment. Did you complete it successfully?')) {
          currentTicketType = orderData.ticketType;
          currentTicketPrice = orderData.ticketPrice;
          selectedPaymentMethod = 'paypay';
          completePayPayOrder();
        } else {
          sessionStorage.removeItem('pendingOrder');
        }
      }, 1000);
    } else {
      // Clear expired pending order
      sessionStorage.removeItem('pendingOrder');
    }
  }
}

// Email notification functions
async function sendEmailNotifications(orderId) {
  const customerData = getCustomerData();
  
  if (typeof emailjs === 'undefined') {
    throw new Error('EmailJS library not loaded');
  }
  
  try {
    // Send notification to organizer
    await sendOrganizerEmail(customerData, orderId);
    console.log('Organizer notification sent');
    
    // Send ticket confirmation to customer
    await sendCustomerTicket(customerData, orderId);
    console.log('Customer ticket sent');
    
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    // Fallback to mailto for organizer notification
    const emailData = {
      to: EMAILJS_CONFIG.organizerEmail,
      subject: `🎫 New Ticket Purchase - Order #${orderId}`,
      body: formatNotificationEmail(customerData, orderId)
    };
    sendEmailViaMailto(emailData);
    throw error;
  }
}

async function sendOrganizerEmail(customerData, orderId) {
  const templateParams = {
    // Basic email fields
    to_email: EMAILJS_CONFIG.organizerEmail,
    subject: `🎫 New Ticket Purchase - Order #${orderId}`,
    
    // Order details that match your template variables
    order_id: orderId,
    customer_name: customerData.name,
    customer_email: customerData.email,
    customer_phone: customerData.phone || 'Not provided',
    ticket_type: customerData.ticketType,
    price: `¥${customerData.price.toLocaleString()}`,
    payment_method: customerData.paymentMethod,
    delivery_method: customerData.deliveryMethod,
    order_date: customerData.orderDate,
    
    // Full formatted message body
    message_body: formatNotificationEmail(customerData, orderId)
  };
  
  return emailjs.send(
    EMAILJS_CONFIG.serviceId, 
    EMAILJS_CONFIG.organizerTemplateId, 
    templateParams
  );
}

async function sendCustomerTicket(customerData, orderId) {
  const templateParams = {
    // Customer email details
    to_email: customerData.email,
    customer_name: customerData.name,
    
    // Order information
    order_id: orderId,
    ticket_type: customerData.ticketType,
    price: `¥${customerData.price.toLocaleString()}`,
    payment_method: customerData.paymentMethod,
    order_date: customerData.orderDate,
    
    // Event details
    event_date: 'October 9, 2025',
    event_time: '6:00 PM - 11:00 PM',
    event_location: 'Tokyo, Japan',
    
    // QR code for entry
    qr_code_text: `UF2025-${orderId}`,
    
    // Full formatted message
    message_body: formatCustomerTicketEmail(customerData, orderId)
  };
  
  return emailjs.send(
    EMAILJS_CONFIG.serviceId, 
    EMAILJS_CONFIG.customerTemplateId, 
    templateParams
  );
}

function getCustomerData() {
  const nameInput = document.querySelector('input[placeholder="Your full name"]');
  const emailInput = document.querySelector('input[type="email"]');
  const phoneInput = document.querySelector('input[type="tel"]');
  
  return {
    name: nameInput?.value || 'Not provided',
    email: emailInput?.value || 'Not provided',
    phone: phoneInput?.value || 'Not provided',
    ticketType: currentTicketType === 'vip' ? 'VIP Ticket' : 'Ordinary Ticket',
    price: currentTicketPrice,
    paymentMethod: selectedPaymentMethod === 'paypay' ? 'PayPay' : 'Credit Card',
    deliveryMethod: selectedDeliveryMethod === 'email' ? 'Email Delivery' : 'Venue Pickup',
    orderDate: new Date().toLocaleString('en-JP', { 
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  };
}

function formatNotificationEmail(customerData, orderId) {
  return `🎉 NEW TICKET PURCHASE NOTIFICATION

Order Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Order ID: #UF2025-${orderId}
📅 Date: ${customerData.orderDate}
🎫 Ticket Type: ${customerData.ticketType}
💰 Amount: ¥${customerData.price.toLocaleString()}
💳 Payment Method: ${customerData.paymentMethod}
📦 Delivery: ${customerData.deliveryMethod}

Customer Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Name: ${customerData.name}
📧 Email: ${customerData.email}
📱 Phone: ${customerData.phone}

Next Steps:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${customerData.deliveryMethod === 'Email Delivery' 
  ? '✅ Customer will receive ticket via email automatically'
  : '⚠️ Customer will collect ticket at venue - add to will-call list'
}

---
Uga Fest Japan Ticket System`;
}

function formatCustomerTicketEmail(customerData, orderId) {
  return `🎫 YOUR UGA FEST JAPAN TICKET

Dear ${customerData.name},

Thank you for purchasing your ticket to Uga Fest Japan!

🎟️ TICKET DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Order ID: #UF2025-${orderId}
🎫 Ticket Type: ${customerData.ticketType}
💰 Amount Paid: ¥${customerData.price.toLocaleString()}
📅 Purchase Date: ${customerData.orderDate}

📍 EVENT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Event: Uga Fest Japan
📅 Date: October 9, 2025
🕕 Time: 6:00 PM - 11:00 PM
📍 Location: Tokyo, Japan

${customerData.ticketType === 'VIP Ticket' ? 
`✨ VIP PERKS INCLUDED:
• Priority seating
• Exclusive bar access
• Meet & greet opportunities` : 
`🎵 GENERAL ACCESS INCLUDES:
• Concert night access
• Food & drink vendors
• Festival activities`}

📱 ENTRY INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Present this email at the venue entrance
• QR Code: UF2025-${orderId}
• Arrive 30 minutes before event start
• Bring valid ID for verification

🎊 We can't wait to celebrate with you!

Questions? Contact us at ${EMAILJS_CONFIG.organizerEmail}

---
Uga Fest Japan Team
Celebrating Uganda's Independence in Japan`;
}

// Fallback method using mailto
function sendEmailViaMailto(emailData) {
  const mailtoUrl = `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
  
  // Try to open email client
  const link = document.createElement('a');
  link.href = mailtoUrl;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  console.log('Email notification sent via mailto');
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
  if (e.target.id === 'paymentModal') {
    closePaymentModal();
  } else if (e.target.id === 'successModal') {
    closeSuccessModal();
  }
});
