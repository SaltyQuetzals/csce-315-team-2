export function getAccessCode(): string {
    const pathName = window.location.pathname;
    const splitPathName = pathName.split('/');
    return splitPathName[2];
}

export function updateAccessCodeBox(): void{
    const accessCodeBox = document.getElementById('accessCode');
    const accessCode = getAccessCode();
    if (accessCodeBox) accessCodeBox.innerHTML = accessCode;
}

export function updatePlayerList(players: {}): void{
    let playerList = document.getElementById('player-list');
    const newPlayerList = Object.keys(players).map((player) => {return '<li>'+player+'</li>'});
    if (playerList) playerList.innerHTML = newPlayerList.join('');
}