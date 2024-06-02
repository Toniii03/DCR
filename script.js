document.addEventListener('DOMContentLoaded', loadProjects); 

function addProject() {
    const projectName = document.getElementById('projectName').value.trim();
    if (projectName) {
        const projectList = document.getElementById('projectList');
        let projectExists = false;
        
        for (let i = 0; i < projectList.options.length; i++) {
            if (projectList.options[i].value === projectName) {
                projectExists = true;
                break;
            }
        }

        if (projectExists) {
            alert('El proyecto ya existe.');
        } else {
            const option = document.createElement('option');
            option.text = projectName;
            option.value = projectName;
            projectList.add(option);
            saveProjects();
            document.getElementById('projectName').value = '';
        }
    } else {
        alert('Por favor, ingrese un nombre de proyecto.');
    }
}

function removeSelectedProject() {
    const projectList = document.getElementById('projectList');
    const selectedProject = projectList.value;
    
    if (selectedProject) {
        const confirmation = confirm(`¿Está seguro de que desea eliminar el proyecto "${selectedProject}"?`);
        if (confirmation) {
            for (let i = 0; i < projectList.options.length; i++) {
                if (projectList.options[i].value === selectedProject) {
                    projectList.remove(i);
                    break;
                }
            }

            const assignedProjects = document.getElementById('assignedProjects');
            const existingItems = assignedProjects.getElementsByTagName('li');
            for (let i = 0; i < existingItems.length; i++) {
                const item = existingItems[i];
                const [projectName] = item.textContent.split(' -- ');
                if (projectName === selectedProject) {
                    assignedProjects.removeChild(item);
                    i--;
                }
            }

            saveProjects();
        }
    } else {
        alert('Por favor, seleccione un proyecto para eliminar.');
    }
}

function assignNumber() {
    const projectList = document.getElementById('projectList');
    const selectedProject = projectList.value;
    let projectNumber = document.getElementById('projectNumber').value.trim();
    
    if (selectedProject && projectNumber) {

        if (!/^\d+(\.\d{1,2})?$/.test(projectNumber)) {
            alert('Por favor, ingrese un número válido. Los minutos no pueden exceder 59.');
            return;
        }


        let [hours, minutes] = projectNumber.split('.').map(Number);
        minutes = minutes || 0; 
        if (minutes >= 60) {
            alert('Los minutos no pueden ser 60 o más.');
            return;
        }


        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;

        const assignedProjects = document.getElementById('assignedProjects');
        const existingItems = assignedProjects.getElementsByTagName('li');
        let projectFound = false;

        for (let i = 0; i < existingItems.length; i++) {
            const item = existingItems[i];
            const [projectName, projectValue] = item.textContent.split(' -- ');

            if (projectName === selectedProject) {
                let [existingHours, existingMinutes] = projectValue.replace(' H, ', '.').replace(' Min', '').split('.').map(Number);
                existingMinutes = existingMinutes || 0; 


                let totalHours = existingHours + hours;
                let totalMinutes = existingMinutes + minutes;

                totalHours += Math.floor(totalMinutes / 60);
                totalMinutes = totalMinutes % 60;

                const newValue = `${totalHours} H, ${totalMinutes} Min`;
                item.textContent = `${selectedProject} -- ${newValue}`;
                projectFound = true;
                break;
            }
        }

        if (!projectFound) {
            const listItem = document.createElement('li');
            listItem.textContent = `${selectedProject} -- ${hours} H, ${minutes} Min`;
            assignedProjects.appendChild(listItem);
        }

        saveProjects();
        document.getElementById('projectNumber').value = '';
        projectList.selectedIndex = 0;
    } else {
        alert('Por favor, seleccione un proyecto y asigne un número.');
    }
}

function saveProjects() {
    const projectList = document.getElementById('projectList');
    const assignedProjects = document.getElementById('assignedProjects');

    const projects = [];
    for (let i = 0; i < projectList.options.length; i++) {
        if (projectList.options[i].value) { 
            projects.push(projectList.options[i].value);
        }
    }

    const assignments = [];
    const existingItems = assignedProjects.getElementsByTagName('li');
    for (let i = 0; i < existingItems.length; i++) {
        assignments.push(existingItems[i].textContent);
    }

    localStorage.setItem('projects', JSON.stringify(projects));
    localStorage.setItem('assignments', JSON.stringify(assignments));
}

function loadProjects() {
    const projectList = document.getElementById('projectList');
    const assignedProjects = document.getElementById('assignedProjects');

    // Clear existing options and assignments
    projectList.innerHTML = '';
    assignedProjects.innerHTML = '';

    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];

    const defaultOption = document.createElement('option');
    defaultOption.text = "Seleccione un proyecto";
    defaultOption.value = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    projectList.add(defaultOption);

    projects.forEach(project => {
        const option = document.createElement('option');
        option.text = project;
        option.value = project;
        projectList.add(option);
    });

    assignments.forEach(assignment => {
        const listItem = document.createElement('li');
        listItem.textContent = assignment;
        assignedProjects.appendChild(listItem);
    });
}

function clearLocalStorage() {
    const confirmation = confirm("¿Está seguro de que desea eliminar todos los proyectos guardados?");
    if (confirmation) {
        localStorage.clear();

        document.getElementById('projectList').innerHTML = '<option value="" disabled selected>Seleccione un proyecto</option>';
        document.getElementById('assignedProjects').innerHTML = '';

        alert("Todos los proyectos guardados han sido eliminados.");
    }
}

function exportProjects() {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];

    if (projects.length === 0) {
        alert('No hay proyectos guardados para exportar.');
        return;
    }

    let csvContent = "Nombre del Proyecto,Horas Asignadas\n";

    projects.forEach(project => {
        let assignedHours = "0 H";
        for (let i = 0; i < assignments.length; i++) {
            const [assignedProject, hours] = assignments[i].split(' -- ');
            if (assignedProject === project) {
                assignedHours = hours;
                break;
            }
        }
        csvContent += `${project},${assignedHours}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "proyectos_guardados.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert('Lo siento, tu navegador no es compatible con la exportación de archivos.');
    }
}
