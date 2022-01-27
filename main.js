const USERS_URL = 'src/file/users.json'
//const TASKS_URL = 'src/file/tasks.json'
const TASKS_URL = 'src/file/TESTtasks.json'
const VISIBLE_DAYS = 15

const tasks = []
const users = []

class Task {
    constructor(taskJson) {
        this.id = taskJson.id
        this.subject = taskJson.subject
        this.description = taskJson.description
        this.executor = taskJson.executor
        this.planStartDate = taskJson.planStartDate
        this.planEndDate = taskJson.planEndDate
    }
}

class User {
    constructor(taskJson) {
        this.id = taskJson.id
        this.username = taskJson.username
        this.surname = taskJson.surname
        this.firstName = taskJson.firstName
        this.secondName = taskJson.secondName
    }
}

async function loadUsers(url) {
    const response = await fetch(url)
    const userJsons = await response.json()
    return userJsons.map(userJson => new User(userJson))
}

async function loadTasks(url) {
    const response = await fetch(url)
    const taskJsons = await response.json()
    return taskJsons.map(taskJson => new Task(taskJson))
}

async function initApp() {
    const loadedUsers = await loadUsers(USERS_URL)
    const loadedTasks = await loadTasks(TASKS_URL)
    users.push(...loadedUsers)
    tasks.push(...loadedTasks)

    //console.log(tasks)
    //console.log(users)

    users.forEach(user => {
        userRender(user)
    })

    tasks.forEach(task => {
        taskRender(task)
    })

    findExecutor(tasks, users)
    assignmentTask()
}


function taskRender(task) {
    const taskWrapper = document.getElementById('backlog-list-item')
    const taskElement = document.createElement('li')
    const taskHeader = document.createElement('span')
    const taskDesc = document.createElement('span')

    if (task.executor === null) { /*если не указан исполнитель*/
        taskElement.classList.add('list-item')
        //taskElement.id = task.id
        taskElement.setAttribute('draggable', 'true')

        /*всплывающая подсказка*/
        //taskElement.dataset.tooltip = task.subject +'. Дата начала: ' + task.planStartDate
        taskElement.dataset.tooltip = 'Всплывающая подсказка'

        /*дата*/
        taskElement.dataset.date = task.planStartDate

        /*название задачи*/
        taskHeader.innerHTML = task.subject
        taskHeader.classList.add('source')

        /*описание задачи*/
        taskDesc.innerHTML = `${task.description}, ${task.planStartDate}`
        taskDesc.classList.add('task-description')

        if (task.description === '') {
            taskDesc.innerHTML = `Краткое описание задачи, ${task.planStartDate}`
            //taskDesc.innerHTML = task.planStartDate
        }
    }

    taskWrapper.append(taskElement)
    taskElement.append(taskHeader)
    taskElement.append(taskDesc)
}

function findExecutor(tasks, users) {
    tasks.forEach((task) => {
        if(task.executor !== null) { //если у задачи указан исполнитель
            users.forEach((user) => {
                if (user.id === task.executor) { // если id юзера и задачи совпадают
                    /*закинуть задачу юзеру на нужную дату*/
                    let taskPlace = document.querySelectorAll('.task-place')

                    taskPlace.forEach((cell) => {
                        if ((task.planStartDate === cell.dataset.date) &&(+task.executor === +cell.dataset.userId)) {
                            const taskElement = document.createElement('li')
                            const taskHeader = document.createElement('span')

                            taskElement.classList.add('list-item')
                            taskElement.setAttribute('draggable', 'true')

                            taskHeader.innerHTML = task.subject
                            taskHeader.classList.add('source')

                            cell.append(taskElement)
                            taskElement.append(taskHeader)
                        }
                    })
                }
            })
        }
    })
}

function addUserRow(user) {
    const dates = document.querySelectorAll('.date-item')
    const taskBox = document.getElementById('tasks-box')

    for (let i = 0; i < VISIBLE_DAYS; i++) {
        let cell = document.createElement('ul')
        cell.classList.add('task-place')
        cell.dataset.userId = user.id
        cell.dataset.date = dates[i].dataset.date

        taskBox.append(cell)
    }
}

function userRender(user) {
    const nameList = document.getElementById('name-box')

    const nameItem = document.createElement('div')
    nameItem.classList.add('name-item')
    nameItem.innerHTML = `${user.surname} ${user.firstName}`
    nameItem.dataset.userId = user.id

    nameList.append(nameItem)

    addUserRow(user)
}

function dateRender(startDate) {
    const todayStr = (new Date()).toISOString().split('T')[0]
    const dateList = document.getElementById('date-box')
    const currentDate = new Date(startDate.getTime());

    for (let i = 0; i < VISIBLE_DAYS; i++) {
        const dateItem = document.createElement('div')
        dateItem.classList.add('date-item')
        dateItem.innerText = currentDate.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'}) /*weekday: 'short'*/
        const dateStr = currentDate.toISOString().split('T')[0]
        dateItem.dataset.date = dateStr

        if (dateStr === todayStr) {
            dateItem.classList.add('today')
        }

        dateList.append((dateItem))

        currentDate.setDate(currentDate.getDate() + 1)
    }
}

function assignmentTask() {
    let draggedItem = null

    const tasksItems = document.querySelectorAll('.list-item')
    for (const item of tasksItems) {
        item.addEventListener('dragstart', dragstart)
        item.addEventListener('dragend', dragend)

        function dragstart(event) {
            draggedItem = event.target
            draggedItem.classList.add('active')
            setTimeout(() => draggedItem.classList.add('hide'), 0)
        }

        function dragend(event) {
            draggedItem.classList.remove('active', 'hide')
            draggedItem = null
        }
    }

    const taskPlaces = document.querySelectorAll('.task-place')
    for (const taskPlaceCell of taskPlaces) {
        taskPlaceCell.addEventListener('dragover', dragover) //вызывается когда мы находимся над местом, куда можно поместить элемент
        taskPlaceCell.addEventListener('dragenter', dragenter) //заходим на территорию конкретного taskPlaceCell
        taskPlaceCell.addEventListener('dragleave', dragleave) //перетащили но вышли за территорию
        taskPlaceCell.addEventListener('drop', dragdrop) //отпустили
    }

    const taskNamePlaces = document.querySelectorAll('.name-item')
    for (const taskNamePlacesCell of taskNamePlaces) {
        taskNamePlacesCell.addEventListener('dragover', dragover)
        taskNamePlacesCell.addEventListener('dragenter', dragenter)
        taskNamePlacesCell.addEventListener('dragleave', dragleave)
        taskNamePlacesCell.addEventListener('drop', dragdrop2)
    }

    function dragover(event) {
        event.preventDefault() // чтобы dragdrop работал
    }

    function dragenter(event) {
        if (!draggedItem) {
            return
        }

        event.target.classList.add('hover')
    }

    function dragleave(event) {
        if (!draggedItem) {
            return
        }

        event.target.classList.remove('hover')
    }

    function dragdrop(event) {
        const taskPlace = event.target.closest('.task-place')

        if (!draggedItem || !taskPlace) {
            return
        }

        taskPlace.append(draggedItem)
        taskPlace.classList.remove('hover')
    }

    function dragdrop2(event) {
        const taskPlaceForName = document.querySelector(`.task-place[data-date="${draggedItem.dataset.date}"][data-user-id="${event.target.dataset.userId}"]`)

        if (!taskPlaceForName) {
            event.target.classList.remove('hover')
            return //выйдет, если не нашел "видимой" даты
        }

        taskPlaceForName.append(draggedItem)

        event.target.classList.remove('hover')
    }
}

function pagination() {
    const prev = document.querySelector('.prev')
    const next = document.querySelector('.next')

    prev.addEventListener('click', () => {
        currentPageStartDate.setDate(currentPageStartDate.getDate() - halfVisibleDays)
        renderPage()
    })
    next.addEventListener('click',() => {
        currentPageStartDate.setDate(currentPageStartDate.getDate() + halfVisibleDays)
        renderPage()
    })
}

function renderPage() {
    clearDate()
    clearTaskPlace()

    dateRender(currentPageStartDate)
    users.forEach(user => {
        addUserRow(user)
    })

    findExecutor(tasks, users)

    assignmentTask()
}

function clearDate() {
    const dateItemList = document.querySelectorAll('.date-item')
    for (const dateItem of dateItemList) {
        dateItem.remove()
    }
}

function clearTaskPlace() {
    const taskItemList = document.querySelectorAll('.task-place')
    for (const taskItem of taskItemList) {
        taskItem.remove()
    }
}

const halfVisibleDays = Math.floor(VISIBLE_DAYS / 2)
let currentPageStartDate = new Date()
currentPageStartDate.setDate(currentPageStartDate.getDate() - halfVisibleDays)

dateRender(currentPageStartDate)
pagination()

initApp()
