// Mobile Navigation Toggle
document.getElementById('mobileToggle')?.addEventListener('click', () => {
  document.getElementById('navLinks').classList.toggle('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Auto-hide alerts
setTimeout(() => {
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    alert.style.transition = 'opacity 0.5s';
    alert.style.opacity = '0';
    setTimeout(() => alert.remove(), 500);
  });
}, 5000);

// Form validation
const bookingForm = document.querySelector('.booking-form');
if (bookingForm) {
  bookingForm.addEventListener('submit', (e) => {
    const date = new Date(bookingForm.querySelector('[name="date"]').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) {
      e.preventDefault();
      alert('Please select a future date');
    }
  });
}

function toggleAdminSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  sidebar.classList.toggle('open');
}
