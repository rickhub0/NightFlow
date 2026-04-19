// This is a simplified version of the popup logic
// In a real extension, you'd use the Supabase JS SDK here as well
// For this demo, we'll simulate fetching from the API

async function fetchTasks() {
  const tasksContainer = document.getElementById('tasks');
  const countSpan = document.getElementById('count');

  try {
    // In production, this would be your hosted APP_URL
    const response = await fetch('https://ais-dev-yu5sdilij6fu5sqq55g43e-621703792573.asia-east1.run.app/api/health');
    const data = await response.json();
    
    // Mocking tasks for the extension demo
    const mockTasks = [
      { title: "Fix UI bugs", priority: "High" },
      { title: "Review PRs", priority: "Medium" }
    ];

    tasksContainer.innerHTML = '';
    countSpan.textContent = `${mockTasks.length} tasks`;

    mockTasks.forEach(task => {
      const div = document.createElement('div');
      div.className = `task-item priority-${task.priority}`;
      div.textContent = task.title;
      tasksContainer.appendChild(div);
    });
  } catch (e) {
    tasksContainer.innerHTML = '<div class="empty">Connect to NightFlow to see tasks</div>';
  }
}

document.getElementById('open-app').addEventListener('click', () => {
  chrome.tabs.create({ url: 'https://ais-dev-yu5sdilij6fu5sqq55g43e-621703792573.asia-east1.run.app' });
});

fetchTasks();
setInterval(fetchTasks, 30000);
