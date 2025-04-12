const popup = document.querySelector('.popup');
const downloadButton = document.getElementById('download');
const images = document.querySelectorAll('.screenshot');

let current = 0;
let updateUrl = null;

// تحميل رابط التحديث
fetch('https://raw.githubusercontent.com/abdlhay/Manga_slayer/07e55c5d3e46e2e97bd4d42b563e341a6e43ec12/update.json')
  .then(response => response.json())
  .then(data => {
    if (data && data.update_url) {
      updateUrl = data.update_url;
    } else {
      console.error('رابط التحميل غير موجود في ملف JSON');
    }
  })
  .catch(err => {
    console.error('خطأ في تحميل ملف update.json:', err);
  });

// عند الضغط على زر التحميل
downloadButton.addEventListener('click', function (e) {
  if (!updateUrl) {
    e.preventDefault();
    if (popup) {
      popup.classList.add('show'); // إظهار مع تأثير fade
      setTimeout(() => {
        popup.classList.remove('show'); // إخفاء بعد 3 ثواني
      }, 3000);
    }
  } else {
    downloadButton.href = updateUrl;
  }
});

function showNextImage() {
  images[current].classList.remove('active');
  current = (current + 1) % images.length;
  images[current].classList.add('active');
}

setInterval(showNextImage, 3000);

function toggleMenu(el) {
  document.getElementById('nav').classList.toggle('active');
  el.classList.toggle('active');
}