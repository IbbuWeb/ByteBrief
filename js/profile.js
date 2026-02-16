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

onAuthStateChanged(auth, async (user) => {
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
