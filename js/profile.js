import { auth, db, isSessionExpired, clearSession } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

let currentUser = null;
let userInterests = [];

const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userPhoto = document.getElementById('userPhoto');
const profileAvatar = document.getElementById('profileAvatar');
const interestsDisplay = document.getElementById('interestsDisplay');
const editInterestsBtn = document.getElementById('editInterestsBtn');
const editInterestsSection = document.getElementById('editInterestsSection');
const editInterestsGrid = document.getElementById('editInterestsGrid');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const saveInterestsBtn = document.getElementById('saveInterestsBtn');
const logoutBtn = document.getElementById('logoutBtn');
const logoutBtnProfile = document.getElementById('logoutBtnProfile');
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

if (themeToggle) {
  themeToggle.addEventListener('click', toggleTheme);
}

if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener('click', toggleTheme);
}

onAuthStateChanged(auth, async (user) => {
  initTheme();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  if (isSessionExpired()) {
    clearSession();
    await signOut(auth);
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;
  await loadUserProfile();
  await loadAnalytics();
  setupEventListeners();
});

async function loadUserProfile() {
  try {
    const userDocRef = doc(db, 'users', currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      if (userName) userName.textContent = userData.name || 'User';
      if (userEmail) userEmail.textContent = userData.email || '';
      
      if (userData.photoURL && userPhoto) {
        userPhoto.src = userData.photoURL;
        userPhoto.style.display = 'block';
        if (profileAvatar) {
          profileAvatar.textContent = '';
        }
      } else if (profileAvatar && userData.name) {
        profileAvatar.textContent = userData.name.charAt(0).toUpperCase();
      }
      
      userInterests = userData.interests || [];
      renderInterests();
    }
  } catch (error) {
    console.error('Error loading profile:', error);
  }
}

async function loadAnalytics() {
  const totalSavedEl = document.getElementById('totalSaved');
  const thisWeekSavedEl = document.getElementById('thisWeekSaved');
  const mostActiveCategoryEl = document.getElementById('mostActiveCategory');
  const categoryStatsEl = document.getElementById('categoryStats');

  if (!totalSavedEl) return;

  try {
    const savedRef = collection(db, 'savedArticles');
    const q = query(savedRef, where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);

    const articles = snapshot.docs.map(doc => doc.data());
    const totalSaved = articles.length;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekSaved = articles.filter(a => {
      const savedAt = new Date(a.savedAt);
      return savedAt >= oneWeekAgo;
    }).length;

    const categoryCounts = {};
    articles.forEach(article => {
      if (article.categories) {
        article.categories.forEach(cat => {
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });
      }
    });

    let mostActiveCategory = '-';
    let maxCount = 0;
    for (const [cat, count] of Object.entries(categoryCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostActiveCategory = cat;
      }
    }

    totalSavedEl.textContent = totalSaved;
    thisWeekSavedEl.textContent = thisWeekSaved;
    mostActiveCategoryEl.textContent = mostActiveCategory !== '-' ? mostActiveCategory.charAt(0).toUpperCase() + mostActiveCategory.slice(1) : '-';

    if (Object.keys(categoryCounts).length > 0) {
      const categoryLabels = {
        ai: 'AI',
        programming: 'Programming',
        hardware: 'Hardware',
        startups: 'Startups',
        cybersecurity: 'Cybersecurity',
        tech: 'Tech'
      };

      const sortedCategories = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1]);

      categoryStatsEl.innerHTML = sortedCategories.map(([cat, count]) => {
        const percentage = totalSaved > 0 ? Math.round((count / totalSaved) * 100) : 0;
        return `
          <div class="category-stat">
            <span class="category-stat-label">${categoryLabels[cat] || cat}</span>
            <div class="category-stat-bar">
              <div class="category-stat-fill" style="width: ${percentage}%"></div>
            </div>
            <span class="category-stat-count">${count}</span>
          </div>
        `;
      }).join('');
    } else {
      categoryStatsEl.innerHTML = '<p class="empty-analytics">Save some articles to see your reading analytics!</p>';
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    categoryStatsEl.innerHTML = '<p class="empty-analytics">Unable to load analytics</p>';
  }
}

function renderInterests() {
  if (!interestsDisplay) return;
  
  if (userInterests.length === 0) {
    interestsDisplay.innerHTML = '<span class="interest-tag">No interests selected</span>';
    return;
  }
  
  const interestLabels = {
    ai: 'AI',
    programming: 'Programming',
    hardware: 'Hardware',
    startups: 'Startups',
    cybersecurity: 'Cybersecurity'
  };
  
  interestsDisplay.innerHTML = userInterests.map(interest => 
    `<span class="interest-tag">${interestLabels[interest] || interest}</span>`
  ).join('');
}

function setupEventListeners() {
  if (editInterestsBtn) {
    editInterestsBtn.addEventListener('click', openEditInterests);
  }
  
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditInterests);
  }
  
  if (saveInterestsBtn) {
    saveInterestsBtn.addEventListener('click', saveInterests);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (logoutBtnProfile) {
    logoutBtnProfile.addEventListener('click', handleLogout);
  }
  
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', handleLogout);
  }
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
      mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
      mobileNav.classList.toggle('active');
    });
  }
}

function openEditInterests() {
  if (!editInterestsSection || !editInterestsGrid) return;
  
  const checkboxes = editInterestsGrid.querySelectorAll('input[name="editInterests"]');
  checkboxes.forEach(checkbox => {
    checkbox.checked = userInterests.includes(checkbox.value);
  });
  
  editInterestsSection.style.display = 'block';
  editInterestsBtn.style.display = 'none';
}

function closeEditInterests() {
  if (!editInterestsSection || !editInterestsBtn) return;
  
  editInterestsSection.style.display = 'none';
  editInterestsBtn.style.display = 'block';
}

async function saveInterests() {
  const checkboxes = editInterestsGrid.querySelectorAll('input[name="editInterests"]');
  const selectedInterests = Array.from(checkboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);
  
  saveInterestsBtn.disabled = true;
  saveInterestsBtn.textContent = 'Saving...';
  
  try {
    await setDoc(doc(db, 'users', currentUser.uid), {
      name: currentUser.displayName,
      email: currentUser.email,
      photoURL: currentUser.photoURL,
      interests: selectedInterests,
      createdAt: new Date().toISOString()
    }, { merge: true });
    
    userInterests = selectedInterests;
    renderInterests();
    closeEditInterests();
    showToast('Interests updated!');
  } catch (error) {
    console.error('Error saving interests:', error);
    showToast('Failed to update interests', 'error');
  } finally {
    saveInterestsBtn.disabled = false;
    saveInterestsBtn.textContent = 'Save Changes';
  }
}

async function handleLogout() {
  try {
    clearSession();
    await signOut(auth);
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Failed to logout', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.querySelector('.toast-message').textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
