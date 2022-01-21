const USERS_URL = 'src/file/users.json'
const TASKS_URL = 'src/file/tasks.json'
const VISIBLE_DAYS = 15

const tasks = []
const users = []

class Task {
    constructor(taskJson) {
        this.id = taskJson.id
        this.subject = taskJson.subject
        this.description = taskJson.description
        this.executor = taskJson.executor
        this.creationDate = taskJson.creationDate //потом по этому полю можно отсортировать в бэклоге
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
    const taskWrapper = document.getElementById('ul')

    const taskElement = document.createElement('li')
    taskElement.classList.add('list-item')
    taskElement.id = task.id
    taskElement.setAttribute('draggable', 'true')

    //taskElement.dataset.tooltip = task.subject +'. Дата начала: ' + task.planStartDate
    taskElement.dataset.tooltip = 'Всплывающая подсказка'

    const taskHeader = document.createElement('span')
    taskHeader.innerHTML = task.subject
    taskHeader.classList.add('source')

    const taskDesc = document.createElement('span')
    taskDesc.innerHTML = task.description
    taskDesc.classList.add('task-description')

    if (task.description === '') {
        taskDesc.innerHTML = 'Краткое описание задачи'
    }

    taskWrapper.append(taskElement)
    taskElement.prepend(taskHeader)
    taskElement.append(taskDesc)
}

function findExecutor(tasks, users) {
    console.log(tasks)
    console.log(users)

    tasks.forEach((task) => {
        if(task.executor !== null) {
            console.log(1)
        }
    })
}

function addUserRow(user) {
    const dates = document.querySelectorAll('.date-item')
    const taskBox = document.getElementById('tasks-box')

    for (let i = 0; i < VISIBLE_DAYS; i++) {
        let cell = document.createElement('ul')
        cell.classList.add('task-place')
        //cell.setAttribute('draggable', 'false')
        //cell.innerHTML = `Задача`
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
    const currentDate = startDate

    for (let i = 0; i < VISIBLE_DAYS; i++) {
        const dateItem = document.createElement('div')
        dateItem.classList.add('date-item')
        dateItem.innerText = currentDate.toLocaleDateString('ru-RU', {day: '2-digit', month: '2-digit'})
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
        //console.log(taskPlaceCell)
        taskPlaceCell.addEventListener('dragover', dragover)
        taskPlaceCell.addEventListener('dragenter', dragenter)
        taskPlaceCell.addEventListener('dragleave', dragleave)
        taskPlaceCell.addEventListener('drop', dragdrop)
    }

/*    const taskPlacesName = document.querySelectorAll('.name-item')
    for (const taskPlaceName of taskPlacesName) {
        //console.log(taskPlaceName)
        taskPlaceName.addEventListener('dragover', dragover)
        taskPlaceName.addEventListener('dragenter', dragenter)
        taskPlaceName.addEventListener('dragleave', dragleave)
        taskPlaceName.addEventListener('drop', dragdrop)
    }*/

    function dragover(event) {
        event.preventDefault()
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

/*        const taskPlaceName = event.target.closest('.name-item')

        if (!draggedItem || !taskPlaceName) {
            return
        }

        taskPlaceName.append(draggedItem)
        taskPlaceName.classList.remove('hover')*/
    }
}

function pagination() {
    const prev = document.querySelector('.prev')
    const next = document.querySelector('.next')

    prev.addEventListener('click', function () {
        console.log('клик назад')
    })

    next.addEventListener('click', function () {
        console.log('клик вперед')
    })
}

const halfVisibleDays = Math.floor(VISIBLE_DAYS / 2)
const startDate = new Date()
startDate.setDate(startDate.getDate() - halfVisibleDays)

pagination()
dateRender(startDate)

initApp()
