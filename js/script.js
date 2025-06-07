document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const repeatSelect = document.getElementById('repeatSelect'); // New: get repeat select
    const callToActionBtn = document.querySelector('.hero .call-to-action');

    // Load tasks from localStorage when the page loads
    loadTasks();

    // Event listener for "Add Task" button
    addTaskBtn.addEventListener('click', addTask);

    // Event listener for Enter key on task input
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Event listener for click on task list (delegation for checkbox, edit, delete)
    taskList.addEventListener('click', (e) => {
        if (e.target.type === 'checkbox') {
            toggleTaskCompletion(e.target);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteTask(e.target);
        } else if (e.target.classList.contains('edit-btn')) {
            editTask(e.target);
        }
    });

    // Event listener for Call-to-Action button
    if (callToActionBtn) {
        callToActionBtn.addEventListener('click', () => {
            const todoSection = document.querySelector('.todo-app-section');
            if (todoSection) {
                todoSection.scrollIntoView({ behavior: 'smooth' });
                taskInput.focus(); // Fokuskan input setelah menggulir
            }
        });
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const repeatFrequency = repeatSelect.value; // New: get selected repeat frequency

        if (taskText === '') {
            alert('Tugas tidak boleh kosong!');
            return;
        }

        const taskItem = createTaskElement(taskText, false, repeatFrequency); // Pass repeatFrequency
        taskList.appendChild(taskItem);

        saveTasks();
        taskInput.value = ''; // Clear input field
        repeatSelect.value = 'none'; // Reset repeat dropdown
    }

    function createTaskElement(text, isCompleted = false, repeatFrequency = 'none') {
        const li = document.createElement('li');
        if (isCompleted) {
            li.classList.add('completed');
        }

        let repeatInfoText = '';
        switch (repeatFrequency) {
            case 'daily': repeatInfoText = '(Setiap Hari)'; break;
            case 'weekly': repeatInfoText = '(Setiap Minggu)'; break;
            case 'monthly': repeatInfoText = '(Setiap Bulan)'; break;
            case 'yearly': repeatInfoText = '(Setiap Tahun)'; break;
            case 'always': repeatInfoText = '(Berulang)'; break;
            case 'none':
            default: repeatInfoText = ''; break;
        }

        li.innerHTML = `
            <div class="task-content">
                <input type="checkbox" ${isCompleted ? 'checked' : ''}>
                <div class="task-info">
                    <span class="task-text">${text}</span>
                    ${repeatInfoText ? `<span class="repeat-info">${repeatInfoText}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Hapus</button>
            </div>
        `;
        // Store repeatFrequency on the li element for easier access during save/edit
        li.dataset.repeat = repeatFrequency;
        return li;
    }

    function toggleTaskCompletion(checkbox) {
        const listItem = checkbox.closest('li');
        listItem.classList.toggle('completed');

        // Optional: If a task is completed and is repeating, uncheck it and move to next occurrence logic here
        // For now, we just mark it complete and save.
        // A more advanced system would track completion dates for repeating tasks.

        saveTasks();
    }

    function deleteTask(button) {
        const listItem = button.closest('li');
        listItem.remove();
        saveTasks();
    }

    function editTask(button) {
        const listItem = button.closest('li');
        const taskSpan = listItem.querySelector('.task-text');
        const currentText = taskSpan.textContent;
        const currentRepeat = listItem.dataset.repeat || 'none'; // Get current repeat frequency

        // Prompt for new text
        const newText = prompt('Edit tugas:', currentText);

        if (newText !== null && newText.trim() !== '') {
            taskSpan.textContent = newText.trim();
        }

        // Prompt for new repeat frequency (simple way, can be improved with a custom modal)
        // This is a basic prompt, a better UI would be a temporary dropdown
        const newRepeat = prompt(`Edit frekuensi pengulangan (none, daily, weekly, monthly, yearly, always). Saat ini: ${currentRepeat}`, currentRepeat);

        if (newRepeat !== null && ['none', 'daily', 'weekly', 'monthly', 'yearly', 'always'].includes(newRepeat.toLowerCase())) {
            listItem.dataset.repeat = newRepeat.toLowerCase(); // Update dataset
            const repeatInfoSpan = listItem.querySelector('.repeat-info');
            if (repeatInfoSpan) { // If repeat info exists, update it
                let updatedRepeatInfoText = '';
                switch (newRepeat.toLowerCase()) {
                    case 'daily': updatedRepeatInfoText = '(Setiap Hari)'; break;
                    case 'weekly': updatedRepeatInfoText = '(Setiap Minggu)'; break;
                    case 'monthly': updatedRepeatInfoText = '(Setiap Bulan)'; break;
                    case 'yearly': updatedRepeatInfoText = '(Setiap Tahun)'; break;
                    case 'always': updatedRepeatInfoText = '(Berulang)'; break;
                    case 'none':
                    default: updatedRepeatInfoText = ''; break;
                }
                repeatInfoSpan.textContent = updatedRepeatInfoText;
                if (!updatedRepeatInfoText) { // If no repeat info, remove the span
                    repeatInfoSpan.remove();
                }
            } else if (newRepeat.toLowerCase() !== 'none') { // If no repeat info existed but now it should
                let newRepeatInfoSpan = document.createElement('span');
                newRepeatInfoSpan.classList.add('repeat-info');
                let updatedRepeatInfoText = '';
                switch (newRepeat.toLowerCase()) {
                    case 'daily': updatedRepeatInfoText = '(Setiap Hari)'; break;
                    case 'weekly': updatedRepeatInfoText = '(Setiap Minggu)'; break;
                    case 'monthly': updatedRepeatInfoText = '(Setiap Bulan)'; break;
                    case 'yearly': updatedRepeatInfoText = '(Setiap Tahun)'; break;
                    case 'always': updatedRepeatInfoText = '(Berulang)'; break;
                }
                newRepeatInfoSpan.textContent = updatedRepeatInfoText;
                listItem.querySelector('.task-info').appendChild(newRepeatInfoSpan);
            }
        }
        saveTasks();
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(item => {
            tasks.push({
                text: item.querySelector('.task-text').textContent,
                completed: item.classList.contains('completed'),
                repeat: item.dataset.repeat || 'none' // Save repeat frequency
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks'));
        if (tasks) {
            tasks.forEach(task => {
                const taskItem = createTaskElement(task.text, task.completed, task.repeat); // Pass repeat frequency
                taskList.appendChild(taskItem);
            });
        }
    }
});
