const changeBackground = btn => {
  let iClass;
  let iElement;
  const emotion = btn.getAttribute("name");
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  // const prodId = btn.parentNode;
  switch(emotion) {
    case 'love':
       iElement = btn.parentNode.querySelector('.fa-heart');
      break;
    case 'angry':
      iElement = btn.parentNode.querySelector('.fa-frown-open');
   
      break;
      case 'like':
        iElement = btn.parentNode.querySelector('.fa-thumbs-up');
        break;

  }
  const i = btn.parentNode.querySelector('[name=_csrf]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;

  const productElement = btn.closest('article');

  fetch('/products/' + emotion + '/' + prodId, {
    method: 'POST',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
     if (iElement.style.color && iElement.style.color !== 'rgb(124, 115, 115)') {
      iElement.style.color = 'rgb(124, 115, 115)';
    }
    else {
      switch(emotion) {
        case 'love':
          iElement.style.color = 'red';
          break;
        case 'angry':
          iElement.style.color = 'black';
       
          break;
          case 'like':
            iElement.style.color = '#4267b2';
            break;
    
      }
    }
    })
    .catch(err => {
      console.log(err);
    });
};

const deleteProduct = btn => {
  const prodId = btn.parentNode.querySelector('[name=productId]').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf]').value;
  const productElement = btn.closest('article');

  fetch('/product/' + prodId, {
    method: 'DELETE',
    headers: {
      'csrf-token': csrf
    }
  })
    .then(result => {
      return result.json();
    })
    .then(data => {
      productElement.parentNode.removeChild(productElement);
    })
    .catch(err => {
      console.log(err);
    });
};
const displayOverlay = btn => {
  const overlay = document.querySelector('.backdrop1')
  overlay.style.display = "block";
};
const closeoverlay = btn => {
  const overlay = document.querySelector('.backdrop1');
  overlay.style.display = "none";
};
const displayImage = btn => {
  const overlay = document.querySelector('.backdrop1');
  overlay.style.display = "block";
};
const displayOverlay2 = btn => {
  const overlay = document.querySelector('.backdrop2');
  overlay.style.display = "block";
};

const closeOverlay2 = btn => {
  const overlay = document.querySelector('.backdrop2');
  overlay.style.display = "none";
};

const changeBg = btn => {
  console.log('Inside changeBg');
  
};
const displayOptions = btn => {
  const menu = document.querySelector('.menu');
  if (btn.textContent == "MENU"){
    menu.style.transform = "translateX(0%)";
  menu.style.display = "block";
  btn.textContent = "CLOSE";
  }else {
    menu.style.transform = "translateX(-200%)";
  btn.textContent = "MENU";
  }
  
};

const closeOptions = btn => {
  btn.classList.remove('show');
};

