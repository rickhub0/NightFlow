chrome.runtime.onInstalled.addListener(() => {
  console.log('NightFlow Extension Installed');
  
  // Create an alarm for periodic sync
  chrome.alarms.create('sync-tasks', { periodInMinutes: 5 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'sync-tasks') {
    checkReminders();
  }
});

async function checkReminders() {
  // Logic to check for upcoming tasks and send notifications
  // chrome.notifications.create({
  //   type: 'basic',
  //   iconUrl: 'icon.png',
  //   title: 'NightFlow Reminder',
  //   message: 'You have a task due soon!',
  //   priority: 2
  // });
}
