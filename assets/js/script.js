const popup = document.querySelector('.popup');
const downloadButton = document.getElementById('download');
const images = document.querySelectorAll('.screenshot');

let current = 0;
let updateUrl = null;
let isLoading = false;
let lastDownloadTime = 0;
const cooldownPeriod = 10000; // 10 ثوانٍ

// عرض رسالة في البوب أب
function showPopup(message, duration = 5000) {
  if (!popup) return;
  popup.textContent = message;
  popup.classList.add('show');
  setTimeout(() => {
    popup.classList.remove('show');
  }, duration);
}

// تحميل رابط التحديث من GitHub
// تحميل رابط التحديث من GitHub
// تحميل رابط التحديث من GitHub
fetch('https://api.github.com/repos/abdlhay/Manga_slayer/releases', {
  headers: {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'MangaSlayerApp/1.0' // يجب تحديث هذا الجزء
  }
})
  .then(response => {
    console.log('استجابة GitHub API:', response);
    if (!response.ok) {
      throw new Error(`خطأ في API: ${response.status} ${response.statusText}`);
    }
    return response.json();
  })
  .then(releases => {
    console.log('الإصدارات المستلمة:', releases);
    
    if (!Array.isArray(releases)) {
      throw new Error('تنسيق الإصدارات غير صحيح');
    }
    
    if (releases.length === 0) {
      throw new Error('لا يوجد إصدارات متاحة');
    }
    
    const latestRelease = releases.find(r => !r.prerelease && !r.draft);
    
    if (!latestRelease) {
      throw new Error('لم يتم العثور على إصدار مستقر');
    }
    
    const apkAsset = latestRelease.assets.find(asset => 
      asset.name.match(/Manga_slayer.*\.apk$/i) // تحسين البحث بال Regex
    );
    
    console.log('الملف المرفق المحدد:', apkAsset);
    
    if (!apkAsset) {
      throw new Error('لم يتم العثور على ملف APK في آخر إصدار');
    }
    
    if (!apkAsset.browser_download_url.startsWith('http')) {
      throw new Error('رابط التحميل غير آمن');
    }
    
    updateUrl = apkAsset.browser_download_url;
    console.log('تم تحديث رابط التحميل بنجاح:', updateUrl);
  })
  .catch(err => {
    console.error('خطأ تفصيلي:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    showPopup('حدث خطأ أثناء جلب التحديث: ' + err.message);
  });

// عند الضغط على زر التحميل
if (downloadButton) {
  downloadButton.addEventListener('click', function(e) {
    const now = Date.now();
    
    if (isLoading || (now - lastDownloadTime < cooldownPeriod)) {
      e.preventDefault();
      const remaining = Math.ceil((cooldownPeriod - (now - lastDownloadTime)) / 1000);
      showPopup(`يرجى الانتظار ${remaining} ثانية قبل إعادة التحميل`);
      return;
    }
    
    if (!updateUrl || !updateUrl.startsWith('http')) {
      e.preventDefault();
      showMaintenancePage(); 
      showPopup('رابط التحميل غير متاح حالياً أو غير صالح');
      return;
    }
    
    isLoading = true;
    lastDownloadTime = now;
    
    if (downloadButton.tagName.toLowerCase() === 'a') {
      downloadButton.setAttribute('href', updateUrl);
      downloadButton.click(); // إطلاق التحميل يدويًا
    } else {
      window.location.href = updateUrl;
    }
    
    setTimeout(() => {
      isLoading = false;
    }, 3000);
  });
}

function showMaintenancePage() {
  document.body.innerHTML = `
    <div class="maintenance-container">
      <h1>الموقع تحت الصيانة</h1>
      <p>نأسف على الإزعاج، الموقع في طور التحديث. يرجى المحاولة لاحقًا.</p>
    </div>
  `
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
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.querySelector('.menu-toggle');
  menuToggle.addEventListener('click', function() {
    document.getElementById('nav').classList.toggle('active');
    this.classList.toggle('active');
  });
});

/**
 * إعدادات التحريك
 * السرعة بوحدة بكسل في الثانية
 */
const animationSettings = {
  speeds: {
    right: 20,
    left: 20
  },
  rows: 2 // عدد صفوف الأغلفة
};

// متغيرات التحكم في التحريك
let animationId = null;
let lastTimestamp = 0;
let coverRows = null;
let isAnimating = false;

// دالة رئيسية لتحميل الأغلفة
async function loadMangaCovers() {
  try {
    // جلب بيانات الأغلفة
    const response = await fetch('assets/data/covers.json');
    if (!response.ok) throw new Error('فشل جلب بيانات الأغلفة');
    const { covers } = await response.json();
    
    // التحقق من وجود العناصر المطلوبة
    coverRows = document.querySelectorAll('.covers-row');
    if (coverRows.length < animationSettings.rows) {
      throw new Error('عدد صفوف الأغلفة غير كاف');
    }
    
    // حساب عدد الأغلفة المطلوبة لكل صف
    const coversPerRow = calculateCoversNeeded(coverRows[0], covers);
    
    // إنشاء وتوزيع الأغلفة
    distributeCovers(coverRows, covers, coversPerRow);
    
    // بدء التحريك والتحميل الكسول
    initLazyLoading();
    startAnimation();
    
  } catch (error) {
    console.error('حدث خطأ أثناء تحميل الأغلفة:', error);
    showPopup('الرجاء اعادة تحميل الصفحة!');
  }
}

// حساب عدد الأغلفة المطلوبة لكل صف
function calculateCoversNeeded(row, covers) {
  // تقدير عرض الغلاف (افتراضي 150 إذا لم يتمكن من الحصول على القيمة الفعلية)
  const estimatedCoverWidth = 150;
  const rowWidth = row.offsetWidth;
  
  // حساب عدد الأغلفة اللازمة لتغطية الصف مرتين
  return Math.ceil((rowWidth * 2) / estimatedCoverWidth) + covers.length;
}

// توزيع الأغلفة على الصفوف
function distributeCovers(rows, covers, coversPerRow) {
  // إنشاء نسخ مكررة من الأغلفة للتغطية الكافية
  const duplicatedCovers = Array.from({ length: Math.ceil(coversPerRow / covers.length) })
    .flatMap(() => [...covers]);
  
  rows.forEach((row, rowIndex) => {
    // مسح المحتوى السابق إذا وجد
    row.innerHTML = '';
    
    duplicatedCovers.forEach((cover, coverIndex) => {
      // إنشاء عنصر الصورة
      const img = document.createElement('img');
      img.className = 'manga-cover';
      img.setAttribute('data-src', cover);
      img.setAttribute('loading', 'lazy');
      
      
      row.appendChild(img);
    });
  });
}

// بدء التحريك
function startAnimation() {
  if (isAnimating) return;
  
  // تعيين المواضع الأولية
  coverRows[0].style.transform = 'translateX(50%)';
  coverRows[1].style.transform = 'translateX(0)';
  
  lastTimestamp = performance.now();
  isAnimating = true;
  animationId = requestAnimationFrame(animateRows);
}

// حلقة التحريك
function animateRows(timestamp) {
  const deltaTime = timestamp - lastTimestamp;
  lastTimestamp = timestamp;
  
  // تحريك كل صف حسب اتجاهه
  animateSingleRow(coverRows[0], -animationSettings.speeds.right, deltaTime);
  animateSingleRow(coverRows[1], animationSettings.speeds.left, deltaTime);
  
  // متابعة التحريك
  animationId = requestAnimationFrame(animateRows);
}

// تحريك صف واحد
function animateSingleRow(row, speed, deltaTime) {
  const currentX = getTranslateX(row);
  const newX = currentX + (speed * deltaTime / 1000);
  const rowWidth = row.scrollWidth / 2;
  
  // تعديل الموضع عند الوصول إلى الحد
  let adjustedX = newX;
  if (speed < 0 && adjustedX < -rowWidth) adjustedX += rowWidth;
  if (speed > 0 && adjustedX > rowWidth) adjustedX -= rowWidth;
  
  row.style.transform = `translateX(${adjustedX}px)`;
}

// الحصول على قيمة translateX
function getTranslateX(element) {
  const style = window.getComputedStyle(element);
  const transform = style.transform || style.webkitTransform;
  
  if (!transform || transform === 'none') return 0;
  
  const matrix = transform.match(/^matrix\((.+)\)$/);
  if (matrix) {
    const values = matrix[1].split(', ');
    return parseFloat(values[4] || 0);
  }
  
  return 0;
}

// التحميل الكسول للصور
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('.covers-row img[data-src]');
  
  if (!('IntersectionObserver' in window)) {
    // Fallback للمتصفحات التي لا تدعم IntersectionObserver
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
    });
    return;
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px',
    threshold: 0.01
  });
  
  lazyImages.forEach(img => observer.observe(img));
}

// إيقاف التحريك
function stopAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
    isAnimating = false;
  }
}

// إدارة أحداث الصفحة
document.addEventListener('DOMContentLoaded', loadMangaCovers);

window.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopAnimation();
  } else {
    startAnimation();
  }
});

window.addEventListener('resize', () => {
  stopAnimation();
  startAnimation();
});

window.addEventListener('beforeunload', stopAnimation);