function getAccessCode(): string {
    const pathName = window.location.pathname;
    const splitPathName = pathName.split('/');
    return splitPathName[2];
}

function updateAccessCodeBox(): void{
    const accessCodeBox = document.getElementById('accessCode');
    const accessCode = getAccessCode();
    if (accessCodeBox) accessCodeBox.innerHTML = accessCode;
}

window.onload = () => {
    updateAccessCodeBox();
}