window.onload = () => {
  const createGameButton = document.getElementById('create-game');
  const createGameForm = document.getElementById('create-form');
  const joinGameButton = document.getElementById('join-game');
  const joinGameForm = document.getElementById('join-form');
  const joinSubmitButton = document.getElementById('join-submit');
  const accessCodeForm = document.getElementById('access-code');
  const backButtons = document.getElementsByClassName('back-button');
  const usernameInput = document.getElementById('username');
  const usernameError = document.getElementById('username-error');
  const roomCodeError = document.getElementById('roomcode-error');

  function reset(this: HTMLElement, event: Event) {
    if (event) {
      event.preventDefault();
    }
    // if (createGameButton) {
    //   createGameButton.style.display = 'inline-block';
    // }
    if (createGameForm) {
      createGameForm.style.display = 'none';
    }
    // if (joinGameButton) {
    //   joinGameButton.style.display = 'inline-block';
    // }
    if (joinGameForm) {
      joinGameForm.style.display = 'inline-block';
    }
  }

  for (const button of Array.from(backButtons)) {
    if (button) {
      button.addEventListener('click', reset);
    }
  }

  function toggleVisibility(
      thisForm: HTMLElement|null, thisButton: HTMLElement|null,
      otherButton: HTMLElement|null, otherForm: HTMLElement|null): void {
    if (thisForm && thisButton && otherButton && otherForm) {
      thisForm.style.display = 'flex';
      thisButton.style.display = 'none';
      otherButton.style.display = 'none';
      otherForm.style.display = 'none';
    }
  }
  function toggle(el: HTMLElement|null): void {
    if (el) {
      if (el.style.display === 'none') {
        el.style.display = 'block';
      } else {
        el.style.display = 'none';
      }
    }
  }

  if (createGameButton) {
    createGameButton.addEventListener('click', (event) => {
      event.preventDefault();
      // toggleVisibility(
      //     createGameForm, createGameButton, joinGameButton, joinGameForm);
      toggle(createGameForm);
      toggle(joinGameForm);
    });
  }

  if (joinGameButton) {
    joinGameButton.addEventListener('click', event => {
      event.preventDefault();
      toggleVisibility(
          joinGameForm, joinGameButton, createGameButton, createGameForm);
    });
  }

  if (joinSubmitButton && accessCodeForm) {
    joinSubmitButton.addEventListener('click', event => {
      event.preventDefault();
      const username = (usernameInput as HTMLInputElement).value;
      const roomCode = (accessCodeForm as HTMLInputElement).value;

      if (usernameError) usernameError.style.display = 'none';
      if (roomCodeError) roomCodeError.style.display = 'none';


      if (!roomCode || roomCode === '') {
        if (roomCodeError) roomCodeError.style.display = 'block';
        return;
      }
      if (!username || username === '') {
        if (usernameError) usernameError.style.display = 'block';
        return;
      }
      window.location.replace(`/rooms/${
          (accessCodeForm as HTMLInputElement).value}?username=${username}`);
    });
  }
};