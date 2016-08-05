var ulist = document.querySelectorAll('.sidebar')[0];
var listContent = [
    {
        id: 'save'
},
    {
        id: 'cut'
},
    {
        id: 'load'
}];
var eleFrame = document.createDocumentFragment();
for (var i = 0; i < listContent.length; i++) {
    var ele = document.createElement('li');
    var link = document.createElement('a');
    var idstr = listContent[i].id;
    ele.setAttribute('id', idstr);
    ele.appendChild(link);
    idstr = idstr.charAt(0).toUpperCase() + idstr.substr(1);
    link.innerHTML = idstr;
    eleFrame.appendChild(ele);
}

ulist.appendChild(eleFrame);
let UIPanel = document.getElementById('uiPanel');
for (let index = 0; index < ulist.childNodes.length; index++) {
    let link = ulist.childNodes[index];
    link.addEventListener('click', () => {

        let idstr = link.getAttribute('id');

        for (let i = 1; i < UIPanel.childNodes.length; i += 2) {
            UIPanel.childNodes[i].style.display = 'none';
        }
        console.log(idstr + 'Panel');
        document.getElementById(idstr + 'Panel').style.display = 'block';
    });
}

function download(link) {
    window.location.href = link;
}
