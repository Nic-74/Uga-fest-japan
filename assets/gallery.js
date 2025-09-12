// Gallery functionality - Extracted from gallery.html
const allImages = document.querySelectorAll('.gallery img');
const slideshow = document.getElementById('slideshow');
const slidesContainer = document.getElementById('slides');
const counter = document.getElementById('counter');
let currentSlide = 0;

// Initialize slideshow
allImages.forEach((img, index) => {
  img.onclick = () => openSlideshow(index);
  
  const slide = document.createElement('div');
  slide.className = index === 0 ? 'slide active' : 'slide';
  slide.innerHTML = `<img src="${img.src}" alt="Festival photo ${index + 1}">`;
  slidesContainer.appendChild(slide);
});

// Show more photos
document.getElementById('showMoreBtn').onclick = function() {
  const hiddenImages = document.querySelectorAll('.gallery-hidden');
  hiddenImages.forEach(img => img.classList.remove('gallery-hidden'));
  this.style.display = 'none';
};

function openSlideshow(index) {
  currentSlide = index;
  slideshow.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  showSlide(currentSlide);
}

function closeSlideshow() {
  slideshow.style.display = 'none';
  document.body.style.overflow = '';
}

function changeSlide(direction) {
  currentSlide += direction;
  if (currentSlide >= allImages.length) currentSlide = 0;
  if (currentSlide < 0) currentSlide = allImages.length - 1;
  showSlide(currentSlide);
}

function showSlide(index) {
  document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.slide')[index].classList.add('active');
  counter.textContent = `${index + 1} / ${allImages.length}`;
}

// Keyboard navigation
document.addEventListener('keydown', function(e) {
  if (slideshow.style.display === 'flex') {
    if (e.key === 'Escape') closeSlideshow();
    if (e.key === 'ArrowRight') changeSlide(1);
    if (e.key === 'ArrowLeft') changeSlide(-1);
  }
});

// Close on background click
slideshow.onclick = function(e) {
  if (e.target === slideshow) closeSlideshow();
};