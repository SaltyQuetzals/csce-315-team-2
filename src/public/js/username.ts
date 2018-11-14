const continueButton = document.getElementById('continue-submit');
const usernameInput = document.getElementById('username') as HTMLInputElement;
const usernameError = document.getElementById('username-error');

function toggleError() {
  console.log('You didn\'t enter a username');
}

function continueSubmit(): void {
  if (usernameInput) {
    const username: string = usernameInput.value;
    if (!username || username === '') {
      if (usernameError) usernameError.style.display = 'block';
      return;
    }

    if (usernameError) usernameError.style.display = 'none';

    const urlString: string = window.location.href;
    const url: URL = new URL(urlString);
    const roomId: string|null = url.searchParams.get('roomcode');
    window.location.href = `/rooms/${roomId}?username=${username}`;
  }
}


if (continueButton) {
  continueButton.addEventListener('click', continueSubmit);
}