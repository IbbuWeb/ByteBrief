import { auth, db, recordLoginTime } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js';
import { setDoc, getDoc, doc } from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

const continueBtn = document.getElementById('continueBtn');
const interestCheckboxes = document.querySelectorAll('input[name="interests"]');

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  currentUser = user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    window.location.href = 'index.html';
    return;
  }
});

interestCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', updateContinueButton);
});

function updateContinueButton() {
  const checked = document.querySelectorAll('input[name="interests"]:checked');
  continueBtn.disabled = checked.length === 0;
}

if (continueBtn) {
  continueBtn.addEventListener('click', async () => {
    const selectedInterests = Array.from(document.querySelectorAll('input[name="interests"]:checked'))
      .map(cb => cb.value);

    continueBtn.disabled = true;
    continueBtn.textContent = 'Saving...';

    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        name: currentUser.displayName,
        email: currentUser.email,
        photoURL: currentUser.photoURL,
        interests: selectedInterests,
        createdAt: new Date().toISOString()
      });

      recordLoginTime();
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error saving interests:', error);
      showToast('Failed to save interests. Please try again.', 'error');
      continueBtn.disabled = false;
      continueBtn.textContent = 'Continue to Feed';
    }
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) {
    alert(message);
    return;
  }
  toast.querySelector('.toast-message').textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}
