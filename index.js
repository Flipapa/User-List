const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const USERS_BY_PAGE = 32;

const userPanel = document.querySelector("#user-panel");
const targetPanel = document.querySelector("#target-panel");
const clearPanel = document.querySelector("#clear-panel");
const searchInput = document.querySelector("#search-input");
const paginetor = document.querySelector("#paginetor");
const modalEditTarget = document.querySelector("#user-modal-edit");
const modalStatus = document.querySelector("#user-modal-status");

const userList = [];
const targetList = JSON.parse(localStorage.getItem("targetUsers")) || [];
const clearList = JSON.parse(localStorage.getItem("clearUsers")) || [];
let selectedList = [];
let filteredList = [];

// Refresh List
function renderSelectedList() {
  selectedList = targetList.concat(clearList);
}

// Display Card Status
function displayCardStatus() {
  const allCards = userPanel.getElementsByClassName("card");
  for (let card of allCards) {
    if (clearList.some((user) => Number(card.dataset.id) === Number(user.id))) {
      card.classList.add("clear");
      // card.setAttribute("data-toggle", "modal disable");
    } else {
      card.classList.remove("clear");
      // card.setAttribute("data-toggle", "modal");
    }
  }

  for (let card of allCards) {
    if (
      targetList.some((user) => Number(card.dataset.id) === Number(user.id))
    ) {
      card.classList.add("bg-danger");
      card.classList.add("text-white");
    } else {
      card.classList.remove("bg-danger");
      card.classList.remove("text-white");
    }
  }
}

// User List
function renderUserList(data) {
  let userHTML = "";

  data.forEach((item) => {
    userHTML += `
      <div class="card m-1 text-center" id="user-info" style="width: 9rem;" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">
      <img class="card-img-top" src="${item.avatar}" alt="Card image cap" data-id="${item.id}">
      <div class="card-body py-2" data-id="${item.id}">
        <h6 class="card-title m-0" data-id="${item.id}">${item.name}</h6>
      </div>
    </div>
    `;
  });
  userPanel.innerHTML = userHTML;
}

axios.get(INDEX_URL).then((response) => {
  // console.log(response.data.results);
  userList.push(...response.data.results);
  renderPaginetor(userList.length);
  renderUserList(getUsersByPage(1));
  renderTargetList(targetPanel, targetList);
  renderTargetList(clearPanel, clearList);
  displayCardStatus();
  renderSelectedList();
});

// Page
function renderPaginetor(amount) {
  const numberOfPages = Math.ceil(amount / USERS_BY_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `;
  }
  paginetor.innerHTML = rawHTML;
}

function getUsersByPage(page) {
  const data = filteredList.length ? filteredList : userList;
  const startIndex = (page - 1) * USERS_BY_PAGE;
  return data.slice(startIndex, startIndex + USERS_BY_PAGE);
}

paginetor.addEventListener("click", function onPaginetorClicked(event) {
  if (event.target.tagName !== "A") return;
  const page = Number(event.target.dataset.page);

  renderUserList(getUsersByPage(page));
});

// Target List

function renderTargetList(panel, data) {
  let rawHTML = "";

  data.forEach((item) => {
    rawHTML += `
      <li class = "list-group-item d-flex justify-content-between align-items-center">
          <span>
            <img src="${item.avatar}" class="img-list" style="max-height:70px">
          </span>
          <span><h6>${item.name}</h6></span>
          <span>
            <button class="btn btn-secondary btn-target-info justify-content-center align-items-center" data-toggle="modal" data-target="#user-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-target-clear justify-content-center align-items-center" data-id="${item.id}">Clear</button>
            <button class="btn btn-danger btn-remove-target justify-content-center align-items-center" data-id="${item.id}">X</button>
          </span>
      </li>
    `;
  });
  panel.innerHTML = rawHTML;
}

// Target

function setTargetColor() {
  modalEditTarget.classList.remove("btn-secondary");
  modalEditTarget.classList.add("btn-danger");
  modalStatus.innerHTML = `<em class="text-danger font-weight-bolder style="font-size: 18px"><i class="fas fa-circle"></i> Status: On Target!</em>`;
}

function removeTargetColor() {
  modalEditTarget.classList.remove("btn-danger");
  modalEditTarget.classList.add("btn-secondary");
  modalStatus.innerHTML = `<em class="text-success font-weight-bolder" style="font-size: 18px"><i class="fas fa-circle"></i> Status: Free!</em>`;
}

function editToTarget(id) {
  const target = userList.find((user) => user.id === id);

  if (targetList.some((user) => user.id === id)) {
    // return alert('此使用者已在收藏目標清單中！')
    removeTargetColor();
    removeFromTarget(id);
    return;
  } else if (clearList.some((user) => user.id === id)) {
    removeTargetColor();
    removeFromClear(id);
    return;
  } else {
    setTargetColor();
  }

  targetList.push(target);

  localStorage.setItem("targetUsers", JSON.stringify(targetList));
  renderTargetList(targetPanel, targetList);
}

function removeFromTarget(id) {
  if (!targetList) return;

  const targetIndex = targetList.findIndex((target) => target.id === id);
  if (targetIndex === -1) return;

  targetList.splice(targetIndex, 1);

  localStorage.setItem("targetUsers", JSON.stringify(targetList));
  renderTargetList(targetPanel, targetList);
}

modalEditTarget.addEventListener("click", function onAddClicked(event) {
  editToTarget(Number(event.target.dataset.id));
  displayCardStatus();
  renderSelectedList();
});

targetPanel.addEventListener("click", function onTargetClicked(event) {
  let target = Number(event.target.dataset.id);
  if (event.target.matches(".btn-remove-target")) {
    removeFromTarget(target);
  } else if (event.target.matches(".btn-target-info")) {
    showUserModal(target);
  } else if (event.target.matches(".btn-target-clear")) {
    addClearList(target);
  }
  displayCardStatus();
  renderSelectedList();
});

// Clear

function addClearList(id) {
  const target = targetList.find((user) => user.id === id);
  clearList.push(target);
  localStorage.setItem("clearUsers", JSON.stringify(clearList));
  renderTargetList(clearPanel, clearList);
  removeFromTarget(id);
}

function removeFromClear(id) {
  if (!clearList) return;
  const clearIndex = clearList.findIndex((clear) => clear.id === id);
  if (clearIndex === -1) return;

  clearList.splice(clearIndex, 1);
  localStorage.setItem("clearUsers", JSON.stringify(clearList));
  renderTargetList(clearPanel, clearList);
}

function backToTarget(id) {
  const target = clearList.find((user) => user.id === id);
  targetList.push(target);
  localStorage.setItem("targetUsers", JSON.stringify(targetList));
  renderTargetList(targetPanel, targetList);
  removeFromClear(id);
}

clearPanel.addEventListener("click", function onClearClicked(event) {
  let target = Number(event.target.dataset.id);
  if (event.target.matches(".btn-remove-target")) {
    removeFromClear(target);
  } else if (event.target.matches(".btn-target-info")) {
    showUserModal(target);
  } else if (event.target.matches(".btn-target-clear")) {
    backToTarget(target);
  }
  displayCardStatus();
  renderSelectedList();
});

// Search

searchInput.addEventListener("input", function onSearchUser() {
  let keyword = searchInput.value.trim().toLowerCase();

  filteredList = userList.filter((user) =>
    user.name.toLowerCase().includes(keyword)
  );

  if (keyword.length === 0) {
    renderUserList(getUsersByPage(1));
    renderPaginetor(userList.length);
    displayCardStatus();
    return;
  } else if (filteredList.length === 0) {
    userPanel.innerHTML = `
      <h1>Got Nothing!</h1>
    `;
    renderPaginetor(0);
    return;
  }

  renderPaginetor(filteredList.length);
  renderUserList(getUsersByPage(1));
  displayCardStatus();
});

// UserModal

function showUserModal(id) {
  const modalImage = document.querySelector("#user-modal-image");
  const modalName = document.querySelector("#user-modal-name");
  const modalSurname = document.querySelector("#user-modal-surname");
  const modalDescription = document.querySelector("#user-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalName.textContent = data.name;
    modalSurname.textContent = "surname: " + data.surname;
    modalDescription.innerHTML = `
      <li>E-mail: ${data.email}</li>
      <li>Gender: ${data.gender}</li>
      <li>Age: ${data.age}</li>
      <li>Region: ${data.region}</li>
      <li>Birthday: ${data.birthday}</li>
    `;
    modalImage.innerHTML = `
      <img src="${data.avatar}" alt="user-image" class="img-fluid h-100 rounded-circle">
    `;
    modalEditTarget.setAttribute("data-id", data.id);
    modalEditTarget.firstElementChild.setAttribute("data-id", data.id);
    if (selectedList.some((user) => user.id === id)) {
      setTargetColor();
      if (clearList.some((user) => user.id === id)) {
        modalStatus.innerHTML = `<em class="text-muted font-weight-light style="font-size: 18px"><i class="fas fa-circle"></i> Status: Target Clear!</em>`;
        modalEditTarget.style.display = "none";
      } else {
        modalEditTarget.style.display = "inline-block";
      }
    } else {
      removeTargetColor();
    }
  });
}

userPanel.addEventListener("click", function onUserClicked(event) {
  // console.log(event.target.dataset);
  showUserModal(Number(event.target.dataset.id));
});
