const popup = document.querySelector('.popup');
const downloadButton = document.getElementById('download');
const images = document.querySelectorAll('.screenshot');

let current = 0;
let updateUrl = null;
let isLoading = false;

// عرض رسالة في البوب أب
function showPopup(message, duration = 3000) {
if (!popup) return;
popup.textContent = message;
popup.classList.add('show');
setTimeout(() => {
popup.classList.remove('show');
}, duration);
}

// تحميل رابط التحديث
fetch('https://raw.githubusercontent.com/abdlhay/Manga_slayer/07e55c5d3e46e2e97bd4d42b563e341a6e43ec12/update.json')
.then(response => {
if (!response.ok) throw new Error('فشل تحميل الملف');
return response.json();
})
.then(data => {
if (data && typeof data.update_url === 'string' && data.update_url.startsWith('http')) {
updateUrl = data.update_url;
} else {
console.error('رابط التحميل غير صالح أو غير موجود في JSON');
}
})
.catch(err => {
console.error('خطأ في تحميل ملف update.json:', err);
showPopup('حدث خطأ أثناء التحقق من وجود التحديث');
});

// عند الضغط على زر التحميل
if (downloadButton) {
downloadButton.addEventListener('click', function(e) {
if (isLoading) {
e.preventDefault();
return;
}

if (!updateUrl || !updateUrl.startsWith('http')) {  
  e.preventDefault();  
  showPopup('رابط التحميل غير متاح حالياً أو غير صالح');  
  return;  
}  
  
isLoading = true;  
  
// إذا كان الزر <a> استخدم href، وإذا كان <button> استخدم redirect  
if (downloadButton.tagName.toLowerCase() === 'a') {  
  downloadButton.setAttribute('href', updateUrl);  
} else {  
  window.location.href = updateUrl;  
}  
  
setTimeout(() => { isLoading = false }, 3000);

});
}

// عرض الصور بالتناوب
if (images.length > 0) {
images[0].classList.add('active');
setInterval(() => {
images[current].classList.remove('active');
current = (current + 1) % images.length;
images[current].classList.add('active');
}, 3000);
}

// تبديل القائمة
// بدلاً من ذلك، قم بحذف onclick من HTML
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle.addEventListener('click', function() {
    document.getElementById('nav').classList.toggle('active');
    this.classList.toggle('active');
  });
});