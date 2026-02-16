import { auth, db, isSessionExpired, clearSession } from './firebase-config.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { doc, collection, query, where, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

let currentUser = null;
let savedArticles = [];

const savedGrid = document.getElementById('savedGrid');
const emptyState = document.getElementById('emptyState');
const logoutBtn = document.getElementById('logoutBtn');
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
  await loadSavedArticles();
  setupEventListeners();
});

async function loadSavedArticles() {
  if (!savedGrid) return;
  
  savedGrid.innerHTML = `
    <div class="loading">
      <div class="spinner"></div>
      <p>Loading saved articles...</p>
    </div>
  `;
  
  try {
    const savedRef = collection(db, 'savedArticles');
    const q = query(savedRef, where('userId', '==', currentUser.uid));
    const snapshot = await getDocs(q);
    
    savedArticles = [];
    snapshot.forEach(doc => {
      savedArticles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    savedArticles.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    
    renderSavedArticles();
  } catch (error) {
    console.error('Error loading saved articles:', error);
    savedGrid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h2>Failed to load saved articles</h2>
        <p>Please check your connection and try again</p>
      </div>
    `;
  }
}

function renderSavedArticles() {
  if (!savedGrid || !emptyState) return;
  
  if (savedArticles.length === 0) {
    savedGrid.style.display = 'none';
    emptyState.style.display = 'flex';
    return;
  }
  
  savedGrid.style.display = 'grid';
  emptyState.style.display = 'none';
  
  savedGrid.innerHTML = savedArticles.map(article => createSavedCard(article)).join('');
}

function createSavedCard(article) {
  const formattedDate = formatDate(new Date(article.savedAt));
  const thumbnailHtml = article.image 
    ? `<img src="${escapeHtml(article.image)}" alt="${escapeHtml(article.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'placeholder\\'><svg viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'M21 15l-5-5L5 21\\'/></svg></div>'">`
    : `<div class="placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg></div>`;
  
  return `
    <article class="article-card">
      <div class="card-image">
        ${thumbnailHtml}
        <span class="card-source">${escapeHtml(article.source)}</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">${escapeHtml(article.title)}</h3>
        <p class="card-excerpt">Saved on ${formattedDate}</p>
        <div class="card-meta">
          <span class="card-date">${formattedDate}</span>
          <div class="card-actions">
            <button class="action-btn saved" data-id="${article.id}" data-link="${escapeHtml(article.link)}" title="Remove from saved">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
              </svg>
            </button>
            <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener noreferrer" class="action-btn read-more" title="Read more">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

function setupEventListeners() {
  if (savedGrid) {
    savedGrid.addEventListener('click', async (e) => {
      const deleteBtn = e.target.closest('.action-btn.saved');
      if (deleteBtn) {
        await removeSavedArticle(deleteBtn.dataset.id, deleteBtn.dataset.link);
      }
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', handleLogout);
  }
  
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('active');
    });
  }
}

async function removeSavedArticle(articleId, link) {
  try {
    await deleteDoc(doc(db, 'savedArticles', articleId));
    
    savedArticles = savedArticles.filter(a => a.id !== articleId);
    
    const btn = document.querySelector(`[data-id="${articleId}"]`);
    if (btn) {
      const card = btn.closest('.article-card');
      if (card) {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
          renderSavedArticles();
          showToast('Article removed from saved');
        }, 200);
      }
    }
  } catch (error) {
    console.error('Error removing article:', error);
    showToast('Failed to remove article', 'error');
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
