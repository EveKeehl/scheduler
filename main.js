const USERS_URL = 'src/file/users.json'
const TASKS_URL = 'src/file/tasks.json'
const VISIBLE_DAYS = 15

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

        this.tasks = []
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
    const users = await loadUsers(USERS_URL)
    const tasks = await loadTasks(TASKS_URL)

    //console.log(tasks)
    //console.log(users)

    users.forEach(user => {
        userRender(user)
    })

    tasks.forEach(task => {
        if (task.executor !== null) {
            const user = users.find(user => user.id === task.executor)
            user.tasks.push(task)
        }

        taskRender(task)
    })

    assignmentTask()
}


function taskRender(task) {
    const taskWrapper = document.getElementById('ul')

    const taskElement = document.createElement('li')
    taskElement.classList.add('list-item')
    taskElement.id = task.id
    taskElement.setAttribute('draggable', true)

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

    taskWrapper.prepend(taskElement)
    taskElement.prepend(taskHeader)
    taskElement.append(taskDesc)
}

function addUserRow(user) {
    const dates = document.querySelectorAll('.date-item')
    const taskBox = document.getElementById('tasks-box')

    for (let i = 0; i < VISIBLE_DAYS; i++) {
        let cell = document.createElement('ul')
        cell.classList.add('task-place')
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
    document.addEventListener('mousedown', function(event) {
        const activeTaskItem = event.target.closest('.list-item')
        const taskPlaces = document.querySelectorAll('.task-place')

        activeTaskItem.addEventListener('dragstart', dragstart)
        activeTaskItem.addEventListener('dragend', dragend)

        for (const taskPlace of taskPlaces) {
            taskPlace.addEventListener('dragover', dragover)
            taskPlace.addEventListener('dragenter', dragenter)
            taskPlace.addEventListener('dragleave', dragleave)
            taskPlace.addEventListener('drop', dragdrop)
        }

        function dragstart(event) {
            event.target.classList.add('active')
            setTimeout(() => event.target.classList.add('hide'), 0)
        }

        function dragend(event) {
            event.target.classList.remove('active', 'hide')
        }

        function dragover(event) {
            event.preventDefault()
        }

        function dragenter(event) {
            event.target.classList.add('hover')
        }

        function dragleave(event) {
            event.target.classList.remove('hover')
        }

        function dragdrop(event) {
            event.target.append(activeTaskItem)
            //console.log(activeTaskItem)
            event.target.classList.remove('hover')
        }
    })
}

function turnPage() {
    const prev = document.querySelector('.prev')
    const next = document.querySelector('.next')

    prev.onclick = function() {
        console.log('клик назад')
        /*пеерерисовка*/
        //startDate.setDate(startDate.getDate() - halfVisibleDays * 2)
        //dateRender(startDate)
    }

    next.onclick = function() {
        console.log('клик вперед')
        /*пеерерисовка*/
        //startDate.setDate(startDate.getDate() - halfVisibleDays * 2)
        //dateRender(startDate)
    }
}

const halfVisibleDays = Math.floor(VISIBLE_DAYS / 2)
const startDate = new Date()
startDate.setDate(startDate.getDate() - halfVisibleDays)

turnPage()
dateRender(startDate)


initApp()

